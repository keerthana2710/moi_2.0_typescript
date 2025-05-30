export interface HoveredItemType {
  id: number;
  name: string;
  link: string;
  shortname?: string;
  icon: React.ComponentType;
  rank?: number;
}

export interface SidebarProps {
  hoveredItem: HoveredItemType | null;
  setHoveredItem: (item: HoveredItemType | null) => void;
  sideBarOpen: boolean;
  setSideBarOpen: (open: boolean) => void;
}

export interface FloatingSideBarProps {
  sideBarOpen: boolean;
  hoveredItem: HoveredItemType;
  setHoveredItem: (item: HoveredItemType | null) => void;
}

export interface MobileMessageProps {}

export interface UseIsMobileReturn {
  isMobile: boolean;
}

export interface DbManagerType {
  init: () => Promise<void>;
  getUniqueValues: (type: string) => Promise<string[]>;
  setUniqueValues: (type: string, data: string[]) => Promise<void>;
  addUniqueValue: (type: string, value: string) => Promise<string[]>;
  getAllUniqueValues: () => Promise<Record<string, string[]>>;
  clearAllData: () => Promise<void>;
}