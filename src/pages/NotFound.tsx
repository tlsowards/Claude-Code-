import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <>
      <Seo title="Not found" />
      <h1>Page not found</h1>
      <p>That page does not exist or has moved. <Link to="/">Go to the home page</Link>.</p>
    </>
  );
}
