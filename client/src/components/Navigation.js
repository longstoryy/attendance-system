import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, CheckCircle, BarChart3, Home, LogOut, User, Settings, Camera, Menu, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

function Navigation({ apiHealth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      navigate('/login');
    }
  };

  const navLinks = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/classes', icon: BookOpen, label: 'Classes' },
    { to: '/attendance', icon: CheckCircle, label: 'Attendance' },
    { to: '/scanner', icon: Camera, label: 'Scanner' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const adminNavLinks = [
    { to: '/users', icon: Settings, label: 'Users' },
    { to: '/bulk-import', icon: Users, label: 'Bulk Import' },
    { to: '/approvals', icon: CheckCircle, label: 'Approvals' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:inline">Attendance System</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900 sm:hidden">Attendance</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition text-sm rounded-lg"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}

            {/* User Profile Dropdown */}
            <div className="relative group ml-auto">
              <button
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition text-sm rounded-lg"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline text-sm">{user?.email || 'Account'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <div className="absolute right-0 mt-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {/* User Info Section */}
                {user && (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Account</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{user.email}</p>
                      <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2">
                        {user.role}
                      </span>
                    </div>

                    {/* Admin Tools Section */}
                    {user.role === 'admin' && (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Admin Tools</p>
                        </div>
                        {adminNavLinks.map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition border-b border-gray-100 last:border-b-0"
                          >
                            <Icon className="w-4 h-4" />
                            <span>{label}</span>
                          </Link>
                        ))}
                      </>
                    )}

                    {/* Logout Section */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition rounded-b-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition rounded"
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}

            {/* Mobile User Profile Section */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              {user && (
                <>
                  <div className="px-4 py-3 bg-blue-50 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Account</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <span className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2">
                      {user.role}
                    </span>
                  </div>

                  {/* Mobile Admin Tools */}
                  {user.role === 'admin' && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 uppercase tracking-wide px-4 py-2">Admin Tools</p>
                      {adminNavLinks.map(({ to, icon: Icon, label }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition rounded"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{label}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition rounded mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
