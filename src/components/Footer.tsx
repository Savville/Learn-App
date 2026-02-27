import { Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/Opportunities Kenya Logo 2.png"
                alt="Opportunities Kenya"
                className="h-10 w-auto"
              />
              <span
                className="text-white font-bold"
                style={{ fontFamily: "'Inknut Antiqua', serif", fontSize: '1rem' }}
              >
                Opportunities Kenya
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering students and young professionals across Africa and beyond by giving them equal access to global opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/opportunities" className="hover:text-white transition-colors">
                Opportunities
              </Link>
              <Link to="/about" className="hover:text-white transition-colors">
                About
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © 2025 Opportunities Kenya. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
