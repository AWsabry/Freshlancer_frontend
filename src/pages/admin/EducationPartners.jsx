import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { educationBadgeService } from '../../services/educationBadgeService';
import { categoryService } from '../../services/categoryService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Alert from '../../components/common/Alert';
import { Plus, Edit, Trash2, GraduationCap, Award, Mail } from 'lucide-react';

const EducationPartners = () => {
  const queryClient = useQueryClient();
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);
  const [editingCert, setEditingCert] = useState(null);

  const [entityForm, setEntityForm] = useState({
    name: '',
    description: '',
    website: '',
    sortOrder: '0',
    isActive: true,
    logo: null,
  });

  const [certForm, setCertForm] = useState({
    title: '',
    track: '',
    description: '',
    categoryId: '',
    sortOrder: '0',
    isActive: true,
    image: null,
  });

  const { data: entitiesData, isLoading } = useQuery({
    queryKey: ['educationEntities'],
    queryFn: () => educationBadgeService.getEntities(),
  });

  const entities = entitiesData?.data?.entities || [];

  const { data: entityDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['educationEntity', selectedEntityId],
    queryFn: () => educationBadgeService.getEntity(selectedEntityId),
    enabled: !!selectedEntityId,
  });

  const certificates = entityDetail?.data?.certificates || [];

  const { data: categoriesData } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => categoryService.getAllCategoriesAdmin(),
  });

  const categoryOptions = [
    { value: '', label: 'None (optional)' },
    ...(categoriesData?.categories || []).map((cat) => ({
      value: cat._id,
      label: cat.name,
    })),
  ];

  const saveEntityMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('name', entityForm.name);
      fd.append('description', entityForm.description || '');
      fd.append('website', entityForm.website || '');
      fd.append('sortOrder', entityForm.sortOrder);
      fd.append('isActive', entityForm.isActive);
      if (entityForm.logo) fd.append('logo', entityForm.logo);

      if (editingEntity) {
        return educationBadgeService.updateEntity(editingEntity._id, fd);
      }
      return educationBadgeService.createEntity(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['educationEntities']);
      if (selectedEntityId) queryClient.invalidateQueries(['educationEntity', selectedEntityId]);
      setShowEntityModal(false);
      setEditingEntity(null);
    },
  });

  const deleteEntityMutation = useMutation({
    mutationFn: (id) => educationBadgeService.deleteEntity(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['educationEntities']);
      setSelectedEntityId(null);
    },
  });

  const saveCertMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('title', certForm.title);
      fd.append('track', certForm.track);
      fd.append('description', certForm.description || '');
      fd.append('categoryId', certForm.categoryId || '');
      fd.append('sortOrder', certForm.sortOrder);
      fd.append('isActive', certForm.isActive);
      if (certForm.image) fd.append('image', certForm.image);

      if (editingCert) {
        return educationBadgeService.updateCertificate(editingCert._id, fd);
      }
      return educationBadgeService.createCertificate(selectedEntityId, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['educationEntity', selectedEntityId]);
      queryClient.invalidateQueries(['educationEntities']);
      setShowCertModal(false);
      setEditingCert(null);
    },
  });

  const deleteCertMutation = useMutation({
    mutationFn: (id) => educationBadgeService.deleteCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['educationEntity', selectedEntityId]);
      queryClient.invalidateQueries(['educationEntities']);
    },
  });

  const openCreateEntity = () => {
    setEditingEntity(null);
    setEntityForm({
      name: '',
      description: '',
      website: '',
      sortOrder: '0',
      isActive: true,
      logo: null,
    });
    setShowEntityModal(true);
  };

  const openEditEntity = (entity) => {
    setEditingEntity(entity);
    setEntityForm({
      name: entity.name,
      description: entity.description || '',
      website: entity.website || '',
      sortOrder: String(entity.sortOrder || 0),
      isActive: entity.isActive !== false,
      logo: null,
    });
    setShowEntityModal(true);
  };

  const openCreateCert = () => {
    setEditingCert(null);
    setCertForm({
      title: '',
      track: '',
      description: '',
      categoryId: '',
      sortOrder: '0',
      isActive: true,
      image: null,
    });
    setShowCertModal(true);
  };

  const openEditCert = (cert) => {
    setEditingCert(cert);
    const categoryId =
      cert.category?._id || (typeof cert.category === 'string' ? cert.category : '') || '';
    setCertForm({
      title: cert.title,
      track: cert.track,
      description: cert.description || '',
      categoryId,
      sortOrder: String(cert.sortOrder || 0),
      isActive: cert.isActive !== false,
      image: null,
    });
    setShowCertModal(true);
  };

  if (isLoading) return <Loading text="Loading partners..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-primary-600" />
            Education partners
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage partner entities and certificate catalog.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/admin/education-badges/grants">
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Bulk grant
            </Button>
          </Link>
          <Link to="/admin/education-badges/requests">
            <Button variant="outline" size="sm">
              Requests
            </Button>
          </Link>
          <Link to="/admin/education-badges/awards">
            <Button variant="outline" size="sm">
              Student awards
            </Button>
          </Link>
          <Button onClick={openCreateEntity}>
            <Plus className="w-4 h-4 mr-2" />
            Add partner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Partners">
          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {entities.length === 0 ? (
              <p className="text-gray-500 text-sm">No partners yet.</p>
            ) : (
              entities.map((entity) => (
                <button
                  key={entity._id}
                  type="button"
                  onClick={() => setSelectedEntityId(entity._id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedEntityId === entity._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {entity.logoUrl ? (
                      <img
                        src={entity.logoUrl}
                        alt=""
                        className="w-10 h-10 rounded object-contain border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{entity.name}</div>
                      <div className="text-xs text-gray-500">
                        {entity.certificateCount || 0} certificates
                      </div>
                    </div>
                    <Badge variant={entity.isActive ? 'success' : 'secondary'}>
                      {entity.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card
          title={
            selectedEntityId
              ? entityDetail?.data?.entity?.name || 'Certificates'
              : 'Certificates'
          }
        >
          {!selectedEntityId ? (
            <p className="text-gray-500 text-sm">Select a partner to manage certificates.</p>
          ) : loadingDetail ? (
            <Loading text="Loading..." />
          ) : (
            <>
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => openEditEntity(entityDetail.data.entity)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit partner
                </Button>
                <Button size="sm" onClick={openCreateCert}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add certificate
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (window.confirm('Delete this partner?')) {
                      deleteEntityMutation.mutate(selectedEntityId);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {certificates.length === 0 ? (
                  <p className="text-gray-500 text-sm">No certificates in catalog.</p>
                ) : (
                  certificates.map((cert) => (
                    <div
                      key={cert._id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      {cert.imageUrl ? (
                        <img
                          src={cert.imageUrl}
                          alt=""
                          className="w-12 h-12 object-contain rounded border"
                        />
                      ) : (
                        <Award className="w-10 h-10 text-gray-300" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{cert.title}</div>
                        <div className="text-sm text-gray-600">{cert.track}</div>
                        {cert.category?.name && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Category: {cert.category.name}
                          </div>
                        )}
                        <Badge variant={cert.isActive ? 'success' : 'secondary'} className="mt-1">
                          {cert.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEditCert(cert)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (window.confirm('Delete certificate?')) {
                              deleteCertMutation.mutate(cert._id);
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal
        isOpen={showEntityModal}
        onClose={() => setShowEntityModal(false)}
        title={editingEntity ? 'Edit partner' : 'Add partner'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={entityForm.name}
            onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
            required
          />
          <Input
            label="Website"
            value={entityForm.website}
            onChange={(e) => setEntityForm({ ...entityForm, website: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={3}
              value={entityForm.description}
              onChange={(e) => setEntityForm({ ...entityForm, description: e.target.value })}
            />
          </div>
          <Input
            label="Sort order"
            type="number"
            value={entityForm.sortOrder}
            onChange={(e) => setEntityForm({ ...entityForm, sortOrder: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEntityForm({ ...entityForm, logo: e.target.files?.[0] || null })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={entityForm.isActive}
              onChange={(e) => setEntityForm({ ...entityForm, isActive: e.target.checked })}
            />
            Active
          </label>
          {saveEntityMutation.isError && (
            <Alert variant="error" message={saveEntityMutation.error?.message || 'Save failed'} />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEntityModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveEntityMutation.mutate()}
              loading={saveEntityMutation.isPending}
              disabled={!entityForm.name.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        title={editingCert ? 'Edit certificate' : 'Add certificate'}
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={certForm.title}
            onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
            required
          />
          <Input
            label="Track / course"
            value={certForm.track}
            onChange={(e) => setCertForm({ ...certForm, track: e.target.value })}
            required
          />
          <Select
            label="Category (optional)"
            placeholder="None (optional)"
            options={categoryOptions}
            value={certForm.categoryId}
            onChange={(e) => setCertForm({ ...certForm, categoryId: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              value={certForm.description}
              onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setCertForm({ ...certForm, image: e.target.files?.[0] || null })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCertModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveCertMutation.mutate()}
              loading={saveCertMutation.isPending}
              disabled={!certForm.title.trim() || !certForm.track.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EducationPartners;
