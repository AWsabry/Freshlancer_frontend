import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onChange, 
  label = 'Date Range',
  className = '',
  placeholder = 'Select date range'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStartDateChange = (e) => {
    const date = e.target.value;
    onChange({ startDate: date || null, endDate });
  };

  const handleEndDateChange = (e) => {
    const date = e.target.value;
    onChange({ startDate, endDate: date || null });
  };

  const handleClear = () => {
    onChange({ startDate: null, endDate: null });
  };

  const displayValue = () => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    }
    if (startDate) {
      return `From ${formatDisplayDate(startDate)}`;
    }
    if (endDate) {
      return `Until ${formatDisplayDate(endDate)}`;
    }
    return placeholder;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-left flex items-center justify-between"
        >
          <span className={startDate || endDate ? 'text-gray-900' : 'text-gray-500'}>
            {displayValue()}
          </span>
          <div className="flex items-center gap-2">
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-full min-w-[600px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formatDate(startDate)}
                    onChange={handleStartDateChange}
                    max={endDate ? formatDate(endDate) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formatDate(endDate)}
                    onChange={handleEndDateChange}
                    min={startDate ? formatDate(startDate) : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;

