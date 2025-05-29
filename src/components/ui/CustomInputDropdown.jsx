import { useEffect, useState, useRef, forwardRef } from 'react';

export const CustomDropdownInput = forwardRef(
  (
    {
      placeholder,
      label,
      options,
      onChange,
      onKeyDown: externalKeyDown,
      value = '',
      required = true,
      name,
      disabled = false,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const optionsRef = useRef([]);
    const inputRef = useRef(null);

    // Handle forwarded ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else if (ref) {
        ref.current = inputRef.current;
      }
    }, [ref]);

    useEffect(() => {
      // Update the input value when the external value changes
      setInputValue(value);
    }, [value]);

    useEffect(() => {
      // Filter options based on input value
      setFilteredOptions(
        options.filter((option) =>
          option.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
      // Reset focused index when options change
      setFocusedIndex(-1);
    }, [inputValue, options]);

    useEffect(() => {
      // Initialize options ref array
      optionsRef.current = optionsRef.current.slice(0, filteredOptions.length);
    }, [filteredOptions]);

    useEffect(() => {
      // Handle clicks outside the dropdown to close it
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleInputChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      if (onChange) onChange(newValue);
      if (!isOpen && newValue) setIsOpen(true);
    };

    const handleOptionClick = (option) => {
      setInputValue(option);
      if (onChange) onChange(option);
      setIsOpen(false);
      setFocusedIndex(-1);

      // Focus back on the input to prepare for Enter key to move to next field
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const toggleDropdown = () => {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFocusedIndex(-1);
      }
    };

    const handleKeyDown = (e) => {
      // If dropdown is not open and Enter key is pressed, call external handler to navigate
      if (e.key === 'Enter' && !isOpen) {
        if (externalKeyDown) {
          externalKeyDown(e);
          return;
        }
      }

      // If dropdown is not open and the key is ArrowDown, open it
      if (!isOpen && e.key === 'ArrowDown') {
        setIsOpen(true);
        setFocusedIndex(0);
        e.preventDefault();
        return;
      }

      let handled = false;

      if (isOpen) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setFocusedIndex((prevIndex) => {
              const newIndex =
                prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : 0;
              // Scroll into view if needed
              if (optionsRef.current[newIndex]) {
                optionsRef.current[newIndex]?.scrollIntoView({
                  block: 'nearest',
                });
              }
              return newIndex;
            });
            handled = true;
            break;
          case 'ArrowUp':
            e.preventDefault();
            setFocusedIndex((prevIndex) => {
              const newIndex =
                prevIndex > 0 ? prevIndex - 1 : filteredOptions.length - 1;
              // Scroll into view if needed
              if (optionsRef.current[newIndex]) {
                optionsRef.current[newIndex]?.scrollIntoView({
                  block: 'nearest',
                });
              }
              return newIndex;
            });
            handled = true;
            break;
          case 'Enter':
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
              handleOptionClick(filteredOptions[focusedIndex]);
              // After selecting an option with Enter, immediately navigate to next field
              if (externalKeyDown) {
                externalKeyDown(e);
              }
            } else {
              // If no option is focused or dropdown is empty, close and move to next field
              setIsOpen(false);
              if (externalKeyDown) {
                externalKeyDown(e);
              }
            }
            handled = true;
            break;
          case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            setFocusedIndex(-1);
            handled = true;
            break;
          default:
            break;
        }
      }

      // Call external onKeyDown handler if provided and not handled internally
      if (externalKeyDown && !handled) {
        externalKeyDown(e);
      }
    };

    return (
      <div className='flex flex-col gap-2 relative' ref={dropdownRef}>
        <h1 className='text-md font-semibold'>
          {required && <span className='text-red-500 mr-1'>*</span>}
          {label}
        </h1>
        <div className='relative'>
          <input
            type='text'
            placeholder={placeholder}
            value={inputValue}
            name={name}
            onChange={handleInputChange}
            onClick={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className='pl-4 pr-10 rounded-md h-10 border w-full focus:outline-none focus:ring-2 focus:ring-darkBlue'
            ref={inputRef}
            autoComplete='off'
            disabled={disabled}
          />
          <button
            type='button'
            onClick={toggleDropdown}
            className='absolute right-2 top-1/2 transform -translate-y-1/2'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              <path
                d='M4 6L8 10L12 6'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
        {isOpen && filteredOptions.length > 0 && (
          <div className='absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md z-10 shadow-lg'>
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                ref={(el) => {
                  optionsRef.current[index] = el;
                }}
                className={`px-4 py-2 cursor-pointer ${
                  focusedIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
