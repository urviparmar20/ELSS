import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { Card } from "../components/Card";
import { CustomButton } from "../components/CustomButton";
import { FormInput } from "../components/FormInput";
import { FormDropdown } from "../components/FormDropdown";
import { FormCheckbox } from "../components/FormCheckbox";
import { FormDatePicker } from "../components/FormDatePicker";
import { SignatureBox } from "../components/SignatureBox";
import { KeyboardAwareScrollViewCompat } from "../components/KeyboardAwareScrollViewCompat";
import { useTheme } from "../hooks/useTheme";
// import { useAuth } from "@/contexts/AuthContext";
import { useData, ServiceTime, PartsLubricants } from "../contexts/DataContext";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import type { MaintenanceStackParamList } from "../navigation/MaintenanceStackNavigator";
import { useCompanies } from '../hooks/useCompanies';
import { useEquipmentTypeList } from "../hooks/useEquipmentType";
import { useEquipmentListByType } from "../hooks/useEquipmentListByType";
import { useGeneralChecklist } from "../hooks/useGeneralChecklist";

type MaintenanceFormRouteProp = RouteProp<MaintenanceStackParamList, "MaintenanceForm">;
type MaintenanceNavigationProp = NativeStackNavigationProp<MaintenanceStackParamList>;

const DEFAULT_PARTS_LUBRICANTS: PartsLubricants = {
  engineAirFilter: "",
  compressorAirFilter: "",
  oilFilter: "",
  compressorOilFilter: "",
  racorFilter: "",
  waterFilter: "",
  compressorOil: "",
  engineOil: "",
  fuelFilter: "",
  otherPartsSupplied: "",
};

