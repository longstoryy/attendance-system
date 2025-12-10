import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    todayAttendance: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, classesRes] = await Promise.all([
          axios.get('/api/students'),
          axios.get('/api/classes'),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const attendanceRes = await axios.get('/api/attendance', {
          params: { date: today },
        });

        setStats({
          totalStudents: studentsRes.data.length,
          totalClasses: classesRes.data.length,
          todayAttendance: attendanceRes.data.length,
          attendanceRate: attendanceRes.data.length > 0
            ? Math.round(
                (attendanceRes.data.filter(r => r.status === 'present').length /
                  attendanceRes.data.length) *
                  100
              )
            : 0,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12" style={{ color }} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the Attendance Tracking System</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading statistics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats.totalStudents}
            color="#3B82F6"
          />
          <StatCard
            icon={BookOpen}
            label="Total Classes"
            value={stats.totalClasses}
            color="#10B981"
          />
          <StatCard
            icon={CheckCircle}
            label="Today's Attendance"
            value={stats.todayAttendance}
            color="#F59E0B"
          />
          <StatCard
            icon={TrendingUp}
            label="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            color="#8B5CF6"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/students"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Manage Students</h3>
            <p className="text-sm text-gray-600 mt-1">Add, edit, or view student records</p>
          </a>
          <a
            href="/classes"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
          >
            <BookOpen className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Manage Classes</h3>
            <p className="text-sm text-gray-600 mt-1">Create and organize classes</p>
          </a>
          <a
            href="/attendance"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition"
          >
            <CheckCircle className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Mark Attendance</h3>
            <p className="text-sm text-gray-600 mt-1">Record attendance for students</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
