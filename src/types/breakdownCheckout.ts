export type ChecklistItemProps = {
  item: string;
  index: number;
  checked: boolean;
  onChange: () => void;
  readOnly?: boolean;
}


export interface BDCStoreParams {
  token: string;
  bk_id: string;
  user_id: string;
  bdc_id: number;
  equipmentTypeId: string;
  equipment_type: string;
  equipment_id: string;
  equipmentName: string;
  location: string;
  replace_parts: string;
  complied: string;
  login_time: string;
  logout_time: string;
  status: string;
  ch_date: string;
  end_date: string | null;
  breakdown_date: string | null;
  parts: string;
  no_of_men: string;
  remarks: string;
}

// ----------------------
// Validation types
// ----------------------

export type ValidateFormParams = {
  equipmentTypeId: string | null;
  equipmentId: string;
  location: string;
  status: string;
  startDate: string;
  loginTime: string;
  logoutTime: string;
};

export interface BDCRecord {
  id: string;
  
  equipmentTypeId: string;
  equipment_type: string;
  equipment: string;
  equipmentName: string;
  location: string;
  replace_parts: string;
  complied: string;
  login_time: string;
  logout_time: string;
  status: string;
  ch_date: string;
  end_date: string;
  breakdown_date: string;
  parts: string;
  no_of_men: string;
  remarks: string;
}