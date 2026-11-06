<?php
/**
 * Sowards Consulting App API
 * ==========================
 * Lets the Sowards Consulting app (app.sowardsconsulting.com / tlsowards.github.io) sign a student in
 * with their existing site account and check their Case Law Update subscription, enrolled courses,
 * progress, and certificates.
 *
 * Install: WPCode, Add Snippet, PHP Snippet, paste everything below this comment, Auto Insert,
 * Run Everywhere, Activate. Do NOT include a second <?php tag when pasting.
 *
 * Then set the two constants in the CONFIG block:
 *   SOWARDS_APP_MEMBERSHIP_ID  the post ID of the LifterLMS membership that carries the
 *                              "Case Law Update" subscription (Memberships, hover the title, note the ID)
 *   SOWARDS_APP_ORIGINS        the origins the app is served from
 *
 * Endpoints (all JSON):
 *   POST /wp-json/sowards/v1/app-login   { username, password }   -> { token, user, subscription, courses }
 *   GET  /wp-json/sowards/v1/app-me      header X-Sowards-Token  -> { user, subscription, courses }
 *   POST /wp-json/sowards/v1/app-logout  header X-Sowards-Token  -> { ok: true }
 *
 * The token is a random 48-byte value. Only its SHA-256 hash is stored, in user meta, with a 90-day
 * expiry. The app sends it in the X-Sowards-Token header, which is not stripped by hosts that drop
 * the Authorization header. Login attempts are rate limited per IP.
 */

// ---------------------------------------------------------------- CONFIG
if ( ! defined( 'SOWARDS_APP_MEMBERSHIP_ID' ) ) {
	define( 'SOWARDS_APP_MEMBERSHIP_ID', 0 ); // set after the membership is created
}
if ( ! defined( 'SOWARDS_APP_ORIGINS' ) ) {
	define( 'SOWARDS_APP_ORIGINS', 'https://app.sowardsconsulting.com,https://tlsowards.github.io,http://localhost:4173,http://localhost:5173' );
}
if ( ! defined( 'SOWARDS_APP_TOKEN_DAYS' ) ) {
	define( 'SOWARDS_APP_TOKEN_DAYS', 90 );
}
// ------------------------------------------------------------------------

add_action( 'rest_api_init', function () {
	register_rest_route( 'sowards/v1', '/app-login', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => 'sowards_app_login',
	) );
	register_rest_route( 'sowards/v1', '/app-me', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => 'sowards_app_me',
	) );
	register_rest_route( 'sowards/v1', '/app-logout', array(
		'methods'             => 'POST',
		'permission_callback' => '__return_true',
		'callback'            => 'sowards_app_logout',
	) );
} );

/** CORS for the app origins only, on the sowards/v1/app-* routes only. */
add_filter( 'rest_pre_serve_request', function ( $served, $result, $request ) {
	if ( strpos( $request->get_route(), '/sowards/v1/app-' ) !== 0 ) {
		return $served;
	}
	$origin  = isset( $_SERVER['HTTP_ORIGIN'] ) ? esc_url_raw( $_SERVER['HTTP_ORIGIN'] ) : '';
	$allowed = array_map( 'trim', explode( ',', SOWARDS_APP_ORIGINS ) );
	if ( $origin && in_array( $origin, $allowed, true ) ) {
		header( 'Access-Control-Allow-Origin: ' . $origin );
		header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
		header( 'Access-Control-Allow-Headers: Content-Type, X-Sowards-Token' );
		header( 'Access-Control-Max-Age: 600' );
		header( 'Vary: Origin' );
	}
	return $served;
}, 10, 3 );

function sowards_app_rate_limited() {
	$ip  = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( $_SERVER['REMOTE_ADDR'] ) : 'unknown';
	$key = 'sowards_app_login_' . md5( $ip );
	$n   = (int) get_transient( $key );
	if ( $n >= 10 ) {
		return true;
	}
	set_transient( $key, $n + 1, 15 * MINUTE_IN_SECONDS );
	return false;
}

function sowards_app_login( WP_REST_Request $req ) {
	if ( sowards_app_rate_limited() ) {
		return new WP_Error( 'too_many_attempts', 'Too many sign-in attempts. Try again in 15 minutes.', array( 'status' => 429 ) );
	}
	$username = sanitize_text_field( (string) $req->get_param( 'username' ) );
	$password = (string) $req->get_param( 'password' );
	if ( '' === $username || '' === $password ) {
		return new WP_Error( 'missing_fields', 'Username and password are required.', array( 'status' => 400 ) );
	}
	// Accept the site password or an application password.
	$user = wp_authenticate( $username, $password );
	if ( is_wp_error( $user ) ) {
		$by   = is_email( $username ) ? get_user_by( 'email', $username ) : get_user_by( 'login', $username );
		$user = $by ? wp_authenticate_application_password( null, $by->user_login, $password ) : null;
		if ( ! $user || is_wp_error( $user ) ) {
			return new WP_Error( 'invalid_login', 'That username or password did not match.', array( 'status' => 401 ) );
		}
	}
	$raw  = bin2hex( random_bytes( 48 ) );
	$hash = hash( 'sha256', $raw );
	$tokens = get_user_meta( $user->ID, '_sowards_app_tokens', true );
	if ( ! is_array( $tokens ) ) {
		$tokens = array();
	}
	$now = time();
	foreach ( $tokens as $h => $exp ) {
		if ( $exp < $now ) {
			unset( $tokens[ $h ] );
		}
	}
	$tokens[ $hash ] = $now + SOWARDS_APP_TOKEN_DAYS * DAY_IN_SECONDS;
	update_user_meta( $user->ID, '_sowards_app_tokens', $tokens );

	return rest_ensure_response( array_merge( array( 'token' => $raw ), sowards_app_payload( $user ) ) );
}

