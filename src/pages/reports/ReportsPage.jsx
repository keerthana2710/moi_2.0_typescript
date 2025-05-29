import React, { useState, useEffect } from 'react';
import useDebounce from '@/hooks/useDebounce';
import axiosInstance from '@/utils/AxiosInstance';
import useAuth from '@/context/useAuth';
import { useQuery } from '@tanstack/react-query';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { ReportTable } from './components/ReportTable';
import ChipSelector from '@/components/ui/ChipSelector';
import Pagination from '@/components/ui/Pagination';

// Main Reports Page Component
function ReportsPage() {
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionSearch, setFunctionSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageFetch, setPageFetch] = useState(20);
  const [totalPage, setTotalPage] = useState(1);
  const { token } = useAuth();

  const debouncedFunctionSearch = useDebounce(functionSearch, 500);

  // Fetch functions with search functionality
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
    enabled: !!token,
    staleTime: Infinity,
  });

  // Fixed totalAmount query
  const { data: totalAmount, isLoading: totalAmountLoading } = useQuery({
    queryKey: ['totalAmount', selectedFunction?.function_id],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/functions/${selectedFunction?.function_id}/total-payment`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    enabled: !!token && !!selectedFunction?.function_id,
    staleTime: 300,
  });

  // Set initial selected function when functions data loads
  useEffect(() => {
    if (functions?.data?.length > 0 && !selectedFunction) {
      setSelectedFunction(functions.data[0]);
    }
  }, [functions, selectedFunction]);

  useEffect(() => {
    setPage(1);
  }, [selectedFunction, pageFetch]);

  // Fetch payers for selected function with pagination
  const { data: payers = {}, isLoading: payersLoading } = useQuery({
    queryKey: ['payers', selectedFunction?.function_id, page, pageFetch],
    queryFn: async () => {
      if (!selectedFunction?.function_id) return { data: [], pagination: {} };

      const params = new URLSearchParams();
      params.append('limit', pageFetch.toString());
      params.append('page', page.toString());

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
    staleTime: 1000 * 60 * 5, // 5 minutes instead of Infinity for fresher data
    onSuccess: (data) => {
      if (data?.pagination?.pages) {
        setTotalPage(data.pagination.pages);
      }
    },
  });

  // Prepare dropdown options
  const functionOptions =
    functions?.data?.map((func) => ({
      label: `${func.function_id} - ${func.function_name}`,
      value: func.function_id,
    })) || [];

  // Handle function selection
  const handleFunctionSelect = (value) => {
    const functionData = functions?.data?.find(
      (func) => func.function_id === value
    );
    if (functionData) {
      setSelectedFunction(functionData);
    }
  };

  // Handle function search
  const handleFunctionSearch = (searchTerm) => {
    setFunctionSearch(searchTerm);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle page fetch change
  const handlePageFetchChange = (newPageFetch) => {
    setPageFetch(newPageFetch);
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className='flex flex-col gap-6 px-4 pb-10 bg-gray-50 min-h-screen'>
      {/* Page Header */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <h1 className='text-3xl font-bold text-blue-800 mb-2'>
          விழா அறிக்கைகள்
        </h1>
        <p className='text-gray-600'>
          Select a function to generate detailed payers report
        </p>
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
            onSearch={handleFunctionSearch}
            searchable={true}
            loading={functionsLoading}
            required={true}
          />
        </div>

        {selectedFunction && (
          <div className='mt-4 p-4 bg-blue-50 rounded border'>
            <h3 className='font-semibold text-blue-800 mb-2'>
              Selected Function Details:
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm'>
              <p>
                <strong>Function ID:</strong> {selectedFunction.function_id}
              </p>
              <p>
                <strong>Function Name:</strong> {selectedFunction.function_name}
              </p>
              <p>
                <strong>Owner:</strong>{' '}
                {selectedFunction.function_owner_name || 'N/A'}
              </p>
              <p>
                <strong>Location:</strong>{' '}
                {selectedFunction.function_held_place || 'N/A'},{' '}
                {selectedFunction.function_held_city || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Total Payment Summary */}
      {selectedFunction && (
        <div className='bg-white p-6 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4 text-blue-700'>
            மொத்த கொடுப்பனவு சுருக்கம்
          </h2>
          {totalAmountLoading ? (
            <div className='flex items-center gap-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
              <span className='text-gray-600'>Loading payment summary...</span>
            </div>
          ) : totalAmount?.data ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
                <h3 className='text-lg font-semibold text-green-800 mb-2'>
                  மொத்த தொகை (Total Amount)
                </h3>
                <p className='text-xl font-bold text-green-600'>
                  {formatCurrency(totalAmount.data.totalAmount)}
                </p>
              </div>
              <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                <h3 className='text-lg font-semibold text-blue-800 mb-2'>
                  மொத்த பங்களிப்பாளர்கள் (Total Contributors)
                </h3>
                <p className='text-xl font-bold text-blue-600'>
                  {totalAmount.data.count}
                </p>
              </div>
            </div>
          ) : (
            <div className='text-gray-500 italic'>
              No payment data available for this function.
            </div>
          )}
        </div>
      )}

      <ChipSelector
        label={'பெற வேண்டிய பக்கங்கள்'}
        pageFetch={pageFetch}
        setPageFetch={handlePageFetchChange}
      />

      <ReportTable
        data={payers?.data || []}
        isLoading={payersLoading}
        selectedFunction={selectedFunction}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default ReportsPage;
