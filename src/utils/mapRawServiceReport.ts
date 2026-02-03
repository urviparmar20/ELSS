export function mapRawServiceReport(raw: any) {
  if (!raw) return null;

  return {
    // ---------- BASIC INFO ----------
    companyId: null, // map later if needed
    companyName: raw.company_name || "",
    address: raw.company_address || "",
    contactPerson: "",
    contactNo: "",
    equipmentTypeName: raw.equipment_type || "",
    equipmentName: raw.equipment || "",
    mcSerialNo: raw.serial_no || "",
    hourMeter: raw.hr_meter || "",
    jobNo: raw.job_no || "",
    equipmentTypeId: null,
    equipmentId: String(raw.equipment_id ?? ""),
    serviceDepartment: "",
    clientName: raw.client_name || "",
    clientContactNo: raw.client_tel_no || "",
    signature_client: raw.signature_client || "",
    signature_technician: raw.signature_technician || "",

    serviceTechnicianName: raw.technician || "",

    // ---------- DATE + TIME ----------
    serviceTimes: extractServiceTimes(raw),

    // ---------- SERVICE STATUS ----------
    checking: parseBool(raw.description_status_list?.checking),
    servicing: parseBool(raw.description_status_list?.servicing),
    repair: parseBool(raw.description_status_list?.repair),

    remarks: raw.description || "",

    // ---------- CHECKLIST ----------
    checklist: {
      ...(raw.operation_check_list?.general_list || {}),
      ...(raw.operation_check_list?.forklift_list || {}),
      ...(raw.operation_check_list?.aerial_platform_list || {}),
    },

    // ---------- PARTS / LUBRICANTS ----------
    partsLubricants: {
      engineAirFilterPri: raw.servicing_parts_lubricants_list?.engineAirFilterPri || "",
      engineAirFilterSec: raw.servicing_parts_lubricants_list?.engineAirFilterSec || "",
      compressorAirFilterPri: raw.servicing_parts_lubricants_list?.compressorAirFilterPri || "",
      compressorAirFilterSec: raw.servicing_parts_lubricants_list?.compressorAirFilterSec || "",
      oilFilterPri: raw.servicing_parts_lubricants_list?.oilFilterPri || "",
      oilFilterSec: raw.servicing_parts_lubricants_list?.oilFilterSec || "",
      compressorOilFilterPri: raw.servicing_parts_lubricants_list?.compressorOilFilterPri || "",
      fuelFilter: raw.servicing_parts_lubricants_list?.fuelFilter || "",
      racorFilter: raw.servicing_parts_lubricants_list?.racorFilter || "",
      hydraulicFilter: raw.servicing_parts_lubricants_list?.hydraulicFilter || "",
      waterFilter: raw.servicing_parts_lubricants_list?.waterFilter || "",
      engineOil: raw.servicing_parts_lubricants_list?.engineOil || "",
      compressorOil: raw.servicing_parts_lubricants_list?.compressorOil || "",
      hydraulicOil: raw.servicing_parts_lubricants_list?.hydraulicOil || "",
      transmissionOil: raw.servicing_parts_lubricants_list?.transmissionOil || "",

      otherPartsSupplied: (raw.other_parts_supplied_list || []).join(", "),
    },

    images: (raw.images || []).map((url: string, index: number) => ({
      uri: url,
      name: `existing_${index}.jpg`,
      type: "image/jpeg",
      isExisting: true,   // mark as existing
    })),

    // ---------- CHARGEABLE / DATE ----------
    isChargeable: raw.is_chargable === "Y",
    completionDate: raw.filled_date
      ? new Date(raw.filled_date)
      : new Date(),
  };
}

/* ---------------------------------------------------
   Helper: Convert backend booleans
--------------------------------------------------- */
function parseBool(val: any) {
  return val === true || val === "true" || val === 1 || val === "1" || val === "Y";
}

/* ---------------------------------------------------
   Helper: Extract service date/time arrays
--------------------------------------------------- */
function extractServiceTimes(raw: any) {
  const dates = raw.date_list || {};
  const times = raw.time_list || {};

  const list = [];

  for (let i = 1; i <= 4; i++) {
    const date = dates[`date${i}`];

    if (date) {
      list.push({
        date, // ✅ KEEP STRING "YYYY-MM-DD"
        startTime: times[`start_time${i}`] || "09:00",
        endTime: times[`end_time${i}`] || "17:00",
      });
    }
  }

  return list;
}

