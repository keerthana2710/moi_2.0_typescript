import { useState, useRef, useEffect } from 'react';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { CustomDropdownInput } from '../../components/ui/CustomInputDropdown';
import { FaSave } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/AxiosInstance';
import useAuth from '@/context/useAuth';
import { toast } from 'react-toastify';
import PayersTable from './components/PayerTable';
import useDebounce from '@/hooks/useDebounce'; // Your custom hook

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

const paymentTypes = ['Cash', 'Gift'];

function PayerListingPage() {
  const formRefs = useRef([]);
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // State for selected function
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionSearch, setFunctionSearch] = useState('');

  // Use your custom debounce hook
  const debouncedFunctionSearch = useDebounce(functionSearch, 300);

  // State for form fields
  const [formData, setFormData] = useState({
    function_id: '',
    function_name: '',
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
    current_date: new Date(),
    current_time: new Date(),
  });

  const [paymentType, setPaymentType] = useState('Cash');

  // Fetch functions for dropdown - ONLY use debounced search in query key
  const { data: functions, isLoading: functionsLoading } = useQuery({
    queryKey: ['functions', debouncedFunctionSearch], // Only debounced value
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
    enabled: !!token,
  });

  // Fetch payers for selected function
  const { data: payers = [], isLoading: payersLoading } = useQuery({
    queryKey: ['payers', selectedFunction?.function_id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/payers?function_id=${selectedFunction.function_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    enabled: !!selectedFunction?.function_id && !!token,
  });

  // Create payer mutation
  const createPayerMutation = useMutation({
    mutationFn: async (payerData) => {
      const res = await axiosInstance.post('/payers', payerData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payer added successfully');
      queryClient.invalidateQueries(['payers', selectedFunction?.function_id]);
      // Reset form
      setFormData({
        function_id: selectedFunction?.function_id || '',
        function_name: selectedFunction?.function_name || '',
        payer_name: '',
        payer_phno: '',
        payer_work: '',
        payer_given_object: '',
        payer_cash_method: '',
        payer_amount: '',
        payer_gift_name: '',
        payer_relation: '',
        payer_city: '',
        payer_address: '',
        current_date: new Date(),
        current_time: new Date(),
      });
      setPaymentType('Cash');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add payer');
    },
  });

  // Handle function selection
  const handleFunctionSelect = (value) => {
    const functionData = functions?.data?.find(
      (func) => func.function_id === value
    );
    if (functionData) {
      setSelectedFunction(functionData);
      setFormData((prev) => ({
        ...prev,
        function_id: functionData.function_id,
        function_name: functionData.function_name,
      }));
    }
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle payment type change
  const handlePaymentTypeChange = (value) => {
    setPaymentType(value);
    handleInputChange('payer_given_object', value);

    if (value === 'Cash') {
      handleInputChange('payer_gift_name', '');
    } else {
      handleInputChange('payer_amount', '');
      handleInputChange('payer_cash_method', '');
    }
  };

  // Handle Enter key to mimic Tab behavior
  const handleKeyDown = (e, currentIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      let nextIndex = currentIndex + 1;
      let attempts = 0;
      const maxAttempts = formRefs.current.length;

      while (attempts < maxAttempts) {
        if (nextIndex >= formRefs.current.length) {
          nextIndex = 0;
        }

        const nextElement = formRefs.current[nextIndex];
        if (nextElement && nextElement.focus && !nextElement.disabled) {
          const isVisible = nextElement.offsetParent !== null;
          if (isVisible) {
            nextElement.focus();
            break;
          }
        }

        nextIndex++;
        attempts++;
      }
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedFunction) {
      toast.error('Please select a function first');
      return;
    }

    if (!formData.payer_name || !formData.payer_phno) {
      toast.error('Please fill in required fields');
      return;
    }

    if (paymentType === 'Cash' && !formData.payer_amount) {
      toast.error('Please enter the amount');
      return;
    }

    if (paymentType === 'Gift' && !formData.payer_gift_name) {
      toast.error('Please enter the gift name');
      return;
    }

    const payerData = {
      ...formData,
      payer_given_object: paymentType,
    };

    createPayerMutation.mutate(payerData);
  };

  // Update payment type in form data
  useEffect(() => {
    handleInputChange('payer_given_object', paymentType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentType]);

  // Clear refs array when payment type changes
  useEffect(() => {
    formRefs.current = [];
  }, [paymentType]);

  // Prepare dropdown options
  const functionOptions =
    functions?.data?.map((func) => ({
      label: `${func.function_name} - ${func.function_owner_name}`,
      value: func.function_id,
    })) || [];

  return (
    <div className='flex flex-col gap-6 px-4 pb-10'>
      {/* Page Header */}
      <div className='flex justify-between items-center py-4'>
        <h1 className='text-3xl font-bold'>செலுத்துபவர் விவரங்கள்</h1>
      </div>

      {/* Function Selection */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
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
            onSearch={setFunctionSearch} // This updates immediate search state
            searchable={true}
            loading={functionsLoading}
            required={true}
          />
        </div>
      </div>

      {selectedFunction && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Form Section */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='col-span-2'>
                <h2 className='text-xl font-semibold mb-4 text-blue-700'>
                  செலுத்துபவர் விவரங்கள்
                </h2>
                <div className='mb-4 p-3 bg-blue-50 rounded border'>
                  <p className='text-sm text-blue-700'>
                    <strong>தேர்ந்தெடுக்கப்பட்ட விழா:</strong>{' '}
                    {selectedFunction.function_name}
                  </p>
                  <p className='text-sm text-blue-700'>
                    <strong>நடத்துபவர்:</strong>{' '}
                    {selectedFunction.function_owner_name}
                  </p>
                </div>
              </div>

              {/* Payer Name */}
              <div className='flex flex-col gap-2'>
                <label className='text-md font-semibold'>
                  <span className='text-red-500 mr-1'>*</span>செலுத்துபவர் பெயர்
                </label>
                <input
                  type='text'
                  className='border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
                  placeholder='செலுத்துபவர் பெயர்'
                  value={formData.payer_name}
                  onChange={(e) =>
                    handleInputChange('payer_name', e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  ref={(el) => (formRefs.current[0] = el)}
                />
              </div>

              {/* Phone Number */}
              <div className='flex flex-col gap-2'>
                <label className='text-md font-semibold'>
                  <span className='text-red-500 mr-1'>*</span>கைபேசி எண்
                </label>
                <input
                  type='text'
                  className='border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
                  placeholder='கைபேசி எண்'
                  value={formData.payer_phno}
                  onChange={(e) =>
                    handleInputChange('payer_phno', e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, 1)}
                  ref={(el) => (formRefs.current[1] = el)}
                />
              </div>

              {/* Occupation */}
              <div>
                <CustomDropdownInput
                  label='செலுத்துபவர் தொழில்'
                  placeholder='தொழில் தேர்வு செய்க'
                  options={occupations}
                  value={formData.payer_work}
                  onChange={(value) => handleInputChange('payer_work', value)}
                  onKeyDown={(e) => handleKeyDown(e, 2)}
                  ref={(el) => (formRefs.current[2] = el)}
                  required={false}
                />
              </div>

              {/* Relation */}
              <div>
                <CustomDropdownInput
                  label='உறவு முறை'
                  placeholder='உறவு முறை தேர்வு செய்க'
                  options={relations}
                  value={formData.payer_relation}
                  onChange={(value) =>
                    handleInputChange('payer_relation', value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, 3)}
                  ref={(el) => (formRefs.current[3] = el)}
                  required={false}
                />
              </div>

              {/* Payment Type Selection */}
              <div className='col-span-2'>
                <CustomDropdownInput
                  label='செலுத்தும் வகை'
                  placeholder='செலுத்தும் வகை தேர்வு செய்க'
                  options={paymentTypes}
                  value={paymentType}
                  onChange={handlePaymentTypeChange}
                  onKeyDown={(e) => handleKeyDown(e, 4)}
                  ref={(el) => (formRefs.current[4] = el)}
                  required={true}
                />
              </div>

              {paymentType === 'Cash' ? (
                <>
                  {/* Cash Method */}
                  <div>
                    <CustomDropdownInput
                      label='செலுத்தும் முறை'
                      placeholder='செலுத்தும் முறை தேர்வு செய்க'
                      options={paymentMethods}
                      value={formData.payer_cash_method}
                      onChange={(value) =>
                        handleInputChange('payer_cash_method', value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, 5)}
                      ref={(el) => (formRefs.current[5] = el)}
                      required={false}
                    />
                  </div>

                  {/* Amount */}
                  <div className='flex flex-col gap-2'>
                    <label className='text-md font-semibold'>
                      <span className='text-red-500 mr-1'>*</span>தொகை
                    </label>
                    <input
                      type='number'
                      className='border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
                      placeholder='தொகை'
                      value={formData.payer_amount}
                      onChange={(e) =>
                        handleInputChange('payer_amount', e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, 6)}
                      ref={(el) => (formRefs.current[6] = el)}
                    />
                  </div>
                </>
              ) : (
                <div className='col-span-2 flex flex-col gap-2'>
                  <label className='text-md font-semibold'>
                    <span className='text-red-500 mr-1'>*</span>பரிசு பெயர்
                  </label>
                  <input
                    type='text'
                    className='border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
                    placeholder='பரிசு பெயர்'
                    value={formData.payer_gift_name}
                    onChange={(e) =>
                      handleInputChange('payer_gift_name', e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, 5)}
                    ref={(el) => (formRefs.current[5] = el)}
                  />
                </div>
              )}

              {/* City */}
              <div>
                <CustomDropdownInput
                  label='செலுத்துபவர் ஊர்'
                  placeholder='ஊர் தேர்வு செய்க'
                  options={cities}
                  value={formData.payer_city}
                  onChange={(value) => handleInputChange('payer_city', value)}
                  onKeyDown={(e) => handleKeyDown(e, 7)}
                  ref={(el) => (formRefs.current[7] = el)}
                  required={false}
                />
              </div>

              {/* Address */}
              <div className='flex flex-col gap-2'>
                <label className='text-md font-semibold'>
                  செலுத்துபவர் முகவரி
                </label>
                <input
                  type='text'
                  className='border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
                  placeholder='முகவரி'
                  value={formData.payer_address}
                  onChange={(e) =>
                    handleInputChange('payer_address', e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, 8)}
                  ref={(el) => (formRefs.current[8] = el)}
                />
              </div>
            </div>
            <div className='mt-5 flex justify-center'>
              <button
                onClick={handleSubmit}
                disabled={createPayerMutation.isPending}
                className='bg-darkBlue transition-all hover:scale-105 p-3 flex gap-2 items-center rounded-md text-white disabled:opacity-50'
              >
                {createPayerMutation.isPending ? 'Saving...' : 'Save/Print'}{' '}
                <FaSave />
              </button>
            </div>
          </div>

          {/* Table Section */}
          <PayersTable
            data={payers?.data}
            isLoading={payersLoading}
            actionType='normal'
          />
        </div>
      )}

      {!selectedFunction && (
        <div className='bg-white p-6 rounded-lg shadow-md text-center'>
          <p className='text-gray-500 text-lg'>
            விழா தேர்வு செய்து செலுத்துபவர் விவரங்களை சேர்க்கவும்
          </p>
        </div>
      )}
    </div>
  );
}

export default PayerListingPage;
