export default function clearForm(){
  // Details
  setAddress("");
  setLocation("");
  setContactPerson("");
  setContactNo("");

  // Equipment
  setEquipmentTypeId(null);
  setEquipmentId("");
  setMcSerialNo("");
  setHourMeter("");
  setIsAutoSerialNo(false);

  // Services
  setServices(getDefaultServices());

  // Checklist
  setChecklist((prev) =>
    prev.map((item) => ({
      ...item,
      check: false,
      remarks: "",
    }))
  );

  // Images
  setImages([]);

  // Remarks
  setRemarks("");

  // Signatures & Acceptance
  setServiceTechnician("");
  setTechnicianSignature("");
  setAcceptedBy("");
  setAcceptedbySignature("");
  setNRIC("");
  setContractorName("");

  // Dates (optional reset)
  const today = new Date().toISOString().split("T")[0];
  setDate(today);
  setHireDate(today);
};