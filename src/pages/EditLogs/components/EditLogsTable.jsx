import React, { useState } from 'react';
import { Eye, ChevronDown, ChevronRight } from 'lucide-react';

const EditLogsTable = ({ data = [], isLoading, error }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRowExpansion = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTargetTypeBadge = (type) => {
    const styles = {
      Function: 'bg-blue-100 text-blue-800',
      Payer: 'bg-green-100 text-green-800',
    };
    return styles[type] || 'bg-gray-100 text-gray-800';
  };

  const getActionBadge = (action) => {
    const styles = {
      update: 'bg-yellow-100 text-yellow-800',
      create: 'bg-green-100 text-green-800',
      delete: 'bg-red-100 text-red-800',
    };
    return styles[action] || 'bg-gray-100 text-gray-800';
  };

  const renderValueComparison = (beforeValue, afterValue, changedFields) => {
    if (!beforeValue || !afterValue) return null;

    return (
      <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
        <h4 className='font-medium text-gray-900 mb-3'>Changes Made:</h4>
        <div className='space-y-3'>
          {changedFields?.map((field) => (
            <div key={field} className='border-l-4 border-blue-200 pl-4'>
              <div className='text-sm font-medium text-gray-700 mb-1'>
                {field
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
              <div className='flex items-center gap-4 text-sm'>
                <div className='flex-1'>
                  <div className='text-gray-500 mb-1'>Before:</div>
                  <div className='bg-red-50 text-red-800 px-2 py-1 rounded border'>
                    {typeof beforeValue[field] === 'object'
                      ? JSON.stringify(beforeValue[field])
                      : beforeValue[field]?.toString() || 'N/A'}
                  </div>
                </div>
                <div className='text-gray-400'>→</div>
                <div className='flex-1'>
                  <div className='text-gray-500 mb-1'>After:</div>
                  <div className='bg-green-50 text-green-800 px-2 py-1 rounded border'>
                    {typeof afterValue[field] === 'object'
                      ? JSON.stringify(afterValue[field])
                      : afterValue[field]?.toString() || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow'>
        <div className='animate-pulse'>
          <div className='h-12 bg-gray-200 rounded-t-lg'></div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-16 bg-gray-100 border-t border-gray-200'
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='text-center text-red-600'>
          <p>Error loading edit logs: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow p-6'>
        <div className='text-center text-gray-500'>
          <Eye className='mx-auto h-12 w-12 text-gray-400 mb-4' />
          <p className='text-lg font-medium'>No edit logs found</p>
          <p className='text-sm'>
            There are no edit logs matching your criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Details
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Target
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Action
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Modified By
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date & Time
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {data.map((log) => (
              <React.Fragment key={log._id}>
                <tr className='hover:bg-gray-50'>
                  <td className='px-6 py-4'>
                    <div className='flex flex-col'>
                      <div className='text-sm font-medium text-gray-900 truncate max-w-xs'>
                        {log.reason || 'No reason provided'}
                      </div>
                      <div className='text-xs text-gray-500 mt-1'>
                        ID: {log._id}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-col'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTargetTypeBadge(
                          log.target_type
                        )}`}
                      >
                        {log.target_type}
                      </span>
                      <div className='text-xs text-gray-500 mt-1 truncate max-w-xs'>
                        {log.target_id}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-col'>
                      <div className='text-sm font-medium text-gray-900'>
                        {log.user_name || 'Unknown User'}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {log.user_email}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-900'>
                    {formatDate(log.created_at)}
                  </td>
                  <td className='px-6 py-4'>
                    <button
                      onClick={() => toggleRowExpansion(log._id)}
                      className='text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center gap-1'
                    >
                      {expandedRows.has(log._id) ? (
                        <>
                          <ChevronDown className='h-4 w-4' />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronRight className='h-4 w-4' />
                          View Details
                        </>
                      )}
                    </button>
                  </td>
                </tr>
                {expandedRows.has(log._id) && (
                  <tr>
                    <td colSpan='6' className='px-6 py-4 bg-gray-50'>
                      <div className='space-y-4'>
                        {/* Basic Information */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Target Information
                            </h4>
                            <div className='text-sm space-y-1'>
                              <div>
                                <span className='font-medium'>Type:</span>{' '}
                                {log.target_type}
                              </div>
                              <div>
                                <span className='font-medium'>ID:</span>{' '}
                                {log.target_id}
                              </div>
                              <div>
                                <span className='font-medium'>Action:</span>{' '}
                                {log.action}
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Modified By
                            </h4>
                            <div className='text-sm space-y-1'>
                              <div>
                                <span className='font-medium'>Name:</span>{' '}
                                {log.user_name}
                              </div>
                              <div>
                                <span className='font-medium'>Email:</span>{' '}
                                {log.user_email}
                              </div>
                              <div>
                                <span className='font-medium'>User ID:</span>{' '}
                                {typeof log.created_by === 'object'
                                  ? log.created_by._id
                                  : log.created_by}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Changed Fields */}
                        {log.changed_fields &&
                          log.changed_fields.length > 0 && (
                            <div>
                              <h4 className='font-medium text-gray-900 mb-2'>
                                Changed Fields
                              </h4>
                              <div className='flex flex-wrap gap-2'>
                                {log.changed_fields.map((field) => (
                                  <span
                                    key={field}
                                    className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                                  >
                                    {field
                                      .replace(/_/g, ' ')
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Value Comparison */}
                        {log.before_value &&
                          log.after_value &&
                          renderValueComparison(
                            log.before_value,
                            log.after_value,
                            log.changed_fields
                          )}

                        {/* Reason */}
                        {log.reason && (
                          <div>
                            <h4 className='font-medium text-gray-900 mb-2'>
                              Reason for Change
                            </h4>
                            <p className='text-sm text-gray-700 bg-white p-3 rounded border'>
                              {log.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditLogsTable;
