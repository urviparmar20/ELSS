import { ValidateFormParams } from "../types/sendInReturn";


export const validateForm = (params: ValidateFormParams): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const {
    isSendIn,
    equipmentType,
    equipmentId,
    //Send In
    sendIn,
    signatureSendInBy,
    checkedReceivedBy,
    signatureCheckedReceivedBy,
  
    //Return
    checkedAcceptedBy,
    signatureCheckedAcceptedBy,
    mechanic,
    signatureMechanic,
    foreman,
    signatureForeman,
    
  } = params;


  // ---- COMMON ----

  if (!equipmentType) errors.push("Equipment type is required");
  if (!equipmentId) errors.push("Equipment ID is required");

  if (isSendIn) {
    if (!sendIn)
      errors.push("Send In By name is required");

    if (!signatureSendInBy)
      errors.push("Please take Send In By Signature");

    if (!checkedReceivedBy)
      errors.push("Checked and Received By name is required");

    if (!signatureCheckedReceivedBy)
      errors.push("Please take Checked and Received Signature");
  } else {
    if (!checkedAcceptedBy)
      errors.push("Checked and Accepted By name is required");

    if (!signatureCheckedAcceptedBy)
      errors.push("Please take Checked and Accepted By Signature");

    if (!mechanic)
      errors.push("Mechanic name is required");

    if (!signatureMechanic)
      errors.push("Please take Mechanic Signature");

    if (!foreman)
      errors.push("Foreman name is required");

    if (!signatureForeman)
      errors.push("Please take Foreman Signature");
  }

  return { valid: errors.length === 0, errors };
};
