import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import Badge from './Badge';

const TagInput = ({ 
  label, 
  tags = [], 
  onChange, 
  placeholder = 'Type and press Enter to add',
  className = '',
  maxTags = 20,
  error
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() && tags.length < maxTags) {
      e.preventDefault();
      const newTag = inputValue.trim();
      // Check for duplicates (case-insensitive)
      if (!tags.some(tag => {
        const tagName = typeof tag === 'string' ? tag : tag.name;
        return tagName?.toLowerCase() === newTag.toLowerCase();
      })) {
        // Add as string
        const updatedTags = [...tags, newTag];
        onChange(updatedTags);
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const updatedTags = tags.slice(0, -1);
      onChange(updatedTags);
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    onChange(updatedTags);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className={`min-h-[42px] px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent bg-white`}>
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map((tag, index) => {
            const tagName = typeof tag === 'string' ? tag : tag.name || tag;
            return (
              <Badge
                key={index}
                variant="primary"
                className="flex items-center gap-1 pr-1"
              >
                <span>{tagName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(index)}
                  className="ml-1 hover:bg-primary-700 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${tagName}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
          {tags.length < maxTags && (
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder={tags.length === 0 ? placeholder : ''}
              className="flex-1 min-w-[120px] outline-none border-none bg-transparent text-sm"
            />
          )}
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {tags.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          {tags.length} skill{tags.length !== 1 ? 's' : ''} added. Press Enter to add more.
        </p>
      )}
    </div>
  );
};

export default TagInput;

