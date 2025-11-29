import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { offerService } from '../../services/offerService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Gift,
  Users,
  Calendar,
  Eye,
  Award,
} from 'lucide-react';

const Coupons = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [filterAudience, setFilterAudience] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: 'both',
    offerType: 'discount',
    discountPercentage: '',
    discountAmount: '',
    couponCode: '',
    startDate: '',
    endDate: '',
    maxUsageCount: '',
    featured: false,
    badgeText: '',
    badgeColor: 'blue',
    isActive: true,
    terms: '',
  });

  // Fetch offers with coupon codes only
  const { data: offersData, isLoading } = useQuery({
    queryKey: ['coupons', filterAudience, filterActive],
    queryFn: async () => {
      // Build params object - only include non-empty filters
      const params = {};
      if (filterAudience && filterAudience.trim() !== '') {
        params.targetAudience = filterAudience;
      }
      if (filterActive && filterActive.trim() !== '') {
        params.isActive = filterActive;
      }
      // Increase limit to get all coupons (admin should see all)
      // Convert to string to ensure it's passed as query parameter correctly
      params.limit = '1000';
      params.page = '1';
      
      const response = await offerService.getAllOffers(params);
      
      // Backend returns: { status, results, data: { offers, pagination } }
      // API interceptor returns response.data, so response is already the data object
      // Handle both response structures
      let offers = [];
      if (response && typeof response === 'object') {
        if (response.data && Array.isArray(response.data.offers)) {
          offers = response.data.offers;
        } else if (Array.isArray(response.offers)) {
          offers = response.offers;
        } else if (Array.isArray(response)) {
          offers = response;
        }
      }
      
      // Filter only offers with coupon codes (non-empty, non-null, non-undefined)
      // This ensures we only show offers that have a valid couponCode
      const coupons = offers.filter(offer => {
        return offer.couponCode && 
               typeof offer.couponCode === 'string' && 
               offer.couponCode.trim() !== '';
      });
      
      return { 
        ...response, 
        offers: coupons,
        data: {
          ...response.data,
          offers: coupons
        }
      };
    },
  });

  // Helper function to extract clear error messages
  // Note: API interceptor returns error.response.data, so error might already be the data object
  const getErrorMessage = (error) => {
    // The error might be error.response.data (from API interceptor) or the full error object
    const errorData = error.response?.data || error;
    
    // Check for explicit message
    if (errorData.message) {
      return errorData.message;
    }
    
    // Check for validation errors array
    if (errorData.errors && Array.isArray(errorData.errors)) {
      return errorData.errors.join('. ');
    }
    
    // Check for error object with messages (Mongoose validation errors)
    if (errorData.errors && typeof errorData.errors === 'object') {
      const errorMessages = Object.values(errorData.errors)
        .map(err => {
          if (typeof err === 'string') return err;
          if (err?.message) return err.message;
          if (err?.properties?.message) return err.properties.message;
          return String(err);
        })
        .filter(Boolean);
      if (errorMessages.length > 0) {
        return errorMessages.join('. ');
      }
    }
    
    // Check for error string
    if (typeof errorData.error === 'string') {
      return errorData.error;
    }
    
    // Check for status code to provide context
    if (error.response?.status) {
      const status = error.response.status;
      if (status === 404) {
        return 'Coupon not found. It may have been deleted.';
      } else if (status === 400) {
        return 'Invalid data provided. Please check all fields and try again.';
      } else if (status === 403) {
        return 'You do not have permission to perform this action.';
      } else if (status === 409) {
        return 'A coupon with this code already exists. Please use a different code.';
      } else if (status >= 500) {
        return 'Server error occurred. Please try again later or contact support.';
      }
    }
    
    // Check for network errors
    if (error.message) {
      if (error.message.includes('Network Error') || error.message.includes('timeout')) {
        return 'Network error: Please check your internet connection and try again.';
      }
      return error.message;
    }
    
    // Default fallback
    return 'An unexpected error occurred. Please check all fields and try again. If the problem persists, contact support.';
  };

  // Create coupon mutation
  const createMutation = useMutation({
    mutationFn: (data) => offerService.createOffer(data),
    onSuccess: async () => {
      // Invalidate all coupon queries (with any filter combinations)
      await queryClient.invalidateQueries({ 
        queryKey: ['coupons'],
        exact: false // This will match all queries starting with ['coupons']
      });
      // Refetch the current query with current filters
      await queryClient.refetchQueries({ 
        queryKey: ['coupons', filterAudience, filterActive]
      });
      setShowCreateModal(false);
      resetForm();
      alert('Coupon created successfully!');
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      alert(`Failed to create coupon: ${errorMessage}`);
    },
  });

  // Update coupon mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => offerService.updateOffer(id, data),
    onSuccess: async () => {
      // Invalidate all coupon queries (with any filter combinations)
      await queryClient.invalidateQueries({ 
        queryKey: ['coupons'],
        exact: false // This will match all queries starting with ['coupons']
      });
      // Refetch the current query with current filters
      await queryClient.refetchQueries({ 
        queryKey: ['coupons', filterAudience, filterActive]
      });
      setShowEditModal(false);
      setSelectedCoupon(null);
      resetForm();
      alert('Coupon updated successfully!');
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      alert(`Failed to update coupon: ${errorMessage}`);
    },
  });

  // Delete coupon mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => offerService.deleteOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['coupons']);
      alert('Coupon deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      alert(`Failed to delete coupon: ${errorMessage}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetAudience: 'both',
      offerType: 'discount',
      discountPercentage: '',
      discountAmount: '',
      couponCode: '',
      startDate: '',
      endDate: '',
      maxUsageCount: '',
      featured: false,
      badgeText: '',
      badgeColor: 'blue',
      isActive: true,
      terms: '',
    });
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      title: coupon.title,
      description: coupon.description,
      targetAudience: coupon.targetAudience,
      offerType: coupon.offerType,
      discountPercentage: coupon.discountPercentage || '',
      discountAmount: coupon.discountAmount || '',
      couponCode: coupon.couponCode || '',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      maxUsageCount: coupon.maxUsageCount || '',
      featured: coupon.featured || false,
      badgeText: coupon.badgeText || '',
      badgeColor: coupon.badgeColor || 'blue',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      terms: coupon.terms || '',
    });
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedData = { ...formData };
    
    // Create dates at start of day in UTC to avoid timezone issues
    // Format: YYYY-MM-DD -> create date at 00:00:00 UTC
    const startDateStr = cleanedData.startDate;
    const endDateStr = cleanedData.endDate;
    
    // Create dates at midnight UTC to avoid timezone conversion issues
    cleanedData.startDate = new Date(Date.UTC(
      parseInt(startDateStr.split('-')[0]),
      parseInt(startDateStr.split('-')[1]) - 1, // Month is 0-indexed
      parseInt(startDateStr.split('-')[2])
    ));
    
    cleanedData.endDate = new Date(Date.UTC(
      parseInt(endDateStr.split('-')[0]),
      parseInt(endDateStr.split('-')[1]) - 1, // Month is 0-indexed
      parseInt(endDateStr.split('-')[2])
    ));
    
    // Preserve couponCode - only uppercase and trim if it exists
    if (cleanedData.couponCode && cleanedData.couponCode.trim()) {
      cleanedData.couponCode = cleanedData.couponCode.toUpperCase().trim();
    } else if (showEditModal && selectedCoupon && selectedCoupon.couponCode) {
      // If editing and couponCode is empty, preserve the original
      cleanedData.couponCode = selectedCoupon.couponCode;
    } else if (!cleanedData.couponCode || !cleanedData.couponCode.trim()) {
      // If no coupon code provided and not editing, remove it from the update
      delete cleanedData.couponCode;
    }

    if (cleanedData.discountPercentage) {
      cleanedData.discountPercentage = parseFloat(cleanedData.discountPercentage);
    }
    if (cleanedData.discountAmount) {
      cleanedData.discountAmount = parseFloat(cleanedData.discountAmount);
    }
    if (cleanedData.maxUsageCount) {
      cleanedData.maxUsageCount = parseInt(cleanedData.maxUsageCount);
    }

    if (showEditModal && selectedCoupon) {
      updateMutation.mutate({ id: selectedCoupon._id, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (isLoading) {
    return <Loading text="Loading coupons..." />;
  }

  // Extract coupons from the response structure
  // The query function returns { offers, data: { offers, ... } }
  const coupons = offersData?.offers || offersData?.data?.offers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Tag className="w-8 h-8 text-primary-600" />
            Coupons Management
          </h1>
          <p className="text-gray-600 mt-2">Create and manage discount coupons for students and clients</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Coupon
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Target Audience"
            value={filterAudience}
            onChange={(e) => {
              const value = e.target.value;
              setFilterAudience(value);
            }}
            placeholder="All Audiences"
            options={[
              { value: 'student', label: 'Students Only' },
              { value: 'client', label: 'Clients Only' },
              { value: 'both', label: 'Both' },
            ]}
          />
          <Select
            label="Status"
            value={filterActive}
            onChange={(e) => {
              const value = e.target.value;
              setFilterActive(value);
            }}
            placeholder="All Statuses"
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
        </div>
      </Card>

      {/* Coupons List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {coupons.length === 0 ? (
          <Card className="lg:col-span-2">
            <div className="text-center py-12">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No coupons found. Create your first coupon!</p>
            </div>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon._id} className={!coupon.isActive ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{coupon.title}</h3>
                    {coupon.featured && (
                      <Award className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{coupon.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant={coupon.isActive ? 'success' : 'error'}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="info">
                      {coupon.targetAudience === 'both' ? 'All Users' :
                       coupon.targetAudience === 'student' ? 'Students' : 'Clients'}
                    </Badge>
                    {coupon.badgeText && (
                      <Badge variant="default">{coupon.badgeText}</Badge>
                    )}
                  </div>

                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">Coupon Code:</span>
                    </div>
                    <code className="text-lg font-bold text-primary-600 font-mono">
                      {coupon.couponCode}
                    </code>
                    <div className="mt-2 text-sm text-gray-600">
                      {coupon.discountPercentage ? (
                        <span>{coupon.discountPercentage}% discount</span>
                      ) : coupon.discountAmount ? (
                        <span>${coupon.discountAmount} discount</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>
                        {coupon.currentUsageCount || 0} / {coupon.maxUsageCount || '∞'} used
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(coupon)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => handleDelete(coupon._id)}
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
          setSelectedCoupon(null);
          resetForm();
        }}
        title={showEditModal ? 'Edit Coupon' : 'Create New Coupon'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="e.g., Summer Sale 2024"
          />

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
              placeholder="Describe the coupon..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Target Audience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              required
              options={[
                { value: 'student', label: 'Students Only' },
                { value: 'client', label: 'Clients Only' },
                { value: 'both', label: 'Both' },
              ]}
            />

            <Select
              label="Offer Type"
              name="offerType"
              value={formData.offerType}
              onChange={handleInputChange}
              required
              options={[
                { value: 'discount', label: 'Discount' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount Percentage (%)"
              name="discountPercentage"
              type="number"
              min="0"
              max="100"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              placeholder="e.g., 50"
            />
            <Input
              label="OR Fixed Discount Amount"
              name="discountAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.discountAmount}
              onChange={handleInputChange}
              placeholder="e.g., 10.00"
            />
          </div>

          <Input
            label="Coupon Code"
            name="couponCode"
            value={formData.couponCode}
            onChange={handleInputChange}
            required
            placeholder="e.g., SUMMER2024"
            className="uppercase"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Max Usage Count (optional)"
            name="maxUsageCount"
            type="number"
            min="1"
            value={formData.maxUsageCount}
            onChange={handleInputChange}
            placeholder="Leave empty for unlimited"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Badge Text (optional)"
              name="badgeText"
              value={formData.badgeText}
              onChange={handleInputChange}
              placeholder="e.g., HOT DEAL"
            />
            <Select
              label="Badge Color"
              name="badgeColor"
              value={formData.badgeColor}
              onChange={handleInputChange}
              options={[
                { value: 'red', label: 'Red' },
                { value: 'blue', label: 'Blue' },
                { value: 'green', label: 'Green' },
                { value: 'yellow', label: 'Yellow' },
                { value: 'purple', label: 'Purple' },
                { value: 'pink', label: 'Pink' },
              ]}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Featured Coupon</span>
            </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms & Conditions (optional)
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Terms and conditions..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setSelectedCoupon(null);
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
              {showEditModal ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Coupons;

