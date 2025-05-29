import React, { useState, useRef, useEffect } from 'react';
import { CustomDropdownInput } from '../../components/ui/CustomInputDropdown';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAuth from '../../context/useAuth';
import axiosInstance from '@/utils/AxiosInstance';
import useDebounce from '@/hooks/useDebounce';
import { BillPreview } from './components/BillPreview';
import { useUniqueCities, useUniqueWorkTypes } from '@/hooks/useUniqueValue';

function FunctionBillDetails() {
  const formRefs = useRef([]);
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(true);

  const cities = useUniqueCities();
  const occupations = useUniqueWorkTypes();

  // State for selected function
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionSearch, setFunctionSearch] = useState('');

  // Edit reason state
  const [editReason, setEditReason] = useState('');
  const [originalFormData, setOriginalFormData] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  // Use debounce for function search
  const debouncedFunctionSearch = useDebounce(functionSearch, 300);

  const [formData, setFormData] = useState({
    function_id: '',
    owner_name: '',
    owner_occupation: '',
    wife_name: '',
    wife_occupation: '',
    function_place: '',
    function_city: '',
  });

  // Fetch functions for dropdown
  const { data: functions, isLoading: functionsLoading } = useQuery({
    queryKey: ['functions', debouncedFunctionSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedFunctionSearch.trim()) {
        params.append('search', debouncedFunctionSearch);
      }
      const res = await axiosInstance.get(`/functions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    staleTime: Infinity,
  });

  // Fetch existing bill details for selected function
  const { data: existingBillDetails, isLoading: billDetailsLoading } = useQuery(
    {
      queryKey: ['function-bill-details', selectedFunction?.function_id],
      queryFn: async () => {
        const res = await axiosInstance.get(
          `/functions/${selectedFunction.function_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return res.data;
      },
      enabled: !!selectedFunction?.function_id && !!token,
      staleTime: Infinity,
    }
  );

  // Auto-fill form when function is selected or existing bill details are loaded
  useEffect(() => {
    if (selectedFunction) {
      // Start with basic function data
      const newFormData = {
        function_id: selectedFunction.function_id,
        owner_name: selectedFunction.function_owner_name || '',
        function_place: selectedFunction.function_held_place || '',
        function_city: selectedFunction.function_held_city || '',
        owner_occupation: '',
        wife_name: '',
        wife_occupation: '',
      };

      // Check if existing bill details exist and populate them
      if (existingBillDetails?.data?.function_bill_details) {
        const billDetails = existingBillDetails.data.function_bill_details;

        // Override with existing bill details
        newFormData.owner_name =
          billDetails.owner_name || newFormData.owner_name;
        newFormData.owner_occupation = billDetails.owner_occupation || '';
        newFormData.wife_name = billDetails.wife_name || '';
        newFormData.wife_occupation = billDetails.wife_occupation || '';
        newFormData.function_place =
          billDetails.function_place || newFormData.function_place;
        newFormData.function_city =
          billDetails.function_city || newFormData.function_city;

        setIsEditMode(true);
        setOriginalFormData({ ...newFormData });
      } else {
        setIsEditMode(false);
        setOriginalFormData({});
      }

      setFormData(newFormData);
    }
  }, [selectedFunction, existingBillDetails]);

  // Function to get only changed fields
  const getChangedFields = () => {
    if (!isEditMode) return formData;

    const changedFields = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== originalFormData[key]) {
        changedFields[key] = formData[key];
      }
    });
    return changedFields;
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Check edit reason for edit mode
    if (isEditMode && !editReason.trim()) {
      newErrors.editReason = 'Edit reason is required';
    }

    // Required field validation
    const requiredFields = [
      { key: 'owner_name', label: 'உரிமையாளர் பெயர்' },
      { key: 'owner_occupation', label: 'உரிமையாளர் தொழில்' },
      { key: 'function_place', label: 'விழா நடைபெறும் இடம்' },
      { key: 'function_city', label: 'விழா நகரம்' },
    ];

    // Check required fields
    requiredFields.forEach((field) => {
      const value = formData[field.key];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    // Check if function is selected
    if (!selectedFunction) {
      newErrors.function_selection = 'Please select a function first';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle function selection
  const handleFunctionSelect = (value) => {
    const functionData = functions?.data?.find(
      (func) => func.function_id === value
    );
    if (functionData) {
      setSelectedFunction(functionData);
      setEditReason(''); // Reset edit reason when function changes
      // Clear any previous errors
      if (errors.function_selection) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.function_selection;
          return newErrors;
        });
      }
    }
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData({
      ...formData,
      [name]: value,
    });
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

  // Handle Enter key to mimic Tab behavior
  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = index + 1;
      if (nextIndex < formRefs.current.length && formRefs.current[nextIndex]) {
        formRefs.current[nextIndex].focus();
      }
    }
  };

  // Submit function bill details
  const submitBillDetails = async () => {
    const payload = {
      function_bill_details: {
        owner_name: formData.owner_name,
        owner_occupation: formData.owner_occupation,
        wife_name: formData.wife_name,
        wife_occupation: formData.wife_occupation,
        function_place: formData.function_place,
        function_city: formData.function_city,
      },
    };

    // Add edit reason if in edit mode
    if (isEditMode && editReason.trim()) {
      payload.reason_for_edit = editReason.trim();
    } else {
      payload.reason_for_edit = editReason.trim();
    }

    const { data } = await axiosInstance.put(
      `/functions/${selectedFunction?.function_id}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return data;
  };

  useEffect(() => {
    if (functions?.data?.length > 0 && !selectedFunction) {
      setSelectedFunction(functions.data[0]);
    }
  }, [functions, selectedFunction]);

  const { mutate: updateBillDetails, isPending } = useMutation({
    mutationFn: () => submitBillDetails(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['functions'],
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: ['function-bill-details', selectedFunction?.function_id],
        exact: true,
      });
      toast.success(
        isEditMode
          ? 'Bill Details Updated Successfully'
          : 'Bill Details Created Successfully'
      );
      setEditReason('');
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = () => {
    if (validateForm()) {
      const dataToSubmit = isEditMode
        ? { ...formData, ...getChangedFields() }
        : formData;
      updateBillDetails(dataToSubmit);
    } else {
      if (errors.function_selection) {
        toast.error('Please select a function first');
      } else if (errors.editReason) {
        toast.error('Please provide a reason for editing');
      } else {
        toast.error('Please fill in all required fields correctly');
      }

      // Focus on first error field
      const firstErrorField = Object.keys(errors).find(
        (key) => key !== 'function_selection' && key !== 'editReason'
      );
      if (firstErrorField) {
        const fieldIndex = getFieldIndex(firstErrorField);
        if (fieldIndex !== -1 && formRefs.current[fieldIndex]) {
          formRefs.current[fieldIndex].focus();
        }
      }
    }
  };

  // Helper function to get field index for focusing
  const getFieldIndex = (fieldName) => {
    const fieldIndexMap = {
      owner_name: 0,
      owner_occupation: 1,
      wife_name: 2,
      wife_occupation: 3,
      function_place: 4,
      function_city: 5,
    };
    return fieldIndexMap[fieldName] || -1;
  };

  // Helper function to get error styling
  const getInputClassName = (fieldName) => {
    const baseClassName =
      'border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none';
    const isFormDisabled = isEditMode && !editReason.trim();
    const disabledClassName = isFormDisabled
      ? 'bg-gray-100 cursor-not-allowed'
      : '';

    return errors[fieldName]
      ? `${baseClassName} border-red-500 bg-red-50 ${disabledClassName}`
      : `${baseClassName} ${disabledClassName}`;
  };

  // Prepare dropdown options
  const functionOptions =
    functions?.data?.map((func) => ({
      label: `${func.function_id}`,
      value: func.function_id,
    })) || [];

  const isFormDisabled = isEditMode && !editReason.trim();
  const hasChanges = isEditMode
    ? Object.keys(getChangedFields()).length > 0
    : true;

  return (
    <div className='flex gap-6 px-4 pb-10 bg-white rounded-lg shadow-md min-h-screen'>
      {/* Left Side - Form */}
      <div
        className={`${
          showPreview ? 'w-1/2' : 'w-full'
        } flex flex-col gap-6 p-6`}
      >
        {/* Page Header */}
        <div className='flex items-center justify-between py-4'>
          <h1 className='text-2xl font-bold text-darkBlue'>
            விழா பில் விவரங்கள்
          </h1>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className='flex items-center gap-2 px-4 py-2 bg-darkBlue text-white rounded hover:scale-105 transition-all'
          >
            {showPreview ? <FaEyeSlash /> : <FaEye />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Function Selection */}
        <div className='bg-gray-50 p-6 rounded-lg border'>
          <h2 className='text-xl font-semibold mb-4 text-blue-700'>
            விழா தேர்வு
          </h2>
          <div className='max-w-md'>
            <CustomDropdown
              label='விழா தேர்வு செய்க'
              placeholder='விழா தேர்வு செய்க அல்லது தேடுக'
              options={functionOptions}
              value={selectedFunction?.function_id || ''}
              onChange={handleFunctionSelect}
              onSearch={setFunctionSearch}
              searchable={true}
              loading={functionsLoading}
              required={true}
            />
            {errors.function_selection && (
              <span className='text-red-500 text-sm mt-1 block'>
                {errors.function_selection}
              </span>
            )}
          </div>

          {selectedFunction && (
            <div className='mt-4 p-3 bg-blue-50 rounded border'>
              <p className='text-sm text-blue-700'>
                <strong>தேர்ந்தெடுக்கப்பட்ட விழா:</strong>{' '}
                {selectedFunction.function_name}
              </p>
              <p className='text-sm text-blue-700'>
                <strong>நடத்துபவர்:</strong>{' '}
                {selectedFunction.function_owner_name}
              </p>
              <p className='text-sm text-blue-700'>
                <strong>விழா இடம்:</strong>{' '}
                {selectedFunction.function_held_place},{' '}
                {selectedFunction.function_held_city}
              </p>
              {isEditMode && (
                <p className='text-sm text-orange-600 font-semibold mt-2'>
                  ⚠️ Edit Mode: This function already has bill details
                </p>
              )}
              {billDetailsLoading && (
                <p className='text-sm text-blue-600 mt-2'>
                  Loading bill details...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Edit Reason Section - Show when function is selected */}
        {selectedFunction && (
          <div
            className={`p-6 rounded-lg border ${
              isEditMode
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-3 ${
                isEditMode ? 'text-yellow-800' : 'text-blue-800'
              }`}
            >
              {isEditMode ? 'Edit Reason Required' : 'Notes (Optional)'}
            </h3>
            <label
              className={`block text-sm font-semibold mb-2 ${
                isEditMode ? 'text-yellow-800' : 'text-blue-800'
              }`}
            >
              {isEditMode && <span className='text-red-500 mr-1'>*</span>}
              {isEditMode
                ? 'Reason for editing bill details'
                : 'Any additional notes or comments'}
            </label>
            <textarea
              value={editReason}
              onChange={handleEditReasonChange}
              placeholder={
                isEditMode
                  ? 'Please provide a reason for editing these bill details...'
                  : 'Add any notes or comments (optional)...'
              }
              className={`w-full border rounded p-3 focus:ring-1 outline-none resize-none h-20 ${
                isEditMode
                  ? `focus:border-yellow-500 focus:ring-yellow-500 ${
                      errors.editReason
                        ? 'border-red-500 bg-red-50'
                        : 'border-yellow-300 bg-white'
                    }`
                  : `focus:border-blue-500 focus:ring-blue-500 border-blue-300 bg-white`
              }`}
            />
            {errors.editReason && (
              <span className='text-red-500 text-sm mt-1 block'>
                {errors.editReason}
              </span>
            )}
            {isEditMode && hasChanges && editReason.trim() && (
              <div className='mt-2 p-2 bg-green-50 border border-green-200 rounded'>
                <p className='text-xs text-green-700 font-semibold'>
                  ✓ Ready to update {Object.keys(getChangedFields()).length}{' '}
                  field(s)
                </p>
              </div>
            )}
          </div>
        )}

        {selectedFunction && !billDetailsLoading && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* 1. உரிமையாளர் பெயர் - Owner Name - Index 0 */}
            <div className='flex flex-col gap-2'>
              <label className='text-md font-semibold'>
                <span className='text-red-500 mr-1'>*</span>உரிமையாளர் பெயர்
              </label>
              <input
                type='text'
                className={getInputClassName('owner_name')}
                placeholder='உரிமையாளர் பெயர்'
                value={formData.owner_name}
                onChange={(e) =>
                  handleInputChange('owner_name', e.target.value)
                }
                onKeyDown={(e) => handleKeyDown(e, 0)}
                ref={(el) => (formRefs.current[0] = el)}
                disabled={isPending || isFormDisabled}
              />
              {errors.owner_name && (
                <span className='text-red-500 text-sm'>
                  {errors.owner_name}
                </span>
              )}
            </div>

            {/* 2. உரிமையாளர் தொழில் - Owner Occupation - Dropdown - Index 1 */}
            <div className='flex flex-col gap-2'>
              <CustomDropdownInput
                label='உரிமையாளர் தொழில்'
                placeholder='தொழில் தேர்வு செய்க'
                options={occupations}
                value={formData.owner_occupation}
                onChange={(value) =>
                  handleInputChange('owner_occupation', value)
                }
                onKeyDown={(e) => handleKeyDown(e, 1)}
                ref={(el) => (formRefs.current[1] = el)}
                name='owner_occupation'
                className={
                  errors.owner_occupation ? 'border-red-500 bg-red-50' : ''
                }
                required={true}
                disabled={isFormDisabled}
              />
              {errors.owner_occupation && (
                <span className='text-red-500 text-sm'>
                  {errors.owner_occupation}
                </span>
              )}
            </div>

            {/* 3. மனைவி பெயர் - Wife Name - Index 2 */}
            <div className='flex flex-col gap-2'>
              <label className='text-md font-semibold'>மனைவி பெயர்</label>
              <input
                type='text'
                className={getInputClassName('wife_name')}
                placeholder='மனைவி பெயர்'
                value={formData.wife_name}
                onChange={(e) => handleInputChange('wife_name', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                ref={(el) => (formRefs.current[2] = el)}
                disabled={isPending || isFormDisabled}
              />
            </div>

            {/* 4. மனைவி தொழில் - Wife Occupation - Dropdown - Index 3 */}
            <div className='flex flex-col gap-2'>
              <CustomDropdownInput
                label='மனைவி தொழில்'
                placeholder='தொழில் தேர்வு செய்க'
                options={occupations}
                value={formData.wife_occupation}
                onChange={(value) =>
                  handleInputChange('wife_occupation', value)
                }
                onKeyDown={(e) => handleKeyDown(e, 3)}
                ref={(el) => (formRefs.current[3] = el)}
                name='wife_occupation'
                required={false}
                disabled={isFormDisabled}
              />
            </div>

            {/* 5. விழா நடைபெறும் இடம் - Function Place - Index 4 */}
            <div className='flex flex-col gap-2'>
              <label className='text-md font-semibold'>
                <span className='text-red-500 mr-1'>*</span>விழா நடைபெறும் இடம்
              </label>
              <input
                type='text'
                className={getInputClassName('function_place')}
                placeholder='விழா நடைபெறும் இடம்'
                value={formData.function_place}
                onChange={(e) =>
                  handleInputChange('function_place', e.target.value)
                }
                onKeyDown={(e) => handleKeyDown(e, 4)}
                ref={(el) => (formRefs.current[4] = el)}
                disabled={isPending || isFormDisabled}
              />
              {errors.function_place && (
                <span className='text-red-500 text-sm'>
                  {errors.function_place}
                </span>
              )}
            </div>

            {/* 6. விழா நகரம் - Function City - Dropdown - Index 5 */}
            <div className='flex flex-col gap-2'>
              <CustomDropdownInput
                label='விழா நகரம்'
                placeholder='நகரம் தேர்வு செய்க'
                options={cities}
                value={formData.function_city}
                onChange={(value) => handleInputChange('function_city', value)}
                onKeyDown={(e) => handleKeyDown(e, 5)}
                ref={(el) => (formRefs.current[5] = el)}
                name='function_city'
                className={
                  errors.function_city ? 'border-red-500 bg-red-50' : ''
                }
                required={true}
                disabled={isFormDisabled}
              />
              {errors.function_city && (
                <span className='text-red-500 text-sm'>
                  {errors.function_city}
                </span>
              )}
            </div>
          </div>
        )}

        {selectedFunction && !billDetailsLoading && (
          <div className='flex justify-center'>
            <button
              className={`w-64 h-12 flex justify-center gap-2 items-center hover:scale-105 transition-all text-white rounded shadow ${
                isPending || (isEditMode && !editReason.trim()) || !hasChanges
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-darkBlue'
              }`}
              onClick={handleSubmit}
              disabled={
                isPending || (isEditMode && !editReason.trim()) || !hasChanges
              }
            >
              {isPending
                ? 'Saving...'
                : isEditMode
                ? 'Update Bill Details'
                : 'Save Bill Details'}
              <FaSave />
            </button>
          </div>
        )}

        {!selectedFunction && (
          <div className='bg-gray-50 p-6 rounded-lg text-center'>
            <p className='text-gray-500 text-lg'>
              விழா தேர்வு செய்து பில் விவரங்களை சேர்க்கவும்
            </p>
          </div>
        )}

        {billDetailsLoading && (
          <div className='bg-gray-50 p-6 rounded-lg text-center'>
            <p className='text-gray-500 text-lg'>Loading bill details...</p>
          </div>
        )}
      </div>

      {/* Right Side - Bill Preview */}
      {showPreview && (
        <div className='w-1/2 p-6 bg-gray-50'>
          <div className='sticky top-6'>
            <h2 className='text-xl font-bold text-darkBlue mb-4'>
              பில் முன்னோட்டம்
            </h2>
            <BillPreview
              formData={formData}
              selectedFunction={selectedFunction}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default FunctionBillDetails;
