import { ValidateFormParams, ValidationResult } from "../types/serviceReport";

// Helper to convert HH:MM to minutes
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};


export const validateForm = (params: ValidateFormParams): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const {
    companyId,
    address,
    mcSerialNo,
    hourMeter,
    jobNo,
    equipmentTypeId,
    equipmentId,
    clientName,
    clientContactNo,
    serviceTimes,
    checklist,
    checking,
    servicing,
    repair,
    remarks,
    technicianSignature,
    clientSignature,
    completionDate,
    isChargeable
    
  } = params;

  const checklistValues = Object.values(params.checklist || {});

  // ---- COMMON ----
  if (!companyId) errors.push("Company is required");
  if (!address) errors.push("Address is required");
  if (!mcSerialNo.trim()) errors.push("M/C or Serial No is required");
  if (!hourMeter) errors.push("Hour Meter is required");
  if (!jobNo) errors.push("Job Number is required");

  if (!equipmentTypeId) errors.push("Equipment type is required");
  if (!equipmentId) errors.push("Equipment ID is required");
  if (!clientName.trim()) errors.push("Client name is required");
  if (!clientContactNo.trim()) errors.push("Client contact number is required");
  // ---- Service Times (up to 4) ----
  // const ordinals = ["First", "Second", "Third", "Fourth"];

  // for (let i = 0; i < 4; i++) {
  //   const prefix = ordinals[i];
  //   const t = serviceTimes[i] || { date: "", startTime: "", endTime: "" }; // default empty

  //   if (!t.date) errors.push(`Select ${prefix} Date`);
  //   if (!t.startTime) errors.push(`Select ${prefix} Start Time`);
  //   if (!t.endTime) errors.push(`Select ${prefix} End Time`);
  //   if (t.startTime && t.endTime && timeToMinutes(t.endTime) <= timeToMinutes(t.startTime)) {
  //     errors.push(`${prefix} service: End time must be later than start time`);
  //   }
  // }

  if (!checklistValues.some((v) => v === true)) {
    errors.push("At least one operation checklist item must be selected");
  }
  // ---- Images ----
  // if (params.images?.length) {
  //   if (params.images.length > 4) {
  //     errors.push("Maximum 4 images are allowed");
  //   }

  //   params.images.forEach((img, index) => {
  //     if (img.size && img.size > 3 * 1024 * 1024) {
  //       const sizeMB = (img.size / (1024 * 1024)).toFixed(2);
  //       errors.push(`Image ${index + 1} is ${sizeMB} MB. Maximum allowed size is 3 MB.`);
  //     }
  //   });
    
  // }
  // ---- Service Type ----
  if (!checking && !servicing && !repair) {
    errors.push("Select at least one service type");
  }
  if (!remarks) errors.push("Remarks is required");

  if (!technicianSignature) errors.push("Technician signature is required");
  if (!clientSignature) errors.push("Client signature is required");
  if (isChargeable === null) {
    errors.push("Select service is Chargeable or Not");
  }
  

  return { valid: errors.length === 0, errors };
};
