import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { Card } from "../components/Card";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { CustomButton } from "../components/CustomButton";
import { FormInput } from "../components/FormInput";
import { FormDropdown } from "../components/FormDropdown";
import { FormCheckbox } from "../components/FormCheckbox";
import { FormDatePicker } from "../components/FormDatePicker";
import { SignatureBox } from "../components/SignatureBox";
import { KeyboardAwareScrollViewCompat } from "../components/KeyboardAwareScrollViewCompat";
import { ServiceTime, PartsLubricants } from "../types/maintenance";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import type { MaintenanceStackParamList } from "../navigation/MaintenanceStackNavigator";
import { useCompanies } from '../hooks/useCompanies';
import { useEquipmentTypeList } from "../hooks/useEquipmentType";
import { useEquipmentListByType } from "../hooks/useEquipmentListByType";
import { useGeneralChecklist } from "../hooks/useGeneralChecklist";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useGenerateOTPSR } from "../hooks/useGenerateOTPSR";
import { useVerifyOTPSR } from "../hooks/useVerifyOTPSR";
import CustomLoader from "../components/CustomLoader";
import { CustomAlert } from "../components/CustomAlert";
import { useStoreGM } from "../hooks/useStoreGM";
import { buildGMFormData } from "../utils/buildGMFormData";
import { validateForm } from "../utils/validateGM";
import { mapRawGM } from "../utils/mapRawGM";

type MaintenanceFormRouteProp = RouteProp<MaintenanceStackParamList, "GMForm">;
type MaintenanceNavigationProp = NativeStackNavigationProp<MaintenanceStackParamList>;

const DEFAULT_PARTS_LUBRICANTS: PartsLubricants = {
  engineAirFilter: "",
  engineOilFilter: "",
  engineFuelFilter: "",
  preFilter: "",
  waterFilter: "",
  hydraulicFilter: "",
  engineOil: "",
  hydraulicOil: "",
  gearOil: "",
};

