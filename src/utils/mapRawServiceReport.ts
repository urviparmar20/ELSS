// /src/utils/mapRawServiceReport.ts

export function mapRawServiceReport(raw: any) {
  if (!raw) return null;

  return {
    // ---------- BASIC INFO ----------
    companyId: "", // map later if needed
    companyName: raw.company_name || "",
    address: raw.company_address || "",
    contactPerson: "",
    contactNo: "",
    equipmentTypeName: raw.equipment_type || "",
    mcSerialNo: raw.serial_no || "",
    hourMeter: raw.hr_meter || "",
    jobNo: raw.job_no || "",
    equipmentTypeId: "",
    equipmentId: raw.equipment_id || "",
    serviceDepartment: "",
    clientName: raw.client_name || "",
    clientContactNo: raw.client_tel_no || "",

    serviceTechnicianName: raw.technician || "",

    // ---------- DATE + TIME ----------
    serviceTimes: extractServiceTimes(raw),

    // ---------- SERVICE STATUS ----------
    weeklyChecking: parseBool(raw.description_status_list?.checking),
    monthlyServicing: parseBool(raw.description_status_list?.servicing),
    halfYearlyServicing: false, // backend does not provide this
    yearlyServicing: false,

    washing: raw.washing === "Y",
    cleaning: raw.cleaning === "Y",

    remarks: raw.description || "",

    // ---------- CHECKLIST ----------
    checklist: {
      ...(raw.operation_check_list?.general_list || {}),
      ...(raw.operation_check_list?.forklift_list || {}),
      ...(raw.operation_check_list?.aerial_platform_list || {}),
    },

    // ---------- PARTS / LUBRICANTS ----------
    partsLubricants: {
      engineAirFilter: raw.servicing_parts_lubricants_list?.engine_air_filter_pri || "",
      compressorAirFilter: raw.servicing_parts_lubricants_list?.compressor_air_filter_pri || "",
      oilFilter: raw.servicing_parts_lubricants_list?.oil_filter_pri || "",
      compressorOilFilter: raw.servicing_parts_lubricants_list?.compressor_oil_filter || "",
      racorFilter: raw.servicing_parts_lubricants_list?.racor_filter || "",
      waterFilter: raw.servicing_parts_lubricants_list?.water_filter || "",
      compressorOil: raw.servicing_parts_lubricants_list?.compressor_oil || "",
      engineOil: raw.servicing_parts_lubricants_list?.engine_oil || "",
      fuelFilter: raw.servicing_parts_lubricants_list?.fuel_filter || "",
      otherPartsSupplied: (raw.other_parts_supplied_list || []).join(", "),
    },

    // ---------- CHARGEABLE / DATE ----------
    isChargeable: raw.is_chargable === "Y",
    completionDate: convertDMYtoDate(raw.filled_date),
  };
}

/* ---------------------------------------------------
   Helper: Convert DD-MM-YYYY → YYYY-MM-DD 
--------------------------------------------------- */
function convertDMYtoDate(dmy?: string): Date {
  if (!dmy) return new Date();
  const [d, m, y] = dmy.split("-");
  const fullYear = y.length === 2 ? "20" + y : y;
  return new Date(Number(fullYear), Number(m) - 1, Number(d));
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
    const start = times[`start_time${i}`];
    const end = times[`end_time${i}`];

    if (date || start || end) {
      list.push({
        date: date ? convertDMYtoDate(date) : new Date().toISOString().split("T")[0],
        startTime: start || "09:00",
        endTime: end || "17:00",
      });
    }
  }

  return list.length > 0 ? list : [];
}
