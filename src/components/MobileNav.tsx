import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Home, Briefcase, Users, PlusCircle, Inbox, ClipboardList, Folder } from 'lucide-react';

const publicLinks = [
  { name: 'Home', path: '/', icon: Home, exact: true },
  { name: 'Opportunities', path: '/opportunities', icon: Briefcase, exact: false },
  { name: 'Projects', path: '/projects', icon: Folder, exact: false },
  { name: 'Post', path: '/post-with-us', icon: PlusCircle, exact: false },
];

const privateLinks = [
  { name: 'Opportunities', path: '/opportunities', icon: Briefcase, exact: false },
  { name: 'Projects', path: '/projects', icon: Folder, exact: false },
  { name: 'Inbox', path: '/inbox', icon: Inbox, exact: false },
  { name: 'Manage', path: '/manage', icon: ClipboardList, exact: false },
  { name: 'Profile', path: '/portfolio', icon: Users, exact: false },
];

import { useState, useEffect } from 'react';

export function MobileNav() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user_token'));

  useEffect(() => {
    const handleAuthChange = () => setIsLoggedIn(!!localStorage.getItem('user_token'));
    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  // Never show on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const currentLinks = isLoggedIn ? privateLinks : publicLinks;

  const nav = (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        paddingTop: '8px',
      }}
      className="flex md:hidden"
    >
      {currentLinks.map((link) => {
        const Icon = link.icon;
        // exact match for home, startsWith for others — but only against THIS link's path
        const isActive = link.exact
          ? location.pathname === link.path
          : location.pathname === link.path || location.pathname.startsWith(link.path + '/') || (link.name === 'Post' && location.pathname.startsWith('/manage'));

        return (
          <Link
            key={link.name}
            to={link.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              color: isActive ? '#2563eb' : '#64748b',
              textDecoration: 'none',
              minWidth: '56px',
              padding: '4px 8px',
              borderRadius: '10px',
              transition: 'color 0.15s',
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500 }}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return createPortal(nav, document.body);
}
