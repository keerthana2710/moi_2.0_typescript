import React from 'react';
import { LuSearch } from 'react-icons/lu';
import CustomButton from './CustomButton';
import { FaSave } from 'react-icons/fa';
import { PageHeaderProps } from '@/types/ui';

const PageHeaderWithSearch: React.FC<PageHeaderProps> = ({
  header,
  value,
  onChange,
  disableSearch,
  handleSubmit,
  disableButton,
}) => {
  return (
    <div className='h-14 flex justify-between items-center'>
      <p className='text-black font-semibold text-3xl'>{header}</p>

      {!disableSearch ? (
        <div className='flex gap-5 items-center'>
          <div className='relative w-80'>
            <input
              className='text-sm focus:outline-none w-full h-10 pr-10 pl-10 border border-borderGray rounded-xl'
              placeholder='Search'
              type='text'
              name='search'
              value={value || ''}
              onChange={onChange}
            />
            <div className='absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none'>
              <LuSearch size={20} />
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
      {!disableButton ? (
        <CustomButton icon={<FaSave />} onClick={handleSubmit} value={'Save'} />
      ) : (
        ''
      )}
    </div>
  );
};

export default PageHeaderWithSearch;