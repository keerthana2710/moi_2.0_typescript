import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAuth from '@/context/useAuth';
import useDebounce from '@/hooks/useDebounce';
import Pagination from '@/components/ui/Pagination';
import ChipSelector from '@/components/ui/ChipSelector';
import PageHeaderWithSearch from '@/components/ui/PageHeaderWithSearch';
import axiosInstance from '@/utils/AxiosInstance';
import EditLogsTable from './components/EditLogsTable';
import EditLogsFilters from './components/EditLogsFilters';

function EditLogsListing() {
  const { token, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [pageFetch, setPageFetch] = useState(20);
  const [totalPage, setTotalPage] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    target_id: '',
    target_type: '',
    action: '',
    created_by: '',
    user_email: '',
    startDate: '',
    endDate: '',
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      target_id: '',
      target_type: '',
      action: '',
      created_by: '',
      user_email: '',
      startDate: '',
      endDate: '',
    });
    setSearchQuery('');
    setPage(1);
  };

  const fetchEditLogs = async (page, pageFetch, filters) => {
    try {
      const params = new URLSearchParams();

      if (page) params.append('page', page);
      if (pageFetch) params.append('limit', pageFetch);

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          params.append(key, value);
        }
      });

      const url = `/edit-logs?${params.toString()}`;

      const response = await axiosInstance.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setTotalPage(response?.data?.pagination?.pages || 1);
        return response.data;
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to fetch edit logs';
      toast.error(errorMessage);
      console.error(err);
      throw err;
    }
  };

  const {
    data: editLogsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['editLogs', { page, pageFetch, debouncedSearchQuery, filters }],
    queryFn: () =>
      fetchEditLogs(page, pageFetch, debouncedSearchQuery, filters),
    staleTime: 300,
    enabled: !!token, // Only run query if token exists
  });

  // Check if user has admin privileges
  const admin = isAdmin === true || false;

  if (!admin) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>
            Access Denied
          </h2>
          <p className='text-gray-600'>
            You need admin privileges to view edit logs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 px-4'>
      <PageHeaderWithSearch
        header={'திருத்த பதிவுகள்'} // Edit Logs in Tamil
        onChange={handleSearchChange}
        value={searchQuery}
        disableButton={true}
        placeholder='Search by reason, user email, or target ID...'
      />

      <EditLogsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <div className='flex justify-between items-end'>
        <ChipSelector
          label={'பெற வேண்டிய பக்கங்கள்'} // Results per page in Tamil
          pageFetch={pageFetch}
          setPageFetch={setPageFetch}
        />
        {editLogsData?.count && (
          <div className='text-sm text-gray-600'>
            Total Records: {editLogsData.count}
          </div>
        )}
      </div>

      <EditLogsTable
        data={editLogsData?.data || []}
        isLoading={isLoading}
        error={error}
      />

      <Pagination
        currentPage={page}
        totalPages={totalPage}
        onPageChange={setPage}
      />
    </div>
  );
}

export default EditLogsListing;
