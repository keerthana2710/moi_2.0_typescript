import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdOutlineModeEdit, MdRestore } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';

import { useEffect, useRef, useState } from 'react';
import { formatDate, formatTime } from '@/helpers/formatDateTime';
import ActionOptions from '@/components/ui/ActionOptions';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/AxiosInstance';
import DeleteConfirmationModal from './DeleteFunctionModal';
import EditModal from './EditFunctionModal';
import useAuth from '@/context/useAuth';
import { toast } from 'react-toastify';

function FunctionsTable({ data, isLoading, actionType = 'normal' }) {
  const [openActionIdx, setOpenActionIdx] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [editModal, setEditModal] = useState({
    open: false,
    id: null,
    data: {},
  });
  const actionRefs = useRef([]);
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const headers = [
    { key: 'function_name', label: 'விழாபெயர்' },
    { key: 'function_owner_name', label: 'நடத்துபவர்' },
    { key: 'function_owner_city', label: 'நடத்துபவர் ஊர்' },
    { key: 'function_owner_address', label: 'நடத்துபவர் முகவரி' },
    { key: 'function_owner_phno', label: 'நடத்துபவர் கைபேசி எண்' },
    { key: 'function_amt_spent', label: 'மொத்த செலவு' },
    { key: 'function_hero_name', label: 'விழா நாயகன்' },
    { key: 'function_heroine_name', label: 'விழா நாயகி' },
    { key: 'function_held_place', label: 'விழா இடம்' },
    { key: 'function_held_city', label: 'விழா ஊர்' },
    { key: 'function_start_date', label: 'விழா தொடங்கும் தேதி' },
    { key: 'function_start_time', label: 'விழா ஆரம்ப நேரம்' },
    { key: 'function_end_date', label: 'விழா முடியும் தேதி' },
    { key: 'function_end_time', label: 'விழா முடியும் நேரம்' },
    { key: 'function_total_days', label: 'நாட்கள்' },
  ];

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

  // Delete mutation for normal functions (soft delete)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/functions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Function deleted successfully');
      queryClient.invalidateQueries(['functions']);
      setDeleteModal({ open: false, id: null });
    },
  });

  // Permanent delete mutation for bin functions
  const permanentDeleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/functions/${id}/permanent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Function permanently deleted');
      queryClient.invalidateQueries(['functions_bin']);
      setDeleteModal({ open: false, id: null });
    },
  });

  // Restore mutation for bin functions
  const restoreMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.put(
        `/functions/${id}/restore`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Function restored successfully');
      queryClient.invalidateQueries(['functions_bin']);
      queryClient.invalidateQueries(['functions']);
    },
  });

  const handleDelete = (id) => {
    setDeleteModal({ open: true, id });
    setOpenActionIdx(null);
  };

  const handleEdit = (id) => {
    const itemData = data.find((item) => item.function_id === id) || {};
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
          action_func: () => handleRestore(entry.function_id),
        },
        {
          value: 'Delete',
          icon: RxCrossCircled,
          action_func: () => handleDelete(entry.function_id),
        },
      ];
    } else {
      return [
        {
          value: 'Edit',
          icon: MdOutlineModeEdit,
          action_func: () => handleEdit(entry.function_id),
        },
        {
          value: 'Delete',
          icon: RxCrossCircled,
          action_func: () => handleDelete(entry.function_id),
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
      return data.map((entry, idx) => (
        <tr
          key={entry._id}
          className='cursor-pointer hover:bg-blue-100 text-sm text-gray-800 transition-colors border-b border-gray-200'
        >
          {headers.map((h) => (
            <td key={h.key} className='px-4 py-3 whitespace-nowrap'>
              {['function_start_date', 'function_end_date'].includes(h.key)
                ? formatDate(entry[h.key])
                : ['function_start_time', 'function_end_time'].includes(h.key)
                ? formatTime(entry[h.key])
                : entry[h.key]}
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
    return actionType === 'bin'
      ? 'Permanently Delete Function'
      : 'Delete Function';
  };

  const getDeleteModalMessage = () => {
    return actionType === 'bin'
      ? 'Are you sure you want to permanently delete this function? This action cannot be undone.'
      : 'Are you sure you want to delete this function? It will be moved to the bin.';
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
                <th key={h.key} className='px-4 py-3 whitespace-nowrap'>
                  {h.label}
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

      {/* Only show EditModal for normal functions, not for bin */}
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

export default FunctionsTable;
