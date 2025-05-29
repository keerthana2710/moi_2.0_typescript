import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const EditLogsFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (filterName, value) => {
    onFilterChange(filterName, value);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (filterName, value) => {
    if (value) {
      const date = new Date(value);
      onFilterChange(filterName, date.toISOString());
    } else {
      onFilterChange(filterName, '');
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value.trim() !== ''
  );

  return (
    <div className='bg-white rounded-lg shadow p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Filter className='h-5 w-5 text-gray-500' />
          <h3 className='text-lg font-medium text-gray-900'>Filters</h3>
          {hasActiveFilters && (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
              Active
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className='inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors'
            >
              <X className='h-4 w-4' />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors'
          >
            {isExpanded ? (
              <>
                <ChevronUp className='h-4 w-4' />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className='h-4 w-4' />
                Expand
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Target Type Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Target Type
              </label>
              <select
                value={filters.target_type}
                onChange={(e) =>
                  handleInputChange('target_type', e.target.value)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Types</option>
                <option value='Function'>Function</option>
                <option value='Payer'>Payer</option>
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleInputChange('action', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All Actions</option>
                <option value='update'>Update</option>
                <option value='create'>Create</option>
                <option value='delete'>Delete</option>
              </select>
            </div>

            {/* Target ID Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Target ID
              </label>
              <input
                type='text'
                value={filters.target_id}
                onChange={(e) => handleInputChange('target_id', e.target.value)}
                placeholder='Enter target ID...'
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Created By Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Created By (User ID)
              </label>
              <input
                type='text'
                value={filters.created_by}
                onChange={(e) =>
                  handleInputChange('created_by', e.target.value)
                }
                placeholder='Enter user ID...'
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* Start Date Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Start Date
              </label>
              <input
                type='date'
                value={formatDateForInput(filters.startDate)}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                End Date
              </label>
              <input
                type='date'
                value={formatDateForInput(filters.endDate)}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>
                Active Filters:
              </h4>
              <div className='flex flex-wrap gap-2'>
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value.trim() === '') return null;

                  let displayValue = value;
                  if (key === 'startDate' || key === 'endDate') {
                    displayValue = new Date(value).toLocaleDateString();
                  }

                  return (
                    <span
                      key={key}
                      className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                    >
                      {key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      : {displayValue}
                      <button
                        onClick={() => handleInputChange(key, '')}
                        className='ml-1 hover:bg-blue-200 rounded-full p-0.5'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EditLogsFilters;
