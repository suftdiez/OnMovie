function Footer() {
  return (
    <footer className="bg-secondary border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-accent">On<span className="text-2xl font-bold text-white">Movie</span></span>
            </div>
            <p className="text-text-secondary text-sm">
              OnMovie adalah sebuah platform berbasis web yang dibuat khusus untuk para pecinta film dan serial TV. Website ini membantu pengguna menemukan berbagai informasi seputar dunia perfilman dengan mudah, cepat, dan akurat dalam satu tempat.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/movies" className="hover:text-white transition">Movies</a></li>
              <li><a href="/series" className="hover:text-white transition">Series</a></li>
              <li><a href="/genres" className="hover:text-white transition">Genres</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><a href="/genres/action" className="hover:text-white transition">Action</a></li>
              <li><a href="/genres/comedy" className="hover:text-white transition">Comedy</a></li>
              <li><a href="/genres/drama" className="hover:text-white transition">Drama</a></li>
              <li><a href="/genres/horror" className="hover:text-white transition">Horror</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-text-secondary text-sm">
          <p>&copy; {new Date().getFullYear()} OnMovie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
