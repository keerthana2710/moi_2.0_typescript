export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface EditLog {
  _id: string;
  target_type: 'Function' | 'Payer';
  target_id: string;
  action: 'create' | 'update' | 'delete';
  before_value?: Record<string, any>;
  after_value?: Record<string, any>;
  changed_fields?: string[];
  reason: string;
  created_by: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

export interface ChartData {
  name: string;
  value: number;
  count?: number;
  total_amount?: number;
}

export interface PaymentMethodData {
  payment_method: string;
  count: number;
  total_amount: number;
}

export interface RelationData {
  relation: string;
  count: number;
  total_amount: number;
}

export interface CityData {
  city: string;
  count: number;
  total_amount: number;
}

export interface AmountRangeData {
  range: string;
  count: number;
}

export interface CashGiftsData {
  cash: {
    count: number;
    total_amount: number;
  };
  gifts: {
    count: number;
    gift_types: Array<{
      gift_name: string;
      count: number;
    }>;
  };
}

export interface TopContributorData {
  payer_name: string;
  payer_amount: number;
}