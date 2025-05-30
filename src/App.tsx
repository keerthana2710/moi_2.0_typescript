import { useEffect, useState } from 'react';
import { FLOATING_SIDBAR_POSITIONS } from './helpers/enum';
import { Outlet } from 'react-router-dom';
import useIsMobile from './hooks/useIsMobile';
import Sidebar from './components/layout/Sidebar/Sidebar';
import FloatingSideBar from './components/layout/Sidebar/FloatingSidebar';
import { dbManager } from './services/IndexedDBManager';
import MobileMessage from './components/layout/MobileMessage';
import { HoveredItemType } from './types';

function App() {
  const [hoveredItem, setHoveredItem] = useState<HoveredItemType | null>(null);
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    dbManager.init().catch(console.error);
  }, []);

  return (
    <>
      {isMobile ? (
        <MobileMessage />
      ) : (
        <div className='flex max-w-[100%] min-h-[100vh] bg-stone-50 relative'>
          <div
            className={`${
              sideBarOpen ? 'w-64' : 'w-14 overflow-hidden'
            } border-r shadow-xl shadow-lightBlue transition-all duration-300`}
          >
            <Sidebar
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
              sideBarOpen={sideBarOpen}
              setSideBarOpen={setSideBarOpen}
            />
            {hoveredItem &&
            FLOATING_SIDBAR_POSITIONS[hoveredItem.id]?.topPosition ? (
              <FloatingSideBar
                sideBarOpen={sideBarOpen}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
              />
            ) : null}
          </div>
          <div
            className={`w-full ${
              sideBarOpen ? 'left-60' : 'left-20'
            } mt-5 ml-4 transition-all duration-300 overflow-x-hidden`}
            onMouseEnter={() => {
              if (hoveredItem) {
                setHoveredItem(null);
              }
            }}
          >
            <Outlet />
          </div>
        </div>
      )}
    </>
  );
}

export default App;