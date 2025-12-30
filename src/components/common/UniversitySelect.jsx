import React, { useState, useEffect, useMemo } from 'react';
import AsyncSelect from 'react-select/async';
import { useQuery } from '@tanstack/react-query';
import { universityService } from '../../services/universityService';

const UniversitySelect = React.forwardRef(({
  label,
  error,
  placeholder = 'Select your university...',
  value,
  onChange,
  onBlur,
  name,
  required,
  className = '',
  countryCode, // Filter universities by country code
  ...props
}, ref) => {
  const [defaultOptions, setDefaultOptions] = useState([]);

  console.log('[UniversitySelect] Component rendered', { value, name });

  // Load default options (all universities) when component mounts
  // countryCode is required
  const { data: universitiesData, isLoading: isLoadingDefault, error: queryError } = useQuery({
    queryKey: ['universities', 'default', countryCode],
    queryFn: async () => {
      if (!countryCode) {
        throw new Error('Country code is required for UniversitySelect');
      }
      console.log('[UniversitySelect] Fetching universities from /api/v1/universities', { countryCode });
      const response = await universityService.getAllUniversities({ countryCode });
      console.log('[UniversitySelect] API response received:', {
        count: Array.isArray(response) ? response.length : 0,
      });
      return response;
    },
    enabled: !!countryCode, // Only fetch if countryCode is provided
    staleTime: 0, // No caching
    cacheTime: 0, // No caching
  });

  // Update default options when data arrives
  useEffect(() => {
    // Response is now a direct array of universities
    if (Array.isArray(universitiesData) && universitiesData.length > 0) {
      console.log('[UniversitySelect] Updating default options');
      // Extract only the 'name' field from each university object in the array
      const universityNames = universitiesData.map((uni) => {
        const universityName = uni.name;
        return {
          value: universityName,
          label: universityName,
        };
      });

      // Add "Other" option at the end
      const optionsWithOther = [...universityNames, { value: '__OTHER__', label: 'Other (Please specify)' }];
      setDefaultOptions(optionsWithOther);
      console.log('[UniversitySelect] Set default options:', optionsWithOther.length);
    }
  }, [universitiesData]);

  // Load options function for AsyncSelect - searches universities by name
  // countryCode is required
  const loadOptions = useMemo(() => {
    return async (inputValue) => {
      console.log('[UniversitySelect] Searching for:', inputValue, { countryCode });
      
      // Validate countryCode is provided
      if (!countryCode) {
        console.error('[UniversitySelect] Country code is required');
        return [];
      }
      
      // If no search input, return default options
      if (!inputValue || inputValue.trim() === '') {
        return defaultOptions;
      }

      try {
        // Search universities by name via API endpoint, countryCode is required
        const params = { 
          search: inputValue.trim(),
          countryCode: countryCode // Required
        };
        const response = await universityService.getAllUniversities(params);
        console.log('[UniversitySelect] Search response:', {
          count: Array.isArray(response) ? response.length : 0,
        });

        // Response is now a direct array of universities
        if (Array.isArray(response) && response.length > 0) {
          // Extract university names from search results
          const universityNames = response.map((uni) => ({
            value: uni.name,
            label: uni.name,
          }));

          // Add "Other" option at the end
          const optionsWithOther = [...universityNames, { value: '__OTHER__', label: 'Other (Please specify)' }];
          console.log('[UniversitySelect] Search results:', optionsWithOther.length);
          return optionsWithOther;
        }

        return defaultOptions;
      } catch (error) {
        console.error('[UniversitySelect] Search error:', error);
        return defaultOptions;
      }
    };
  }, [defaultOptions, countryCode]);

  // Handle selection change
  const handleChange = (selectedOption) => {
    console.log('[UniversitySelect] Selection changed:', selectedOption);
    console.log('[UniversitySelect] Selected option value:', selectedOption?.value);
    console.log('[UniversitySelect] Selected option label:', selectedOption?.label);
    
    if (onChange) {
      const value = selectedOption ? selectedOption.value : '';
      const isOther = selectedOption?.value === '__OTHER__';
      
      console.log('[UniversitySelect] Creating synthetic event with:', { name, value, isOther });
      
      const syntheticEvent = {
        target: {
          name,
          value: value,
          isOther: isOther,
        },
      };
      console.log('[UniversitySelect] Calling onChange with:', syntheticEvent.target);
      onChange(syntheticEvent);
    }
  };

  // Handle blur
  const handleBlur = () => {
    if (onBlur) {
      const syntheticEvent = {
        target: {
          name,
        },
      };
      onBlur(syntheticEvent);
    }
  };

  // Find selected option - create option object from value
  const selectedOption = useMemo(() => {
    if (!value) return null;
    
    // Check if value matches "Other"
    if (value === '__OTHER__') {
      return { value: '__OTHER__', label: 'Other (Please specify)' };
    }
    
    // Return option object with the value as both value and label
    return { value, label: value };
  }, [value]);

  // Custom MenuList component - simple scrollable list (all universities loaded at once)
  const MenuList = (props) => {
    const { children, innerRef } = props;

    return (
      <div ref={innerRef} className="react-select__menu-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {children}
      </div>
    );
  };

  // Custom styles to match existing input styling
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: error ? '#ef4444' : state.isFocused ? 'transparent' : '#d1d5db',
      boxShadow: state.isFocused
        ? error
          ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
          : '0 0 0 2px rgba(14, 165, 233, 0.2)'
        : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#9ca3af',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      fontSize: '0.875rem',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.875rem',
      color: '#111827',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      fontSize: '0.875rem',
      position: 'absolute',
      maxHeight: '300px',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '300px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'rgb(14, 165, 233)'
        : state.isFocused
        ? 'rgb(240, 249, 255)'
        : 'white',
      color: state.isSelected ? 'white' : '#111827',
      '&:active': {
        backgroundColor: state.isSelected ? 'rgb(14, 165, 233)' : 'rgb(224, 242, 254)',
      },
    }),
    loadingIndicator: (base) => ({
      ...base,
      color: 'rgb(14, 165, 233)',
    }),
  };

  return (
    <div className={`w-full ${className}`} ref={ref} style={{ position: 'relative', zIndex: 1 }}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <AsyncSelect
          name={name}
          value={selectedOption}
          onChange={handleChange}
          onBlur={handleBlur}
          loadOptions={loadOptions}
          defaultOptions={defaultOptions}
          placeholder={isLoadingDefault ? 'Loading universities...' : placeholder}
          isSearchable={true}
          isClearable
          isLoading={isLoadingDefault}
          noOptionsMessage={({ inputValue }) => 
            inputValue ? `No universities found for "${inputValue}"` : 'No universities available'
          }
          styles={customStyles}
          classNamePrefix="react-select"
          menuPosition="absolute"
          menuShouldScrollIntoView={false}
          components={{ MenuList }}
          onMenuOpen={() => {
            console.log('[UniversitySelect] Menu opened');
          }}
          onMenuClose={() => {
            console.log('[UniversitySelect] Menu closed');
          }}
          cacheOptions={false}
          debounceDelay={300}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">{error}</p>
        )}
        {!countryCode && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">
            Country code is required to load universities.
          </p>
        )}
        {queryError && (
          <p className="mt-1 text-xs sm:text-sm text-red-600">
            {queryError.message || 'Failed to load universities. Please refresh the page.'}
          </p>
        )}
      </div>
    </div>
  );
});

UniversitySelect.displayName = 'UniversitySelect';

export default UniversitySelect;
