
import { ServiceReportStoreParams } from "../api/storeServiceReport";

/**
 * Convert a local image URI to an object suitable for React Native FormData:
 * { uri, name, type }
 */
export const uriToFileObject = async (uri: string, defaultName = "photo.jpg") => {
  // If already a server URL, we won't attempt to fetch it
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    // The server-side image is not uploaded again — return a dummy object or skip as needed.
    // Here we return the URI as-is so the backend can ignore or handle remote URLs.
    return { uri, name: defaultName, type: "image/jpeg" };
  }

  // For data URI (base64)
  if (uri.startsWith("data:")) {
    // Convert base64 data url to blob
    const res = await fetch(uri);
    const blob = await res.blob();
    const ext = blob.type.split("/")[1] || "jpg";
    const name = `file.${ext}`;
    return { uri, name, type: blob.type, blob };
  }

  // For file:// or content:// URIs and normal expo image URIs
  // We will attempt to guess mime type by extension
  const matchExt = uri.match(/\.(\w+)(\?.*)?$/);
  const ext = matchExt ? matchExt[1].toLowerCase() : "jpg";
  let mime = "image/jpeg";
  if (ext === "png") mime = "image/png";
  if (ext === "heic") mime = "image/heic";
  // RN FormData usage expects { uri, name, type }
  const name = `photo.${ext}`;
  return { uri, name, type: mime };
};

/**
 * Build the full payload object expected by storeServiceReportApi.
 * - reportData: the local JS object produced by your form (buildReportData)
 * - token/user_id are provided by the hook, so we don't include them here.
 */
