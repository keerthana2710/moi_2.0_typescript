import React from 'react';
import { FaEye } from 'react-icons/fa';

export const BillPreview = ({
  formData,
  selectedFunction,
  payerData,
  showPlaceholder = true,
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const billNumber = Math.floor(Math.random() * 9999) + 1;

  // Show placeholder when no function is selected and placeholder is enabled
  if (!selectedFunction && showPlaceholder) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
        <div className='text-center'>
          <FaEye className='mx-auto text-4xl text-gray-400 mb-4' />
          <p className='text-gray-500 text-lg'>
            விழா தேர்வு செய்து பில் முன்னோட்டம் பார்க்கவும்
          </p>
        </div>
      </div>
    );
  }

  // Return null if no function and placeholder is disabled (for print scenarios)
  if (!selectedFunction) {
    return null;
  }

  // Calculate currency breakdown for cash payments
  const getCurrencyBreakdown = (amount) => {
    const denominations = [2000, 500, 200, 100, 50, 20, 10];
    const breakdown = [];
    let remaining = parseInt(amount);

    for (const denom of denominations) {
      if (remaining >= denom) {
        const count = Math.floor(remaining / denom);
        breakdown.push({ denomination: denom, count, total: count * denom });
        remaining -= count * denom;
      }
    }

    return breakdown;
  };

  const currencyBreakdown =
    payerData?.payer_given_object === 'Cash'
      ? getCurrencyBreakdown(payerData.payer_amount)
      : [];

  // const largestDenomination = currencyBreakdown[0] || {
  //   denomination: 0,
  //   count: 0,
  //   total: 0,
  // };

  return (
    <div
      className='bg-white p-4 mx-auto print:shadow-none'
      style={{ width: '220px', fontFamily: 'monospace', fontSize: '12px' }}
    >
      {/* Dotted border top */}
      <div className='border-t border-dotted border-black mb-2'></div>

      {/* Header text */}
      <div className='text-center text-xs mb-2'>மயிலை</div>

      {/* Company name and logo */}
      <div className='text-center mb-3'>
        <div className='flex items-center justify-center gap-1 mb-1'>
          <div className='w-4 h-4 bg-black text-white text-xs flex items-center justify-center font-bold'>
            👑
          </div>
          <span className='text-sm font-bold'>மொய்-டெக்</span>
        </div>
        <div className='text-xs'>வாலை அடி வாலையா...</div>
      </div>

      {/* Horizontal line */}
      <div className='border-t-2 border-black mb-2'></div>

      {/* Business owner details */}
      <div className='text-center text-xs leading-tight mb-3'>
        <div>{selectedFunction?.function_owner_name}</div>
        <div>{formData?.wife_name || ''}</div>
        <div>{selectedFunction?.function_name}</div>
        <div>
          {selectedFunction?.function_held_place || formData?.function_place}
        </div>
        <div>
          {selectedFunction?.function_held_city || formData?.function_city}
        </div>
        <div></div>
        <div>📞 {selectedFunction?.function_owner_phno}</div>
      </div>

      {/* Horizontal line */}
      <div className='border-t-2 border-black mb-2'></div>

      {/* Date and bill number */}
      <div className='flex justify-between text-xs mb-1'>
        <span>{currentDate}</span>
        <span>#{billNumber}</span>
      </div>

      {/* Customer details - Show payer data if available, otherwise show placeholder/form data */}
      <div className='text-xs text-center leading-tight mb-3'>
        <div className='font-bold'>
          {payerData?.payer_name || formData?.payer_name || 'கி.ஜெய்கனேஷ்'}
        </div>
        <div>
          {payerData?.payer_work ||
            formData?.payer_work ||
            formData?.owner_name}
        </div>
        <div>
          {payerData?.payer_city ||
            formData?.payer_city ||
            formData?.function_city}
        </div>
        <div>
          {payerData?.payer_phno || formData?.payer_phno || '9841361640'}
        </div>
      </div>

      {/* Payment details */}
      <div className='text-xs text-center mb-2'>
        <div className='font-bold'>
          {payerData?.payer_given_object === 'Cash' ||
          (!payerData && formData?.payer_given_object === 'Cash')
            ? 'பங்களிப்பு தொகை'
            : payerData?.payer_given_object === 'Gift' ||
              formData?.payer_given_object === 'Gift'
            ? 'பரிசு'
            : 'பங்களிப்பு தொகை'}
        </div>
        {payerData?.payer_given_object === 'Cash' ||
        (!payerData && formData?.payer_given_object === 'Cash') ? (
          <div className='text-lg font-bold'>
            ரூ. {payerData?.payer_amount || formData?.payer_amount || '10,000'}
          </div>
        ) : payerData?.payer_given_object === 'Gift' ||
          formData?.payer_given_object === 'Gift' ? (
          <div className='text-lg font-bold'>
            {payerData?.payer_gift_name || formData?.payer_gift_name}
          </div>
        ) : (
          <div className='text-lg font-bold'>ரூ. 10,000</div>
        )}
      </div>

      {/* Horizontal line */}
      <div className='border-t border-b border-black py-1 mb-2'>
        <div className='text-center text-xs font-bold'>
          எழுத்தர் :{' '}
          {selectedFunction?.function_owner_name?.toUpperCase() ||
            'RAMESH LOVE'}
        </div>
      </div>

      {/* Currency note details - only for cash payments */}
      {(payerData?.payer_given_object === 'Cash' ||
        (!payerData &&
          (formData?.payer_given_object === 'Cash' ||
            !formData?.payer_given_object))) && (
        <>
          <div className='bg-black text-white text-center py-1 mb-2'>
            <div className='text-xs font-bold'>ரூபாய் நோட்டு விவரம்</div>
          </div>

          {/* Currency breakdown */}
          <div className='text-xs mb-3'>
            {(currencyBreakdown.length > 0
              ? currencyBreakdown
              : [
                  {
                    denomination: 500,
                    count: 20,
                    total: formData?.payer_amount || 10000,
                  },
                ]
            ).map((item, idx) => (
              <div key={idx} className='flex justify-center gap-3'>
                <p>{item.denomination}</p>
                <p>X</p>
                <p>{item.count}</p>
                <p>= {item.total}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Payment method for cash */}
      {(payerData?.payer_given_object === 'Cash' ||
        formData?.payer_given_object === 'Cash') &&
        (payerData?.payer_cash_method || formData?.payer_cash_method) && (
          <div className='text-center text-xs mb-2'>
            <div className='font-bold'>
              செலுத்தும் முறை:{' '}
              {payerData?.payer_cash_method || formData?.payer_cash_method}
            </div>
          </div>
        )}

      {/* Booking contact */}
      <div className='text-center text-xs mb-2'>
        <div className='font-bold mb-2'>முன்பதிவு செய்ய தொடர்புகு:</div>
        <div>7092981045, 8190903853, 9688880990</div>
      </div>

      {/* Website and email */}
      <div className='text-xs leading-tight mb-2'>
        <div>
          <span className='font-bold'>Website:</span> www.moitechh.com
        </div>
        <div>
          <span className='font-bold'>Email:</span> sbmmoltech@gmail.com
        </div>
      </div>

      {/* Dotted border bottom */}
      <div className='border-b border-dotted border-black mt-2'></div>
    </div>
  );
};
