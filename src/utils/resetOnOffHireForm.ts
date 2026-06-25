export const resetOnOffHireForm = ({
  setAddress,
  setLocation,
  setEquipmentTypeId,
  setEquipmentId,
  setMcSerialNo,
  setHourMeter,
  setIsAutoSerialNo,
  setServices,
  getDefaultServices,
  setChecklist,
  setImages,
  setRemarks,
  setServiceTechnician,
  setTechnicianSignature,
  setAcceptedBy,
  setAcceptedbySignature,
  setNRIC,
  setContractorName,
  setDate,
  setHireDate,
}: any) => {
  setAddress("");
  setLocation("");

  setEquipmentTypeId(null);
  setEquipmentId("");
  setMcSerialNo("");
  setHourMeter("");
  setIsAutoSerialNo(false);

  setServices(getDefaultServices());

  setChecklist((prev: any[]) =>
    prev.map((item) => ({
      ...item,
      check: false,
      remarks: "",
    }))
  );

  setImages([]);

  setRemarks("");

  setServiceTechnician("");
  setTechnicianSignature("");
  setAcceptedBy("");
  setAcceptedbySignature("");
  setNRIC("");
  setContractorName("");

  const today = new Date().toISOString().split("T")[0];
  setDate(today);
  setHireDate(today);
};