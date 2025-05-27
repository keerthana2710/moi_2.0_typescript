import ChipSelector from '@/components/ui/ChipSelector';
import PageHeaderWithSearch from '@/components/ui/PageHeaderWithSearch';
import useAuth from '@/context/useAuth';
import useDebounce from '@/hooks/useDebounce';
import axiosInstance from '@/utils/AxiosInstance';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Pagination from '@/components/ui/Pagination';
import PayersTable from '../components/PayerTable';
import CustomDropdown from '../../../components/ui/CustomDropdown'; // Import CustomDropdown

function PayerBinListing() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [pageFetch, setPageFetch] = useState(20);
  const [totalPage, setTotalPage] = useState(1);

  // Function selection state
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [functionSearch, setFunctionSearch] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Fetch functions for dropdown
  const { data: functions, isLoading: functionsLoading } = useQuery({
    queryKey: ['functions', functionSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (functionSearch) {
        params.append('search', functionSearch);
      }
      const res = await axiosInstance.get(`/functions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token,
    staleTime: Infinity,
  });

  const fetchPayers = async (page, pageFetch, searchQuery, functionId) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (pageFetch) params.append('limit', pageFetch);
      if (searchQuery) params.append('search', searchQuery);
      if (functionId) params.append('function_id', functionId); // Add function_id filter

      const url = `/payers/deleted?${params.toString()}`;

      const response = await axiosInstance.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setTotalPage(response?.data?.pagination?.total);
        return response.data;
      }
    } catch (err) {
      toast.error('Failed to fetch data');
      console.error(err);
    }
  };

  const { data: payersBinData, isLoading } = useQuery({
    queryKey: [
      'payers_bin',
      {
        page,
        pageFetch,
        debouncedSearchQuery,
        selectedFunction: selectedFunction?.function_id,
      },
    ],
    queryFn: () =>
      fetchPayers(
        page,
        pageFetch,
        debouncedSearchQuery,
        selectedFunction?.function_id
      ),
    staleTime: Infinity,
  });

  // Handle function selection
  const handleFunctionSelect = (value) => {
    if (value === '') {
      setSelectedFunction(null);
    } else {
      const functionData = functions?.data?.find(
        (func) => func.function_id === value
      );
      if (functionData) {
        setSelectedFunction(functionData);
      }
    }
    setPage(1);
  };

  // Prepare dropdown options
  const functionOptions = [
    { label: 'அனைத்து விழாக்கள்', value: '' }, // Option to show all functions
    ...(functions?.data?.map((func) => ({
      label: `${func.function_name} - ${func.function_owner_name}`,
      value: func.function_id,
    })) || []),
  ];

  return (
    <>
      <div className='flex flex-col gap-6 px-4'>
        <PageHeaderWithSearch
          header={'செலுத்துபவரை நீக்கிய பட்டியல்'}
          onChange={handleSearchChange}
          value={searchQuery}
          disableButton={true}
        />

        {/* Function Selection Dropdown */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <div className='max-w-md'>
            <CustomDropdown
              label='விழா தேர்வு (விருப்பம்)'
              placeholder='விழா தேர்வு செய்க அல்லது தேடுக'
              options={functionOptions}
              value={selectedFunction?.function_id || ''}
              onChange={handleFunctionSelect}
              onSearch={setFunctionSearch}
              searchable={true}
              loading={functionsLoading}
              required={false}
            />
            {selectedFunction && (
              <div className='mt-2 p-2 bg-blue-50 rounded border'>
                <p className='text-sm text-blue-700'>
                  <strong>தேர்ந்தெடுக்கப்பட்ட விழா:</strong>{' '}
                  {selectedFunction.function_name}
                </p>
                <p className='text-sm text-blue-700'>
                  <strong>நடத்துபவர்:</strong>{' '}
                  {selectedFunction.function_owner_name}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-between items-end'>
          <ChipSelector
            label={'பெற வேண்டிய பக்கங்கள்'}
            pageFetch={pageFetch}
            setPageFetch={setPageFetch}
          />
        </div>

        <PayersTable
          data={payersBinData?.data || []}
          isLoading={isLoading}
          actionType='bin'
          selectedFunctionId={selectedFunction?.function_id}
          page={page}
          pageFetch={pageFetch}
          debouncedSearchQuery={debouncedSearchQuery}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPage}
          onPageChange={setPage}
        />
      </div>
    </>
  );
}

export default PayerBinListing;
