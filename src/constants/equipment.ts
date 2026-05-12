// constants/equipment.ts

export const EQUIPMENT_TYPES = {
  FORKLIFT: "11",
  AP: "3",
} as const;

export type EquipmentType =
  (typeof EQUIPMENT_TYPES)[keyof typeof EQUIPMENT_TYPES];