import api from './api';

export const categoryService = {
  // Get all active categories (public)
  getAllCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get single category
  getCategory: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Admin: Get all categories including inactive
  getAllCategoriesAdmin: async () => {
    const response = await api.get('/categories/admin/all');
    return response.data;
  },

  // Admin: Create category
  createCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Admin: Update category
  updateCategory: async (id, categoryData) => {
    const response = await api.patch(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Admin: Delete category (soft delete)
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Admin: Hard delete category
  hardDeleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}/hard`);
    return response.data;
  },
};

