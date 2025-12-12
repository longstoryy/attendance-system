import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
import axios from 'axios';
import QRScanner from '../components/QRScanner';

function Scanner() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedRecords, setScannedRecords] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('scannedRecords');
    return saved ? JSON.parse(saved) : [];
  });
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState(null);

  // Save scanned records to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('scannedRecords', JSON.stringify(scannedRecords));
  }, [scannedRecords]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes');
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setMessage({ type: 'error', text: 'Failed to load classes' });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrData) => {
    try {
      // Extract student ID from QR data (could be URL or plain ID)
      let studentId = qrData.trim();
      
      // If it's a URL, extract the student ID from the query parameter
      if (studentId.includes('?')) {
        const url = new URL(studentId);
        studentId = url.searchParams.get('id') || studentId.split('/').pop();
      } else if (studentId.includes('/')) {
        // If it's a path, get the last part
        studentId = studentId.split('/').pop();
      }

      if (!selectedClass) {
        setMessage({ type: 'error', text: 'Please select a class first' });
        return;
      }

      // Check if already scanned
      if (scannedRecords.some(r => r.student_id === studentId)) {
        setMessage({ type: 'warning', text: 'Student already scanned' });
        return;
      }

      // Mark attendance
      setSyncing(true);
      const response = await axios.post('/api/attendance/mark', {
        student_id: studentId,
        class_id: selectedClass,
        date: new Date().toISOString().split('T')[0],
        status: 'present',
      });

      // Add to scanned records
      const newRecord = {
        id: response.data.id,
        student_id: studentId,
        timestamp: new Date().toISOString(),
        status: 'synced',
      };

      setScannedRecords([newRecord, ...scannedRecords]);
      setMessage({ type: 'success', text: `Student ${studentId} marked present` });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed to mark attendance:', err);
      
      // Add to offline queue if sync fails
      const newRecord = {
        id: `offline-${Date.now()}`,
        student_id: qrData.trim(),
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      setScannedRecords([newRecord, ...scannedRecords]);
      
      setMessage({ 
        type: 'warning', 
        text: 'Offline mode: Will sync when connection restored' 
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncOffline = async () => {
    try {
      setSyncing(true);
      const pendingRecords = scannedRecords.filter(r => r.status === 'pending');

      for (const record of pendingRecords) {
        try {
          await axios.post('/api/attendance/mark', {
            student_id: record.student_id,
            class_id: selectedClass,
            date: new Date().toISOString().split('T')[0],
            status: 'present',
          });

          // Update record status
          setScannedRecords(prev =>
            prev.map(r =>
              r.id === record.id ? { ...r, status: 'synced' } : r
            )
          );
        } catch (err) {
          console.error('Failed to sync record:', err);
        }
      }

      setMessage({ type: 'success', text: 'All records synced successfully' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  const handleClearRecords = () => {
    if (window.confirm('Clear all scanned records? This cannot be undone.')) {
      setScannedRecords([]);
      localStorage.removeItem('scannedRecords');
    }
  };

  const pendingCount = scannedRecords.filter(r => r.status === 'pending').length;
  const syncedCount = scannedRecords.filter(r => r.status === 'synced').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">QR Code Scanner</h1>
        <button
          onClick={() => setShowScanner(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Camera className="w-4 h-4" />
          Start Scanning
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : message.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className={`w-5 h-5 ${message.type === 'success' ? 'text-green-600' : 'text-yellow-600'}`} />
          ) : (
            <AlertCircle className={`w-5 h-5 ${message.type === 'error' ? 'text-red-600' : 'text-yellow-600'}`} />
          )}
          <p
            className={`text-sm font-medium ${
              message.type === 'success'
                ? 'text-green-800'
                : message.type === 'error'
                ? 'text-red-800'
                : 'text-yellow-800'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Class
        </label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a class...</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Scanned</p>
              <p className="text-3xl font-bold text-gray-900">{scannedRecords.length}</p>
            </div>
            <Camera className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Synced</p>
              <p className="text-3xl font-bold text-green-600">{syncedCount}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-100" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-100" />
          </div>
        </div>
      </div>

      {/* Scanned Records */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Scanned Records</h2>
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <button
                onClick={handleSyncOffline}
                disabled={syncing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : `Sync ${pendingCount}`}
              </button>
            )}
            {scannedRecords.length > 0 && (
              <button
                onClick={handleClearRecords}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {scannedRecords.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No records yet. Start scanning to begin!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {scannedRecords.map((record) => {
                  const timestamp = record.timestamp instanceof Date 
                    ? record.timestamp 
                    : new Date(record.timestamp);
                  
                  return (
                    <tr key={record.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{record.student_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {timestamp.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'synced'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {record.status === 'synced' ? 'Synced' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}

export default Scanner;
