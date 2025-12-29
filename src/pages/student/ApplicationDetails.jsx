import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../../services/applicationService';
import { authService } from '../../services/authService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Clock,
  Briefcase,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Unlock,
} from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading application details...',
    applicationNotFound: 'Application not found',
    backToApplications: 'Back to Applications',
    applicationWithdrawnSuccess: 'Application withdrawn successfully',
    withdrawFailed: 'Failed to withdraw application',
    withdrawConfirm: 'Are you sure you want to withdraw this application? This action cannot be undone.',
    applicationDetails: 'Application Details',
    applicationId: 'Application ID:',
    contactUnlockedByClient: 'Contact Unlocked by Client',
    contactUnlockedMessage: 'Great news! The client has unlocked your contact information. They are interested in your application and may reach out to you directly.',
    premiumMembersOnly: 'Premium members only - Upgrade to premium to see if the client has unlocked your contact information.',
    pendingMessage: 'Your application is pending review. The client will review it soon.',
    acceptedMessage: 'Congratulations! Your application has been accepted. The client will contact you soon.',
    rejectedMessage: 'Unfortunately, your application was not accepted for this job.',
    withdrawnMessage: 'This application has been withdrawn.',
    jobWithdrawnMessage: 'This job was withdrawn by the client. Your application has been automatically withdrawn.',
    applicationWithdrawnReason: 'Application withdrawn:',
    clientFeedback: 'Client Feedback',
    received: 'Received:',
    appliedOn: 'Applied On',
    lastUpdated: 'Last Updated',
    reviewedOn: 'Reviewed On',
    jobDetails: 'Job Details',
    viewFullJob: 'View Full Job',
    upgradeToPremiumEmail: 'Upgrade to Premium to see Client Email',
    urgent: 'Urgent',
    jobBudget: 'Job Budget',
    premiumMembersOnlyBudget: 'Premium members only',
    duration: 'Duration',
    posted: 'Posted',
    description: 'Description',
    skillsRequired: 'Skills Required',
    yourProposal: 'Your Proposal',
    proposalType: 'Proposal Type',
    standard: 'Standard',
    yourProposedBudget: 'Your Proposed Budget',
    estimatedDuration: 'Estimated Duration',
    availabilityCommitment: 'Availability Commitment',
    approachMethodology: 'Approach & Methodology',
    methodology: 'Methodology',
    deliveryFrequency: 'Delivery Frequency',
    numberOfRevisions: 'Number of Revisions',
    communicationPreference: 'Communication Preference',
    relevantExperienceLevel: 'Relevant Experience Level',
    backToAllApplications: 'Back to All Applications',
    viewFullJobDetails: 'View Full Job Details',
    withdrawApplication: 'Withdraw Application',
    pendingReview: 'Pending Review',
    reviewed: 'Reviewed',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  },
  it: {
    loading: 'Caricamento dettagli candidatura...',
    applicationNotFound: 'Candidatura non trovata',
    backToApplications: 'Torna alle Candidature',
    applicationWithdrawnSuccess: 'Candidatura ritirata con successo',
    withdrawFailed: 'Impossibile ritirare la candidatura',
    withdrawConfirm: 'Sei sicuro di voler ritirare questa candidatura? Questa azione non può essere annullata.',
    applicationDetails: 'Dettagli Candidatura',
    applicationId: 'ID Candidatura:',
    contactUnlockedByClient: 'Contatto Sbloccato dal Cliente',
    contactUnlockedMessage: 'Ottime notizie! Il cliente ha sbloccato le tue informazioni di contatto. È interessato alla tua candidatura e potrebbe contattarti direttamente.',
    premiumMembersOnly: 'Solo membri premium - Passa a premium per vedere se il cliente ha sbloccato le tue informazioni di contatto.',
    pendingMessage: 'La tua candidatura è in attesa di revisione. Il cliente la esaminerà presto.',
    acceptedMessage: 'Congratulazioni! La tua candidatura è stata accettata. Il cliente ti contatterà presto.',
    rejectedMessage: 'Sfortunatamente, la tua candidatura non è stata accettata per questo lavoro.',
    withdrawnMessage: 'Questa candidatura è stata ritirata.',
    jobWithdrawnMessage: 'Questo lavoro è stato ritirato dal cliente. La tua candidatura è stata automaticamente ritirata.',
    applicationWithdrawnReason: 'Candidatura ritirata:',
    clientFeedback: 'Feedback del Cliente',
    received: 'Ricevuto:',
    appliedOn: 'Candidato il',
    lastUpdated: 'Ultimo Aggiornamento',
    reviewedOn: 'Revisionato il',
    jobDetails: 'Dettagli Lavoro',
    viewFullJob: 'Visualizza Lavoro Completo',
    upgradeToPremiumEmail: 'Passa a Premium per vedere l\'Email del Cliente',
    urgent: 'Urgente',
    jobBudget: 'Budget Lavoro',
    premiumMembersOnlyBudget: 'Solo membri premium',
    duration: 'Durata',
    posted: 'Pubblicato',
    description: 'Descrizione',
    skillsRequired: 'Competenze Richieste',
    yourProposal: 'La Tua Proposta',
    proposalType: 'Tipo di Proposta',
    standard: 'Standard',
    yourProposedBudget: 'Il Tuo Budget Proposto',
    estimatedDuration: 'Durata Stimata',
    availabilityCommitment: 'Impegno di Disponibilità',
    approachMethodology: 'Approccio e Metodologia',
    methodology: 'Metodologia',
    deliveryFrequency: 'Frequenza di Consegna',
    numberOfRevisions: 'Numero di Revisioni',
    communicationPreference: 'Preferenza di Comunicazione',
    relevantExperienceLevel: 'Livello di Esperienza Rilevante',
    backToAllApplications: 'Torna a Tutte le Candidature',
    viewFullJobDetails: 'Visualizza Dettagli Lavoro Completi',
    withdrawApplication: 'Ritira Candidatura',
    pendingReview: 'In Attesa di Revisione',
    reviewed: 'Revisionato',
    accepted: 'Accettato',
    rejected: 'Rifiutato',
    withdrawn: 'Ritirato',
  },
};

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  // Fetch application details
  const { data: applicationData, isLoading } = useQuery({
    queryKey: ['application', id],
    queryFn: () => applicationService.getApplication(id),
  });

  // Fetch current user to check premium status
  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authService.getMe(),
  });

  // Withdraw application mutation
  const withdrawMutation = useMutation({
    mutationFn: () => applicationService.withdrawApplication(id),
    onSuccess: () => {
      // Invalidate all relevant queries to refresh the UI
      queryClient.invalidateQueries(['application', id]);
      queryClient.invalidateQueries(['myApplications']);
      queryClient.invalidateQueries(['jobs']);
      queryClient.invalidateQueries(['user']); // Refresh user data to update appliedJobs
      queryClient.invalidateQueries(['currentUser']); // Refresh current user data to update appliedJobs
      queryClient.invalidateQueries(['applicationStatus']); // Refresh application status check
      queryClient.invalidateQueries(['appliedJobs']); // Refresh applied jobs list
      alert(t.applicationWithdrawnSuccess);
      navigate('/student/applications');
    },
    onError: (error) => {
      alert(error.response?.data?.message || t.withdrawFailed);
    },
  });

  const handleWithdraw = () => {
    if (window.confirm(t.withdrawConfirm)) {
      withdrawMutation.mutate();
    }
  };

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  const application = applicationData?.data?.application;

  // Check if user is premium
  const studentProfile = userData?.data?.user?.studentProfile;
  const isPremium = studentProfile?.subscriptionTier === 'premium';

  if (!application) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <p className="text-sm sm:text-base text-gray-600">{t.applicationNotFound}</p>
        <Button onClick={() => navigate('/student/applications')} className="mt-3 sm:mt-4 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5">
          {t.backToApplications}
        </Button>
      </div>
    );
  }

  const job = application.jobPost;
  const canWithdraw = application.status === 'pending' || application.status === 'reviewed';

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'info', label: t.pendingReview, icon: Clock },
      reviewed: { variant: 'warning', label: t.reviewed, icon: Eye },
      accepted: { variant: 'success', label: t.accepted, icon: CheckCircle },
      rejected: { variant: 'error', label: t.rejected, icon: XCircle },
      withdrawn: { variant: 'default', label: t.withdrawn, icon: AlertCircle },
    };
    const config = statusConfig[status] || { variant: 'default', label: status, icon: FileText };
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <Badge variant={config.variant} className="text-xs sm:text-sm">{config.label}</Badge>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/applications')}
        className="flex items-center gap-1.5 sm:gap-2 text-primary-600 hover:text-primary-700 mb-4 sm:mb-6 text-sm sm:text-base"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        {t.backToApplications}
      </button>

      {/* Application Header */}
      <Card className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">{t.applicationDetails}</h1>
            <p className="text-xs sm:text-sm text-gray-600 break-all">{t.applicationId} {application._id}</p>
          </div>
          <div className="flex flex-col sm:flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
            {getStatusBadge(application.status)}
            {/* Contact Unlocked Indicator */}
            {application.contactUnlockedByClient === true && (
              <Badge variant="success" className="flex items-center gap-1 text-xs sm:text-sm">
                <Unlock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{t.contactUnlockedByClient}</span>
                <span className="sm:hidden">Unlocked</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Contact Unlocked Alert */}
        {application.contactUnlockedByClient === true && (
          <Alert
            type="success"
            message={t.contactUnlockedMessage}
            className="mb-4"
          />
        )}

        {/* Premium Members Only Message */}
        {application.contactUnlockedByClient === 'premium members only' && (
          <Alert
            type="info"
            message={t.premiumMembersOnly}
            className="mb-4"
          />
        )}

        {/* Status Messages */}
        {application.status === 'pending' && (
          <Alert
            type="info"
            message={t.pendingMessage}
            className="mb-4"
          />
        )}
        {application.status === 'accepted' && (
          <Alert
            type="success"
            message={t.acceptedMessage}
            className="mb-4"
          />
        )}
        {application.status === 'rejected' && (
          <Alert
            type="error"
            message={t.rejectedMessage}
            className="mb-4"
          />
        )}
        {application.status === 'withdrawn' && (
          <Alert
            type="warning"
            message={
              application.withdrawalReason === 'Job was withdrawn by client'
                ? t.jobWithdrawnMessage
                : application.withdrawalReason
                ? `${t.applicationWithdrawnReason} ${application.withdrawalReason}`
                : t.withdrawnMessage
            }
            className="mb-4"
          />
        )}

        {/* Job Withdrawn Flag - Show even if application is accepted or rejected */}
        {job && job.status === 'cancelled' && (
          <Alert
            type="warning"
            message={t.jobWithdrawnMessage}
            className="mb-4"
          />
        )}

        {/* Client Feedback */}
        {application.clientFeedback && (
          <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 flex items-center gap-1.5 sm:gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              {t.clientFeedback}
            </h3>
            <p className="text-sm sm:text-base text-blue-800">{application.clientFeedback.message}</p>
            {application.clientFeedback.timestamp && (
              <p className="text-xs sm:text-sm text-blue-600 mt-2">
                {t.received} {new Date(application.clientFeedback.timestamp).toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}
              </p>
            )}
          </div>
        )}

        {/* Application Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 mb-1">{t.appliedOn}</p>
            <p className="font-semibold text-gray-900">
              {new Date(application.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(application.createdAt).toLocaleTimeString(language === 'it' ? 'it-IT' : 'en-US')}
            </p>
          </div>
          {application.updatedAt && application.updatedAt !== application.createdAt && (
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.lastUpdated}</p>
              <p className="font-semibold text-gray-900">
                {new Date(application.updatedAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(application.updatedAt).toLocaleTimeString(language === 'it' ? 'it-IT' : 'en-US')}
              </p>
            </div>
          )}
          {application.reviewedAt && (
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.reviewedOn}</p>
              <p className="font-semibold text-gray-900">
                {new Date(application.reviewedAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Job Details */}
      {job && (
        <Card className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t.jobDetails}</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/student/jobs/${job._id}`)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 w-full sm:w-auto"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              {t.viewFullJob}
            </Button>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{job.title}</h3>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 mb-3 sm:mb-4">
              {/* Client Email - Only for Premium Users */}
              {isPremium && job.client && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-5 h-5" />
                  {job.client.clientProfile?.companyEmail || job.client.email}
                </span>
              )}

              {/* Premium Upgrade Message for Free Users */}
              {!isPremium && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-sm text-gray-500 italic">
                    {t.upgradeToPremiumEmail}
                  </span>
                </span>
              )}

              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  {job.location}
                </span>
              )}
              {job.category && <Badge variant="info">{job.category}</Badge>}
              {job.urgent && <Badge variant="error">{t.urgent}</Badge>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              {/* Job Budget - Only for Premium Users */}
              {isPremium && job.budget && !job.budget.message ? (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.jobBudget}</p>
                  <div className="flex items-center gap-1 font-semibold text-sm sm:text-base text-gray-900">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">{job.budget.currency} {job.budget.min} - {job.budget.max}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.jobBudget}</p>
                  <div className="flex items-center gap-1 font-semibold text-xs sm:text-sm text-gray-400">
                    <span className="italic">{job.budget?.message || t.premiumMembersOnlyBudget}</span>
                  </div>
                </div>
              )}

              {job.duration && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.duration}</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">{job.duration}</p>
                </div>
              )}
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.posted}</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">
                  {new Date(job.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 sm:mb-2">{t.description}</h4>
              <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line line-clamp-4">{job.description}</p>
            </div>

            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 sm:mb-2">{t.skillsRequired}</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {job.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 bg-primary-50 text-primary-700 rounded-lg text-xs sm:text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Your Proposal */}
      <Card className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{t.yourProposal}</h2>

        <div className="space-y-4 sm:space-y-6">
          {/* Proposal Type and Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1.5 sm:mb-2">{t.proposalType}</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 text-primary-700 rounded-lg text-xs sm:text-sm font-medium">
                  {application.proposalType?.charAt(0).toUpperCase() + application.proposalType?.slice(1) || t.standard}
                </span>
              </div>
            </div>

            {application.proposedBudget && (
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1.5 sm:mb-2">{t.yourProposedBudget}</h3>
                <div className="flex items-center gap-1 text-xl sm:text-2xl font-bold text-green-600">
                  {application.proposedBudget.amount}
                  {application.proposedBudget.currency && (
                    <span className="text-base sm:text-lg"> {application.proposedBudget.currency}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Duration and Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {application.estimatedDuration && (
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1.5 sm:mb-2">{t.estimatedDuration}</h3>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{application.estimatedDuration}</p>
              </div>
            )}

            {application.availabilityCommitment && (
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1.5 sm:mb-2">{t.availabilityCommitment}</h3>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{application.availabilityCommitment}</p>
              </div>
            )}
          </div>

          {/* Approach Selections */}
          {application.approachSelections && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{t.approachMethodology}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {application.approachSelections.methodology && (
                  <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.methodology}</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{application.approachSelections.methodology}</p>
                  </div>
                )}

                {application.approachSelections.deliveryFrequency && (
                  <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.deliveryFrequency}</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{application.approachSelections.deliveryFrequency}</p>
                  </div>
                )}

                {application.approachSelections.revisions !== undefined && (
                  <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.numberOfRevisions}</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{application.approachSelections.revisions}</p>
                  </div>
                )}

                {application.approachSelections.communicationPreference && (
                  <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.communicationPreference}</p>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{application.approachSelections.communicationPreference}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience Level */}
          {application.relevantExperienceLevel && (
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1.5 sm:mb-2">{t.relevantExperienceLevel}</h3>
              <p className="text-sm sm:text-base text-gray-900 font-medium">{application.relevantExperienceLevel}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/student/applications')}
            className="flex-1 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
          >
            {t.backToAllApplications}
          </Button>

          {job && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/student/jobs/${job._id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              {t.viewFullJobDetails}
            </Button>
          )}

          {canWithdraw && (
            <Button
              variant="outline"
              onClick={handleWithdraw}
              loading={withdrawMutation.isPending}
              disabled={withdrawMutation.isPending}
              className="flex-1 text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5"
            >
              {t.withdrawApplication}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApplicationDetails;
