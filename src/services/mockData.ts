import type { Patient, Appointment, Admission, Invoice, Doctor, Department } from '../types/index';

// ─── MOCK DATA DÉSACTIVÉ ──────────────────────────────────────────────────────
// Les données ci-dessous sont commentées pour forcer l'utilisation des vraies API.
// Pages encore sur mock (à migrer) : Dashboard, Patients, Admissions, Billing, Reports.

export const doctors: Doctor[] = [];
/* [
  { id: 'd1', name: 'Dr. Amara Kone', specialty: 'Cardiologie', department: 'Cardiologie' },
  { id: 'd2', name: 'Dr. Fatima Diallo', specialty: 'Pédiatrie', department: 'Pédiatrie' },
  { id: 'd3', name: 'Dr. Moussa Traoré', specialty: 'Chirurgie générale', department: 'Chirurgie' },
  { id: 'd4', name: 'Dr. Aïssatou Barry', specialty: 'Gynécologie', department: 'Gynécologie' },
  { id: 'd5', name: 'Dr. Ibrahim Sow', specialty: 'Médecine interne', department: 'Médecine interne' },
  { id: 'd6', name: 'Dr. Mariam Coulibaly', specialty: 'Neurologie', department: 'Neurologie' },
  { id: 'd7', name: 'Dr. Oumar Bah', specialty: 'Urgences', department: 'Urgences' },
] */

export const departments: Department[] = [];
/* [
  { id: 'dep1', name: 'Cardiologie', head: 'Dr. Amara Kone', beds: 20, occupiedBeds: 14 },
  { id: 'dep2', name: 'Pédiatrie', head: 'Dr. Fatima Diallo', beds: 30, occupiedBeds: 22 },
  { id: 'dep3', name: 'Chirurgie', head: 'Dr. Moussa Traoré', beds: 25, occupiedBeds: 18 },
  { id: 'dep4', name: 'Gynécologie', head: 'Dr. Aïssatou Barry', beds: 20, occupiedBeds: 11 },
  { id: 'dep5', name: 'Médecine interne', head: 'Dr. Ibrahim Sow', beds: 35, occupiedBeds: 28 },
  { id: 'dep6', name: 'Neurologie', head: 'Dr. Mariam Coulibaly', beds: 15, occupiedBeds: 9 },
  { id: 'dep7', name: 'Urgences', head: 'Dr. Oumar Bah', beds: 10, occupiedBeds: 7 },
] */

export const patients: Patient[] = [];
/* [
  {
    id: 'p1', firstName: 'Aminata', lastName: 'Diallo', dateOfBirth: '1985-03-14', gender: 'F',
    phone: '+224 622 45 67 89', email: 'aminata.diallo@email.com', address: '12 Rue du Commerce',
    city: 'Conakry', bloodType: 'A+', insurance: 'CNSS', insuranceNumber: 'CNSS-2024-00145',
    emergencyContact: 'Mamadou Diallo', emergencyPhone: '+224 628 12 34 56',
    registrationDate: '2024-01-15', status: 'active', notes: 'Allergie à la pénicilline',
  },
  {
    id: 'p2', firstName: 'Ibrahima', lastName: 'Bah', dateOfBirth: '1972-07-22', gender: 'M',
    phone: '+224 655 78 90 12', email: 'ibrahima.bah@email.com', address: '45 Avenue de la République',
    city: 'Kindia', bloodType: 'O+', insurance: 'Sunu Assurances', insuranceNumber: 'SUNU-2023-00892',
    emergencyContact: 'Kadiatou Bah', emergencyPhone: '+224 660 34 56 78',
    registrationDate: '2023-11-08', status: 'hospitalized',
  },
  {
    id: 'p3', firstName: 'Fatoumata', lastName: 'Camara', dateOfBirth: '1995-12-03', gender: 'F',
    phone: '+224 664 23 45 67', email: 'fatoumata.camara@email.com', address: '8 Quartier Madina',
    city: 'Conakry', bloodType: 'B+', insurance: 'UNICORP', insuranceNumber: 'UNI-2024-00234',
    emergencyContact: 'Oumar Camara', emergencyPhone: '+224 628 90 12 34',
    registrationDate: '2024-02-20', status: 'active',
  },
  {
    id: 'p4', firstName: 'Mamadou', lastName: 'Kouyaté', dateOfBirth: '1960-05-18', gender: 'M',
    phone: '+224 622 56 78 90', email: 'mamadou.kouyate@email.com', address: '33 Cité des Nations',
    city: 'Kankan', bloodType: 'AB+', insurance: 'CNSS', insuranceNumber: 'CNSS-2022-01456',
    emergencyContact: 'Hadja Kouyaté', emergencyPhone: '+224 655 67 89 01',
    registrationDate: '2022-06-10', status: 'active',
  },
  {
    id: 'p5', firstName: 'Mariama', lastName: 'Sylla', dateOfBirth: '2001-09-27', gender: 'F',
    phone: '+224 628 34 56 78', email: 'mariama.sylla@email.com', address: '17 Boulevard du Commerce',
    city: 'Conakry', bloodType: 'A-', insurance: 'Non assuré', insuranceNumber: '',
    emergencyContact: 'Sékou Sylla', emergencyPhone: '+224 664 45 67 89',
    registrationDate: '2024-03-05', status: 'discharged',
  },
  {
    id: 'p6', firstName: 'Souleymane', lastName: 'Toure', dateOfBirth: '1978-11-09', gender: 'M',
    phone: '+224 655 90 12 34', email: 'souleymane.toure@email.com', address: '5 Rue des Fleurs',
    city: 'Labé', bloodType: 'O-', insurance: 'CNSS', insuranceNumber: 'CNSS-2021-00789',
    emergencyContact: 'Oumou Toure', emergencyPhone: '+224 622 78 90 12',
    registrationDate: '2021-09-14', status: 'hospitalized',
  },
  {
    id: 'p7', firstName: 'Hawa', lastName: 'Baldé', dateOfBirth: '1990-04-15', gender: 'F',
    phone: '+224 660 56 78 90', email: 'hawa.balde@email.com', address: '22 Quartier Almamya',
    city: 'Conakry', bloodType: 'B-', insurance: 'Sunu Assurances', insuranceNumber: 'SUNU-2023-01123',
    emergencyContact: 'Ibrahima Baldé', emergencyPhone: '+224 664 12 34 56',
    registrationDate: '2023-07-22', status: 'active',
  },
  {
    id: 'p8', firstName: 'Alpha', lastName: 'Condé', dateOfBirth: '1955-02-28', gender: 'M',
    phone: '+224 628 67 89 01', email: 'alpha.conde@email.com', address: '88 Avenue Patrice Lumumba',
    city: 'N\'Zérékoré', bloodType: 'A+', insurance: 'CNSS', insuranceNumber: 'CNSS-2020-02345',
    emergencyContact: 'Aïssatou Condé', emergencyPhone: '+224 655 23 45 67',
    registrationDate: '2020-12-01', status: 'active',
  },
] */

