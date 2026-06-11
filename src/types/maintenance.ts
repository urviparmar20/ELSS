
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


export interface GMStoreParams {
  token: string;
  maintenance_id: number;
  company_name: string;
  email: string;
  address: string;
  contact_person: string;
  contact_no: string;
  equipment_type: string;
  equipment_id: string;
  job_no: string;
  hr_meter: string;
  serial_no: string;
  mc: string;
  remarks: string;
  services?: string[];
  technician: string;
  client_name: string;
  client_tel_no: string;
  service_technician: string;
  date_list: string[]; // date1..4
  time_list: {
    start: string[]; // start_time1..4
    end: string[];   // end_time1..4
  };
  job_descriptions: string;
  servicing_parts_lubricants_list: Record<string, string>;
  other_parts_supplied_list: string,
  signature_technician?: RNFile;
  signature_supervisor?: RNFile;
  foreman: string;
  service_department: string;
  current_date: string,
  operation_check_list?: Record<string, boolean>,
  checklist?: any[];
  is_otp_verified: string,
  is_pending: string,
  frequency: string | undefined,
  images?: RNFile[];
}

export interface ServiceTime {
  date: string;
  startTime: string;
  endTime: string;
}

export interface PartsLubricants {
  engineAirFilter: string;
  engineOilFilter: string;
  engineFuelFilter: string;
  preFilter: string;
  waterFilter: string;
  hydraulicFilter: string;
  engineOil: string;
  hydraulicOil: string;
  gearOil: string;
}

// ----------------------
// Validation types
// ----------------------

export type ValidateFormParams = {
  companyId: string | null;
  address: string;
  contactPerson: string;
  contactNo: string;
  mcSerialNo: string;
  hourMeter: string;
  jobNo: string;
  equipmentTypeId: string | null;
  equipmentId: string;
  clientName: string;
  clientContactNo: string;
  serviceTimes: ServiceTime[];
  // checklist: Record<string, boolean>;
  remarks: string;
  technicianSignature: string;
  supervisorSignature: string;
  foreman: string;
  serviceDepartment: string;
  // services: string[];
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export interface MaintenanceRecord {
  id: string;
  companyId: string;
  company_name: string;
  email: string;
  mcSerialNo: string;
  hourMeter: string;
  jobNo: string;
  address: string;
  contactPerson: string;
  contactNo: string;
  equipmentTypeId: string;
  equipment_type: string;
  equipment: string;
  equipmentName: string;
  clientName: string;
  clientContactNo: string;
  serviceTechnicianName: string;
  serviceTimes: ServiceTime[];
  weeklyChecking: boolean;
  monthlyServicing: boolean;
  halfYearlyServicing: boolean;
  yearlyServicing: boolean;
  washing: boolean;
  cleaning: boolean;
  remarks: string;
  checklist: Record<string, boolean>;
  partsSuppliedText: string;
  partsLubricants: PartsLubricants;
  technicianSignature: string;
  supervisorSignature: string;
  foreman: string;
  serviceDepartment: string;
  completionDate: string;
  images: string[];
  isChargeable: boolean | null;
  current_date: string;
  is_pending: "Y" | "N";
  frequency: string;
  gm_id: string;
  checklist_version: number;
}