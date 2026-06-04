import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, PlusCircle, Inbox, User } from 'lucide-react';

export function MobileNav() {
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/', icon: <Home className="w-6 h-6" /> },
    { name: 'Find', path: '/opportunities', icon: <Briefcase className="w-6 h-6" /> },
    { name: 'Post', path: '/post-with-us', icon: <PlusCircle className="w-6 h-6" /> },
    { name: 'Inbox', path: '/inbox', icon: <Inbox className="w-6 h-6" /> },
    { name: 'Admin', path: '/admin/login', icon: <User className="w-6 h-6" /> },
  ];

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 py-2 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" 
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {links.map((link) => {
        const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
        return (
          <Link
            key={link.name}
            to={link.path}
            className={`flex flex-col items-center justify-center w-16 gap-1 ${
              isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {link.icon}
            <span className="text-[10px] font-medium">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
