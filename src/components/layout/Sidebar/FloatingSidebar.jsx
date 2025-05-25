import { Link } from 'react-router-dom';

import { SIDEBAR_CONFIG } from './FloatingSidebarConfig';

import { FLOATING_SIDBAR_POSITIONS } from '../../../helpers/enum';

function FloatingSideBar({ sideBarOpen, hoveredItem, setHoveredItem }) {
  const sidebarData = SIDEBAR_CONFIG?.[hoveredItem?.id];

  if (
    hoveredItem?.id == 2 ||
    hoveredItem?.id === 3 ||
    hoveredItem?.id === 4 ||
    hoveredItem?.id === 5 ||
    hoveredItem?.id === 6 ||
    hoveredItem?.id === 7
  )
    return;

  return (
    <div
      onMouseLeave={() => {
        if (setHoveredItem) {
          setHoveredItem(null);
        }
      }}
      style={{
        top: sideBarOpen
          ? FLOATING_SIDBAR_POSITIONS[hoveredItem?.rank]?.topPosition
          : FLOATING_SIDBAR_POSITIONS[hoveredItem?.rank]?.topPosition2,
        left: sideBarOpen ? '224px' : '60px',
      }}
      className={`transition-all duration-300 select-none px-6 py-5 min-w-72 min-h-[100px] max-w-fit max-h-fit z-50 border border-black bg-sidebarBlue rounded-r-md fixed shadow-lg`}
    >
      <div className=''>
        <h2 className='font-semibold text-sm mb-2 text-white'>
          {SIDEBAR_CONFIG?.[hoveredItem?.id]?.root_heading}
        </h2>

        {sidebarData && 'extension_data' in sidebarData && (
          <div className='flex gap-10'>
            {sidebarData.extension_data.map((item, ind) => (
              <div key={ind}>
                <h4 className='text-[12px] mb-1 font-semibold uppercase text-[#ffffff72]'>
                  {item?.sub_heading}
                </h4>
                {item?.data?.map((element, ind) => {
                  return (
                    <div
                      key={ind}
                      className='my-1 text-sm hover:my-1 text-sidebarText hover:text-white hover:font-bold hover:text-[13px] duration-300 transition-all'
                    >
                      <Link
                        to={element?.link}
                        onClick={() => {
                          if (setHoveredItem) {
                            setHoveredItem(null);
                          }
                        }}
                      >
                        {element?.title}
                      </Link>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FloatingSideBar;
