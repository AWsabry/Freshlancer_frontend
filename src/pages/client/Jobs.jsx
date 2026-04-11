import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../services/jobService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  DollarSign,
  Calendar,
  Users,
  XCircle,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  List,
  ListChecks,
} from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading your jobs...',
    myJobPosts: 'My Job Posts',
    managePostings: 'Manage your job postings',
    postNewJob: 'Post New Job',
    allJobs: 'All Jobs',
    open: 'Open',
    completed: 'Completed',
    withdrawn: 'Withdrawn',
    noJobsYet: "You haven't posted any jobs yet.",
    noJobsFound: 'No {status} jobs found.',
    budget: 'Budget',
    applications: 'Applications',
    posted: 'Posted',
    deadline: 'Deadline',
    more: 'more',
    viewDetails: 'View Details',
    edit: 'Edit',
    withdrawJob: 'Withdraw Job',
    delete: 'Delete',
    urgent: 'Urgent',
    featured: 'Featured',
    deleteJobPost: 'Delete Job Post',
    deleteConfirm: 'Are you sure you want to delete the job post "{title}"?',
    cannotUndone: 'This action cannot be undone.',
    cancel: 'Cancel',
    deleteJob: 'Delete Job',
    withdrawJobPost: 'Withdraw Job Post',
    withdrawConfirm: 'Are you sure you want to withdraw the job post "{title}"?',
    withdrawWill: 'This will:',
    withdrawClose: 'Close the job as cancelled',
    withdrawMark: 'Mark all applications for this job as withdrawn',
    withdrawStudents: 'Students will see their applications as withdrawn in their view',
    withdrawJobButton: 'Withdraw Job',
    jobDeleted: 'Job deleted successfully!',
    deleteFailed: 'Failed to delete job',
    jobWithdrawn: 'Job withdrawn successfully! All applications have been marked as withdrawn.',
    withdrawFailed: 'Failed to withdraw job',
    statusOpen: 'Open',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    compactView: 'Compact View',
    detailedView: 'Detailed View',
  },
  it: {
    loading: 'Caricamento dei tuoi lavori...',
    myJobPosts: 'I Miei Annunci di Lavoro',
    managePostings: 'Gestisci i tuoi annunci di lavoro',
    postNewJob: 'Pubblica Nuovo Lavoro',
    allJobs: 'Tutti i Lavori',
    open: 'Aperti',
    completed: 'Completati',
    withdrawn: 'Ritirati',
    noJobsYet: 'Non hai ancora pubblicato nessun lavoro.',
    noJobsFound: 'Nessun lavoro {status} trovato.',
    budget: 'Budget',
    applications: 'Candidature',
    posted: 'Pubblicato',
    deadline: 'Scadenza',
    more: 'altri',
    viewDetails: 'Visualizza Dettagli',
    edit: 'Modifica',
    withdrawJob: 'Ritira Lavoro',
    delete: 'Elimina',
    urgent: 'Urgente',
    featured: 'In Evidenza',
    deleteJobPost: 'Elimina Annuncio di Lavoro',
    deleteConfirm: 'Sei sicuro di voler eliminare l\'annuncio di lavoro "{title}"?',
    cannotUndone: 'Questa azione non può essere annullata.',
    cancel: 'Annulla',
    deleteJob: 'Elimina Lavoro',
    withdrawJobPost: 'Ritira Annuncio di Lavoro',
    withdrawConfirm: 'Sei sicuro di voler ritirare l\'annuncio di lavoro "{title}"?',
    withdrawWill: 'Questo:',
    withdrawClose: 'Chiuderà il lavoro come cancellato',
    withdrawMark: 'Segnerà tutte le candidature per questo lavoro come ritirate',
    withdrawStudents: 'Gli studenti vedranno le loro candidature come ritirate nella loro vista',
    withdrawJobButton: 'Ritira Lavoro',
    jobDeleted: 'Lavoro eliminato con successo!',
    deleteFailed: 'Impossibile eliminare il lavoro',
    jobWithdrawn: 'Lavoro ritirato con successo! Tutte le candidature sono state segnate come ritirate.',
    withdrawFailed: 'Impossibile ritirare il lavoro',
    statusOpen: 'Aperto',
    statusInProgress: 'In Corso',
    statusCompleted: 'Completato',
    statusCancelled: 'Cancellato',
    compactView: 'Vista Compatta',
    detailedView: 'Vista Dettagliata',
    listView1: 'Vista Lista 1',
    listView2: 'Vista Lista 2',
  },
};

