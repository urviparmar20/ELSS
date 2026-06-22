export function mapRawGM(raw: any) {
  if (!raw) return null;

  // console.log('raw',raw);
  
  return {
    // ---------- BASIC INFO ----------
    companyId: null,
    companyName: raw.company_name || "",
    address: raw.company_address || "",
    email: raw.email || "",
    contactPerson: raw.contact_person || "",
    contactNo: raw.contact_number,
    equipmentTypeName: raw.equipment_type || "",
    equipmentName: raw.equipment || "",
    mcSerialNo: raw.mc || "",
    hourMeter: raw.hr_meter || "",
    jobNo: raw.job_no || "",
    equipmentTypeId: raw.equipment_type_id || "",
    equipmentId: String(raw.equipment ?? ""),
    serviceDepartment: raw.service_department || "",
    clientName: raw.client_name || "",
    clientContactNo: raw.client_tel_no || "",
    signature_supervisor: raw.signature_supervisor || "",
    signature_technician: raw.signature_technician || "",
    foreman: raw.foreman || "",
    checklist: flattenChecklist(raw.operation_check_list) || "",
    frequency: raw.frequency || "",
    v2_checklist_data: raw.v2_checklist_data || [],

    serviceTechnicianName: raw.technician || "",
    services: raw.services || "",
    checklist_version: raw.checklist_version || "",
    gm_id: raw.gm_id || "",
    images: (raw.images || []).map((url: string, index: number) => ({
      uri: url,
      name: `existing_${index}.jpg`,
      type: "image/jpeg",
      isExisting: true,   // mark as existing
    })),
    

    // ---------- DATE + TIME ----------
    serviceTimes: extractServiceTimes(raw),

    remarks: raw.remarks || "",

    // ---------- PARTS / LUBRICANTS ----------
    partsLubricants: {
      engineAirFilter: raw.servicing_parts_lubricants_list?.engine_air_filter || raw.servicing_parts_lubricants_list?.engineAirFilter || "",
      engineOilFilter: raw.servicing_parts_lubricants_list?.engine_oil_filter || raw.servicing_parts_lubricants_list?.engineOilFilter || "",
      engineFuelFilter: raw.servicing_parts_lubricants_list?.engine_fule_filter || raw.servicing_parts_lubricants_list?.engineFuelFilter ||  "",
      preFilter: raw.servicing_parts_lubricants_list?.pre_filter || raw.servicing_parts_lubricants_list?.preFilter ||  "",
      waterFilter: raw.servicing_parts_lubricants_list?.water_filter || raw.servicing_parts_lubricants_list?.waterFilter || "",
      hydraulicFilter: raw.servicing_parts_lubricants_list?.hydraulic_filter || raw.servicing_parts_lubricants_list?.hydraulicFilter || "",
      engineOil: raw.servicing_parts_lubricants_list?.engine_oil || raw.servicing_parts_lubricants_list?.engineOil || "",
      hydraulicOil: raw.servicing_parts_lubricants_list?.hydraulic_oil || raw.servicing_parts_lubricants_list?.hydraulicOil || "",
      gearOil: raw.servicing_parts_lubricants_list?.gear_oil || raw.servicing_parts_lubricants_list?.gearOil || "",
    },
    otherPartsSupplied: raw.other_parts_supplied_list || "",



    // ----------  DATE ----------
    // completionDate: raw.current_date
    //   ? new Date(raw.current_date)
    //   : new Date(),

    completionDate: raw.current_date
    ? parseBackendDate(raw.current_date)
    : "",
  

  };
}

function flattenChecklist(
  operationChecklist?: Record<string, Record<string, boolean>> | null
) {
  if (!operationChecklist || typeof operationChecklist !== "object") {
    return {};
  }

  const flat: Record<string, boolean> = {};

  Object.values(operationChecklist).forEach((category) => {
    if (!category || typeof category !== "object") return;

    Object.entries(category).forEach(([key, value]) => {
      flat[key] = Boolean(value);
    });
  });

  return flat;
}

function parseBackendDate(dateStr: string) {
  // YYYY-MM-DD (ISO, safe)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr; // keep as string (BEST)
  }

  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
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

