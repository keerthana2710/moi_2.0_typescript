import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdOutlineModeEdit, MdRestore } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

import { useEffect, useRef, useState } from 'react';
import ActionOptions from '@/components/ui/ActionOptions';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/AxiosInstance';
import DeleteConfirmationModal from './DeletePayerModal';

import useAuth from '@/context/useAuth';
import { toast } from 'react-toastify';
import EditModal from './EditPayerModal';

function PayersTable({
  data,
  isLoading,
  actionType = 'normal',
  selectedFunctionId,
  page,
  pageFetch,
  debouncedSearchQuery,
}) {
  const [openActionIdx, setOpenActionIdx] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [editModal, setEditModal] = useState({
    open: false,
    id: null,
    data: {},
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortedData, setSortedData] = useState([]);

  const actionRefs = useRef([]);
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const headers = [
    { key: 'payer_name', label: 'செலுத்துபவர் பெயர்' },
    { key: 'payer_amount', label: 'தொகை' },
    { key: 'payer_relation', label: 'உறவு முறை' },
    { key: 'payer_given_object', label: 'வழங்கிய பொருள்' },
    { key: 'payer_gift_name', label: 'பரிசு பெயர்' },
    { key: 'payer_phno', label: 'கைபேசி எண்' },
    { key: 'payer_city', label: 'ஊர்' },
    { key: 'payer_work', label: 'தொழில்' },
    { key: 'payer_cash_method', label: 'செலுத்தும் முறை' },
    { key: 'payer_address', label: 'முகவரி' },
  ];

  // Sort data whenever data or sortConfig changes
  useEffect(() => {
    if (!data || data.length === 0) {
      setSortedData([]);
      return;
    }

    let sortableData = [...data];

    if (sortConfig.key && sortConfig.direction) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';

        // Handle numeric sorting for amount
        if (sortConfig.key === 'payer_amount') {
          const aNum = parseFloat(aValue) || 0;
          const bNum = parseFloat(bValue) || 0;
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Handle phone number sorting (numeric)
        if (sortConfig.key === 'payer_phno') {
          const aNum = parseInt(aValue) || 0;
          const bNum = parseInt(bValue) || 0;
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Handle string sorting
        const aStr = aValue.toString().toLowerCase();
        const bStr = bValue.toString().toLowerCase();

        if (aStr < bStr) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setSortedData(sortableData);
  }, [data, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      } else {
        direction = 'asc';
      }
    }

    setSortConfig({ key: direction ? key : null, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className='ml-1 text-gray-400' size={12} />;
    }

    if (sortConfig.direction === 'asc') {
      return <FaSortUp className='ml-1 text-blue-600' size={12} />;
    } else if (sortConfig.direction === 'desc') {
      return <FaSortDown className='ml-1 text-blue-600' size={12} />;
    }

    return <FaSort className='ml-1 text-gray-400' size={12} />;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openActionIdx !== null &&
        actionRefs.current[openActionIdx] &&
        !actionRefs.current[openActionIdx]?.contains(event.target)
      ) {
        setOpenActionIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionIdx]);

  // Delete mutation for normal payers (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/payers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payer deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['payers', selectedFunctionId],
        exact: true,
      });
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'payers_bin';
        },
      });
      setDeleteModal({ open: false, id: null });
    },
  });

  // Permanent delete mutation for bin payers
  const permanentDeleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/payers/${id}/permanent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payer permanently deleted');
      queryClient.invalidateQueries({
        queryKey: [
          'payers_bin',
          { page, pageFetch, debouncedSearchQuery, selectedFunctionId },
        ],
        exact: true,
      });
      setDeleteModal({ open: false, id: null });
    },
  });

  // Restore mutation for bin payers
  const restoreMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.put(
        `/payers/${id}/restore`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payer restored successfully');
      queryClient.refetchQueries({
        queryKey: [
          'payers_bin',
          { page, pageFetch, debouncedSearchQuery, selectedFunctionId },
        ],
        exact: true,
      });
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] === 'payers';
        },
      });
    },
  });

  const handleDelete = (id) => {
    setDeleteModal({ open: true, id });
    setOpenActionIdx(null);
  };

  const handleEdit = (id) => {
    const itemData = sortedData.find((item) => item._id === id) || {};
    setEditModal({ open: true, id, data: itemData });
    setOpenActionIdx(null);
  };

  const handleRestore = (id) => {
    restoreMutation.mutate(id);
    setOpenActionIdx(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.id) {
      if (actionType === 'bin') {
        permanentDeleteMutation.mutate(deleteModal.id);
      } else {
        deleteMutation.mutate(deleteModal.id);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, id: null });
  };

  const handleEditClose = () => {
    setEditModal({ open: false, id: null, data: {} });
  };

  // Get action options based on actionType
  const getActionOptions = (entry) => {
    if (actionType === 'bin') {
      return [
        {
          value: 'Restore',
          icon: MdRestore,
          action_func: () => handleRestore(entry._id),
        },
        {
          value: 'Delete',
          icon: RxCrossCircled,
          action_func: () => handleDelete(entry._id),
        },
      ];
    } else {
      return [
        {
          value: 'Edit',
          icon: MdOutlineModeEdit,
          action_func: () => handleEdit(entry._id),
        },
        {
          value: 'Delete',
          icon: RxCrossCircled,
          action_func: () => handleDelete(entry._id),
        },
      ];
    }
  };

  const renderTableBody = () => {
    if (isLoading) {
      return [...Array(10)].map((_, i) => (
        <tr key={i} className='animate-pulse'>
          {headers.map((h, idx) => (
            <td key={idx} className='px-4 py-3 whitespace-nowrap'>
              <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            </td>
          ))}
          <td className='px-4 py-3 whitespace-nowrap'>
            <div className='h-4 bg-gray-200 rounded w-8'></div>
          </td>
        </tr>
      ));
    } else {
      return sortedData.map((entry, idx) => (
        <tr
          key={entry._id}
          className='cursor-pointer hover:bg-blue-100 text-sm text-gray-800 transition-colors border-b border-gray-200'
        >
          {headers.map((h) => (
            <td key={h.key} className='px-4 py-3 whitespace-nowrap'>
              {h.key === 'payer_amount' && entry[h.key]
                ? `₹${entry[h.key]}`
                : entry[h.key] || '-'}
            </td>
          ))}
          <td className='sticky right-0 bg-slate-50 px-4 py-3 text-right z-10'>
            <div
              className='relative group h-8 w-8 flex justify-center items-center rounded-md border border-solid border-gray-500 text-gray-500'
              ref={(el) => (actionRefs.current[idx] = el)}
              onClick={() =>
                setOpenActionIdx(idx === openActionIdx ? null : idx)
              }
            >
              <BsThreeDotsVertical />
              {openActionIdx === idx && (
                <div className='absolute bottom-4 right-0 z-50 mt-1'>
                  <ActionOptions data={getActionOptions(entry)} />
                </div>
              )}
            </div>
          </td>
        </tr>
      ));
    }
  };

  const getDeleteModalTitle = () => {
    return actionType === 'bin' ? 'Permanently Delete Payer' : 'Delete Payer';
  };

  const getDeleteModalMessage = () => {
    return actionType === 'bin'
      ? 'Are you sure you want to permanently delete this payer? This action cannot be undone.'
      : 'Are you sure you want to delete this payer? It will be moved to the bin.';
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <h2 className='text-xl font-semibold mb-4 text-blue-700'>
        செலுத்துபவர் பட்டியல்
      </h2>
      <div className='overflow-x-auto select-none rounded-xl border border-gray-300'>
        <table className='table-auto w-full z-10'>
          <thead className='bg-lightBlue'>
            <tr className='text-left text-gray-700 font-extrabold text-sm'>
              {headers.map((h) => (
                <th
                  key={h.key}
                  className='px-4 py-3 whitespace-nowrap cursor-pointer hover:bg-blue-200 transition-colors'
                  onClick={() => handleSort(h.key)}
                >
                  <div className='flex items-center justify-between'>
                    <span>{h.label}</span>
                    {getSortIcon(h.key)}
                  </div>
                </th>
              ))}
              <th className='sticky right-0 px-4 py-3 text-right bg-lightBlue'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isLoading={
          actionType === 'bin'
            ? permanentDeleteMutation.isPending
            : deleteMutation.isPending
        }
        title={getDeleteModalTitle()}
        message={getDeleteModalMessage()}
      />

      {/* Only show EditModal for normal payers, not for bin */}
      {actionType !== 'bin' && (
        <EditModal
          isOpen={editModal.open}
          onClose={handleEditClose}
          editId={editModal.id}
          initialData={editModal.data}
        />
      )}
    </div>
  );
}

export default PayersTable;