const Jobs = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [jobToWithdraw, setJobToWithdraw] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('jobsViewMode') || 'detailed';
  });
  const [listPage, setListPage] = useState(1);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Listen for language changes from DashboardLayout
  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
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

  // Fetch client's jobs
  const { data, isLoading } = useQuery({
    queryKey: ['myJobs'],
    queryFn: () => jobService.getAllJobs(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (jobId) => jobService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries(['myJobs']);
      setDeleteModalOpen(false);
      setJobToDelete(null);
      alert(t.jobDeleted);
    },
    onError: (error) => {
      alert(error.message || t.deleteFailed);
    },
  });

  // Withdraw mutation (close job as cancelled)
  const withdrawMutation = useMutation({
    mutationFn: (jobId) => jobService.closeJob(jobId, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myJobs']);
      setWithdrawModalOpen(false);
      setJobToWithdraw(null);
      alert(t.jobWithdrawn);
    },
    onError: (error) => {
      alert(error.message || t.withdrawFailed);
    },
  });

  const handleDelete = (job) => {
    setJobToDelete(job);
    setDeleteModalOpen(true);
  };

  const handleWithdraw = (job) => {
    setJobToWithdraw(job);
    setWithdrawModalOpen(true);
  };

  const confirmDelete = () => {
    if (jobToDelete) {
      deleteMutation.mutate(jobToDelete._id);
    }
  };

  const confirmWithdraw = () => {
    if (jobToWithdraw) {
      withdrawMutation.mutate(jobToWithdraw._id);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { variant: 'success', label: t.statusOpen },
      in_progress: { variant: 'info', label: t.statusInProgress },
      completed: { variant: 'default', label: t.statusCompleted },
      cancelled: { variant: 'error', label: t.statusCancelled },
    };
    const config = statusConfig[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setListPage(1);
  }, [statusFilter]);

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  const jobs = data?.data?.jobPosts || [];

  // Filter jobs based on status
  const filteredJobs = statusFilter === 'all'
    ? jobs
    : jobs.filter(job => job.status === statusFilter);

  // Pagination for list views
  const isListView = viewMode === 'list1' || viewMode === 'list2';
  const listLimit = 20;
  const totalPages = isListView ? Math.ceil(filteredJobs.length / listLimit) : 1;
  const paginatedJobs = isListView
    ? filteredJobs.slice((listPage - 1) * listLimit, listPage * listLimit)
    : filteredJobs;

  // Count jobs by status (only open, completed, and cancelled)
  const statusCounts = {
    all: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{t.myJobPosts}</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">{t.managePostings}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white">
            <button
              onClick={() => {
                setViewMode('list1');
                setListPage(1);
                localStorage.setItem('jobsViewMode', 'list1');
              }}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list1'
                  ? 'bg-primary-600 text-gray-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t.listView1}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setViewMode('list2');
                setListPage(1);
                localStorage.setItem('jobsViewMode', 'list2');
              }}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list2'
                  ? 'bg-primary-600 text-gray-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t.listView2}
            >
              <ListChecks className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setViewMode('detailed');
                localStorage.setItem('jobsViewMode', 'detailed');
              }}
              className={`p-2 rounded transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-primary-600 text-gray-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={t.detailedView}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/client/jobs/new')}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">{t.postNewJob}</span>
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <Card>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              statusFilter === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.allJobs} ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              statusFilter === 'open'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.open} ({statusCounts.open})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              statusFilter === 'completed'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.completed} ({statusCounts.completed})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
              statusFilter === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.withdrawn} ({statusCounts.cancelled})
          </button>
        </div>
      </Card>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card>
          <div className="text-center py-8 sm:py-12 px-4">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {jobs.length === 0
                ? t.noJobsYet
                : t.noJobsFound.replace('{status}', statusFilter === 'all' ? '' : statusFilter)}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className={
            viewMode === 'list1' || viewMode === 'list2' 
              ? 'space-y-0' 
              : viewMode === 'detailed' 
                ? 'space-y-0' 
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'
          }>
            {paginatedJobs.map((job) => {
              // List View 1 - Very minimal
              if (viewMode === 'list1') {
                return (
                  <div key={job._id} className="border-b border-gray-200 py-2 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{job.budget?.currency} {job.budget?.min}-{job.budget?.max}</span>
                          <span>•</span>
                          <span>{job.applicationsCount || 0} {t.applications}</span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/client/jobs/${job._id}`)}
                        className="flex items-center gap-1 text-xs flex-shrink-0"
                      >
                        <Eye className="w-3 h-3" />
                        {t.viewDetails}
                      </Button>
                    </div>
                  </div>
                );
              }

              // List View 2 - Slightly more info
              if (viewMode === 'list2') {
                return (
                  <div key={job._id} className="border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-gray-900">{job.title}</h3>
                          {getStatusBadge(job.status)}
                          {job.urgent && <Badge variant="error" className="text-xs">{t.urgent}</Badge>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="text-gray-500">{t.budget}: </span>
                            <span className="font-semibold text-green-600">{job.budget?.currency} {job.budget?.min}-{job.budget?.max}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t.applications}: </span>
                            <span className="font-semibold">{job.applicationsCount || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t.posted}: </span>
                            <span>{new Date(job.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</span>
                          </div>
                          {job.deadline && (
                            <div>
                              <span className="text-gray-500">{t.deadline}: </span>
                              <span>{new Date(job.deadline).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/client/jobs/${job._id}`)}
                        className="flex items-center gap-1 text-xs flex-shrink-0"
                      >
                        <Eye className="w-3 h-3" />
                        {t.viewDetails}
                      </Button>
                    </div>
                  </div>
                );
              }

              // Detailed/Block View
              return (
                <div key={job._id} className={viewMode === 'detailed' ? 'border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors' : 'border border-gray-200 rounded-lg p-3 sm:p-4'}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  {/* Title and Status */}
                  <div className={`flex flex-col ${viewMode === 'compact' ? 'gap-2' : 'sm:flex-row sm:items-start gap-3'} mb-3`}>
                    <h3 className={`${viewMode === 'compact' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} font-bold text-gray-900 flex-1 break-words`}>
                      {job.title}
                    </h3>
                    <div className={`flex flex-col ${viewMode === 'compact' ? 'items-start' : 'sm:items-end'} gap-2 flex-shrink-0`}>
                      {/* Startup Name */}
                      {job.startup && job.startup.startupName && (
                        <p className={`text-xs ${viewMode === 'compact' ? 'sm:text-xs' : 'sm:text-sm'} font-medium text-primary-600 ${viewMode === 'compact' ? 'text-left' : 'text-right sm:text-left'}`}>
                          {job.startup.startupName}
                        </p>
                      )}
                      {/* Status Badges */}
                      <div className={`flex items-center gap-2 flex-wrap ${viewMode === 'compact' ? 'justify-start' : 'sm:justify-end'}`}>
                        {getStatusBadge(job.status)}
                        {job.urgent && <Badge variant="error">{t.urgent}</Badge>}
                        {job.featured && <Badge variant="info">{t.featured}</Badge>}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {viewMode === 'detailed' && (
                    <div className="mb-4 max-w-full overflow-hidden">
                      <p className="text-sm sm:text-base text-gray-700 break-words line-clamp-1">
                        {job.description}
                      </p>
                      <button
                        onClick={() => navigate(`/client/jobs/${job._id}`)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1 inline-flex items-center gap-1 transition-colors"
                      >
                        <span className="text-lg">...</span>
                        <span className="underline">{t.viewDetails}</span>
                      </button>
                    </div>
                  )}

                  {/* Job Details */}
                  <div className={`grid ${viewMode === 'compact' ? 'grid-cols-2 gap-2' : 'grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'} ${viewMode === 'detailed' ? 'mb-4' : 'mb-2'}`}>
                    {/* Budget */}
                    {job.budget && (
                      <div className="flex items-start sm:items-center gap-2 text-gray-600">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 mb-0.5">{t.budget}</p>
                          <p className="font-semibold text-sm sm:text-base text-green-600 truncate">
                            {job.budget.currency} {job.budget.min} - {job.budget.max}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Applications */}
                    <div className="flex items-start sm:items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">{t.applications}</p>
                        <p className="font-semibold text-sm sm:text-base">
                          {job.applicationsCount || 0}
                        </p>
                      </div>
                    </div>

                    {/* Posted Date */}
                    <div className="flex items-start sm:items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">{t.posted}</p>
                        <p className="font-semibold text-xs sm:text-sm">
                          {new Date(job.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                        </p>
                      </div>
                    </div>

                    {/* Deadline */}
                    {job.deadline && (
                      <div className="flex items-start sm:items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 mb-0.5">{t.deadline}</p>
                          <p className="font-semibold text-xs sm:text-sm">
                            {new Date(job.deadline).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {viewMode === 'detailed' && job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="mb-3 sm:mb-4">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {job.skillsRequired.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 sm:px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs sm:text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skillsRequired.length > 5 && (
                          <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm">
                            +{job.skillsRequired.length - 5} {t.more}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  {viewMode === 'detailed' && (
                    <div className="mb-3 sm:mb-4">
                      <Badge variant="default" className="text-xs sm:text-sm">{job.category}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className={`flex flex-wrap gap-2 ${viewMode === 'compact' ? 'pt-2 border-t mt-2' : 'pt-3 sm:pt-4 border-t mt-3 sm:mt-0'}`}>
                {viewMode === 'compact' ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/client/jobs/${job._id}`)}
                    className="flex items-center justify-center gap-1.5 flex-1 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t.viewDetails}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/client/jobs/${job._id}`)}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{t.viewDetails}</span>
                      <span className="sm:hidden">{t.viewDetails.split(' ')[0]}</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/client/jobs/${job._id}/edit`)}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm"
                      disabled={job.status === 'completed' || job.status === 'cancelled'}
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {t.edit}
                    </Button>

                    {/* Show Withdraw button if job has applications, otherwise show Delete button */}
                    {job.applicationsCount > 0 ? (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleWithdraw(job)}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm"
                        disabled={job.status === 'completed' || job.status === 'cancelled'}
                      >
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{t.withdrawJob}</span>
                        <span className="sm:hidden">{t.withdrawJob.split(' ')[0]}</span>
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(job)}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial text-xs sm:text-sm"
                        disabled={job.status === 'completed' || job.status === 'cancelled'}
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {t.delete}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
              );
            })}
          </div>

          {/* Pagination for List Views */}
          {isListView && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Showing {(listPage - 1) * listLimit + 1} to {Math.min(listPage * listLimit, filteredJobs.length)} of {filteredJobs.length} jobs
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setListPage(p => Math.max(1, p - 1))}
                  disabled={listPage === 1}
                >
                  {t.previous || 'Previous'}
                </Button>
                <span className="flex items-center px-3 text-sm text-gray-600">
                  {t.page || 'Page'} {listPage} {t.ofPages || 'of'} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setListPage(p => Math.min(totalPages, p + 1))}
                  disabled={listPage === totalPages}
                >
                  {t.next || 'Next'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t.deleteJobPost}
      >
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-700">
            {t.deleteConfirm.replace('{title}', jobToDelete?.title || '')}
          </p>
          <p className="text-xs sm:text-sm text-red-600">
            {t.cannotUndone}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 w-full sm:w-auto"
            >
              {t.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              className="flex-1 w-full sm:w-auto"
            >
              {t.deleteJob}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title={t.withdrawJobPost}
      >
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-700">
            {t.withdrawConfirm.replace('{title}', jobToWithdraw?.title || '')}
          </p>
          <p className="text-xs sm:text-sm text-orange-600">
            {t.withdrawWill}
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-gray-600 space-y-1 pl-2">
            <li>{t.withdrawClose}</li>
            <li>{t.withdrawMark}</li>
            <li>{t.withdrawStudents}</li>
          </ul>
          <p className="text-xs sm:text-sm text-red-600 font-medium">
            {t.cannotUndone}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button
              variant="secondary"
              onClick={() => setWithdrawModalOpen(false)}
              className="flex-1 w-full sm:w-auto"
            >
              {t.cancel}
            </Button>
            <Button
              variant="warning"
              onClick={confirmWithdraw}
              loading={withdrawMutation.isPending}
              disabled={withdrawMutation.isPending}
              className="flex-1 w-full sm:w-auto"
            >
              {t.withdrawJobButton}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Jobs;
