import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Pressable, Platform, FlatList } from "react-native";
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
import type { ChecklistItemProps } from "../types/maintenance";
import { useCompanies } from '../hooks/useCompanies';
import { useEquipmentTypeList } from "../hooks/useEquipmentType";
import { useEquipmentListByType } from "../hooks/useEquipmentListByType";
import { useGeneralChecklist } from "../hooks/useGeneralChecklist";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useGenerateOTPSR } from "../hooks/useGenerateOTPSR";
import { useVerifyOTPSR } from "../hooks/useVerifyOTPSR";
import CustomLoader from "../components/CustomLoader";
import { useStoreGM } from "../hooks/useStoreGM";
import { buildGMFormData } from "../utils/buildGMFormData";
import { validateForm } from "../utils/validateGM";
import { mapRawGM } from "../utils/mapRawGM";
import DateTimePicker from "@react-native-community/datetimepicker";
import { EQUIPMENT_TYPES } from "../constants/equipment";
import CheckListAPKL from "../components/CheckListAPKL";


type MaintenanceFormRouteProp = RouteProp<MaintenanceStackParamList, "GMForm">;
type MaintenanceNavigationProp = NativeStackNavigationProp<MaintenanceStackParamList>;
type EquipmentType = "3" | "11";

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

const SERVICE_REVERSE_MAP: Record<string, keyof typeof services> = {
  "Weekly Checking": "weeklyChecking",
  "Monthly Servicing": "monthlyServicing",
  "Half Yearly Servicing": "halfYearlyServicing",
  "Yearly Servicing": "yearlyServicing",
  "Washing": "washing",
  "Cleaning": "cleaning",
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
  const readOnly = route.params?.readOnly ?? false;
  const gmId = route.params?.gm_id;

  const formData = React.useMemo(
    () => (existingReport ? mapRawGM(existingReport) : null),
    [existingReport]
  );

  const isEditing = !!existingReport;
  const isSubmitted = isEditing && existingReport?.is_pending === "N";

  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<
  { id: string; name: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{ id: string; name: string; serialNo: string }[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState(formData?.companyId || "");
  const [mcSerialNo, setMcSerialNo] = useState(formData?.mcSerialNo || "");
  const [hourMeter, setHourMeter] = useState(formData?.hourMeter || "");
  const [jobNo, setJobNo] = useState(formData?.jobNo || "");
  const [address, setAddress] = useState(formData?.address || "");
  const [otherPart, setOtherPart] = useState(formData?.otherPartsSupplied || "");

  const [contactPerson, setContactPerson] = useState(formData?.contactPerson || "");
  const [contactNo, setContactNo] = useState(formData?.contactNo || "");
  const [email, setEmail] = useState(formData?.email || "");

  const [equipmentTypeId, setEquipmentTypeId] = useState<string | null>(
    formData?.equipmentTypeId ?? null
  );
  const [equipmentId, setEquipmentId] = useState(formData?.equipmentId || "");
  const [clientName, setClientName] = useState(formData?.clientName || "");
  const [clientContactNo, setClientContactNo] = useState(formData?.clientContactNo || "");
  const [serviceTechnicianName, setServiceTechnicianName] = useState(formData?.serviceTechnicianName  || "");
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(formData?.serviceTimes || [{ date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "17:00" }]);

  const [finalChecklistPayload, setFinalChecklistPayload] = useState<any[]>(
    formData?.v2_checklist_data || []
  );
  
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

  type SubmitAction = "draft" | "submit" | null;
  const [activeAction, setActiveAction] = useState<SubmitAction>(null);
  const [technicianSignature, setTechnicianSignature] = useState("");
  const [supervisorSignature, setSupervisorSignature] = useState("");
  const [serviceDepartment, setServiceDepartment] = useState(formData?.serviceDepartment || "");
  const [completionDate, setCompletionDate] = useState(formData?.completionDate || new Date().toISOString().split("T")[0]);
  const [otp, setOtp] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [activeStartPickerIndex, setActiveStartPickerIndex] =
  useState<number | null>(null);
  const [activeEndPickerIndex, setActiveEndPickerIndex] =
  useState<number | null>(null);

  const { data: companyData } = useCompanies();
  const { data: eqTypeData } = useEquipmentTypeList();
  const { data: equipmentListData } = useEquipmentListByType(equipmentTypeId);
  const { data: checklistData, isError, error, } = useGeneralChecklist(equipmentTypeId, selectedServiceType || undefined);
  
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

  useEffect(() => {
    if (isError && error) {
      Toast.show({
        type: "error",
        text1: error.message,
      });
    }
  }, [isError, error]);

  const initialFrequencyRef = useRef(
    formData?.frequency?.toLowerCase() || null
  );
  
  //services
  useEffect(() => {
    if (!isEditing) return;
    if (!formData?.services) return;
  
    const updatedServices = {
      weeklyChecking: false,
      monthlyServicing: false,
      halfYearlyServicing: false,
      yearlyServicing: false,
      washing: false,
      cleaning: false,
    };
  
     // ensure services is an array
    if (Array.isArray(formData?.services)) {
      formData.services.forEach((serviceLabel: string) => {
        const key = SERVICE_REVERSE_MAP[serviceLabel];

        if (key) {
          updatedServices[key] = true;
        }
      });
    }
  
    setServices(updatedServices);
  }, [isEditing, formData]);
  const handleEquipmentChange = (id: string) => {
    setEquipmentId(id);
  
    const selectedEquipment = equipmentOptions.find(
      item => item.id === id
    );
  
    if (!selectedEquipment) return;
  
    const sr = selectedEquipment.serialNo;
  
    // auto fill only if valid
    if (
      sr &&
      sr.trim() !== "" &&
      sr.toLowerCase() !== "null"
    ) {
      setMcSerialNo(sr);
    } else {
      // allow manual entry
      setMcSerialNo("");
    }
  };
  //frequency
  useEffect(() => {
    if (!isEditing) return;
    if (!formData?.frequency) return;
  
    setSelectedServiceType(
      String(formData.frequency).toLowerCase()
    );
  }, [isEditing, formData]);


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

  //signature
  useEffect(() => {
    if (!formData) return;
  
    setTechnicianSignature(formData.signature_technician || "");
    setSupervisorSignature(formData.signature_supervisor || "");
  }, [formData]);

  //company
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

  //equipment Id
  useEffect(() => {
    if (!isEditing) return;
    if (!equipmentOptions.length) return;
    if (!formData?.equipmentId) return;
  
    const matched = equipmentOptions.find(
      e => e.name.trim() === formData.equipmentId.trim()
    );
  
    if (matched) {
      setEquipmentId(matched.id);
    }
  }, [isEditing, equipmentOptions, formData]);
  
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
    const list = equipmentListData?.data?.equipmentList;
  
    if (list?.ids && list?.equip_id) {
      const formatted = list.equip_id.map((equipCode: string, index: number) => ({
        id: String(list.ids[index]),   
        name: equipCode,    
        serialNo: list.serial_no?.[index] || "",           
      }));
  
      setEquipmentOptions(formatted);
    } else {
      setEquipmentOptions([]);
    }
  }, [equipmentListData]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: readOnly || isEditing ? gmId : "New Maintenance",
    });
  }, [isEditing, navigation, gmId]);

  //equipment type service type
  const checklistOptions: Record<EquipmentType, string[]> = {
    [EQUIPMENT_TYPES.FORKLIFT]: ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"],
    [EQUIPMENT_TYPES.AP]: ["Weekly", "Monthly", "Quarterly", "Yearly"],
  };

  const selectedChecklist = useMemo(() => {
    const key = String(equipmentTypeId);
  
    if (key in checklistOptions) {
      return checklistOptions[key as keyof typeof checklistOptions];
    }
  
    return [];
  }, [equipmentTypeId]);

  //frequency
  useEffect(() => {
    // don't overwrite edit value
    if (isEditing && formData?.frequency) return;
  
    if (selectedChecklist.length > 0) {
      setSelectedServiceType(
        selectedChecklist[0].toLowerCase()
      );
    }
  }, [selectedChecklist, isEditing, formData]);

  const ChecklistItem = React.memo(
    ({ item, index, checked, onChange, readOnly }: ChecklistItemProps) => {
      return (
        <Pressable
          onPress={onChange}
          disabled={readOnly}
          style={styles.radioOption}
        >
          {/* Radio Circle */}
          <View
            style={styles.radioGroup}
          >
            {checked && (
              <View
                style={styles.radioSelected}
              />
            )}
          </View>
  
          <ThemedText type="small">
            {item}
          </ThemedText>
        </Pressable>
      );
    }
  );
  


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
  
  const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

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


  const handleFormSubmit = async (action: SubmitAction) => {
    setActiveAction(action);
  
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

      // checklist,
      // services
    });
    
    if (!valid) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: errors[0],
      });
      setActiveAction(null);
      return;
    }
    
    try {
      const isAPOrForklift =
      equipmentTypeId === EQUIPMENT_TYPES.AP ||
      equipmentTypeId === EQUIPMENT_TYPES.FORKLIFT;

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
        services: selectedServices.length > 0 ? selectedServices : undefined,
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
        checklist: isAPOrForklift
          ? finalChecklistPayload
          : undefined,

        operation_check_list: !isAPOrForklift &&
        Object.keys(checklist).length > 0
          ? checklist
          : undefined,

        is_otp_verified: "Y",
        is_pending: action === "draft" ? "Y" : "N",
        frequency: selectedServiceType ? selectedServiceType : undefined
      });

      // console.log("=== FORMDATA START ===");
      // for (const pair of formData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }
      // console.log("=== FORMDATA END ===");
     

      const res = await mutateAsync({ formData});
      if (res?.status_code === 200) {
        queryClient.invalidateQueries({
          queryKey: ["general-maintenance"],
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: action === "draft" ? "Draft Saved" : "Submitted Successfully",

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
            readOnly={readOnly || isEditing}
          />

          <FormInput label="Address" placeholder="Enter address" value={address} onChangeText={setAddress} multiline editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}/>
          <FormInput label="Contact Person" placeholder="Enter contact person" value={contactPerson} onChangeText={setContactPerson} editable={!readOnly && !isEditing}selectTextOnFocus={!readOnly && !isEditing} readOnly={readOnly || isEditing}/>
          <FormInput label="Contact No" placeholder="Enter contact number" value={contactNo} onChangeText={setContactNo} keyboardType="phone-pad" editable={!readOnly && !isEditing} selectTextOnFocus={!readOnly && !isEditing} readOnly={readOnly || isEditing}/>
          <FormInput label="Email" placeholder="Enter email" value={email} onChangeText={setEmail} editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}/>
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Equipment Details</ThemedText>
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
            readOnly={readOnly || isEditing}
          />
          {/*Equipment ID */}
          <FormDropdown
            label="Equipment ID"
            placeholder="Select equipment"
            options={equipmentOptions} // { id, name }
            selectedValue={equipmentId}
            // onValueChange={(id) => setEquipmentId(id)}
            onValueChange={handleEquipmentChange}
            readOnly={readOnly || isEditing}
          />

          <FormInput label="M/C or Serial No *" placeholder="Enter serial number" value={mcSerialNo} onChangeText={setMcSerialNo} editable={!readOnly && !isEditing} selectTextOnFocus={!readOnly && !isEditing} readOnly={readOnly || isEditing}/>
          <FormInput label="Hour Meter" placeholder="Enter hour meter reading" value={hourMeter} onChangeText={setHourMeter} keyboardType="numeric" editable={!readOnly && !isEditing} selectTextOnFocus={!readOnly && !isEditing} readOnly={readOnly || isEditing}/>
          <FormInput label="Job No" placeholder="Enter job number" value={jobNo} onChangeText={setJobNo} editable={!readOnly && !isEditing} selectTextOnFocus={!readOnly && !isEditing} readOnly={readOnly || isEditing}/>
          
         
          <FormInput label="Client Name" placeholder="Enter client name" value={clientName} onChangeText={setClientName} editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}/>
          <FormInput label="Client Contact No" placeholder="Enter client contact" value={clientContactNo} onChangeText={setClientContactNo} keyboardType="phone-pad" editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}/>
           {/* OTP Section */}
           {/* {
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
           }  */}
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Service Details</ThemedText>
          <FormInput label="Service Technician Name" placeholder="Enter technician name" value={serviceTechnicianName} onChangeText={setServiceTechnicianName} editable={!readOnly && !isEditing} selectTextOnFocus={!readOnly && !isEditing} readOnly={readOnly || isEditing}/>
          
          <ThemedText type="small" style={styles.label}>Service Times</ThemedText>
         
          {serviceTimes.map((time, index) => (
            <View key={index}  style={[styles.serviceTimeCard, { borderColor: colors.inputBorder }]}>
              {/* Delete button */}
              {!readOnly && serviceTimes.length > 1 && (
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
                readOnly={readOnly}
              />

              {/* Start & End times in row */}
              <View style={styles.timeRow}>
                 {/* START TIME */}
                  <View style={styles.serviceTimeField}>
                    <Pressable disabled={readOnly}
                      onPress={() => setActiveStartPickerIndex(index)}
                      style={readOnly && { opacity: 0.8 }}>
                      <FormInput
                        label="Start"
                        placeholder="HH:MM"
                        value={time.startTime}
                        editable={false}
                        pointerEvents="none"
                      />
                    </Pressable>

                    {activeStartPickerIndex === index && !readOnly &&(
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
                    <Pressable disabled={readOnly}
                      onPress={() => setActiveEndPickerIndex(index)}
                      style={readOnly && { opacity: 0.6 }}>
                      <FormInput
                        label="End"
                        placeholder="HH:MM"
                        value={time.endTime}
                        editable={false}
                        pointerEvents="none"
                      />
                    </Pressable>

                    {activeEndPickerIndex === index && !readOnly &&(
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
          {serviceTimes.length < 4 && !readOnly && (
            <Pressable style={[styles.addButton, { borderColor: colors.primary }]} onPress={addServiceTime}>
              <Feather name="plus" size={16} color={colors.primary} />
              <ThemedText type="small" style={{ color: colors.primary, marginLeft: Spacing.xs }}>Add Service Time</ThemedText>
            </Pressable>
          )}
          {/* Equipment Type secvice*/}
          <ThemedText type="small" style={[styles.label, { marginTop: Spacing.lg }]}>Service Type</ThemedText>
          {     
            (equipmentTypeId == "3" || equipmentTypeId == "11")
            ?   
            <View style={{ marginBottom: 10, marginTop: 10 }}> 
              <FlatList
                data={selectedChecklist}
                keyExtractor={(item) => item}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item, index }) => (
                  <View style={{ flex: 1 }}>
                    <ChecklistItem
                      item={item}
                      index={index}
                      checked={selectedServiceType === item.toLowerCase()}
                      onChange={() => setSelectedServiceType(item.toLowerCase())}
                      readOnly={readOnly}
                    />
                  </View>
                )}
              />
            </View>  
            :
            <View>
              
            <View style={styles.twoColumn}>
              <View style={styles.inputHalf}>
                <FormCheckbox
                  label="Weekly Checking"
                  checked={services.weeklyChecking}
                  onChange={(val) =>
                    setServices(prev => ({ ...prev, weeklyChecking: val }))
                  }
                  readOnly={readOnly}
                />
              </View>

              <View style={styles.inputHalf}>
                <FormCheckbox
                  label="Monthly Servicing"
                  checked={services.monthlyServicing}
                  onChange={(val) =>
                    setServices(prev => ({ ...prev, monthlyServicing: val }))
                  }
                  readOnly={readOnly}
                />
              </View>

              <View style={styles.inputHalf}>
                <FormCheckbox
                  label="Half Yearly Servicing"
                  checked={services.halfYearlyServicing}
                  onChange={(val) =>
                    setServices(prev => ({ ...prev, halfYearlyServicing: val }))
                  }
                  readOnly={readOnly}
                />
              </View>

              <View style={styles.inputHalf}>
                <FormCheckbox
                  label="Yearly Servicing"
                  checked={services.yearlyServicing}
                  onChange={(val) =>
                    setServices(prev => ({ ...prev, yearlyServicing: val }))
                  }
                  readOnly={readOnly}
                />
              </View>

              <View style={styles.inputHalf}>
                <FormCheckbox
                  label="Washing"
                  checked={services.washing}
                  onChange={(val) =>
                    setServices(prev => ({ ...prev, washing: val }))
                  }
                  readOnly={readOnly}
                />
              </View>

              <View style={styles.inputHalf}>
                <FormCheckbox
                  label="Cleaning"
                  checked={services.cleaning}
                  onChange={(val) =>
                    setServices(prev => ({ ...prev, cleaning: val }))
                  }
                  readOnly={readOnly}
                />
              </View>
            </View>
            </View>   
          }

            
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Remarks</ThemedText>
          <FormInput label="Remarks/Description" placeholder="Enter any remarks or description" value={remarks} onChangeText={setRemarks} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}/>
        </Card>

        {
          (equipmentTypeId == "3" || equipmentTypeId == "11") ?
          (
            <CheckListAPKL
              checklistData={
                isEditing
                  ? { data: formData?.v2_checklist_data || [] }
                  : checklistData
              }
              onChecklistChange={setFinalChecklistPayload}
            />
         
          )
          :
          <Card elevation={1} style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="h4" style={styles.sectionTitle}>Operation Checklist</ThemedText>
              <Pressable 
                style={[
                  styles.selectAllButton,
                  {
                    backgroundColor: readOnly
                      ? colors.inputBorder
                      : colors.primary + "15",
                    opacity: readOnly ? 0.6 : 1,
                  },
                ]}
                disabled={readOnly}
                onPress={handleSelectAllChecklist}>
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
                      readOnly={readOnly}
                    />
                  ))}
                </View>
              );
            })}
          </Card>
         }

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Parts & Lubricants Supplied:</ThemedText>
          <View style={styles.twoColumn}>
            <View style={styles.inputHalf}>
              <FormInput label="Engine Air Filter" placeholder="Enter details" value={partsLubricants.engineAirFilter} onChangeText={(v) => updatePartsLubricants("engineAirFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Engine Oil Filter" placeholder="Enter details" value={partsLubricants.engineOilFilter} onChangeText={(v) => updatePartsLubricants("engineOilFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Engine Fuel Filter" placeholder="Enter details" value={partsLubricants.engineFuelFilter} onChangeText={(v) => updatePartsLubricants("engineFuelFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Pre-Filter" placeholder="Enter details" value={partsLubricants.preFilter} onChangeText={(v) => updatePartsLubricants("preFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Water Filter" placeholder="Enter details" value={partsLubricants.waterFilter} onChangeText={(v) => updatePartsLubricants("waterFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Hydraulic Filter" placeholder="Enter details" value={partsLubricants.hydraulicFilter} onChangeText={(v) => updatePartsLubricants("hydraulicFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Engine Oil" placeholder="Enter details" value={partsLubricants.engineOil} onChangeText={(v) => updatePartsLubricants("engineOil", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Hydraulic Oil" placeholder="Enter details" value={partsLubricants.hydraulicOil} onChangeText={(v) => updatePartsLubricants("hydraulicOil", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Gear Oil" placeholder="Enter details" value={partsLubricants.gearOil} onChangeText={(v) => updatePartsLubricants("gearOil", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
          </View>
          <FormInput label="Other Parts Supplied" placeholder="Enter other parts and details" value={otherPart} onChangeText={setOtherPart} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Signatures & Completion</ThemedText>
          <SignatureBox label="Service Technician Signature" value={technicianSignature} onChange={setTechnicianSignature} readOnly={readOnly}/>
          <SignatureBox label="Alpine Supervisor Signature" value={supervisorSignature} onChange={setSupervisorSignature} readOnly={readOnly}/>
          <FormInput label="Service Department" placeholder="Enter department" value={serviceDepartment} onChangeText={setServiceDepartment} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
          <FormDatePicker label="Completion Date" value={completionDate} onChange={setCompletionDate} readOnly={readOnly}/>
        </Card>

        {!readOnly && (
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 100 }]}>
          <CustomButton 
            onPress={() => handleFormSubmit("draft")}
            disabled={
              isSubmitted || (isPending && activeAction !== "draft")
            }
            style={[styles.draftButton, { backgroundColor: colors.secondary }]}>
            {isSubmitted
              ? "Draft Disabled"
              : activeAction === "draft" && isPending
                ? <CustomLoader color="#fff" />
                : "Save as Draft"}
          </CustomButton>
          <CustomButton 
            disabled={isPending && activeAction !== "submit"}
            onPress={() => handleFormSubmit("submit")} 
            style={[styles.submitButton, { backgroundColor: colors.primary }]}>
              {activeAction === "submit" && isPending
                ? <CustomLoader color="#fff" />
                : isEditing
                  ? "Update"
                  : "Submit"}
          </CustomButton>
        </View>
        )}
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
  },
  draftButton: { marginBottom: Spacing.md },
  radioOption: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md,},
  radioGroup: {
    width: 20,
    height: 20,
    borderRadius: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary
  }
});

