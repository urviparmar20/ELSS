export const CHECKLIST_GENERAL = [
  { label: "Engine & Cooling System", key: "engine_cooling" },
  { label: "Belting & Battery", key: "belting_battery" },
  { label: "Brake System/Parking Brake", key: "brake_parking_brake" },
  { label: "Front & Rear Tyre Condition", key: "front_rear_tyre" },
  { label: "Transmission System", key: "transmission" },
  { label: "Hydraulic System", key: "hydraulic" },
  { label: "Electrical System", key: "electrical" },
  { label: "Lights Revolving/Head/Signal", key: "lights_revolving_head_signal" },
  { label: "Horn/Buzzer/Alarm", key: "horn_buzzer_alarm" },
  { label: "Emergency Switch", key: "emergency_switch" },
];

export const CHECKLIST_FORKLIFT_LOADER = [
  { label: "Mast Assembly & Bearing", key: "mast_assembly" },
  { label: "Front & Rear Axle", key: "front_rear_axle" },
  { label: "King/Pin Bushing", key: "king_pin_bushing" },
  { label: "Wheel Hub, Bearing/Rim/Nut", key: "wheel_hub_bearing" },
  { label: "Forward/Reverse Lever", key: "forward_reverse" },
  { label: "Power Steering/Belt", key: "power_steering_belt" },
  { label: "Clutch Inching/Pedal Play", key: "clutch_inching" },
  { label: "Lift Chain/Hoses", key: "lift_chain" },
  { label: "Lifting/Tilt/Side Cylinders", key: "lifting_tilt" },
  { label: "Side/Rear Mirror", key: "side_rear_mirror" },
];

export const CHECKLIST_AERIAL_PLATFORM = [
  { label: "Foot Switch", key: "foot_switch" },
  { label: "Basket Assy./Safety Guard", key: "basket_assy_safety" },
  { label: "Boom Assy./Catrac Assy.", key: "boom_assy_catrac" },
  { label: "Cylinder & Boom Pin Assy.", key: "cylinder_boom" },
  { label: "Boom Raise Controller", key: "boom_raise" },
  { label: "Swing Controller", key: "swing_controller" },
  { label: "Extension/Retraction Controller", key: "extension_retraction" },
  { label: "Rotating Controller", key: "rotation_controller" },
  { label: "Driver/Steering Controller", key: "driver_steering" },
  { label: "Wheel Hub/Outrigger Assy.", key: "wheel_hub_outrigger" },
];

export const DEFAULT_PARTS_LUBRICANTS = {
  engineAirFilterPri: "",
  engineAirFilterSec: "",
  compressorAirFilterPri: "",
  compressorAirFilterSec: "",
  oilFilterPri: "",
  oilFilterSec: "",
  compressorOilFilterPri: "",
  fuelFilter: "",
  racorFilter: "",
  hydraulicFilter: "",
  waterFilter: "",
  engineOil: "",
  compressorOil: "",
  hydraulicOil: "",
  transmissionOil: "",
  otherPartsSupplied: "",
};
