interface SidebarItem {
  title: string;
  link: string;
}

interface SidebarSection {
  sub_heading: string;
  data: SidebarItem[];
}

interface SidebarConfig {
  root_heading: string;
  id: number;
  extension_data: SidebarSection[];
}

interface SidebarConfigMap {
  [key: number]: SidebarConfig;
}

export const SIDEBAR_CONFIG: SidebarConfigMap = {
  1: {
    root_heading: 'Functions',
    id: 1,
    extension_data: [
      {
        sub_heading: 'Quick Links',
        data: [
          { title: 'Create Function', link: '/create_functions' },
          { title: 'Add Function Bill', link: '/add_function_bill' },
        ],
      },
    ],
  },
  6: {
    root_heading: 'Bin',
    id: 6,
    extension_data: [
      {
        sub_heading: 'Quick Links',
        data: [
          { title: 'Functions Bin', link: '/bin/functions_bin' },
          { title: 'Payers Bin', link: '/bin/payers_bin' },
        ],
      },
    ],
  },
};