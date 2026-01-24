export function mapRawGM(raw: any) {
  if (!raw) return null;

  return {
    // ---------- BASIC INFO ----------
    companyId: null,
    companyName: raw.company_name || "",
    address: raw.company_address || "",
    email: raw.email || "",
    contactPerson: raw.company_name,
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
    checklist: flattenChecklist(raw.operation_check_list),

    serviceTechnicianName: raw.technician || "",
    services: raw.services || "",

    // ---------- DATE + TIME ----------
    serviceTimes: extractServiceTimes(raw),

    remarks: raw.remarks || "",

    // ---------- PARTS / LUBRICANTS ----------
    partsLubricants: {
      engineAirFilter: raw.servicing_parts_lubricants_list?.engine_air_filter || "",
      engineOilFilter: raw.servicing_parts_lubricants_list?.engine_oil_filter || "",
      engineFuelFilter: raw.servicing_parts_lubricants_list?.engine_fule_filter || "",
      preFilter: raw.servicing_parts_lubricants_list?.pre_filter || "",
      waterFilter: raw.servicing_parts_lubricants_list?.water_filter || "",
      hydraulicFilter: raw.servicing_parts_lubricants_list?.hydraulic_filter || "",
      engineOil: raw.servicing_parts_lubricants_list?.engine_oil || "",
      hydraulicOil: raw.servicing_parts_lubricants_list?.hydraulic_oil || "",
      gearOil: raw.servicing_parts_lubricants_list?.gear_oil || "",
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
  operationChecklist: Record<string, Record<string, boolean>> = {}
) {
  const flat: Record<string, boolean> = {};

  Object.values(operationChecklist).forEach(category => {
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

