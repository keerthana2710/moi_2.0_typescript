const { BillPreview } = require('@/pages/BillDetails/components/BillPreview');
const { useEffect } = require('react');
const { FaTimes, FaSave } = require('react-icons/fa');

const BillPreviewModal = ({
  isOpen,
  onClose,
  onSave,
  onPrint,
  formData,
  selectedFunction,
  isLoading,
  autoPrint = false, // New prop for auto-printing
}) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printElement = printRef.current;
    if (printElement) {
      const printWindow = window.open('', '_blank');

      const billContent = printElement.innerHTML;

      printWindow.document.open(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill Print</title>
          <meta charset="UTF-8">
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            
            @page {
              size: 58mm auto;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 58mm !important;
              font-family: 'Courier New', monospace !important;
              font-size: 9px !important;
              line-height: 1.2 !important;
              background: white !important;
              color: black !important;
            }
            
            .bill-container {
              width: 58mm !important;
              max-width: 58mm !important;
              margin: 0 !important;
              padding: 2mm !important;
              background: white !important;
              font-family: 'Courier New', monospace !important;
              font-size: 9px !important;
              line-height: 1.2 !important;
              color: black !important;
            }
            
            .border-dotted {
              border-style: dotted !important;
              border-color: black !important;
            }
            
            .border-black {
              border-color: black !important;
            }
            
            .bg-black {
              background-color: black !important;
              color: white !important;
            }
            
            .text-white {
              color: white !important;
            }
            
            .font-bold {
              font-weight: bold !important;
            }
            
            .text-center {
              text-align: center !important;
            }
            
            .text-xs {
              font-size: 8px !important;
            }
            
            .text-sm {
              font-size: 9px !important;
            }
            
            .text-lg {
              font-size: 11px !important;
            }
            
            .mb-1 { margin-bottom: 1mm !important; }
            .mb-2 { margin-bottom: 2mm !important; }
            .mb-3 { margin-bottom: 3mm !important; }
            .mt-2 { margin-top: 2mm !important; }
            .py-1 { padding: 1mm 0 !important; }
            
            .flex {
              display: flex !important;
            }
            
            .justify-between {
              justify-content: space-between !important;
            }
            
            .justify-center {
              justify-content: center !important;
            }
            
            .items-center {
              align-items: center !important;
            }
            
            .gap-1 > * + * {
              margin-left: 1mm !important;
            }
            
            .gap-3 > * + * {
              margin-left: 3mm !important;
            }
            
            .leading-tight {
              line-height: 1.1 !important;
            }
            
            .border-t {
              border-top: 1px solid black !important;
            }
            
            .border-b {
              border-bottom: 1px solid black !important;
            }
            
            .border-t-2 {
              border-top: 2px solid black !important;
            }
            
            .w-4 {
              width: 4mm !important;
            }
            
            .h-4 {
              height: 4mm !important;
            }
          </style>
        </head>
        <body>
          ${billContent}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

      printWindow.document.close();
    }

    if (onPrint) {
      onPrint(formData);
    }
  };

  // Auto-print effect when modal opens with autoPrint flag
  useEffect(() => {
    if (isOpen && autoPrint && printRef.current) {
      // Small delay to ensure modal content is rendered
      const timer = setTimeout(() => {
        handlePrint();
        // Close modal after printing
        setTimeout(() => {
          onClose();
        }, 500);
      }, 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, autoPrint]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden'>
        {/* Modal Header */}
        <div className='flex justify-between items-center p-4 border-b bg-blue-50'>
          <h2 className='text-xl font-semibold text-blue-700'>
            பில் முன்னோட்டம்
          </h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 p-1'
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
          <div className='print-area'>
            <BillPreview
              formData={formData}
              selectedFunction={selectedFunction}
              payerData={formData}
              ref={printRef}
              showPlaceholder={false}
            />
          </div>
        </div>

        <div className='flex justify-end gap-3 p-4 border-t bg-gray-50'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100'
          >
            close
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <FaSave />
            {isLoading ? 'saving ... ' : 'save'}
          </button>
        </div>
      </div>
    </div>
  );
};
