import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import {
  FileText,
  Search,
  Trash2,
  Download,
  Calendar,
  AlertCircle,
  RefreshCw,
  X,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { logger } from '../../utils/logger';

const Logs = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [levelFilter, setLevelFilter] = useState('all'); // 'all', 'info', 'success', 'warn', 'error'
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmDate, setDeleteConfirmDate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const limit = 50; // Entries per page

  // Fetch log files list
  const { data: logFilesData, isLoading: loadingFiles, refetch: refetchFiles } = useQuery({
    queryKey: ['adminLogFiles'],
    queryFn: () => adminService.getLogFiles(),
  });

  // Fetch log statistics
  const { data: logStatsData, isLoading: loadingStats } = useQuery({
    queryKey: ['adminLogStats'],
    queryFn: () => adminService.getLogStats(),
  });

  // Fetch specific log file content
  const { data: logContentData, isLoading: loadingContent, refetch: refetchContent } = useQuery({
    queryKey: ['adminLogContent', selectedDate, searchTerm, levelFilter, currentPage],
    queryFn: () =>
      adminService.getLogFileContent(selectedDate, {
        limit,
        offset: (currentPage - 1) * limit,
        search: searchTerm || undefined,
        level: levelFilter !== 'all' ? levelFilter : undefined,
      }),
    enabled: !!selectedDate && showLogModal,
  });

  // Delete log file mutation
  const deleteMutation = useMutation({
    mutationFn: (date) => adminService.deleteLogFile(date),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['adminLogFiles']);
      queryClient.invalidateQueries(['adminLogStats']);
      setShowDeleteModal(false);
      setDeleteConfirmDate(null);
      if (selectedDate === deleteConfirmDate) {
        setSelectedDate(null);
        setShowLogModal(false);
      }
      alert(response?.message || 'Log file deleted successfully');
    },
    onError: (error) => {
      logger.error('Failed to delete log file:', error);
      alert(error.response?.data?.message || 'Failed to delete log file');
    },
  });

  const logFiles = logFilesData?.data?.files || [];
  const stats = logStatsData?.data || {};
  const logEntries = logContentData?.data?.entries || [];
  const pagination = logContentData?.data?.pagination || {};

  const handleViewLog = (date) => {
    setSelectedDate(date);
    setShowLogModal(true);
    setSearchTerm('');
    setSearchInput('');
    setLevelFilter('all');
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleDelete = (date) => {
    setDeleteConfirmDate(date);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteConfirmDate) {
      deleteMutation.mutate(deleteConfirmDate);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const exportLogEntries = () => {
    if (logEntries.length === 0) {
      alert('No log entries to export');
      return;
    }

    const csvContent = [
      ['Timestamp', 'Level', 'Path', 'Message', 'URL', 'User Agent'].join(','),
      ...logEntries.map((entry) =>
        [
          entry.timestamp || '',
          entry.level || '',
          entry.path || '',
          `"${(entry.message || '').replace(/"/g, '""')}"`,
          entry.url || '',
          `"${(entry.userAgent || '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `logs-${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loadingFiles || loadingStats) {
    return <Loading text="Loading logs..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">View and manage audit logs</p>
        </div>
        <Button
          onClick={() => {
            refetchFiles();
            queryClient.invalidateQueries(['adminLogStats']);
          }}
          variant="outline"
          icon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Log Files</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFiles || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Errors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEntries || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSizeFormatted || '0 B'}</p>
            </div>
            <Download className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Errors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentErrors?.length || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Log Files List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Log Files</h2>
          <Badge variant="info">{logFiles.length} file(s)</Badge>
        </div>

        {logFiles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No log files found</p>
            <p className="text-sm text-gray-500 mt-2">
              Log files will appear here when actions occur in production
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">File Name</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Modified</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logFiles.map((file) => (
                  <tr key={file.filename} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{formatFileDate(file.date)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {file.filename}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{file.sizeFormatted}</td>
                    <td className="py-3 px-4 text-gray-600">{formatDate(file.lastModified)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleViewLog(file.date)}
                          variant="outline"
                          size="sm"
                          icon={Eye}
                        >
                          View
                        </Button>
                        <Button
                          onClick={() => handleDelete(file.date)}
                          variant="outline"
                          size="sm"
                          icon={Trash2}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Errors Preview */}
      {stats.recentErrors && stats.recentErrors.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Errors</h2>
          <div className="space-y-3">
            {stats.recentErrors.slice(0, 5).map((error, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{error.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {error.path} • {formatDate(error.timestamp)}
                    </p>
                  </div>
                  <Badge variant="error">{error.level}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* View Log Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setSelectedDate(null);
          setSearchTerm('');
          setSearchInput('');
          setCurrentPage(1);
        }}
        title={`Log Entries - ${formatFileDate(selectedDate)}`}
        size="large"
      >
        <div className="space-y-4">
          {/* Search and Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              type="text"
              placeholder="Search logs (message, URL, path, user agent)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              icon={Search}
              className="flex-1 min-w-[200px]"
            />
            <Select
              value={levelFilter}
              onChange={(e) => handleLevelFilterChange(e.target.value)}
              className="w-[150px]"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
            </Select>
            <Button onClick={handleSearch} icon={Search}>
              Search
            </Button>
            {(searchTerm || levelFilter !== 'all') && (
              <Button
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                  setLevelFilter('all');
                  setCurrentPage(1);
                }}
                variant="outline"
                icon={X}
              >
                Clear
              </Button>
            )}
            <Button onClick={exportLogEntries} variant="outline" icon={Download}>
              Export
            </Button>
          </div>

          {/* Log File Info */}
          {logContentData?.data?.fileInfo && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  File Size: <span className="font-medium">{logContentData.data.fileInfo.sizeFormatted}</span>
                </span>
                <span className="text-gray-600">
                  Last Modified: <span className="font-medium">{formatDate(logContentData.data.fileInfo.lastModified)}</span>
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loadingContent && (
            <div className="text-center py-8">
              <Loading text="Loading log entries..." />
            </div>
          )}

          {/* Log Entries */}
          {!loadingContent && logEntries.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No log entries found matching your search' : 'No log entries found'}
              </p>
            </div>
          )}

          {!loadingContent && logEntries.length > 0 && (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logEntries.map((entry, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-colors ${
                      entry.level === 'ERROR' ? 'border-red-200 bg-red-50 hover:bg-red-100' :
                      entry.level === 'WARN' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100' :
                      entry.level === 'SUCCESS' ? 'border-green-200 bg-green-50 hover:bg-green-100' :
                      'border-blue-200 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant={
                            entry.level === 'ERROR' ? 'error' :
                            entry.level === 'WARN' ? 'warning' :
                            entry.level === 'SUCCESS' ? 'success' :
                            'info'
                          }
                        >
                          {entry.level}
                        </Badge>
                        {entry.action && (
                          <Badge variant="outline" className="text-xs">
                            {entry.action}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-600">{formatDate(entry.timestamp)}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Path:</span>{' '}
                        <span className="text-gray-900">{entry.path || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Message:</span>{' '}
                        <span className="text-gray-900">{entry.message || 'N/A'}</span>
                      </div>
                      {entry.url && (
                        <div>
                          <span className="font-medium text-gray-700">URL:</span>{' '}
                          <span className="text-gray-600 break-all">{entry.url}</span>
                        </div>
                      )}
                      {entry.userAgent && (
                        <div>
                          <span className="font-medium text-gray-700">User Agent:</span>{' '}
                          <span className="text-gray-600 text-xs break-all">{entry.userAgent}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.total > 0 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600">
                    Showing {pagination.offset + 1} to{' '}
                    {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
                    {pagination.total} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      icon={ChevronLeft}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {Math.ceil(pagination.total / limit)}
                    </span>
                    <Button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!pagination.hasMore}
                      variant="outline"
                      size="sm"
                      icon={ChevronRight}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmDate(null);
        }}
        title="Delete Log File"
        size="small"
      >
        <div className="space-y-4">
          <Alert
            type="warning"
            message={`Are you sure you want to delete the log file for ${formatFileDate(deleteConfirmDate)}? This action cannot be undone.`}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmDate(null);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="danger"
              icon={Trash2}
              loading={deleteMutation.isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Logs;