export default function MaintenanceFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MaintenanceNavigationProp>();
  const route = useRoute<MaintenanceFormRouteProp>();
  const colors = Colors.light;
  const queryClient = useQueryClient();
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);
  
  const existingReport = route.params?.report || null;
  // console.log('existingReport',route.params?.report);

  const formData = React.useMemo(
    () => (existingReport ? mapRawGM(existingReport) : null),
    [existingReport]
  );
  // console.log('formData',formData);

  const isEditing = !!existingReport;

  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<
  { id: string; name: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{ id: string; name: string }[]>([]);

  const [companyId, setCompanyId] = useState(formData?.companyId || "");
  const [mcSerialNo, setMcSerialNo] = useState(formData?.mcSerialNo || "");
  const [hourMeter, setHourMeter] = useState(formData?.hourMeter || "");
  const [jobNo, setJobNo] = useState(formData?.jobNo || "");
  const [address, setAddress] = useState(formData?.address || "");
  const [otherPart, setOtherPart] = useState(formData?.otherPartsSupplied || "");

  const [contactPerson, setContactPerson] = useState(formData?.contactPerson || "");
  const [contactNo, setContactNo] = useState(formData?.contactNo || "");
  const [email, setEmail] = useState(formData?.email || "");

  const [equipmentTypeId, setEquipmentTypeId] = useState(formData?.equipmentTypeId || "");
  const [equipmentId, setEquipmentId] = useState(formData?.equipmentId || "");
  const [clientName, setClientName] = useState(formData?.clientName || "");
  const [clientContactNo, setClientContactNo] = useState(formData?.clientContactNo || "");
  const [serviceTechnicianName, setServiceTechnicianName] = useState(formData?.serviceTechnicianName  || "");
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(formData?.serviceTimes || [{ date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "17:00" }]);
  const [services, setServices] = useState({
    weeklyChecking: false,
    monthlyServicing: false,
    halfYearlyServicing: false,
    yearlyServicing: false,
    washing: false,
    cleaning: false,
  });

  const [remarks, setRemarks] = useState(formData?.remarks || "");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(formData?.checklist || {});
  const [partsLubricants, setPartsLubricants] = useState<PartsLubricants>(formData?.partsLubricants || DEFAULT_PARTS_LUBRICANTS);
  const [companyName, setCompanyName] = useState(formData?.companyName || "");

  const [technicianSignature, setTechnicianSignature] = useState("");
  const [supervisorSignature, setSupervisorSignature] = useState("");
  const [serviceDepartment, setServiceDepartment] = useState(formData?.serviceDepartment || "");
  const [completionDate, setCompletionDate] = useState(formData?.completionDate || new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const { data: companyData } = useCompanies();
  const { data: eqTypeData } = useEquipmentTypeList();
  const { data: equipmentListData } = useEquipmentListByType(equipmentTypeId);
  const { data: checklistData, isError, error, } = useGeneralChecklist(equipmentTypeId);
  const {
    mutate: generateOtp,
    isPending: isOtpPending,
    isSuccess,
  } = useGenerateOTPSR();

  const {
    mutate: verifyOtp,
    isPending: isVerifying,
    isSuccess: isSuccessVerify
  } = useVerifyOTPSR();

  const { mutateAsync, isPending } = useStoreGM(token);
  console.log('error',error);
  

  useEffect(() => {
    if (isError && error) {
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  }, [isError, error]);
  
  //Company
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

  useEffect(() => {
    if (!formData) return;
  
    setTechnicianSignature(formData.signature_technician || "");
    setSupervisorSignature(formData.signature_supervisor || "");
  }, [formData]);

  useEffect(() => {
    if (!companyOptions.length) return;
    if (!companyName) return;
  
    const matched = companyOptions.find(
      c => c.name.trim() === companyName.trim()
    );
  
    if (matched) {
      setCompanyId(matched.id);
    }
  }, [companyOptions, companyName]);

  useEffect(() => {
    if (!isEditing) return;
    if (!equipmentTypeOptions.length) return;
    if (!formData?.equipmentTypeName) return;
  
    const matched = equipmentTypeOptions.find(
      t => t.name.trim() === formData.equipmentTypeName.trim()
    );
  
    if (matched) {
      setEquipmentTypeId(matched.id);
    }
  }, [isEditing, equipmentTypeOptions, formData]);

  
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

  const handleGenerateOtpClick = () => {
    if (!clientContactNo || clientContactNo.trim().length === 0) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Client contact number is required",
      });
      return;
    }
  
    if (clientContactNo.length < 8) {
      Toast.show({
        type: "error",
        text1: "Invalid Number",
        text2: "Please enter a valid contact number",
      });
      return;
    }
  
    setShowAlert(true);
  };

  const generateOTP = async() => {
    setShowAlert(false);

    generateOtp(clientContactNo, {
      onSuccess: () => {
        setShowVerify(true);
      },
      onError: () => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to generate OTP",
        });
      },
    });
  }

  const veriftOtp = () => {
      if (!otp || otp.length === 0) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "Please enter OTP",
        });
        return;
      }
    
      verifyOtp(otp, {
        onSuccess: () => {
          setShowVerify(false);
          Toast.show({
            type: "success",
            text1: "OTP Verified",
          });
        },
        onError: () => {
          Toast.show({
            type: "error",
            text1: "Invalid OTP",
            text2: "Please try again",
          });
        },
      });
  }

   // --- Separate partsLubricants properly ---
   const servicingPartsLubricants: Record<string, string> = {};

   Object.entries(partsLubricants).forEach(([key, value]) => {
   
       servicingPartsLubricants[key] = value;
 
   });
   useEffect(() => {
    if (!isEditing) return;
    if (!checklistData?.data) return;
    if (!formData?.checklist) return;
  
    setChecklist(formData.checklist);
  }, [isEditing, checklistData, formData]);
  

   const getSelectedServices = (): string[] => {
    const SERVICE_LABELS: Record<string, string> = {
      weeklyChecking: "Weekly Checking",
      monthlyServicing: "Monthly Servicing",
      halfYearlyServicing: "Half Yearly Servicing",
      yearlyServicing: "Yearly Servicing",
      washing: "Washing",
      cleaning: "Cleaning",
    };
  
    return Object.entries(services)
      .filter(([_, checked]) => checked)
      .map(([key]) => SERVICE_LABELS[key]);
  };
  const selectedServices = getSelectedServices();

  
  const handleSubmit = async () => {
  
    const { valid, errors } = validateForm({
      companyId,
      address,
      mcSerialNo,
      hourMeter,
      jobNo,
      equipmentTypeId,
      equipmentId,
      clientName,
      clientContactNo,
      serviceTimes,
      remarks,
      technicianSignature,
      supervisorSignature,
      serviceDepartment,
      contactPerson,
      contactNo,
      checklist,
      services
    });
    
    if (!valid) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: errors[0],
      });
      return;
    }
    
    try {
      const formData = buildGMFormData({
        maintenance_id: isEditing ? existingReport.id : 0,
        company_name: companyId,
        email,
        address,
        contact_person: contactPerson,
        contact_no: contactNo,
        equipment_type: equipmentTypeId,
        equipment_id: equipmentId,
        job_no: jobNo,
        hr_meter: hourMeter,
        serial_no: mcSerialNo,
        mc: mcSerialNo,
        remarks,
        services: selectedServices,
        technician: String(userId),
        client_name: clientName,
        client_tel_no: clientContactNo,
        service_technician: serviceTechnicianName,
        date_list: serviceTimes.map(t => t.date),
        time_list: {
          start: serviceTimes.map(t => t.startTime),
          end: serviceTimes.map(t => t.endTime),
        },
        job_descriptions: remarks,
        servicing_parts_lubricants_list: servicingPartsLubricants,
        other_parts_supplied_list: otherPart,
        signature_technician: technicianSignature
          ? { uri: technicianSignature, name: "technician-signature.jpg", type: "image/jpeg" }
          : undefined,
        signature_supervisor: supervisorSignature
          ? { uri: supervisorSignature, name: "client-signature.jpg", type: "image/jpeg" }
          : undefined,
        service_department: serviceDepartment,
        current_date: completionDate instanceof Date ? completionDate.toISOString() : completionDate,
        operation_check_list: checklist,
        is_otp_verified: "Y",
      });

      // console.log("=== FORMDATA START ===");
      // for (const pair of formData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }
      // console.log("=== FORMDATA END ===");
      
      const res = await mutateAsync({ formData});
      
      if (res) {
        queryClient.invalidateQueries({
          queryKey: ["general-maintenace"],
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "General Maintenace saved successfully.",
        });
        navigation.goBack()
      }
    } catch (error) {
      console.error("Failed to submit General maintenace:", error);
       Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to submit General maintenace",
      });
      
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
           {/* OTP Section */}
           {
            isEditing ? 
              <ThemedText type="body" style={styles.verifiedText}>Contact Number Verified</ThemedText> : 
                <View style={styles.twoColumn}>
                  <View style={styles.inputHalf}>
                    <FormInput label="Enter OTP" placeholder="Enter OTP" value={otp} onChangeText={setOtp} /> 
                  </View>
                  <View style={styles.inputHalf}>
                    {
                      !showVerify ?
                      <>
                        <CustomButton
                          onPress={handleGenerateOtpClick}
                          style={[{ backgroundColor: colors.primary, marginTop: Spacing["2xl"] }]}
                        >
                        {"Generate OTP"}</CustomButton>
                        <CustomAlert
                          visible={showAlert}
                          title="Confirmation"
                          message={`Are you sure you want to send OTP to ${clientContactNo}?`}
                          type="info"
                          confirmText="Confirm"
                          cancelText="Cancel"
                          onConfirm={generateOTP}
                          onCancel={() => setShowAlert(false)}
                        />
                      </>
                    :
                      <View style={styles.twoColumn}>
                        <View style={styles.inputHalf}>
                          <CustomButton onPress={veriftOtp} style={[ { backgroundColor: colors.primary, marginTop: Spacing.lg }]}>{"Verify"}</CustomButton> 
                        </View>
                        <View style={styles.inputHalf}>
                          <CustomButton onPress={() => {}} style={[ { backgroundColor: colors.primary, marginTop: Spacing.lg }]}>{"Resend"}</CustomButton> 
                        </View>
                      </View>
                    }             
                  </View>
                </View>  
           } 
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
          <View style={styles.twoColumn}>
            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Weekly Checking"
                checked={services.weeklyChecking}
                onChange={(val) =>
                  setServices(prev => ({ ...prev, weeklyChecking: val }))
                }
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Monthly Servicing"
                checked={services.monthlyServicing}
                onChange={(val) =>
                  setServices(prev => ({ ...prev, monthlyServicing: val }))
                }
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Half Yearly Servicing"
                checked={services.halfYearlyServicing}
                onChange={(val) =>
                  setServices(prev => ({ ...prev, halfYearlyServicing: val }))
                }
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Yearly Servicing"
                checked={services.yearlyServicing}
                onChange={(val) =>
                  setServices(prev => ({ ...prev, yearlyServicing: val }))
                }
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Washing"
                checked={services.washing}
                onChange={(val) =>
                  setServices(prev => ({ ...prev, washing: val }))
                }
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Cleaning"
                checked={services.cleaning}
                onChange={(val) =>
                  setServices(prev => ({ ...prev, cleaning: val }))
                }
              />
            </View>
          </View>
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Remarks</ThemedText>
          <FormInput label="Remarks/Description" placeholder="Enter any remarks or description" value={remarks} onChangeText={setRemarks} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} />
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
            const itemList = items as string[];
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
          <ThemedText type="h4" style={styles.sectionTitle}>Parts & Lubricants Supplied:</ThemedText>
          <View style={styles.twoColumn}>
            <View style={styles.inputHalf}>
              <FormInput label="Engine Air Filter" placeholder="Enter details" value={partsLubricants.engineAirFilter} onChangeText={(v) => updatePartsLubricants("engineAirFilter", v)} />
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Engine Oil Filter" placeholder="Enter details" value={partsLubricants.engineOilFilter} onChangeText={(v) => updatePartsLubricants("engineOilFilter", v)} />
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Engine Fuel Filter" placeholder="Enter details" value={partsLubricants.engineFuelFilter} onChangeText={(v) => updatePartsLubricants("engineFuelFilter", v)} />
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Pre-Filter" placeholder="Enter details" value={partsLubricants.preFilter} onChangeText={(v) => updatePartsLubricants("preFilter", v)} />
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Water Filter" placeholder="Enter details" value={partsLubricants.waterFilter} onChangeText={(v) => updatePartsLubricants("waterFilter", v)} />
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Hydraulic Filter" placeholder="Enter details" value={partsLubricants.hydraulicFilter} onChangeText={(v) => updatePartsLubricants("hydraulicFilter", v)} />
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Engine Oil" placeholder="Enter details" value={partsLubricants.engineOil} onChangeText={(v) => updatePartsLubricants("engineOil", v)} />
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Hydraulic Oil" placeholder="Enter details" value={partsLubricants.hydraulicOil} onChangeText={(v) => updatePartsLubricants("hydraulicOil", v)} />
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Gear Oil" placeholder="Enter details" value={partsLubricants.gearOil} onChangeText={(v) => updatePartsLubricants("gearOil", v)} />
            </View>
          </View>
          <FormInput label="Other Parts Supplied" placeholder="Enter other parts and details" value={otherPart} onChangeText={setOtherPart} />
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Signatures & Completion</ThemedText>
          <SignatureBox label="Service Technician Signature" value={technicianSignature} onChange={setTechnicianSignature} />
          <SignatureBox label="KSS Supervisor Signature" value={supervisorSignature} onChange={setSupervisorSignature} />
          <FormInput label="Service Department" placeholder="Enter department" value={serviceDepartment} onChangeText={setServiceDepartment} />
          <FormDatePicker label="Completion Date" value={completionDate} onChange={setCompletionDate} />
        </Card>

        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 100 }]}>
          <CustomButton onPress={handleSubmit} style={[styles.submitButton, { backgroundColor: colors.primary }]}>{isPending
            ? <CustomLoader color="#fff" />
            : isEditing
              ? "Update"
              : "Submit"}
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
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10
  },
  inputHalf: {
    width: "48%", 
  },
  verifiedText: {
    color: Colors.light.success,
    textAlign: "center",
    fontWeight: "bold"
  }
});
