import React, { useState, useRef } from 'react';
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

const StartupProfile = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(null);

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
      setSuccess('Startup created successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to create startup');
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
      setSuccess('Startup updated successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to update startup');
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
      setSuccess('Startup deleted successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to delete startup');
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
    return <Loading text="Loading startups..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Rocket className="w-8 h-8" />
            My Startups
          </h1>
          <p className="text-gray-600 mt-1">Manage your startup profiles</p>
        </div>
        {!isCreating && !editingId && (
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Startup
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
        <Card title={editingId ? 'Edit Startup' : 'Create New Startup'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Startup Name"
                  value={formData.startupName}
                  onChange={(e) => setFormData({ ...formData, startupName: e.target.value })}
                  error={!formData.startupName ? 'Startup name is required' : ''}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Your Position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  error={!formData.position ? 'Position is required' : ''}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  label="Number of Employees"
                  value={formData.numberOfEmployees}
                  onChange={(e) => setFormData({ ...formData, numberOfEmployees: e.target.value })}
                  error={!formData.numberOfEmployees ? 'Number of employees is required' : ''}
                  required
                  options={[
                    { value: '1-5', label: '1-5 employees' },
                    { value: '6-10', label: '6-10 employees' },
                    { value: '11-20', label: '11-20 employees' },
                    { value: '21-50', label: '21-50 employees' },
                    { value: '51-100', label: '51-100 employees' },
                    { value: '100+', label: '100+ employees' },
                  ]}
                />
              </div>

              <div className="md:col-span-2">
                <Select
                  label="Startup Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  error={!formData.industry ? 'Industry is required' : ''}
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
                    label="Please specify your startup industry"
                    value={formData.industryOther}
                    onChange={(e) => setFormData({ ...formData, industryOther: e.target.value })}
                    error={formData.industry === 'Other' && !formData.industryOther ? 'Please specify your industry' : ''}
                    required={formData.industry === 'Other'}
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <Select
                  label="Startup Stage"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  error={!formData.stage ? 'Stage is required' : ''}
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
                  Logo (Optional)
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
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
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
                  label="Website (Optional)"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              {/* Social Links */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Links (Optional)
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
                {editingId ? 'Update Startup' : 'Create Startup'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Startups List */}
      <Card title={`My Startups (${startups.length})`}>
        {startups.length === 0 ? (
          <div className="text-center py-12">
            <Rocket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You haven't created any startups yet.</p>
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
                    <span className="text-gray-500">Employees:</span>
                    <span className="font-medium text-gray-900">{startup.numberOfEmployees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Industry:</span>
                    <span className="font-medium text-gray-900">{startup.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Stage:</span>
                    <span className="font-medium text-gray-900">{startup.stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(startup.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {startup.website && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Website:</span>
                      <a
                        href={startup.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        Visit
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
        title="Delete Startup"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this startup? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteMutation.mutate(showDeleteModal);
              }}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StartupProfile;
