import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import startupService from '../../services/startupService';
import { API_BASE_URL } from '../../config/env';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import { Rocket, Edit2, Save, X, Plus, Trash2, Upload, Image as ImageIcon, Link as LinkIcon, Globe } from 'lucide-react';

const translations = {
  en: {
    loading: 'Loading startups...',
    myStartups: 'My Startups',
    manageProfiles: 'Manage your startup profiles',
    addStartup: 'Add Startup',
    startupCreated: 'Startup created successfully!',
    createFailed: 'Failed to create startup',
    startupUpdated: 'Startup updated successfully!',
    updateFailed: 'Failed to update startup',
    startupDeleted: 'Startup deleted successfully!',
    deleteFailed: 'Failed to delete startup',
    editStartup: 'Edit Startup',
    createNewStartup: 'Create New Startup',
    startupName: 'Startup Name',
    startupNameRequired: 'Startup name is required',
    yourPosition: 'Your Position',
    positionRequired: 'Position is required',
    numberOfEmployees: 'Number of Employees',
    employeesRequired: 'Number of employees is required',
    employees1to5: '1-5 employees',
    employees6to10: '6-10 employees',
    employees11to20: '11-20 employees',
    employees21to50: '21-50 employees',
    employees51to100: '51-100 employees',
    employees100plus: '100+ employees',
    startupIndustry: 'Startup Industry',
    industryRequired: 'Industry is required',
    specifyIndustry: 'Please specify your startup industry',
    specifyIndustryRequired: 'Please specify your industry',
    startupStage: 'Startup Stage',
    stageRequired: 'Stage is required',
    logoOptional: 'Logo (Optional)',
    changeLogo: 'Change Logo',
    uploadLogo: 'Upload Logo',
    websiteOptional: 'Website (Optional)',
    socialLinksOptional: 'Social Links (Optional)',
    updateStartup: 'Update Startup',
    createStartup: 'Create Startup',
    cancel: 'Cancel',
    myStartupsCount: 'My Startups ({count})',
    noStartupsYet: "You haven't created any startups yet.",
    employees: 'Employees:',
    industry: 'Industry:',
    stage: 'Stage:',
    created: 'Created:',
    website: 'Website:',
    visit: 'Visit',
    deleteStartup: 'Delete Startup',
    deleteConfirm: 'Are you sure you want to delete this startup? This action cannot be undone.',
    delete: 'Delete',
  },
  it: {
    loading: 'Caricamento startup...',
    myStartups: 'Le Mie Startup',
    manageProfiles: 'Gestisci i profili delle tue startup',
    addStartup: 'Aggiungi Startup',
    startupCreated: 'Startup creata con successo!',
    createFailed: 'Impossibile creare la startup',
    startupUpdated: 'Startup aggiornata con successo!',
    updateFailed: 'Impossibile aggiornare la startup',
    startupDeleted: 'Startup eliminata con successo!',
    deleteFailed: 'Impossibile eliminare la startup',
    editStartup: 'Modifica Startup',
    createNewStartup: 'Crea Nuova Startup',
    startupName: 'Nome Startup',
    startupNameRequired: 'Il nome della startup è obbligatorio',
    yourPosition: 'La Tua Posizione',
    positionRequired: 'La posizione è obbligatoria',
    numberOfEmployees: 'Numero di Dipendenti',
    employeesRequired: 'Il numero di dipendenti è obbligatorio',
    employees1to5: '1-5 dipendenti',
    employees6to10: '6-10 dipendenti',
    employees11to20: '11-20 dipendenti',
    employees21to50: '21-50 dipendenti',
    employees51to100: '51-100 dipendenti',
    employees100plus: '100+ dipendenti',
    startupIndustry: 'Settore Startup',
    industryRequired: 'Il settore è obbligatorio',
    specifyIndustry: 'Specifica il settore della tua startup',
    specifyIndustryRequired: 'Specifica il tuo settore',
    startupStage: 'Fase Startup',
    stageRequired: 'La fase è obbligatoria',
    logoOptional: 'Logo (Opzionale)',
    changeLogo: 'Cambia Logo',
    uploadLogo: 'Carica Logo',
    websiteOptional: 'Sito Web (Opzionale)',
    socialLinksOptional: 'Link Social (Opzionale)',
    updateStartup: 'Aggiorna Startup',
    createStartup: 'Crea Startup',
    cancel: 'Annulla',
    myStartupsCount: 'Le Mie Startup ({count})',
    noStartupsYet: 'Non hai ancora creato nessuna startup.',
    employees: 'Dipendenti:',
    industry: 'Settore:',
    stage: 'Fase:',
    created: 'Creato:',
    website: 'Sito Web:',
    visit: 'Visita',
    deleteStartup: 'Elimina Startup',
    deleteConfirm: 'Sei sicuro di voler eliminare questa startup? Questa azione non può essere annullata.',
    delete: 'Elimina',
  },
};

