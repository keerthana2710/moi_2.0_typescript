const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50'>
      <div className='bg-white rounded-lg p-6 shadow-xl w-96'>
        <h3 className='text-lg font-semibold mb-4 text-black'>
          Are you sure you want to delete this entry?
        </h3>
        <div className='flex justify-end gap-4'>
          <button
            onClick={onClose}
            disabled={isLoading}
            className='px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50'
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