export default function MaintenanceFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MaintenanceNavigationProp>();
  const route = useRoute<MaintenanceFormRouteProp>();
  const { maintenanceRecords} = useData();
  const colors = Colors.light;

  const isEditing = !!route.params?.id;
  const existingRecord = isEditing ? maintenanceRecords.find((r) => r.id === route.params.id) : null;

  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<
  { id: string; name: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{ id: string; name: string }[]>([]);

  const [companyId, setCompanyId] = useState(existingRecord?.companyId || "");
  const [mcSerialNo, setMcSerialNo] = useState(existingRecord?.mcSerialNo || "");
  const [hourMeter, setHourMeter] = useState(existingRecord?.hourMeter || "");
  const [jobNo, setJobNo] = useState(existingRecord?.jobNo || "");
  const [address, setAddress] = useState(existingRecord?.address || "");
  const [contactPerson, setContactPerson] = useState(existingRecord?.contactPerson || "");
  const [contactNo, setContactNo] = useState(existingRecord?.contactNo || "");
  const [email, setEmail] = useState(existingRecord?.email || "");

  const [equipmentTypeId, setEquipmentTypeId] = useState(existingRecord?.equipmentTypeId || "");
  const [equipmentId, setEquipmentId] = useState(existingRecord?.equipmentId || "");
  const [clientName, setClientName] = useState(existingRecord?.clientName || "");
  const [clientContactNo, setClientContactNo] = useState(existingRecord?.clientContactNo || "");
  const [otp, setOTP] = useState("");
  const [serviceTechnicianName, setServiceTechnicianName] = useState(existingRecord?.serviceTechnicianName  || "");
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(existingRecord?.serviceTimes || [{ date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "17:00" }]);
  const [weeklyChecking, setWeeklyChecking] = useState(existingRecord?.weeklyChecking || false);
  const [monthlyServicing, setMonthlyServicing] = useState(existingRecord?.monthlyServicing || false);
  const [halfYearlyServicing, setHalfYearlyServicing] = useState(existingRecord?.halfYearlyServicing || false);
  const [yearlyServicing, setYearlyServicing] = useState(existingRecord?.yearlyServicing || false);
  const [washing, setWashing] = useState(existingRecord?.washing || false);
  const [cleaning, setCleaning] = useState(existingRecord?.cleaning || false);
  const [remarks, setRemarks] = useState(existingRecord?.remarks || "");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(existingRecord?.checklist || {});
  const [partsLubricants, setPartsLubricants] = useState<PartsLubricants>(existingRecord?.partsLubricants || DEFAULT_PARTS_LUBRICANTS);
  const [technicianSignature, setTechnicianSignature] = useState(existingRecord?.technicianSignature || "");
  const [supervisorSignature, setSupervisorSignature] = useState(existingRecord?.supervisorSignature || "");
  const [serviceDepartment, setServiceDepartment] = useState(existingRecord?.serviceDepartment || "Field Service");
  const [completionDate, setCompletionDate] = useState(existingRecord?.completionDate || new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: companyData, error } = useCompanies();
  const { data: eqTypeData } = useEquipmentTypeList();
  const { data: equipmentListData } = useEquipmentListByType(equipmentTypeId);
  const { data: checklistData } = useGeneralChecklist(equipmentTypeId);

  useEffect(() => {
    
      const company = companyData?.data?.company;
      // Company dropdown
      if (!companyOptions.length && company?.company_names && company?.ids) {
        const companies = company.company_names.map((name: string, index: number) => ({
          id: String(company.ids[index]),
          name,
        }));

        setCompanyOptions(companies);
      }
  
    // Equipment type dropdown (using index pair mapping)
    const equipmentTypeList = eqTypeData?.data?.equipmentTypeList;
    if (equipmentTypeList?.ids && equipmentTypeList?.types) {
      const eqTypes = equipmentTypeList.ids.map(
        (id: number, index: number) => ({
          id: String(id),
          name: equipmentTypeList.types[index],
        })
      );

      setEquipmentTypeOptions(eqTypes);
    }
  }, [companyData, eqTypeData]);  


  
  //Equipment ID
  useEffect(() => {
    
    if (equipmentListData?.data?.equipmentList.equip_id) {
      const formatted = equipmentListData.data.equipmentList.equip_id.map((equipId: string) => ({
        id: equipId,          
        name: equipId,       
      }));
  
      setEquipmentOptions(formatted);
    } else {
      setEquipmentOptions([]); 
    }
  }, [equipmentListData]);
  
  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? "Edit Maintenance" : "New Maintenance",
    });
  }, [isEditing, navigation]);


  // Checklist change
  const handleChecklistChange = (item: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [item]: checked }));
  };


   // Select/Deselect All
   const handleSelectAllChecklist = () => {
    if (!checklistData?.data) return;
  
    const allItems = Object.values(checklistData.data).flat() as string[];
    const allChecked = allItems.every((item) => checklist[item]);
  
    // Toggle all
    const newChecklist: Record<string, boolean> = {};
    allItems.forEach((item) => {
      newChecklist[item] = !allChecked;
    });
  
    setChecklist(newChecklist);
  };

  const handleGenerateOTP = () => {

  }

  const isAllChecklistSelected = checklistData?.data
  ? (Object.values(checklistData.data).flat() as string[]).every(item => checklist[item])
  : false;

  const addServiceTime = () => {
    setServiceTimes((prev) => [...prev, { date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "17:00" }]);
  };

  const removeServiceTime = (index: number) => {
    if (serviceTimes.length > 1) {
      setServiceTimes((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateServiceTime = (index: number, field: keyof ServiceTime, value: string) => {
    setServiceTimes((prev) => prev.map((time, i) => (i === index ? { ...time, [field]: value } : time)));
  };

  const updatePartsLubricants = (field: keyof PartsLubricants, value: string) => {
    setPartsLubricants((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!companyId) {
      Alert.alert("Validation Error", "Please select a company");
      return;
    }
    if (!mcSerialNo) {
      Alert.alert("Validation Error", "Please enter M/C or Serial No");
      return;
    }

    setIsLoading(true);
    try {
  

      const recordData = {
        companyId,
        companyName: "",
        email: "",
        mcSerialNo,
        hourMeter,
        jobNo,
        address,
        contactPerson,
        contactNo,
        equipmentTypeId,
        equipmentTypeName: "",
        equipmentId,
        equipmentName: "",
        clientName,
        clientContactNo,
        serviceTechnicianName,
        serviceTimes,
        weeklyChecking,
        monthlyServicing,
        halfYearlyServicing,
        yearlyServicing,
        washing,
        cleaning,
        remarks,
        checklist,
        partsSuppliedText: "",
        partsLubricants,
        technicianSignature,
        supervisorSignature,
        serviceDepartment,
        completionDate,
        images: [],
        status: "pending" as const,
      };
    } catch (error) {
      Alert.alert("Error", "Failed to save record");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Company Details</ThemedText>
          {/* Company */}
          <FormDropdown
            label="Company *"
            placeholder="Select company"
            options={companyOptions}
            selectedValue={companyId}
            onValueChange={setCompanyId}
          />

          <FormInput label="Address" placeholder="Enter address" value={address} onChangeText={setAddress} multiline />
          <FormInput label="Contact Person" placeholder="Enter contact person" value={contactPerson} onChangeText={setContactPerson} />
          <FormInput label="Contact No" placeholder="Enter contact number" value={contactNo} onChangeText={setContactNo} keyboardType="phone-pad" />
          <FormInput label="Email" placeholder="Enter email" value={email} onChangeText={setEmail} />
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Equipment Details</ThemedText>
          <FormInput label="M/C or Serial No *" placeholder="Enter serial number" value={mcSerialNo} onChangeText={setMcSerialNo} />
          <FormInput label="Hour Meter" placeholder="Enter hour meter reading" value={hourMeter} onChangeText={setHourMeter} keyboardType="numeric" />
          <FormInput label="Job No" placeholder="Enter job number" value={jobNo} onChangeText={setJobNo} />
          
          {/* Equipment Type */}
          <FormDropdown
            label="Equipment Type"
            placeholder="Select equipment type"
            options={equipmentTypeOptions}    
            selectedValue={equipmentTypeId}
            onValueChange={(v) => {
              setEquipmentTypeId(v);
              setEquipmentId("");
            }}
          />
          {/*Equipment ID */}
          {equipmentTypeId && (
            <FormDropdown
              label="Equipment ID"
              placeholder="Select equipment"
              options={equipmentOptions}
              selectedValue={equipmentId}
              onValueChange={setEquipmentId}
            />
          )}
          <FormInput label="Client Name" placeholder="Enter client name" value={clientName} onChangeText={setClientName} />
          <FormInput label="Client Contact No" placeholder="Enter client contact" value={clientContactNo} onChangeText={setClientContactNo} keyboardType="phone-pad" />
          <View style={styles.timeRow}>
            <View style={styles.serviceTimeField}>
              <FormInput label="Enter OTP" placeholder="Enter OTP" value={otp} onChangeText={setOTP} keyboardType="phone-pad" />
            </View>
            <View style={styles.serviceTimeField}>
              <CustomButton 
                onPress={handleGenerateOTP} 
                disabled={isLoading} 
                style={[styles.submitButton, { backgroundColor: colors.primary, marginTop:30 }]}
              >
                Generate OTP
              </CustomButton>
            </View>
          </View>       
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Service Details</ThemedText>
          <FormInput label="Service Technician Name" placeholder="Enter technician name" value={serviceTechnicianName} onChangeText={setServiceTechnicianName} />
          
          <ThemedText type="small" style={styles.label}>Service Times</ThemedText>
         
          {serviceTimes.map((time, index) => (
            <View key={index}  style={[styles.serviceTimeCard, { borderColor: colors.inputBorder }]}>
              {/* Delete button */}
              {serviceTimes.length > 1 && (
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => removeServiceTime(index)}
                >
                  <Feather name="trash-2" size={16} color={colors.buttonText} />
                </Pressable>
              )}

              {/* Date picker */}
              <FormDatePicker
                label="Date"
                value={time.date}
                onChange={(v) => updateServiceTime(index, "date", v)}
              />

              {/* Start & End times in row */}
              <View style={styles.timeRow}>
                <View style={styles.serviceTimeField}>
                  <FormInput label="Start" placeholder="HH:MM" value={time.startTime} onChangeText={(v) => updateServiceTime(index, "startTime", v)} />
                </View>
                <View style={styles.serviceTimeField}>
                  <FormInput label="End" placeholder="HH:MM" value={time.endTime} onChangeText={(v) => updateServiceTime(index, "endTime", v)} />
                </View>
              </View>
            </View>
          ))}
          {serviceTimes.length < 4 && (
            <Pressable style={[styles.addButton, { borderColor: colors.primary }]} onPress={addServiceTime}>
              <Feather name="plus" size={16} color={colors.primary} />
              <ThemedText type="small" style={{ color: colors.primary, marginLeft: Spacing.xs }}>Add Service Time</ThemedText>
            </Pressable>
          )}

          <ThemedText type="small" style={[styles.label, { marginTop: Spacing.lg }]}>Service Type</ThemedText>
          <FormCheckbox label="Weekly Checking" checked={weeklyChecking} onChange={setWeeklyChecking} />
          <FormCheckbox label="Monthly Servicing" checked={monthlyServicing} onChange={setMonthlyServicing} />
          <FormCheckbox label="Half Yearly Servicing" checked={halfYearlyServicing} onChange={setHalfYearlyServicing} />
          <FormCheckbox label="Yearly Servicing" checked={yearlyServicing} onChange={setYearlyServicing} />
          <FormCheckbox label="Washing" checked={washing} onChange={setWashing} />
          <FormCheckbox label="Cleaning" checked={cleaning} onChange={setCleaning} />
        </Card>

        <Card elevation={1} style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4" style={styles.sectionTitle}>Operation Checklist</ThemedText>
            <Pressable style={[styles.selectAllButton, { backgroundColor: colors.primary + "15" }]} onPress={handleSelectAllChecklist}>
              <Feather name={isAllChecklistSelected ? "check-square" : "square"} size={16} color={colors.primary} />
              <ThemedText type="small" style={{ color: colors.primary, marginLeft: Spacing.xs }}>
                {isAllChecklistSelected ? "Deselect All" : "Select All"}
              </ThemedText>
            </Pressable>
          </View>
          {checklistData?.data && Object.entries(checklistData.data).map(([category, items]) => {
            const itemList = items as string[]; // cast unknown to string[]
            return (
              <View key={category} style={{ marginBottom: Spacing.md }}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.sm }}>
                  {category.replace(/_/g, " ").toUpperCase()}
                </ThemedText>
                {itemList.map((item, index) => (
                  <FormCheckbox
                    key={`${category}-${index}`}
                    label={`${index + 1}. ${item.replace(/_/g, " ")}`}
                    checked={checklist[item] || false}
                    onChange={(checked) => handleChecklistChange(item, checked)}
                  />
                ))}
              </View>
            );
          })}
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Parts & Lubricants Supplied</ThemedText>
          <FormInput label="Engine Air Filter" placeholder="Enter quantity/details" value={partsLubricants.engineAirFilter} onChangeText={(v) => updatePartsLubricants("engineAirFilter", v)} />
          <FormInput label="Compressor Air Filter" placeholder="Enter quantity/details" value={partsLubricants.compressorAirFilter} onChangeText={(v) => updatePartsLubricants("compressorAirFilter", v)} />
          <FormInput label="Oil Filter" placeholder="Enter quantity/details" value={partsLubricants.oilFilter} onChangeText={(v) => updatePartsLubricants("oilFilter", v)} />
          <FormInput label="Compressor Oil Filter" placeholder="Enter quantity/details" value={partsLubricants.compressorOilFilter} onChangeText={(v) => updatePartsLubricants("compressorOilFilter", v)} />
          <FormInput label="Racor Filter" placeholder="Enter quantity/details" value={partsLubricants.racorFilter} onChangeText={(v) => updatePartsLubricants("racorFilter", v)} />
          <FormInput label="Water Filter" placeholder="Enter quantity/details" value={partsLubricants.waterFilter} onChangeText={(v) => updatePartsLubricants("waterFilter", v)} />
          <FormInput label="Compressor Oil" placeholder="Enter quantity/details" value={partsLubricants.compressorOil} onChangeText={(v) => updatePartsLubricants("compressorOil", v)} />
          <FormInput label="Engine Oil" placeholder="Enter quantity/details" value={partsLubricants.engineOil} onChangeText={(v) => updatePartsLubricants("engineOil", v)} />
          <FormInput label="Fuel Filter" placeholder="Enter quantity/details" value={partsLubricants.fuelFilter} onChangeText={(v) => updatePartsLubricants("fuelFilter", v)} />
          <FormInput label="Other Parts Supplied" placeholder="Enter other parts and details" value={partsLubricants.otherPartsSupplied} onChangeText={(v) => updatePartsLubricants("otherPartsSupplied", v)} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} />
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Remarks</ThemedText>
          <FormInput label="Remarks/Description" placeholder="Enter any remarks or description" value={remarks} onChangeText={setRemarks} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} />
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Signatures & Completion</ThemedText>
          <SignatureBox label="Service Technician Signature" value={technicianSignature} onChange={setTechnicianSignature} />
          <SignatureBox label="KSS Supervisor Signature" value={supervisorSignature} onChange={setSupervisorSignature} />
          <FormInput label="Service Department" placeholder="Enter department" value={serviceDepartment} onChangeText={setServiceDepartment} />
          <FormDatePicker label="Completion Date" value={completionDate} onChange={setCompletionDate} />
        </Card>

        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 100 }]}>
          <CustomButton 
            onPress={handleSubmit} 
            disabled={isLoading} 
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
          >
            {isEditing ? "Update Record" : "Submit Record"}
          </CustomButton>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg },
  sectionTitle: { marginBottom: 0 },
  label: { fontWeight: "500", marginBottom: Spacing.sm },
  serviceTimeField: { flex: 1 },
  serviceTimeCard: {
    position: "relative",
    backgroundColor: "#fff",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'gray',
  },
  
  deleteButton: {
    position: "absolute",
    top: -Spacing.md,
    right: -Spacing.md,
    width: 30,
    height: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'red',
    zIndex: 10,
  },
  
  timeRow: {
    flexDirection: "row",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  
  timeField: {
    flex: 1,
  },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: Spacing.md, borderWidth: 1, borderRadius: BorderRadius.sm, borderStyle: "dashed" },
  selectAllButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  buttonContainer: { marginTop: Spacing.lg },
  submitButton: {},
});