const StartupProfile = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
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

  const [formData, setFormData] = useState({
    startupName: '',
    position: '',
    numberOfEmployees: '',
    industry: '',
    industryOther: '',
    stage: '',
    website: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      github: '',
      telegram: '',
      whatsapp: '',
    },
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef(null);

  // Fetch all startups for the client
  const { data: startupsData, isLoading, error: fetchError } = useQuery({
    queryKey: ['startups'],
    queryFn: async () => {
      const response = await api.get('/startups/me');
      return response;
    },
  });

  const startups = startupsData?.data?.startups || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/startups', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['startups']);
      setIsCreating(false);
      resetForm();
      setSuccess(t.startupCreated);
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || t.createFailed);
      setSuccess('');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch(`/startups/${id}`, data);
      // Upload logo if provided
      if (logoFile) {
        await startupService.uploadLogo(id, logoFile);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['startups']);
      setEditingId(null);
      resetForm();
      setSuccess(t.startupUpdated);
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || t.updateFailed);
      setSuccess('');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/startups/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['startups']);
      setShowDeleteModal(null);
      setSuccess(t.startupDeleted);
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || t.deleteFailed);
      setSuccess('');
    },
  });

  const resetForm = () => {
    setFormData({
      startupName: '',
      position: '',
      numberOfEmployees: '',
      industry: '',
      industryOther: '',
      stage: '',
      website: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: '',
        github: '',
        telegram: '',
        whatsapp: '',
      },
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleEdit = (startup) => {
    setEditingId(startup._id);
    setFormData({
      startupName: startup.startupName || '',
      position: startup.position || '',
      numberOfEmployees: startup.numberOfEmployees || '',
      industry: startup.industry || '',
      industryOther: startup.industryOther || '',
      stage: startup.stage || '',
      website: startup.website || '',
      socialLinks: {
        linkedin: startup.socialLinks?.linkedin || '',
        twitter: startup.socialLinks?.twitter || '',
        facebook: startup.socialLinks?.facebook || '',
        instagram: startup.socialLinks?.instagram || '',
        github: startup.socialLinks?.github || '',
        telegram: startup.socialLinks?.telegram || '',
        whatsapp: startup.socialLinks?.whatsapp || '',
      },
    });
    setLogoPreview(startup.logo ? `${API_BASE_URL}${startup.logo}` : null);
    setLogoFile(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Handle industry - if "Other" is selected, use industryOther
    const submitData = {
      startupName: formData.startupName,
      position: formData.position,
      numberOfEmployees: formData.numberOfEmployees,
      stage: formData.stage,
    };

    if (formData.industry === 'Other' && formData.industryOther) {
      submitData.industry = formData.industryOther.trim();
      submitData.industryOther = formData.industryOther.trim();
    } else if (formData.industry && formData.industry !== 'Other') {
      submitData.industry = formData.industry;
    }

    // Add optional fields
    if (formData.website) {
      submitData.website = formData.website.trim();
    }

    // Add social links if any are provided
    const hasSocialLinks = Object.values(formData.socialLinks).some(link => link.trim());
    if (hasSocialLinks) {
      submitData.socialLinks = {};
      Object.keys(formData.socialLinks).forEach(key => {
        if (formData.socialLinks[key]?.trim()) {
          submitData.socialLinks[key] = formData.socialLinks[key].trim();
        }
      });
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return <Loading text={t.loading} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Rocket className="w-8 h-8" />
            {t.myStartups}
          </h1>
          <p className="text-gray-600 mt-1">{t.manageProfiles}</p>
        </div>
        {!isCreating && !editingId && (
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t.addStartup}
          </Button>
        )}
      </div>

      {success && (
        <Alert type="success" message={success} />
      )}

      {error && (
        <Alert type="error" message={error} />
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card title={editingId ? t.editStartup : t.createNewStartup}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label={t.startupName}
                  value={formData.startupName}
                  onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                  error={!formData.startupName ? t.startupNameRequired : ''}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label={t.yourPosition}
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  error={!formData.position ? t.positionRequired : ''}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  label={t.numberOfEmployees}
                  value={formData.numberOfEmployees}
                  onChange={(e) => setFormData({ ...formData, numberOfEmployees: e.target.value })}
                  error={!formData.numberOfEmployees ? t.employeesRequired : ''}
                  required
                  options={[
                    { value: '1-5', label: t.employees1to5 },
                    { value: '6-10', label: t.employees6to10 },
                    { value: '11-20', label: t.employees11to20 },
                    { value: '21-50', label: t.employees21to50 },
                    { value: '51-100', label: t.employees51to100 },
                    { value: '100+', label: t.employees100plus },
                  ]}
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  label={t.startupIndustry}
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  error={!formData.industry ? t.industryRequired : ''}
                  required
                  options={[
                    { value: 'Technology', label: 'Technology' },
                    { value: 'E-commerce', label: 'E-commerce' },
                    { value: 'Healthcare', label: 'Healthcare' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Education', label: 'Education' },
                    { value: 'Marketing', label: 'Marketing' },
                    { value: 'Real Estate', label: 'Real Estate' },
                    { value: 'Manufacturing', label: 'Manufacturing' },
                    { value: 'Consulting', label: 'Consulting' },
                    { value: 'Non-profit', label: 'Non-profit' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
              </div>

              {formData.industry === 'Other' && (
                <div className="md:col-span-2">
                  <Input
                    label={t.specifyIndustry}
                    value={formData.industryOther}
                    onChange={(e) => setFormData({ ...formData, industryOther: e.target.value })}
                    error={formData.industry === 'Other' && !formData.industryOther ? t.specifyIndustryRequired : ''}
                    required={formData.industry === 'Other'}
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <Select
                  label={t.startupStage}
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  error={!formData.stage ? t.stageRequired : ''}
                  required
                  options={[
                    { value: 'Idea', label: 'Idea' },
                    { value: 'MVP', label: 'MVP' },
                    { value: 'Early Stage', label: 'Early Stage' },
                    { value: 'Growth', label: 'Growth' },
                    { value: 'Scale', label: 'Scale' },
                  ]}
                />
              </div>

              {/* Logo Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.logoOptional}
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {logoPreview ? t.changeLogo : t.uploadLogo}
                    </Button>
                    {logoFile && (
                      <p className="text-xs text-gray-500 mt-1">{logoFile.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Website */}
              <div className="md:col-span-2">
                <Input
                  label={t.websiteOptional}
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              {/* Social Links */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.socialLinksOptional}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="LinkedIn"
                    type="url"
                    placeholder="https://linkedin.com/company/..."
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                    })}
                  />
                  <Input
                    label="Twitter"
                    type="url"
                    placeholder="https://twitter.com/..."
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                  />
                  <Input
                    label="Facebook"
                    type="url"
                    placeholder="https://facebook.com/..."
                    value={formData.socialLinks.facebook}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                    })}
                  />
                  <Input
                    label="Instagram"
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={formData.socialLinks.instagram}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                    })}
                  />
                  <Input
                    label="GitHub"
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value }
                    })}
                  />
                  <Input
                    label="Telegram"
                    type="url"
                    placeholder="https://t.me/..."
                    value={formData.socialLinks.telegram}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, telegram: e.target.value }
                    })}
                  />
                  <Input
                    label="WhatsApp"
                    type="url"
                    placeholder="https://wa.me/..."
                    value={formData.socialLinks.whatsapp}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, whatsapp: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                variant="primary"
                loading={createMutation.isPending || updateMutation.isPending}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? t.updateStartup : t.createStartup}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                {t.cancel}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Startups List */}
      <Card title={t.myStartupsCount.replace('{count}', startups.length)}>
        {startups.length === 0 ? (
          <div className="text-center py-12">
            <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{t.noStartupsYet}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {startups.map((startup) => (
              <div
                key={startup._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {startup.logo && (
                      <img
                        src={`${API_BASE_URL}${startup.logo}`}
                        alt={startup.startupName}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {startup.startupName}
                      </h3>
                      <p className="text-sm text-gray-600">{startup.position}</p>
                    </div>
                  </div>
                  {!isCreating && !editingId && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(startup)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteModal(startup._id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.employees}</span>
                    <span className="font-medium text-gray-900">{startup.numberOfEmployees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.industry}</span>
                    <span className="font-medium text-gray-900">{startup.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.stage}</span>
                    <span className="font-medium text-gray-900">{startup.stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.created}</span>
                    <span className="font-medium text-gray-900">
                      {new Date(startup.createdAt).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                    </span>
                  </div>
                  {startup.website && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.website}</span>
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        {t.visit}
                      </a>
                    </div>
                  )}
                  {(startup.socialLinks?.linkedin || startup.socialLinks?.twitter || startup.socialLinks?.github || startup.socialLinks?.facebook || startup.socialLinks?.instagram || startup.socialLinks?.telegram || startup.socialLinks?.whatsapp) && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {startup.socialLinks.linkedin && (
                        <a
                          href={startup.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                          title="LinkedIn"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                      {startup.socialLinks.twitter && (
                        <a
                          href={startup.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                          title="Twitter"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                      {startup.socialLinks.github && (
                        <a
                          href={startup.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                          title="GitHub"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                      {startup.socialLinks.facebook && (
                        <a
                          href={startup.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                          title="Facebook"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                      {startup.socialLinks.instagram && (
                        <a
                          href={startup.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                          title="Instagram"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                      {startup.socialLinks.telegram && (
                        <a
                          href={startup.socialLinks.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                          title="Telegram"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                      {startup.socialLinks.whatsapp && (
                        <a
                          href={startup.socialLinks.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700"
                          title="WhatsApp"
                        >
                          <LinkIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title={t.deleteStartup}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {t.deleteConfirm}
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(null)}
            >
              {t.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteMutation.mutate(showDeleteModal);
              }}
              loading={deleteMutation.isPending}
            >
              {t.delete}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StartupProfile;
