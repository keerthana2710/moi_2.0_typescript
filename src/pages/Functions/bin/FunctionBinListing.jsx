import ChipSelector from '@/components/ui/ChipSelector';
import PageHeaderWithSearch from '@/components/ui/PageHeaderWithSearch';
import useAuth from '@/context/useAuth';
import useDebounce from '@/hooks/useDebounce';
import axiosInstance from '@/utils/AxiosInstance';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import FunctionsTable from '../components/FunctionsTable';
import Pagination from '@/components/ui/Pagination';

function FunctionBinListing() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [pageFetch, setPageFetch] = useState(20);
  const [totalPage, setTotalPage] = useState(1);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const fetchFunctions = async (page, pageFetch, searchQuery) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (pageFetch) params.append('limit', pageFetch);
      if (searchQuery) params.append('search', searchQuery);

      const url = `/functions/deleted?${params.toString()}`;

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

  const { data: functionsBinData, isLoading } = useQuery({
    queryKey: ['functions_bin', { page, pageFetch, debouncedSearchQuery }],
    queryFn: () => fetchFunctions(page, pageFetch, debouncedSearchQuery),
    staleTime: Infinity,
  });

  return (
    <>
      <div className='flex flex-col gap-6 px-4'>
        <PageHeaderWithSearch
          header={'விழாவை நீக்கிய பட்டியல்'}
          onChange={handleSearchChange}
          value={searchQuery}
          disableButton={true}
        />
        <div className='flex justify-between items-end'>
          <ChipSelector
            label={'பெற வேண்டிய பக்கங்கள்'}
            pageFetch={pageFetch}
            setPageFetch={setPageFetch}
          />
        </div>
        <FunctionsTable
          data={functionsBinData?.data || []}
          isLoading={isLoading}
          actionType='bin'
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

export default FunctionBinListing;