export const appointments: Appointment[] = [];
/* [
  { id: 'a1', patientId: 'p1', patientName: 'Aminata Diallo', doctorId: 'd1', doctorName: 'Dr. Amara Kone', department: 'Cardiologie', date: '2026-04-17', time: '09:00', duration: 30, type: 'Consultation', status: 'confirmed', createdAt: '2026-04-10' },
  { id: 'a2', patientId: 'p3', patientName: 'Fatoumata Camara', doctorId: 'd4', doctorName: 'Dr. Aïssatou Barry', department: 'Gynécologie', date: '2026-04-17', time: '10:30', duration: 45, type: 'Suivi', status: 'confirmed', createdAt: '2026-04-12' },
  { id: 'a3', patientId: 'p4', patientName: 'Mamadou Kouyaté', doctorId: 'd5', doctorName: 'Dr. Ibrahim Sow', department: 'Médecine interne', date: '2026-04-17', time: '11:00', duration: 30, type: 'Consultation', status: 'scheduled', createdAt: '2026-04-14' },
  { id: 'a4', patientId: 'p7', patientName: 'Hawa Baldé', doctorId: 'd2', doctorName: 'Dr. Fatima Diallo', department: 'Pédiatrie', date: '2026-04-18', time: '08:30', duration: 30, type: 'Contrôle', status: 'scheduled', createdAt: '2026-04-15' },
  { id: 'a5', patientId: 'p8', patientName: 'Alpha Condé', doctorId: 'd6', doctorName: 'Dr. Mariam Coulibaly', department: 'Neurologie', date: '2026-04-18', time: '14:00', duration: 60, type: 'Examen', status: 'scheduled', createdAt: '2026-04-16' },
  { id: 'a6', patientId: 'p2', patientName: 'Ibrahima Bah', doctorId: 'd3', doctorName: 'Dr. Moussa Traoré', department: 'Chirurgie', date: '2026-04-16', time: '15:00', duration: 45, type: 'Pré-opératoire', status: 'completed', createdAt: '2026-04-10' },
  { id: 'a7', patientId: 'p5', patientName: 'Mariama Sylla', doctorId: 'd7', doctorName: 'Dr. Oumar Bah', department: 'Urgences', date: '2026-04-15', time: '20:30', duration: 30, type: 'Urgence', status: 'completed', createdAt: '2026-04-15' },
  { id: 'a8', patientId: 'p6', patientName: 'Souleymane Toure', doctorId: 'd5', doctorName: 'Dr. Ibrahim Sow', department: 'Médecine interne', date: '2026-04-19', time: '09:30', duration: 30, type: 'Suivi', status: 'scheduled', createdAt: '2026-04-16' },
] */

