import { useState, useMemo, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/AxiosInstance';
import useAuth from '@/context/useAuth';
import { toast } from 'react-toastify';
import {
  formatDateForInput,
  formatTimeForInput,
} from '@/helpers/formatDateTime';

const cities = [
  'சென்னை',
  'மும்பை',
  'டெல்லி',
  'பெங்களூரு',
  'ஹைதராபாத்',
  'கொல்கத்தா',
];

const functionTypes = [
  'திருமண வரவேற்பு',
  'பிறந்தநாள் விழா',
  'திருமண நாள் விழா',
  'நிறுவன விழா',
  'மற்றவை',
];

// Custom Dropdown Component
const CustomDropdown = ({
  label,
  options,
  value,
  onChange,
  error,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative'>
      <label className='block text-sm font-semibold mb-1'>
        <span className='text-red-500 mr-1'>*</span>
        {label}
      </label>
      <div className='relative'>
        <button
          type='button'
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full border rounded p-2 text-left focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        >
          {value || 'Select option'}
          <span className='float-right'>▼</span>
        </button>

        {isOpen && !disabled && (
          <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto'>
            {options.map((option, index) => (
              <div
                key={index}
                className='p-2 hover:bg-blue-100 cursor-pointer'
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <span className='text-red-500 text-xs mt-1'>{error}</span>}
    </div>
  );
};

// Custom Date Picker Component
const CustomDatePicker = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
}) => {
  return (
    <div>
      <label className='block text-sm font-semibold mb-1'>
        <span className='text-red-500 mr-1'>*</span>
        {label}
      </label>
      <input
        type='date'
        value={formatDateForInput(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
      />
      {error && <span className='text-red-500 text-xs mt-1'>{error}</span>}
    </div>
  );
};

// Custom Time Picker Component
const CustomTimePicker = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
}) => {
  return (
    <div>
      <label className='block text-sm font-semibold mb-1'>
        <span className='text-red-500 mr-1'>*</span>
        {label}
      </label>
      <input
        type='time'
        value={formatTimeForInput(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none ${
          error ? 'border-red-500 bg-red-50' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        placeholder={placeholder}
      />
      {error && <span className='text-red-500 text-xs mt-1'>{error}</span>}
    </div>
  );
};

const EditFunctionModal = ({ isOpen, onClose, initialData = {} }) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // State for edit reason
  const [editReason, setEditReason] = useState('');
  const [isReasonLocked, setIsReasonLocked] = useState(false);

  // State to track original values for comparison
  const [originalFormData, setOriginalFormData] = useState({});

  // Helper functions for data formatting
  const formatDateForForm = (dateStr) => {
    if (!dateStr) return '';
    try {
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
      if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const formatTimeForForm = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Initialize state with empty values first
  const [formData, setFormData] = useState({
    function_name: '',
    function_owner_name: '',
    function_owner_city: '',
    function_owner_address: '',
    function_owner_phno: '',
    function_amt_spent: '',
    function_hero_name: '',
    function_heroine_name: '',
    function_held_place: '',
    function_held_city: '',
    function_start_date: '',
    function_start_time: '',
    function_end_date: '',
    function_end_time: '',
    function_total_days: '1',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    console.log('Initial Data:', initialData);
    if (isOpen && initialData && Object.keys(initialData).length > 0) {
      const formattedData = {
        function_name: initialData.function_name || '',
        function_owner_name: initialData.function_owner_name || '',
        function_owner_city: initialData.function_owner_city || '',
        function_owner_address: initialData.function_owner_address || '',
        function_owner_phno: initialData.function_owner_phno || '',
        function_amt_spent: initialData.function_amt_spent?.toString() || '',
        function_hero_name: initialData.function_hero_name || '',
        function_heroine_name: initialData.function_heroine_name || '',
        function_held_place: initialData.function_held_place || '',
        function_held_city: initialData.function_held_city || '',
        function_start_date: formatDateForForm(initialData.function_start_date),
        function_start_time: formatTimeForForm(initialData.function_start_time),
        function_end_date: formatDateForForm(initialData.function_end_date),
        function_end_time: formatTimeForForm(initialData.function_end_time),
        function_total_days: initialData.function_total_days?.toString() || '1',
      };

      setFormData(formattedData);
      // Store original data for comparison
      setOriginalFormData(formattedData);
      setErrors({});
      // Reset edit reason state when modal opens
      setEditReason('');
      setIsReasonLocked(false);
    }
  }, [isOpen, initialData]);

  // Calculate total days using useMemo
  const calculatedTotalDays = useMemo(() => {
    if (formData.function_start_date && formData.function_end_date) {
      const startDate = new Date(formData.function_start_date);
      const endDate = new Date(formData.function_end_date);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      return daysDiff > 0 ? daysDiff.toString() : '1';
    }
    return '1';
  }, [formData.function_start_date, formData.function_end_date]);

  // Function to get only changed fields
  const getChangedFields = () => {
    const changedFields = {};

    // Compare current form data with original data
    Object.keys(formData).forEach((key) => {
      let currentValue = formData[key];
      let originalValue = originalFormData[key];

      // Special handling for numeric fields
      if (key === 'function_amt_spent') {
        currentValue = parseFloat(currentValue) || 0;
        originalValue = parseFloat(originalValue) || 0;
      } else if (key === 'function_total_days') {
        currentValue = parseInt(calculatedTotalDays) || 1;
        originalValue = parseInt(originalValue) || 1;
      }

      // Check if values are different
      if (currentValue !== originalValue) {
        if (key === 'function_amt_spent') {
          changedFields[key] = parseFloat(formData[key]);
        } else if (key === 'function_total_days') {
          changedFields[key] = parseInt(calculatedTotalDays);
        } else {
          changedFields[key] = formData[key];
        }
      }
    });

    return changedFields;
  };

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(
        `/functions/${initialData?.function_id}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['functions']);
      onClose();
      toast.success('Function updated successfully!');
    },
    onError: (error) => {
      console.error('Update failed:', error);
      toast.error('Failed to update function. Please try again.');
    },
  });

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Check if edit reason is provided
    if (!editReason.trim()) {
      newErrors.editReason = 'Edit reason is required';
    }

    const requiredFields = [
      { key: 'function_name', label: 'விழாபெயர்' },
      { key: 'function_owner_name', label: 'நடத்துபவர்' },
      { key: 'function_owner_city', label: 'நடத்துபவர் ஊர்' },
      { key: 'function_owner_address', label: 'நடத்துபவர் முகவரி' },
      { key: 'function_owner_phno', label: 'நடத்துபவர் கைபேசி எண்' },
      { key: 'function_amt_spent', label: 'மொத்த செலவு' },
      { key: 'function_hero_name', label: 'விழா நாயகன்' },
      { key: 'function_heroine_name', label: 'விழா நாயகி' },
      { key: 'function_held_place', label: 'விழா நடைபெறும் இடம்' },
      { key: 'function_held_city', label: 'விழா இடம்' },
      { key: 'function_start_date', label: 'விழா தொடங்கும் தேதி' },
      { key: 'function_start_time', label: 'விழா ஆரம்ப நேரம்' },
      { key: 'function_end_date', label: 'விழா முடியும் தேதி' },
      { key: 'function_end_time', label: 'விழா முடியும் நேரம்' },
    ];

    requiredFields.forEach((field) => {
      const value = formData[field.key];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    // Phone number validation
    if (formData.function_owner_phno) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.function_owner_phno.replace(/\s/g, ''))) {
        newErrors.function_owner_phno =
          'Please enter a valid 10-digit phone number';
      }
    }

    // Amount validation
    if (formData.function_amt_spent) {
      const amount = parseFloat(formData.function_amt_spent);
      if (isNaN(amount) || amount <= 0) {
        newErrors.function_amt_spent =
          'Please enter a valid amount greater than 0';
      }
    }

    // Date validation
    if (formData.function_start_date && formData.function_end_date) {
      const startDate = new Date(formData.function_start_date);
      const endDate = new Date(formData.function_end_date);

      if (endDate < startDate) {
        newErrors.function_end_date = 'End date cannot be before start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle edit reason change
  const handleEditReasonChange = (e) => {
    const value = e.target.value;
    setEditReason(value);

    // Clear error if user starts typing
    if (errors.editReason && value.trim()) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.editReason;
        return newErrors;
      });
    }
  };

  // Lock the edit reason once user starts editing other fields
  const handleFieldInteraction = () => {
    if (editReason.trim() && !isReasonLocked) {
      setIsReasonLocked(true);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      const changedFields = getChangedFields();

      // Check if any fields have actually changed
      if (Object.keys(changedFields).length === 0) {
        toast.info('No changes detected to update.');
        return;
      }

      // Prepare payload with only changed fields and edit reason
      const submitData = {
        ...changedFields,
        reason_for_edit: editReason.trim(),
      };

      console.log('Submitting only changed fields:', submitData);
      updateMutation.mutate(submitData);
    } else {
      alert('Please fill in all required fields correctly');
    }
  };

  // Helper function to get error styling
  const getInputClassName = (fieldName) => {
    const baseClassName =
      'w-full border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none';
    const disabledClassName = !editReason.trim()
      ? 'bg-gray-100 cursor-not-allowed'
      : '';
    return errors[fieldName]
      ? `${baseClassName} border-red-500 bg-red-50 ${disabledClassName}`
      : `${baseClassName} border-gray-300 ${disabledClassName}`;
  };

  const isFormDisabled = !editReason.trim();

  // Get changed fields for display
  const changedFields = getChangedFields();
  const hasChanges = Object.keys(changedFields).length > 0;

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[93vh] overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50'>
          <h3 className='text-xl font-bold text-blue-800'>
            Edit Function Details
          </h3>
          <button
            onClick={onClose}
            className='bg-red-500 text-white rounded-full text-xl font-bold p-1 hover:scale-105 duration-200 transition-all'
            disabled={updateMutation.isPending}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className='p-6 overflow-y-auto scroll-smooth max-h-[calc(90vh-140px)]'>
          {/* Edit Reason Section */}
          <div className='mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <label className='block text-sm font-semibold mb-2 text-yellow-800'>
              <span className='text-red-500 mr-1'>*</span>
              Reason for Edit
            </label>
            <textarea
              value={editReason}
              onChange={handleEditReasonChange}
              disabled={isReasonLocked}
              placeholder='Please provide a reason for editing this function record...'
              className={`w-full border rounded p-3 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none resize-none h-20 ${
                errors.editReason
                  ? 'border-red-500 bg-red-50'
                  : 'border-yellow-300'
              } ${
                isReasonLocked ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
              }`}
            />
            {errors.editReason && (
              <span className='text-red-500 text-xs mt-1'>
                {errors.editReason}
              </span>
            )}
            {isReasonLocked && (
              <p className='text-xs text-gray-600 mt-1'>
                ℹ️ Edit reason has been locked and cannot be changed.
              </p>
            )}
            {!isReasonLocked && editReason.trim() && (
              <p className='text-xs text-yellow-700 mt-1'>
                ⚠️ Once you start editing other fields, this reason cannot be
                changed.
              </p>
            )}
            {/* Show changed fields indicator */}
            {hasChanges && (
              <div className='mt-2 p-2 bg-green-50 border border-green-200 rounded'>
                <p className='text-xs text-green-700 font-semibold'>
                  Changed fields detected: {Object.keys(changedFields).length}{' '}
                  field(s) will be updated
                </p>
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Function Type - Dropdown */}
            <div className='flex flex-col gap-2'>
              <CustomDropdown
                label='விழாபெயர்'
                options={functionTypes}
                value={formData.function_name}
                onChange={(value) => {
                  handleFieldInteraction();
                  handleInputChange('function_name', value);
                }}
                error={errors.function_name}
                disabled={isFormDisabled}
              />
            </div>

            {/* Function Owner Name */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>நடத்துபவர்
              </label>
              <input
                type='text'
                className={getInputClassName('function_owner_name')}
                placeholder='நடத்துபவர் பெயர்'
                value={formData.function_owner_name}
                onChange={(e) => {
                  handleFieldInteraction();
                  handleInputChange('function_owner_name', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
                onFocus={handleFieldInteraction}
              />
              {errors.function_owner_name && (
                <span className='text-red-500 text-xs'>
                  {errors.function_owner_name}
                </span>
              )}
            </div>

            {/* City - Dropdown */}
            <div className='flex flex-col gap-2'>
              <CustomDropdown
                label='நடத்துபவர் ஊர்'
                options={cities}
                value={formData.function_owner_city}
                onChange={(value) => {
                  handleFieldInteraction();
                  handleInputChange('function_owner_city', value);
                }}
                error={errors.function_owner_city}
                disabled={isFormDisabled}
              />
            </div>

            {/* Address */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>நடத்துபவர் முகவரி
              </label>
              <input
                className={getInputClassName('function_owner_address')}
                placeholder='முகவரி'
                value={formData.function_owner_address}
                onChange={(e) => {
                  handleFieldInteraction();
                  handleInputChange('function_owner_address', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
                onFocus={handleFieldInteraction}
                rows={3}
              />
              {errors.function_owner_address && (
                <span className='text-red-500 text-xs'>
                  {errors.function_owner_address}
                </span>
              )}
            </div>

            {/* Phone Number */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>நடத்துபவர் கைபேசி
                எண்
              </label>
              <input
                type='tel'
                className={getInputClassName('function_owner_phno')}
                placeholder='கைபேசி எண்'
                value={formData.function_owner_phno}
                onChange={(e) => {
                  handleFieldInteraction();
                  handleInputChange('function_owner_phno', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
                onFocus={handleFieldInteraction}
              />
              {errors.function_owner_phno && (
                <span className='text-red-500 text-xs'>
                  {errors.function_owner_phno}
                </span>
              )}
            </div>

            {/* Amount Spent */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>மொத்த செலவு
              </label>
              <input
                type='number'
                className={getInputClassName('function_amt_spent')}
                placeholder='செலவு தொகை'
                value={formData.function_amt_spent}
                onChange={(e) => {
                  handleFieldInteraction();
                  handleInputChange('function_amt_spent', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
                onFocus={handleFieldInteraction}
                min='0'
                step='0.01'
              />
              {errors.function_amt_spent && (
                <span className='text-red-500 text-xs'>
                  {errors.function_amt_spent}
                </span>
              )}
            </div>

            {/* Hero Name */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>விழா நாயகன்
              </label>
              <input
                type='text'
                className={getInputClassName('function_hero_name')}
                placeholder='நாயகன் பெயர்'
                value={formData.function_hero_name}
                onChange={(e) => {
                  handleFieldInteraction();
                  handleInputChange('function_hero_name', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
                onFocus={handleFieldInteraction}
              />
              {errors.function_hero_name && (
                <span className='text-red-500 text-xs'>
                  {errors.function_hero_name}
                </span>
              )}
            </div>

            {/* Heroine Name */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>விழா நாயகி
              </label>
              <input
                type='text'
                className={getInputClassName('function_heroine_name')}
                placeholder='நாயகி பெயர்'
                value={formData.function_heroine_name}
                onChange={(e) => {
                  handleFieldInteraction();
                  handleInputChange('function_heroine_name', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
                onFocus={handleFieldInteraction}
              />
              {errors.function_heroine_name && (
                <span className='text-red-500 text-xs'>
                  {errors.function_heroine_name}
                </span>
              )}
            </div>

            {/* Function Held Place */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>விழா நடைபெறும் இடம்
              </label>
              <input
                type='text'
                className={getInputClassName('function_held_place')}
                placeholder='விழா நடைபெறும் இடம்'
                value={formData.function_held_place}
                onChange={(e) => {
                  handleFieldInteraction();
                  handleInputChange('function_held_place', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
                onFocus={handleFieldInteraction}
              />
              {errors.function_held_place && (
                <span className='text-red-500 text-xs'>
                  {errors.function_held_place}
                </span>
              )}
            </div>

            {/* Function Held City */}
            <div className='flex flex-col gap-2'>
              <CustomDropdown
                label='விழா இடம்'
                options={cities}
                value={formData.function_held_city}
                onChange={(value) => {
                  handleFieldInteraction();
                  handleInputChange('function_held_city', value);
                }}
                error={errors.function_held_city}
                disabled={isFormDisabled}
              />
            </div>

            {/* Start Date */}
            <div className='flex flex-col gap-2'>
              <CustomDatePicker
                label='விழா தொடங்கும் தேதி'
                value={formData.function_start_date}
                onChange={(value) => {
                  handleFieldInteraction();
                  handleInputChange('function_start_date', value);
                }}
                error={errors.function_start_date}
                disabled={isFormDisabled}
              />
            </div>

            {/* Start Time */}
            <div className='flex flex-col gap-2'>
              <CustomTimePicker
                label='விழா ஆரம்ப நேரம்'
                value={formData.function_start_time}
                onChange={(value) => {
                  handleFieldInteraction();
                  handleInputChange('function_start_time', value);
                }}
                error={errors.function_start_time}
                disabled={isFormDisabled}
              />
            </div>

            {/* End Date */}
            <div className='flex flex-col gap-2'>
              <CustomDatePicker
                label='விழா முடியும் தேதி'
                value={formData.function_end_date}
                onChange={(value) => {
                  handleFieldInteraction();
                  handleInputChange('function_end_date', value);
                }}
                error={errors.function_end_date}
                disabled={isFormDisabled}
              />
            </div>

            {/* End Time */}
            <div className='flex flex-col gap-2'>
              <CustomTimePicker
                label='விழா முடியும் நேரம்'
                value={formData.function_end_time}
                onChange={(value) => {
                  handleFieldInteraction();
                  handleInputChange('function_end_time', value);
                }}
                error={errors.function_end_time}
                disabled={isFormDisabled}
              />
            </div>

            {/* Total Days (Read-only, calculated) */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>மொத்த நாட்கள்
              </label>
              <input
                type='text'
                className='w-full border rounded p-2 bg-gray-100 cursor-not-allowed border-gray-300'
                value={calculatedTotalDays}
                disabled={true}
                readOnly
              />
              <span className='text-xs text-gray-600'>
                Automatically calculated based on start and end dates
              </span>
            </div>
          </div>

          {/* Display changes summary if any */}
          {hasChanges && (
            <div className='my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
              <h4 className='text-sm font-semibold text-blue-800 mb-2'>
                Fields to be Updated:
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs'>
                {Object.entries(changedFields).map(([key, value]) => (
                  <div key={key} className='flex gap-5'>
                    <span className='text-md font-medium text-blue-700'>
                      {key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      :
                    </span>
                    <span className='text-blue-600 ml-2'>
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : value.toString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className='flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50'>
          <button
            type='button'
            onClick={onClose}
            className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200'
            disabled={updateMutation.isPending}
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={
              updateMutation.isPending ||
              !editReason.trim() ||
              !hasChanges ||
              Object.keys(errors).length > 0
            }
            className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
              updateMutation.isPending || !editReason.trim() || !hasChanges
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-darkBlue text-white hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg'
            }`}
          >
            <Save size={16} />
            {updateMutation.isPending ? 'Updating...' : 'Update Function'}
          </button>
        </div>

        {/* Loading Overlay */}
        {updateMutation.isPending && (
          <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10'>
            <div className='flex items-center gap-3'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-darkBlue'></div>
              <span className='text-darkBlue font-medium'>
                Updating function...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditFunctionModal;
