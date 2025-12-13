import React, { useState, useEffect } from 'react';
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

const translations = {
  en: {
    loading: 'Loading applications...',
    failedToLoad: 'Failed to load applications:',
    backToAllApplications: 'Back to All Applications',
    jobCancelled: 'Job Cancelled',
    jobCancelledMessage: 'This job has been cancelled. You can still view and unlock applicant profiles, but you cannot accept or reject applications.',
    budget: 'Budget',
    deadline: 'Deadline',
    duration: 'Duration',
    applicants: 'Applicants',
    filtersSorting: 'Filters & Sorting',
    nationality: 'Nationality',
    allNationalities: 'All Nationalities',
    experienceLevel: 'Experience Level',
    allLevels: 'All Levels',
    accountType: 'Account Type',
    allStudents: 'All Students',
    premiumOnly: 'Premium Only',
    freeOnly: 'Free Only',
    status: 'Status',
    allStatuses: 'All Statuses',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    sortBy: 'Sort By',
    applicationDate: 'Application Date',
    proposedBudget: 'Proposed Budget',
    order: 'Order',
    ascending: 'Ascending',
    descending: 'Descending',
    allApplicants: 'All Applicants',
    noApplicationsMatch: 'No applications match your filters.',
    contactLocked: 'Contact Locked',
    premiumAccount: 'Premium Account',
    proposedBudgetLabel: 'Proposed Budget',
    nationalityLabel: 'Nationality',
    applied: 'Applied',
    viewFullApplication: 'View Full Application',
    viewProfile: 'View Profile',
    accept: 'Accept',
    reject: 'Reject',
    unlock: 'Unlock (10 pts)',
    showing: 'Showing',
    to: 'to',
    of: 'of',
    results: 'results',
    page: 'Page',
    ofPages: 'of',
    previous: 'Previous',
    next: 'Next',
    fullApplicationDetails: 'Full Application Details',
    loadingApplicationDetails: 'Loading application details...',
    contactLockedTitle: 'Contact Locked',
    unlockContactToView: 'Unlock contact to view student details',
    applicationInformation: 'Application Information',
    applicationStatus: 'Application Status',
    appliedDate: 'Applied Date',
    estimatedDuration: 'Estimated Duration',
    notSpecified: 'Not specified',
    proposalType: 'Proposal Type',
    availabilityCommitment: 'Availability Commitment',
    applicationNumber: 'Application Number',
    approachMethodology: 'Approach & Methodology',
    methodology: 'Methodology',
    deliveryFrequency: 'Delivery Frequency',
    numberOfRevisions: 'Number of Revisions',
    communicationPreference: 'Communication Preference',
    proposalMessage: 'Proposal Message',
    coverLetter: 'Cover Letter',
    whyChooseMe: 'Why Choose Me',
    relevantExperience: 'Relevant Experience',
    portfolio: 'Portfolio',
    viewPortfolioItem: 'View Portfolio Item',
    attachments: 'Attachments',
    unlockContact: 'Unlock Contact (10 pts)',
    viewStudentProfile: 'View Student Profile',
    acceptApplication: 'Accept Application',
    rejectApplication: 'Reject Application',
    insufficientPoints: 'Insufficient Points',
    notEnoughPoints: 'Not Enough Points',
    needPointsMessage: 'You need 10 points to unlock a student\'s contact information.',
    unlockStudentProfiles: 'Unlock Student Profiles',
    purchasePointsMessage: 'Purchase points to unlock student contact information and access their full profiles.',
    buyPoints: 'Buy Points',
    cancel: 'Cancel',
    unlockSuccess: 'Student contact unlocked successfully!',
    unlockFailed: 'Failed to unlock contact',
    unlockConfirm: 'Unlock this student\'s contact for 10 points?',
    acceptSuccess: 'Application accepted! The student has been notified that they can be contacted to discuss the project.',
    acceptConfirm: 'Accept this application? The student will be notified that they can be contacted to discuss the project.',
    acceptFailed: 'Failed to accept application',
    rejectSuccess: 'Application rejected. The student has been notified.',
    rejectConfirm: 'Reject this application? The student will be notified.',
    rejectFailed: 'Failed to reject application',
  },
  it: {
    loading: 'Caricamento candidature...',
    failedToLoad: 'Impossibile caricare le candidature:',
    backToAllApplications: 'Torna a Tutte le Candidature',
    jobCancelled: 'Lavoro Annullato',
    jobCancelledMessage: 'Questo lavoro è stato annullato. Puoi ancora visualizzare e sbloccare i profili dei candidati, ma non puoi accettare o rifiutare le candidature.',
    budget: 'Budget',
    deadline: 'Scadenza',
    duration: 'Durata',
    applicants: 'Candidati',
    filtersSorting: 'Filtri e Ordinamento',
    nationality: 'Nazionalità',
    allNationalities: 'Tutte le Nazionalità',
    experienceLevel: 'Livello di Esperienza',
    allLevels: 'Tutti i Livelli',
    accountType: 'Tipo di Account',
    allStudents: 'Tutti gli Studenti',
    premiumOnly: 'Solo Premium',
    freeOnly: 'Solo Gratuito',
    status: 'Stato',
    allStatuses: 'Tutti gli Stati',
    pending: 'In Attesa',
    accepted: 'Accettata',
    rejected: 'Rifiutata',
    sortBy: 'Ordina Per',
    applicationDate: 'Data Candidatura',
    proposedBudget: 'Budget Proposto',
    order: 'Ordine',
    ascending: 'Crescente',
    descending: 'Decrescente',
    allApplicants: 'Tutti i Candidati',
    noApplicationsMatch: 'Nessuna candidatura corrisponde ai tuoi filtri.',
    contactLocked: 'Contatto Bloccato',
    premiumAccount: 'Account Premium',
    proposedBudgetLabel: 'Budget Proposto',
    nationalityLabel: 'Nazionalità',
    applied: 'Candidato',
    viewFullApplication: 'Visualizza Candidatura Completa',
    viewProfile: 'Visualizza Profilo',
    accept: 'Accetta',
    reject: 'Rifiuta',
    unlock: 'Sblocca (10 punti)',
    showing: 'Mostra',
    to: 'a',
    of: 'di',
    results: 'risultati',
    page: 'Pagina',
    ofPages: 'di',
    previous: 'Precedente',
    next: 'Successivo',
    fullApplicationDetails: 'Dettagli Completi Candidatura',
    loadingApplicationDetails: 'Caricamento dettagli candidatura...',
    contactLockedTitle: 'Contatto Bloccato',
    unlockContactToView: 'Sblocca il contatto per visualizzare i dettagli dello studente',
    applicationInformation: 'Informazioni Candidatura',
    applicationStatus: 'Stato Candidatura',
    appliedDate: 'Data Candidatura',
    estimatedDuration: 'Durata Stimata',
    notSpecified: 'Non specificato',
    proposalType: 'Tipo di Proposta',
    availabilityCommitment: 'Impegno Disponibilità',
    applicationNumber: 'Numero Candidatura',
    approachMethodology: 'Approccio e Metodologia',
    methodology: 'Metodologia',
    deliveryFrequency: 'Frequenza di Consegna',
    numberOfRevisions: 'Numero di Revisioni',
    communicationPreference: 'Preferenza di Comunicazione',
    proposalMessage: 'Messaggio di Proposta',
    coverLetter: 'Lettera di Presentazione',
    whyChooseMe: 'Perché Scegliere Me',
    relevantExperience: 'Esperienza Rilevante',
    portfolio: 'Portfolio',
    viewPortfolioItem: 'Visualizza Elemento Portfolio',
    attachments: 'Allegati',
    unlockContact: 'Sblocca Contatto (10 punti)',
    viewStudentProfile: 'Visualizza Profilo Studente',
    acceptApplication: 'Accetta Candidatura',
    rejectApplication: 'Rifiuta Candidatura',
    insufficientPoints: 'Punti Insufficienti',
    notEnoughPoints: 'Punti Non Sufficienti',
    needPointsMessage: 'Hai bisogno di 10 punti per sbloccare le informazioni di contatto di uno studente.',
    unlockStudentProfiles: 'Sblocca Profili Studenti',
    purchasePointsMessage: 'Acquista punti per sbloccare le informazioni di contatto degli studenti e accedere ai loro profili completi.',
    buyPoints: 'Acquista Punti',
    cancel: 'Annulla',
    unlockSuccess: 'Contatto studente sbloccato con successo!',
    unlockFailed: 'Impossibile sbloccare il contatto',
    unlockConfirm: 'Sbloccare il contatto di questo studente per 10 punti?',
    acceptSuccess: 'Candidatura accettata! Lo studente è stato informato che può essere contattato per discutere il progetto.',
    acceptConfirm: 'Accettare questa candidatura? Lo studente sarà informato che può essere contattato per discutere il progetto.',
    acceptFailed: 'Impossibile accettare la candidatura',
    rejectSuccess: 'Candidatura rifiutata. Lo studente è stato informato.',
    rejectConfirm: 'Rifiutare questa candidatura? Lo studente sarà informato.',
    rejectFailed: 'Impossibile rifiutare la candidatura',
  },
};

