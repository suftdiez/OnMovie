import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Detail from './pages/Detail';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Genres from './pages/Genres';
import Favorites from './pages/Favorites';
import Watchlist from './pages/Watchlist';
import History from './pages/History';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-primary flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/series" element={<Series />} />
              <Route path="/movie/:id" element={<Detail />} />
              <Route path="/series/:id" element={<Detail />} />
              <Route path="/:type/:id" element={<Detail />} />
              <Route path="/watch/:type/:id" element={<Watch />} />
              <Route path="/search" element={<Search />} />
              <Route path="/genres" element={<Genres />} />
              <Route path="/genres/:genre" element={<Movies />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
