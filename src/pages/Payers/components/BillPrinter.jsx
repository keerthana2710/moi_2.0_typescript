import React, { useRef, forwardRef, useState } from 'react';

// Thermal Receipt Component - Optimized for 58mm thermal printers
const ThermalReceipt = forwardRef(({ receiptData }, ref) => {
  const currentDate = new Date();
  const receiptNumber = Math.floor(Math.random() * 9999) + 1;

  return (
    <div
      ref={ref}
      className='bg-white p-2 max-w-xs mx-auto font-mono text-xs leading-tight border'
    >
      {/* Header */}
      <div className='text-center border-b border-black pb-2 mb-2'>
        <div className='text-xs mb-1'>மொய் செய்தவரின் நகல்</div>
        <div className='text-sm font-bold mb-1'>மயில்லை</div>
        <div className='flex items-center justify-center gap-1 mb-1'>
          <div className='w-4 h-4 bg-black rounded-full flex items-center justify-center'>
            <span className='text-white text-xs'>♔</span>
          </div>
          <div className='font-bold text-sm'>மொய்-லெட்</div>
        </div>
        <div className='text-xs'>வாத்துழய வானுழய...</div>
        <div className='border-t border-black mt-1'></div>
      </div>

      {/* Business Details */}
      <div className='text-center mb-2 text-xs'>
        <div>இ.ரமேஷ்</div>
        <div>R.கலைவாணி(வைதை</div>
        <div>பிளக்ஸ்,பிரஸ்)</div>
        <div>இல்ல காதணி விழா</div>
        <div>PSJ மஹால்</div>
        <div>மயிலாம்டம்பாறை</div>
        <div>📞 9843966316</div>
      </div>

      <div className='border-t border-black mb-2'></div>

      {/* Receipt Details */}
      <div className='mb-2'>
        <div className='flex justify-between text-xs mb-1'>
          <span>
            {currentDate.toLocaleDateString('en-GB')}{' '}
            {currentDate.toLocaleTimeString('en-GB', { hour12: false })}
          </span>
          <span>#{receiptNumber}</span>
        </div>

        {/* Payer Details */}
        <div className='text-center mb-2'>
          <div className='font-bold text-sm'>{receiptData.payer_name}</div>
          <div className='text-xs'>
            {receiptData.payer_relation || 'அண்காலாளுறுவறி'}
          </div>
          <div className='text-xs'>
            ({receiptData.payer_city || 'பூமிகா ஸ்டுடியோ'})
          </div>
          <div className='text-xs'>
            {receiptData.payer_address || 'கடமலக்குண்டு'}
          </div>
          <div className='text-xs'>{receiptData.payer_phno}</div>
        </div>

        {/* Payment Details */}
        <div className='text-center mb-2'>
          <div className='text-xs mb-1'>பங்களிப்பு தொகை</div>
          {receiptData.payer_given_object === 'Cash' ? (
            <div className='text-lg font-bold'>
              ₹. {receiptData.payer_amount}
            </div>
          ) : (
            <div className='text-sm font-bold'>
              பரிசு: {receiptData.payer_gift_name}
            </div>
          )}
        </div>

        <div className='border-t border-black mb-1'></div>

        {/* Function Details */}
        <div className='text-xs text-center mb-1'>
          <div>எழுத்து: RAMESH LOVE</div>
        </div>

        {/* Function Header */}
        <div className='bg-black text-white text-center py-1 mb-1'>
          <div className='font-bold text-xs'>
            {receiptData.function_name} விபரம்
          </div>
        </div>

        {/* Function Cost Breakdown */}
        <div className='text-center text-xs mb-2'>
          <div className='flex justify-center items-center gap-1'>
            <span>500</span>
            <span>X</span>
            <span>20</span>
            <span>=</span>
            <span>10,000</span>
          </div>
          <div className='text-xs mt-1'>புத்திய செய்ய தொடர்புக்கு:</div>
          <div className='text-xs'>7092981045, 8190903853, 9688880990</div>
        </div>

        {/* Footer */}
        <div className='text-xs text-center'>
          <div>Website: www.moitech.com</div>
          <div>Email: sbmmoitech@gmail.com</div>
        </div>
      </div>
    </div>
  );
});

ThermalReceipt.displayName = 'ThermalReceipt';

