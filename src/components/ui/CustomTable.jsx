import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdOutlineModeEdit } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import ActionOptions from './ActionOptions';
import { useEffect, useRef, useState } from 'react';
import { formatDate, formatTime } from '@/helpers/formatDateTime';

const actionBtnData = [
  { value: 'Delete', icon: RxCrossCircled },
  { value: 'Edit', icon: MdOutlineModeEdit },
];

function CustomTable() {
  const [openActionIdx, setOpenActionIdx] = useState(null);
  const actionRefs = useRef([]);

  // Field keys and their Tamil labels
  const headers = [
    { key: 'function_name', label: 'விழாபெயர்' },
    { key: 'function_owner_name', label: 'நடத்துபவர்' },
    { key: 'function_owner_city', label: 'நடத்துபவர்_ஊர்' },
    { key: 'function_owner_address', label: 'நடத்துபவர்_முகவரி' },
    { key: 'function_owner_phno', label: 'நடத்துபவர்_கைபேசி_எண்' },
    { key: 'function_amt_spent', label: 'மொத்த_செலவு' },
    { key: 'function_hero_name', label: 'விழா_நாயகன்' },
    { key: 'function_heroine_name', label: 'விழா_நாயகி' },
    { key: 'function_held_place', label: 'விழா_இடம்' },
    { key: 'function_held_city', label: 'விழா_ஊர்' },
    { key: 'function_start_date', label: 'விழா_தொடங்கும்_தேதி' },
    { key: 'function_start_time', label: 'விழா_ஆரம்ப_நேரம்' },
    { key: 'function_end_date', label: 'விழா_முடியும்_தேதி' },
    { key: 'function_end_time', label: 'விழா_முடியும்_நேரம்' },
    { key: 'function_total_days', label: 'நாட்கள்' },
  ];

  const data = [
    {
      _id: '68321317b9a1bdfdf8eddbbc',
      function_name: 'திருமண நாள் விழா',
      function_id:
        'திருமண_நாள்_விழா-visagan-theni_main_road-2025-05-24-2025-05-24t21:30:00.245z',
      function_owner_name: 'visagan',
      function_owner_city: 'சென்னை',
      function_owner_address: 'chennai egmore',
      function_owner_phno: '9994656578',
      function_amt_spent: 100000,
      function_hero_name: 'ramji',
      function_heroine_name: 'ramkini',
      function_held_place: 'Theni',
      function_held_city: 'theni main road',
      function_start_date: '2025-05-24T18:38:39.413Z',
      function_start_time: '2025-05-24T21:30:00.245Z',
      function_end_date: '2025-05-26T18:30:00.000Z',
      function_end_time: '2025-05-24T21:00:00.861Z',
      function_total_days: 1,
      function_bill_details: {
        owner_name: 'Visagan',
        wife_name: 'hema',
        wife_occupation: 'Doctor',
        function_place: '800000',
        function_city: '100000',
      },
    },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openActionIdx !== null &&
        actionRefs.current[openActionIdx] &&
        !actionRefs.current[openActionIdx]?.contains(event.target)
      ) {
        setOpenActionIdx(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionIdx]);

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
          <tbody>
            {data.map((entry, idx) => (
              <tr
                key={entry._id}
                className='cursor-pointer hover:bg-blue-100 text-sm text-gray-800 transition-colors border-b border-gray-200'
              >
                {headers.map((h) => (
                  <td key={h.key} className='px-4 py-3 whitespace-nowrap'>
                    {['function_start_date', 'function_end_date'].includes(
                      h.key
                    )
                      ? formatDate(entry[h.key])
                      : ['function_start_time', 'function_end_time'].includes(
                          h.key
                        )
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
                        <ActionOptions data={actionBtnData} />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomTable;
