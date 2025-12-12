import React, { useState } from 'react';
import { Upload, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

function BulkImport() {
  const [importType, setImportType] = useState('users');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setResult(null);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`/api/import/${importType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Import failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = (type) => {
    let csv = '';
    if (type === 'users') {
      csv = 'email,username,password,role\nadmin@example.com,admin_user,SecurePass123,admin\nstaff@example.com,staff_user,SecurePass123,staff\ninstructor@example.com,instructor_user,SecurePass123,instructor';
    } else {
      csv = 'name,email,student_id\nJohn Doe,john@example.com,STU001\nJane Smith,jane@example.com,STU002\nBob Johnson,bob@example.com,STU003';
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `${type}_template.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bulk Import</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Import multiple users or students from CSV files</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">Import Type</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="users"
                checked={importType === 'users'}
                onChange={(e) => setImportType(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Users (Staff, Instructors, Admins)</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="students"
                checked={importType === 'students'}
                onChange={(e) => setImportType(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Students</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => downloadTemplate(importType)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 transition text-sm"
          >
            <Download className="w-4 h-4" />
            Download CSV Template
          </button>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {importType === 'users'
              ? 'Template includes: email, username, password, role (admin/staff/instructor)'
              : 'Template includes: name, email, student_id'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleImport} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                {file ? file.name : 'Click to select CSV file or drag and drop'}
              </p>
              <p className="text-xs text-gray-600 mt-1">CSV files only</p>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import CSV
              </>
            )}
          </button>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Import Complete</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Successfully Imported</p>
              <p className="text-2xl font-bold text-green-600">{result.imported}</p>
            </div>
            <div className={`p-4 rounded-lg ${result.failed > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <p className="text-sm text-gray-600">Failed</p>
              <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {result.failed}
              </p>
            </div>
          </div>

          {result.results && result.results.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Imported Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        {importType === 'users' ? 'Email' : 'Name'}
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        {importType === 'users' ? 'Username' : 'Student ID'}
                      </th>
                      {importType === 'users' && (
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Role</th>
                      )}
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.slice(0, 10).map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-200">
                        <td className="px-3 py-2 text-gray-900">
                          {importType === 'users' ? item.email : item.name}
                        </td>
                        <td className="px-3 py-2 text-gray-900">
                          {importType === 'users' ? item.username : item.student_id}
                        </td>
                        {importType === 'users' && (
                          <td className="px-3 py-2 text-gray-900">{item.role}</td>
                        )}
                        <td className="px-3 py-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.results.length > 10 && (
                <p className="text-xs text-gray-600 mt-2">
                  ... and {result.results.length - 10} more records
                </p>
              )}
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Errors</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.errors.slice(0, 10).map((err, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded text-xs">
                    <p className="font-medium text-red-800">Row {err.row}: {err.error}</p>
                  </div>
                ))}
              </div>
              {result.errors.length > 10 && (
                <p className="text-xs text-gray-600 mt-2">
                  ... and {result.errors.length - 10} more errors
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="font-semibold text-blue-900 mb-3">CSV Format Guide</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>For Users:</strong> Columns must be: email, username, password, role
          </p>
          <p>
            <strong>For Students:</strong> Columns must be: name, email, student_id
          </p>
          <p>
            <strong>Valid Roles:</strong> admin, staff, instructor
          </p>
          <p>
            <strong>Tips:</strong>
          </p>
          <ul className="list-disc list-inside ml-2">
            <li>First row should be headers</li>
            <li>Duplicate emails/usernames will be skipped</li>
            <li>Invalid rows will be reported with error messages</li>
            <li>You can import thousands of records at once</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BulkImport;
