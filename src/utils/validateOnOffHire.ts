import { ValidateFormParams } from "../types/onOffHire";


export const validateForm = (params: ValidateFormParams): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const {
    companyId,
    address,
    location,
    contactPerson,
    contactNo,
    date,
    equipmentType,
    equipmentId,
    mcSerialNo,
    hourMeter,
    remarks,
    technician,
    signatureTechnician,
    acceptedBy,
    signatureAcceptedBy,
    hireDate,
    contractorName,
  } = params;

  const phone = contactNo.trim();

  // ---- COMMON ----
  if (!companyId) errors.push("Company is required");
  if (!address) errors.push("Address is required");
  if (!location) errors.push("Location is required");
  if (!contactPerson) errors.push("Contact Person is required");
  if (!contactNo) errors.push("Contact Number is required");
  // must be digits only
  if (phone && !/^\d+$/.test(phone)) {
    errors.push("Contact number must contain only digits");
  }
  
  // length must be 8–10
  if (phone && (phone.length < 8 || phone.length > 10)) {
    errors.push("Contact number must be between 8 and 10 digits");
  }
  if (!date) errors.push("Date is required");

  if (!equipmentType) errors.push("Equipment type is required");
  if (!equipmentId) errors.push("Equipment ID is required");
  if (!mcSerialNo.trim()) errors.push("M/C or Serial No is required");
  if (!hourMeter) errors.push("Hour Meter is required");
  
  if (!remarks) errors.push("Remarks is required");

  if (!technician) errors.push("Technician name is required");
  if (!signatureTechnician) errors.push("Please take Technician Signature");
  if (!acceptedBy) errors.push("Accepted By name is required");
  if (!signatureAcceptedBy) errors.push("Please take Accepted By Signature");
  
  if (!hireDate) errors.push("Date is required");

  if (!contractorName) errors.push("Contractor Name is required");


  return { valid: errors.length === 0, errors };
};
