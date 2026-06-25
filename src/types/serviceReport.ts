export type ServiceReportMode = "submit" | "draft";

export type RNFile = {
  uri: string;
  name: string;
  type: string;
};

export type RNImageFile = RNFile & {
  size?: number;
};

export interface ServiceReportStoreParams {
  token: string;
  report_id: number;
  user_id: number;
  company_name: string;
  company_address: string;
  job_no: string;
  hr_meter: string;
  equipment_type: string;
  equipment_id: string;
  serial_no: string;
  mc: string;
  date_list: string[]; // date1..4
  time_list: {
    start: string[]; // start_time1..4
    end: string[];   // end_time1..4
  };
  operation_check_list: {
    general_list: Record<string, boolean>;
    forklift_list: Record<string, boolean>;
    aerial_platform_list: Record<string, boolean>;
  };
  servicing_parts_lubricants_list: Record<string, string>;
  other_parts_supplied_list: string[];
  description_status_list: {
    checking: boolean;
    servicing: boolean;
    repair: boolean;
  };
  description: string;
  signature_technician?: RNFile;
  signature_client?: RNFile;
  filled_date: string;
  is_chargable: string;
  client_name: string;
  client_tel_no: string;
  images?: RNFile[];
}

export interface ServiceTime {
  date: string;
  startTime: string;
  endTime: string;
}

export interface PartsLubricants {
  engineAirFilterPri: string;
  engineAirFilterSec: string;
  compressorAirFilterPri: string;
  compressorAirFilterSec: string;
  oilFilterPri: string;
  oilFilterSec: string;
  compressorOilFilterPri: string;
  fuelFilter: string;
  racorFilter: string;
  hydraulicFilter: string;
  waterFilter: string;
  engineOil: string;
  compressorOil: string;
  hydraulicOil: string;
  transmissionOil: string;
}

// ----------------------
// Validation types
// ----------------------

export type ValidateFormParams = {
  mode: ServiceReportMode;

  companyId: string | null;
  address: string;
  mcSerialNo: string;
  hourMeter: string;
  jobNo: string;

  equipmentTypeId: string | null;
  equipmentId: string;

  clientName: string;
  clientContactNo: string;

  serviceTimes: ServiceTime[];

  checklist: Record<string, boolean>;

  checking: boolean;
  servicing: boolean;
  repair: boolean;

  remarks: string;

  technicianSignature: string;
  clientSignature: string;

  completionDate: string;

  isChargeable: boolean | null;

  images?: RNImageFile[];

};

export interface ServiceReportRecord {
  raw: any;
  id: string;
  companyId: string;
  companyName: string;
  email: string;
  mcSerialNo: string;
  hourMeter: string;
  jobNo: string;
  address: string;
  contactPerson: string;
  contactNo: string;
  equipmentTypeId: string;
  equipmentTypeName: string;
  equipmentId: string;
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
  serviceDepartment: string;
  completionDate: string;
  images: string[];
  isChargeable: boolean | null;
  status: "pending" | "completed" | "overdue" | "draft" | "submit";
  createdAt: string;
  srID: string;
}