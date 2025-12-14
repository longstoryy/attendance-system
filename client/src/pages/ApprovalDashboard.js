import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

function ApprovalDashboard() {
  const [pendingReasons, setPendingReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReason, setSelectedReason] = useState(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingReasons();
  }, []);

  const fetchPendingReasons = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reasons/pending');
      setPendingReasons(response.data || []);
    } catch (err) {
      console.error('Failed to fetch pending reasons:', err);
      setError('Failed to load pending reasons');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reasonId) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      await axios.post('/api/approvals/review', {
        reason_id: reasonId,
        approved: true,
        approval_notes: approvalNotes
      });

      setSuccessMessage('Reason approved successfully');
      setApprovalNotes('');
      setSelectedReason(null);
      
      setTimeout(() => {
        fetchPendingReasons();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve reason');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (reasonId) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');

      await axios.post('/api/approvals/review', {
        reason_id: reasonId,
        approved: false,
        approval_notes: approvalNotes
      });

      setSuccessMessage('Reason rejected');
      setApprovalNotes('');
      setSelectedReason(null);
      
      setTimeout(() => {
        fetchPendingReasons();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject reason');
    } finally {
      setSubmitting(false);
    }
  };

  const getReasonTypeColor = (type) => {
    const colors = {
      late_arrival: 'bg-yellow-100 text-yellow-800',
      absence: 'bg-red-100 text-red-800',
      medical: 'bg-blue-100 text-blue-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  const getReasonTypeLabel = (type) => {
    const labels = {
      late_arrival: 'Late Arrival',
      absence: 'Absence',
      medical: 'Medical',
      other: 'Other'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading pending reasons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance Approval Dashboard</h1>
          <p className="text-gray-600 mt-2">Review and approve student attendance reasons</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {pendingReasons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Reasons</h3>
            <p className="text-gray-600">All attendance reasons have been reviewed!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingReasons.map(reason => (
              <div key={reason.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {reason.student_name}
                      </h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getReasonTypeColor(reason.reason_type)}`}>
                        {getReasonTypeLabel(reason.reason_type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Date: {new Date(reason.date).toLocaleDateString()}
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700">{reason.reason_text}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(reason.submitted_at).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedReason(reason)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Review Reason - {selectedReason.student_name}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{selectedReason.reason_text}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes for the student..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedReason(null);
                    setApprovalNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedReason.id)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedReason.id)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalDashboard;
