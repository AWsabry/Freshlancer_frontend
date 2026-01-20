import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { subscriptionService } from '../../services/subscriptionService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../contexts/ToastContext';
import { translateError } from '../../utils/errorTranslations';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import {
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading job details...',
    jobNotFound: 'Job not found',
    backToJobs: 'Back to Jobs',
    posted: 'Posted',
    budget: 'Budget',
    duration: 'Duration',
    applicants: 'Applicants',
    description: 'Description',
    skillsRequired: 'Skills Required',
    premiumMembersOnly: 'Premium members only',
    premium: 'Premium',
    free: 'Free',
    urgent: 'Urgent',
    alreadyApplied: 'You have already applied for this job. Application status: {status}',
    viewMyApplication: 'View My Application',
    allApplications: 'All Applications',
    applicationsThisMonth: 'Applications This Month',
    resetsOn: 'Resets on {date}',
    usedApplications: 'You\'ve used {used} of {limit} applications. Upgrade to Premium for 100 applications per month!',
    reachedLimit: 'You\'ve reached your monthly application limit of {limit}. {message}',
    limitResetMessage: 'Your limit will reset on the first day of next month.',
    upgradeMessage: 'Upgrade to Premium for 100 applications per month!',
    applyForJob: 'Apply for this Job',
    applyForJobTitle: 'Apply for Job',
    applicationInfo: 'Complete the application form using only the provided options. No free-text responses allowed.',
    proposalType: 'Proposal Type',
    proposalTypeRequired: 'Proposal type is required',
    standardProposal: 'Standard Proposal',
    expressProposal: 'Express (Fast Delivery)',
    premiumProposal: 'Premium (High Quality)',
    customProposal: 'Custom Approach',
    proposalMessage: 'Proposal Message (Optional)',
    proposalMessagePlaceholder: 'Add a personalized message to the client about why you\'re the best fit for this project...',
    proposalMessageMaxLength: 'Proposal text must be less than 1000 characters',
    proposalMessageInfo: 'Max 1000 characters. This message will be visible to the client.',
    premiumOnly: 'Premium Only',
    proposedBudgetAmount: 'Proposed Budget Amount',
    proposedBudgetRequired: 'Proposed budget is required',
    budgetMin: 'Budget must be at least $1',
    currency: 'Currency',
    currencyRequired: 'Currency is required',
    estimatedDuration: 'Estimated Duration',
    durationRequired: 'Duration is required',
    lessThan1Week: 'Less than 1 week',
    oneToTwoWeeks: '1-2 weeks',
    twoToFourWeeks: '2-4 weeks',
    oneToThreeMonths: '1-3 months',
    moreThanThreeMonths: 'More than 3 months',
    methodology: 'Methodology',
    deliveryFrequency: 'Delivery Frequency',
    dailyUpdates: 'Daily updates',
    weeklyUpdates: 'Weekly updates',
    biWeeklyUpdates: 'Bi-weekly updates',
    monthlyUpdates: 'Monthly updates',
    uponCompletion: 'Upon completion',
    numberOfRevisions: 'Number of Revisions (0-10)',
    communicationPreference: 'Communication Preference',
    emailOnly: 'Email only',
    chatPreferred: 'Chat preferred',
    videoCallsAvailable: 'Video calls available',
    flexible: 'Flexible',
    availabilityCommitment: 'Availability Commitment',
    availabilityRequired: 'Availability is required',
    fullTime: 'Full-time (40+ hours/week)',
    partTime20_40: 'Part-time (20-40 hours/week)',
    partTime10_20: 'Part-time (10-20 hours/week)',
    weekendsOnly: 'Weekends only',
    flexibleHours: 'Flexible hours',
    relevantExperienceLevel: 'Relevant Experience Level',
    firstProject: 'This is my first project',
    oneToThreeProjects: '1-3 similar projects',
    threeToFiveProjects: '3-5 similar projects',
    fivePlusProjects: '5+ similar projects',
    expertInField: 'Expert in this field',
    cancel: 'Cancel',
    submitApplication: 'Submit Application',
    applicationSuccess: 'Application submitted successfully! The job has been moved to your Applied Jobs.',
    applicationFailed: 'Failed to submit application. Please try again.',
    jobIdMissing: 'Job ID is missing. Please refresh the page and try again.',
    validBudgetRequired: 'Please enter a valid proposed budget.',
    durationRequiredAlert: 'Please select an estimated duration.',
    availabilityRequiredAlert: 'Please select your availability commitment.',
  },
  it: {
    loading: 'Caricamento dettagli lavoro...',
    jobNotFound: 'Lavoro non trovato',
    backToJobs: 'Torna ai Lavori',
    posted: 'Pubblicato',
    budget: 'Budget',
    duration: 'Durata',
    applicants: 'Candidati',
    description: 'Descrizione',
    skillsRequired: 'Competenze Richieste',
    premiumMembersOnly: 'Solo membri Premium',
    premium: 'Premium',
    free: 'Gratuito',
    urgent: 'Urgente',
    alreadyApplied: 'Hai già fatto domanda per questo lavoro. Stato candidatura: {status}',
    viewMyApplication: 'Visualizza La Mia Candidatura',
    allApplications: 'Tutte Le Candidature',
    applicationsThisMonth: 'Candidature Questo Mese',
    resetsOn: 'Si resetta il {date}',
    usedApplications: 'Hai usato {used} di {limit} candidature. Passa a Premium per 100 candidature al mese!',
    reachedLimit: 'Hai raggiunto il limite mensile di {limit} candidature. {message}',
    limitResetMessage: 'Il tuo limite si resetta il primo giorno del prossimo mese.',
    upgradeMessage: 'Passa a Premium per 100 candidature al mese!',
    applyForJob: 'Candidati per questo Lavoro',
    applyForJobTitle: 'Candidati per Lavoro',
    applicationInfo: 'Compila il modulo di candidatura utilizzando solo le opzioni fornite. Non sono consentite risposte in testo libero.',
    proposalType: 'Tipo di Proposta',
    proposalTypeRequired: 'Il tipo di proposta è obbligatorio',
    standardProposal: 'Proposta Standard',
    expressProposal: 'Express (Consegna Veloce)',
    premiumProposal: 'Premium (Alta Qualità)',
    customProposal: 'Approccio Personalizzato',
    proposalMessage: 'Messaggio Proposta (Opzionale)',
    proposalMessagePlaceholder: 'Aggiungi un messaggio personalizzato al cliente sul perché sei la scelta migliore per questo progetto...',
    proposalMessageMaxLength: 'Il testo della proposta deve essere inferiore a 1000 caratteri',
    proposalMessageInfo: 'Massimo 1000 caratteri. Questo messaggio sarà visibile al cliente.',
    premiumOnly: 'Solo Premium',
    proposedBudgetAmount: 'Importo Budget Proposto',
    proposedBudgetRequired: 'Il budget proposto è obbligatorio',
    budgetMin: 'Il budget deve essere almeno $1',
    currency: 'Valuta',
    currencyRequired: 'La valuta è obbligatoria',
    estimatedDuration: 'Durata Stimata',
    durationRequired: 'La durata è obbligatoria',
    lessThan1Week: 'Meno di 1 settimana',
    oneToTwoWeeks: '1-2 settimane',
    twoToFourWeeks: '2-4 settimane',
    oneToThreeMonths: '1-3 mesi',
    moreThanThreeMonths: 'Più di 3 mesi',
    methodology: 'Metodologia',
    deliveryFrequency: 'Frequenza di Consegna',
    dailyUpdates: 'Aggiornamenti giornalieri',
    weeklyUpdates: 'Aggiornamenti settimanali',
    biWeeklyUpdates: 'Aggiornamenti bisettimanali',
    monthlyUpdates: 'Aggiornamenti mensili',
    uponCompletion: 'Al completamento',
    numberOfRevisions: 'Numero di Revisioni (0-10)',
    communicationPreference: 'Preferenza di Comunicazione',
    emailOnly: 'Solo email',
    chatPreferred: 'Chat preferita',
    videoCallsAvailable: 'Videochiamate disponibili',
    flexible: 'Flessibile',
    availabilityCommitment: 'Impegno di Disponibilità',
    availabilityRequired: 'La disponibilità è obbligatoria',
    fullTime: 'Tempo pieno (40+ ore/settimana)',
    partTime20_40: 'Part-time (20-40 ore/settimana)',
    partTime10_20: 'Part-time (10-20 ore/settimana)',
    weekendsOnly: 'Solo fine settimana',
    flexibleHours: 'Ore flessibili',
    relevantExperienceLevel: 'Livello di Esperienza Rilevante',
    firstProject: 'Questo è il mio primo progetto',
    oneToThreeProjects: '1-3 progetti simili',
    threeToFiveProjects: '3-5 progetti simili',
    fivePlusProjects: '5+ progetti simili',
    expertInField: 'Esperto in questo campo',
    cancel: 'Annulla',
    submitApplication: 'Invia Candidatura',
    applicationSuccess: 'Candidatura inviata con successo! Il lavoro è stato spostato nei tuoi Lavori a cui hai fatto domanda.',
    applicationFailed: 'Invio candidatura fallito. Riprova.',
    jobIdMissing: 'ID lavoro mancante. Ricarica la pagina e riprova.',
    validBudgetRequired: 'Inserisci un budget proposto valido.',
    durationRequiredAlert: 'Seleziona una durata stimata.',
    availabilityRequiredAlert: 'Seleziona il tuo impegno di disponibilità.',
  },
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [categorySpecAnswers, setCategorySpecAnswers] = useState({});
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

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      proposedBudgetCurrency: 'USD',
    },
  });

  // Fetch job details
  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJob(id),
  });

  // Fetch categories (to render dynamic category specs)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });

  // Check subscription
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionService.getMySubscription(),
  });

  // Check application limit
  const { data: limitData } = useQuery({
    queryKey: ['applicationLimit'],
    queryFn: () => subscriptionService.checkApplicationLimit(),
  });

  // Check if student has already applied to this job (from database)
  const { data: applicationStatusData } = useQuery({
    queryKey: ['applicationStatus', id],
    queryFn: () => applicationService.checkApplicationStatus(id),
    enabled: !!id,
  });

  const hasAlreadyApplied = applicationStatusData?.data?.hasApplied || false;
  const existingApplication = applicationStatusData?.data?.application || null;

  const { success: showSuccess, error: showError, warning: showWarning } = useToast();

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: (applicationData) => applicationService.applyToJob(applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
      queryClient.invalidateQueries(['applicationLimit']);
      queryClient.invalidateQueries(['myApplications']);
      queryClient.invalidateQueries(['applicationStatus', id]); // Invalidate application status
      queryClient.invalidateQueries(['jobs']); // Invalidate jobs list to update Available/Applied tabs
      setShowApplicationModal(false);
      reset();
      setCategorySpecAnswers({});
      showSuccess(t.applicationSuccess);
      navigate('/student/jobs');
    },
    onError: (error) => {
      // Provide more specific error messages
      let errorMessage = t.applicationFailed;
      
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        // Check if it's an "already applied" error
        if (backendMessage.toLowerCase().includes('already applied')) {
          errorMessage = language === 'it' 
            ? 'Hai già fatto domanda per questo lavoro.'
            : 'You have already applied for this job.';
        } else {
          errorMessage = translateError(backendMessage, language);
        }
      } else if (error.message) {
        errorMessage = translateError(error.message, language);
      }
      
      // Don't show toast for duplicate application errors (user might have clicked twice)
      if (!errorMessage.toLowerCase().includes('already applied') && !errorMessage.toLowerCase().includes('già fatto domanda')) {
        showError(errorMessage);
      }
    },
  });

  const onSubmit = (data) => {
    // Validate required fields before submission
    if (!id) {
      showError(t.jobIdMissing);
      return;
    }

    if (!data.proposedBudget || isNaN(parseFloat(data.proposedBudget))) {
      showError(t.validBudgetRequired);
      return;
    }

    if (!data.estimatedDuration) {
      showError(t.durationRequiredAlert);
      return;
    }

    if (!data.availabilityCommitment) {
      showError(t.availabilityRequiredAlert);
      return;
    }

    const applicationData = {
      jobPost: id,
      proposalType: data.proposalType || 'standard',
      proposedBudget: {
        amount: parseFloat(data.proposedBudget),
        currency: data.proposedBudgetCurrency || 'USD',
      },
      estimatedDuration: data.estimatedDuration,
      availabilityCommitment: data.availabilityCommitment,
      categorySpecAnswers: categorySpecAnswers || {},
    };

    // Add optional proposal text if provided (premium feature)
    if (data.proposalText && data.proposalText.trim()) {
      applicationData.proposalText = data.proposalText.trim();
    }

    applyMutation.mutate(applicationData);
  };

  const job = jobData?.data?.jobPost;
  const categoriesList = useMemo(() => {
    return categoriesData?.data?.categories || categoriesData?.categories || [];
  }, [categoriesData]);

  const category = useMemo(() => {
    if (!job?.category) return null;
    return categoriesList.find((c) => c.name === job.category) || null;
  }, [categoriesList, job?.category]);

  const applicationSpecs = useMemo(() => {
    const specs = Array.isArray(category?.specs) ? category.specs : [];
    return specs
      .filter((s) => s && s.isActive !== false && s.useInApplication === true)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [category]);

  const jobRequirements = job?.categorySpecRequirements || {};
  const jobRequirementsKey = useMemo(() => {
    try {
      return JSON.stringify(job?.categorySpecRequirements || {});
    } catch {
      return '';
    }
  }, [job?.categorySpecRequirements]);

  // Initialize/lock answers based on job requirements and defaults
  useEffect(() => {
    if (!job || !category) return;
    setCategorySpecAnswers((prev) => {
      const next = { ...(prev || {}) };
      applicationSpecs.forEach((spec) => {
        const isLocked =
          spec.useInJobPost === true &&
          jobRequirements &&
          jobRequirements[spec.key] !== undefined;

        if (isLocked) {
          next[spec.key] = jobRequirements[spec.key];
          return;
        }

        if (next[spec.key] === undefined && spec.defaultValue !== undefined) {
          next[spec.key] = spec.defaultValue;
        }
      });
      return next;
    });
  }, [job?._id, category?.name, jobRequirementsKey, applicationSpecs]);

  if (isLoading) {
    return <Loading text={t.loading} />;
  }
  const canApply = limitData?.data?.canApply;
  const currentUsage = limitData?.data?.currentUsage || 0;
  const monthlyLimit = limitData?.data?.limit || 10;
  const resetDate = limitData?.data?.resetDate;
  const subscription = subscriptionData?.data?.subscription;
  const isPremium = subscription?.plan === 'premium' || limitData?.data?.plan === 'premium';
  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t.jobNotFound}</p>
        <Button onClick={() => navigate('/student/jobs')} className="mt-4">
          {t.backToJobs}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/jobs')}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.backToJobs}
      </button>

      {/* Job Header */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              {isPremium && (<span className="flex items-center gap-1">
                <Briefcase className="w-5 h-5" />
                {job.client?.clientProfile?.companyEmail || job.client?.email}
              </span>)}
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  {job.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-5 h-5" />
                {t.posted} {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant="info">{job.category}</Badge>
            {job.urgent && <Badge variant="error">{t.urgent}</Badge>}
            {/* Show startup name tag if premium and startup exists */}
            {isPremium && job.startup && !job.startup.message && job.startup.startupName && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                {job.startup.startupName}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {job.budget && (
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.budget}</p>
              {isPremium && !job.budget.message ? (
                <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                  <DollarSign className="w-5 h-5" />
                  {job.budget.currency} {job.budget.min} - {job.budget.max}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-gray-500 italic">
                  <DollarSign className="w-4 h-4" />
                  {job.budget.message || t.premiumMembersOnly}
                </div>
              )}
            </div>
          )}
          {job.duration && (
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.duration}</p>
              <p className="text-lg font-semibold text-gray-900">{job.duration}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600 mb-1">{t.applicants}</p>
            <p className="text-lg font-semibold text-gray-900">
              {job.applicationsCount || 0}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">{t.description}</h2>
          <p className="text-gray-700 whitespace-pre-line break-words overflow-wrap-anywhere">{job.description}</p>
        </div>

        {/* Skills Required */}
        {job.skillsRequired && job.skillsRequired.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">{t.skillsRequired}</h2>
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

        {/* Apply Button */}
        <div className="pt-6 border-t">
          {hasAlreadyApplied ? (
            <div>
              <Alert
                type="success"
                message={t.alreadyApplied.replace('{status}', existingApplication?.status || 'pending')}
                className="mb-4"
              />
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate(`/student/applications/${existingApplication?._id}`)}
                >
                  {t.viewMyApplication}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate('/student/applications')}
                >
                  {t.allApplications}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {/* Monthly Usage Info */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t.applicationsThisMonth}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentUsage} / {monthlyLimit}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={isPremium ? 'success' : 'info'}>
                      {isPremium ? t.premium : t.free}
                    </Badge>
                  </div>
                </div>
                {resetDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    {t.resetsOn.replace('{date}', new Date(resetDate).toLocaleDateString())}
                  </p>
                )}
                {!isPremium && currentUsage > monthlyLimit * 0.7 && (
                  <Alert
                    type="warning"
                    message={t.usedApplications.replace('{used}', currentUsage).replace('{limit}', monthlyLimit)}
                    className="mt-3"
                  />
                )}
              </div>

              {!canApply && (
                <Alert
                  type="error"
                  message={t.reachedLimit.replace('{limit}', monthlyLimit).replace('{message}', isPremium ? t.limitResetMessage : t.upgradeMessage)}
                  className="mb-4"
                />
              )}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setShowApplicationModal(true)}
                disabled={!canApply}
              >
                {t.applyForJob}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title={t.applyForJobTitle}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Alert
            type="info"
            message={t.applicationInfo}
          />

          <Select
            label={t.proposalType}
            options={[
              { value: 'standard', label: t.standardProposal },
              { value: 'express', label: t.expressProposal },
              { value: 'premium', label: t.premiumProposal },
              { value: 'custom', label: t.customProposal },
            ]}
            error={errors.proposalType?.message}
            {...register('proposalType', { required: t.proposalTypeRequired })}
          />

          {/* Proposal Text - Premium Feature */}
          {isPremium && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.proposalMessage}
                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                  {t.premiumOnly}
                </span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="4"
                placeholder={t.proposalMessagePlaceholder}
                maxLength="1000"
                {...register('proposalText', {
                  maxLength: { value: 1000, message: t.proposalMessageMaxLength },
                })}
              />
              {errors.proposalText?.message && (
                <p className="mt-1 text-sm text-red-600">{errors.proposalText.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {t.proposalMessageInfo}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t.proposedBudgetAmount}
              type="number"
              min="1"
              step="0.01"
              error={errors.proposedBudget?.message}
              {...register('proposedBudget', {
                required: t.proposedBudgetRequired,
                min: { value: 1, message: t.budgetMin },
              })}
            />

            <Select
              label={t.currency}
              options={[
                { value: 'USD', label: 'USD ($) - US Dollar' },
                { value: 'EUR', label: 'EUR (€) - Euro' },
                { value: 'EGP', label: 'EGP (£) - Egyptian Pound' },
                { value: 'GBP', label: 'GBP (£) - British Pound' },
                { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
                { value: 'SAR', label: 'SAR (﷼) - Saudi Riyal' },
                { value: 'QAR', label: 'QAR (﷼) - Qatari Riyal' },
                { value: 'KWD', label: 'KWD (د.ك) - Kuwaiti Dinar' },
                { value: 'BHD', label: 'BHD (.د.ب) - Bahraini Dinar' },
                { value: 'OMR', label: 'OMR (﷼) - Omani Rial' },
                { value: 'JOD', label: 'JOD (د.ا) - Jordanian Dinar' },
                { value: 'LBP', label: 'LBP (ل.ل) - Lebanese Pound' },
                { value: 'ILS', label: 'ILS (₪) - Israeli Shekel' },
                { value: 'TRY', label: 'TRY (₺) - Turkish Lira' },
                { value: 'ZAR', label: 'ZAR (R) - South African Rand' },
                { value: 'MAD', label: 'MAD (د.م.) - Moroccan Dirham' },
                { value: 'TND', label: 'TND (د.ت) - Tunisian Dinar' },
                { value: 'DZD', label: 'DZD (د.ج) - Algerian Dinar' },
                { value: 'NGN', label: 'NGN (₦) - Nigerian Naira' },
                { value: 'KES', label: 'KES (KSh) - Kenyan Shilling' },
                { value: 'GHS', label: 'GHS (₵) - Ghanaian Cedi' },
                { value: 'UGX', label: 'UGX (USh) - Ugandan Shilling' },
                { value: 'TZS', label: 'TZS (TSh) - Tanzanian Shilling' },
                { value: 'ETB', label: 'ETB (Br) - Ethiopian Birr' },
                { value: 'CHF', label: 'CHF (Fr) - Swiss Franc' },
                { value: 'SEK', label: 'SEK (kr) - Swedish Krona' },
                { value: 'NOK', label: 'NOK (kr) - Norwegian Krone' },
                { value: 'DKK', label: 'DKK (kr) - Danish Krone' },
                { value: 'PLN', label: 'PLN (zł) - Polish Zloty' },
                { value: 'CZK', label: 'CZK (Kč) - Czech Koruna' },
                { value: 'HUF', label: 'HUF (Ft) - Hungarian Forint' },
                { value: 'RON', label: 'RON (lei) - Romanian Leu' },
                { value: 'BGN', label: 'BGN (лв) - Bulgarian Lev' },
                { value: 'HRK', label: 'HRK (kn) - Croatian Kuna' },
                { value: 'RUB', label: 'RUB (₽) - Russian Ruble' },
                { value: 'UAH', label: 'UAH (₴) - Ukrainian Hryvnia' },
              ]}
              error={errors.proposedBudgetCurrency?.message}
              {...register('proposedBudgetCurrency', { required: t.currencyRequired })}
            />
          </div>

          <Select
            label={t.estimatedDuration}
            options={[
              { value: 'Less than 1 week', label: t.lessThan1Week },
              { value: '1-2 weeks', label: t.oneToTwoWeeks },
              { value: '2-4 weeks', label: t.twoToFourWeeks },
              { value: '1-3 months', label: t.oneToThreeMonths },
              { value: 'More than 3 months', label: t.moreThanThreeMonths },
            ]}
            error={errors.estimatedDuration?.message}
            {...register('estimatedDuration', { required: t.durationRequired })}
          />

          {/* Category Specs (dynamic, no free-text) */}
          {applicationSpecs.length > 0 && (
            <div className="pt-4 border-t space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Category Questions</h3>
              <p className="text-sm text-gray-600">
                Answer the category-specific questions for this job.
              </p>

              {applicationSpecs.map((spec) => {
                const required = spec.requiredInApplication === true;
                const locked =
                  spec.useInJobPost === true &&
                  jobRequirements &&
                  jobRequirements[spec.key] !== undefined;
                const value = categorySpecAnswers?.[spec.key];

                if (spec.type === 'select') {
                  const options = Array.isArray(spec.options) ? spec.options : [];
                  return (
                    <div key={spec.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {spec.label} {required && <span className="text-red-500">*</span>}
                        {locked && <span className="ml-2 text-xs text-gray-500">(locked by job requirement)</span>}
                      </label>
                      <select
                        className="input"
                        value={value ?? ''}
                        disabled={locked}
                        onChange={(e) =>
                          setCategorySpecAnswers((prev) => ({
                            ...(prev || {}),
                            [spec.key]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select an option</option>
                        {options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                if (spec.type === 'multi_select') {
                  const options = Array.isArray(spec.options) ? spec.options : [];
                  const arr = Array.isArray(value) ? value : [];
                  return (
                    <div key={spec.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {spec.label} {required && <span className="text-red-500">*</span>}
                        {locked && <span className="ml-2 text-xs text-gray-500">(locked by job requirement)</span>}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {options.map((o) => {
                          const checked = arr.includes(o);
                          return (
                            <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={locked}
                                onChange={(e) => {
                                  setCategorySpecAnswers((prev) => {
                                    const prevArr = Array.isArray(prev?.[spec.key]) ? prev[spec.key] : [];
                                    const nextArr = e.target.checked
                                      ? Array.from(new Set([...prevArr, o]))
                                      : prevArr.filter((x) => x !== o);
                                    return { ...(prev || {}), [spec.key]: nextArr };
                                  });
                                }}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                              />
                              {o}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (spec.type === 'number') {
                  return (
                    <div key={spec.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {spec.label} {required && <span className="text-red-500">*</span>}
                        {locked && <span className="ml-2 text-xs text-gray-500">(locked by job requirement)</span>}
                      </label>
                      <input
                        className="input"
                        type="number"
                        value={value ?? ''}
                        disabled={locked}
                        min={spec.min ?? undefined}
                        max={spec.max ?? undefined}
                        onChange={(e) =>
                          setCategorySpecAnswers((prev) => ({
                            ...(prev || {}),
                            [spec.key]: e.target.value === '' ? undefined : Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  );
                }

                if (spec.type === 'boolean') {
                  return (
                    <div key={spec.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value === true}
                        disabled={locked}
                        onChange={(e) =>
                          setCategorySpecAnswers((prev) => ({
                            ...(prev || {}),
                            [spec.key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {spec.label} {required && <span className="text-red-500">*</span>}
                        {locked && <span className="ml-2 text-xs text-gray-500">(locked)</span>}
                      </span>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}

          <Select
            label={t.availabilityCommitment}
            options={[
              { value: 'Full-time (40+ hours/week)', label: t.fullTime },
              { value: 'Part-time (20-40 hours/week)', label: t.partTime20_40 },
              { value: 'Part-time (10-20 hours/week)', label: t.partTime10_20 },
              { value: 'Weekends only', label: t.weekendsOnly },
              { value: 'Flexible hours', label: t.flexibleHours },
            ]}
            error={errors.availabilityCommitment?.message}
            {...register('availabilityCommitment', { required: t.availabilityRequired })}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowApplicationModal(false)}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={applyMutation.isPending}
              disabled={applyMutation.isPending}
              className="flex-1"
            >
              {t.submitApplication}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobDetails;
