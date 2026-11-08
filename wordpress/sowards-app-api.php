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
 * The token is a random 48-byte value. Only its SHA-256 hash is stored, as its own user meta row
 * (_sowards_app_tok_<hash> = expiry), so a lookup is one indexed query. Tokens expire after 90 days.
 * The app sends the token in the X-Sowards-Token header, which is not stripped by hosts that drop
 * the Authorization header. Sign-in attempts are rate limited per IP and per username.
 */

// ---------------------------------------------------------------- CONFIG
if ( ! defined( 'SOWARDS_APP_MEMBERSHIP_ID' ) ) {
	define( 'SOWARDS_APP_MEMBERSHIP_ID', 0 ); // set after the membership is created
}
if ( ! defined( 'SOWARDS_APP_ORIGINS' ) ) {
	// Production origins only. Add http://localhost:5173 while developing, and remove it again.
	define( 'SOWARDS_APP_ORIGINS', 'https://app.sowardsconsulting.com,https://tlsowards.github.io' );
}
if ( ! defined( 'SOWARDS_APP_TOKEN_DAYS' ) ) {
	define( 'SOWARDS_APP_TOKEN_DAYS', 90 );
}
// ------------------------------------------------------------------------

/**
 * Ask for HTTP Basic credentials on REST 401s. WordPress core answers unauthenticated REST calls
 * with a bare 401, so clients and proxies that wait for a WWW-Authenticate challenge before sending
 * an Application Password never send it. Adding the challenge lets them log in normally.
 */
add_filter( 'rest_post_dispatch', function ( $response ) {
	if ( $response instanceof WP_REST_Response && 401 === $response->get_status() && empty( $_SERVER['PHP_AUTH_USER'] ) ) {
		$response->header( 'WWW-Authenticate', 'Basic realm="WordPress REST API"' );
	}
	return $response;
} );

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

/** Ten attempts per 15 minutes per client IP, and ten per username, whichever trips first. */
function sowards_app_rate_limited( $username = '' ) {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( $_SERVER['REMOTE_ADDR'] ) : 'unknown';
	// SiteGround and most CDNs forward the real client address; use it when present.
	foreach ( array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR' ) as $h ) {
		if ( ! empty( $_SERVER[ $h ] ) ) {
			$ip = sanitize_text_field( trim( explode( ',', $_SERVER[ $h ] )[0] ) );
			break;
		}
	}
	$keys = array( 'sowards_app_login_ip_' . md5( $ip ) );
	if ( $username ) {
		$keys[] = 'sowards_app_login_user_' . md5( strtolower( $username ) );
	}
	$limited = false;
	foreach ( $keys as $key ) {
		$n = (int) get_transient( $key );
		if ( $n >= 10 ) {
			$limited = true;
		}
		set_transient( $key, $n + 1, 15 * MINUTE_IN_SECONDS );
	}
	return $limited;
}

function sowards_app_login( WP_REST_Request $req ) {
	$username = sanitize_text_field( (string) $req->get_param( 'username' ) );
	$password = (string) $req->get_param( 'password' );
	if ( sowards_app_rate_limited( $username ) ) {
		return new WP_Error( 'too_many_attempts', 'Too many sign-in attempts. Try again in 15 minutes.', array( 'status' => 429 ) );
	}
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
	sowards_app_purge_expired_tokens( $user->ID );
	add_user_meta( $user->ID, '_sowards_app_tok_' . $hash, time() + SOWARDS_APP_TOKEN_DAYS * DAY_IN_SECONDS, true );

	return rest_ensure_response( array_merge( array( 'token' => $raw ), sowards_app_payload( $user ) ) );
}

/** Remove this user's expired token rows. Cheap: one user, a handful of rows. */
function sowards_app_purge_expired_tokens( $user_id ) {
	global $wpdb;
	$rows = $wpdb->get_results( $wpdb->prepare( "SELECT meta_key, meta_value FROM {$wpdb->usermeta} WHERE user_id = %d AND meta_key LIKE %s", $user_id, '_sowards_app_tok_%' ) );
	foreach ( $rows as $row ) {
		if ( (int) $row->meta_value < time() ) {
			delete_user_meta( $user_id, $row->meta_key );
		}
	}
}

/** One indexed query on the token's own meta key. */
function sowards_app_user_from_token( WP_REST_Request $req ) {
	$raw = $req->get_header( 'x-sowards-token' );
	if ( ! $raw || ! preg_match( '/^[a-f0-9]{96}$/', $raw ) ) {
		return null;
	}
	$key   = '_sowards_app_tok_' . hash( 'sha256', $raw );
	$users = get_users( array( 'meta_key' => $key, 'number' => 1, 'fields' => 'ID' ) );
	if ( empty( $users ) ) {
		return null;
	}
	$uid = (int) $users[0];
	if ( (int) get_user_meta( $uid, $key, true ) < time() ) {
		delete_user_meta( $uid, $key );
		return null;
	}
	return get_user_by( 'id', $uid );
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
		delete_user_meta( $user->ID, '_sowards_app_tok_' . hash( 'sha256', $req->get_header( 'x-sowards-token' ) ) );
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
