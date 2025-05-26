import { FaUserEdit } from 'react-icons/fa';
import { ImBin2 } from 'react-icons/im';
import { IoMdPersonAdd } from 'react-icons/io';
import { IoPieChartSharp } from 'react-icons/io5';
import { MdOutlineFestival } from 'react-icons/md';
import { TbReportAnalytics } from 'react-icons/tb';

export const SIDEBAR_MENU_LIST = [
  {
    name: 'Funtions',
    link: '/',
    shortname: 'Funtions',
    icon: MdOutlineFestival,
    id: 1,
  },
  {
    name: 'Payers',
    link: '/payers',
    shortname: 'Payers',
    icon: IoMdPersonAdd,
    id: 2,
  },
  {
    name: 'Reports',
    link: '/reports',
    shortname: 'Reports',
    icon: TbReportAnalytics,
    id: 3,
  },
  {
    name: 'Charts',
    link: '/charts',
    shortname: 'Charts',
    icon: IoPieChartSharp,
    id: 4,
  },
  {
    name: 'Edit Logs',
    link: '/edit_logs',
    shortname: 'Logs',
    icon: FaUserEdit,
    id: 5,
  },
  {
    name: ' Bin',
    link: '/bin/payers_bin',
    shortname: 'Bin',
    icon: ImBin2,
    id: 6,
  },
];

export const FLOATING_SIDBAR_POSITIONS = [
  { topPosition: '54px', topPosition2: '56px' },
  { topPosition: '102px', topPosition2: '112px' },
  { topPosition: '150px', topPosition2: '168px' },
  { topPosition: '198px', topPosition2: '224px' },
  { topPosition: '246px', topPosition2: '280px' },
  { topPosition: '294px', topPosition2: '336px' },
  { topPosition: '342px', topPosition2: '392px' },
];
