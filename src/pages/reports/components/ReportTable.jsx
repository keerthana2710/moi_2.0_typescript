import React, { useState, useRef, useEffect } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdOutlineModeEdit, MdRestore } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileExcel,
  FaDownload,
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

const relationOrder = [
  'தைமாமா',
  'சித்தப்பா',
  'பெரியப்பா',
  'மாமா',
  'அத்தை',
  'பாட்டி',
  'தாத்தா',
  'அண்ணா',
  'தம்பி',
  'அக்காள்',
  'தங்கை',
  'நண்பர்',
  'மற்றவை',
];

// Payers Table Component
export function ReportTable({ data, isLoading, selectedFunction }) {
  const [openActionIdx, setOpenActionIdx] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [sortedData, setSortedData] = useState([]);
  const [sortByType, setSortByType] = useState('relation'); // 'relation' or 'city'

  const actionRefs = useRef([]);

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

  const generateExcel = () => {
    if (!selectedFunction || !sortedData.length) return;

    const PAGE_SIZE = 10; // Entries per page
    let wb = XLSX.utils.book_new();
    let ws_data = [];
    let page = 1;
    let serial = 1;
    let pageTotal = 0;
    let grandTotal = 0;
    let entriesInCurrentPage = 0;

    // Sort by relationOrder if sortByType is 'relation'
    let processedData;
    if (sortByType === 'relation') {
      processedData = relationOrder
        .map((relation) => ({
          title: relation,
          items: sortedData.filter((d) => d.payer_relation === relation),
        }))
        .filter((group) => group.items.length > 0);
    } else {
      // Group by city
      const cities = [
        ...new Set(sortedData.map((d) => d.payer_city || 'Unknown')),
      ].sort();
      processedData = cities.map((city) => ({
        title: city,
        items: sortedData.filter((d) => (d.payer_city || 'Unknown') === city),
      }));
    }

    // Function to add page header
    const addPageHeader = () => {
      ws_data.push([]);
      ws_data.push([`பக்கம் - ${page}`]);
      ws_data.push([]);

      // Header row 1
      ws_data.push([
        'வ.எண்',
        'ர.எண்',
        '',
        'பெயர் மற்றும் தொழில்',
        'செய்த',
        'வந்த மொய்',
        'நமது இருப்பு',
      ]);

      // Header row 2
      ws_data.push([
        '',
        '',
        '',
        relationOrder.includes(processedData[0]?.title)
          ? processedData[0].title
          : 'விபரம்',
        '',
        '',
      ]);

      ws_data.push([]); // Empty row after header
      entriesInCurrentPage = 0;
      pageTotal = 0;
    };

    // Function to add page footer
    const addPageFooter = () => {
      ws_data.push([]);
      ws_data.push(['பக்கத்தின் தொகை', '', '', '', '', pageTotal, '']);
      ws_data.push([]);
      page++;
    };

    // Start first page
    addPageHeader();

    // Process each group
    processedData.forEach((group, groupIndex) => {
      // Check if we need a new page for group header
      if (entriesInCurrentPage >= PAGE_SIZE && groupIndex > 0) {
        addPageFooter();
        addPageHeader();
      }

      // Add group header only if not the first group or if starting new page
      if (groupIndex > 0 || entriesInCurrentPage === 0) {
        // Update the header with current group name
        if (entriesInCurrentPage === 0) {
          // Update the header that was just added
          ws_data[ws_data.length - 2][3] = group.title; // Update the group name in header
        } else {
          // Add group separator
          ws_data.push([group.title]);
          entriesInCurrentPage++;
        }
      }

      // Process items in the group
      group.items.forEach((payer) => {
        // Check if we need a new page
        if (entriesInCurrentPage >= PAGE_SIZE) {
          addPageFooter();
          addPageHeader();

          // Update header with current group name
          ws_data[ws_data.length - 2][3] = group.title;
        }

        const amount = parseFloat(payer.payer_amount) || 0;
        pageTotal += amount;
        grandTotal += amount;

        // Format name and work
        const nameAndWork = `${payer.payer_name || ''} (${
          payer.payer_work || ''
        })`;

        // Add payer row
        ws_data.push([
          serial++, // வ. எண்
          payer.payer_receipt_no || '', // ர. எண்
          payer.payer_relation?.charAt(0) || '', // First letter of relation
          nameAndWork, // Name & Work
          payer.payer_given_object || '', // செய்த மொய்
          amount || '', // வந்த மொய்
          '', // நமது இருப்பு (empty as per format)
        ]);

        entriesInCurrentPage++;
      });
    });

    // Add final page footer
    if (entriesInCurrentPage > 0) {
      addPageFooter();
    }

    // Add grand total at the end
    ws_data.push(['மொத்த தொகை', '', '', '', '', grandTotal, '']);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Set column widths to match the format
    ws['!cols'] = [
      { wch: 8 }, // வ. எண்
      { wch: 8 }, // ர. எண்
      { wch: 6 }, // Relation code
      { wch: 40 }, // பெயர் மற்றும் தொழில்
      { wch: 18 }, // செய்த மொய்
      { wch: 15 }, // வந்த மொய்
      { wch: 15 }, // நமது இருப்பு
    ];

    // Get the range of data
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Define border styles
    const thickBorder = {
      top: { style: 'thick', color: { rgb: '000000' } },
      bottom: { style: 'thick', color: { rgb: '000000' } },
      left: { style: 'thick', color: { rgb: '000000' } },
      right: { style: 'thick', color: { rgb: '000000' } },
    };

    const mediumBorder = {
      top: { style: 'medium', color: { rgb: '000000' } },
      bottom: { style: 'medium', color: { rgb: '000000' } },
      left: { style: 'medium', color: { rgb: '000000' } },
      right: { style: 'medium', color: { rgb: '000000' } },
    };

    // Apply styling to all cells
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

        // Ensure cell exists
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        }

        const cell = ws[cellAddress];
        const cellValue = cell.v;

        // Default style for all cells
        let cellStyle = {
          border: mediumBorder,
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true,
          },
          font: {
            name: 'Arial',
            sz: 10,
          },
        };

        // Apply specific styling based on content
        if (cellValue !== undefined && cellValue !== '') {
          const cellValueStr = String(cellValue);

          // Style page headers (பக்கம் - X)
          if (cellValueStr.includes('பக்கம்')) {
            cellStyle = {
              ...cellStyle,
              font: {
                name: 'Arial',
                bold: true,
                sz: 14,
              },
              alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true,
              },
              fill: {
                fgColor: { rgb: 'D3D3D3' },
              },
              border: thickBorder,
            };
          }
          // Style column headers
          else if (
            cellValueStr.includes('எண்') ||
            cellValueStr.includes('பெயர்') ||
            cellValueStr.includes('மொய்') ||
            cellValueStr.includes('இருப்பு') ||
            cellValueStr === 'விபரம்' ||
            (relationOrder && relationOrder.includes(cellValueStr))
          ) {
            cellStyle = {
              ...cellStyle,
              font: {
                name: 'Arial',
                bold: true,
                sz: 11,
              },
              alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true,
              },
              fill: {
                fgColor: { rgb: 'E6E6FA' },
              },
              border: thickBorder,
            };
          }
          // Style group headers (relation/city names) when they appear as separate rows
          else if (
            (relationOrder && relationOrder.includes(cellValueStr)) ||
            (col === 0 &&
              row > 0 &&
              !cellValueStr.includes('எண்') &&
              !cellValueStr.includes('தொகை') &&
              !cellValueStr.includes('பக்கம்') &&
              ws_data[row] &&
              ws_data[row].length === 1)
          ) {
            cellStyle = {
              ...cellStyle,
              font: {
                name: 'Arial',
                bold: true,
                sz: 12,
              },
              alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true,
              },
              fill: {
                fgColor: { rgb: 'F0F8FF' },
              },
              border: thickBorder,
            };
          }
          // Style total rows (page total and grand total)
          else if (
            cellValueStr.includes('தொகை') ||
            cellValueStr.includes('மொத்த')
          ) {
            cellStyle = {
              ...cellStyle,
              font: {
                name: 'Arial',
                bold: true,
                sz: 12,
              },
              alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: true,
              },
              fill: {
                fgColor: { rgb: 'FFFFE0' },
              },
              border: thickBorder,
            };
          }
          // Style data rows - specific alignment based on column
          else {
            let horizontalAlign = 'center';

            // Column-specific alignment based on your images
            if (col === 0 || col === 1) {
              // Serial number and receipt number columns - center
              horizontalAlign = 'center';
            } else if (col === 2) {
              // Relation code column - center
              horizontalAlign = 'center';
            } else if (col === 3) {
              // Name column - left align
              horizontalAlign = 'left';
            } else if (col === 4) {
              // Given object column - center
              horizontalAlign = 'center';
            } else if (col === 5 || col === 6) {
              // Amount columns - right align
              horizontalAlign = 'right';
            }

            cellStyle = {
              ...cellStyle,
              alignment: {
                horizontal: horizontalAlign,
                vertical: 'center',
                wrapText: true,
              },
              font: {
                name: 'Arial',
                sz: 10,
              },
              border: mediumBorder,
            };

            // Special formatting for numeric values in amount columns
            if ((col === 5 || col === 6) && typeof cellValue === 'number') {
              cellStyle.numFmt = '#,##0';
            }
          }
        }

        // Apply the style to the cell
        cell.s = cellStyle;
      }
    }

    // Merge cells for page headers
    const merges = [];
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
      const cell = ws[cellAddress];

      if (cell && typeof cell.v === 'string' && cell.v.includes('பக்கம்')) {
        merges.push({
          s: { r: row, c: 0 },
          e: { r: row, c: 6 },
        });
      }
    }

    // Add merges for group headers that span across columns
    for (let row = range.s.r; row <= range.e.r; row++) {
      if (
        ws_data[row] &&
        ws_data[row].length === 1 &&
        ws_data[row][0] &&
        !String(ws_data[row][0]).includes('பக்கம்') &&
        !String(ws_data[row][0]).includes('தொகை')
      ) {
        merges.push({
          s: { r: row, c: 0 },
          e: { r: row, c: 6 },
        });
      }
    }

    ws['!merges'] = merges;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'மொய் விபரம்');

    // Generate filename
    const fileName = `${selectedFunction?.function_id}_மொய்_அறிக்கை_${
      new Date().toISOString().split('T')[0]
    }.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);
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
    } else if (!sortedData || sortedData.length === 0) {
      return (
        <tr>
          <td
            colSpan={headers.length + 1}
            className='px-4 py-8 text-center text-gray-500'
          >
            {selectedFunction
              ? 'No payers found for this function'
              : 'Please select a function first'}
          </td>
        </tr>
      );
    } else {
      return sortedData.map((entry, idx) => (
        <tr
          key={entry._id || idx}
          className='cursor-pointer hover:bg-blue-100 text-sm text-gray-800 transition-colors border-b border-gray-200'
        >
          {headers.map((h) => (
            <td key={h.key} className='px-4 py-3 whitespace-nowrap'>
              {h.key === 'payer_amount' && entry[h.key]
                ? `₹${entry[h.key]}`
                : entry[h.key] || '-'}
            </td>
          ))}
        </tr>
      ));
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-md'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-semibold text-blue-700'>
          செலுத்துபவர் பட்டியல்
          {sortedData.length > 0 && (
            <span className='ml-2 text-sm text-gray-500'>
              ({sortedData.length} entries)
            </span>
          )}
        </h2>

        {selectedFunction && sortedData.length > 0 && (
          <div className='flex items-center gap-4'>
            {/* Sort Type Selection */}
            <div className='flex items-center gap-2'>
              <label className='text-sm font-medium'>Sort by:</label>
              <select
                value={sortByType}
                onChange={(e) => setSortByType(e.target.value)}
                className='border rounded px-2 py-1 text-sm'
              >
                <option value='relation'>உறவு முறை வரிசை</option>
                <option value='city'>ஊர் வரிசை</option>
              </select>
            </div>

            {/* Generate Excel Button */}
            <button
              onClick={generateExcel}
              className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'
            >
              <FaFileExcel />
              Generate Excel
              <FaDownload size={12} />
            </button>
          </div>
        )}
      </div>

      <div className='overflow-x-auto select-none rounded-xl border border-gray-300'>
        <table className='table-auto w-full z-10'>
          <thead className='bg-blue-100'>
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
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>
    </div>
  );
}
