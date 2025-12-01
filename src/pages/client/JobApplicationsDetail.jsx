import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Eye,
  Lock,
  Unlock,
  User,
  ExternalLink,
  Filter,
  SortAsc,
  SortDesc,
  Crown,
  FileText,
  Download,
} from 'lucide-react';

const JobApplicationsDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for filters and sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterNationality, setFilterNationality] = useState('');
  const [filterExperience, setFilterExperience] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPremium, setFilterPremium] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // State for full application view modal
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showFullViewModal, setShowFullViewModal] = useState(false);
  
  // State for insufficient points modal
  const [showInsufficientPointsModal, setShowInsufficientPointsModal] = useState(false);
  const [insufficientPointsMessage, setInsufficientPointsMessage] = useState('');

  // Fetch job details
  const { data: jobData, isLoading: loadingJob } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getJob(jobId),
  });

  // Fetch applications with filters
  const {
    data: applicationsData,
    isLoading: loadingApplications,
    error: applicationsError,
  } = useQuery({
    queryKey: ['jobApplications', jobId, sortBy, sortOrder, filterNationality, filterExperience, filterStatus, filterPremium, page],
    queryFn: () =>
      applicationService.getJobApplications(jobId, {
        sortBy,
        sortOrder,
        nationality: filterNationality,
        experienceLevel: filterExperience,
        status: filterStatus,
        subscriptionTier: filterPremium,
        page,
        limit,
      }),
  });

  // Fetch full application details
  const { data: fullApplicationData } = useQuery({
    queryKey: ['fullApplication', selectedApplication],
    queryFn: () => applicationService.getApplication(selectedApplication),
    enabled: !!selectedApplication && showFullViewModal,
  });

  // Unlock contact mutation
  const unlockMutation = useMutation({
    mutationFn: (applicationId) => applicationService.unlockContact(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobApplications', jobId]);
      queryClient.invalidateQueries(['currentUser']);
      queryClient.invalidateQueries(['fullApplication', selectedApplication]);
      alert('Student contact unlocked successfully!');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to unlock contact';
      
      // Check if it's an insufficient points error
      if (errorMessage.toLowerCase().includes('insufficient points') || 
          errorMessage.toLowerCase().includes('need') && errorMessage.toLowerCase().includes('points')) {
        setInsufficientPointsMessage(errorMessage);
        setShowInsufficientPointsModal(true);
      } else {
        alert(errorMessage);
      }
    },
  });

  // Accept application mutation
  const acceptMutation = useMutation({
    mutationFn: (applicationId) => applicationService.acceptApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobApplications', jobId]);
      alert('Application accepted! The student has been notified that they can be contacted to discuss the project.');
    },
  });

  // Reject application mutation
  const rejectMutation = useMutation({
    mutationFn: (applicationId) => applicationService.rejectApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobApplications', jobId]);
      alert('Application rejected. The student has been notified.');
    },
  });

  const handleUnlock = async (applicationId) => {
    if (confirm('Unlock this student\'s contact for 10 points?')) {
      unlockMutation.mutate(applicationId);
    }
  };

  const handleBuyPoints = () => {
    setShowInsufficientPointsModal(false);
    navigate('/client/packages');
  };

  const handleAccept = async (applicationId) => {
    if (confirm('Accept this application? The student will be notified that they can be contacted to discuss the project.')) {
      try {
        await acceptMutation.mutateAsync(applicationId);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to accept application');
      }
    }
  };

  const handleReject = async (applicationId) => {
    if (confirm('Reject this application? The student will be notified.')) {
      try {
        await rejectMutation.mutateAsync(applicationId);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject application');
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleViewFullApplication = (applicationId) => {
    setSelectedApplication(applicationId);
    setShowFullViewModal(true);
  };

  const handleCloseFullViewModal = () => {
    setShowFullViewModal(false);
    setSelectedApplication(null);
  };

  if (loadingJob || loadingApplications) {
    return <Loading text="Loading applications..." />;
  }

  if (applicationsError) {
    return (
      <Alert
        type="error"
        message={`Failed to load applications: ${applicationsError.response?.data?.message || applicationsError.message}`}
      />
    );
  }

  const job = jobData?.data?.jobPost;
  console.log('Job Details:', job?.status);
  const applications = applicationsData?.data?.applications || [];
  const pagination = applicationsData?.data?.pagination || {};
  const uniqueNationalities = applicationsData?.data?.uniqueNationalities || [];
  
  // Get total count - check multiple possible locations
  const totalCount = pagination?.total || applicationsData?.data?.total || applications.length;

  const SortIcon = sortOrder === 'asc' ? SortAsc : SortDesc;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate('/client/applications')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Applications
        </Button>
      </div>

      {/* Job Cancelled Alert */}
      {job?.status === 'cancelled' && (
        <Alert
          type="info"
          title="Job Cancelled"
          message="This job has been cancelled. You can still view and unlock applicant profiles, but you cannot accept or reject applications."
        />
      )}

      {/* Job Details Card */}
      <Card>
        <div className="flex items-start gap-4">
          <Briefcase className="w-8 h-8 text-primary-600 mt-1" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{job?.title}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-semibold">{job?.budget?.currency} {job?.budget?.min} - {job?.budget?.max}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="font-semibold">{new Date(job?.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold">{job?.projectDuration}</p>
                </div>
              </div>
        
            </div>
            <div className="flex items-center gap-2">
              {job?.status === 'cancelled' && <Badge variant="error">Cancelled</Badge>}
              {job?.status === 'completed' && <Badge variant="success">Completed</Badge>}
              {job?.status === 'open' && <Badge variant="info">Open</Badge>}
              {job?.status && !['cancelled', 'completed', 'open'].includes(job.status) && (
                <Badge variant="default">{job.status}</Badge>
              )}
              <Badge variant="info">{job?.category}</Badge>
              <Badge variant="success">{applications.length} Applicants</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters and Sorting */}
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">Filters & Sorting</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Nationality Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationality
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterNationality}
              onChange={(e) => {
                setFilterNationality(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Nationalities</option>
              {uniqueNationalities.map((nat) => (
                <option key={nat} value={nat}>
                  {nat}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterExperience}
              onChange={(e) => {
                setFilterExperience(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Subscription Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterPremium}
              onChange={(e) => {
                setFilterPremium(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Students</option>
              <option value="premium">Premium Only</option>
              <option value="free">Free Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="createdAt">Application Date</option>
              <option value="proposedBudget">Proposed Budget</option>
              <option value="relevantExperienceLevel">Experience Level</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <SortIcon className="w-4 h-4" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
      </Card>

      {/* Applications List */}
      <Card title={`All Applicants (${totalCount})`}>
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No applications match your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const isUnlocked = application.contactUnlockedByClient;
              const student = application.student;
              const isPremium = student?.studentProfile?.subscriptionTier === 'premium';

              return (
                <div
                  key={application._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                >
                  <div className="flex items-start justify-between">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {isUnlocked ? (
                          <>
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                              {student?.photo ? (
                                <img
                                  src={student.photo}
                                  alt={student.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-6 h-6 text-primary-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div>
                                <h3 className="font-bold text-gray-900">{student?.name}</h3>
                                <p className="text-sm text-gray-600">{student?.email}</p>
                              </div>
                              {isPremium && (
                                <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                                  <Crown className="w-3 h-3" />
                                  Premium Account
                                </Badge>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 text-gray-400" />
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-gray-500">Contact Locked</p>
                              {isPremium && (
                                <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                                  <Crown className="w-3 h-3" />
                                  Premium Account
                                </Badge>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Proposed Budget</p>
                          <p className="font-bold text-green-600 text-lg">
                            {application.proposedBudget?.currency} {application.proposedBudget?.amount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold">{application.estimatedDuration}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Experience</p>
                          <Badge variant="info">
                            {application.relevantExperienceLevel || 'Not specified'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Nationality</p>
                          <p className="font-semibold">{student?.nationality || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={
                          application.status === 'pending' ? 'info' :
                          application.status === 'accepted' ? 'success' :
                          application.status === 'rejected' ? 'error' : 'default'
                        }>
                          {application.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewFullApplication(application._id)}
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Full Application
                      </Button>
                      
                      {isUnlocked ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/client/students/${student?._id}`)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>

                          {/* Only show Accept/Reject buttons if application is pending and job is not cancelled */}
                          {application.status === 'pending' && job?.status !== 'cancelled' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleAccept(application._id)}
                                loading={acceptMutation.isPending}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="error"
                                size="sm"
                                onClick={() => handleReject(application._id)}
                                loading={rejectMutation.isPending}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlock(application._id)}
                          loading={unlockMutation.isPending}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Unlock (10 pts)
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of{' '}
              {totalCount} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Full Application View Modal */}
      <Modal
        isOpen={showFullViewModal}
        onClose={handleCloseFullViewModal}
        title="Full Application Details"
        size="xl"
      >
        {fullApplicationData?.data?.application ? (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {(() => {
              const fullApp = fullApplicationData.data.application;
              const fullStudent = fullApp.student;
              const isUnlocked = fullApp.contactUnlockedByClient;
              const isPremium = fullStudent?.studentProfile?.subscriptionTier === 'premium';

              return (
                <>
                  {/* Student Info Section */}
                  <Card>
                    <div className="flex items-start gap-4 mb-4">
                      {isUnlocked && fullStudent?.photo ? (
                        <img
                          src={fullStudent.photo}
                          alt={fullStudent.name || 'Student'}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-10 h-10 text-primary-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {isUnlocked ? (fullStudent?.name || 'Student') : 'Contact Locked'}
                          </h3>
                          {isPremium && (
                            <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                              <Crown className="w-3 h-3" />
                              Premium Account
                            </Badge>
                          )}
                        </div>
                        {isUnlocked ? (
                          <>
                            <p className="text-gray-600 mb-1">{fullStudent?.email}</p>
                            <p className="text-sm text-gray-500">
                              {fullStudent?.nationality && `Nationality: ${fullStudent.nationality}`}
                              {fullStudent?.age && ` • Age: ${fullStudent.age}`}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-500">Unlock contact to view student details</p>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Application Details */}
                  <Card>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Application Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Application Status</p>
                        <Badge
                          variant={
                            fullApp.status === 'pending' ? 'info' :
                            fullApp.status === 'accepted' ? 'success' :
                            fullApp.status === 'rejected' ? 'error' : 'default'
                          }
                        >
                          {fullApp.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Applied Date</p>
                        <p className="font-semibold">
                          {new Date(fullApp.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Proposed Budget</p>
                        <p className="font-semibold text-green-600 text-lg">
                          {fullApp.proposedBudget?.currency} {fullApp.proposedBudget?.amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Duration</p>
                        <p className="font-semibold">{fullApp.estimatedDuration || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Relevant Experience Level</p>
                        <p className="font-semibold">
                          {fullApp.relevantExperienceLevel || 'Not specified'}
                        </p>
                      </div>
                      {fullApp.proposalType && (
                        <div>
                          <p className="text-sm text-gray-500">Proposal Type</p>
                          <Badge variant="info">
                            {fullApp.proposalType.charAt(0).toUpperCase() + fullApp.proposalType.slice(1)}
                          </Badge>
                        </div>
                      )}
                      {fullApp.availabilityCommitment && (
                        <div>
                          <p className="text-sm text-gray-500">Availability Commitment</p>
                          <p className="font-semibold">{fullApp.availabilityCommitment}</p>
                        </div>
                      )}
                      {fullApp.applicationNumber && (
                        <div>
                          <p className="text-sm text-gray-500">Application Number</p>
                          <p className="font-semibold">{fullApp.applicationNumber}</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Approach & Methodology */}
                  {fullApp.approachSelections && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-4">Approach & Methodology</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fullApp.approachSelections.methodology && (
                          <div>
                            <p className="text-sm text-gray-500">Methodology</p>
                            <p className="font-semibold">{fullApp.approachSelections.methodology}</p>
                          </div>
                        )}
                        {fullApp.approachSelections.deliveryFrequency && (
                          <div>
                            <p className="text-sm text-gray-500">Delivery Frequency</p>
                            <p className="font-semibold">{fullApp.approachSelections.deliveryFrequency}</p>
                          </div>
                        )}
                        {fullApp.approachSelections.revisions !== undefined && (
                          <div>
                            <p className="text-sm text-gray-500">Number of Revisions</p>
                            <p className="font-semibold">{fullApp.approachSelections.revisions}</p>
                          </div>
                        )}
                        {fullApp.approachSelections.communicationPreference && (
                          <div>
                            <p className="text-sm text-gray-500">Communication Preference</p>
                            <p className="font-semibold">{fullApp.approachSelections.communicationPreference}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Proposal Message */}
                  {fullApp.proposalText && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">Proposal Message</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullApp.proposalText}</p>
                    </Card>
                  )}

                  {/* Cover Letter */}
                  {fullApp.coverLetter && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">Cover Letter</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullApp.coverLetter}</p>
                    </Card>
                  )}

                  {/* Why Choose Me */}
                  {fullApp.whyChooseMe && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">Why Choose Me</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullApp.whyChooseMe}</p>
                    </Card>
                  )}

                  {/* Relevant Experience */}
                  {fullApp.relevantExperience && fullApp.relevantExperience.length > 0 && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">Relevant Experience</h4>
                      <div className="space-y-4">
                        {fullApp.relevantExperience.map((exp, index) => (
                          <div key={index} className="border-l-4 border-primary-500 pl-4">
                            <h5 className="font-semibold text-gray-900">{exp.title}</h5>
                            {exp.company && <p className="text-gray-600">{exp.company}</p>}
                            {exp.duration && <p className="text-sm text-gray-500">{exp.duration}</p>}
                            {exp.description && (
                              <p className="text-gray-700 mt-2">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Portfolio */}
                  {fullApp.portfolio && fullApp.portfolio.length > 0 && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">Portfolio</h4>
                      <div className="space-y-4">
                        {fullApp.portfolio.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-2">{item.title}</h5>
                            {item.description && (
                              <p className="text-gray-700 mb-2">{item.description}</p>
                            )}
                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Portfolio Item
                              </a>
                            )}
                            {item.technologies && item.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.technologies.map((tech, techIndex) => (
                                  <Badge key={techIndex} variant="info" size="sm">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Attachments */}
                  {fullApp.attachments && fullApp.attachments.length > 0 && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">Attachments</h4>
                      <div className="space-y-2">
                        {fullApp.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                          >
                            <Download className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{attachment.name}</p>
                              {attachment.type && (
                                <p className="text-sm text-gray-500">{attachment.type}</p>
                              )}
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    {!isUnlocked && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleUnlock(fullApp._id);
                        }}
                        loading={unlockMutation.isPending}
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Contact (10 pts)
                      </Button>
                    )}
                    {isUnlocked && fullStudent?._id && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleCloseFullViewModal();
                          navigate(`/client/students/${fullStudent._id}`);
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        View Student Profile
                      </Button>
                    )}
                    {fullApp.status === 'pending' && job?.status !== 'cancelled' && (
                      <>
                        <Button
                          variant="success"
                          onClick={() => {
                            handleAccept(fullApp._id);
                            handleCloseFullViewModal();
                          }}
                          loading={acceptMutation.isPending}
                        >
                          Accept Application
                        </Button>
                        <Button
                          variant="error"
                          onClick={() => {
                            handleReject(fullApp._id);
                            handleCloseFullViewModal();
                          }}
                          loading={rejectMutation.isPending}
                        >
                          Reject Application
                        </Button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <Loading text="Loading application details..." />
        )}
      </Modal>

      {/* Insufficient Points Modal */}
      <Modal
        isOpen={showInsufficientPointsModal}
        onClose={() => setShowInsufficientPointsModal(false)}
        title="Insufficient Points"
        size="md"
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Not Enough Points
          </h3>
          
          <p className="text-gray-600 mb-6">
            {insufficientPointsMessage || 'You need 10 points to unlock a student\'s contact information.'}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Unlock Student Profiles
                </p>
                <p className="text-sm text-blue-700">
                  Purchase points to unlock student contact information and access their full profiles.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowInsufficientPointsModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBuyPoints}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Buy Points
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobApplicationsDetail;