function sowards_app_user_from_token( WP_REST_Request $req ) {
	$raw = $req->get_header( 'x-sowards-token' );
	if ( ! $raw || ! preg_match( '/^[a-f0-9]{96}$/', $raw ) ) {
		return null;
	}
	$hash  = hash( 'sha256', $raw );
	$users = get_users( array(
		'meta_key'     => '_sowards_app_tokens',
		'meta_compare' => 'EXISTS',
		'number'       => 2000,
		'fields'       => 'ID',
	) );
	foreach ( $users as $uid ) {
		$tokens = get_user_meta( $uid, '_sowards_app_tokens', true );
		if ( is_array( $tokens ) && isset( $tokens[ $hash ] ) && $tokens[ $hash ] > time() ) {
			return get_user_by( 'id', $uid );
		}
	}
	return null;
}

function sowards_app_me( WP_REST_Request $req ) {
	$user = sowards_app_user_from_token( $req );
	if ( ! $user ) {
		return new WP_Error( 'not_signed_in', 'Sign in again.', array( 'status' => 401 ) );
	}
	return rest_ensure_response( sowards_app_payload( $user ) );
}

function sowards_app_logout( WP_REST_Request $req ) {
	$user = sowards_app_user_from_token( $req );
	if ( $user ) {
		$hash   = hash( 'sha256', $req->get_header( 'x-sowards-token' ) );
		$tokens = get_user_meta( $user->ID, '_sowards_app_tokens', true );
		if ( is_array( $tokens ) ) {
			unset( $tokens[ $hash ] );
			update_user_meta( $user->ID, '_sowards_app_tokens', $tokens );
		}
	}
	return rest_ensure_response( array( 'ok' => true ) );
}

/** What the app needs to know about a signed-in person. */
function sowards_app_payload( WP_User $user ) {
	$student = function_exists( 'llms_get_student' ) ? llms_get_student( $user->ID ) : null;

	$subscription = array(
		'active'       => false,
		'membershipId' => (int) SOWARDS_APP_MEMBERSHIP_ID,
		'status'       => 'none',
		'enrolledAt'   => null,
		'trialEndsAt'  => null,
		'nextPayment'  => null,
	);
	if ( $student && SOWARDS_APP_MEMBERSHIP_ID ) {
		$mid = (int) SOWARDS_APP_MEMBERSHIP_ID;
		if ( $student->is_enrolled( $mid ) ) {
			$subscription['active']     = true;
			$subscription['status']     = 'active';
			$subscription['enrolledAt'] = $student->get_enrollment_date( $mid, 'enrolled', 'c' );
		}
		// Trial and next payment come from the most recent order for this membership, when the Orders API is available.
		if ( class_exists( 'LLMS_Student' ) && method_exists( $student, 'get_orders' ) ) {
			$orders = $student->get_orders( array( 'per_page' => 20 ) );
			$list   = isset( $orders['orders'] ) ? $orders['orders'] : array();
			foreach ( $list as $order ) {
				if ( (int) $order->get( 'product_id' ) !== $mid ) {
					continue;
				}
				$status = $order->get( 'status' );
				$subscription['orderStatus'] = $status;
				if ( method_exists( $order, 'has_trial' ) && $order->has_trial() && method_exists( $order, 'get_trial_end_date' ) ) {
					$subscription['trialEndsAt'] = $order->get_trial_end_date( 'c' );
				}
				if ( method_exists( $order, 'get_next_payment_due_date' ) ) {
					$next = $order->get_next_payment_due_date( 'c' );
					$subscription['nextPayment'] = is_wp_error( $next ) ? null : $next;
				}
				break;
			}
		}
	}
	// Administrators always have access, so the owner can test the app.
	if ( user_can( $user, 'manage_options' ) ) {
		$subscription['active'] = true;
		$subscription['status'] = 'staff';
	}

	$courses = array();
	if ( $student ) {
		$enrolled = $student->get_courses( array( 'status' => 'enrolled', 'limit' => 100 ) );
		$ids      = isset( $enrolled['results'] ) ? $enrolled['results'] : array();
		foreach ( $ids as $cid ) {
			$cert_url = '';
			if ( method_exists( $student, 'get_certificates' ) ) {
				foreach ( $student->get_certificates( array( 'per_page' => 50 ) ) as $cert ) {
					$c = is_object( $cert ) && method_exists( $cert, 'get' ) ? $cert : null;
					if ( $c && (int) $c->get( 'related' ) === (int) $cid ) {
						$cert_url = get_permalink( $c->get( 'id' ) );
						break;
					}
				}
			}
			$courses[] = array(
				'id'          => (int) $cid,
				'title'       => get_the_title( $cid ),
				'url'         => get_permalink( $cid ),
				'progress'    => (float) $student->get_progress( $cid, 'course' ),
				'completed'   => $student->is_complete( $cid, 'course' ),
				'certificate' => $cert_url,
			);
		}
	}

	return array(
		'user'         => array(
			'id'    => (int) $user->ID,
			'name'  => $user->display_name,
			'email' => $user->user_email,
		),
		'subscription' => $subscription,
		'courses'      => $courses,
	);
}
