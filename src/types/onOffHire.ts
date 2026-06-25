
export type RNFile = {
  uri: string;
  name: string;
  type: string;
};

export type ChecklistItemProps = {
  item: string;
  index: number;
  checked: boolean;
  onChange: () => void;
  readOnly?: boolean;
}


export interface OnOffHireStoreParams {
  token: string;
  userId: string;
  onOffId: number;
  company_name: string;
  address: string;
  location: string;
  contactPerson: string;
  contactNo: string;
  date: string;

  equipmentType: string;
  equipmentId: string;
  mcSerialNo: string;
  hourMeter: string;

  services?: Record<string, boolean>;
  checklist?: any[];
  images?: RNFile[];
  remarks: string;

  technician: string;
  signatureTechnician?: RNFile;
  acceptedBy:string;
  signatureAcceptedBy?: RNFile;
  hireDate: string;
  nricWpPs: string;
  contractorName: string;
}


// ----------------------
// Validation types
// ----------------------

export type ValidateFormParams = {

  companyId: string | null;
  address: string;
  location: string;
  contactPerson: string;
  contactNo: string;
  date: string;

  equipmentType: string;
  equipmentId: string;
  mcSerialNo: string;
  hourMeter: string;

  remarks: string;

  technician: string;
  signatureTechnician?: string;
  acceptedBy:string;
  signatureAcceptedBy?: string;
  hireDate: string;
  contractorName: string;
};


export interface OnOffHireRecord {
  id: number;
  company_name: string | null;
  company_address: string;
  location: string;
  contact_person: string;
  contact_number: string;
  date: string;

  equipment_type: string;
  equipment_id: string;
  serial_no: string;
  hr_meter: string;

  condition_list?: string[];
  job_list?: any[];
  images?: RNFile[];
  job_descriptions: string;

  on_hire_technician: string;
  on_hire_signature_technician?: RNFile;
  on_hire_accepted_by:string;
  on_hire_signature_accepted_by?: RNFile;
  on_hire_date: string;
  nric_wp_ps: string;
  on_hire_contractor_name: string;
}