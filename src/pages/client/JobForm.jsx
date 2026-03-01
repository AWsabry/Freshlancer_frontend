import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { jobService } from '../../services/jobService';
import startupService from '../../services/startupService';
import { categoryService } from '../../services/categoryService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { ArrowLeft, Plus, X } from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading job...',
    backToMyJobs: 'Back to My Jobs',
    editJobPost: 'Edit Job Post',
    createNewJobPost: 'Create New Job Post',
    fillRequiredFields: 'Fill in all required fields to post your job. Students will be able to browse and apply.',
    jobTitle: 'Job Title',
    jobTitlePlaceholder: 'e.g., Full-Stack Web Developer',
    jobTitleRequired: 'Please enter a job title',
    jobDescription: 'Job Description',
    jobDescriptionPlaceholder: 'Describe the project, requirements, deliverables...',
    jobDescriptionRequired: 'Please describe the job and what you need',
    category: 'Category',
    categoryRequired: 'Please select a job category',
    skillsRequired: 'Skills Required',
    addSkill: 'Add a skill (e.g., React, Node.js)',
    minimumBudget: 'Minimum Budget',
    minimumBudgetRequired: 'Please enter a minimum budget',
    minimumBudgetMin: 'Minimum budget must be at least 1',
    maximumBudget: 'Maximum Budget',
    maximumBudgetRequired: 'Please enter a maximum budget',
    maximumBudgetValidate: 'Maximum budget must be greater than or equal to minimum budget',
    currency: 'Currency',
    currencyRequired: 'Please select a currency',
    projectDuration: 'Project Duration',
    projectDurationRequired: 'Please select the expected project duration',
    selectDuration: 'Select duration',
    durationLessThanWeek: 'Less than 1 week',
    duration1to2Weeks: '1-2 weeks',
    duration2to4Weeks: '2-4 weeks',
    duration1to3Months: '1-3 months',
    durationMoreThan3Months: 'More than 3 months',
    deadlineOptional: 'Deadline (Optional)',
    deadlineValidate: 'If you set a deadline, it must be in the future',
    experienceLevel: 'Experience Level',
    experienceLevelRequired: 'Please select the required experience level',
    experienceBeginner: 'Beginner',
    experienceIntermediate: 'Intermediate',
    experienceAdvanced: 'Advanced',
    experienceExpert: 'Expert',
    thisJobForStartup: 'This job is for one of my startups',
    selectStartup: 'Select Startup',
    selectStartupRequired: 'Please select a startup',
    cancel: 'Cancel',
    updateJob: 'Update Job',
    postJob: 'Post Job',
    jobUpdated: 'Job updated successfully!',
    jobPosted: 'Job posted successfully!',
    couldNotUpdate: 'We couldn\'t update your job post. Please check your information and try again.',
    couldNotCreate: 'We couldn\'t create your job post. Please check your information and try again.',
    titleInvalid: 'Please enter a valid job title (5-100 characters)',
    descriptionInvalid: 'Please provide a detailed job description (at least 20 characters)',
    budgetInvalid: 'Please check your budget amounts. Maximum must be greater than or equal to minimum.',
    deadlineInvalid: 'If you set a deadline, it must be a future date.',
    skillsInvalid: 'Please add at least one required skill for this job.',
    categoryInvalid: 'Please select a valid job category.',
    experienceInvalid: 'Please select a valid experience level.',
    addOneSkill: 'Please add at least one required skill for this job',
    maxSkills: 'You can add up to 10 skills maximum. Please remove some skills to continue.',
  },
  it: {
    loading: 'Caricamento lavoro...',
    backToMyJobs: 'Torna ai Miei Lavori',
    editJobPost: 'Modifica Offerta di Lavoro',
    createNewJobPost: 'Crea Nuova Offerta di Lavoro',
    fillRequiredFields: 'Compila tutti i campi obbligatori per pubblicare il tuo lavoro. Gli studenti potranno sfogliare e candidarsi.',
    jobTitle: 'Titolo Lavoro',
    jobTitlePlaceholder: 'es. Sviluppatore Web Full-Stack',
    jobTitleRequired: 'Inserisci un titolo per il lavoro',
    jobDescription: 'Descrizione Lavoro',
    jobDescriptionPlaceholder: 'Descrivi il progetto, i requisiti, i risultati attesi...',
    jobDescriptionRequired: 'Descrivi il lavoro e cosa ti serve',
    category: 'Categoria',
    categoryRequired: 'Seleziona una categoria di lavoro',
    skillsRequired: 'Competenze Richieste',
    addSkill: 'Aggiungi una competenza (es. React, Node.js)',
    minimumBudget: 'Budget Minimo',
    minimumBudgetRequired: 'Inserisci un budget minimo',
    minimumBudgetMin: 'Il budget minimo deve essere almeno 1',
    maximumBudget: 'Budget Massimo',
    maximumBudgetRequired: 'Inserisci un budget massimo',
    maximumBudgetValidate: 'Il budget massimo deve essere maggiore o uguale al budget minimo',
    currency: 'Valuta',
    currencyRequired: 'Seleziona una valuta',
    projectDuration: 'Durata Progetto',
    projectDurationRequired: 'Seleziona la durata prevista del progetto',
    selectDuration: 'Seleziona durata',
    durationLessThanWeek: 'Meno di 1 settimana',
    duration1to2Weeks: '1-2 settimane',
    duration2to4Weeks: '2-4 settimane',
    duration1to3Months: '1-3 mesi',
    durationMoreThan3Months: 'Più di 3 mesi',
    deadlineOptional: 'Scadenza (Opzionale)',
    deadlineValidate: 'Se imposti una scadenza, deve essere una data futura',
    experienceLevel: 'Livello di Esperienza',
    experienceLevelRequired: 'Seleziona il livello di esperienza richiesto',
    experienceBeginner: 'Principiante',
    experienceIntermediate: 'Intermedio',
    experienceAdvanced: 'Avanzato',
    experienceExpert: 'Esperto',
    thisJobForStartup: 'Questo lavoro è per una delle mie startup',
    selectStartup: 'Seleziona Startup',
    selectStartupRequired: 'Seleziona una startup',
    cancel: 'Annulla',
    updateJob: 'Aggiorna Lavoro',
    postJob: 'Pubblica Lavoro',
    jobUpdated: 'Lavoro aggiornato con successo!',
    jobPosted: 'Lavoro pubblicato con successo!',
    couldNotUpdate: 'Impossibile aggiornare la tua offerta di lavoro. Controlla le tue informazioni e riprova.',
    couldNotCreate: 'Impossibile creare la tua offerta di lavoro. Controlla le tue informazioni e riprova.',
    titleInvalid: 'Inserisci un titolo di lavoro valido (5-100 caratteri)',
    descriptionInvalid: 'Fornisci una descrizione dettagliata del lavoro (almeno 20 caratteri)',
    budgetInvalid: 'Controlla gli importi del budget. Il massimo deve essere maggiore o uguale al minimo.',
    deadlineInvalid: 'Se imposti una scadenza, deve essere una data futura.',
    skillsInvalid: 'Aggiungi almeno una competenza richiesta per questo lavoro.',
    categoryInvalid: 'Seleziona una categoria di lavoro valida.',
    experienceInvalid: 'Seleziona un livello di esperienza valido.',
    addOneSkill: 'Aggiungi almeno una competenza richiesta per questo lavoro',
    maxSkills: 'Puoi aggiungere un massimo di 10 competenze. Rimuovi alcune competenze per continuare.',
  },
};

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
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

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      skillsRequired: [],
      budgetCurrency: 'USD',
    },
  });

  const [skills, setSkills] = React.useState([]);
  const [newSkill, setNewSkill] = React.useState('');
  const [isForStartup, setIsForStartup] = React.useState(false);
  const [selectedStartup, setSelectedStartup] = React.useState('');
  const [categorySpecRequirements, setCategorySpecRequirements] = React.useState({});

  // Fetch job if editing
  const { data: jobData, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJob(id),
    enabled: isEditing,
  });

  // Fetch client's startups
  const { data: startupsData } = useQuery({
    queryKey: ['myStartups'],
    queryFn: () => startupService.getMyStartups(),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAllCategories(),
  });

  const startups = startupsData?.data?.startups || [];
  const hasStartups = startups.length > 0;
  
  // The API interceptor returns response.data, so categoriesData is already the unwrapped response
  // Backend returns: { status: 'success', data: { categories: [...] } }
  // So we need: categoriesData.data.categories
  const categoriesList = useMemo(() => {
    return categoriesData?.data?.categories || categoriesData?.categories || [];
  }, [categoriesData]);

  const categories = useMemo(() => {
    return categoriesList.map((cat) => ({
      value: cat.name,
      label: cat.name,
    }));
  }, [categoriesList]);

  const selectedCategoryName = watch('category');
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryName) return null;
    return categoriesList.find((c) => c.name === selectedCategoryName) || null;
  }, [categoriesList, selectedCategoryName]);

  const jobSpecs = useMemo(() => {
    const specs = Array.isArray(selectedCategory?.specs) ? selectedCategory.specs : [];
    return specs
      .filter((s) => s && s.isActive !== false && s.useInJobPost === true)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [selectedCategory]);

  // Reset spec values when category changes (new job or category switched)
  useEffect(() => {
    if (!selectedCategoryName) return;
    const specs = jobSpecs;
    const defaults = {};
    specs.forEach((s) => {
      if (s.defaultValue !== undefined) {
        defaults[s.key] = s.defaultValue;
      }
    });
    setCategorySpecRequirements((prev) => {
      // If category was already set and user hasn't interacted, keep existing values.
      // But if category changed, it's safer to reset to defaults.
      // Heuristic: if prev has any keys not in current specs, reset.
      const prevKeys = Object.keys(prev || {});
      const specKeySet = new Set(specs.map((s) => s.key));
      const hasForeignKey = prevKeys.some((k) => !specKeySet.has(k));
      if (hasForeignKey) return defaults;
      // If empty, set defaults; otherwise keep current values.
      if (prevKeys.length === 0) return defaults;
      return prev;
    });
  }, [selectedCategoryName, jobSpecs]);

  // Populate form when job data is loaded
  React.useEffect(() => {
    if (jobData?.data?.jobPost && isEditing) {
      const job = jobData.data.jobPost;
      
      // Set skills
      setSkills(job.skillsRequired || []);
      
      // Set startup fields
      if (job.startup) {
        setIsForStartup(true);
        setSelectedStartup(job.startup._id || job.startup);
      }
      
      // Prepare form data
      const formData = {
        title: job.title || '',
        description: job.description || '',
        category: job.category || '',
        budgetMin: job.budget?.min || '',
        budgetMax: job.budget?.max || '',
        budgetCurrency: job.budget?.currency || 'USD',
        projectDuration: job.projectDuration || '',
        experienceLevel: job.experienceLevel || '',
      };

      // Convert deadline to YYYY-MM-DD format for date input
      if (job.deadline) {
        const date = new Date(job.deadline);
        const formattedDate = date.toISOString().split('T')[0];
        formData.deadline = formattedDate;
      }

      // Reset form with all job data
      reset(formData);

      // Populate category specs (if any)
      setCategorySpecRequirements(job.categorySpecRequirements || {});
    }
  }, [jobData, isEditing, reset]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (jobData) =>
      isEditing ? jobService.updateJob(id, jobData) : jobService.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
      queryClient.invalidateQueries(['myJobs']);
      alert(isEditing ? t.jobUpdated : t.jobPosted);
      navigate('/client/jobs');
    },
    onError: (error) => {
      // Make error messages user-friendly
      let errorMessage = isEditing ? t.couldNotUpdate : t.couldNotCreate;
      
      if (error.response?.data?.message) {
        const backendMessage = error.response.data.message;
        
        // Convert technical messages to user-friendly ones
        if (backendMessage.includes('title')) {
          errorMessage = t.titleInvalid;
        } else if (backendMessage.includes('description')) {
          errorMessage = t.descriptionInvalid;
        } else if (backendMessage.includes('budget')) {
          errorMessage = t.budgetInvalid;
        } else if (backendMessage.includes('deadline')) {
          errorMessage = t.deadlineInvalid;
        } else if (backendMessage.includes('skills')) {
          errorMessage = t.skillsInvalid;
        } else if (backendMessage.includes('category')) {
          errorMessage = t.categoryInvalid;
        } else if (backendMessage.includes('experience')) {
          errorMessage = t.experienceInvalid;
        } else {
          errorMessage = backendMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    },
  });

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    // Validate skills
    if (skills.length === 0) {
      alert(t.addOneSkill);
      return;
    }

    if (skills.length > 10) {
      alert(t.maxSkills);
      return;
    }

    const jobData = {
      title: data.title,
      description: data.description,
      category: data.category,
      skillsRequired: skills,
      categorySpecRequirements,
      budget: {
        min: parseFloat(data.budgetMin),
        max: parseFloat(data.budgetMax),
        currency: data.budgetCurrency || 'USD',
      },
      projectDuration: data.projectDuration,
      experienceLevel: data.experienceLevel,
    };

    // Only include deadline if provided (not empty string)
    if (data.deadline && data.deadline.trim() !== '') {
      jobData.deadline = data.deadline;
    }

    // Include startup if selected
    if (isForStartup && selectedStartup) {
      jobData.startup = selectedStartup;
    }

    saveMutation.mutate(jobData);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  if (isLoading) {
    return <Loading text={t.loading} />;
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

      <Card title={isEditing ? t.editJobPost : t.createNewJobPost}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Alert
            type="info"
            message={t.fillRequiredFields}
          />

          <Input
            label={t.jobTitle}
            placeholder={t.jobTitlePlaceholder}
            error={errors.title?.message}
            {...register('title', { required: t.jobTitleRequired })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.jobDescription} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="10"
              placeholder={t.jobDescriptionPlaceholder}
              className="input"
              {...register('description', { required: t.jobDescriptionRequired })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <Select
            label={t.category}
            options={categories}
            error={errors.category?.message}
            {...register('category', { required: t.categoryRequired })}
          />

          {/* Category Specs (Job Requirements) */}
          {jobSpecs.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900">Category Requirements</h3>
              <p className="text-sm text-gray-600">
                Fill the category-specific requirements for this job.
              </p>

              {jobSpecs.map((spec) => {
                const value = categorySpecRequirements?.[spec.key];
                const required = spec.requiredInJobPost === true;

                if (spec.type === 'select') {
                  const options = Array.isArray(spec.options) ? spec.options : [];
                  return (
                    <div key={spec.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {spec.label} {required && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        className="input"
                        value={value ?? ''}
                        onChange={(e) =>
                          setCategorySpecRequirements((prev) => ({
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
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {options.map((o) => {
                          const checked = arr.includes(o);
                          return (
                            <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  setCategorySpecRequirements((prev) => {
                                    const prevArr = Array.isArray(prev?.[spec.key]) ? prev[spec.key] : [];
                                    const nextArr = e.target.checked
                                      ? Array.from(new Set([...prevArr, o]))
                                      : prevArr.filter((x) => x !== o);
                                    return { ...(prev || {}), [spec.key]: nextArr };
                                  });
                                }}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
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
                    <Input
                      key={spec.key}
                      label={`${spec.label}${required ? ' *' : ''}`}
                      type="number"
                      value={value ?? ''}
                      onChange={(e) =>
                        setCategorySpecRequirements((prev) => ({
                          ...(prev || {}),
                          [spec.key]: e.target.value === '' ? undefined : Number(e.target.value),
                        }))
                      }
                      min={spec.min ?? undefined}
                      max={spec.max ?? undefined}
                    />
                  );
                }

                if (spec.type === 'boolean') {
                  return (
                    <div key={spec.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={value === true}
                        onChange={(e) =>
                          setCategorySpecRequirements((prev) => ({
                            ...(prev || {}),
                            [spec.key]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {spec.label} {required && <span className="text-red-500">*</span>}
                      </span>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.skillsRequired}
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder={t.addSkill}
                className="input flex-1"
              />
              <Button type="button" variant="primary" onClick={addSkill}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label={t.minimumBudget}
              type="number"
              min="0"
              step="0.01"
              error={errors.budgetMin?.message}
              {...register('budgetMin', {
                required: t.minimumBudgetRequired,
                min: { value: 1, message: t.minimumBudgetMin },
              })}
            />

            <Input
              label={t.maximumBudget}
              type="number"
              min="0"
              step="0.01"
              error={errors.budgetMax?.message}
              {...register('budgetMax', {
                required: t.maximumBudgetRequired,
                validate: (value) =>
                  parseFloat(value) >= parseFloat(watch('budgetMin')) ||
                  t.maximumBudgetValidate,
              })}
            />

            <Select
              label={t.currency}
              options={[
                { value: 'USD', label: 'USD ($) - US Dollar' },
                { value: 'EGP', label: 'EGP (£) - Egyptian Pound' },
              ]}
              error={errors.budgetCurrency?.message}
              {...register('budgetCurrency', { required: t.currencyRequired })}
            />
          </div>

          <Select
            label={t.projectDuration}
            placeholder={t.selectDuration}
            options={[
              { value: 'Less than 1 week', label: t.durationLessThanWeek },
              { value: '1-2 weeks', label: t.duration1to2Weeks },
              { value: '2-4 weeks', label: t.duration2to4Weeks },
              { value: '1-3 months', label: t.duration1to3Months },
              { value: 'More than 3 months', label: t.durationMoreThan3Months },
            ]}
            error={errors.projectDuration?.message}
            {...register('projectDuration', { required: t.projectDurationRequired })}
          />

          <Input
            label={t.deadlineOptional}
            type="date"
            error={errors.deadline?.message}
            {...register('deadline', {
              validate: (value) => {
                // Only validate if a deadline is provided
                if (!value) return true;
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return selectedDate > today || t.deadlineValidate;
              },
            })}
          />

          <Select
            label={t.experienceLevel}
            options={[
              { value: 'Beginner', label: t.experienceBeginner },
              { value: 'Intermediate', label: t.experienceIntermediate },
              { value: 'Advanced', label: t.experienceAdvanced },
              { value: 'Expert', label: t.experienceExpert },
            ]}
            error={errors.experienceLevel?.message}
            {...register('experienceLevel', { required: t.experienceLevelRequired })}
          />

          {/* Startup Selection */}
          {hasStartups && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isForStartup"
                  checked={isForStartup}
                  onChange={(e) => {
                    setIsForStartup(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedStartup('');
                    }
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isForStartup" className="text-sm font-medium text-gray-700">
                  {t.thisJobForStartup}
                </label>
              </div>

              {isForStartup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectStartup} <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {startups.map((startup) => (
                      <div key={startup._id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          id={`startup-${startup._id}`}
                          name="startup"
                          value={startup._id}
                          checked={selectedStartup === startup._id}
                          onChange={(e) => setSelectedStartup(e.target.value)}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        />
                        <label
                          htmlFor={`startup-${startup._id}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {startup.startupName}
                        </label>
                      </div>
                    ))}
                  </div>
                  {isForStartup && !selectedStartup && (
                    <p className="mt-1 text-sm text-red-600">{t.selectStartupRequired}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/client/jobs')}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveMutation.isPending}
              disabled={saveMutation.isPending}
              className="flex-1"
            >
              {isEditing ? t.updateJob : t.postJob}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default JobForm;
