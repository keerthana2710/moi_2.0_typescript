import React, { useState, useRef, forwardRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  dateFormat?: string;
  placeholderText?: string;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeIntervals?: number;
  timeCaption?: string;
  wrapperClassName?: string;
  name?: string;
  label?: string;
  required?: boolean;
  popperClassName?: string;
  icon?: 'calendar' | 'clock';
}

export const CustomDatePicker = forwardRef<HTMLInputElement, CustomDatePickerProps>(
  (
    {
      selected,
      onChange,
      onKeyDown: externalKeyDown,
      dateFormat,
      placeholderText,
      showTimeSelect = false,
      showTimeSelectOnly = false,
      timeIntervals = 30,
      timeCaption,
      wrapperClassName,
      name,
      label,
      required = true,
      popperClassName,
      icon = 'calendar',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const datePickerRef = useRef<DatePicker>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle forwarded ref
    useEffect(() => {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else if (ref) {
        ref.current = inputRef.current;
      }
    }, [ref]);

    // Handle clicks outside to close the datepicker
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleChange = (date: Date | null) => {
      onChange(date);
      // Keep focus on the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // When Enter key is pressed
      if (e.key === 'Enter') {
        if (isOpen) {
          // If datepicker is open, select the current date
          // (this is handled by the DatePicker component itself)
          setIsOpen(false);

          // After selecting, call external key handler to move to next field
          if (externalKeyDown) {
            setTimeout(() => {
              externalKeyDown(e);
            }, 0);
          }
        } else {
          // If datepicker is closed, just move to next field
          if (externalKeyDown) {
            externalKeyDown(e);
          }
        }
        e.preventDefault();
        return;
      }

      // If ArrowDown is pressed and datepicker is closed, open it
      if (e.key === 'ArrowDown' && !isOpen) {
        setIsOpen(true);
        e.preventDefault();
        return;
      }

      // Handle Escape key to close the datepicker
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        e.preventDefault();
        return;
      }

      // Forward other key events to external handler
      if (externalKeyDown) {
        externalKeyDown(e);
      }
    };

    // Custom input component for the DatePicker
    const CustomInput = forwardRef<HTMLInputElement, { value?: string; onClick?: (e: React.MouseEvent) => void }>(
      ({ value, onClick }, inputRefInner) => (
        <div className='relative w-full'>
          <input
            type='text'
            className='border rounded p-2 w-full cursor-pointer bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
            placeholder={placeholderText}
            value={value || ''}
            onClick={(e) => {
              onClick?.(e);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            readOnly
            ref={(el) => {
              // Handle both the inner ref from DatePicker and our own inputRef
              if (inputRefInner) {
                if (typeof inputRefInner === 'function') {
                  inputRefInner(el);
                } else {
                  inputRefInner.current = el;
                }
              }
              inputRef.current = el;
            }}
            name={name}
          />
          <div className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500'>
            {icon === 'calendar' ? (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <rect x='3\' y='4\' width='18\' height='18\' rx='2\' ry='2' />
                <line x1='16\' y1='2\' x2='16\' y2='6' />
                <line x1='8\' y1='2\' x2='8\' y2='6' />
                <line x1='3\' y1='10\' x2='21\' y2='10' />
              </svg>
            ) : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <circle cx='12' cy='12' r='10' />
                <polyline points='12 6 12 12 16 14' />
              </svg>
            )}
          </div>
        </div>
      )
    );

    return (
      <div className='flex flex-col gap-2' ref={containerRef}>
        <label className='text-md font-semibold'>
          {required && <span className='text-red-500 mr-1'>*</span>}
          {label}
        </label>
        <DatePicker
          ref={datePickerRef}
          selected={selected}
          onChange={handleChange}
          onCalendarOpen={() => setIsOpen(true)}
          onCalendarClose={() => setIsOpen(false)}
          dateFormat={dateFormat}
          customInput={<CustomInput />}
          wrapperClassName={wrapperClassName || 'w-full'}
          open={isOpen}
          showTimeSelect={showTimeSelect}
          showTimeSelectOnly={showTimeSelectOnly}
          timeIntervals={timeIntervals}
          timeCaption={timeCaption}
          popperProps={{
            strategy: 'fixed',
          }}
          popperClassName={`z-50 ${popperClassName || ''}`}
        />
      </div>
    );
  }
);

export const CustomDatePickerInput = CustomDatePicker;

export const CustomTimePickerInput = forwardRef<HTMLInputElement, Omit<CustomDatePickerProps, 'showTimeSelect' | 'showTimeSelectOnly' | 'icon'>>(
  (props, ref) => (
    <CustomDatePicker
      {...props}
      showTimeSelect={true}
      showTimeSelectOnly={true}
      icon='clock'
      ref={ref}
    />
  )
);