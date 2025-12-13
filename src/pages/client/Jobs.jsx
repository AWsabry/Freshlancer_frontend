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

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  const jobs = data?.data?.jobPosts || [];

  // Filter jobs based on status
  const filteredJobs = statusFilter === 'all'
    ? jobs
    : jobs.filter(job => job.status === statusFilter);

  // Count jobs by status (only open, completed, and cancelled)
  const statusCounts = {
    all: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.myJobPosts}</h1>
          <p className="text-gray-600 mt-1">{t.managePostings}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/client/jobs/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t.postNewJob}
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <Card>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-primary-600 text-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.allJobs} ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'open'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.open} ({statusCounts.open})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'completed'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t.completed} ({statusCounts.completed})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
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
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {jobs.length === 0
                ? t.noJobsYet
                : t.noJobsFound.replace('{status}', statusFilter === 'all' ? '' : statusFilter)}
            </p>

          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job._id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and Status */}
                  <div className="flex items-start gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {job.title}
                    </h3>
                    <div className="flex flex-col items-end gap-2">
                      {/* Startup Name */}
                      {job.startup && job.startup.startupName && (
                        <p className="text-sm font-medium text-primary-600">
                          {job.startup.startupName}
                        </p>
                      )}
                      {/* Status Badges */}
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        {job.urgent && <Badge variant="error">{t.urgent}</Badge>}
                        {job.featured && <Badge variant="info">{t.featured}</Badge>}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Job Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Budget */}
                    {job.budget && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <div>
                          <p className="text-xs text-gray-500">{t.budget}</p>
                          <p className="font-semibold text-green-600">
                          {job.budget.currency} {job.budget.min} - {job.budget.max}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Applications */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-5 h-5 text-primary-600" />
                      <div>
                        <p className="text-xs text-gray-500">{t.applications}</p>
                        <p className="font-semibold">
                          {job.applicationsCount || 0}
                        </p>
                      </div>
                    </div>

                    {/* Posted Date */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">{t.posted}</p>
                        <p className="font-semibold text-sm">
                          {new Date(job.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                        </p>
                      </div>
                    </div>

                    {/* Deadline */}
                    {job.deadline && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        <div>
                          <p className="text-xs text-gray-500">{t.deadline}</p>
                          <p className="font-semibold text-sm">
                            {new Date(job.deadline).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {job.skillsRequired.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skillsRequired.length > 5 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            +{job.skillsRequired.length - 5} {t.more}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  <div className="mb-4">
                    <Badge variant="default">{job.category}</Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/client/jobs/${job._id}`)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {t.viewDetails}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/client/jobs/${job._id}/edit`)}
                  className="flex items-center gap-2"
                  disabled={job.status === 'completed' || job.status === 'cancelled'}
                >
                  <Edit2 className="w-4 h-4" />
                  {t.edit}
                </Button>

                {/* Show Withdraw button if job has applications, otherwise show Delete button */}
                {job.applicationsCount > 0 ? (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleWithdraw(job)}
                    className="flex items-center gap-2"
                    disabled={job.status === 'completed' || job.status === 'cancelled'}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {t.withdrawJob}
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(job)}
                    className="flex items-center gap-2"
                    disabled={job.status === 'completed' || job.status === 'cancelled'}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t.delete}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t.deleteJobPost}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {t.deleteConfirm.replace('{title}', jobToDelete?.title || '')}
          </p>
          <p className="text-sm text-red-600">
            {t.cannotUndone}
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              className="flex-1"
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
        <div className="space-y-4">
          <p className="text-gray-700">
            {t.withdrawConfirm.replace('{title}', jobToWithdraw?.title || '')}
          </p>
          <p className="text-sm text-orange-600">
            {t.withdrawWill}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>{t.withdrawClose}</li>
            <li>{t.withdrawMark}</li>
            <li>{t.withdrawStudents}</li>
          </ul>
          <p className="text-sm text-red-600 font-medium">
            {t.cannotUndone}
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setWithdrawModalOpen(false)}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              variant="warning"
              onClick={confirmWithdraw}
              loading={withdrawMutation.isPending}
              disabled={withdrawMutation.isPending}
              className="flex-1"
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
