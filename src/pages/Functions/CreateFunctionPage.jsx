import { useState, useRef, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { CustomDropdownInput } from '../../components/ui/CustomInputDropdown';
import {
  CustomDatePickerInput,
  CustomTimePickerInput,
} from '../../components/ui/CustomDatePicker';
import { FaSave } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import axiosInstance from '@/utils/AxiosInstance';

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

function CreateFunctionPage() {
  const formRefs = useRef([]);
  const navigate = useNavigate();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState({});

  // Initialize with current date and time
  const now = new Date();
  const currentDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const currentTime = new Date();

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
    function_start_date: currentDate,
    function_start_time: currentTime,
    function_end_date: currentDate,
    function_end_time: currentTime,
    function_total_days: '1',
  });

  // Calculate total days when start or end date changes
  useEffect(() => {
    if (formData.function_start_date && formData.function_end_date) {
      const startDate = new Date(formData.function_start_date);
      const endDate = new Date(formData.function_end_date);

      // Reset time to avoid timezone issues
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      setFormData((prev) => ({
        ...prev,
        function_total_days: daysDiff > 0 ? daysDiff.toString() : '1',
      }));
    }
  }, [formData.function_start_date, formData.function_end_date]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    const requiredFields = [
      { key: 'function_name', label: 'விழாபெயர்' },
      { key: 'function_owner_name', label: 'நடத்துபவர்' },
      { key: 'function_owner_city', label: 'நடத்துபவர் ஊர்' },
      { key: 'function_owner_phno', label: 'நடத்துபவர் கைபேசி எண்' },
      { key: 'function_amt_spent', label: 'மொத்த செலவு' },
      { key: 'function_held_place', label: 'விழா நடைபெறும் இடம்' },
      { key: 'function_held_city', label: 'விழா இடம்' },
      { key: 'function_start_date', label: 'விழா தொடங்கும் தேதி' },
      { key: 'function_start_time', label: 'விழா ஆரம்ப நேரம்' },
      { key: 'function_end_date', label: 'விழா முடியும் தேதி' },
      { key: 'function_end_time', label: 'விழா முடியும் நேரம்' },
    ];

    // Check required fields
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

  // Handle date selection
  const handleDateChange = (date, fieldName) => {
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    setFormData({
      ...formData,
      [fieldName]: date,
    });
  };

  // Handle date-time selection (for time fields)
  const handleDateTimeChange = (date, fieldName) => {
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    setFormData({
      ...formData,
      [fieldName]: date,
    });
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

  const submitFormData = async (formData) => {
    const { data } = await axiosInstance.post('/functions', formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  };

  const { mutate: addFunction } = useMutation({
    mutationFn: submitFormData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['functions'],
      });
      toast.success('Function Created');
      navigate('/');
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong');
    },
  });

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      addFunction(formData);
    } else {
      toast.error('Please fill in all required fields correctly');

      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      const fieldIndex = getFieldIndex(firstErrorField);
      if (fieldIndex !== -1 && formRefs.current[fieldIndex]) {
        formRefs.current[fieldIndex].focus();
      }
    }
  };

  // Helper function to get field index for focusing - Updated order
  const getFieldIndex = (fieldName) => {
    const fieldIndexMap = {
      function_name: 0,
      function_held_city: 1,
      function_start_date: 2,
      function_start_time: 3,
      function_end_date: 4,
      function_end_time: 5,
      function_owner_name: 6,
      function_owner_phno: 7,
      function_hero_name: 8,
      function_heroine_name: 9,
      function_amt_spent: 10,
      function_owner_city: 11,
      function_owner_address: 12,
      function_held_place: 13,
    };
    return fieldIndexMap[fieldName] || -1;
  };

  // Helper function to get error styling
  const getInputClassName = (fieldName) => {
    const baseClassName =
      'border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none';
    return errors[fieldName]
      ? `${baseClassName} border-red-500 bg-red-50`
      : baseClassName;
  };

  return (
    <div className='flex flex-col gap-6 px-4 pb-10 bg-white p-6 rounded-lg shadow-md'>
      {/* Page Header */}
      <div className='flex  items-center py-4'>
        <h1 className='text-2xl font-bold text-darkBlue'>விழாவின் விவரங்கள்</h1>
      </div>

      <div className=' grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* 1. விழாபெயர் - Function Type - Dropdown - Index 0 */}
        <div className='flex flex-col gap-2'>
          <CustomDropdownInput
            label='விழாபெயர்'
            placeholder='விழாபெயர்'
            options={functionTypes}
            value={formData.function_name}
            onChange={(value) => handleInputChange('function_name', value)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            ref={(el) => (formRefs.current[0] = el)}
            name='function_name'
            className={errors.function_name ? 'border-red-500 bg-red-50' : ''}
          />
          {errors.function_name && (
            <span className='text-red-500 text-sm'>{errors.function_name}</span>
          )}
        </div>

        {/* 2. விழா இடம் - Function City - Dropdown - Index 1 */}
        <div className='flex flex-col gap-2'>
          <CustomDropdownInput
            label='விழா இடம்'
            placeholder='விழா இடம்'
            options={cities}
            value={formData.function_held_city}
            onChange={(value) => handleInputChange('function_held_city', value)}
            onKeyDown={(e) => handleKeyDown(e, 1)}
            ref={(el) => (formRefs.current[1] = el)}
            name='function_held_city'
            className={
              errors.function_held_city ? 'border-red-500 bg-red-50' : ''
            }
          />
          {errors.function_held_city && (
            <span className='text-red-500 text-sm'>
              {errors.function_held_city}
            </span>
          )}
        </div>

        {/* 3. விழா தொடங்கும் தேதி - Start Date - Index 2 */}
        <div className='flex flex-col gap-2'>
          <CustomDatePickerInput
            label='விழா தொடங்கும் தேதி'
            selected={formData.function_start_date}
            onChange={(date) => handleDateChange(date, 'function_start_date')}
            dateFormat='MM/dd/yyyy'
            placeholderText='Select start date'
            onKeyDown={(e) => handleKeyDown(e, 2)}
            ref={(el) => (formRefs.current[2] = el)}
            name='function_start_date'
            className={
              errors.function_start_date ? 'border-red-500 bg-red-50' : ''
            }
          />
          {errors.function_start_date && (
            <span className='text-red-500 text-sm'>
              {errors.function_start_date}
            </span>
          )}
        </div>

        {/* 4. விழா ஆரம்ப நேரம் - Start Time - Index 3 */}
        <div className='flex flex-col gap-2'>
          <CustomTimePickerInput
            label='விழா ஆரம்ப நேரம்'
            selected={formData.function_start_time}
            onChange={(date) =>
              handleDateTimeChange(date, 'function_start_time')
            }
            dateFormat='h:mm aa'
            placeholderText='Select start time'
            timeIntervals={30}
            timeCaption='Time'
            onKeyDown={(e) => handleKeyDown(e, 3)}
            ref={(el) => (formRefs.current[3] = el)}
            name='function_start_time'
            className={
              errors.function_start_time ? 'border-red-500 bg-red-50' : ''
            }
          />
          {errors.function_start_time && (
            <span className='text-red-500 text-sm'>
              {errors.function_start_time}
            </span>
          )}
        </div>

        {/* 5. விழா முடியும் தேதி - End Date - Index 4 */}
        <div className='flex flex-col gap-2'>
          <CustomDatePickerInput
            label='விழா முடியும் தேதி'
            selected={formData.function_end_date}
            onChange={(date) => handleDateChange(date, 'function_end_date')}
            dateFormat='MM/dd/yyyy'
            placeholderText='Select end date'
            onKeyDown={(e) => handleKeyDown(e, 4)}
            ref={(el) => (formRefs.current[4] = el)}
            name='function_end_date'
            className={
              errors.function_end_date ? 'border-red-500 bg-red-50' : ''
            }
          />
          {errors.function_end_date && (
            <span className='text-red-500 text-sm'>
              {errors.function_end_date}
            </span>
          )}
        </div>

        {/* 6. விழா முடியும் நேரம் - End Time - Index 5 */}
        <div className='flex flex-col gap-2'>
          <CustomTimePickerInput
            label='விழா முடியும் நேரம்'
            selected={formData.function_end_time}
            onChange={(date) => handleDateTimeChange(date, 'function_end_time')}
            dateFormat='h:mm aa'
            placeholderText='Select end time'
            timeIntervals={30}
            timeCaption='Time'
            onKeyDown={(e) => handleKeyDown(e, 5)}
            ref={(el) => (formRefs.current[5] = el)}
            name='function_end_time'
            className={
              errors.function_end_time ? 'border-red-500 bg-red-50' : ''
            }
          />
          {errors.function_end_time && (
            <span className='text-red-500 text-sm'>
              {errors.function_end_time}
            </span>
          )}
        </div>

        {/* 7. நாட்கள் - Total Days - Auto-calculated and non-editable - Display only */}
        <div className='flex flex-col gap-2'>
          <label className='text-md font-semibold'>
            நாட்கள் (Auto-calculated)
          </label>
          <input
            type='number'
            className='border rounded p-2 bg-gray-100 cursor-not-allowed outline-none'
            placeholder='நாட்கள்'
            value={formData.function_total_days}
            readOnly
            disabled
            min='1'
          />
          <span className='text-sm text-gray-600'>
            Automatically calculated based on start and end dates
          </span>
        </div>

        {/* 8. நடத்துபவர் - Function Owner Name - Index 6 (Focus shifts here after end time) */}
        <div className='flex flex-col gap-2'>
          <label className='text-md font-semibold'>
            <span className='text-red-500 mr-1'>*</span>நடத்துபவர்
          </label>
          <input
            type='text'
            className={getInputClassName('function_owner_name')}
            placeholder='நடத்துபவர் பெயர்'
            value={formData.function_owner_name}
            onChange={(e) =>
              handleInputChange('function_owner_name', e.target.value)
            }
            onKeyDown={(e) => handleKeyDown(e, 6)}
            ref={(el) => (formRefs.current[6] = el)}
          />
          {errors.function_owner_name && (
            <span className='text-red-500 text-sm'>
              {errors.function_owner_name}
            </span>
          )}
        </div>

        {/* 9. நடத்துபவர் கைபேசி எண் - Phone Number - Index 7 */}
        <div className='flex flex-col gap-2'>
          <label className='text-md font-semibold'>
            <span className='text-red-500 mr-1'>*</span>நடத்துபவர் கைபேசி எண்
          </label>
          <input
            type='text'
            className={getInputClassName('function_owner_phno')}
            placeholder='நடத்துபவர் கைபேசி எண்'
            value={formData.function_owner_phno}
            onChange={(e) =>
              handleInputChange('function_owner_phno', e.target.value)
            }
            onKeyDown={(e) => handleKeyDown(e, 7)}
            ref={(el) => (formRefs.current[7] = el)}
          />
          {errors.function_owner_phno && (
            <span className='text-red-500 text-sm'>
              {errors.function_owner_phno}
            </span>
          )}
        </div>

        {/* 10. விழா நாயகன் - Groom Name - Index 8 */}
        <div className='flex flex-col gap-2'>
          <label className='text-md font-semibold'>விழா நாயகன்</label>
          <input
            type='text'
            className={getInputClassName('function_hero_name')}
            placeholder='விழா நாயகன்'
            value={formData.function_hero_name}
            onChange={(e) =>
              handleInputChange('function_hero_name', e.target.value)
            }
            onKeyDown={(e) => handleKeyDown(e, 8)}
            ref={(el) => (formRefs.current[8] = el)}
          />
        </div>

        {/* 11. விழா நாயகி - Bride Name - Index 9 */}
        <div className='flex flex-col gap-2'>
          <label className='text-md font-semibold'>விழா நாயகி</label>
          <input
            type='text'
            className={getInputClassName('function_heroine_name')}
            placeholder='விழா நாயகி'
            value={formData.function_heroine_name}
            onChange={(e) =>
              handleInputChange('function_heroine_name', e.target.value)
            }
            onKeyDown={(e) => handleKeyDown(e, 9)}
            ref={(el) => (formRefs.current[9] = el)}
          />
        </div>

        {/* 12. மொத்த செலவு - Amount Spent - Index 10 */}
        <div className='flex flex-col gap-2'>
          <label className='text-md font-semibold'>
            <span className='text-red-500 mr-1'>*</span>மொத்த செலவு
          </label>
          <input
            type='number'
            className={getInputClassName('function_amt_spent')}
            placeholder='மொத்த செலவு'
            value={formData.function_amt_spent}
            onChange={(e) =>
              handleInputChange('function_amt_spent', e.target.value)
            }
            onKeyDown={(e) => handleKeyDown(e, 10)}
            ref={(el) => (formRefs.current[10] = el)}
          />
          {errors.function_amt_spent && (
            <span className='text-red-500 text-sm'>
              {errors.function_amt_spent}
            </span>
          )}
        </div>

        {/* 13. நடத்துபவர் ஊர் - City - Dropdown - Index 11 */}
        <div className='flex flex-col gap-2'>
          <CustomDropdownInput
            label='நடத்துபவர் ஊர்'
            placeholder='நடத்துபவர் ஊர்'
            options={cities}
            value={formData.function_owner_city}
            onChange={(value) =>
              handleInputChange('function_owner_city', value)
            }
            onKeyDown={(e) => handleKeyDown(e, 11)}
            ref={(el) => (formRefs.current[11] = el)}
            name='function_owner_city'
            className={
              errors.function_owner_city ? 'border-red-500 bg-red-50' : ''
            }
          />
          {errors.function_owner_city && (
            <span className='text-red-500 text-sm'>
              {errors.function_owner_city}
            </span>
          )}
        </div>

        {/* 14. நடத்துபவர் முகவரி - Address - Index 12 */}
        <div className='flex flex-col gap-2'>
          <label className='text-md font-semibold'>நடத்துபவர் முகவரி</label>
          <input
            type='text'
            className={getInputClassName('function_owner_address')}
            placeholder='நடத்துபவர் முகவரி'
            value={formData.function_owner_address}
            onChange={(e) =>
              handleInputChange('function_owner_address', e.target.value)
            }
            onKeyDown={(e) => handleKeyDown(e, 12)}
            ref={(el) => (formRefs.current[12] = el)}
          />
        </div>

        {/* Function Place - Index 13 */}
        <div className='flex flex-col gap-2'>
          <label className='text-md font-semibold'>
            <span className='text-red-500 mr-1'>*</span>விழா நடைபெறும் இடம்
          </label>
          <input
            type='text'
            className={getInputClassName('function_held_place')}
            placeholder='விழா நடைபெறும் இடம்'
            value={formData.function_held_place}
            onChange={(e) =>
              handleInputChange('function_held_place', e.target.value)
            }
            onKeyDown={(e) => handleKeyDown(e, 13)}
            ref={(el) => (formRefs.current[13] = el)}
          />
          {errors.function_held_place && (
            <span className='text-red-500 text-sm'>
              {errors.function_held_place}
            </span>
          )}
        </div>
      </div>
      <div className='flex justify-center'>
        <button
          className='bg-darkBlue w-64 h-12 flex justify-center gap-2 items-center hover:scale-105 transition-all text-white  rounded shadow'
          onClick={handleSubmit}
        >
          Save <FaSave />
        </button>
      </div>
    </div>
  );
}

export default CreateFunctionPage;
