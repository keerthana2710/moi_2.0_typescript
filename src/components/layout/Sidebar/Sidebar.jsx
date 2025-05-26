import {
  TbLayoutSidebarRightCollapse,
  TbLayoutSidebarRightExpand,
} from 'react-icons/tb';
import { FiLogOut } from 'react-icons/fi';
import react from '../../../assets/react.svg';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SIDEBAR_MENU_LIST } from '../../../helpers/enum';
import { isSidebarItemActive } from '../../../helpers/pathMatcher';
import { removeItem } from '../../../utils/LocalStorage';
import { toast } from 'react-toastify';

function Sidebar({ hoveredItem, setHoveredItem, sideBarOpen, setSideBarOpen }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const toggleSidebar = () => setSideBarOpen((prev) => !prev);
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    removeItem('access-token');
    removeItem('user');
    toast.success('Logout successfully');
    navigate('/login');
    setShowLogoutModal(false);
  };

  return (
    <>
      <article
        className={`${
          sideBarOpen ? 'w-56' : 'w-[60px] overflow-hidden'
        } pt-2 min-h-[100vh] bg-sidebarBlue text-sidebarText overflow-hidden fixed top-0 left-0 transition-all duration-300 shadow-lg flex flex-col justify-between`}
        onDoubleClick={toggleSidebar}
      >
        <div>
          <div className='flex items-center h-12'>
            {sideBarOpen ? (
              <div className='flex gap-4'>
                <button onClick={toggleSidebar} className='text-2xl pl-4 px-2'>
                  <TbLayoutSidebarRightExpand />
                </button>
                <div className='-ml-2'>
                  <h1 className='text-bold text-xl text-white'>
                    Visai Innovations
                  </h1>
                </div>
              </div>
            ) : (
              <>
                <div className='-ml-2 hidden'>
                  <img
                    src={react}
                    width={50}
                    height={50}
                    alt={'Main Logo Favicon'}
                    className='w-[50px] h-[50px]'
                  />
                </div>
                <button onClick={toggleSidebar} className='text-2xl pl-4 px-2'>
                  <TbLayoutSidebarRightCollapse />
                </button>
              </>
            )}
          </div>

          <div>
            {SIDEBAR_MENU_LIST.map((item, ind) => {
              const Icon = item.icon;
              const isActive = isSidebarItemActive(path, item.link);
              return (
                <div
                  className={`${
                    sideBarOpen ? '' : 'mb-2'
                  } w-full font-normal hover:font-medium`}
                  key={item?.id}
                  onMouseEnter={() => setHoveredItem({ ...item, rank: ind })}
                  onMouseLeave={() => {
                    if (setHoveredItem && item?.id !== 1 && item?.id !== 6) {
                      setHoveredItem(null);
                    }
                  }}
                >
                  <Link to={item.link}>
                    <button
                      className={`${
                        isActive
                          ? 'bg-opacity-50 text-white bg-darkBlue1 cursor-pointer font-medium'
                          : ''
                      } flex items-center h-12 min-w-fit w-full text-sm hover:scale-105 transition-all duration-300 ${
                        hoveredItem?.id === item?.id
                          ? 'text-white bg-darkBlue1 font-medium'
                          : ''
                      }`}
                    >
                      <p
                        className={`${
                          isActive ? 'bg-darkBlue' : ''
                        } h-full w-1`}
                      ></p>

                      <div
                        className={`${
                          sideBarOpen ? 'flex gap-3' : ''
                        } pt-1.5 w-full`}
                      >
                        <p
                          title={item.name}
                          className={`${
                            sideBarOpen ? 'text-xl' : 'text-[22px]'
                          } ml-4`}
                        >
                          <Icon />
                        </p>

                        <p
                          className={`${
                            sideBarOpen
                              ? 'text-start'
                              : 'text-[9px] text-center'
                          } transition-all w-full duration-200 truncate`}
                        >
                          {sideBarOpen
                            ? item.name
                            : item?.shortname ?? item?.name}
                        </p>
                      </div>
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className='mb-4'>
          <button
            onClick={() => setShowLogoutModal(true)}
            className='flex items-center gap-3 w-full h-12 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md px-4 transition'
            title='Logout'
          >
            <FiLogOut className='text-xl' />
            {sideBarOpen && <span>Logout</span>}
          </button>
        </div>
      </article>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/5 z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm text-center'>
            <h2 className='text-lg font-semibold mb-4'>Confirm Logout</h2>
            <p className='mb-6 text-gray-700'>
              Are you sure you want to logout?
            </p>
            <div className='flex justify-center gap-4'>
              <button
                onClick={handleLogoutConfirm}
                className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'
              >
                Logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className='bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
