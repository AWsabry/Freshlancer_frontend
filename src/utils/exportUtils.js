/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions [{ key: 'fieldName', label: 'Display Name' }]
 * @param {String} filename - Name of the file (without extension)
 */
export const exportToCSV = (data, columns, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create CSV header
  const headers = columns.map(col => col.label || col.key).join(',');

  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      let value = '';
      
      // Handle nested properties (e.g., 'user.name')
      const keys = col.key.split('.');
      let nestedValue = item;
      for (const key of keys) {
        nestedValue = nestedValue?.[key];
        if (nestedValue === undefined || nestedValue === null) break;
      }
      
      value = nestedValue !== undefined && nestedValue !== null ? nestedValue : '';
      
      // Format the value
      if (col.formatter && typeof col.formatter === 'function') {
        value = col.formatter(value, item);
      }
      
      // Handle dates
      if (value instanceof Date) {
        value = value.toLocaleDateString();
      }
      
      // Escape commas and quotes in CSV
      if (typeof value === 'string') {
        // Replace double quotes with two double quotes (CSV escaping)
        value = value.replace(/"/g, '""');
        // Wrap in quotes if contains comma, newline, or quote
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
      }
      
      return value;
    }).join(',');
  });

  // Combine header and rows
  const csvContent = [headers, ...rows].join('\n');

  // Add BOM for UTF-8 (helps Excel recognize encoding)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Export data to Excel (XLSX) format using a simple approach
 * Note: For full Excel support, you might want to use a library like 'xlsx'
 * This is a basic implementation that creates a CSV with .xlsx extension
 */
export const exportToExcel = (data, columns, filename = 'export') => {
  // For now, we'll use CSV format but with .xlsx extension
  // In production, you might want to use a library like 'xlsx' for proper Excel format
  exportToCSV(data, columns, filename);
};

/**
 * Format currency for export
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'N/A';
  return `${currency} ${parseFloat(amount).toFixed(2)}`;
};

/**
 * Format date for export
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Format datetime for export
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

