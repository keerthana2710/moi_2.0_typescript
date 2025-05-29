import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/AxiosInstance';
import useAuth from '@/context/useAuth';
import { toast } from 'react-toastify';

const cities = [
  'Chennai',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Kolkata',
];

const occupations = ['Doctor', 'Engineer', 'Teacher', 'Business', 'Other'];

const relations = [
  'Friend',
  'Family',
  'Colleague',
  'Neighbor',
  'Relative',
  'Other',
];

const paymentMethods = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'];

// Custom Dropdown Component
const CustomDropdown = ({
  label,
  options,
  value,
  onChange,
  error,
  className = '',
  disabled = false,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='relative'>
      <label className='block text-sm font-semibold mb-1'>
        {required && <span className='text-red-500 mr-1'>*</span>}
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

const EditModal = ({ isOpen, onClose, initialData = {} }) => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // State for edit reason
  const [editReason, setEditReason] = useState('');
  const [isReasonLocked, setIsReasonLocked] = useState(false);

  // State for payment type
  const [paymentType, setPaymentType] = useState('Cash');

  // State to track original values for comparison
  const [originalFormData, setOriginalFormData] = useState({});

  // Initialize state with empty values first
  const [formData, setFormData] = useState({
    payer_name: '',
    payer_phno: '',
    payer_work: '',
    payer_given_object: 'Cash',
    payer_cash_method: '',
    payer_amount: '',
    payer_gift_name: '',
    payer_relation: '',
    payer_city: '',
    payer_address: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && initialData && Object.keys(initialData).length > 0) {
      const paymentTypeFromData = initialData.payer_given_object || 'Cash';
      setPaymentType(paymentTypeFromData);

      const formattedData = {
        payer_name: initialData.payer_name || '',
        payer_phno: initialData.payer_phno || '',
        payer_work: initialData.payer_work || '',
        payer_given_object: paymentTypeFromData,
        payer_cash_method: initialData.payer_cash_method || '',
        payer_amount: initialData.payer_amount?.toString() || '',
        payer_gift_name: initialData.payer_gift_name || '',
        payer_relation: initialData.payer_relation || '',
        payer_city: initialData.payer_city || '',
        payer_address: initialData.payer_address || '',
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

  // Function to get only changed fields
  const getChangedFields = () => {
    const changedFields = {};

    // Compare current form data with original data
    Object.keys(formData).forEach((key) => {
      let currentValue = formData[key];
      let originalValue = originalFormData[key];

      // Special handling for numeric fields
      if (key === 'payer_amount') {
        currentValue = parseFloat(currentValue) || 0;
        originalValue = parseFloat(originalValue) || 0;
      }

      // Check if values are different
      if (currentValue !== originalValue) {
        if (key === 'payer_amount') {
          changedFields[key] = parseFloat(formData[key]) || null;
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
      const res = await axiosInstance.put(`/payers/${initialData?._id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['payers', initialData?.function_id],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['editLogs'],
        exact: true,
      });

      onClose();
      toast.success('Payer updated successfully!');
    },
    onError: (error) => {
      console.error('Update failed:', error);
      toast.error('Failed to update payer. Please try again.');
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
      { key: 'payer_name', label: 'செலுத்துபவர் பெயர்' },
      { key: 'payer_phno', label: 'கைபேசி எண்' },
    ];

    // Add payment type specific required fields
    if (paymentType === 'Cash') {
      requiredFields.push({ key: 'payer_amount', label: 'தொகை' });
    } else {
      requiredFields.push({ key: 'payer_gift_name', label: 'பரிசு பெயர்' });
    }

    requiredFields.forEach((field) => {
      const value = formData[field.key];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    // Phone number validation
    if (formData.payer_phno) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.payer_phno.replace(/\s/g, ''))) {
        newErrors.payer_phno = 'Please enter a valid 10-digit phone number';
      }
    }

    // Amount validation for cash payments
    if (paymentType === 'Cash' && formData.payer_amount) {
      const amount = parseFloat(formData.payer_amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.payer_amount = 'Please enter a valid amount greater than 0';
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

  // Handle payment type change
  const handlePaymentTypeChange = (type) => {
    setPaymentType(type);
    handleInputChange('payer_given_object', type);

    // Clear opposite field values
    if (type === 'Cash') {
      handleInputChange('payer_gift_name', '');
    } else {
      handleInputChange('payer_amount', '');
      handleInputChange('payer_cash_method', '');
    }
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

      // Ensure payer_amount is properly handled for cash payments
      if (changedFields.payer_amount !== undefined && paymentType === 'Cash') {
        submitData.payer_amount = parseFloat(formData.payer_amount) || null;
      }

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
            Edit Payer Details
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
              placeholder='Please provide a reason for editing this payer record...'
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
            {/* Payer Name */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>செலுத்துபவர் பெயர்
              </label>
              <input
                type='text'
                className={getInputClassName('payer_name')}
                placeholder='செலுத்துபவர் பெயர்'
                value={formData.payer_name}
                onChange={(e) => {
                  handleInputChange('payer_name', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
              />
              {errors.payer_name && (
                <span className='text-red-500 text-xs'>
                  {errors.payer_name}
                </span>
              )}
            </div>

            {/* Phone Number */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                <span className='text-red-500 mr-1'>*</span>கைபேசி எண்
              </label>
              <input
                type='tel'
                className={getInputClassName('payer_phno')}
                placeholder='கைபேசி எண்'
                value={formData.payer_phno}
                onChange={(e) => {
                  handleInputChange('payer_phno', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
              />
              {errors.payer_phno && (
                <span className='text-red-500 text-xs'>
                  {errors.payer_phno}
                </span>
              )}
            </div>

            {/* Occupation - Dropdown */}
            <div className='flex flex-col gap-2'>
              <CustomDropdown
                label='செலுத்துபவர் தொழில்'
                options={occupations}
                value={formData.payer_work}
                onChange={(value) => {
                  handleInputChange('payer_work', value);
                }}
                error={errors.payer_work}
                disabled={isFormDisabled}
              />
            </div>

            {/* Relation - Dropdown */}
            <div className='flex flex-col gap-2'>
              <CustomDropdown
                label='உறவு முறை'
                options={relations}
                value={formData.payer_relation}
                onChange={(value) => {
                  handleInputChange('payer_relation', value);
                }}
                error={errors.payer_relation}
                disabled={isFormDisabled}
              />
            </div>

            {/* Payment Type Selection */}
            <div className='col-span-2'>
              <label className='block text-sm font-semibold mb-2'>
                Payment Type
              </label>
              <div className='flex gap-4'>
                <div className='flex items-center'>
                  <input
                    type='radio'
                    id='cash-edit'
                    name='payment_type_edit'
                    value='Cash'
                    checked={paymentType === 'Cash'}
                    onChange={() => handlePaymentTypeChange('Cash')}
                    disabled={isFormDisabled}
                    className='mr-2'
                  />
                  <label htmlFor='cash-edit'>பணம் (Cash)</label>
                </div>
                <div className='flex items-center'>
                  <input
                    type='radio'
                    id='gift-edit'
                    name='payment_type_edit'
                    value='Gift'
                    checked={paymentType === 'Gift'}
                    onChange={() => handlePaymentTypeChange('Gift')}
                    disabled={isFormDisabled}
                    className='mr-2'
                  />
                  <label htmlFor='gift-edit'>பரிசு (Gift)</label>
                </div>
              </div>
            </div>

            {paymentType === 'Cash' ? (
              <>
                {/* Cash Method - Dropdown */}
                <div className='flex flex-col gap-2'>
                  <CustomDropdown
                    label='செலுத்தும் முறை'
                    options={paymentMethods}
                    value={formData.payer_cash_method}
                    onChange={(value) => {
                      handleInputChange('payer_cash_method', value);
                    }}
                    error={errors.payer_cash_method}
                    disabled={isFormDisabled}
                  />
                </div>

                {/* Amount */}
                <div className='flex flex-col gap-2'>
                  <label className='text-sm font-semibold'>
                    <span className='text-red-500 mr-1'>*</span>தொகை
                  </label>
                  <input
                    type='number'
                    className={getInputClassName('payer_amount')}
                    placeholder='தொகை'
                    value={formData.payer_amount}
                    onChange={(e) => {
                      handleInputChange('payer_amount', e.target.value);
                    }}
                    disabled={updateMutation.isPending || isFormDisabled}
                    min='0'
                    step='0.01'
                  />
                  {errors.payer_amount && (
                    <span className='text-red-500 text-xs'>
                      {errors.payer_amount}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className='col-span-2 flex flex-col gap-2'>
                <label className='text-sm font-semibold'>
                  <span className='text-red-500 mr-1'>*</span>பரிசு பெயர்
                </label>
                <input
                  type='text'
                  className={getInputClassName('payer_gift_name')}
                  placeholder='பரிசு பெயர்'
                  value={formData.payer_gift_name}
                  onChange={(e) => {
                    handleInputChange('payer_gift_name', e.target.value);
                  }}
                  disabled={updateMutation.isPending || isFormDisabled}
                />
                {errors.payer_gift_name && (
                  <span className='text-red-500 text-xs'>
                    {errors.payer_gift_name}
                  </span>
                )}
              </div>
            )}

            {/* City - Dropdown */}
            <div className='flex flex-col gap-2'>
              <CustomDropdown
                label='செலுத்துபவர் ஊர்'
                options={cities}
                value={formData.payer_city}
                onChange={(value) => {
                  handleInputChange('payer_city', value);
                }}
                error={errors.payer_city}
                disabled={isFormDisabled}
              />
            </div>

            {/* Address */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold'>
                செலுத்துபவர் முகவரி
              </label>
              <input
                type='text'
                className={getInputClassName('payer_address')}
                placeholder='முகவரி'
                value={formData.payer_address}
                onChange={(e) => {
                  handleInputChange('payer_address', e.target.value);
                }}
                disabled={updateMutation.isPending || isFormDisabled}
              />
              {errors.payer_address && (
                <span className='text-red-500 text-xs'>
                  {errors.payer_address}
                </span>
              )}
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
                        : value === null
                        ? 'null'
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
            {updateMutation.isPending ? 'Updating...' : 'Update Payer'}
          </button>
        </div>

        {/* Loading Overlay */}
        {updateMutation.isPending && (
          <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10'>
            <div className='flex items-center gap-3'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-darkBlue'></div>
              <span className='text-darkBlue font-medium'>
                Updating payer...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditModal;
