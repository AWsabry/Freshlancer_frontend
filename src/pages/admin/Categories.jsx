import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../services/categoryService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Alert from '../../components/common/Alert';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const Categories = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true,
  });
  const [alert, setAlert] = useState({ type: '', message: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories-admin'],
    queryFn: () => categoryService.getAllCategoriesAdmin(),
  });

  const categories = data?.categories || [];
  console.log("categories" + categories);

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
        message: error.response?.data?.message || 'Failed to create category',
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
        message: error.response?.data?.message || 'Failed to update category',
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
        message: error.response?.data?.message || 'Failed to delete category',
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
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setAlert({ type: 'error', message: 'Category name is required' });
      setTimeout(() => setAlert({ type: '', message: '' }), 3000);
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: formData });
    } else {
      createMutation.mutate(formData);
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

