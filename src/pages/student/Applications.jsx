import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '../../services/applicationService';
import { authService } from '../../services/authService';
import { subscriptionService } from '../../services/subscriptionService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import {
  DollarSign,
  Calendar,
  Briefcase,
  Clock,
  FileText,
  XCircle,
  CheckCircle,
  Filter,
  Unlock,
  AlertCircle,
  Eye,
} from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading your applications...',
    myApplications: 'My Applications',
    trackApplications: 'Track all your job applications',
    browseJobs: 'Browse Jobs',
    failedToLoad: 'Failed to load applications',
    retry: 'Retry',
    jobTitle: 'Job Title',
    contactUnlocked: 'Contact Unlocked',
    jobWithdrawn: 'This job was withdrawn by the client',
    premiumMembersOnly: 'Premium members only',
    yourBid: 'Your Bid',
    appliedOn: 'Applied On',
    duration: 'Duration',
    jobBudget: 'Job Budget',
    proposal: 'Proposal',
    clientFeedback: 'Client Feedback:',
    viewApplication: 'View Application',
    noApplicationsYet: "You haven't applied to any jobs yet.",
    filterByStatus: 'Filter by Status',
    all: 'All',
    pending: 'Pending',
    reviewed: 'Reviewed',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    noApplications: 'No applications',
    noStatusApplications: 'No {status} applications',
  },
  it: {
    loading: 'Caricamento delle tue candidature...',
    myApplications: 'Le Mie Candidature',
    trackApplications: 'Traccia tutte le tue candidature di lavoro',
    browseJobs: 'Sfoglia Lavori',
    failedToLoad: 'Impossibile caricare le candidature',
    retry: 'Riprova',
    jobTitle: 'Titolo Lavoro',
    contactUnlocked: 'Contatto Sbloccato',
    jobWithdrawn: 'Questo lavoro è stato ritirato dal cliente',
    premiumMembersOnly: 'Solo membri Premium',
    yourBid: 'La Tua Offerta',
    appliedOn: 'Candidato Il',
    duration: 'Durata',
    jobBudget: 'Budget Lavoro',
    proposal: 'Proposta',
    clientFeedback: 'Feedback Cliente:',
    viewApplication: 'Visualizza Candidatura',
    noApplicationsYet: 'Non hai ancora fatto domanda per nessun lavoro.',
    filterByStatus: 'Filtra per Stato',
    all: 'Tutti',
    pending: 'In Attesa',
    reviewed: 'Revisionato',
    accepted: 'Accettato',
    rejected: 'Rifiutato',
    withdrawn: 'Ritirato',
    noApplications: 'Nessuna candidatura',
    noStatusApplications: 'Nessuna candidatura {status}',
  },
};