const JobApplicationsDetail = () => {
  const { jobId } = useParams();
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
      alert(t.unlockSuccess);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || t.unlockFailed;
      
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
      alert(t.acceptSuccess);
    },
  });

  // Reject application mutation
  const rejectMutation = useMutation({
    mutationFn: (applicationId) => applicationService.rejectApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobApplications', jobId]);
      alert(t.rejectSuccess);
    },
  });

  const handleUnlock = async (applicationId) => {
    if (confirm(t.unlockConfirm)) {
      unlockMutation.mutate(applicationId);
    }
  };

  const handleBuyPoints = () => {
    setShowInsufficientPointsModal(false);
    navigate('/client/packages');
  };

  const handleAccept = async (applicationId) => {
    if (confirm(t.acceptConfirm)) {
      try {
        await acceptMutation.mutateAsync(applicationId);
      } catch (error) {
        alert(error.response?.data?.message || t.acceptFailed);
      }
    }
  };

  const handleReject = async (applicationId) => {
    if (confirm(t.rejectConfirm)) {
      try {
        await rejectMutation.mutateAsync(applicationId);
      } catch (error) {
        alert(error.response?.data?.message || t.rejectFailed);
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
    return <Loading text={t.loading} />;
  }

  if (applicationsError) {
    return (
      <Alert
        type="error"
        message={`${t.failedToLoad} ${applicationsError.response?.data?.message || applicationsError.message}`}
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
          {t.backToAllApplications}
        </Button>
      </div>

      {/* Job Cancelled Alert */}
      {job?.status === 'cancelled' && (
        <Alert
          type="info"
          title={t.jobCancelled}
          message={t.jobCancelledMessage}
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
                  <p className="text-xs text-gray-500">{t.budget}</p>
                  <p className="font-semibold">{job?.budget?.currency} {job?.budget?.min} - {job?.budget?.max}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">{t.deadline}</p>
                  <p className="font-semibold">{new Date(job?.deadline).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">{t.duration}</p>
                  <p className="font-semibold">{job?.projectDuration}</p>
                </div>
              </div>
        
            </div>
            <div className="flex items-center gap-2">
              {job?.status === 'cancelled' && <Badge variant="error">{t.rejected}</Badge>}
              {job?.status === 'completed' && <Badge variant="success">{t.accepted}</Badge>}
              {job?.status === 'open' && <Badge variant="info">{t.pending}</Badge>}
              {job?.status && !['cancelled', 'completed', 'open'].includes(job.status) && (
                <Badge variant="default">{job.status}</Badge>
              )}
              <Badge variant="info">{job?.category}</Badge>
              <Badge variant="success">{applications.length} {t.applicants}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters and Sorting */}
      <Card>
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">{t.filtersSorting}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Nationality Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.nationality}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterNationality}
              onChange={(e) => {
                setFilterNationality(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.allNationalities}</option>
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
              {t.experienceLevel}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterExperience}
              onChange={(e) => {
                setFilterExperience(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.allLevels}</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Subscription Tier Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.accountType}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterPremium}
              onChange={(e) => {
                setFilterPremium(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.allStudents}</option>
              <option value="premium">{t.premiumOnly}</option>
              <option value="free">{t.freeOnly}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.status}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.allStatuses}</option>
              <option value="pending">{t.pending}</option>
              <option value="accepted">{t.accepted}</option>
              <option value="rejected">{t.rejected}</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.sortBy}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="createdAt">{t.applicationDate}</option>
              <option value="proposedBudget">{t.proposedBudget}</option>
              <option value="relevantExperienceLevel">{t.experienceLevel}</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.order}
            </label>
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <SortIcon className="w-4 h-4" />
              {sortOrder === 'asc' ? t.ascending : t.descending}
            </button>
          </div>
        </div>
      </Card>

      {/* Applications List */}
      <Card title={`${t.allApplicants} (${totalCount})`}>
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t.noApplicationsMatch}</p>
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
                              <p className="text-gray-500">{t.contactLocked}</p>
                              {isPremium && (
                                <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                                  <Crown className="w-3 h-3" />
                                  {t.premiumAccount}
                                </Badge>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">{t.proposedBudgetLabel}</p>
                          <p className="font-bold text-green-600 text-lg">
                            {application.proposedBudget?.currency} {application.proposedBudget?.amount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t.duration}</p>
                          <p className="font-semibold">{application.estimatedDuration}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t.experienceLevel}</p>
                          <Badge variant="info">
                            {application.relevantExperienceLevel || t.notSpecified}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t.nationalityLabel}</p>
                          <p className="font-semibold">{student?.nationality || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={
                          application.status === 'pending' ? 'info' :
                          application.status === 'accepted' ? 'success' :
                          application.status === 'rejected' ? 'error' : 'default'
                        }>
                          {application.status === 'pending' ? t.pending :
                           application.status === 'accepted' ? t.accepted :
                           application.status === 'rejected' ? t.rejected :
                           application.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {t.applied} {new Date(application.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
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
                        {t.viewFullApplication}
                      </Button>
                      
                      {isUnlocked ? (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/client/students/${student?._id}`)}
                          >
                            <User className="w-4 h-4 mr-2" />
                            {t.viewProfile}
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
                                {t.accept}
                              </Button>
                              <Button
                                variant="error"
                                size="sm"
                                onClick={() => handleReject(application._id)}
                                loading={rejectMutation.isPending}
                              >
                                {t.reject}
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
                          {t.unlock}
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
              {t.showing} {(page - 1) * limit + 1} {t.to} {Math.min(page * limit, totalCount)} {t.of}{' '}
              {totalCount} {t.results}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                {t.previous}
              </Button>
              <span className="px-4 py-2 text-sm font-medium">
                {t.page} {page} {t.ofPages} {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
              >
                {t.next}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Full Application View Modal */}
      <Modal
        isOpen={showFullViewModal}
        onClose={handleCloseFullViewModal}
        title={t.fullApplicationDetails}
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
                            {isUnlocked ? (fullStudent?.name || 'Student') : t.contactLockedTitle}
                          </h3>
                          {isPremium && (
                            <Badge variant="warning" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                              <Crown className="w-3 h-3" />
                              {t.premiumAccount}
                            </Badge>
                          )}
                        </div>
                        {isUnlocked ? (
                          <>
                            <p className="text-gray-600 mb-1">{fullStudent?.email}</p>
                            <p className="text-sm text-gray-500">
                              {fullStudent?.nationality && `${t.nationalityLabel}: ${fullStudent.nationality}`}
                              {fullStudent?.age && ` • ${t.applied}: ${fullStudent.age}`}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-500">{t.unlockContactToView}</p>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Application Details */}
                  <Card>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {t.applicationInformation}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{t.applicationStatus}</p>
                        <Badge
                          variant={
                            fullApp.status === 'pending' ? 'info' :
                            fullApp.status === 'accepted' ? 'success' :
                            fullApp.status === 'rejected' ? 'error' : 'default'
                          }
                        >
                          {fullApp.status === 'pending' ? t.pending :
                           fullApp.status === 'accepted' ? t.accepted :
                           fullApp.status === 'rejected' ? t.rejected :
                           fullApp.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.appliedDate}</p>
                        <p className="font-semibold">
                          {new Date(fullApp.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.proposedBudgetLabel}</p>
                        <p className="font-semibold text-green-600 text-lg">
                          {fullApp.proposedBudget?.currency} {fullApp.proposedBudget?.amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.estimatedDuration}</p>
                        <p className="font-semibold">{fullApp.estimatedDuration || t.notSpecified}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.experienceLevel}</p>
                        <p className="font-semibold">
                          {fullApp.relevantExperienceLevel || t.notSpecified}
                        </p>
                      </div>
                      {fullApp.proposalType && (
                        <div>
                          <p className="text-sm text-gray-500">{t.proposalType}</p>
                          <Badge variant="info">
                            {fullApp.proposalType.charAt(0).toUpperCase() + fullApp.proposalType.slice(1)}
                          </Badge>
                        </div>
                      )}
                      {fullApp.availabilityCommitment && (
                        <div>
                          <p className="text-sm text-gray-500">{t.availabilityCommitment}</p>
                          <p className="font-semibold">{fullApp.availabilityCommitment}</p>
                        </div>
                      )}
                      {fullApp.applicationNumber && (
                        <div>
                          <p className="text-sm text-gray-500">{t.applicationNumber}</p>
                          <p className="font-semibold">{fullApp.applicationNumber}</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Approach & Methodology */}
                  {fullApp.approachSelections && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-4">{t.approachMethodology}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fullApp.approachSelections.methodology && (
                          <div>
                            <p className="text-sm text-gray-500">{t.methodology}</p>
                            <p className="font-semibold">{fullApp.approachSelections.methodology}</p>
                          </div>
                        )}
                        {fullApp.approachSelections.deliveryFrequency && (
                          <div>
                            <p className="text-sm text-gray-500">{t.deliveryFrequency}</p>
                            <p className="font-semibold">{fullApp.approachSelections.deliveryFrequency}</p>
                          </div>
                        )}
                        {fullApp.approachSelections.revisions !== undefined && (
                          <div>
                            <p className="text-sm text-gray-500">{t.numberOfRevisions}</p>
                            <p className="font-semibold">{fullApp.approachSelections.revisions}</p>
                          </div>
                        )}
                        {fullApp.approachSelections.communicationPreference && (
                          <div>
                            <p className="text-sm text-gray-500">{t.communicationPreference}</p>
                            <p className="font-semibold">{fullApp.approachSelections.communicationPreference}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Proposal Message */}
                  {fullApp.proposalText && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">{t.proposalMessage}</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullApp.proposalText}</p>
                    </Card>
                  )}

                  {/* Cover Letter */}
                  {fullApp.coverLetter && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">{t.coverLetter}</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullApp.coverLetter}</p>
                    </Card>
                  )}

                  {/* Why Choose Me */}
                  {fullApp.whyChooseMe && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">{t.whyChooseMe}</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{fullApp.whyChooseMe}</p>
                    </Card>
                  )}

                  {/* Relevant Experience */}
                  {fullApp.relevantExperience && fullApp.relevantExperience.length > 0 && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-3">{t.relevantExperience}</h4>
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
                      <h4 className="font-bold text-gray-900 mb-3">{t.portfolio}</h4>
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
                                {t.viewPortfolioItem}
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
                      <h4 className="font-bold text-gray-900 mb-3">{t.attachments}</h4>
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
                        {t.unlockContact}
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
                        {t.viewStudentProfile}
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
                          {t.acceptApplication}
                        </Button>
                        <Button
                          variant="error"
                          onClick={() => {
                            handleReject(fullApp._id);
                            handleCloseFullViewModal();
                          }}
                          loading={rejectMutation.isPending}
                        >
                          {t.rejectApplication}
                        </Button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <Loading text={t.loadingApplicationDetails} />
        )}
      </Modal>

      {/* Insufficient Points Modal */}
      <Modal
        isOpen={showInsufficientPointsModal}
        onClose={() => setShowInsufficientPointsModal(false)}
        title={t.insufficientPoints}
        size="md"
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <Lock className="h-8 w-8 text-yellow-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t.notEnoughPoints}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {insufficientPointsMessage || t.needPointsMessage}
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
                  {t.unlockStudentProfiles}
                </p>
                <p className="text-sm text-blue-700">
                  {t.purchasePointsMessage}
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
              {t.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={handleBuyPoints}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              {t.buyPoints}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobApplicationsDetail;
