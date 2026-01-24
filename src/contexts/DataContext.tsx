import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ServiceTime {
  date: string;
  startTime: string;
  endTime: string;
}

export interface PartsLubricants {
  engineAirFilterPri: string;
  engineAirFilterSec: string;
  compressorAirFilterPri: string;
  compressorAirFilterSec: string;
  oilFilterPri: string;
  oilFilterSec: string;
  compressorOilFilterPri: string;
  fuelFilter: string;
  racorFilter: string;
  hydraulicFilter: string;
  waterFilter: string;
  engineOil: string;
  compressorOil: string;
  hydraulicOil: string;
  transmissionOil: string;
  otherPartsSupplied: string;
}

export interface MaintenanceRecord {
  id: string;
  companyId: string;
  company_name: string;
  email: string;
  mc: string;
  hourMeter: string;
  jobNo: string;
  address: string;
  contactPerson: string;
  contactNo: string;
  equipmentTypeId: string;
  equipmentTypeName: string;
  equipmentId: string;
  equipmentName: string;
  clientName: string;
  clientContactNo: string;
  serviceTechnicianName: string;
  serviceTimes: ServiceTime[];
  weeklyChecking: boolean;
  monthlyServicing: boolean;
  halfYearlyServicing: boolean;
  yearlyServicing: boolean;
  washing: boolean;
  cleaning: boolean;
  remarks: string;
  checklist: Record<string, boolean>;
  partsSuppliedText: string;
  partsLubricants: PartsLubricants;
  technicianSignature: string;
  supervisorSignature: string;
  serviceDepartment: string;
  completionDate: string;
  images: string[];
  isChargeable: boolean | null;
  status: "pending" | "completed" | "overdue" | "draft" | "submit";
  createdAt: string;
}

export interface ServiceReport extends MaintenanceRecord {}

export interface Company {
  id: string;
  name: string;
}

export interface EquipmentType {
  id: string;
  name: string;
}

export interface Equipment {
  id: string;
  equipmentTypeId: string;
  equipmentId: string;
  name: string;
}

interface DataContextType {
  companies: Company[];
  equipmentTypes: EquipmentType[];
  equipment: Equipment[];
  maintenanceRecords: MaintenanceRecord[];
  serviceReports: ServiceReport[];
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, "id" | "createdAt">) => MaintenanceRecord;
  updateMaintenanceRecord: (id: string, record: Partial<MaintenanceRecord>) => boolean;
  deleteMaintenanceRecord: (id: string) => boolean;
  addServiceReport: (report: Omit<ServiceReport, "id" | "createdAt">) => ServiceReport;
  updateServiceReport: (id: string, report: Partial<ServiceReport>) => boolean;
  deleteServiceReport: (id: string) => boolean;
  getEquipmentByType: (typeId: string) => Equipment[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const MOCK_COMPANIES: Company[] = [
  { id: "1", name: "ABC Construction Sdn Bhd" },
  { id: "2", name: "XYZ Engineering Works" },
  { id: "3", name: "Prime Industrial Solutions" },
  { id: "4", name: "Global Heavy Equipment" },
  { id: "5", name: "Southeast Machinery Co" },
];

const MOCK_EQUIPMENT_TYPES: EquipmentType[] = [
  { id: "1", name: "Excavator" },
  { id: "2", name: "Forklift" },
  { id: "3", name: "Crane" },
  { id: "4", name: "Bulldozer" },
  { id: "5", name: "Loader" },
  { id: "6", name: "Generator" },
];

const MOCK_EQUIPMENT: Equipment[] = [
  { id: "1", equipmentTypeId: "1", equipmentId: "EXC-001", name: "CAT 320D Excavator" },
  { id: "2", equipmentTypeId: "1", equipmentId: "EXC-002", name: "Komatsu PC200 Excavator" },
  { id: "3", equipmentTypeId: "2", equipmentId: "FRK-001", name: "Toyota 8FD25 Forklift" },
  { id: "4", equipmentTypeId: "2", equipmentId: "FRK-002", name: "Hyster H50FT Forklift" },
  { id: "5", equipmentTypeId: "3", equipmentId: "CRN-001", name: "Liebherr LTM 1050 Crane" },
  { id: "6", equipmentTypeId: "4", equipmentId: "BLD-001", name: "CAT D6 Bulldozer" },
  { id: "7", equipmentTypeId: "5", equipmentId: "LDR-001", name: "Volvo L120H Loader" },
  { id: "8", equipmentTypeId: "6", equipmentId: "GEN-001", name: "Cummins 500kVA Generator" },
];

const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: "m1",
    companyId: "1",
    companyName: "ABC Construction Sdn Bhd",
    email: "ops@abcconstruction.com",
    mcSerialNo: "MC-2024-001",
    hourMeter: "4521",
    jobNo: "JOB-001",
    address: "Lot 123, Jalan Industri, Shah Alam",
    contactPerson: "Ahmad bin Hassan",
    contactNo: "+60 12-345 6789",
    equipmentTypeId: "1",
    equipmentTypeName: "Excavator",
    equipmentId: "1",
    equipmentName: "CAT 320D Excavator",
    clientName: "ABC Construction",
    clientContactNo: "+60 3-1234 5678",
    serviceTechnicianName: "John Smith",
    serviceTimes: [{ date: "2024-12-05", startTime: "09:00", endTime: "12:00" }],
    weeklyChecking: true,
    monthlyServicing: false,
    halfYearlyServicing: false,
    yearlyServicing: false,
    washing: true,
    cleaning: true,
    remarks: "Regular weekly maintenance completed",
    checklist: { "Checklist 1": true, "Checklist 2": true, "Checklist 3": true },
    partsSuppliedText: "Engine Air Filter, Engine Oil",
    partsLubricants: { 
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
      otherPartsSupplied: "" 
    },
    technicianSignature: "",
    supervisorSignature: "",
    serviceDepartment: "Field Service",
    completionDate: "2024-12-05",
    images: [],
    isChargeable: true,
    status: "completed",
    createdAt: "2024-12-05T09:00:00Z",
  },
  {
    id: "m2",
    companyId: "2",
    companyName: "XYZ Engineering Works",
    email: "service@xyzeng.com",
    mcSerialNo: "MC-2024-002",
    hourMeter: "2150",
    jobNo: "JOB-002",
    address: "No 45, Industrial Park, Penang",
    contactPerson: "Lee Wei Ming",
    contactNo: "+60 14-567 8901",
    equipmentTypeId: "2",
    equipmentTypeName: "Forklift",
    equipmentId: "3",
    equipmentName: "Toyota 8FD25 Forklift",
    clientName: "XYZ Engineering",
    clientContactNo: "+60 4-2345 6789",
    serviceTechnicianName: "John Smith",
    serviceTimes: [{ date: "2024-12-08", startTime: "14:00", endTime: "17:00" }],
    weeklyChecking: false,
    monthlyServicing: true,
    halfYearlyServicing: false,
    yearlyServicing: false,
    washing: false,
    cleaning: true,
    remarks: "Monthly service due",
    checklist: {},
    partsSuppliedText: "",
    partsLubricants: { engineAirFilterPri: "",
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
    transmissionOil: "", otherPartsSupplied: "" },
    technicianSignature: "",
    supervisorSignature: "",
    serviceDepartment: "Field Service",
    completionDate: "",
    images: [],
    isChargeable: null,
    status: "pending",
    createdAt: "2024-12-06T10:00:00Z",
  },
];

