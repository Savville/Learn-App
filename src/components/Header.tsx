import { Menu, X, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const API_BASE = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('user_token');
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/public/me/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, link?: string) => {
    const token = localStorage.getItem('user_token');
    if (!token) return;
    try {
      await fetch(`${API_BASE}/public/me/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setShowNotifications(false);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
              className="h-10 w-auto"
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
            <Link
              to="/"
              className={`transition-colors ${
                isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/opportunities"
              className={`transition-colors ${
                isActive('/opportunities') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Opportunities
            </Link>
            <Link
              to="/about"
              className={`transition-colors ${
                isActive('/about') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`transition-colors flex items-center h-full ${
                isActive('/contact') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Contact
            </Link>

            {/* Notification Bell (Desktop) */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="font-bold text-gray-800 text-sm">Notifications</span>
                    {unreadCount > 0 && <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        You're all caught up!
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors block cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}
                        >
                          <Link to={notif.link || '#'} onClick={() => markAsRead(notif._id, notif.link)} className="block">
                            <h4 className={`text-sm font-semibold mb-1 ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/post-with-us"
              className={`transition-all px-4 py-2 rounded-xl font-medium ${
                isActive('/post-with-us') 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:shadow-md'
              }`}
            >
              Post With Us
            </Link>
            <Link
              to="/manage"
              className={`transition-all px-4 py-2 rounded-xl font-medium ${
                isActive('/manage') 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white hover:shadow-md'
              }`}
            >
              Manage
            </Link>
          </div>

          {/* Mobile Actions: Bell + Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-gray-100"
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Notifications Dropdown (Absolute Positioning for overlay) */}
        {showNotifications && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg z-50 overflow-y-auto max-h-[70vh]">
            <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0">
              <span className="font-bold text-gray-800 text-sm">Notifications</span>
              {unreadCount > 0 && <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
            </div>
            <div>
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  You're all caught up!
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif._id}
                    className={`p-4 border-b border-gray-50 active:bg-gray-100 transition-colors block ${notif.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}
                  >
                    <Link to={notif.link || '#'} onClick={() => markAsRead(notif._id, notif.link)} className="block">
                      <h4 className={`text-sm font-semibold mb-1 ${notif.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h4>
                      <p className="text-xs text-gray-600">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 mt-2 block">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/opportunities"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/opportunities') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Opportunities
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/about') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/contact') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/post-with-us"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/post-with-us') ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Post With Us
              </Link>
              <Link
                to="/manage"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/manage') ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Manage
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

// Refurbished
