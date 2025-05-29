import { useState } from 'react';
import Pagination from '@/components/ui/Pagination';
import ChipSelector from '@/components/ui/ChipSelector';
import { useQuery } from '@tanstack/react-query';
import useAuth from '@/context/useAuth';
import { toast } from 'react-toastify';
import useDebounce from '@/hooks/useDebounce';
import PageHeaderWithSearch from '@/components/ui/PageHeaderWithSearch';
import FunctionsTable from './components/FunctionsTable';
import axiosInstance from '@/utils/AxiosInstance';

function FunctionsListingPage() {
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

      const url = `/functions?${params.toString()}`;

      const response = await axiosInstance.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setTotalPage(response?.data?.pagination?.pages);
        return response.data;
      }
    } catch (err) {
      toast.error(err);
      console.error(err);
    }
  };

  const { data: functionsData, isLoading } = useQuery({
    queryKey: ['functions', { page, pageFetch, debouncedSearchQuery }],
    queryFn: () => fetchFunctions(page, pageFetch, debouncedSearchQuery),
    staleTime: Infinity,
  });

  return (
    <>
      <div className='flex flex-col gap-6 px-4'>
        <PageHeaderWithSearch
          header={'விழா பட்டியல்'}
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
          data={functionsData?.data || []}
          isLoading={isLoading}
          actionType='normal'
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

export default FunctionsListingPage;