const INITIAL_SERVICE_REPORTS: ServiceReport[] = [
  {
    id: "s1",
    companyId: "3",
    companyName: "Prime Industrial Solutions",
    email: "maintenance@primeindustrial.com",
    mcSerialNo: "SR-2024-001",
    hourMeter: "8900",
    jobNo: "SVC-001",
    address: "Block A, Industrial Zone, Johor Bahru",
    contactPerson: "Tan Ah Kow",
    contactNo: "+60 17-890 1234",
    equipmentTypeId: "3",
    equipmentTypeName: "Crane",
    equipmentId: "5",
    equipmentName: "Liebherr LTM 1050 Crane",
    clientName: "Prime Industrial",
    clientContactNo: "+60 7-3456 7890",
    serviceTechnicianName: "John Smith",
    serviceTimes: [{ date: "2024-12-04", startTime: "08:00", endTime: "16:00" }],
    weeklyChecking: false,
    monthlyServicing: false,
    halfYearlyServicing: true,
    yearlyServicing: false,
    washing: true,
    cleaning: true,
    remarks: "Half-yearly comprehensive service completed",
    checklist: { "Checklist 1": true, "Checklist 2": true, "Checklist 3": true, "Checklist 4": true, "Checklist 5": true },
    partsSuppliedText: "Hydraulic Filter, Hydraulic Oil, Engine Oil Filter",
    partsLubricants: { engineAirFilterPri: "",
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
    transmissionOil: "", otherPartsSupplied: "Hydraulic Filter" },
    technicianSignature: "",
    supervisorSignature: "",
    serviceDepartment: "Heavy Equipment",
    completionDate: "2024-12-04",
    images: [],
    isChargeable: false,
    status: "completed",
    createdAt: "2024-12-04T08:00:00Z",
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [companies] = useState<Company[]>(MOCK_COMPANIES);
  const [equipmentTypes] = useState<EquipmentType[]>(MOCK_EQUIPMENT_TYPES);
  const [equipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [serviceReports, setServiceReports] = useState<ServiceReport[]>(INITIAL_SERVICE_REPORTS);

  const getEquipmentByType = (typeId: string): Equipment[] => {
    return equipment.filter((e) => e.equipmentTypeId === typeId);
  };

  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, "id" | "createdAt">): MaintenanceRecord => {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `m${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMaintenanceRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateMaintenanceRecord = (id: string, record: Partial<MaintenanceRecord>): boolean => {
    setMaintenanceRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...record } : r))
    );
    return true;
  };

  const deleteMaintenanceRecord = (id: string): boolean => {
    setMaintenanceRecords((prev) => prev.filter((r) => r.id !== id));
    return true;
  };

  const addServiceReport = (report: Omit<ServiceReport, "id" | "createdAt">): ServiceReport => {
    const newReport: ServiceReport = {
      ...report,
      id: `s${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setServiceReports((prev) => [newReport, ...prev]);
    return newReport;
  };

  const updateServiceReport = (id: string, report: Partial<ServiceReport>): boolean => {
    setServiceReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...report } : r))
    );
    return true;
  };

  const deleteServiceReport = (id: string): boolean => {
    setServiceReports((prev) => prev.filter((r) => r.id !== id));
    return true;
  };

  return (
    <DataContext.Provider
      value={{
        companies,
        equipmentTypes,
        equipment,
        maintenanceRecords,
        serviceReports,
        addMaintenanceRecord,
        updateMaintenanceRecord,
        deleteMaintenanceRecord,
        addServiceReport,
        updateServiceReport,
        deleteServiceReport,
        getEquipmentByType,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
