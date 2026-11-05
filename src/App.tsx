import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Briefs from './pages/Briefs';
import BriefDetail from './pages/BriefDetail';
import Podcast from './pages/Podcast';
import Training from './pages/Training';
import Resources from './pages/Resources';
import DowningTheDuck from './pages/DowningTheDuck';
import PC835a from './pages/PC835a';
import Subscribe from './pages/Subscribe';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="briefs" element={<Briefs />} />
        <Route path="briefs/:id" element={<BriefDetail />} />
        <Route path="podcast" element={<Podcast />} />
        <Route path="podcast/:id" element={<Podcast />} />
        <Route path="training" element={<Training />} />
        <Route path="resources" element={<Resources />} />
        <Route path="downing-the-duck" element={<DowningTheDuck />} />
        <Route path="reference/pc835a" element={<PC835a />} />
        <Route path="subscribe" element={<Subscribe />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
