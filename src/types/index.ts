export type PatientStatus = 'active' | 'hospitalized' | 'discharged';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type AdmissionStatus = 'active' | 'discharged' | 'transferred'| 'hospitalised';
export type InvoiceStatus = 'draft' | 'pending' | 'partial' | 'paid' | 'overdue';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  bloodType: string;
  insurance?: string;
  insuranceNumber?: string;
  emergencyContact: string;
  emergencyPhone: string;
  registrationDate: string;
  status: PatientStatus;
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  actualDischargeDate?: string;
  department: string;
  room: string;
  bed: string;
  doctorId: string;
  doctorName: string;
  reason: string;
  diagnosis?: string;
  status: AdmissionStatus;
  typeSejour?: 'Hospitalisation' | 'Consultation' | 'Urgences';
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  admissionId?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  beds: number;
  occupiedBeds: number;
}

export type Page =
  | 'dashboard' | 'patients' | 'patient-detail' | 'patient-new' | 'patient-edit'
  | 'admissions' | 'admission-new' | 'admission-discharge'
  | 'patient-file'
  | 'appointments' | 'appointment-new'
  | 'billing' | 'billing-detail' | 'billing-new' | 'reports';

export interface NavigationState {
  page: Page;
  selectedId?: string;
}