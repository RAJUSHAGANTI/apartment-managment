export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue' | 'Waived' | 'Partial';
export type PaymentMode = 'Cash' | 'Cheque' | 'NEFT' | 'IMPS' | 'UPI' | 'Online';
export type RequestStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';
export type RequestPriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface MaintenanceBill {
  id: number;
  apartment_id: number;
  flat_number?: string;
  block_name?: string;
  bill_month: string;
  base_amount: number;
  amenity_amount: number;
  penalty_amount: number;
  discount_amount: number;
  total_amount: number;
  due_date: string;
  payment_status: PaymentStatus;
  paid_amount: number;
  paid_date?: string;
  payment_mode?: PaymentMode;
  transaction_ref?: string;
  receipt_number?: string;
}

export interface MaintenanceRequest {
  id: number;
  apartment_id: number;
  flat_number?: string;
  block_name?: string;
  tenant_id?: number;
  category: string;
  subject: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  created_at: string;
}
