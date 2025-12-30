import { Link } from 'react-router-dom';

function Footer() {
  const teamMembers = [
    { name: "Fajri Maulana Yusuf", nim: "5241011005" },
    { name: "Dewa Sanjaya", nim: "5241011028" },
    { name: "M. Adji Putra Sambodo", nim: "5241011039" },
    { name: "M. Syahwan", nim: "5241011007" },
  ];

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
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/movies" className="hover:text-white transition">Movies</Link></li>
              <li><Link to="/series" className="hover:text-white transition">Series</Link></li>
              <li><Link to="/genres" className="hover:text-white transition">Genres</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-text-secondary text-sm">
              <li><Link to="/genres/28" className="hover:text-white transition">Action</Link></li>
              <li><Link to="/genres/35" className="hover:text-white transition">Comedy</Link></li>
              <li><Link to="/genres/18" className="hover:text-white transition">Drama</Link></li>
              <li><Link to="/genres/27" className="hover:text-white transition">Horror</Link></li>
            </ul>
          </div>
        </div>

        {/* Team Credits */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <h4 className="text-white font-semibold mb-4 text-center">Development Team</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center p-4 bg-tertiary rounded-lg">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-lg">
                    {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </span>
                </div>
                <p className="text-white text-sm font-medium">{member.name}</p>
                <p className="text-text-secondary text-xs">{member.nim}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-text-secondary text-sm">
          <p>&copy; {new Date().getFullYear()} OnMovie. All rights reserved.</p>
          <p className="mt-1">Tugas Basis Data</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
