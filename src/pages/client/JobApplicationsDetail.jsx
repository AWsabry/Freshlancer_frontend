import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { categoryService } from '../../services/categoryService';
import { contractService } from '../../services/contractService';
import { useToast } from '../../contexts/ToastContext';
import { translateError } from '../../utils/errorTranslations';
import { getUniversityName, getUniversityId } from '../../utils/universityHelpers';
import { clientJobApplicationsDetailAr } from '../../locales/clientJobApplicationsDetailAr';
import { getDashboardDateLocale } from '../../utils/dashboardLocale';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { API_BASE_URL } from '../../config/env';
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
  LayoutGrid,
  List,
  ListChecks,
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
    noDeadlineSettled: 'No deadline settled',
    duration: 'Duration',
    applicants: 'Applicants',
    filtersSorting: 'Filters & Sorting',
    nationality: 'Nationality',
    allNationalities: 'All Nationalities',
    university: 'University',
    allUniversities: 'All Universities',
    experienceLevel: 'Experience Level',
    allLevels: 'All Levels',
    accountType: 'Account Type',
    allStudents: 'All Students',
    premiumOnly: '👑 Premium Only',
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
    confirmUnlock: 'Confirm Unlock',
    acceptSuccess: 'Application accepted! The student has been notified that they can be contacted to discuss the project.',
    acceptConfirm: 'Accept this application? The student will be notified that they can be contacted to discuss the project.',
    confirmAccept: 'Confirm Accept',
    acceptFailed: 'Failed to accept application',
    rejectSuccess: 'Application rejected. The student has been notified.',
    rejectConfirm: 'Reject this application? The student will be notified.',
    confirmReject: 'Confirm Reject',
    rejectFailed: 'Failed to reject application',
    jobDetails: 'Job & Category',
    jobTitle: 'Job Title',
    categoryDetails: 'Category Details',
    categoryName: 'Category',
    categoryDescription: 'Description',
    jobRequirement: 'Job Requirement',
    applicantAnswer: 'Applicant\'s Answer',
    priority: 'Priority',
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    categoryField: 'Field',
    studentInformation: 'Student Information',
    compactView: 'Compact View',
    detailedView: 'Detailed View',
    email: 'Email',
    age: 'Age',
    major: 'Major',
    graduationYear: 'Graduation Year',
    yearsOfExperience: 'Years of Experience',
    hourlyRate: 'Hourly Rate',
    skills: 'Skills',
    universityLink: 'University Link',
    bio: 'Bio',
    availability: 'Availability',
    languages: 'Languages',
    certifications: 'Certifications',
    socialLinks: 'Social Links',
  },
  it: {
    loading: 'Caricamento candidature...',
    failedToLoad: 'Impossibile caricare le candidature:',
    backToAllApplications: 'Torna a Tutte le Candidature',
    jobCancelled: 'Lavoro Annullato',
    jobCancelledMessage: 'Questo lavoro è stato annullato. Puoi ancora visualizzare e sbloccare i profili dei candidati, ma non puoi accettare o rifiutare le candidature.',
    budget: 'Budget',
    deadline: 'Scadenza',
    noDeadlineSettled: 'Nessuna scadenza stabilita',
    duration: 'Durata',
    applicants: 'Candidati',
    filtersSorting: 'Filtri e Ordinamento',
    nationality: 'Nazionalità',
    allNationalities: 'Tutte le Nazionalità',
    university: 'Università',
    allUniversities: 'Tutte le Università',
    experienceLevel: 'Livello di Esperienza',
    allLevels: 'Tutti i Livelli',
    accountType: 'Tipo di Account',
    allStudents: 'Tutti gli Studenti',
    premiumOnly: '👑 Solo Premium',
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
    confirmUnlock: 'Conferma Sblocco',
    acceptSuccess: 'Candidatura accettata! Lo studente è stato informato che può essere contattato per discutere il progetto.',
    acceptConfirm: 'Accettare questa candidatura? Lo studente sarà informato che può essere contattato per discutere il progetto.',
    confirmAccept: 'Conferma Accettazione',
    acceptFailed: 'Impossibile accettare la candidatura',
    rejectSuccess: 'Candidatura rifiutata. Lo studente è stato informato.',
    rejectConfirm: 'Rifiutare questa candidatura? Lo studente sarà informato.',
    confirmReject: 'Conferma Rifiuto',
    rejectFailed: 'Impossibile rifiutare la candidatura',
    jobDetails: 'Lavoro e Categoria',
    jobTitle: 'Titolo Lavoro',
    categoryDetails: 'Dettagli Categoria',
    categoryName: 'Categoria',
    categoryDescription: 'Descrizione',
    jobRequirement: 'Requisito Lavoro',
    applicantAnswer: 'Risposta Candidato',
    priority: 'Priorità',
    low: 'Bassa',
    normal: 'Normale',
    high: 'Alta',
    categoryField: 'Campo',
    studentInformation: 'Informazioni Studente',
    compactView: 'Vista Compatta',
    detailedView: 'Vista Dettagliata',
    email: 'Email',
    age: 'Età',
    major: 'Corso di Laurea',
    graduationYear: 'Anno di Laurea',
    yearsOfExperience: 'Anni di Esperienza',
    hourlyRate: 'Tariffa Oraria',
    skills: 'Competenze',
    universityLink: 'Link Università',
    bio: 'Biografia',
    availability: 'Disponibilità',
    languages: 'Lingue',
    certifications: 'Certificazioni',
    socialLinks: 'Link Social',
  },
  ar: clientJobApplicationsDetailAr,
};

const JobApplicationsDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
    title: '',
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

  // Helper function to get photo URL
  const getPhotoUrl = useCallback((photo) => {
    if (!photo) return null;
    
    // If it's already a full URL (starts with http), return as is
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    
    // If it's a relative path (starts with /), prepend API_BASE_URL
    if (photo.startsWith('/')) {
      return `${API_BASE_URL}${photo}`;
    }
    
    // Otherwise, prepend API_BASE_URL with a slash
    return `${API_BASE_URL}/${photo}`;
  }, []);

  // Check if photo exists and is valid (not default Firebase image)
  const hasValidPhoto = useCallback((photo) => {
    if (!photo || typeof photo !== 'string') {
      return false;
    }
    // Check if it's the default Firebase image
    const isDefaultPhoto = photo.includes('firebasestorage') && photo.includes('default.jpg');
    return !isDefaultPhoto;
  }, []);

  // State for filters and sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterNationality, setFilterNationality] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('');
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
  
  // State for image errors
  const [imageErrors, setImageErrors] = useState({});
  const [modalImageErrors, setModalImageErrors] = useState({});
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('applicationsViewMode') || 'detailed';
  });
  const [listPage, setListPage] = useState(1);
  const listLimit = 20;
  
  const handleImageError = (key) => {
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };
  
  const handleModalImageError = (key) => {
    setModalImageErrors(prev => ({ ...prev, [key]: true }));
  };

  const getMatchVariant = (score) => {
    if (typeof score !== 'number') return 'info';
    if (score >= 8) return 'success';
    if (score >= 5) return 'warning';
    return 'error';
  };

  // Fetch job details
  const { data: jobData, isLoading: loadingJob } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getJob(jobId),
  });

  // Fetch categories to label dynamic spec answers
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });

  // Fetch applications with filters
  const {
    data: applicationsData,
    isLoading: loadingApplications,
    error: applicationsError,
  } = useQuery({
    queryKey: ['jobApplications', jobId, sortBy, sortOrder, filterNationality, filterUniversity, filterExperience, filterStatus, filterPremium, page],
    queryFn: () =>
      applicationService.getJobApplications(jobId, {
        sortBy,
        sortOrder,
        nationality: filterNationality,
        university: filterUniversity,
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
      showSuccess(t.unlockSuccess);
    },
    onError: (error) => {
      let errorMessage = t.unlockFailed;
      
      if (error.response?.data?.message) {
        errorMessage = translateError(error.response.data.message, language);
      } else if (error.message) {
        errorMessage = translateError(error.message, language);
      }
      
      // Check if it's an insufficient points error
      const lowerMessage = errorMessage.toLowerCase();
      if (lowerMessage.includes('insufficient points') || 
          lowerMessage.includes('insufficienti punti') ||
          (lowerMessage.includes('need') && lowerMessage.includes('points')) ||
          (lowerMessage.includes('bisogno') && lowerMessage.includes('punti'))) {
        setInsufficientPointsMessage(errorMessage);
        setShowInsufficientPointsModal(true);
      } else {
        showError(errorMessage);
      }
    },
  });

  // Accept application mutation
  const acceptMutation = useMutation({
    mutationFn: (applicationId) => applicationService.acceptApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobApplications', jobId]);
      showSuccess(t.acceptSuccess);
    },
  });

  // Reject application mutation
  const rejectMutation = useMutation({
    mutationFn: (applicationId) => applicationService.rejectApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobApplications', jobId]);
      showSuccess(t.rejectSuccess);
    },
  });

  const createContractMutation = useMutation({
    mutationFn: (applicationId) => contractService.createFromApplication(applicationId, {}),
    onSuccess: (resp) => {
      const contractId = resp?.data?.contract?._id;
      showSuccess('Contract created');
      if (contractId) {
        navigate(`/client/contracts?contractId=${contractId}`);
      } else {
        navigate('/client/contracts');
      }
    },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create contract';
      showError(msg);
    },
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setListPage(1);
  }, [filterNationality, filterUniversity, filterExperience, filterStatus, filterPremium, sortBy, sortOrder]);

  const handleUnlock = async (applicationId) => {
    setConfirmModal({
      isOpen: true,
      message: t.unlockConfirm,
      title: t.confirmUnlock,
      onConfirm: () => {
        unlockMutation.mutate(applicationId);
      },
    });
  };

  const handleBuyPoints = () => {
    setShowInsufficientPointsModal(false);
    navigate('/client/packages');
  };

  const handleAccept = async (applicationId) => {
    setConfirmModal({
      isOpen: true,
      message: t.acceptConfirm,
      title: t.confirmAccept,
      onConfirm: async () => {
        try {
          await acceptMutation.mutateAsync(applicationId);
        } catch (error) {
          const errorMessage = error.response?.data?.message 
            ? translateError(error.response.data.message, language)
            : t.acceptFailed;
          showError(errorMessage);
        }
      },
    });
  };

  const handleReject = async (applicationId) => {
    setConfirmModal({
      isOpen: true,
      message: t.rejectConfirm,
      title: t.confirmReject,
      onConfirm: async () => {
        try {
          await rejectMutation.mutateAsync(applicationId);
        } catch (error) {
          const errorMessage = error.response?.data?.message 
            ? translateError(error.response.data.message, language)
            : t.rejectFailed;
          showError(errorMessage);
        }
      },
    });
  };

  const handleCreateContract = (applicationId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Create Contract',
      message: 'Create a contract for this accepted application?',
      onConfirm: async () => {
        try {
          await createContractMutation.mutateAsync(applicationId);
        } catch (e) {
          // handled by mutation onError
        }
      },
    });
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
  const uniqueUniversities = applicationsData?.data?.uniqueUniversities || [];
  
  // Get total count - check multiple possible locations
  const totalCount = pagination?.total || applicationsData?.data?.total || applications.length;

  const SortIcon = sortOrder === 'asc' ? SortAsc : SortDesc;

  // Pagination for list views
  const isListView = viewMode === 'list1' || viewMode === 'list2';
  const totalPages = isListView ? Math.ceil(applications.length / listLimit) : 1;
  const paginatedApplications = isListView
    ? applications.slice((listPage - 1) * listLimit, listPage * listLimit)
    : applications;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={() => navigate('/client/applications')} className="w-full sm:w-auto">
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
          <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{job?.title}</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
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
                  <p className="font-semibold">
                    {job?.deadline 
                      ? new Date(job.deadline).toLocaleDateString(getDashboardDateLocale(language))
                      : t.noDeadlineSettled
                    }
                  </p>
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
          <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">{t.filtersSorting}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 sm:gap-4">
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

          {/* University Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.university}
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterUniversity}
              onChange={(e) => {
                setFilterUniversity(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t.allUniversities}</option>
              {uniqueUniversities.map((uni) => {
                // Handle both object format { _id, name } and legacy string/ID format
                const uniId = getUniversityId(uni) || (typeof uni === 'string' ? uni : uni?._id?.toString() || uni);
                // For display, prefer name from object, fallback to 'Unknown University' instead of ID
                let uniName;
                if (typeof uni === 'object' && uni !== null && uni.name) {
                  uniName = uni.name;
                } else {
                  console.log('uni', uni);
                  uniName = getUniversityName(uni, 'Unknown University');
                }
                return (
                  <option key={uniId} value={uniId}>
                    {uniName}
                  </option>
                );
              })}
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
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{`${t.allApplicants} (${totalCount})`}</h2>
          {/* View Toggle */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white">
            <button
              onClick={() => {
                setViewMode('list1');
                setListPage(1);
                localStorage.setItem('applicationsViewMode', 'list1');
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
                localStorage.setItem('applicationsViewMode', 'list2');
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
                localStorage.setItem('applicationsViewMode', 'detailed');
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
        </div>
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t.noApplicationsMatch}</p>
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'list1' || viewMode === 'list2' 
                ? 'space-y-0' 
                : viewMode === 'detailed' 
                  ? 'space-y-0' 
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
            }>
              {paginatedApplications.map((application) => {
              const isUnlocked = application.contactUnlockedByClient;
              const student = application.student;
              const isPremium = student?.studentProfile?.subscriptionTier === 'premium';
              console.log('student?.studentProfile?.university (full data):', student?.studentProfile?.university);
              console.log('student?.studentProfile (full object):', student?.studentProfile);
              
              // Create a unique key for image error state
              const imageKey = `img-${application._id}`;

              // List View 1 - Very minimal
              if (viewMode === 'list1') {
                return (
                  <div key={application._id} className="border-b border-gray-200 py-2 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {isUnlocked ? (student?.name || 'Student') : t.contactLocked}
                          </h3>
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
                          {isPremium && (
                            <Badge variant="warning" className="text-xs">
                              <Crown className="w-2.5 h-2.5" />
                            </Badge>
                          )}
                          <Badge
                            variant={getMatchVariant(application.matchScore)}
                            className="text-xs"
                          >
                            Match: {typeof application.matchScore === 'number' ? `${application.matchScore}/10` : '—'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{application.proposedBudget?.currency} {application.proposedBudget?.amount}</span>
                          <span>•</span>
                          <span>{application.estimatedDuration || 'N/A'}</span>
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewFullApplication(application._id)}
                        className="flex items-center gap-1 text-xs flex-shrink-0"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    </div>
                  </div>
                );
              }

              // List View 2 - Slightly more info
              if (viewMode === 'list2') {
                return (
                  <div key={application._id} className="border-b border-gray-200 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-gray-900">
                            {isUnlocked ? (student?.name || 'Student') : t.contactLocked}
                          </h3>
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
                          {isPremium && (
                            <Badge variant="warning" className="text-xs">
                              <Crown className="w-2.5 h-2.5" /> Premium
                            </Badge>
                          )}
                          <Badge
                            variant={getMatchVariant(application.matchScore)}
                            className="text-xs"
                          >
                            Match: {typeof application.matchScore === 'number' ? `${application.matchScore}/10` : '—'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="text-gray-500">{t.proposedBudgetLabel}: </span>
                            <span className="font-semibold text-green-600">{application.proposedBudget?.currency} {application.proposedBudget?.amount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">{t.duration}: </span>
                            <span>{application.estimatedDuration || 'N/A'}</span>
                          </div>
                          {isUnlocked && student?.nationality && (
                            <div>
                              <span className="text-gray-500">{t.nationalityLabel}: </span>
                              <span>{student.nationality}</span>
                            </div>
                          )}
                          {isUnlocked && (
                            <div>
                              <span className="text-gray-500">{t.university}: </span>
                              <span>{getUniversityName(student?.studentProfile?.university)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewFullApplication(application._id)}
                        className="flex items-center gap-1 text-xs flex-shrink-0"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                    </div>
                  </div>
                );
              }

              // Detailed/Block View
              return (
                <div
                  key={application._id}
                  className="border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex ${viewMode === 'compact' ? 'flex-col' : 'flex-col sm:flex-row sm:items-start sm:justify-between'} gap-4`}>
                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-3 ${viewMode === 'compact' ? 'mb-2' : 'mb-3'}`}>
                        {isUnlocked ? (
                          <>
                            <div className={`${viewMode === 'compact' ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0`}>
                              {student?.photo && hasValidPhoto(student.photo) && !imageErrors[imageKey] ? (
                                <img
                                  src={getPhotoUrl(student.photo)}
                                  alt={student.name || 'Student'}
                                  className={`${viewMode === 'compact' ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover`}
                                  onError={() => handleImageError(imageKey)}
                                />
                              ) : (
                                <User className={`${viewMode === 'compact' ? 'w-5 h-5' : 'w-6 h-6'} text-primary-600`} />
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div>
                                <h3 className={`${viewMode === 'compact' ? 'text-sm' : ''} font-bold text-gray-900`}>{student?.name}</h3>
                                {viewMode === 'detailed' && (
                                  <p className="text-sm text-gray-600">{student?.email}</p>
                                )}
                              </div>
                              {isPremium && (
                                <Badge variant="warning" className={`flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300 ${viewMode === 'compact' ? 'text-xs' : ''}`}>
                                  <Crown className={`${viewMode === 'compact' ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
                                  {viewMode === 'detailed' && 'Premium Account'}
                                </Badge>
                              )}
                              <Badge
                                variant={getMatchVariant(application.matchScore)}
                                className={`${viewMode === 'compact' ? 'text-xs' : ''}`}
                              >
                                Match: {typeof application.matchScore === 'number' ? `${application.matchScore}/10` : '—'}
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <>
                            <Lock className={`${viewMode === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`${viewMode === 'compact' ? 'text-xs' : ''} text-gray-500`}>{t.contactLocked}</p>
                              {isPremium && (
                                <Badge variant="warning" className={`flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300 ${viewMode === 'compact' ? 'text-xs' : ''}`}>
                                  <Crown className={`${viewMode === 'compact' ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
                                  {viewMode === 'detailed' && t.premiumAccount}
                                </Badge>
                              )}
                              <Badge
                                variant={getMatchVariant(application.matchScore)}
                                className={`${viewMode === 'compact' ? 'text-xs' : ''}`}
                              >
                                Match: {typeof application.matchScore === 'number' ? `${application.matchScore}/10` : '—'}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>

                      {viewMode === 'detailed' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-3">
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
                        <div>
                          <p className="text-xs text-gray-500">{t.university}</p>
                          <p className="font-semibold">
                            {getUniversityName(student?.studentProfile?.university)}
                          </p>
                        </div>
                      </div>
                      )}
                      
                      {viewMode === 'compact' && (
                        <div className="flex items-center gap-3 text-sm mb-2">
                          <div>
                            <span className="text-gray-500">{t.proposedBudgetLabel}: </span>
                            <span className="font-bold text-green-600">
                              {application.proposedBudget?.currency} {application.proposedBudget?.amount}
                            </span>
                          </div>
                          {application.estimatedDuration && (
                            <div>
                              <span className="text-gray-500">{t.duration}: </span>
                              <span className="font-semibold">{application.estimatedDuration}</span>
                            </div>
                          )}
                        </div>
                      )}

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
                          {t.applied} {new Date(application.createdAt).toLocaleDateString(getDashboardDateLocale(language))}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={`flex ${viewMode === 'compact' ? 'flex-wrap gap-2' : 'flex-col sm:flex-row lg:flex-col gap-2'} w-full sm:w-auto`}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewFullApplication(application._id)}
                        className={`flex items-center gap-2 ${viewMode === 'compact' ? 'flex-1 min-w-0' : ''}`}
                      >
                        <FileText className="w-4 h-4" />
                        {viewMode === 'compact' ? <span className="text-xs">View</span> : t.viewFullApplication}
                      </Button>
                      
                      {isUnlocked ? (
                        <>
                          {viewMode === 'detailed' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/client/students/${student?._id}`)}
                            >
                              <User className="w-4 h-4 mr-2" />
                              {t.viewProfile}
                            </Button>
                          )}

                          {/* Only show Accept/Reject buttons if application is pending and job is not cancelled */}
                          {viewMode === 'detailed' && application.status === 'pending' && job?.status !== 'cancelled' && (
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

                          {viewMode === 'detailed' && application.status === 'accepted' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateContract(application._id)}
                              loading={createContractMutation.isPending}
                            >
                              Create Contract
                            </Button>
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

            {/* Pagination for List Views */}
            {isListView && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing {(listPage - 1) * listLimit + 1} to {Math.min(listPage * listLimit, applications.length)} of {applications.length} applications
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

        {/* Pagination for Detailed View */}
        {!isListView && pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              {t.showing} {(page - 1) * limit + 1} {t.to} {Math.min(page * limit, totalCount)} {t.of}{' '}
              {totalCount} {t.results}
            </p>
            <div className="flex gap-2 w-full sm:w-auto justify-center">
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
              const modalImageKey = `modal-img-${fullApp._id}`;
              const categoriesList =
                categoriesData?.data?.categories || categoriesData?.categories || [];
              const fullJobCategoryName = fullApp.jobPost?.category;
              const category =
                fullJobCategoryName
                  ? categoriesList.find((c) => c.name === fullJobCategoryName) || null
                  : null;
              const specDefs = Array.isArray(category?.specs) ? category.specs : [];
              const categorySpecAnswers =
                fullApp?.categorySpecAnswers && typeof fullApp.categorySpecAnswers === 'object'
                  ? fullApp.categorySpecAnswers
                  : {};
              const jobSpecReqs = fullApp.jobPost?.categorySpecRequirements && typeof fullApp.jobPost.categorySpecRequirements === 'object'
                ? fullApp.jobPost.categorySpecRequirements
                : {};
              const applicationSpecs = specDefs.filter((s) => s.useInApplication);
              const applicationSpecsOrdered = [...applicationSpecs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
              const categorySpecAnswerKeys = Object.keys(categorySpecAnswers || {});
              const categorySpecAnswerKeysOrdered = categorySpecAnswerKeys.slice().sort();

              const prettySpecKey = (key) => {
                if (!key) return '';
                const normalized = String(key).replace(/[_-]+/g, ' ').trim();
                if (!normalized) return String(key);
                return normalized.replace(/\b\w/g, (c) => c.toUpperCase());
              };

              const formatSpecValue = (val) => {
                if (val === undefined || val === null || val === '') return '—';
                if (typeof val === 'boolean') return val ? 'Yes' : 'No';
                if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : '—';
                return String(val);
              };

              return (
                <>
                  <div className="flex justify-end">
                    <Badge
                      variant={getMatchVariant(fullApp.matchScore)}
                      className="text-base sm:text-lg px-4 py-1.5"
                    >
                      {typeof fullApp.matchScore === 'number'
                        ? `Match: ${fullApp.matchScore}/10`
                        : 'Match: —'}
                    </Badge>
                  </div>

                  {/* Student Info Section */}
                  <Card>
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {t.studentInformation || 'Student Information'}
                    </h4>
                    <div className="flex items-start gap-4 mb-4">
                      {isUnlocked && fullStudent?.photo && hasValidPhoto(fullStudent.photo) && !modalImageErrors[modalImageKey] ? (
                        <div className="relative w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <img
                            src={getPhotoUrl(fullStudent.photo)}
                            alt={fullStudent.name || 'Student'}
                            className="w-20 h-20 rounded-full object-cover"
                            onError={() => handleModalImageError(modalImageKey)}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
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
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-500">{t.email || 'Email'}</p>
                              <p className="font-semibold text-gray-900">{fullStudent?.email || t.notSpecified}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {fullStudent?.nationality && (
                                <div>
                                  <p className="text-sm text-gray-500">{t.nationalityLabel}</p>
                                  <p className="font-semibold">{fullStudent.nationality}</p>
                                </div>
                              )}
                              {fullStudent?.age && (
                                <div>
                                  <p className="text-sm text-gray-500">{t.age || 'Age'}</p>
                                  <p className="font-semibold">{fullStudent.age}</p>
                                </div>
                              )}
                              {(() => {
                                const universityName = getUniversityName(fullStudent?.studentProfile?.university, null);
                                return universityName ? (
                                  <div>
                                    <p className="text-sm text-gray-500">{t.university}</p>
                                    <p className="font-semibold">{universityName}</p>
                                  </div>
                                ) : null;
                              })()}
                              {fullStudent?.studentProfile?.major && (
                                <div>
                                  <p className="text-sm text-gray-500">{t.major || 'Major'}</p>
                                  <p className="font-semibold">{fullStudent.studentProfile.major}</p>
                                </div>
                              )}
                              {fullStudent?.studentProfile?.graduationYear && (
                                <div>
                                  <p className="text-sm text-gray-500">{t.graduationYear || 'Graduation Year'}</p>
                                  <p className="font-semibold">{fullStudent.studentProfile.graduationYear}</p>
                                </div>
                              )}
                              {fullStudent?.studentProfile?.experienceLevel && (
                                <div>
                                  <p className="text-sm text-gray-500">{t.experienceLevel}</p>
                                  <p className="font-semibold">{fullStudent.studentProfile.experienceLevel}</p>
                                </div>
                              )}
                              {fullStudent?.studentProfile?.yearsOfExperience !== undefined && (
                                <div>
                                  <p className="text-sm text-gray-500">{t.yearsOfExperience || 'Years of Experience'}</p>
                                  <p className="font-semibold">{fullStudent.studentProfile.yearsOfExperience} {fullStudent.studentProfile.yearsOfExperience === 1 ? 'year' : 'years'}</p>
                                </div>
                              )}
                              {fullStudent?.studentProfile?.hourlyRate && (
                                <div>
                                  <p className="text-sm text-gray-500">{t.hourlyRate || 'Hourly Rate'}</p>
                                  <p className="font-semibold">
                                    {fullStudent.studentProfile.hourlyRate.min && fullStudent.studentProfile.hourlyRate.max
                                      ? `${fullStudent.studentProfile.hourlyRate.currency} ${fullStudent.studentProfile.hourlyRate.min} - ${fullStudent.studentProfile.hourlyRate.max}`
                                      : fullStudent.studentProfile.hourlyRate.min
                                      ? `${fullStudent.studentProfile.hourlyRate.currency} ${fullStudent.studentProfile.hourlyRate.min}+`
                                      : t.notSpecified}
                                  </p>
                                </div>
                              )}
                            </div>
                            {fullStudent?.studentProfile?.skills && fullStudent.studentProfile.skills.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-500 mb-2">{t.skills || 'Skills'}</p>
                                <div className="flex flex-wrap gap-2">
                                  {fullStudent.studentProfile.skills.map((skill, idx) => (
                                    <Badge key={idx} variant="info" size="sm">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {fullStudent?.studentProfile?.universityLink && (
                              <div>
                                <p className="text-sm text-gray-500 mb-1">{t.universityLink || 'University Link'}</p>
                                <a
                                  href={fullStudent.studentProfile.universityLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  {fullStudent.studentProfile.universityLink}
                                </a>
                              </div>
                            )}
                            {fullStudent?.studentProfile?.availability && (
                              <div>
                                <p className="text-sm text-gray-500">{t.availability || 'Availability'}</p>
                                <Badge variant={fullStudent.studentProfile.availability === 'Available' ? 'success' : 'warning'}>
                                  {fullStudent.studentProfile.availability}
                                </Badge>
                              </div>
                            )}
                            {fullStudent?.studentProfile?.bio && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">{t.bio || 'Bio'}</p>
                                <p className="text-gray-700 whitespace-pre-wrap">{fullStudent.studentProfile.bio}</p>
                              </div>
                            )}
                            {fullStudent?.studentProfile?.languages && fullStudent.studentProfile.languages.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-2">{t.languages || 'Languages'}</p>
                                <div className="space-y-2">
                                  {fullStudent.studentProfile.languages.map((lang, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                      <span className="font-medium">{lang.language}</span>
                                      <Badge variant="info" size="sm">{lang.proficiency}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {fullStudent?.studentProfile?.certifications && fullStudent.studentProfile.certifications.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-3">{t.certifications || 'Certifications'}</p>
                                <div className="space-y-3">
                                  {fullStudent.studentProfile.certifications.map((cert, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-3">
                                      <div className="flex items-start justify-between mb-2">
                                        <div>
                                          <p className="font-semibold text-gray-900">{cert.name}</p>
                                          {cert.issuingOrganization && (
                                            <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                                          )}
                                        </div>
                                        {cert.issueDate && (
                                          <p className="text-xs text-gray-500">
                                            {new Date(cert.issueDate).toLocaleDateString(getDashboardDateLocale(language))}
                                          </p>
                                        )}
                                      </div>
                                      {cert.credentialId && (
                                        <p className="text-xs text-gray-500 mb-1">ID: {cert.credentialId}</p>
                                      )}
                                      {cert.credentialUrl && (
                                        <a
                                          href={cert.credentialUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary-600 hover:text-primary-700 text-xs flex items-center gap-1"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          View Credential
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {fullStudent?.studentProfile?.socialLinks && Object.keys(fullStudent.studentProfile.socialLinks).some(key => fullStudent.studentProfile.socialLinks[key]) && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-500 mb-3">{t.socialLinks || 'Social Links'}</p>
                                <div className="flex flex-wrap gap-3">
                                  {fullStudent.studentProfile.socialLinks.github && (
                                    <a
                                      href={fullStudent.studentProfile.socialLinks.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      GitHub
                                    </a>
                                  )}
                                  {fullStudent.studentProfile.socialLinks.linkedin && (
                                    <a
                                      href={fullStudent.studentProfile.socialLinks.linkedin}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      LinkedIn
                                    </a>
                                  )}
                                  {fullStudent.studentProfile.socialLinks.website && (
                                    <a
                                      href={fullStudent.studentProfile.socialLinks.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      Website
                                    </a>
                                  )}
                                  {fullStudent.studentProfile.socialLinks.behance && (
                                    <a
                                      href={fullStudent.studentProfile.socialLinks.behance}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                      Behance
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-500 mb-1">{t.unlockContactToView}</p>
                            {(() => {
                              const universityName = getUniversityName(fullStudent?.studentProfile?.university, null);
                              return universityName ? (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-500">{t.university}</p>
                                  <p className="font-semibold">{universityName}</p>
                                </div>
                              ) : null;
                            })()}
                          </>
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
                        <p className="text-sm text-gray-500">Match score</p>
                        <Badge variant={getMatchVariant(fullApp.matchScore)}>
                          {typeof fullApp.matchScore === 'number' ? `${fullApp.matchScore}/10` : '—'}
                        </Badge>
                      </div>
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
                          {new Date(fullApp.createdAt).toLocaleDateString(getDashboardDateLocale(language), {
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
                      <div>
                        <p className="text-sm text-gray-500">{t.availabilityCommitment}</p>
                        <p className="font-semibold">{fullApp.availabilityCommitment || t.notSpecified}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.applicationNumber}</p>
                        <p className="font-semibold">{fullApp.applicationNumber || t.notSpecified}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t.priority}</p>
                        <p className="font-semibold">
                          {fullApp.priority === 'high' ? t.high : fullApp.priority === 'low' ? t.low : t.normal}
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

                  {/* Job & Category */}
                  {fullApp.jobPost && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        {t.jobDetails}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">{t.budget}</p>
                          <p className="font-semibold">
                            {fullApp.jobPost.budget?.currency} {fullApp.jobPost.budget?.min} – {fullApp.jobPost.budget?.max}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t.deadline}</p>
                          <p className="font-semibold">
                            {fullApp.jobPost.deadline
                              ? new Date(fullApp.jobPost.deadline).toLocaleDateString(getDashboardDateLocale(language))
                              : t.noDeadlineSettled}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t.duration}</p>
                          <p className="font-semibold">{fullApp.jobPost.projectDuration || t.notSpecified}</p>
                        </div>
                      </div>
                      {/* Category description intentionally hidden in modal */}
                    </Card>
                  )}

                  {/* Category Details – all specs, job requirements, applicant answers */}
                  {(category || applicationSpecsOrdered.length > 0 || categorySpecAnswerKeysOrdered.length > 0) && (
                    <Card>
                      <h4 className="font-bold text-gray-900 mb-4">{t.categoryDetails}</h4>
                      {category && (
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <p className="text-sm text-gray-500">{t.categoryName}</p>
                          <p className="font-semibold text-gray-900">{category.name}</p>
                        </div>
                      )}
                      {applicationSpecsOrdered.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="py-2 pr-4 text-sm font-semibold text-gray-700">{t.categoryField}</th>
                                {Object.keys(jobSpecReqs).length > 0 && (
                                  <th className="py-2 pr-4 text-sm font-semibold text-gray-700">{t.jobRequirement}</th>
                                )}
                                <th className="py-2 text-sm font-semibold text-gray-700">{t.applicantAnswer}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {applicationSpecsOrdered.map((spec) => {
                                const key = spec.key;
                                const label = spec.label || key;
                                const jobReq = jobSpecReqs[key];
                                const rawVal = categorySpecAnswers[key];
                                let displayVal = rawVal;
                                if (spec.type === 'boolean') {
                                  displayVal = rawVal === true ? 'Yes' : rawVal === false ? 'No' : '—';
                                } else if (spec.type === 'multi_select') {
                                  displayVal = Array.isArray(rawVal) ? rawVal.join(', ') : '—';
                                } else if (rawVal === undefined || rawVal === null || rawVal === '') {
                                  displayVal = '—';
                                } else {
                                  displayVal = String(rawVal);
                                }
                                const showJobCol = Object.keys(jobSpecReqs).length > 0;
                                const jobReqDisplay = jobReq !== undefined && jobReq !== null && jobReq !== ''
                                  ? (typeof jobReq === 'boolean' ? (jobReq ? 'Yes' : 'No') : Array.isArray(jobReq) ? jobReq.join(', ') : String(jobReq))
                                  : '—';
                                return (
                                  <tr key={key} className="border-b border-gray-100">
                                    <td className="py-3 pr-4">
                                      <p className="text-sm text-gray-600">{label}</p>
                                    </td>
                                    {showJobCol && (
                                      <td className="py-3 pr-4">
                                        <p className="font-medium text-gray-800">{jobReqDisplay}</p>
                                      </td>
                                    )}
                                    <td className="py-3">
                                      <p className="font-semibold text-gray-900">{displayVal}</p>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : categorySpecAnswerKeysOrdered.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="py-2 pr-4 text-sm font-semibold text-gray-700">{t.categoryField}</th>
                                {Object.keys(jobSpecReqs).length > 0 && (
                                  <th className="py-2 pr-4 text-sm font-semibold text-gray-700">{t.jobRequirement}</th>
                                )}
                                <th className="py-2 text-sm font-semibold text-gray-700">{t.applicantAnswer}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categorySpecAnswerKeysOrdered.map((key) => {
                                const jobReq = jobSpecReqs[key];
                                const showJobCol = Object.keys(jobSpecReqs).length > 0;
                                const jobReqDisplay = formatSpecValue(jobReq);
                                const answerDisplay = formatSpecValue(categorySpecAnswers[key]);
                                const label = prettySpecKey(key);
                                return (
                                  <tr key={key} className="border-b border-gray-100">
                                    <td className="py-3 pr-4">
                                      <p className="text-sm text-gray-600">{label}</p>
                                      <p className="text-xs text-gray-400">{key}</p>
                                    </td>
                                    {showJobCol && (
                                      <td className="py-3 pr-4">
                                        <p className="font-medium text-gray-800">{jobReqDisplay}</p>
                                      </td>
                                    )}
                                    <td className="py-3">
                                      <p className="font-semibold text-gray-900">{answerDisplay}</p>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">{t.notSpecified}</p>
                      )}
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
                    {fullApp.status === 'accepted' && job?.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleCreateContract(fullApp._id);
                          handleCloseFullViewModal();
                        }}
                        loading={createContractMutation.isPending}
                      >
                        Create Contract
                      </Button>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null, title: '' })}
        onConfirm={confirmModal.onConfirm || (() => {})}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={t.confirm || 'Confirm'}
        cancelText={t.cancel}
      />
    </div>
  )
};

export default JobApplicationsDetail;