export const buildServiceReportPayload = async (opts: {
  reportData: any;
  report_id?: number;
  filled_date?: string;
  is_chargable?: string; // "Y" | "N"
}) => {
  const { reportData, report_id = 0, filled_date = "", is_chargable = "N" } = opts;

  // Map checklist labels to backend keys (adjust if backend uses different keys)
  const generalKeys = [
    "engine_cooling",
    "belting_battery",
    "brake_parking_brake",
    "front_rear_tyre",
    "transmission",
    "hydraulic",
    "electrical",
    "lights_revolving_head_signal",
    "horn_buzzer_alarm",
    "emergency_switch",
  ];
  const forkliftKeys = [
    "mast_assembly",
    "front_rear_axle",
    "king_pin_bushing",
    "wheel_hub_bearing",
    "forward_reverse",
    "power_steering_belt",
    "clutch_inching",
    "lift_chain",
    "lifting_tilt",
    "side_rear_mirror",
  ];
  const aerialKeys = [
    "foot_switch",
    "basket_assy_safety",
    "boom_assy_catrac",
    "cylinder_boom",
    "boom_raise",
    "swing_controller",
    "extension_retraction",
    "rotation_controller",
    "driver_steering",
    "wheel_hub_outrigger",
  ];

  // Build operation_check_list groups by mapping the CHECKLIST_* label arrays to keys above.
  // reportData.checklist uses label -> boolean; find by label in arrays.
  const mapByLabelsToKeys = (labelsArr: string[], keysArr: string[]) => {
    const out: Record<string, boolean> = {};
    labelsArr.forEach((label, idx) => {
      const key = keysArr[idx] ?? `key_${idx}`;
      out[key] = !!reportData.checklist?.[label];
    });
    return out;
  };

  // We assume the order of labels in your UI arrays matches these mapped keys.
  const operation_check_list = {
    general_list: mapByLabelsToKeys(
      // labels used in UI - must align with CHECKLIST_GENERAL in component
      [
        "Engine & Cooling System",
        "Belting & Battery",
        "Brake System/Parking Brake",
        "Front & Rear Tyre Condition",
        "Transmission System",
        "Hydraulic System",
        "Electrical System",
        "Lights Revolving/Head/Signal",
        "Horn/Buzzer/Alarm",
        "Emergency Switch",
      ],
      generalKeys
    ),
    forklift_list: mapByLabelsToKeys(
      [
        "Mast Assembly & Bearing",
        "Front & Rear Axle",
        "King/Pin Bushing",
        "Wheel Hub, Bearing/Rim/Nut",
        "Forward/Reverse Lever",
        "Power Steering/Belt",
        "Clutch Inching/Pedal Play",
        "Lift Chain/Hoses",
        "Lifting/Tilt/Side Cylinders",
        "Side/Rear Mirror",
      ],
      forkliftKeys
    ),
    aerial_platform_list: mapByLabelsToKeys(
      [
        "Foot Switch",
        "Basket Assy./Safety Guard",
        "Boom Assy./Catrac Assy.",
        "Cylinder & Boom Pin Assy.",
        "Boom Raise Controller",
        "Swing Controller",
        "Extension/Retraction Controller",
        "Rotating Controller",
        "Driver/Steering Controller",
        "Wheel Hub/Outrigger Assy.",
      ],
      aerialKeys
    ),
  };

  // servicing parts: map keys you used in your form to backend expected keys
  const servicing_parts_lubricants_list: Record<string, string> = {
    engine_air_filter_pri: reportData.servicing_parts_lubricants_list.engineAirFilter || "",
    engine_air_filter_sec: "", // if you have second field adjust
    compressor_air_filter_pri: reportData.servicing_parts_lubricants_list.compressorAirFilter || "",
    compressor_air_filter_sec: "",
    oil_filter_pri: reportData.servicing_parts_lubricants_list.oilFilter || "",
    oil_filter_sec: "",
    compressor_oil_filter: reportData.servicing_parts_lubricants_list.compressorOilFilter || "",
    fuel_filter: reportData.servicing_parts_lubricants_list.fuelFilter || "",
    racor_filter: reportData.servicing_parts_lubricants_list.racorFilter || "",
    hydraulic_filter: reportData.servicing_parts_lubricants_list.hydraulicFilter || "",
    water_filter: reportData.servicing_parts_lubricants_list.waterFilter || "",
    engine_oil: reportData.servicing_parts_lubricants_list.engineOil || "",
    compressor_oil: reportData.servicing_parts_lubricants_list.compressorOil || "",
    hydraulic_oil: reportData.servicing_parts_lubricants_list.hydraulicOil || "",
    transmission_oil: "",
  };

  // other parts supplied array
  const other_parts_supplied_list = reportData.servicing_parts_lubricants_list.otherPartsSupplied
    ? [reportData.servicing_parts_lubricants_list.otherPartsSupplied]
    : [];

  // description_status_list
  const description_status_list = {
    checking: !!reportData.weeklyChecking,
    servicing: !!reportData.monthlyServicing,
    repair: false,
  };

  // Convert image URIs to RN FormData file objects (not actual Blob conversion — the RN axios adapter accepts { uri, name, type })
  const imagesFiles: any[] = [];
  if (Array.isArray(reportData.images)) {
    for (let i = 0; i < reportData.images.length; i++) {
      const uri = reportData.images[i];
      // choose name by index
      const name = `image_${Date.now()}_${i}.jpg`;
      const fileObj = await uriToFileObject(uri, name);
      imagesFiles.push(fileObj);
    }
  }

  // Signatures (may be dataURI or file URI)
  let technicianSign: any = null;
  let clientSign: any = null;
  if (reportData.technicianSignature) {
    technicianSign = await uriToFileObject(reportData.technicianSignature, `tech_sign_${Date.now()}.jpg`);
  }
  if (reportData.supervisorSignature) {
    clientSign = await uriToFileObject(reportData.supervisorSignature, `client_sign_${Date.now()}.jpg`);
  }

  const payload: Partial<ServiceReportStoreParams> & { images: any[] } = {
    report_id: report_id || 0,
    user_id: 0, // will be filled by hook
    company_name: reportData.companyName || "",
    company_address: reportData.address || "",
    job_no: reportData.jobNo || "",
    hr_meter: reportData.hourMeter || "",
    equipment_type: reportData.equipmentTypeName || "",
    equipment_id: reportData.equipmentId || "",
    serial_no: reportData.mcSerialNo || reportData.serialNo || "",
    mc: reportData.mc || reportData.mcSerialNo || "",
    date_list: (reportData.serviceTimes || []).map((st: any) => st.date).slice(0, 4),
    time_list: {
      start: (reportData.serviceTimes || []).map((st: any) => st.startTime).slice(0, 4),
      end: (reportData.serviceTimes || []).map((st: any) => st.endTime).slice(0, 4),
    },
    operation_check_list,
    servicing_parts_lubricants_list,
    other_parts_supplied_list,
    description_status_list,
    description: reportData.remarks || "",
    technicianSign,
    clientSign,
    filled_date,
    is_chargable: is_chargable,
    client_name: reportData.clientName || "",
    client_tel_no: reportData.clientContactNo || "",
    images: imagesFiles,
  };

  return payload;
};
