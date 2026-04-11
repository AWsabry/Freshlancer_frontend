import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../services/jobService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import {
  ArrowLeft,
  Edit2,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading job details...',
    jobNotFound: 'Job not found',
    backToMyJobs: 'Back to My Jobs',
    posted: 'Posted',
    deadline: 'Deadline:',
    urgent: 'Urgent',
    featured: 'Featured',
    open: 'Open',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    budget: 'Budget',
    duration: 'Duration',
    applications: 'Applications',
    jobDescription: 'Job Description',
    requiredSkills: 'Required Skills',
    category: 'Category',
    experienceLevel: 'Experience Level',
    projectDuration: 'Project Duration',
    editJob: 'Edit Job',
    viewApplications: 'View Applications',
    markAsCompleted: 'Mark as Completed',
    withdrawJob: 'Withdraw Job',
    withdrawJobPost: 'Withdraw Job Post',
    withdrawConfirm: 'Are you sure you want to withdraw the job post "{title}"?',
    thisWill: 'This will:',
    withdrawWill1: 'Close the job as cancelled',
    withdrawWill2: 'Mark all applications for this job as withdrawn',
    withdrawWill3: 'Students will see their applications as withdrawn in their view',
    actionCannotUndone: 'This action cannot be undone.',
    cancel: 'Cancel',
    withdrawSuccess: 'Job withdrawn successfully! All applications have been marked as withdrawn.',
    withdrawFailed: 'Failed to withdraw job',
    markJobCompleted: 'Mark Job as Completed',
    completeConfirm: 'Are you sure you want to mark the job post "{title}" as completed?',
    completeWill1: 'Close the job as completed',
    completeWill2: 'Reject all pending and reviewed applications',
    completeWill3: 'Keep accepted applications as accepted',
    completeWill4: 'Students will see their non-accepted applications as rejected',
    completeSuccess: 'Job marked as completed! All non-accepted applications have been rejected.',
    completeFailed: 'Failed to complete job',
  },
  it: {
    loading: 'Caricamento dettagli lavoro...',
    jobNotFound: 'Lavoro non trovato',
    backToMyJobs: 'Torna ai Miei Lavori',
    posted: 'Pubblicato',
    deadline: 'Scadenza:',
    urgent: 'Urgente',
    featured: 'In Evidenza',
    open: 'Aperto',
    inProgress: 'In Corso',
    completed: 'Completato',
    cancelled: 'Annullato',
    budget: 'Budget',
    duration: 'Durata',
    applications: 'Candidature',
    jobDescription: 'Descrizione Lavoro',
    requiredSkills: 'Competenze Richieste',
    category: 'Categoria',
    experienceLevel: 'Livello di Esperienza',
    projectDuration: 'Durata Progetto',
    editJob: 'Modifica Lavoro',
    viewApplications: 'Visualizza Candidature',
    markAsCompleted: 'Segna come Completato',
    withdrawJob: 'Ritira Lavoro',
    withdrawJobPost: 'Ritira Offerta di Lavoro',
    withdrawConfirm: 'Sei sicuro di voler ritirare l\'offerta di lavoro "{title}"?',
    thisWill: 'Questo:',
    withdrawWill1: 'Chiuderà il lavoro come annullato',
    withdrawWill2: 'Segnerà tutte le candidature per questo lavoro come ritirate',
    withdrawWill3: 'Gli studenti vedranno le loro candidature come ritirate nella loro vista',
    actionCannotUndone: 'Questa azione non può essere annullata.',
    cancel: 'Annulla',
    withdrawSuccess: 'Lavoro ritirato con successo! Tutte le candidature sono state segnate come ritirate.',
    withdrawFailed: 'Impossibile ritirare il lavoro',
    markJobCompleted: 'Segna Lavoro come Completato',
    completeConfirm: 'Sei sicuro di voler segnare l\'offerta di lavoro "{title}" come completata?',
    completeWill1: 'Chiuderà il lavoro come completato',
    completeWill2: 'Rifiuterà tutte le candidature in attesa e revisionate',
    completeWill3: 'Manterrà le candidature accettate come accettate',
    completeWill4: 'Gli studenti vedranno le loro candidature non accettate come rifiutate',
    completeSuccess: 'Lavoro segnato come completato! Tutte le candidature non accettate sono state rifiutate.',
    completeFailed: 'Impossibile completare il lavoro',
  },
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

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

  // Fetch job details
  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJob(id),
  });

  // Withdraw mutation (close job as cancelled)
  const withdrawMutation = useMutation({
    mutationFn: () => jobService.closeJob(id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['job', id]);
      queryClient.invalidateQueries(['myJobs']);
      setWithdrawModalOpen(false);
      alert(t.withdrawSuccess);
    },
    onError: (error) => {
      alert(error.message || t.withdrawFailed);
    },
  });

  // Complete mutation (close job as completed)
  const completeMutation = useMutation({
    mutationFn: () => jobService.closeJob(id, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['job', id]);
      queryClient.invalidateQueries(['myJobs']);
      setCompleteModalOpen(false);
      alert(t.completeSuccess);
    },
    onError: (error) => {
      alert(error.message || t.completeFailed);
    },
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: { variant: 'success', label: t.open },
      in_progress: { variant: 'info', label: t.inProgress },
      completed: { variant: 'default', label: t.completed },
      cancelled: { variant: 'error', label: t.cancelled },
    };
    const config = statusConfig[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  const job = jobData?.data?.jobPost;

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t.jobNotFound}</p>
        <Button onClick={() => navigate('/client/jobs')} className="mt-4">
          {t.backToMyJobs}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/client/jobs')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backToMyJobs}
      </button>

      {/* Job Header */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-5 h-5" />
                {t.posted} {new Date(job.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
              </span>
              {job.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="w-5 h-5" />
                  {t.deadline} {new Date(job.deadline).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
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

        {/* Quick Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {job.budget && (
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.budget}</p>
              <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                {job.budget.currency} {job.budget.min} - {job.budget.max}
              </div>
            </div>
          )}
          {job.projectDuration && (
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.duration}</p>
              <p className="text-lg font-semibold text-gray-900">{job.projectDuration}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">{t.applications}</p>
            <p className="text-lg font-semibold text-gray-900">
              {job.applicationsCount || 0}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">{t.jobDescription}</h2>
          <p className="text-gray-700 whitespace-pre-line break-words overflow-wrap-anywhere">{job.description}</p>
        </div>

        {/* Skills Required */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">{t.requiredSkills}</h2>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">{t.category}</h3>
            <Badge variant="default">{job.category}</Badge>
          </div>

          {job.experienceLevel && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t.experienceLevel}</h3>
              <p className="text-gray-700">{job.experienceLevel}</p>
            </div>
          )}

          {job.projectDuration && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t.projectDuration}</h3>
              <p className="text-gray-700">{job.projectDuration}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t flex flex-col sm:flex-row flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() => navigate(`/client/jobs/${job._id}/edit`)}
            className="flex items-center gap-2"
            disabled={job.status === 'completed' || job.status === 'cancelled'}
          >
            <Edit2 className="w-5 h-5" />
            {t.editJob}
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/client/applications')}
            className="flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            {t.viewApplications} ({job.applicationsCount || 0})
          </Button>

          {/* Show Complete and Withdraw buttons only for open jobs */}
          {job.status === 'open' && (
            <>
              <Button
                variant="success"
                onClick={() => setCompleteModalOpen(true)}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {t.markAsCompleted}
              </Button>
              <Button
                variant="warning"
                onClick={() => setWithdrawModalOpen(true)}
                className="flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                {t.withdrawJob}
              </Button>
            </>
          )}


        </div>
      </Card>

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title={t.withdrawJobPost}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {t.withdrawConfirm.replace('{title}', job?.title || '')}
          </p>
          <p className="text-sm text-orange-600">
            {t.thisWill}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>{t.withdrawWill1}</li>
            <li>{t.withdrawWill2}</li>
            <li>{t.withdrawWill3}</li>
          </ul>
          <p className="text-sm text-red-600 font-medium">
            {t.actionCannotUndone}
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
              onClick={() => withdrawMutation.mutate()}
              loading={withdrawMutation.isPending}
              disabled={withdrawMutation.isPending}
              className="flex-1"
            >
              {t.withdrawJob}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Complete Confirmation Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title={t.markJobCompleted}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {t.completeConfirm.replace('{title}', job?.title || '')}
          </p>
          <p className="text-sm text-blue-600">
            {t.thisWill}
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>{t.completeWill1}</li>
            <li>{t.completeWill2}</li>
            <li>{t.completeWill3}</li>
            <li>{t.completeWill4}</li>
          </ul>
          <p className="text-sm text-red-600 font-medium">
            {t.actionCannotUndone}
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setCompleteModalOpen(false)}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              variant="success"
              onClick={() => completeMutation.mutate()}
              loading={completeMutation.isPending}
              disabled={completeMutation.isPending}
              className="flex-1"
            >
              {t.markAsCompleted}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetails;