const Applications = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'accepted', 'rejected', 'withdrawn'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Listen for language changes from DashboardLayout
  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };
    
    // Listen for custom language change event
    window.addEventListener('languageChanged', handleLanguageChange);
    
    // Also listen for storage events (for cross-tab updates)
    const handleStorageChange = () => {
      setLanguage(localStorage.getItem('dashboardLanguage') || 'en');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const t = translations[language] || translations.en;

  // Fetch student's applications - optimized polling
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => applicationService.getMyApplications(),
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: (query) => {
      // Only poll when tab is visible
      if (document.hidden) return false;
      return 180000; // Refetch every 3 minutes (reduced from 30 seconds)
    },
  });

  // Fetch subscription (this will trigger backend check for expired subscriptions)
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getMySubscription(),
    retry: 1,
    staleTime: 30000, // Keep data fresh for 30 seconds
    onError: (error) => {
      console.error('Error fetching subscription:', error);
    },
  });

  // Fetch current user to check premium status
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
  });

  const allApplications = data?.data?.applications || [];

  // Check if user is premium
  const studentProfile = userData?.data?.user?.studentProfile;
  const isPremium = studentProfile?.subscriptionTier === 'premium';

  // Apply status filter
  const applications = useMemo(() => {
    try {
      if (statusFilter === 'all') {
        return Array.isArray(allApplications) ? allApplications : [];
      }
      return Array.isArray(allApplications)
        ? allApplications.filter((app) => app && app.status === statusFilter)
        : [];
    } catch (err) {
      console.error('Error filtering applications by status:', err);
      return [];
    }
  }, [statusFilter, allApplications]);

  // Count applications by status for filter badges
  const statusCounts = useMemo(() => {
    try {
      if (!Array.isArray(allApplications)) {
        return { all: 0, pending: 0, accepted: 0, rejected: 0, withdrawn: 0 };
      }

      return {
        all: allApplications.length,
        pending: allApplications.filter((app) => app && app.status === 'pending').length,
        accepted: allApplications.filter((app) => app && app.status === 'accepted').length,
        rejected: allApplications.filter((app) => app && app.status === 'rejected').length,
        withdrawn: allApplications.filter((app) => app && app.status === 'withdrawn').length,
      };
    } catch (err) {
      console.error('Error counting applications:', err);
      return { all: 0, pending: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    }
  }, [allApplications]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'info', label: t.pending, icon: Clock },
      reviewed: { variant: 'warning', label: t.reviewed, icon: Eye },
      accepted: { variant: 'success', label: t.accepted, icon: CheckCircle },
      rejected: { variant: 'error', label: t.rejected, icon: XCircle },
      withdrawn: { variant: 'default', label: t.withdrawn, icon: AlertCircle },
    };
    const config = statusConfig[status] || { variant: 'default', label: status, icon: FileText };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Now safe to have conditional returns after all hooks
  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 sm:py-12 px-4">
          <XCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-red-500 mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{t.failedToLoad}</p>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            {error.response?.data?.message || error.message}
          </p>
          <Button onClick={() => window.location.reload()} className="text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5">{t.retry}</Button>
        </div>
      </Card>
    );
  }

  const renderApplicationCard = (application) => {
    // Safety check
    if (!application || !application._id) {
      return null;
    }

    return (
      <Card key={application._id}>
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 w-full">
            {/* Job Title and Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-start gap-2 sm:gap-3 mb-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex-1 line-clamp-2">
                {application.jobPost?.title || t.jobTitle}
              </h3>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {getStatusBadge(application.status || 'pending')}
                {/* Contact Unlocked Badge - Show if contactUnlockedByClient is true (premium users only) */}
                {application.contactUnlockedByClient === true && (
                  <Badge variant="success" className="flex items-center gap-1 text-xs">
                    <Unlock className="w-3 h-3" />
                    <span className="hidden sm:inline">{t.contactUnlocked}</span>
                    <span className="sm:hidden">Unlocked</span>
                  </Badge>
                )}
                {/* Job Category */}
                {application.jobPost?.category && (
                  <Badge variant="default" className="text-xs">{application.jobPost.category}</Badge>
                )}
              </div>
            </div>

            {/* Withdrawal Notice - Show if withdrawn by client */}
            {application.status === 'withdrawn' &&
             application.withdrawalReason === 'Job was withdrawn by client' && (
              <div className="mb-3 p-2 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs sm:text-sm text-orange-800 flex items-center gap-1.5 sm:gap-2">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{t.jobWithdrawn}</span>
                </p>
              </div>
            )}

          {/* Company Info - Only for Premium Users */}
          {isPremium && application.jobPost?.client && !application.jobPost.client.message && (
            <p className="text-sm sm:text-base text-gray-600 mb-3 flex items-center gap-2">
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">
                {application.jobPost.client.clientProfile?.companyName ||
                 application.jobPost.client.email ||
                 application.jobPost.client.name ||
                 'N/A'}
              </span>
            </p>
          )}

          {/* Premium Upgrade Message for Free Users */}
          {(!isPremium || (application.jobPost?.client && application.jobPost.client.message)) && (
            <p className="text-sm sm:text-base text-gray-600 mb-3 flex items-center gap-2">
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-500 italic">
                {application.jobPost?.client?.message || t.premiumMembersOnly}
              </span>
            </p>
          )}

          {/* Contact Unlocked Status - Show message for non-premium users */}
          {application.contactUnlockedByClient === 'premium members only' && (
            <p className="text-sm sm:text-base text-gray-600 mb-3 flex items-center gap-2">
              <Unlock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-500 italic">
                {t.premiumMembersOnly}
              </span>
            </p>
          )}

          {/* Application Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Proposed Budget */}
            {application.proposedBudget && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500">{t.yourBid}</p>
                  <p className="font-semibold text-sm sm:text-base text-green-600 truncate">
                    {application.proposedBudget.currency} {application.proposedBudget.amount}
                  </p>
                </div>
              </div>
            )}

            {/* Applied Date */}
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500">{t.appliedOn}</p>
                <p className="font-semibold text-xs sm:text-sm">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Duration */}
            {application.estimatedDuration && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500">{t.duration}</p>
                  <p className="font-semibold text-xs sm:text-sm truncate">
                    {application.estimatedDuration}
                  </p>
                </div>
              </div>
            )}

            {/* Job Budget Range - Only for Premium Users */}
            {isPremium && application.jobPost?.budget && !application.jobPost.budget.message ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500">{t.jobBudget}</p>
                  <p className="font-semibold text-xs sm:text-sm truncate">
                    {application.jobPost.budget.currency} {application.jobPost.budget.min} - {application.jobPost.budget.max}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-500">{t.jobBudget}</p>
                  <p className="font-semibold text-xs sm:text-sm text-gray-400 italic truncate">
                    {application.jobPost?.budget?.message || t.premiumMembersOnly}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Proposal Type */}
          {application.proposalType && (
            <div className="mb-2 sm:mb-3">
              <span className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-primary-50 text-primary-700 rounded-full text-xs sm:text-sm font-medium">
                {application.proposalType.charAt(0).toUpperCase() +
                 application.proposalType.slice(1)} {t.proposal}
              </span>
            </div>
          )}

          {/* Client Feedback */}
          {application.clientFeedback && (
            <div className="p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                {t.clientFeedback}
              </p>
              <p className="text-xs sm:text-sm text-blue-800">
                {application.clientFeedback.message}
              </p>
            </div>
          )}


        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 sm:pt-4 border-t">
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/student/applications/${application._id}`)}
          className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto"
        >
          <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
          {t.viewApplication}
        </Button>
      </div>
    </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.myApplications}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{t.trackApplications}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/student/jobs')}
          className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 w-full sm:w-auto"
        >
          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
          {t.browseJobs}
        </Button>
      </div>

      {/* No Applications */}
      {allApplications.length === 0 ? (
        <Card>
          <div className="text-center py-8 sm:py-12 px-4">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 mb-4">{t.noApplicationsYet}</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Status Filter */}
          <Card className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0 mt-1 sm:mt-0" />
              <div className="flex-1 w-full">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  {t.filterByStatus}
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                      statusFilter === 'all'
                        ? 'bg-primary-600 text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.all} <span className="hidden sm:inline">({statusCounts.all})</span>
                    <span className="sm:hidden">({statusCounts.all})</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-2 ${
                      statusFilter === 'pending'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t.pending}</span>
                    <span className="sm:hidden">Pending</span>
                    <span className="hidden sm:inline">({statusCounts.pending})</span>
                    <span className="sm:hidden">({statusCounts.pending})</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('accepted')}
                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-2 ${
                      statusFilter === 'accepted'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t.accepted}</span>
                    <span className="sm:hidden">Accepted</span>
                    <span className="hidden sm:inline">({statusCounts.accepted})</span>
                    <span className="sm:hidden">({statusCounts.accepted})</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('rejected')}
                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-2 ${
                      statusFilter === 'rejected'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t.rejected}</span>
                    <span className="sm:hidden">Rejected</span>
                    <span className="hidden sm:inline">({statusCounts.rejected})</span>
                    <span className="sm:hidden">({statusCounts.rejected})</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter('withdrawn')}
                    className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1 sm:gap-2 ${
                      statusFilter === 'withdrawn'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{t.withdrawn}</span>
                    <span className="sm:hidden">Withdrawn</span>
                    <span className="hidden sm:inline">({statusCounts.withdrawn})</span>
                    <span className="sm:hidden">({statusCounts.withdrawn})</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Applications List */}
          {applications.length === 0 ? (
            <Card>
              <div className="text-center py-6 sm:py-8 px-4">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-2 sm:mb-3" />
                <p className="text-sm sm:text-base text-gray-600">
                  {statusFilter === 'all'
                    ? t.noApplications
                    : t.noStatusApplications.replace('{status}', t[statusFilter] || statusFilter)}
                </p>
  
              </div>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {applications.map((application) => renderApplicationCard(application))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Applications;
