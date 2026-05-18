import { ValidateFormParams } from "../types/maintenance";

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
    contactPerson,
    contactNo,
    mcSerialNo,
    hourMeter,
    jobNo,
    equipmentTypeId,
    equipmentId,
    clientName,
    clientContactNo,
    serviceTimes,
    remarks,
    technicianSignature,
    supervisorSignature,
    serviceDepartment,
    // services
  } = params;

  // const checklistValues = Object.values(params.checklist || {});
  const phone = clientContactNo.trim();

  // ---- COMMON ----
  if (!companyId) errors.push("Company is required");
  if (!address) errors.push("Address is required");
  if (!contactPerson) errors.push("Contact Person is required");
  if (!contactNo) errors.push("Contact Number is required");
  if (!mcSerialNo.trim()) errors.push("M/C or Serial No is required");
  if (!hourMeter) errors.push("Hour Meter is required");
  if (!jobNo) errors.push("Job Number is required");

  if (!equipmentTypeId) errors.push("Equipment type is required");
  if (!equipmentId) errors.push("Equipment ID is required");
  if (!clientName.trim()) errors.push("Client name is required");
  if (!phone) errors.push("Client contact number is required");
  

  // must be digits only
  if (phone && !/^\d+$/.test(phone)) {
    errors.push("Client contact number must contain only digits");
  }
  
  // length must be 8–10
  if (phone && (phone.length < 8 || phone.length > 10)) {
    errors.push("Client contact number must be between 8 and 10 digits");
  }

  // --------------------
  // SERVICES (Weekly / Monthly / etc.)
  // --------------------
  
  // if (!services || services.length === 0) {
  //   errors.push("Select at least one service");
  // }
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
  if (!remarks) errors.push("Remarks is required");

  // if (!checklistValues.some((v) => v === true)) {
  //   errors.push("At least one operation checklist item must be selected");
  // }
  

  if (!technicianSignature) errors.push("Please take Technician Signature");
  if (!supervisorSignature) errors.push("Please take KSS Supervisor Signature");
  if (!serviceDepartment) errors.push("Service Department is required");


  return { valid: errors.length === 0, errors };
};