export const admissions: Admission[] = [];
/* [
  { id: 'adm1', patientId: 'p2', patientName: 'Ibrahima Bah', admissionDate: '2026-04-10', expectedDischargeDate: '2026-04-20', department: 'Chirurgie', room: 'C-204', bed: 'B2', doctorId: 'd3', doctorName: 'Dr. Moussa Traoré', reason: 'Appendicite aiguë', diagnosis: 'Appendicite perforée', status: 'active', notes: 'Opération programmée le 17/04' },
  { id: 'adm2', patientId: 'p6', patientName: 'Souleymane Toure', admissionDate: '2026-04-12', expectedDischargeDate: '2026-04-22', department: 'Médecine interne', room: 'MI-110', bed: 'B1', doctorId: 'd5', doctorName: 'Dr. Ibrahim Sow', reason: 'Diabète décompensé', diagnosis: 'Diabète de type 2 avec complications', status: 'active' },
  { id: 'adm3', patientId: 'p5', patientName: 'Mariama Sylla', admissionDate: '2026-04-15', actualDischargeDate: '2026-04-16', department: 'Urgences', room: 'U-03', bed: 'B3', doctorId: 'd7', doctorName: 'Dr. Oumar Bah', reason: 'Traumatisme crânien léger', diagnosis: 'Commotion cérébrale légère', status: 'discharged' },
  { id: 'adm4', patientId: 'p1', patientName: 'Aminata Diallo', admissionDate: '2026-03-01', actualDischargeDate: '2026-03-08', department: 'Cardiologie', room: 'CARD-05', bed: 'B1', doctorId: 'd1', doctorName: 'Dr. Amara Kone', reason: 'Douleurs thoraciques', diagnosis: 'Angine de poitrine stable', status: 'discharged' },
] */

export const invoices: Invoice[] = [];
/* [
  {
    id: 'inv1', invoiceNumber: 'FAC-2026-0001', patientId: 'p2', patientName: 'Ibrahima Bah', admissionId: 'adm1',
    date: '2026-04-10', dueDate: '2026-04-30',
    items: [
      { id: 'i1', description: 'Frais d\'admission', quantity: 1, unitPrice: 50000, total: 50000 },
      { id: 'i2', description: 'Chambre (10 jours)', quantity: 10, unitPrice: 25000, total: 250000 },
      { id: 'i3', description: 'Consultation chirurgien', quantity: 2, unitPrice: 75000, total: 150000 },
      { id: 'i4', description: 'Examens biologiques', quantity: 1, unitPrice: 45000, total: 45000 },
    ],
    subtotal: 495000, discount: 0, tax: 0, total: 495000, paid: 200000, status: 'partial', paymentMethod: 'insurance',
  },
  {
    id: 'inv2', invoiceNumber: 'FAC-2026-0002', patientId: 'p5', patientName: 'Mariama Sylla', admissionId: 'adm3',
    date: '2026-04-16', dueDate: '2026-04-26',
    items: [
      { id: 'i5', description: 'Consultation urgences', quantity: 1, unitPrice: 35000, total: 35000 },
      { id: 'i6', description: 'Radiologie (scanner)', quantity: 1, unitPrice: 80000, total: 80000 },
      { id: 'i7', description: 'Médicaments', quantity: 1, unitPrice: 25000, total: 25000 },
      { id: 'i8', description: 'Chambre (1 nuit)', quantity: 1, unitPrice: 25000, total: 25000 },
    ],
    subtotal: 165000, discount: 0, tax: 0, total: 165000, paid: 165000, status: 'paid', paymentMethod: 'cash',
  },
  {
    id: 'inv3', invoiceNumber: 'FAC-2026-0003', patientId: 'p1', patientName: 'Aminata Diallo',
    date: '2026-04-17', dueDate: '2026-05-07',
    items: [
      { id: 'i9', description: 'Consultation cardiologie', quantity: 1, unitPrice: 60000, total: 60000 },
      { id: 'i10', description: 'ECG', quantity: 1, unitPrice: 30000, total: 30000 },
    ],
    subtotal: 90000, discount: 0, tax: 0, total: 90000, paid: 0, status: 'pending',
  },
  {
    id: 'inv4', invoiceNumber: 'FAC-2026-0004', patientId: 'p4', patientName: 'Mamadou Kouyaté',
    date: '2026-03-20', dueDate: '2026-04-10',
    items: [
      { id: 'i11', description: 'Consultation médecine interne', quantity: 1, unitPrice: 50000, total: 50000 },
      { id: 'i12', description: 'Bilan sanguin complet', quantity: 1, unitPrice: 40000, total: 40000 },
      { id: 'i13', description: 'Médicaments', quantity: 1, unitPrice: 35000, total: 35000 },
    ],
    subtotal: 125000, discount: 0, tax: 0, total: 125000, paid: 0, status: 'overdue',
  },
  {
    id: 'inv5', invoiceNumber: 'FAC-2026-0005', patientId: 'p6', patientName: 'Souleymane Toure', admissionId: 'adm2',
    date: '2026-04-12', dueDate: '2026-05-02',
    items: [
      { id: 'i14', description: 'Frais d\'admission', quantity: 1, unitPrice: 50000, total: 50000 },
      { id: 'i15', description: 'Chambre (10 jours)', quantity: 10, unitPrice: 20000, total: 200000 },
      { id: 'i16', description: 'Insuline et fournitures', quantity: 1, unitPrice: 85000, total: 85000 },
    ],
    subtotal: 335000, discount: 25000, tax: 0, total: 310000, paid: 0, status: 'pending',
  },
] */
