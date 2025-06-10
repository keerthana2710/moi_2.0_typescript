export interface PayerData {
  _id: string;
  function_id: string;
  payer_name: string;
  payer_phno: string;
  payer_work: string;
  payer_given_object: 'Cash' | 'Gift';
  payer_cash_method?: string;
  payer_amount?: number;
  payer_gift_name?: string;
  payer_relation: string;
  payer_city: string;
  payer_address: string;
  payer_receipt_no?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PayerFormData {
  function_id: string;
  function_name: string;
  payer_name: string;
  payer_phno: string;
  payer_work: string;
  payer_given_object: 'Cash' | 'Gift';
  payer_cash_method: string;
  payer_amount: string;
  payer_gift_name: string;
  payer_relation: string;
  payer_city: string;
  payer_address: string;
  current_date: Date;
  current_time: Date;
}