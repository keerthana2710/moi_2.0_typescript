import React from 'react';
import { ActionOption } from '@/types/ui';

interface ActionOptionsProps {
  data: ActionOption[];
}

const ActionOptions: React.FC<ActionOptionsProps> = ({ data }) => {
  return (
    <div className='border border-gray-300 rounded-md bg-white shadow-md w-32'>
      {data.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            onClick={() => item.action_func()}
            className={`px-3 py-2 hover:bg-gray-100 flex items-center gap-2 cursor-pointer ${
              item.value === 'Delete' ? 'text-red-500' : ''
            }`}
          >
            <Icon />
            <p>{item.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ActionOptions;