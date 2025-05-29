import { useState, useRef, useEffect } from 'react';
import CustomDropdown from '../../components/ui/CustomDropdown';
import { CustomDropdownInput } from '../../components/ui/CustomInputDropdown';
import { FaSave, FaPrint, FaEye, FaTimes } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/AxiosInstance';
import useAuth from '@/context/useAuth';
import { toast } from 'react-toastify';
import PayersTable from './components/PayerTable';
import useDebounce from '@/hooks/useDebounce';
import NoDataPlaceholder from '@/components/ui/NoDataPlaceholder';
import { BillPreview } from '../BillDetails/components/BillPreview';

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

// Modal Component for Bill Preview
const BillPreviewModal = ({
  isOpen,
  onClose,
  onSave,
  onPrint,
  formData,
  selectedFunction,
  isLoading,
  autoPrint = false,
}) => {
  const printRef = useRef();
  const [contentReady, setContentReady] = useState(false);

  // Check if content is ready for printing
  useEffect(() => {
    if (isOpen && printRef.current) {
      const checkContent = () => {
        const content = printRef.current?.innerHTML;
        if (content && content.trim().length > 100) {
          setContentReady(true);
        } else {
          // Retry after a short delay
          setTimeout(checkContent, 100);
        }
      };

      // Start checking after a brief delay
      setTimeout(checkContent, 200);
    }
  }, [isOpen]);

  const handlePrint = () => {
    const printElement = printRef.current;

    // Validate print content exists
    if (!printElement || !printElement.innerHTML.trim()) {
      toast.error('Print content not ready. Please try again.');
      return;
    }

    // Check if BillPreview has rendered properly
    const billContent = printElement.innerHTML;
    if (billContent.length < 100) {
      toast.error('Bill content incomplete. Please try again.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print the bill.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill Print</title>
          <meta charset="UTF-8">
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            
            @page {
              size: 58mm auto;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 58mm !important;
              font-family: 'Courier New', monospace !important;
              font-size: 9px !important;
              line-height: 1.2 !important;
              background: white !important;
              color: black !important;
            }
            
            .bill-container {
              width: 58mm !important;
              max-width: 58mm !important;
              margin: 0 !important;
              padding: 2mm !important;
              background: white !important;
              font-family: 'Courier New', monospace !important;
              font-size: 9px !important;
              line-height: 1.2 !important;
              color: black !important;
            }
            
            .border-dotted {
              border-style: dotted !important;
              border-color: black !important;
            }
            
            .border-black {
              border-color: black !important;
            }
            
            .bg-black {
              background-color: black !important;
              color: white !important;
            }
            
            .text-white {
              color: white !important;
            }
            
            .font-bold {
              font-weight: bold !important;
            }
            
            .text-center {
              text-align: center !important;
            }
            
            .text-xs {
              font-size: 8px !important;
            }
            
            .text-sm {
              font-size: 9px !important;
            }
            
            .text-lg {
              font-size: 11px !important;
            }
            
            .mb-1 { margin-bottom: 1mm !important; }
            .mb-2 { margin-bottom: 2mm !important; }
            .mb-3 { margin-bottom: 3mm !important; }
            .mt-2 { margin-top: 2mm !important; }
            .py-1 { padding: 1mm 0 !important; }
            
            .flex {
              display: flex !important;
            }
            
            .justify-between {
              justify-content: space-between !important;
            }
            
            .justify-center {
              justify-content: center !important;
            }
            
            .items-center {
              align-items: center !important;
            }
            
            .gap-1 > * + * {
              margin-left: 1mm !important;
            }
            
            .gap-3 > * + * {
              margin-left: 3mm !important;
            }
            
            .leading-tight {
              line-height: 1.1 !important;
            }
            
            .border-t {
              border-top: 1px solid black !important;
            }
            
            .border-b {
              border-bottom: 1px solid black !important;
            }
            
            .border-t-2 {
              border-top: 2px solid black !important;
            }
            
            .w-4 {
              width: 4mm !important;
            }
            
            .h-4 {
              height: 4mm !important;
            }
          </style>
        </head>
        <body>
          ${billContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();

    if (onPrint) {
      onPrint(formData);
    }
  };

  // Auto-print effect when modal opens with autoPrint flag
  useEffect(() => {
    if (isOpen && autoPrint && contentReady && printRef.current) {
      const timer = setTimeout(() => {
        handlePrint();
        // Close modal after printing
        setTimeout(() => {
          onClose();
        }, 1500);
      }, 800);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoPrint, contentReady]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Modal Header */}
        <div className='flex justify-between items-center p-4 border-b bg-blue-50'>
          <h2 className='text-xl font-semibold text-blue-700'>
            பில் முன்னோட்டம்
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 p-1'
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
          <div className='print-area'>
            <BillPreview
              formData={formData}
              selectedFunction={selectedFunction}
              payerData={formData}
              ref={printRef}
              showPlaceholder={false}
            />
          </div>
        </div>

        {/* Modal Footer - Hide if auto-print mode */}
        {!autoPrint && (
          <div className='flex justify-end gap-3 p-4 border-t bg-gray-50'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100'
            >
              close
            </button>
            <button
              onClick={handlePrint}
              className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2'
            >
              <FaPrint />
              Print
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <FaSave />
              {isLoading ? 'saving...' : 'save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function PayerListingPage() {
  const formRefs = useRef([]);
  const queryClient = useQueryClient();
  const { token } = useAuth();

  // State for modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [autoPrintMode, setAutoPrintMode] = useState(false);

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
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Debounce phone number for auto-fill search
  const debouncedPhone = useDebounce(formData.payer_phno, 500);

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

  // Fetch payers for selected function with pagination
  const { data: payers = [], isLoading: payersLoading } = useQuery({
    queryKey: ['payers', selectedFunction?.function_id],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', '20');
      params.append('page', '1');

      const res = await axiosInstance.get(
        `/payers?function_id=${
          selectedFunction.function_id
        }&${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    enabled: !!selectedFunction?.function_id && !!token,
    staleTime: Infinity,
  });

  // Auto-fill query - search for existing payer by phone number
  const { data: existingPayer } = useQuery({
    queryKey: ['existing-payer', debouncedPhone],
    queryFn: async () => {
      if (!debouncedPhone || debouncedPhone.length < 10) return null;

      try {
        const res = await axiosInstance.get(`/payers/phone/${debouncedPhone}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return res.data?.data?.[0] || null;
      } catch {
        return null;
      }
    },
    enabled:
      !!token &&
      !!debouncedPhone &&
      debouncedPhone.length >= 10 &&
      formData.payer_phno.length >= 10 &&
      debouncedPhone === formData.payer_phno,
    staleTime: 0,
  });

  // Auto-fill effect
  useEffect(() => {
    if (
      existingPayer &&
      !isAutoFilled &&
      debouncedPhone.length === 10 &&
      formData.payer_phno === debouncedPhone &&
      formData.payer_name === ''
    ) {
      setFormData((prev) => ({
        ...prev,
        payer_name: existingPayer.payer_name || '',
        payer_work: existingPayer.payer_work || '',
        payer_city: existingPayer.payer_city || '',
        payer_address: existingPayer.payer_address || '',
      }));

      setIsAutoFilled(true);
      toast.success('பயனர் விவரங்கள் தானாக நிரப்பப்பட்டது');

      setTimeout(() => {
        const relationField = formRefs.current[3];
        if (relationField && relationField.focus) {
          relationField.focus();
        }
      }, 100);
    }
  }, [
    existingPayer,
    isAutoFilled,
    debouncedPhone,
    formData.payer_phno,
    formData.payer_name,
  ]);

  useEffect(() => {
    if (formData.payer_phno.length < 10) {
      setIsAutoFilled(false);
    }
  }, [formData.payer_phno]);

  // Create payer mutation - FIXED auto-print logic
  const createPayerMutation = useMutation({
    mutationFn: async (payerData) => {
      const res = await axiosInstance.post('/payers', payerData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: (context) => {
      toast.success('Payer added successfully');

      // Invalidate queries first
      queryClient.invalidateQueries({
        queryKey: ['payers', selectedFunction?.function_id],
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: ['editLogs'],
        exact: true,
      });

      queryClient.removeQueries({ queryKey: ['existing-payer'] });

      // Check if we need to auto-print
      if (context?.shouldAutoPrint) {
        // Set auto-print mode and show modal for printing
        setAutoPrintMode(true);
        setShowPreviewModal(true);
      } else {
        // Normal flow - just close modal if it's open
        setShowPreviewModal(false);
      }

      // Reset form
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add payer');
    },
  });

  // Helper function to reset form
  const resetForm = () => {
    setFormData({
      function_id: selectedFunction?.function_id || '',
      function_name: selectedFunction?.function_name || '',
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
    setPaymentType('Cash');
    setIsAutoFilled(false);
  };

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

    if (
      isAutoFilled &&
      ['payer_name', 'payer_work', 'payer_city', 'payer_address'].includes(name)
    ) {
      setIsAutoFilled(false);
    }
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

  // Validation function
  const validateForm = () => {
    if (!selectedFunction) {
      toast.error('Please select a function first');
      return false;
    }

    if (!formData.payer_name || !formData.payer_phno) {
      toast.error('Please fill in required fields');
      return false;
    }

    if (paymentType === 'Cash' && !formData.payer_amount) {
      toast.error('Please enter the amount');
      return false;
    }

    if (paymentType === 'Gift' && !formData.payer_gift_name) {
      toast.error('Please enter the gift name');
      return false;
    }

    return true;
  };

  // Handle preview button click
  const handlePreview = () => {
    if (!validateForm()) return;

    const updatedFormData = {
      ...formData,
      payer_given_object: paymentType,
    };

    setFormData(updatedFormData);
    setAutoPrintMode(false); // Regular preview mode
    setShowPreviewModal(true);
  };

  // Handle save from modal
  const handleSaveFromModal = () => {
    const payerData = {
      ...formData,
      payer_given_object: paymentType,
    };

    createPayerMutation.mutate(payerData);
  };

  // Handle save and print - main form save button
  const handleSaveAndPrint = () => {
    if (!validateForm()) return;

    const payerData = {
      ...formData,
      payer_given_object: paymentType,
    };

    // Pass context to indicate auto-print should happen
    createPayerMutation.mutate(payerData, {
      context: { shouldAutoPrint: true },
    });
  };

  // Handle modal close - reset auto-print mode
  const handleModalClose = () => {
    setShowPreviewModal(false);
    setAutoPrintMode(false);
  };

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
      label: `${func.function_id}`,
      value: func.function_id,
    })) || [];

  return (
    <div className='flex flex-col gap-6 px-4 pb-10'>
      {/* Bill Preview Modal - FIXED to support auto-print */}
      <BillPreviewModal
        isOpen={showPreviewModal}
        onClose={handleModalClose}
        onSave={handleSaveFromModal}
        formData={{ ...formData, payer_given_object: paymentType }}
        selectedFunction={selectedFunction}
        isLoading={createPayerMutation.isPending}
        autoPrint={autoPrintMode}
      />

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
            onSearch={setFunctionSearch}
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

                {isAutoFilled && (
                  <div className='mb-4 p-3 bg-green-50 rounded border border-green-200'>
                    <p className='text-sm text-green-700'>
                      ✓ பயனர் விவரங்கள் தானாக நிரப்பப்பட்டது. தேவையானால்
                      மாற்றலாம்.
                    </p>
                  </div>
                )}
              </div>

              {/* Phone Number - Moved to top for auto-fill priority */}
              <div className='flex flex-col gap-2'>
                <label className='text-md font-semibold'>
                  <span className='text-red-500 mr-1'>*</span>கைபேசி எண்
                </label>
                <input
                  type='text'
                  className='border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
                  placeholder='கைபேசி எண்'
                  value={formData.payer_phno}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      handleInputChange('payer_phno', value);
                    }
                  }}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                  ref={(el) => (formRefs.current[0] = el)}
                  maxLength={10}
                />
                {debouncedPhone.length >= 10 && existingPayer && (
                  <p className='text-xs text-green-600'>
                    பழைய பயனர் கண்டுபிடிக்கப்பட்டது - விவரங்கள் தானாக
                    நிரப்பப்பட்டது
                  </p>
                )}
              </div>

              {/* Payer Name */}
              <div className='flex flex-col gap-2'>
                <label className='text-md font-semibold'>
                  <span className='text-red-500 mr-1'>*</span>செலுத்துபவர் பெயர்
                </label>
                <input
                  type='text'
                  className={`border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none ${
                    isAutoFilled ? 'bg-green-50' : ''
                  }`}
                  placeholder='செலுத்துபவர் பெயர்'
                  value={formData.payer_name}
                  onChange={(e) =>
                    handleInputChange('payer_name', e.target.value)
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
                  className={isAutoFilled ? 'bg-green-50' : ''}
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
                  className={isAutoFilled ? 'bg-green-50' : ''}
                />
              </div>

              {/* Address */}
              <div className='flex flex-col gap-2'>
                <label className='text-md font-semibold'>
                  செலுத்துபவர் முகவரி
                </label>
                <input
                  type='text'
                  className={`border rounded p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none ${
                    isAutoFilled ? 'bg-green-50' : ''
                  }`}
                  placeholder='செலுத்துபவர் முகவரி'
                  value={formData.payer_address}
                  onChange={(e) =>
                    handleInputChange('payer_address', e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, 8)}
                  ref={(el) => (formRefs.current[8] = el)}
                />
              </div>

              {/* Action Buttons */}
              <div className='col-span-2 flex justify-center gap-4 pt-4'>
                <button
                  type='button'
                  onClick={handlePreview}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2'
                >
                  <FaEye />
                  முன்னோட்டம்
                </button>
                <button
                  type='button'
                  onClick={() => {
                    if (validateForm()) {
                      handleSaveAndPrint();
                    }
                  }}
                  disabled={createPayerMutation.isPending}
                  className='bg-darkBlue hover:scale-105 transition-all text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <FaSave />
                  {createPayerMutation.isPending ? 'சேமிக்கிறது...' : 'சேமி'}
                </button>
              </div>
            </div>
          </div>

          {/* Payers Table Section */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            {payersLoading ? (
              <div className='flex justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              </div>
            ) : payers?.data?.length > 0 ? (
              <PayersTable
                data={payers?.data}
                isLoading={payersLoading}
                actionType='normal'
                selectedFunctionId={selectedFunction?.function_id}
              />
            ) : (
              <NoDataPlaceholder message='இந்த விழாவிற்கு இன்னும் செலுத்துபவர்கள் இல்லை' />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PayerListingPage;
