import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const SPEC_TYPES = [
  { value: 'select', label: 'Select (single)' },
  { value: 'multi_select', label: 'Select (multiple)' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Yes / No' },
];

const sanitizeSpecKey = (input) => {
  const raw = String(input ?? '');
  // lowercase, replace spaces/hyphens with underscore, drop invalid chars
  let v = raw.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
  // collapse multiple underscores
  v = v.replace(/_+/g, '_');
  return v;
};

const parseOptionsText = (text) => {
  return String(text ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

const Categories = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true,
    specs: [],
  });
  const [alert, setAlert] = useState({ type: '', message: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories-admin'],
    queryFn: () => categoryService.getAllCategoriesAdmin(),
  });

  const categories = data?.data?.categories || data?.categories || [];

  const getApiErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    if (typeof data?.error?.message === 'string' && data.error.message.trim()) return data.error.message;
    if (Array.isArray(data?.details?.errors) && data.details.errors.length > 0) {
      return data.details.errors.join('. ');
    }
    if (typeof err?.message === 'string' && err.message.trim()) return err.message;
    return fallback;
  };

  const createMutation = useMutation({
    mutationFn: (categoryData) => categoryService.createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories-admin']);
      queryClient.invalidateQueries(['categories']);
      setAlert({ type: 'success', message: 'Category created successfully!' });
      resetForm();
      setTimeout(() => setAlert({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setAlert({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Failed to create category. Please check your inputs and try again.'
        ),
      });
      setTimeout(() => setAlert({ type: '', message: '' }), 5000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories-admin']);
      queryClient.invalidateQueries(['categories']);
      setAlert({ type: 'success', message: 'Category updated successfully!' });
      resetForm();
      setTimeout(() => setAlert({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setAlert({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Failed to update category. Please check your inputs and try again.'
        ),
      });
      setTimeout(() => setAlert({ type: '', message: '' }), 5000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories-admin']);
      queryClient.invalidateQueries(['categories']);
      setAlert({ type: 'success', message: 'Category deleted successfully!' });
      setTimeout(() => setAlert({ type: '', message: '' }), 3000);
    },
    onError: (error) => {
      setAlert({
        type: 'error',
        message: getApiErrorMessage(
          error,
          'Failed to delete category. Please try again.'
        ),
      });
      setTimeout(() => setAlert({ type: '', message: '' }), 5000);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      isActive: true,
      specs: [],
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      isActive: category.isActive,
      specs: Array.isArray(category.specs) ? category.specs : [],
    });
    setShowForm(true);
  };

  const addSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specs: [
        ...(prev.specs || []),
        {
          key: '',
          label: '',
          type: 'select',
          options: [],
          useInJobPost: true,
          useInApplication: true,
          requiredInJobPost: false,
          requiredInApplication: false,
          min: undefined,
          max: undefined,
          defaultValue: undefined,
          isActive: true,
          order: (prev.specs || []).length,
        },
      ],
    }));
  };

  const removeSpec = (index) => {
    setFormData((prev) => {
      const nextSpecs = (prev.specs || []).filter((_, i) => i !== index);
      return { ...prev, specs: nextSpecs };
    });
  };

  const updateSpec = (index, patch) => {
    setFormData((prev) => {
      const specs = Array.isArray(prev.specs) ? [...prev.specs] : [];
      specs[index] = { ...specs[index], ...patch };
      return { ...prev, specs };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Category name is required' });
      setTimeout(() => setAlert({ type: '', message: '' }), 3000);
      return;
    }

    const normalizedSpecs = (formData.specs || []).map((spec) => {
      const type = spec?.type;
      const isOptionType = type === 'select' || type === 'multi_select';

      // keep a separate editable text field so commas don’t disappear while typing
      const optionsText =
        spec?._optionsText ??
        (Array.isArray(spec?.options) ? spec.options.join(', ') : '');

      const normalized = {
        ...spec,
        key: sanitizeSpecKey(spec?.key || ''),
      };

      if (isOptionType) {
        normalized.options = parseOptionsText(optionsText);
      } else {
        normalized.options = [];
      }

      // Do not send UI-only fields to backend
      delete normalized._optionsText;

      return normalized;
    });

    const payload = {
      ...formData,
      specs: normalizedSpecs,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will deactivate it if it's being used by job posts.`)) {
      deleteMutation.mutate(category._id);
    }
  };

  if (isLoading) {
    return <Loading text="Loading categories..." />;
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={`Failed to load categories: ${error.response?.data?.message || error.message}`}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Categories</h1>
          <p className="text-gray-600 mt-1">Manage job categories for the platform</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </Button>
      </div>

      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          className="mb-4"
        />
      )}

      {showForm && (
        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Web Development"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="input"
                placeholder="Optional description for this category"
              />
            </div>
            <Input
              label="Icon (Optional)"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="e.g., 💻 or icon class name"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            {/* Category Specs */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Category Specs</h3>
                  <p className="text-sm text-gray-600">
                    Define category-specific fields used in job posting and student applications (no free-text).
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={addSpec} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Spec
                </Button>
              </div>

              {(formData.specs || []).length === 0 ? (
                <div className="text-sm text-gray-500 italic">
                  No specs yet. Add one to customize jobs/applications for this category.
                </div>
              ) : (
                <div className="space-y-4">
                  {(formData.specs || []).map((spec, idx) => {
                    const isOptionType = spec.type === 'select' || spec.type === 'multi_select';
                    const isNumberType = spec.type === 'number';
                    const isBoolType = spec.type === 'boolean';
                    const optionsText =
                      spec._optionsText ?? (Array.isArray(spec.options) ? spec.options.join(', ') : '');

                    return (
                      <div key={spec._id || idx} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                              label="Key"
                              value={spec.key || ''}
                              onChange={(e) => updateSpec(idx, { key: sanitizeSpecKey(e.target.value) })}
                              placeholder="e.g., methodology"
                            />
                            <Input
                              label="Label"
                              value={spec.label || ''}
                              onChange={(e) => updateSpec(idx, { label: e.target.value })}
                              placeholder="e.g., Methodology"
                            />
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                              </label>
                              <select
                                className="input"
                                value={spec.type || 'select'}
                                onChange={(e) => {
                                  const nextType = e.target.value;
                                  const patch = { type: nextType };
                                  if (nextType !== 'select' && nextType !== 'multi_select') {
                                    patch.options = [];
                                  }
                                  if (nextType !== 'number') {
                                    patch.min = undefined;
                                    patch.max = undefined;
                                    patch.defaultValue = undefined;
                                  }
                                  if (nextType === 'boolean') {
                                    patch.defaultValue = spec.defaultValue === true;
                                  }
                                  updateSpec(idx, patch);
                                }}
                              >
                                {SPEC_TYPES.map((t) => (
                                  <option key={t.value} value={t.value}>
                                    {t.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSpec(idx)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove spec"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {isOptionType && (
                          <Input
                            label="Options (comma-separated)"
                            value={optionsText}
                            onChange={(e) => updateSpec(idx, { _optionsText: e.target.value })}
                            placeholder="e.g., Agile, Waterfall, Iterative"
                          />
                        )}

                        {(isNumberType || isBoolType) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {isNumberType && (
                              <>
                                <Input
                                  label="Min (optional)"
                                  type="number"
                                  value={spec.min ?? ''}
                                  onChange={(e) =>
                                    updateSpec(idx, {
                                      min: e.target.value === '' ? undefined : Number(e.target.value),
                                    })
                                  }
                                />
                                <Input
                                  label="Max (optional)"
                                  type="number"
                                  value={spec.max ?? ''}
                                  onChange={(e) =>
                                    updateSpec(idx, {
                                      max: e.target.value === '' ? undefined : Number(e.target.value),
                                    })
                                  }
                                />
                                <Input
                                  label="Default (optional)"
                                  type="number"
                                  value={spec.defaultValue ?? ''}
                                  onChange={(e) =>
                                    updateSpec(idx, {
                                      defaultValue: e.target.value === '' ? undefined : Number(e.target.value),
                                    })
                                  }
                                />
                              </>
                            )}
                            {isBoolType && (
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="checkbox"
                                  checked={spec.defaultValue === true}
                                  onChange={(e) => updateSpec(idx, { defaultValue: e.target.checked })}
                                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-700">Default = Yes</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={spec.useInJobPost === true}
                              onChange={(e) =>
                                updateSpec(idx, {
                                  useInJobPost: e.target.checked,
                                  requiredInJobPost: e.target.checked ? spec.requiredInJobPost === true : false,
                                })
                              }
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Use in Job Posting</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={spec.useInApplication === true}
                              onChange={(e) =>
                                updateSpec(idx, {
                                  useInApplication: e.target.checked,
                                  requiredInApplication: e.target.checked ? spec.requiredInApplication === true : false,
                                })
                              }
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Use in Student Application</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={spec.isActive !== false}
                              onChange={(e) => updateSpec(idx, { isActive: e.target.checked })}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Active</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={spec.requiredInJobPost === true}
                              disabled={!spec.useInJobPost}
                              onChange={(e) => updateSpec(idx, { requiredInJobPost: e.target.checked })}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                            />
                            <span className={`text-sm ${!spec.useInJobPost ? 'text-gray-400' : 'text-gray-700'}`}>
                              Required in Job Posting
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={spec.requiredInApplication === true}
                              disabled={!spec.useInApplication}
                              onChange={(e) => updateSpec(idx, { requiredInApplication: e.target.checked })}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                            />
                            <span className={`text-sm ${!spec.useInApplication ? 'text-gray-400' : 'text-gray-700'}`}>
                              Required in Student Application
                            </span>
                          </div>
                          <Input
                            label="Order"
                            type="number"
                            value={spec.order ?? 0}
                            onChange={(e) => updateSpec(idx, { order: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No categories found. Create your first category!
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className={!category.isActive ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {category.icon || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.jobCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Categories;

