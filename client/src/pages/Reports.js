import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Filter } from 'lucide-react';
import axios from 'axios';

function Reports() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchSummary();
    }
  }, [selectedStudent, selectedClass]);

  const fetchData = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        axios.get('/api/students'),
        axios.get('/api/classes'),
      ]);
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = selectedClass ? { class_id: selectedClass } : {};
      console.log('Fetching summary for student:', selectedStudent, 'params:', params);
      const response = await axios.get(`/api/attendance/summary/${selectedStudent}`, {
        params,
      });
      console.log('Summary response:', response.data);
      setSummaries(response.data || []);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      setSummaries([]);
    }
  };

  const getClassName = (id) => {
    const cls = classes.find((c) => c.id === id);
    return cls ? cls.name : 'Overall';
  };

  const downloadReport = () => {
    if (!selectedStudent) {
      alert('Please select a student');
      return;
    }

    // Find student by database id or student_id
    let student = students.find((s) => s.id === selectedStudent);
    if (!student) {
      student = students.find((s) => s.student_id === selectedStudent);
    }

    if (!student) {
      alert('Student not found');
      return;
    }

    const csv = [
      ['Attendance Report'],
      ['Student:', student.name],
      ['Student ID:', student.student_id],
      ['Generated:', new Date().toLocaleString()],
      [],
      ['Class', 'Total Sessions', 'Present', 'Absent', 'Late', 'Attendance Rate'],
      ...summaries.map((s) => [
        getClassName(s.class_id),
        s.total_sessions,
        s.present_count,
        s.absent_count,
        s.late_count,
        `${s.attendance_rate}%`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${student.student_id}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={downloadReport}
          disabled={!selectedStudent}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Student *
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  setSelectedClass('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.student_id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Class (Optional)
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={!selectedStudent}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">All classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading data...</div>
        ) : !selectedStudent ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select a student to view their attendance report</p>
          </div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No attendance data available for this student.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {summaries.map((summary, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {getClassName(summary.class_id)}
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Sessions:</span>
                    <span className="font-semibold text-gray-900">
                      {summary.total_sessions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Present:</span>
                    <span className="font-semibold text-green-600">
                      {summary.present_count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-semibold text-red-600">
                      {summary.absent_count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Late:</span>
                    <span className="font-semibold text-yellow-600">
                      {summary.late_count}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-medium">Attendance Rate:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{
                              width: `${summary.attendance_rate}%`,
                            }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 w-12 text-right">
                          {summary.attendance_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;
