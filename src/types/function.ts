export interface FunctionData {
  _id: string;
  function_id: string;
  function_name: string;
  function_owner_name: string;
  function_owner_city: string;
  function_owner_address: string;
  function_owner_phno: string;
  function_amt_spent: number;
  function_hero_name: string;
  function_heroine_name: string;
  function_held_place: string;
  function_held_city: string;
  function_start_date: string;
  function_start_time: string;
  function_end_date: string;
  function_end_time: string;
  function_total_days: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface FunctionFormData {
  function_name: string;
  function_owner_name: string;
  function_owner_city: string;
  function_owner_address: string;
  function_owner_phno: string;
  function_amt_spent: string;
  function_hero_name: string;
  function_heroine_name: string;
  function_held_place: string;
  function_held_city: string;
  function_start_date: Date | null;
  function_start_time: Date | null;
  function_end_date: Date | null;
  function_end_time: Date | null;
  function_total_days: string;
}

export interface FunctionBillDetails {
  owner_name: string;
  owner_occupation: string;
  wife_name: string;
  wife_occupation: string;
  function_place: string;
  function_city: string;
}