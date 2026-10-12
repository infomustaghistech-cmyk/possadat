export type BusinessId = 'sadat' | 'ak';

export type MonthKey = '2026-05' | '2026-06' | '2026-07' | '2026-08' | '2026-09' | '2026-10';

export type ProductCategory = 
  | 'Air Conditioner'
  | 'Refrigerator'
  | 'Washing Machine'
  | 'LED TV'
  | 'Kitchen Appliances'
  | 'Small Appliances';

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: ProductCategory;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  minLevel: number;
  imageUrl: string;
  targetBusiness: 'both' | 'sadat' | 'ak';
  showroomStock?: number;
  godownStock?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  area: string;
  address: string;
  createdAt: string;
}

export interface Dealer {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  city: string;
  address: string;
  openingBalance: number;
  creditTermsDays: number;
  createdAt: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  speciality: ProductCategory;
  commissionRate: number; // percentage, e.g. 30 for 30%
  status: 'Active' | 'On Leave';
}

export interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  unitCost: number;
  total: number;
}

export interface Sale {
  id: string; // e.g. SI-0201
  businessId: 'sadat';
  date: string; // YYYY-MM-DD
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod: 'Cash' | 'Bank / JazzCash / Easypaisa';
  status: 'Paid' | 'Partial' | 'Credit';
  notes?: string;
  profit: number; // total - cost
}

export interface Complaint {
  id: string; // e.g. CMP-0041
  parentComplaintId?: string; // for re-complaints
  isRecomplaint?: boolean;
  businessId: 'sadat';
  date: string; // YYYY-MM-DD
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  appliance: string; // e.g. Gree 1.5 Ton Inverter AC
  brand: string;
  modelSerial: string;
  issue: string;
  priority: 'Low' | 'Normal' | 'High';
  technicianId?: string;
  technicianName?: string;
  visitDate: string;
  status: 'New' | 'Assigned' | 'In Progress' | 'Waiting Parts' | 'Completed' | 'Closed';
  invoiceId?: string;
  notes?: string;
}

export interface ServicePartUsed {
  partName: string;
  cost: number;
  priceCharged: number;
}

export interface ServiceInvoice {
  id: string; // e.g. SV-0105
  complaintId: string;
  date: string; // YYYY-MM-DD
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  serviceCharge: number;
  parts: ServicePartUsed[];
  partsCost: number;
  partsPrice: number;
  totalBill: number; // serviceCharge + partsPrice
  commissionRate: number; // technician %
  commissionAmount: number; // serviceCharge * commissionRate / 100
  shopProfit: number; // serviceCharge + partsPrice - partsCost - commissionAmount
  paidStatus: 'Paid' | 'Pending';
  paymentMethod: 'Cash' | 'Bank / Online';
}

export interface DispatchItem {
  productId: string;
  productName: string;
  qty: number;
  unitWholesalePrice: number;
  unitCost: number;
  total: number;
}

export interface Dispatch {
  id: string; // e.g. AK-0089
  businessId: 'ak';
  date: string;
  dealerId: string;
  dealerName: string;
  items: DispatchItem[];
  subtotal: number;
  total: number;
  creditTermsDays: number;
  dueDate: string;
  amountPaidNow: number;
  balanceAmount: number;
  status: 'Dispatched' | 'Partially Paid' | 'Paid' | 'Returned';
  vehicleOrBiltyNo?: string;
}

export interface DealerPayment {
  id: string; // e.g. PAY-0042
  date: string;
  dealerId: string;
  dealerName: string;
  amount: number;
  method: 'Cash' | 'Meezan Bank' | 'HBL' | 'JazzCash' | 'Easypaisa' | 'Cheque';
  referenceNo?: string;
  notes?: string;
}

export interface CustomerPayment {
  id: string; // e.g. PAY-0081
  date: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: 'Cash' | 'Bank / JazzCash / Easypaisa';
  notes?: string;
}

export interface ReturnRecord {
  id: string; // e.g. RT-0012
  date: string;
  businessId: BusinessId;
  type: 'Retail' | 'Wholesale';
  referenceId: string; // saleId or dispatchId
  partyId: string; // customerId or dealerId
  partyName: string;
  productId: string;
  productName: string;
  qty: number;
  refundOrCreditAmount: number;
  reason: string;
}

export interface PurchaseOrder {
  id: string; // e.g. PO-0056
  date: string;
  supplier: string;
  productId: string;
  productName: string;
  qty: number;
  unitCost: number;
  total: number;
  destination: 'Showroom' | 'Godown';
  status: 'Received';
}

export interface Expense {
  id: string; // e.g. EXP-0120
  date: string;
  businessId: BusinessId;
  category: 'Rent' | 'Electricity' | 'Salaries' | 'Transport & Freight' | 'Fuel' | 'Internet & Phone' | 'Food & Refreshment' | 'Marketing' | 'Maintenance & Others';
  description: string;
  amount: number;
  paidFrom: 'Cash Drawer' | 'Meezan Bank' | 'HBL Business Account';
}

export interface WhatsAppMessage {
  id: string;
  timestamp: string;
  recipientName: string;
  recipientPhone: string;
  templateType: 'Service Invoice' | 'Complaint Status' | 'Payment Reminder' | 'Welcome Message' | 'Offer / Promotion' | 'Custom';
  content: string;
  status: 'Sent';
}

export interface BusinessConfig {
  name: string;
  legalName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  ntn: string;
  type: string;
}

export interface NotificationAlert {
  id: string;
  type: 'low_stock' | 'complaint' | 'dealer_overdue' | 'customer_pending';
  title: string;
  message: string;
  linkTab: string;
  severity: 'red' | 'orange' | 'blue';
}
