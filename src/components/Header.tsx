import { Menu, X, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogoutModal } from './LogoutModal';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user_token'));
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => setIsLoggedIn(!!localStorage.getItem('user_token'));
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_email');
    window.dispatchEvent(new Event('auth-changed'));
    setShowLogoutModal(false);
    navigate('/');
  };
  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/Opportunities Kenya Logo 2.png"
              alt="Opportunities Kenya"
              style={{ height: '32px', width: 'auto', display: 'block' }}
            />
            <span
              className="text-blue-900 font-bold"
              style={{ fontFamily: "'Book Antiqua', serif", fontSize: '1.5rem' }}
            >
              Opportunities Kenya
            </span>
          </div>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isLoggedIn ? (
              // WEB APP NAVBAR
              <>
                <Link to="/opportunities" className={`transition-colors font-medium ${isActive('/opportunities') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Opportunities</Link>
                <Link to="/projects" className={`transition-colors font-medium ${isActive('/projects') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Projects</Link>
                <Link to="/inbox" className={`transition-colors font-medium ${isActive('/inbox') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Inbox</Link>
                <Link to="/manage" className={`transition-colors font-medium ${isActive('/manage') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Manage</Link>
                <Link to="/portfolio" className={`transition-colors font-medium ${isActive('/portfolio') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Portfolio</Link>
                
                <div className="flex items-center gap-4 border-l pl-6 border-gray-200">
                  <Link to="/post-with-us" className="text-sm font-semibold bg-blue-50 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-colors">Post New</Link>
                  <button onClick={handleLogoutClick} className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors">Log Out</button>
                </div>
              </>
            ) : (
              // PUBLIC WEBSITE NAVBAR
              <>
                <Link to="/" className={`transition-colors font-medium ${isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Home</Link>
                <Link to="/opportunities" className={`transition-colors font-medium ${isActive('/opportunities') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Opportunities</Link>
                <Link to="/projects" className={`transition-colors font-medium ${isActive('/projects') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Projects</Link>
                <Link to="/about" className={`transition-colors font-medium ${isActive('/about') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>About & Services</Link>
                <Link to="/contact" className={`transition-colors font-medium ${isActive('/contact') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>Contact Us</Link>
                
                <div className="flex items-center gap-4 ml-4">
                  <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors">Sign In</Link>
                  <Link to="/post-with-us" className="bg-blue-600 text-white shadow-md text-sm font-bold px-5 py-2.5 rounded-full hover:bg-blue-700 transition-all">Post With Us</Link>
                </div>
              </>
            )}
          </div>

          {/* Mobile Actions: Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>


        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              {isLoggedIn ? (
                <>
                  <Link to="/opportunities" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/opportunities') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Opportunities</Link>
                  <Link to="/projects" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/projects') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Projects</Link>
                  <Link to="/inbox" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/inbox') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Inbox</Link>
                  <Link to="/manage" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/manage') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Manage</Link>
                  <Link to="/portfolio" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/portfolio') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Portfolio</Link>
                  <Link to="/post-with-us" className="px-4 py-2 rounded-lg font-bold bg-blue-50 text-blue-700 mt-2" onClick={() => setMobileMenuOpen(false)}>Post New</Link>
                  <button onClick={() => { handleLogoutClick({} as any); setMobileMenuOpen(false); }} className="px-4 py-2 rounded-lg font-medium text-left text-gray-500 hover:bg-gray-50 mt-2">Log Out</button>
                </>
              ) : (
                <>
                  <Link to="/" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                  <Link to="/opportunities" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/opportunities') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Opportunities</Link>
                  <Link to="/projects" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/projects') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Projects</Link>
                  <Link to="/about" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/about') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>About & Services</Link>
                  <Link to="/contact" className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/contact') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`} onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
                  <div className="border-t mt-2 pt-4 flex flex-col gap-3">
                    <Link to="/login" className="px-4 py-2 rounded-lg font-bold text-center border border-gray-200 text-gray-700 hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                    <Link to="/post-with-us" className="px-4 py-2 rounded-lg font-bold text-center bg-blue-600 text-white shadow-md hover:bg-blue-700" onClick={() => setMobileMenuOpen(false)}>Post With Us</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogoutConfirm} />
    </header>
  );
}