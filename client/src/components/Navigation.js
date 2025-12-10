import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, CheckCircle, BarChart3, Home, LogOut, User, Settings, Camera } from 'lucide-react';
import axios from 'axios';

function Navigation({ apiHealth }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

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
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Attendance System</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/students"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <Users className="w-4 h-4" />
              <span>Students</span>
            </Link>
            <Link
              to="/classes"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <BookOpen className="w-4 h-4" />
              <span>Classes</span>
            </Link>
            <Link
              to="/attendance"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Attendance</span>
            </Link>
            <Link
              to="/scanner"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Scanner</span>
            </Link>
            <Link
              to="/reports"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </Link>

            {user && user.role === 'admin' && (
              <Link
                to="/users"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition"
              >
                <Settings className="w-4 h-4" />
                <span>Users</span>
              </Link>
            )}

            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    apiHealth ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {apiHealth ? 'Connected' : 'Offline'}
                </span>
              </div>

              {user && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{user.email}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
