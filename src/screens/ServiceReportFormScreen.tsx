// src/screens/ServiceReportFormScreen.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable, Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import Toast from "react-native-toast-message";
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
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useTheme } from "../hooks/useTheme";
import { useData, ServiceTime, PartsLubricants } from "../contexts/DataContext";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import type { ReportsStackParamList } from "../navigation/ReportsStackNavigator";
import { useCompanies } from "../hooks/useCompanies";
import { useEquipmentTypeList } from "../hooks/useEquipmentType";
import { useEquipmentListByType } from "../hooks/useEquipmentListByType";
import { useStoreServiceReport } from "../hooks/useStoreServiceReport";
import { buildServiceReportPayload } from "../utils/buildServiceReportPayload";
import { mapRawServiceReport } from "../utils/mapRawServiceReport";
import { 
  CHECKLIST_GENERAL, 
  CHECKLIST_FORKLIFT_LOADER, 
  CHECKLIST_AERIAL_PLATFORM, 
  DEFAULT_PARTS_LUBRICANTS 
} from "../constants/checklists";
import { storeServiceReportApi } from "../api/storeServiceReport";
import { signaturePathToSvgBlob } from "../utils/signaturePathToSvgBlob";

type ServiceReportFormRouteProp = RouteProp<ReportsStackParamList, "ServiceReportForm">;
type ReportsNavigationProp = NativeStackNavigationProp<ReportsStackParamList>;

