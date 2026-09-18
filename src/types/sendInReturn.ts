
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


export interface SendInReturnStoreParams {
  token: string;
  userId: string;
  isReturn?: boolean;
  sendInId: string;
  equipmentType?: string;
  equipmentId?: string;
  brand: string;
  modelNo: string;
  serialNo?: string;
  hourMeter: string;
  date: string;
  time: string;
  checklist?: any[];
  images?: RNFile[];
  complaints: string;

  //Send In
  sendInBy?: string;
  signatureSendInBy?: RNFile;
  checkedReceivedBy?:string;
  signatureCheckedReceivedBy?: RNFile;

  //Return
  checkedAcceptedBy?:string;
  signatureCheckedAcceptedBy?: RNFile;
  mechanic?: string;
  signatureMechanic?: RNFile;
  foreman?: string;
  signatureForeman?: RNFile;
}


// ----------------------
// Validation types
// ----------------------

export type ValidateFormParams = {

  isSendIn: boolean;

  equipmentType: string;
  equipmentId: string;
 
   //Send In
   sendIn?: string;
   signatureSendInBy?: string;
   checkedReceivedBy?: string;
   signatureCheckedReceivedBy?: string;
 
   //Return
   checkedAcceptedBy?: string;
   signatureCheckedAcceptedBy?: string;
   mechanic?: string;
   signatureMechanic?: string;
   foreman?: string;
   signatureForeman?: string;
};


export interface SendInReturnRecord {
  inspection_id: string; // sendin/return id
  equipment_type: string;
  status: string | number;
  equipment_id: string;
  brand: string;
  modelNo: string;
  serial_no: string;
  hourMeter: string;
  date: string;
  time: string;
  send_in: any;
  is_return: string;
  return: any;
}