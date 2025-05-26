import React, { useState, useRef, useEffect, forwardRef } from 'react';

const CustomDropdown = forwardRef(
  (
    {
      label,
      placeholder = 'Select an option',
      options = [],
      value,
      onChange,
      onSearch,
      searchable = false,
      loading = false,
      required = false,
      disabled = false,
      onKeyDown,
      className = '',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle dropdown toggle
    const handleToggleDropdown = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    // Handle option selection
    const handleOptionSelect = (option) => {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
    };

    // Handle search input change
    const handleSearchChange = (e) => {
      const term = e.target.value;
      setSearchTerm(term);
      if (onSearch) {
        onSearch(term);
      }
    };

    // Clear selection
    const clearSelection = (e) => {
      e.stopPropagation();
      onChange('');
      setSearchTerm('');
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      if (onKeyDown) {
        onKeyDown(e);
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
      }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Get display value
    const selectedOption = options.find((option) => option.value === value);
    const displayValue = selectedOption ? selectedOption.label : '';

    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* Label */}
        {label && (
          <label className='block text-md font-semibold mb-2'>
            {required && <span className='text-red-500 mr-1'>*</span>}
            {label}
          </label>
        )}

        {/* Main dropdown button */}
        <div className='relative'>
          <button
            ref={ref}
            type='button'
            className={`
            relative w-full bg-white border rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
            ${
              isOpen
                ? 'border-blue-500 ring-1 ring-blue-500'
                : 'border-gray-300'
            }
          `}
            onClick={handleToggleDropdown}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-haspopup='listbox'
            aria-expanded={isOpen}
          >
            <span
              className={`block truncate ${
                !displayValue ? 'text-gray-500' : ''
              }`}
            >
              {displayValue || placeholder}
            </span>

            {/* Right side icons */}
            <span className='absolute inset-y-0 right-0 flex items-center pr-2'>
              {/* Clear button - using span instead of button to avoid nesting */}
              {value && !disabled && (
                <span
                  className='mr-1 p-1 hover:bg-gray-100 rounded cursor-pointer'
                  onClick={clearSelection}
                  role='button'
                  tabIndex={-1}
                  aria-label='Clear selection'
                >
                  <svg
                    className='h-4 w-4 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </span>
              )}

              {/* Loading spinner */}
              {loading ? (
                <div className='animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full'></div>
              ) : (
                /* Dropdown arrow */
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </span>
          </button>

          {/* Dropdown options */}
          {isOpen && (
            <div className='absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none'>
              {/* Search input */}
              {searchable && (
                <div className='sticky top-0 bg-white p-2 border-b'>
                  <input
                    ref={searchInputRef}
                    type='text'
                    className='w-full border rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Search...'
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Options list */}
              <div className='max-h-48 overflow-auto'>
                {loading ? (
                  <div className='px-3 py-2 text-gray-500 text-center'>
                    Loading...
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div className='px-3 py-2 text-gray-500 text-center'>
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option, index) => (
                    <div
                      key={option.value || index}
                      className={`
                      cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50
                      ${
                        option.value === value
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-900'
                      }
                    `}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <span
                        className={`block truncate ${
                          option.value === value ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>

                      {/* Selected indicator */}
                      {option.value === value && (
                        <span className='absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600'>
                          <svg
                            className='h-5 w-5'
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CustomDropdown.displayName = 'CustomDropdown';

export default CustomDropdown;
