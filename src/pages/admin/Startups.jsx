import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Rocket,
  Search,
  Filter,
  Trash2,
  Eye,
  Mail,
  Calendar,
  Building,
  Users,
  Briefcase,
} from 'lucide-react';

const Startups = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState(searchParams.get('industry') || '');
  const [stageFilter, setStageFilter] = useState(searchParams.get('stage') || '');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');

  // Fetch startups
  const { data: startupsData, isLoading, error } = useQuery({
    queryKey: ['adminStartups', page, industryFilter, stageFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (searchTerm) params.append('search', searchTerm);
      if (industryFilter) params.append('industry', industryFilter);
      if (stageFilter) params.append('stage', stageFilter);

      console.log('Fetching startups from:', `/startups?${params.toString()}`);
      const response = await api.get(`/startups?${params.toString()}`);
      console.log('Startups response:', response);
      return response;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/startups/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminStartups']);
      setShowDeleteModal(false);
      setSelectedStartup(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete startup');
    },
  });

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setSearchParams({ page: '1' });
  };

  const handleIndustryFilter = (industry) => {
    setIndustryFilter(industry);
    setSearchParams({ page: '1', ...(industry && { industry }) });
  };

  const handleStageFilter = (stage) => {
    setStageFilter(stage);
    setSearchParams({ page: '1', ...(stage && { stage }) });
  };

  const handleView = (startup) => {
    setSelectedStartup(startup);
    setShowViewModal(true);
  };

  const handleDelete = (startup) => {
    setSelectedStartup(startup);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedStartup) {
      deleteMutation.mutate(selectedStartup._id);
    }
  };

  // Note: api interceptor returns response.data, so startupsData is already the API response body
  const startups = startupsData?.data?.startups || [];
  const totalCount = startupsData?.totalCount || 0;
  const totalPages = startupsData?.totalPages || 1;

  // Debug logging
  console.log('Startups data:', startupsData);
  console.log('Startups array:', startups);
  console.log('Total count:', totalCount);

  const industryOptions = [
    'Technology',
    'E-commerce',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Real Estate',
    'Manufacturing',
    'Consulting',
    'Non-profit',
  ];

  const stageOptions = ['Idea', 'MVP', 'Early Stage', 'Growth', 'Scale'];

  const getStageColor = (stage) => {
    const colors = {
      Idea: 'bg-gray-500',
      MVP: 'bg-blue-500',
      'Early Stage': 'bg-green-500',
      Growth: 'bg-yellow-500',
      Scale: 'bg-purple-500',
    };
    return colors[stage] || 'bg-gray-500';
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={`Failed to load startups: ${error.response?.data?.message || error.message}`}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Rocket className="w-7 h-7" />
            Startups Management
          </h1>
          <p className="text-gray-600 mt-1">Total: {totalCount} startups</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by startup name or position..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Button onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Industry and Stage Filters */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Industry:</span>
              <Button
                variant={industryFilter === '' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleIndustryFilter('')}
              >
                All
              </Button>
              {industryOptions.map((industry) => (
                <Button
                  key={industry}
                  variant={industryFilter === industry ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleIndustryFilter(industry)}
                >
                  {industry}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Stage:</span>
              <Button
                variant={stageFilter === '' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleStageFilter('')}
              >
                All
              </Button>
              {stageOptions.map((stage) => (
                <Button
                  key={stage}
                  variant={stageFilter === stage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStageFilter(stage)}
                >
                  {stage}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Startups Table */}
      <Card>
        {startups.length === 0 ? (
          <div className="text-center py-12">
            <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No startups found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Startup Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employees</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Industry</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {startups.map((startup) => (
                  <tr key={startup._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{startup.startupName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {startup.client?.photo && (
                          <img
                            src={startup.client.photo}
                            alt={startup.client.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{startup.client?.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{startup.client?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{startup.position}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{startup.numberOfEmployees}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{startup.industry}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="custom"
                        className={`${getStageColor(startup.stage)} text-white`}
                      >
                        {startup.stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(startup.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(startup)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(startup)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => {
                  setSearchParams({ page: (page - 1).toString() });
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => {
                  setSearchParams({ page: (page + 1).toString() });
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStartup(null);
        }}
        title="Startup Details"
      >
        {selectedStartup && (
          <div className="space-y-6">
            {/* Startup Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Startup Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Startup Name</label>
                  <p className="mt-1 text-gray-900">{selectedStartup.startupName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Position</label>
                  <p className="mt-1 text-gray-900">{selectedStartup.position}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Number of Employees</label>
                  <p className="mt-1 text-gray-900">{selectedStartup.numberOfEmployees}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Industry</label>
                  <p className="mt-1 text-gray-900">{selectedStartup.industry}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Stage</label>
                  <div className="mt-1">
                    <Badge
                      variant="custom"
                      className={`${getStageColor(selectedStartup.stage)} text-white`}
                    >
                      {selectedStartup.stage}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedStartup.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Client Account Information */}
            {selectedStartup.client && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedStartup.client.photo && (
                      <img
                        src={selectedStartup.client.photo}
                        alt={selectedStartup.client.name}
                        className="w-16 h-16 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{selectedStartup.client.name}</p>
                      <p className="text-sm text-gray-500">{selectedStartup.client.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-gray-900">{selectedStartup.client.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Age</label>
                      <p className="mt-1 text-gray-900">{selectedStartup.client.age || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <p className="mt-1 text-gray-900">{selectedStartup.client.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nationality</label>
                      <p className="mt-1 text-gray-900">{selectedStartup.client.nationality || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email Verified</label>
                      <p className="mt-1">
                        {selectedStartup.client.emailVerified ? (
                          <Badge variant="success">Verified</Badge>
                        ) : (
                          <Badge variant="warning">Not Verified</Badge>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Status</label>
                      <p className="mt-1">
                        {selectedStartup.client.active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="error">Inactive</Badge>
                        )}
                      </p>
                    </div>
                    {selectedStartup.client.clientProfile && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                          <p className="mt-1 text-gray-900">
                            {selectedStartup.client.clientProfile.yearsOfExperience || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Industry</label>
                          <p className="mt-1 text-gray-900">
                            {selectedStartup.client.clientProfile.industry || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">How Did You Hear</label>
                          <p className="mt-1 text-gray-900">
                            {selectedStartup.client.clientProfile.howDidYouHear || 'N/A'}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Created</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(selectedStartup.client.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStartup(null);
        }}
        title="Delete Startup"
      >
        {selectedStartup && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete the startup <strong>{selectedStartup.startupName}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStartup(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Startups;

