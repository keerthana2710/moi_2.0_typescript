import { ReactNode } from 'react';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface ActionOption {
  value: string;
  icon: React.ComponentType;
  action_func: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface TableColumn {
  key: string;
  label: string;
}

export interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface FilterState {
  target_id: string;
  target_type: string;
  action: string;
  created_by: string;
  user_email: string;
  startDate: string;
  endDate: string;
}

export interface BillPreviewProps {
  formData: any;
  selectedFunction: any;
  payerData?: any;
  showPlaceholder?: boolean;
}

export interface CustomDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  onSearch?: (searchTerm: string) => void;
  searchable?: boolean;
  loading?: boolean;
  required?: boolean;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
}

export interface CustomInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'number' | 'email' | 'tel';
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface ChipSelectorProps {
  label: string;
  pageFetch: number;
  setPageFetch: (value: number) => void;
}

export interface PageHeaderProps {
  header: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disableSearch?: boolean;
  handleSubmit?: () => void;
  disableButton?: boolean;
}