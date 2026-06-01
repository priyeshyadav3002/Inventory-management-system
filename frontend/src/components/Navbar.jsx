import { Link, useLocation } from 'react-router-dom';
import { Package, Users, ShoppingCart, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Inventory', path: '/products', icon: Package },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Orders', path: '/orders', icon: ShoppingCart },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-100/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-2 rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform">
                <Package size={24} strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-gray-900">
                Inventory<span className="premium-gradient-text">Pro</span>
              </span>
            </Link>
            <div className="hidden md:ml-12 md:flex md:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100/50'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center cursor-pointer hover:shadow-md transition-all">
              <span className="text-indigo-700 font-bold text-sm">AD</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