export default function ServiceReportFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ReportsNavigationProp>();
  const route = useRoute<ServiceReportFormRouteProp>();
  const { theme } = useTheme();
  const colors = Colors.light;

  const { companies, equipmentTypes, serviceReports, getEquipmentByType, addServiceReport, updateServiceReport } = useData();

  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  const existingReport = route.params?.report || null;
  const formData = existingReport
  ? mapRawServiceReport(existingReport.raw)
  : null;

  const isEditing = !!existingReport;
  
  
  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<{ id: string; name: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{ id: string; name: string }[]>([]);

  const [companyName, setCompanyName] = useState(formData?.companyName || "");
  const [mcSerialNo, setMcSerialNo] = useState(formData?.mcSerialNo || "");
  const [hourMeter, setHourMeter] = useState(formData?.hourMeter || "");
  const [jobNo, setJobNo] = useState(formData?.jobNo || "");
  const [address, setAddress] = useState(formData?.address || "");
  const [contactPerson, setContactPerson] = useState(formData?.contactPerson || "");
  const [contactNo, setContactNo] = useState(formData?.contactNo || "");
  const [equipmentTypeId, setEquipmentTypeId] = useState(formData?.equipmentTypeId || "");
  const [equipmentTypeName, setEquipmentTypeName] = useState(formData?.equipmentTypeName || "");

  const [equipmentId, setEquipmentId] = useState(formData?.equipmentId || "");
  const [clientName, setClientName] = useState(formData?.clientName || "");
  const [clientContactNo, setClientContactNo] = useState(formData?.clientContactNo || "");
  const [serviceTechnicianName, setServiceTechnicianName] = useState(formData?.serviceTechnicianName || "");
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(formData?.serviceTimes || [{ date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "17:00" }]);

  const [activeStartPickerIndex, setActiveStartPickerIndex] =
  useState<number | null>(null);
  const [activeEndPickerIndex, setActiveEndPickerIndex] =
  useState<number | null>(null);

  const [weeklyChecking, setWeeklyChecking] = useState(formData?.weeklyChecking || false);
  const [monthlyServicing, setMonthlyServicing] = useState(formData?.monthlyServicing || false);
  const [halfYearlyServicing, setHalfYearlyServicing] = useState(formData?.halfYearlyServicing || false);
  const [yearlyServicing, setYearlyServicing] = useState(formData?.yearlyServicing || false);

  const [washing, setWashing] = useState(formData?.washing || false);
  const [cleaning, setCleaning] = useState(formData?.cleaning || false);
  const [remarks, setRemarks] = useState(formData?.remarks || "");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(formData?.checklist || {});

  const [isChargeable, setIsChargeable] = useState<boolean | null>(formData?.isChargeable ?? null);
  // const [partsLubricants, setPartsLubricants] = useState<PartsLubricants>(formData?.partsLubricants || DEFAULT_PARTS_LUBRICANTS);
  const [partsLubricants, setPartsLubricants] = useState<PartsLubricants>({
    ...DEFAULT_PARTS_LUBRICANTS,
    ...(formData?.partsLubricants ?? {}),
  });
  
  const [technicianSignature, setTechnicianSignature] = useState("");
  const [supervisorSignature, setSupervisorSignature] = useState("");
  const [serviceDepartment, setServiceDepartment] = useState(formData?.serviceDepartment || "");
  const [completionDate, setCompletionDate] = useState(formData?.completionDate || new Date().toISOString().split("T")[0]);
  const [images, setImages] = useState<(File | Blob)[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const { data: companyData } = useCompanies();
  const { data: eqTypeData } = useEquipmentTypeList();
  const { data: equipmentListData } = useEquipmentListByType(equipmentTypeId);
  
  const storeMutation = useStoreServiceReport();

  useEffect(() => {
    const company = companyData?.data?.company;
    
    if (!companyOptions.length && company?.company_names && company?.ids) {
      const companiesArr = company.company_names.map((name: string, index: number) => ({
        id: String(company.ids[index]),
        name,
      }));
      setCompanyOptions(companiesArr);
    }

    const equipmentTypeList = eqTypeData?.data?.equipmentTypeList;
    if (equipmentTypeList?.ids && equipmentTypeList?.types) {
      const eqTypes = equipmentTypeList.ids.map((id: number, index: number) => ({
        id: String(id),
        name: equipmentTypeList.types[index],
      }));
      setEquipmentTypeOptions(eqTypes);
    }
  }, [companyData, eqTypeData]);

  useEffect(() => {
    if (equipmentListData?.data?.equipmentList?.equip_id) {
      const formatted = equipmentListData.data.equipmentList.equip_id.map((equipId: string) => ({ id: equipId, name: equipId }));
      
      setEquipmentOptions(formatted);
    } else {
      setEquipmentOptions([]);
    }
  }, [equipmentListData]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? "Edit Service Report" : "New Service Report",
    });
  }, [isEditing, navigation]);

  useEffect(() => {
    if (formData?.checklist) {
      const mappedChecklist = mapApiChecklistDynamic(formData.checklist);
      setChecklist(mappedChecklist);
    }
  }, [formData]);

  const availableEquipment = equipmentTypeId ? getEquipmentByType(equipmentTypeId) : [];




  // const handleChecklistChange = (item: string, checked: boolean) => {
  //   setChecklist((prev) => ({ ...prev, [item]: checked }));
  // };
  const handleChecklistChange = (key: string, checked: boolean) => {
    setChecklist((prev) => ({ ...prev, [key]: checked }));
  };
  
  // Select/Deselect all
  const ALL_CHECKLIST_ITEMS = [
    ...CHECKLIST_GENERAL,
    ...CHECKLIST_FORKLIFT_LOADER,
    ...CHECKLIST_AERIAL_PLATFORM,
  ];

  const handleSelectAllChecklist = () => {
    const allChecked = ALL_CHECKLIST_ITEMS.every((item) => checklist[item.key]);
    const newChecklist: Record<string, boolean> = {};
    ALL_CHECKLIST_ITEMS.forEach((item) => {
      newChecklist[item.key] = !allChecked;
    });
    setChecklist(newChecklist);
  };

  const isAllChecklistSelected = ALL_CHECKLIST_ITEMS.every((item) => checklist[item.key]);

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

  const pickImage = async () => {
    if (Platform.OS === "web") {
      Toast.show({ type: "error", text1: "Info", text2: "Run in Expo Go to use the camera and photo library" });
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({ type: "error", text1: "Permission Required", text2: "Please allow access to your photo library to add images." });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled && result.assets) {
      // const newImages = result.assets.map((asset: any) => asset.uri);
      // setImages((prev) => [...prev, ...newImages]);
      const newImages = await Promise.all(
        result.assets.map(async (asset: any) => {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          // Create a File with a filename (optional, use asset.filename if available)
          const fileName = asset.fileName || `image_${Date.now()}.jpg`;
          return new File([blob], fileName, { type: blob.type });
        })
      );
      
      setImages((prev) => [...prev, ...newImages]);
      
    }

  };

  const takePhoto = async () => {
    if (Platform.OS === "web") {
      Toast.show({ type: "error", text1: "Info", text2: "Run in Expo Go to use the camera" });
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Toast.show({ type: "error", text1: "Permission Required", text2: "Please allow access to your camera to take photos." });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets && result.assets[0]) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };


  // Dynamically map API checklist to your state
  const mapApiChecklistDynamic = (apiChecklist: Record<string, any>) => {
    const mapped: Record<string, boolean> = {};
    ALL_CHECKLIST_ITEMS.forEach((item) => {
      mapped[item.key] = apiChecklist[item.key] === "true" || apiChecklist[item.key] === true;
    });
    return mapped;
  };


  const buildReportData = (status: "submit" | "draft") => {
    const eqType = equipmentTypes.find((t) => t.id === equipmentTypeId);
    const eq = availableEquipment.find((e) => e.id === equipmentId);

    const servicingPartsLubricants: Record<string, string> = {};
    const otherPartsSupplied: string[] = [];
    
    Object.entries(partsLubricants).forEach(([key, value]) => {
      if (key === "otherPartsSupplied") {
        if (value) {
          otherPartsSupplied.push(value);
        }
      } else {
        servicingPartsLubricants[key] = value;
      }
    });
    
    
    return {
      token: token,
      user_id: userId,
      company_name: companyName,
      company_address: address,
      job_no: jobNo,
      hr_meter: hourMeter,  
      equipment_type:equipmentTypeId,
      equipment_id: equipmentId,
      serial_no: mcSerialNo,
      mc: mcSerialNo,
      // DATE LIST
      date_list: serviceTimes.map((t) => t.date),
      // TIME LIST
      time_list: {
        start: serviceTimes.map((t) => t.startTime),
        end: serviceTimes.map((t) => t.endTime),
      },
      servicing_parts_lubricants_list: servicingPartsLubricants,
      other_parts_supplied_list: otherPartsSupplied,

      // other_parts_supplied_list: partsLubricants?.otherPartsSupplied,
      operation_check_list: checklist,
      description: remarks,
      // signature_client: supervisorSignature,
      // signature_technician: technicianSignature,
      signature_technician: technicianSignature
      ? signaturePathToSvgBlob(technicianSignature)
      : undefined,
  
    signature_client: supervisorSignature
      ? signaturePathToSvgBlob(supervisorSignature)
      : undefined,
      filled_date: completionDate,
      is_chargable: String(isChargeable),
      client_name: clientName,
      client_tel_no: clientContactNo,
      images: images,
      description_status_list: {
        checking: weeklyChecking,
        servicing: monthlyServicing || halfYearlyServicing || yearlyServicing,
        repair: false,
      },

      // serviceTimes,
      // weeklyChecking,
      // monthlyServicing,
      // halfYearlyServicing,
      // yearlyServicing,
      // washing,
      // cleaning,
      // checklist,
      // partsSuppliedText: "",
      // partsLubricants,
      // technicianSignature,
      // supervisorSignature,
      // serviceDepartment,
    };
  };

  const handleSaveAsDraft = async () => {
    setIsLoading(true);
    try {
      const reportData = buildReportData("draft");
      if (isEditing && existingReport) {
        updateServiceReport(existingReport.id, reportData);
        Alert.alert("Success", "Service report saved as draft", [{ text: "OK", onPress: () => navigation.goBack() }]);
      } else {
        addServiceReport(reportData);
        Alert.alert("Success", "Service report saved as draft", [{ text: "OK", onPress: () => navigation.goBack() }]);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to save draft" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const reportData = buildReportData("submit");
    console.log('reportData',reportData);
    try {
    
      // const payloadPartial = await buildServiceReportPayload({
      //   reportData,
      //   report_id: 0,
      // });
      
      //  CALL API HERE
        const res = await storeServiceReportApi(reportData);
        console.log("SUCCESS:", res);

      // On success, also update local context / navigate back
      if (isEditing && existingReport) {
        updateServiceReport(existingReport.id, reportData);
      } else {
        addServiceReport(reportData);
      }

      // Alert.alert("Success", "Service report submitted", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      console.error("Submit error", err);
      Toast.show({ type: "error", text1: "Error", text2: err?.message || "Failed to submit report" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        {/* Company Details */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Company Details</ThemedText>
          <FormDropdown
            label="Company *"
            placeholder="Select company"
            options={companyOptions.map(c => ({ id: c.name, name: c.name }))} // id = name
            selectedValue={companyName}
            onValueChange={setCompanyName}
          />

          <FormInput label="Address" placeholder="Enter address" value={address} onChangeText={setAddress} multiline />
          <FormInput label="Contact Person" placeholder="Enter contact person" value={contactPerson} onChangeText={setContactPerson} />
          <FormInput label="Contact No" placeholder="Enter contact number" value={contactNo} onChangeText={setContactNo} keyboardType="phone-pad" />
        </Card>

        {/* Equipment Details */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Equipment Details</ThemedText>
          <FormInput label="M/C or Serial No *" placeholder="Enter serial number" value={mcSerialNo} onChangeText={setMcSerialNo} />
          <FormInput label="Hour Meter" placeholder="Enter hour meter reading" value={hourMeter} onChangeText={setHourMeter} keyboardType="numeric" />
          <FormInput label="Job No" placeholder="Enter job number" value={jobNo} onChangeText={setJobNo} />

          {/* <FormDropdown label="Equipment Type" placeholder="Select equipment type" options={equipmentTypeOptions} selectedValue={equipmentTypeId} onValueChange={(v) => { setEquipmentTypeId(v); setEquipmentId(""); }} /> */}
          <FormDropdown
            label="Equipment Type"
            placeholder="Select equipment type"
            options={equipmentTypeOptions.map(t => ({ id: t.name, name: t.name }))} // id = name
            selectedValue={equipmentTypeName}
            onValueChange={(name) => {
              setEquipmentTypeName(name); // store name
              const selectedType = equipmentTypeOptions.find(t => t.name === name);
              setEquipmentTypeId(selectedType?.id || ""); // optional: keep ID if needed
              setEquipmentId(""); // reset equipment dropdown
            }}
          />
          {equipmentTypeId && <FormDropdown label="Equipment ID" placeholder="Select equipment" options={equipmentOptions} selectedValue={equipmentId} onValueChange={setEquipmentId} />}

          <FormInput label="Client Name" placeholder="Enter client name" value={clientName} onChangeText={setClientName} />
          <FormInput label="Client Contact No" placeholder="Enter client contact" value={clientContactNo} onChangeText={setClientContactNo} keyboardType="phone-pad" />
        </Card>

        {/* Service Details */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Service Details</ThemedText>
          <FormInput label="Service Technician Name" placeholder="Enter technician name" value={serviceTechnicianName} onChangeText={setServiceTechnicianName} />

          <ThemedText type="small" style={styles.label}>Service Times</ThemedText>
          {serviceTimes.map((time, index) => (
            <View key={index} style={[styles.serviceTimeCard, { borderColor: colors.inputBorder }]}>
              {serviceTimes.length > 1 && (
                <Pressable style={styles.deleteButton} onPress={() => removeServiceTime(index)}><Feather name="trash-2" size={16} color={colors.buttonText} /></Pressable>
              )}
              <FormDatePicker label="Date" value={time.date} onChange={(v) => updateServiceTime(index, "date", v)} />
              <View style={styles.timeRow}>
                 {/* START TIME */}
                  <View style={styles.serviceTimeField}>
                    <Pressable onPress={() => setActiveStartPickerIndex(index)}>
                      <FormInput
                        label="Start"
                        placeholder="HH:MM"
                        value={time.startTime}
                        editable={false}
                        pointerEvents="none"
                      />
                    </Pressable>

                    {activeStartPickerIndex === index && (
                      <DateTimePicker
                        value={new Date()}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event, selectedTime) => {
                          setActiveStartPickerIndex(null);

                          if (event.type === "dismissed" || !selectedTime) return;

                          const formatted = selectedTime.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          updateServiceTime(index, "startTime", formatted);
                        }}
                      />
                    )}
                  </View>
                  {/* END TIME */}
                  <View style={styles.serviceTimeField}>
                    <Pressable onPress={() => setActiveEndPickerIndex(index)}>
                      <FormInput
                        label="End"
                        placeholder="HH:MM"
                        value={time.endTime}
                        editable={false}
                        pointerEvents="none"
                      />
                    </Pressable>

                    {activeEndPickerIndex === index && (
                      <DateTimePicker
                        value={new Date()}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event, selectedTime) => {
                          setActiveEndPickerIndex(null);
                          if (event.type === "dismissed" || !selectedTime) return;

                          const end = formatTime(selectedTime);

                          //  Block invalid end time
                          if (
                            time.startTime &&
                            timeToMinutes(end) < timeToMinutes(time.startTime)
                          ) {
                            Toast.show({
                              type: "error",
                              text1: "Invalid Time",
                              text2: "End time cannot be earlier than start time",
                            });
                            return;
                          }

                          updateServiceTime(index, "endTime", end);
                        }}
                      />
                    )}
                  </View>
              </View> 
            </View>
          ))}
          {serviceTimes.length < 4 && <Pressable style={[styles.addButton, { borderColor: colors.primary }]} onPress={addServiceTime}><Feather name="plus" size={16} color={colors.primary} /><ThemedText type="small" style={{ color: colors.primary, marginLeft: Spacing.xs }}>Add Service Time</ThemedText></Pressable>}

          <ThemedText type="small" style={[styles.label, { marginTop: Spacing.lg }]}>Service Type</ThemedText>
          <FormCheckbox label="Weekly Checking" checked={weeklyChecking} onChange={setWeeklyChecking} />
          <FormCheckbox label="Monthly Servicing" checked={monthlyServicing} onChange={setMonthlyServicing} />
          <FormCheckbox label="Half Yearly Servicing" checked={halfYearlyServicing} onChange={setHalfYearlyServicing} />
          <FormCheckbox label="Yearly Servicing" checked={yearlyServicing} onChange={setYearlyServicing} />
          <FormCheckbox label="Washing" checked={washing} onChange={setWashing} />
          <FormCheckbox label="Cleaning" checked={cleaning} onChange={setCleaning} />
        </Card>

        {/* Operation Checklist */}
        <Card elevation={1} style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4" style={styles.sectionTitle}>OPERATION CHECK LISTS:</ThemedText>
            <Pressable style={[styles.selectAllButton, { backgroundColor: colors.primary + "15" }]} onPress={handleSelectAllChecklist}>
              <Feather name={isAllChecklistSelected ? "check-square" : "square"} size={16} color={colors.primary} />
              <ThemedText type="small" style={{ color: colors.primary, marginLeft: Spacing.xs }}>{isAllChecklistSelected ? "Deselect All" : "Select All"}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.checklistColumns}>
            <View style={styles.checklistColumn}>
              <ThemedText type="small" style={styles.checklistColumnHeader}>General</ThemedText>
              {CHECKLIST_GENERAL.map((item, index) => ( 
                <FormCheckbox
                  key={item.key}
                  label={item.label}
                  checked={checklist[item.key] || false}
                  onChange={(checked) => handleChecklistChange(item.key, checked)}
                />))
              }
            </View>

            <View style={styles.checklistColumn}>
              <ThemedText type="small" style={styles.checklistColumnHeader}>Forklift/Loader</ThemedText>
              {CHECKLIST_FORKLIFT_LOADER.map((item, index) => ( 
                <FormCheckbox
                  key={item.key}
                  label={item.label}
                  checked={checklist[item.key] || false}
                  onChange={(checked) => handleChecklistChange(item.key, checked)}
                />))
              }
            </View>

            <View style={styles.checklistColumn}>
              <ThemedText type="small" style={styles.checklistColumnHeader}>Aerial Platform</ThemedText>
              {CHECKLIST_AERIAL_PLATFORM.map((item, index) => (
                 <FormCheckbox
                 key={item.key}
                 label={item.label}
                 checked={checklist[item.key] || false}
                 onChange={(checked) => handleChecklistChange(item.key, checked)}
               />
              ))}
            </View>
          </View>
        </Card>

        {/* Parts & Lubricants */}
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

        {/* Images */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Images</ThemedText>
          <ThemedText type="small" style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>Add photos of the equipment or service work</ThemedText>

          <View style={styles.imageButtonsRow}>
            <Pressable style={[styles.imageButton, { backgroundColor: colors.primary + "15" }]} onPress={takePhoto}>
              <Feather name="camera" size={20} color={colors.primary} />
              <ThemedText type="small" style={{ color: colors.primary, marginLeft: Spacing.sm, marginTop: Spacing.sm }}>Take Photo</ThemedText>
            </Pressable>
            <Pressable style={[styles.imageButton, { backgroundColor: colors.primary + "15" }]} onPress={pickImage}>
              <Feather name="image" size={20} color={colors.primary} />
              <ThemedText type="small" style={{ color: colors.primary, marginLeft: Spacing.sm, marginTop: Spacing.sm }}>Choose from Gallery</ThemedText>
            </Pressable>
          </View>

          {images.length > 0 && (
            <View style={styles.imagesGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.imagePreview} contentFit="cover" />
                  <Pressable style={[styles.imageRemoveButton, { backgroundColor: colors.error }]} onPress={() => removeImage(index)}>
                    <Feather name="x" size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* Remarks */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Remarks</ThemedText>
          <FormInput label="Remarks/Description" placeholder="Enter any remarks or description" value={remarks} onChangeText={setRemarks} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} />
        </Card>

        {/* Signatures & Completion */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Signatures & Completion</ThemedText>
          <SignatureBox label="Service Technician Signature" value={technicianSignature} onChange={setTechnicianSignature} />
          <SignatureBox label="KSS Supervisor Signature" value={supervisorSignature} onChange={setSupervisorSignature} />
          <FormInput label="Service Department" placeholder="Enter department" value={serviceDepartment} onChangeText={setServiceDepartment} />
          <FormDatePicker label="Completion Date" value={completionDate} onChange={setCompletionDate} />
        </Card>

        {/* Chargeable radio */}
        <Card elevation={1} style={styles.section}>
          <View style={styles.radioGroup}>
            <Pressable style={styles.radioOption} onPress={() => setIsChargeable(true)}>
              <View style={[styles.radioCircle, { borderColor: colors.inputBorder }]}>{isChargeable === true ? <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} /> : null}</View>
              <ThemedText type="body">Chargeable</ThemedText>
            </Pressable>
            <Pressable style={styles.radioOption} onPress={() => setIsChargeable(false)}>
              <View style={[styles.radioCircle, { borderColor: colors.inputBorder }]}>{isChargeable === false ? <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} /> : null}</View>
              <ThemedText type="body">Not Chargeable</ThemedText>
            </Pressable>
          </View>
        </Card>

        {/* Buttons */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 100 }]}>
          <CustomButton onPress={handleSaveAsDraft} disabled={isLoading} style={[styles.draftButton, { backgroundColor: colors.secondary }]}>Save as Draft</CustomButton>
          <CustomButton onPress={handleSubmit} disabled={isLoading} style={[styles.submitButton, { backgroundColor: colors.primary }]}>{isEditing ? "Update Report" : "Submit Report"}</CustomButton>
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
    borderColor: "gray",
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
    backgroundColor: "red",
    zIndex: 10,
  },
  timeRow: { flexDirection: "row", marginTop: Spacing.sm, gap: Spacing.sm },
  timeField: { flex: 1 },
  removeButton: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: "center", justifyContent: "center", marginLeft: Spacing.sm, marginTop: 28 },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: Spacing.md, borderWidth: 1, borderRadius: BorderRadius.sm, borderStyle: "dashed" },
  selectAllButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.sm },
  imageButtonsRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg },
  imageButton: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: Spacing.md, borderRadius: BorderRadius.sm },
  imagesGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  imageContainer: { width: 100, height: 100, position: "relative" },
  imagePreview: { width: "100%", height: "100%", borderRadius: BorderRadius.sm },
  imageRemoveButton: { position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  buttonContainer: { marginTop: Spacing.lg },
  draftButton: { marginBottom: Spacing.md },
  submitButton: {},
  checklistColumns: { flexDirection: "row", gap: Spacing.sm },
  checklistColumn: { flex: 1 },
  checklistColumnHeader: { fontWeight: "600", marginBottom: Spacing.sm },
  radioGroup: { gap: Spacing.lg },
  radioOption: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioSelected: { width: 12, height: 12, borderRadius: 6 },
});