// Main Thermal Receipt Component with Print Functionality
function ThermalReceiptComponent({ receiptData, printerSettings }) {
  const printRef = useRef();
  const [isSerialSupported, setIsSerialSupported] = useState(false);
  const [printStatus, setPrintStatus] = useState('');

  // Check if Web Serial API is supported
  React.useEffect(() => {
    setIsSerialSupported('serial' in navigator);
  }, []);

  // Generate ESC/POS commands for thermal printer
  const generateESCPOSCommands = (receiptData) => {
    const commands = [];

    // Initialize printer
    commands.push('\x1B\x40'); // ESC @ - Initialize printer

    // Set alignment center
    commands.push('\x1B\x61\x01'); // ESC a 1 - Center alignment

    // Header
    commands.push('மொய் செய்தவரின் நகல்\n');
    commands.push('\x1B\x21\x10'); // ESC ! 16 - Double height
    commands.push('மயில்லை\n');
    commands.push('\x1B\x21\x00'); // ESC ! 0 - Normal size
    commands.push('மொய்-லெட்\n');
    commands.push('வாத்துழய வானுழய...\n');
    commands.push('--------------------------------\n');

    // Business details
    commands.push('இ.ரமேஷ்\n');
    commands.push('R.கலைவாணி(வைதை\n');
    commands.push('பிளக்ஸ்,பிரஸ்)\n');
    commands.push('இல்ல காதணி விழா\n');
    commands.push('PSJ மஹால்\n');
    commands.push('மயிலாம்டம்பாறை\n');
    commands.push('📞 9843966316\n');
    commands.push('--------------------------------\n');

    // Receipt details
    const currentDate = new Date();
    commands.push(
      `${currentDate.toLocaleDateString(
        'en-GB'
      )} ${currentDate.toLocaleTimeString('en-GB', { hour12: false })}\n`
    );
    commands.push(`#${Math.floor(Math.random() * 9999) + 1}\n\n`);

    // Payer details
    commands.push('\x1B\x21\x08'); // ESC ! 8 - Bold
    commands.push(`${receiptData.payer_name}\n`);
    commands.push('\x1B\x21\x00'); // ESC ! 0 - Normal
    commands.push(`${receiptData.payer_relation || 'அண்காலாளுறுவறி'}\n`);
    commands.push(`(${receiptData.payer_city || 'பூமிகா ஸ்டுடியோ'})\n`);
    commands.push(`${receiptData.payer_address || 'கடமலக்குண்டு'}\n`);
    commands.push(`${receiptData.payer_phno}\n\n`);

    // Payment details
    commands.push('பங்களிப்பு தொகை\n');
    if (receiptData.payer_given_object === 'Cash') {
      commands.push('\x1B\x21\x20'); // ESC ! 32 - Double width
      commands.push(`₹. ${receiptData.payer_amount}\n`);
    } else {
      commands.push('\x1B\x21\x10'); // ESC ! 16 - Double height
      commands.push(`பரிசு: ${receiptData.payer_gift_name}\n`);
    }
    commands.push('\x1B\x21\x00'); // ESC ! 0 - Normal

    commands.push('--------------------------------\n');
    commands.push('எழுத்து: RAMESH LOVE\n');

    // Function details
    commands.push('\x1B\x21\x08'); // ESC ! 8 - Bold
    commands.push(`${receiptData.function_name} விபரம்\n`);
    commands.push('\x1B\x21\x00'); // ESC ! 0 - Normal

    commands.push('500 X 20 = 10,000\n');
    commands.push('புத்திய செய்ய தொடர்புக்கு:\n');
    commands.push('7092981045, 8190903853, 9688880990\n\n');

    // Footer
    commands.push('Website: www.moitech.com\n');
    commands.push('Email: sbmmoitech@gmail.com\n\n');

    // Cut paper
    commands.push('\x1D\x56\x42\x00'); // GS V B 0 - Full cut

    return commands.join('');
  };

  // Handle serial printing (for USB thermal printers)
  const handleSerialPrint = async (commands) => {
    try {
      setPrintStatus('Connecting to printer...');

      // Request access to serial port
      const port = await navigator.serial.requestPort();
      await port.open({
        baudRate: printerSettings?.baudRate || 9600,
        dataBits: printerSettings?.dataBits || 8,
        parity: printerSettings?.parity || 'none',
        stopBits: printerSettings?.stopBits || 1,
      });

      setPrintStatus('Sending data to printer...');

      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();

      await writer.write(encoder.encode(commands));

      writer.releaseLock();
      await port.close();

      setPrintStatus('Receipt printed successfully!');
      console.log('Printed successfully to thermal printer');

      // Clear status after 3 seconds
      setTimeout(() => setPrintStatus(''), 3000);
    } catch (error) {
      console.error('Serial printing failed:', error);
      setPrintStatus('Serial printing failed. Using regular print...');

      // Fallback to regular print
      setTimeout(() => {
        handleRegularPrint();
        setPrintStatus('');
      }, 1000);
    }
  };

  // Regular print dialog fallback
  const handleRegularPrint = () => {
    const printContent = printRef.current;

    if (!printContent) {
      setPrintStatus('Print content not found');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Add CSS for thermal receipt styling
    const printStyles = `
      <style>
        @media print {
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.2;
          }
          .receipt-container {
            width: 58mm;
            max-width: 58mm;
            margin: 0;
            padding: 2mm;
          }
          @page {
            size: 58mm auto;
            margin: 0;
          }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          line-height: 1.2;
          margin: 0;
          padding: 10px;
        }
      </style>
    `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thermal Receipt</title>
          ${printStyles}
        </head>
        <body>
          <div class="receipt-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };

    setPrintStatus('Opening print dialog...');
    setTimeout(() => setPrintStatus(''), 2000);
  };

  // Handle thermal print button click
  const handleThermalPrint = () => {
    const commands = generateESCPOSCommands(receiptData);
    handleSerialPrint(commands);
  };

  // Handle copy ESC/POS commands
  const handleCopyCommands = () => {
    const commands = generateESCPOSCommands(receiptData);
    navigator.clipboard
      .writeText(commands)
      .then(() => {
        setPrintStatus('ESC/POS commands copied to clipboard!');
        setTimeout(() => setPrintStatus(''), 2000);
      })
      .catch(() => {
        setPrintStatus('Failed to copy commands');
        setTimeout(() => setPrintStatus(''), 2000);
      });
  };

  return (
    <div className='p-4 max-w-md mx-auto'>
      {/* Receipt Preview */}
      <div className='mb-4'>
        <h3 className='text-lg font-semibold mb-2'>Receipt Preview</h3>
        <ThermalReceipt ref={printRef} receiptData={receiptData} />
      </div>

      {/* Print Controls */}
      <div className='space-y-2'>
        <div className='flex gap-2'>
          <button
            onClick={handleRegularPrint}
            className='flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors'
          >
            🖨️ Regular Print
          </button>

          {isSerialSupported && (
            <button
              onClick={handleThermalPrint}
              className='flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors'
            >
              🔥 Thermal Print
            </button>
          )}
        </div>

        <button
          onClick={handleCopyCommands}
          className='w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors'
        >
          📋 Copy ESC/POS Commands
        </button>

        {!isSerialSupported && (
          <div className='text-xs text-amber-600 bg-amber-50 p-2 rounded'>
            ⚠️ Web Serial API not supported in this browser. Use Chrome, Edge,
            or Opera for thermal printing.
          </div>
        )}

        {printStatus && (
          <div className='text-sm text-center p-2 bg-blue-50 text-blue-700 rounded'>
            {printStatus}
          </div>
        )}
      </div>
    </div>
  );
}

// Demo component with sample data
export default function ThermalReceiptDemo() {
  const [receiptData, setReceiptData] = useState({
    payer_name: 'முருகன் குமார்',
    payer_relation: 'மகன்',
    payer_city: 'சென்னை',
    payer_address: 'அண்ணா நகர்',
    payer_phno: '9876543210',
    payer_given_object: 'Cash',
    payer_amount: '5000',
    payer_gift_name: '',
    function_name: 'திருமணம்',
  });

  const printerSettings = {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
  };

  const handleInputChange = (field, value) => {
    setReceiptData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <h1 className='text-3xl font-bold text-center mb-8 text-gray-800'>
          Thermal Receipt Printer
        </h1>

        <div className='grid md:grid-cols-2 gap-8'>
          {/* Input Form */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-xl font-semibold mb-4'>Receipt Details</h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>
                  Payer Name
                </label>
                <input
                  type='text'
                  value={receiptData.payer_name}
                  onChange={(e) =>
                    handleInputChange('payer_name', e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 rounded text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Relation
                </label>
                <input
                  type='text'
                  value={receiptData.payer_relation}
                  onChange={(e) =>
                    handleInputChange('payer_relation', e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 rounded text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>City</label>
                <input
                  type='text'
                  value={receiptData.payer_city}
                  onChange={(e) =>
                    handleInputChange('payer_city', e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 rounded text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Address
                </label>
                <input
                  type='text'
                  value={receiptData.payer_address}
                  onChange={(e) =>
                    handleInputChange('payer_address', e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 rounded text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Phone Number
                </label>
                <input
                  type='text'
                  value={receiptData.payer_phno}
                  onChange={(e) =>
                    handleInputChange('payer_phno', e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 rounded text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Payment Type
                </label>
                <select
                  value={receiptData.payer_given_object}
                  onChange={(e) =>
                    handleInputChange('payer_given_object', e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 rounded text-sm'
                >
                  <option value='Cash'>Cash</option>
                  <option value='Gift'>Gift</option>
                </select>
              </div>

              {receiptData.payer_given_object === 'Cash' ? (
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Amount
                  </label>
                  <input
                    type='number'
                    value={receiptData.payer_amount}
                    onChange={(e) =>
                      handleInputChange('payer_amount', e.target.value)
                    }
                    className='w-full p-2 border border-gray-300 rounded text-sm'
                  />
                </div>
              ) : (
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Gift Name
                  </label>
                  <input
                    type='text'
                    value={receiptData.payer_gift_name}
                    onChange={(e) =>
                      handleInputChange('payer_gift_name', e.target.value)
                    }
                    className='w-full p-2 border border-gray-300 rounded text-sm'
                  />
                </div>
              )}

              <div>
                <label className='block text-sm font-medium mb-1'>
                  Function Name
                </label>
                <input
                  type='text'
                  value={receiptData.function_name}
                  onChange={(e) =>
                    handleInputChange('function_name', e.target.value)
                  }
                  className='w-full p-2 border border-gray-300 rounded text-sm'
                />
              </div>
            </div>
          </div>

          {/* Receipt Preview and Print */}
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <ThermalReceiptComponent
              receiptData={receiptData}
              printerSettings={printerSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
