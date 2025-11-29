import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Package,
  Flame,
  Eye,
  Zap,
  TrendingUp,
  Star,
  Crown,
} from 'lucide-react';

const ClientPackages = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    pointsTotal: '',
    priceUSD: '',
    description: '',
    features: [''],
    profileViewsPerJob: '',
    icon: 'Package',
    color: 'primary',
    popular: false,
    hot: false,
    isActive: true,
    displayOrder: 0,
  });

  // Fetch packages
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['adminPackages'],
    queryFn: () => adminService.getAllPackages(),
  });

  // Create package mutation
  const createMutation = useMutation({
    mutationFn: (data) => adminService.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      setShowCreateModal(false);
      resetForm();
      alert('Package created successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create package');
    },
  });

  // Update package mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminService.updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      setShowEditModal(false);
      setSelectedPackage(null);
      resetForm();
      alert('Package updated successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update package');
    },
  });

  // Delete package mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPackages']);
      alert('Package deleted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete package');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      pointsTotal: '',
      priceUSD: '',
      description: '',
      features: [''],
      profileViewsPerJob: '',
      icon: 'Package',
      color: 'primary',
      popular: false,
      hot: false,
      isActive: true,
      displayOrder: 0,
    });
  };

  const handleEdit = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      type: pkg.type,
      pointsTotal: pkg.pointsTotal,
      priceUSD: pkg.priceUSD,
      description: pkg.description,
      features: pkg.features && pkg.features.length > 0 ? pkg.features : [''],
      profileViewsPerJob: pkg.profileViewsPerJob || '',
      icon: pkg.icon || 'Package',
      color: pkg.color || 'primary',
      popular: pkg.popular || false,
      hot: pkg.hot || false,
      isActive: pkg.isActive !== undefined ? pkg.isActive : true,
      displayOrder: pkg.displayOrder || 0,
    });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedData = { ...formData };
    cleanedData.pointsTotal = parseInt(cleanedData.pointsTotal);
    cleanedData.priceUSD = parseFloat(cleanedData.priceUSD);
    cleanedData.displayOrder = parseInt(cleanedData.displayOrder) || 0;
    if (cleanedData.profileViewsPerJob) {
      cleanedData.profileViewsPerJob = parseInt(cleanedData.profileViewsPerJob);
    }
    cleanedData.features = cleanedData.features.filter(f => f.trim());

    if (showEditModal && selectedPackage) {
      updateMutation.mutate({ id: selectedPackage._id, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };

    // Auto-calculate Profile Views Per Job when Points Total changes
    if (name === 'pointsTotal' && value) {
      const pointsTotal = parseInt(value);
      if (!isNaN(pointsTotal) && pointsTotal > 0) {
        updatedData.profileViewsPerJob = Math.floor(pointsTotal / 10).toString();
      } else {
        updatedData.profileViewsPerJob = '';
      }
    }

    setFormData(updatedData);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f),
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return <Loading text="Loading packages..." />;
  }

  const packages = packagesData?.data?.packages || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-600" />
            Client Packages Management
          </h1>
          <p className="text-gray-600 mt-2">Create and manage points packages for clients</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Package
        </Button>
      </div>

      {/* Packages List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {packages.length === 0 ? (
          <Card className="lg:col-span-2">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No packages found. Create your first package!</p>
            </div>
          </Card>
        ) : (
          packages.map((pkg) => (
            <Card key={pkg._id} className={!pkg.isActive ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    {pkg.hot && (
                      <Badge variant="error" className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        Hot
                      </Badge>
                    )}
                    {pkg.popular && (
                      <Badge variant="success">Popular</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{pkg.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant={pkg.isActive ? 'success' : 'error'}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="info">
                      {pkg.pointsTotal} Points
                    </Badge>
                    <Badge variant="info">
                      ${pkg.priceUSD} USD
                    </Badge>
                    <Badge variant="default">
                      {pkg.type}
                    </Badge>
                  </div>

                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="text-sm text-gray-600 mb-3 space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(pkg)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => handleDelete(pkg._id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedPackage(null);
          resetForm();
        }}
        title={showEditModal ? 'Edit Package' : 'Create New Package'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Package Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="e.g., 500 Points"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Package Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              options={[
                { value: 'basic', label: 'Basic' },
                { value: 'professional', label: 'Professional' },
                { value: 'enterprise', label: 'Enterprise' },
                { value: 'custom', label: 'Custom' },
              ]}
            />

            <Input
              label="Display Order"
              name="displayOrder"
              type="number"
              min="0"
              value={formData.displayOrder}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Points Total"
              name="pointsTotal"
              type="number"
              min="1"
              value={formData.pointsTotal}
              onChange={handleInputChange}
              required
              placeholder="e.g., 500"
            />

            <Input
              label="Price (USD)"
              name="priceUSD"
              type="number"
              min="0"
              step="0.01"
              value={formData.priceUSD}
              onChange={handleInputChange}
              required
              placeholder="e.g., 9.99"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Describe the package..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              options={[
                { value: 'Eye', label: 'Eye' },
                { value: 'Zap', label: 'Zap' },
                { value: 'TrendingUp', label: 'Trending Up' },
                { value: 'Package', label: 'Package' },
                { value: 'Star', label: 'Star' },
                { value: 'Crown', label: 'Crown' },
              ]}
            />

            <Select
              label="Color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              options={[
                { value: 'blue', label: 'Blue' },
                { value: 'primary', label: 'Primary' },
                { value: 'purple', label: 'Purple' },
                { value: 'green', label: 'Green' },
                { value: 'red', label: 'Red' },
                { value: 'yellow', label: 'Yellow' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Views Per Job (auto-calculated)
            </label>
            <Input
              name="profileViewsPerJob"
              type="number"
              min="0"
              value={formData.profileViewsPerJob}
              onChange={handleInputChange}
              placeholder="Auto-calculated: Points Total / 10"
            />
            <p className="text-xs text-gray-500 mt-1">
              Automatically calculated as Points Total / 10. You can manually override if needed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Feature description"
                />
                <Button
                  type="button"
                  variant="error"
                  size="sm"
                  onClick={() => removeFeature(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addFeature}>
              Add Feature
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="popular"
                  checked={formData.popular}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hot"
                  checked={formData.hot}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Hot</span>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedPackage(null);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {showEditModal ? 'Update Package' : 'Create Package'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientPackages;

