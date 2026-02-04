import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import { useQueryClient } from "@tanstack/react-query";
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
import { ServiceTime, PartsLubricants } from "../types/serviceReport";
import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { Feather } from "@expo/vector-icons";
import type { ReportsStackParamList } from "../navigation/ReportsStackNavigator";
import { useCompanies } from "../hooks/useCompanies";
import { useEquipmentTypeList } from "../hooks/useEquipmentType";
import { useEquipmentListByType } from "../hooks/useEquipmentListByType";
import { buildServiceReportFormData } from "../utils/buildServiceReportFormData";
import { useStoreServiceReport } from "../hooks/useStoreServiceReport";
import { mapRawServiceReport } from "../utils/mapRawServiceReport";
import { 
  CHECKLIST_GENERAL, 
  CHECKLIST_FORKLIFT_LOADER, 
  CHECKLIST_AERIAL_PLATFORM, 
  DEFAULT_PARTS_LUBRICANTS 
} from "../constants/checklists";
import { validateForm } from "../utils/validateServiceReport";
import CustomLoader from "../components/CustomLoader";
import { CustomAlert } from "../components/CustomAlert";
import { useGenerateOTPSR } from "../hooks/useGenerateOTPSR";
import { useVerifyOTPSR } from "../hooks/useVerifyOTPSR";

type ServiceReportFormRouteProp = RouteProp<ReportsStackParamList, "ServiceReportForm">;
type ReportsNavigationProp = NativeStackNavigationProp<ReportsStackParamList>;
// type RNImage = {
//   uri: string;
//   name: string;
//   type: string;
//   size?: number;
//   isExisting?: boolean;
// };
// const MAX_IMAGES = 4;
// const MAX_IMAGE_SIZE_MB = 3;
// const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export default function ServiceReportFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ReportsNavigationProp>();
  const route = useRoute<ServiceReportFormRouteProp>();
  const colors = Colors.light;

  const queryClient = useQueryClient();

  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  type SubmitAction = "draft" | "submit" | null;
  const [activeAction, setActiveAction] = useState<SubmitAction>(null);

  const { mutateAsync, isPending } = useStoreServiceReport(token);

  const existingReport = route.params?.report || null;
  const readOnly = route.params?.readOnly ?? false;
  
  const formData = React.useMemo(
    () => (existingReport ? mapRawServiceReport(existingReport.raw) : null),
    [existingReport]
  );

  const isEditing = !!existingReport;
  const isSubmitted = isEditing && existingReport?.status === "completed";

  const [showAlert, setShowAlert] = useState(false);
  const [showVerify, setShowVerify] = useState(false);


  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<{ id: string; name: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{ id: string; name: string }[]>([]);

  const [companyName, setCompanyName] = useState(formData?.companyName || "");
  const [companyId, setCompanyId] = useState<string | null>(formData?.companyId ?? null);

  const [mcSerialNo, setMcSerialNo] = useState(formData?.mcSerialNo || "");
  const [hourMeter, setHourMeter] = useState(formData?.hourMeter || "");
  const [jobNo, setJobNo] = useState(formData?.jobNo || "");
  const [address, setAddress] = useState(formData?.address || "");
  const [equipmentTypeId, setEquipmentTypeId] = useState<string | null>(
    formData?.equipmentTypeId ?? null
  );
  
  const [equipmentTypeName, setEquipmentTypeName] = useState(formData?.equipmentTypeName || "");

  const [equipmentId, setEquipmentId] = useState(formData?.equipmentId || "");

  const [clientName, setClientName] = useState(formData?.clientName || "");
  const [otp, setOtp] = useState(formData?.clientName || "");

  const [clientContactNo, setClientContactNo] = useState(formData?.clientContactNo || "");
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(formData?.serviceTimes || [{ date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "17:00" }]);

  const [activeStartPickerIndex, setActiveStartPickerIndex] =
  useState<number | null>(null);
  const [activeEndPickerIndex, setActiveEndPickerIndex] =
  useState<number | null>(null);

  const [checking, setChecking] = useState(formData?.checking || false);
  const [servicing, setServicing] = useState(formData?.servicing || false);
  const [repair, setRepair] = useState(formData?.repair || false);
  const [remarks, setRemarks] = useState(formData?.remarks || "");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(formData?.checklist || {});

  const [isChargeable, setIsChargeable] = useState<boolean | null>(formData?.isChargeable ?? null);
  const [partsLubricants, setPartsLubricants] = useState<PartsLubricants>({
    ...DEFAULT_PARTS_LUBRICANTS,
    ...(formData?.partsLubricants ?? {}),
  });

  const [otherPartsSupplied, setOtherPartsSupplied] = useState<string[]>(
    Array(6).fill("")
  );
  
  
  const [technicianSignature, setTechnicianSignature] = useState("");
  const [clientSignature, setClientSignature] = useState("");
  const [completionDate, setCompletionDate] = useState(formData?.completionDate || new Date().toISOString().split("T")[0]);
  


  // const [images, setImages] = useState<RNImage[]>(formData?.images || []);


  const { data: companyData } = useCompanies();
  const { data: eqTypeData } = useEquipmentTypeList();
  const { data: equipmentListData } = useEquipmentListByType(equipmentTypeId);
  const {
    mutate: generateOtp,
    isPending: isOtpPending,
    isSuccess,
    error,
  } = useGenerateOTPSR();

  const {
    mutate: verifyOtp,
    isPending: isVerifying,
    isSuccess: isSuccessVerify
  } = useVerifyOTPSR();
  
  
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
    if (!equipmentTypeOptions.length) return;
    if (!equipmentTypeName) return;
  
    const matched = equipmentTypeOptions.find(
      t => t.name.trim() === equipmentTypeName.trim()
    );
  
    if (matched) {
      setEquipmentTypeId(matched.id);
    }
  }, [equipmentTypeOptions, equipmentTypeName]);
    

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
    const list = equipmentListData?.data?.equipmentList;
  
    if (list?.ids && list?.equip_id) {
      const formatted = list.equip_id.map((equipCode: string, index: number) => ({
        id: String(list.ids[index]),   
        name: equipCode,               
      }));
  
      setEquipmentOptions(formatted);
    } else {
      setEquipmentOptions([]);
    }
  }, [equipmentListData]);
  
  useEffect(() => {
    navigation.setOptions({
      headerTitle: readOnly ? "Past Service Report" : isEditing ? "Edit Service Report" : "New Service Report",
    });
  }, [isEditing, navigation]);

  useEffect(() => {
    if (formData?.checklist) {
      const mappedChecklist = mapApiChecklistDynamic(formData.checklist);
      setChecklist(mappedChecklist);
    }
  }, [formData]);
  useEffect(() => {
    if (!formData) return;
  
    const raw = formData.partsLubricants?.otherPartsSupplied;
  
    if (Array.isArray(raw)) {
      setOtherPartsSupplied([
        ...raw,
        ...Array(6 - raw.length).fill(""),
      ]);
    } 
    else if (typeof raw === "string") {
      const parsed = raw
        .split(",")
        .map(s => s.trim())
        .slice(0, 6);
  
      setOtherPartsSupplied([
        ...parsed,
        ...Array(6 - parsed.length).fill(""),
      ]);
    }
  }, [formData]);

  useEffect(() => {
    if (!formData) return;
  
    setTechnicianSignature(formData.signature_technician || "");
    setClientSignature(formData.signature_client || "");
  }, [formData]);
  
  

  const updateOtherPart = (index: number, value: string) => {
    setOtherPartsSupplied(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };
  

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

  // const pickImage = async () => {
  //   if (images.length >= MAX_IMAGES) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Image Limit",
  //       text2: "You can upload a maximum of 4 images",
  //     });
  //     return;
  //   }
  //   const { status } =
  //     await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== "granted") return;

  //   const res = await ImagePicker.launchImageLibraryAsync({
  //     allowsMultipleSelection: true,
  //     quality: 0.8,
  //   });

  //   if (!res.canceled) {
  //     const remainingSlots = MAX_IMAGES - images.length;
  
  //     const validImages = res.assets
  //       .slice(0, remainingSlots)
  //       .filter((a) => {
  //         if (a.fileSize && a.fileSize > MAX_IMAGE_SIZE_BYTES) {
  //           Toast.show({
  //             type: "error",
  //             text1: "Image Too Large",
  //             text2: "Each image must be 3 MB or less",
  //           });
  //           return false;
  //         }
  //         return true;
  //       })
  //       .map((a) => ({
  //         uri: a.uri,
  //         name: a.fileName ?? `img_${Date.now()}.jpg`,
  //         type: a.mimeType ?? "image/jpeg",
  //         size: a.fileSize,
  //       }));
  
  //     setImages((prev) => [...prev, ...validImages]);
  //   }
  // };

  // const takePhoto = async () => {
  //   if (images.length >= MAX_IMAGES) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Image Limit",
  //       text2: "You can upload a maximum of 4 images",
  //     });
  //     return;
  //   }
  //   const { status } =
  //     await ImagePicker.requestCameraPermissionsAsync();
  //   if (status !== "granted") return;

  //   const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
  //   if (!res.canceled) {
  //     const a = res.assets[0];
  
  //     if (a.fileSize && a.fileSize > MAX_IMAGE_SIZE_BYTES) {
  //       Toast.show({
  //         type: "error",
  //         text1: "Image Too Large",
  //         text2: "Each image must be 3 MB or less",
  //       });
  //       return;
  //     }
  
  //     setImages((prev) => [
  //       ...prev,
  //       {
  //         uri: a.uri,
  //         name: a.fileName ?? `photo_${Date.now()}.jpg`,
  //         type: a.mimeType ?? "image/jpeg",
  //         size: a.fileSize,
  //       },
  //     ]);
  //   }
  // };


  // const removeImage = (index: number) => {
  //   setImages((prev) => prev.filter((_, i) => i !== index));
  // };


  // Dynamically map API checklist to your state
  const mapApiChecklistDynamic = (apiChecklist: Record<string, any>) => {
    const mapped: Record<string, boolean> = {};
    ALL_CHECKLIST_ITEMS.forEach((item) => {
      mapped[item.key] = apiChecklist[item.key] === "true" || apiChecklist[item.key] === true;
    });
    return mapped;
  };
  // --- Group checklist properly ---
  const checklistGroupMap: Record<string, "general_list" | "forklift_list" | "aerial_platform_list"> = Object.fromEntries([
    ...CHECKLIST_GENERAL.map(i => [i.key, "general_list"]),
    ...CHECKLIST_FORKLIFT_LOADER.map(i => [i.key, "forklift_list"]),
    ...CHECKLIST_AERIAL_PLATFORM.map(i => [i.key, "aerial_platform_list"]),
  ]);

  const groupedChecklist = {
    general_list: {},
    forklift_list: {},
    aerial_platform_list: {},
  };

  ALL_CHECKLIST_ITEMS.forEach((item) => {
    const group = checklistGroupMap[item.key];
    if (group) groupedChecklist[group][item.key] = checklist[item.key] || false;
  });

  // --- Separate partsLubricants properly ---
  const servicingPartsLubricants: Record<string, string> = {};

  Object.entries(partsLubricants).forEach(([key, value]) => {
  
      servicingPartsLubricants[key] = value;

  });
  const filteredOtherParts = otherPartsSupplied.filter(v => v.trim() !== "");


  
  const handleSaveAsDraft = async () => {
    setActiveAction("draft");

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
      checklist,
      checking,
      servicing,
      repair,
      remarks,
      technicianSignature,
      clientSignature,
      completionDate,
      isChargeable
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
      const formData = buildServiceReportFormData({
        report_id: isEditing ? existingReport.id : 0,
        user_id: userId,
        company_name: companyId,
        company_address: address,
        job_no: jobNo,
        hr_meter: hourMeter,
        equipment_type: equipmentTypeId,
        equipment_id: equipmentId,
        serial_no: mcSerialNo,
        mc: mcSerialNo,
        date_list: serviceTimes.map(t => t.date),
        time_list: {
          start: serviceTimes.map(t => t.startTime),
          end: serviceTimes.map(t => t.endTime),
        },
        operation_check_list: groupedChecklist,
        servicing_parts_lubricants_list: servicingPartsLubricants,
        other_parts_supplied_list: filteredOtherParts,
        description_status_list: {
          checking: checking,
          servicing: servicing,
          repair: repair,
        },
        description: remarks,
        signature_technician: technicianSignature
          ? { uri: technicianSignature, name: "technician-signature.jpg", type: "image/jpeg" }
          : undefined,
        signature_client: clientSignature
          ? { uri: clientSignature, name: "client-signature.jpg", type: "image/jpeg" }
          : undefined,
        filled_date: completionDate instanceof Date ? completionDate.toISOString() : completionDate,
        is_chargable: isChargeable === null ? "N" : isChargeable ? "Y" : "N",
        client_name: clientName,
        client_tel_no: clientContactNo,
      });
      // console.log("=== FORMDATA START ===");
      // for (const pair of formData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }
      // console.log("=== FORMDATA END ===");
      
      const res = await mutateAsync({ formData, mode: "draft" });
      if (res) {
        queryClient.invalidateQueries({
          queryKey: ["service-reports"],
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Service report saved as draft",
        });
        navigation.goBack()
      }

    } catch (error) {
      console.error("Failed to submit service report:", error);
       Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to draft report",
      });
    }
    finally {
      setActiveAction(null);
    }
  };

  const handleSubmit = async () => {
    setActiveAction("submit");

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
      checklist,
      checking,
      servicing,
      repair,
      remarks,
      technicianSignature,
      clientSignature,
      completionDate,
      isChargeable
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
      const formData = buildServiceReportFormData({
        report_id: isEditing ? existingReport.id : 0,
        user_id: userId,
        company_name: companyId,
        company_address: address,
        job_no: jobNo,
        hr_meter: hourMeter,
        equipment_type: equipmentTypeId,
        equipment_id: equipmentId,
        serial_no: mcSerialNo,
        mc: mcSerialNo,
        date_list: serviceTimes.map(t => t.date),
        time_list: {
          start: serviceTimes.map(t => t.startTime),
          end: serviceTimes.map(t => t.endTime),
        },
        operation_check_list: groupedChecklist,
        servicing_parts_lubricants_list: servicingPartsLubricants,
        other_parts_supplied_list: filteredOtherParts,
        description_status_list: {
          checking: checking,
          servicing: servicing,
          repair: repair,
        },
        description: remarks,
        signature_technician: technicianSignature
          ? { uri: technicianSignature, name: "technician-signature.jpg", type: "image/jpeg" }
          : undefined,
        signature_client: clientSignature
          ? { uri: clientSignature, name: "client-signature.jpg", type: "image/jpeg" }
          : undefined,
        filled_date: completionDate instanceof Date ? completionDate.toISOString() : completionDate,
        is_chargable: isChargeable === null ? "N" : isChargeable ? "Y" : "N",
        client_name: clientName,
        client_tel_no: clientContactNo,
        // images,
      });

      // console.log("=== FORMDATA START ===");
      // for (const pair of formData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }
      // console.log("=== FORMDATA END ===");
      
      const res = await mutateAsync({ formData, mode: "submit" });
      if (res) {
        queryClient.invalidateQueries({
          queryKey: ["service-reports"],
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Service report saved successfully.",
        });
        navigation.goBack()
      }
    } catch (error) {
      console.error("Failed to submit service report:", error);
       Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save report",
      });
    }
    finally {
      setActiveAction(null);
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

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        {/* Company Details */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Company Details</ThemedText>

          <FormDropdown
            label="Company *"
            placeholder="Select company"
            options={companyOptions}
            selectedValue={companyId}
            onValueChange={(id) => setCompanyId(id)}
            readOnly={readOnly}
          />

          <FormInput 
            label="Address" 
            placeholder="Enter address" 
            value={address} 
            onChangeText={setAddress} 
            multiline 
            editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}
          />
        </Card>

        {/* Equipment Details */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Equipment Details</ThemedText>
          <FormInput label="M/C or Serial No *" placeholder="Enter serial number" value={mcSerialNo} onChangeText={setMcSerialNo} editable={!readOnly}
            selectTextOnFocus={!readOnly} readOnly={readOnly}/>
          <FormInput label="Hour Meter" placeholder="Enter hour meter reading" value={hourMeter} onChangeText={setHourMeter} keyboardType="numeric" editable={!readOnly}
            selectTextOnFocus={!readOnly} readOnly={readOnly}/>
          <FormInput label="Job No" placeholder="Enter job number" value={jobNo} onChangeText={setJobNo} editable={!readOnly}
            selectTextOnFocus={!readOnly} readOnly={readOnly}/>

          <FormDropdown
            label="Equipment Type"
            placeholder="Select equipment type"
            options={equipmentTypeOptions} // { id, name }
            selectedValue={equipmentTypeId}
            onValueChange={(id) => {
              setEquipmentTypeId(id);
              setEquipmentId(""); // reset equipment
            }}
            readOnly={readOnly}
          />

          <FormDropdown
            label="Equipment ID"
            placeholder="Select equipment"
            options={equipmentOptions} // { id, name }
            selectedValue={equipmentId}
            onValueChange={(id) => setEquipmentId(id)}
            readOnly={readOnly}
          />

          <FormInput label="Client Name" placeholder="Enter client name" value={clientName} onChangeText={setClientName} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
          <FormInput label="Client Contact No" placeholder="Enter client contact" value={clientContactNo} onChangeText={setClientContactNo} keyboardType="phone-pad" editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>

          {/* OTP Section */}
          {
            isEditing ? <ThemedText type="body" style={styles.verifiedText}>Contact Number Verified</ThemedText> :
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
                    {isPending ? <CustomLoader color="#fff" />: "Generate OTP"}</CustomButton>
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
                      <CustomButton onPress={veriftOtp} style={[ { backgroundColor: colors.primary, marginTop: Spacing.lg }]}>{isPending ? <CustomLoader color="#fff" />: "Verify"}</CustomButton> 
                    </View>
                    <View style={styles.inputHalf}>
                      <CustomButton onPress={() => {}} style={[ { backgroundColor: colors.primary, marginTop: Spacing.lg }]}>{isPending ? <CustomLoader color="#fff" />: "Resend"}</CustomButton> 
                    </View>
                  </View>
                }             
              </View>
          </View>
          }
          
        </Card>

        {/* Service Details */}
        <Card elevation={1} style={styles.section}>
          
          <ThemedText type="small" style={styles.label}>Service Times</ThemedText>
          {serviceTimes.map((time, index) => (
            <View key={index} style={[styles.serviceTimeCard, { borderColor: colors.inputBorder }]}>
              {!readOnly && serviceTimes.length > 1 && (
                <Pressable
                style={styles.deleteButton}
                onPress={() => removeServiceTime(index)}
              ><Feather name="trash-2" size={16} color={colors.buttonText} /></Pressable>
              )}
              <FormDatePicker label="Date" value={time.date} onChange={(v) => updateServiceTime(index, "date", v)} readOnly={readOnly}/>
              <View style={styles.timeRow}>
                 {/* START TIME */}
                  <View style={styles.serviceTimeField}>
                    <Pressable 
                      disabled={readOnly}
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

                    {activeStartPickerIndex === index && !readOnly && (
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
                    <Pressable
                      disabled={readOnly}
                      onPress={() => setActiveEndPickerIndex(index)}
                      style={readOnly && { opacity: 0.6 }}
                    >
                      <FormInput
                        label="End"
                        placeholder="HH:MM"
                        value={time.endTime}
                        editable={false}
                        pointerEvents="none"
                      />
                    </Pressable>

                    {activeEndPickerIndex === index && !readOnly && (
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
          {serviceTimes.length < 4 && !readOnly && <Pressable style={[styles.addButton, { borderColor: colors.primary }]} onPress={addServiceTime}><Feather name="plus" size={16} color={colors.primary} /><ThemedText type="small" style={{ color: colors.primary, marginLeft: Spacing.xs }}>Add Service Time</ThemedText></Pressable>}
         
        </Card>

        {/* Operation Checklist */}
        <Card elevation={1} style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4" style={styles.sectionTitle}>OPERATION CHECK LISTS:</ThemedText>
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
              onPress={handleSelectAllChecklist}
            >
              <Feather name={isAllChecklistSelected ? "check-square" : "square"} size={16} color={colors.primary}/>
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
                  readOnly={readOnly}
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
                  readOnly={readOnly}
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
                 readOnly={readOnly}
               />
              ))}
            </View>
          </View>
        </Card>

        {/* Parts & Lubricants */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Parts & Lubricants Supplied:</ThemedText>
          <View style={styles.twoColumn}>
            <View style={styles.inputHalf}>
              <FormInput
                label="Engine Air Filter (Pri)"
                placeholder="Enter details"
                value={partsLubricants.engineAirFilterPri}
                onChangeText={(v) => updatePartsLubricants("engineAirFilterPri", v)}
                editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}
                />
            </View>
            <View style={styles.inputHalf}>
                <FormInput
                  label="Engine Air Filter (Sec)"
                  placeholder="Enter details"
                  value={partsLubricants.engineAirFilterSec}
                  onChangeText={(v) => updatePartsLubricants("engineAirFilterSec", v)}
                  editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}
                />
            </View>  
            <View style={styles.inputHalf}>
              <FormInput label="Compressor Air Filter(Pri)" placeholder="Enter details" value={partsLubricants.compressorAirFilterPri} onChangeText={(v) => updatePartsLubricants("compressorAirFilterPri", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Compressor Air Filter(Sec)" placeholder="Enter details" value={partsLubricants.compressorAirFilterSec} onChangeText={(v) => updatePartsLubricants("compressorAirFilterSec", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Oil Filter(Pri)" placeholder="Enter details" value={partsLubricants.oilFilterPri} onChangeText={(v) => updatePartsLubricants("oilFilterPri", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Oil Filter(Sec)" placeholder="Enter details" value={partsLubricants.oilFilterSec} onChangeText={(v) => updatePartsLubricants("oilFilterSec", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Compressor Oil Filter(Pri)" placeholder="Enter details" value={partsLubricants.compressorOilFilterPri} onChangeText={(v) => updatePartsLubricants("compressorOilFilterPri", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Fuel Filter" placeholder="Enter details" value={partsLubricants.fuelFilter} onChangeText={(v) => updatePartsLubricants("fuelFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Racor Filter" placeholder="Enter details" value={partsLubricants.racorFilter} onChangeText={(v) => updatePartsLubricants("racorFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Hydraulic Filter" placeholder="Enter details" value={partsLubricants.hydraulicFilter} onChangeText={(v) => updatePartsLubricants("hydraulicFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Water Filter" placeholder="Enter details" value={partsLubricants.waterFilter} onChangeText={(v) => updatePartsLubricants("waterFilter", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Engine Oil" placeholder="Enter details" value={partsLubricants.engineOil} onChangeText={(v) => updatePartsLubricants("engineOil", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Compressor Oil" placeholder="Enter details" value={partsLubricants.compressorOil} onChangeText={(v) => updatePartsLubricants("compressorOil", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Hydraulic Oil" placeholder="Enter details" value={partsLubricants.hydraulicOil} onChangeText={(v) => updatePartsLubricants("hydraulicOil", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>
            <View style={styles.inputHalf}>
              <FormInput label="Transmission Oil" placeholder="Enter details" value={partsLubricants.transmissionOil} onChangeText={(v) => updatePartsLubricants("transmissionOil", v)} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
            </View>   
          </View>
          <ThemedText type="small" style={{ marginBottom: Spacing.sm, fontWeight: "500" }}>
            Other Parts Supplied
          </ThemedText>
          <View style={styles.twoColumn}>
            {otherPartsSupplied.map((value, index) => (
              <View key={index} style={styles.inputHalf}>
                <FormInput
                  placeholder={`Other Part ${index + 1}`}
                  value={value}
                  onChangeText={(v) => updateOtherPart(index, v)}
                  editable={!readOnly} selectTextOnFocus={!readOnly}
                  readOnly={readOnly}
                />
              </View>
            ))}
          </View>

        </Card>

        {/* Images */}
        {/* <Card elevation={1} style={styles.section}>
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
               {images.map((img, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    source={{ uri: img.uri }}
                    style={styles.imagePreview}
                    contentFit="cover"
                  />
                  <View style={styles.imageIndexBadge}>
                    <Text style={styles.imageIndexText}>{index + 1}</Text>
                  </View>
                  <Pressable
                    style={[styles.imageRemoveButton, { backgroundColor: colors.error }]}
                    onPress={() => removeImage(index)}
                  >
                    <Feather name="x" size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )} 
        </Card> */}

        {/* Remarks */}
        <Card elevation={1} style={styles.section}>

          <ThemedText type="h4" style={[styles.label, { marginTop: Spacing.lg }]}>Service Type</ThemedText>
          <View style={styles.checkingService}>
            <FormCheckbox label="Checking" checked={checking} onChange={setChecking} readOnly={readOnly}/>
            <FormCheckbox label="Servicing" checked={servicing} onChange={setServicing} readOnly={readOnly}/>
            <FormCheckbox label="Repair" checked={repair} onChange={setRepair} readOnly={readOnly}/>
          </View>
          <ThemedText type="h4" style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Remarks</ThemedText>
          <FormInput label="Remarks/Description" placeholder="Enter any remarks or description" value={remarks} onChangeText={setRemarks} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>
        </Card>

        {/* Signatures & Completion */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Signatures & Completion</ThemedText>
      
          <SignatureBox
            label="Technician Signature"
            value={technicianSignature}
            onChange={setTechnicianSignature}
            readOnly={readOnly}
            // disabled={isEditing}
          />
          <SignatureBox
            label="Customer Signature"
            value={clientSignature}
            onChange={setClientSignature}
            readOnly={readOnly}
            // disabled={isEditing}
          />

          <FormDatePicker label="Completion Date" value={completionDate} onChange={setCompletionDate} readOnly={readOnly}/>
        </Card>

        {/* Chargeable radio */}
        <Card elevation={1} style={styles.section}>
          <View style={styles.radioGroup}>
            <Pressable style={styles.radioOption} onPress={() => setIsChargeable(true)} disabled={readOnly}>
              <View style={[styles.radioCircle, { borderColor: colors.inputBorder }]}>{isChargeable === true ? <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} /> : null}</View>
              <ThemedText type="body">Chargeable</ThemedText>
            </Pressable>
            <Pressable style={styles.radioOption} onPress={() => setIsChargeable(false)} disabled={readOnly}>
              <View style={[styles.radioCircle, { borderColor: colors.inputBorder }]}>{isChargeable === false ? <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} /> : null}</View>
              <ThemedText type="body">Not Chargeable</ThemedText>
            </Pressable>
          </View>
        </Card>

        {/* Buttons */}
        {!readOnly && (
          <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 100 }]}>
            <CustomButton 
              onPress={handleSaveAsDraft}
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
              onPress={handleSubmit} 
              style={[styles.submitButton, { backgroundColor: colors.primary }]}>
                {activeAction === "submit" && isPending
                  ? <CustomLoader color="#fff" />
                  : isEditing
                    ? "Update Report"
                    : "Submit Report"}
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
  checkingService: {flexDirection: "row", gap: 8},
  twoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10
  },
  inputHalf: {
    width: "48%", 
  },
  imageIndexBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  imageIndexText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  verifiedText: {
    color: Colors.light.success,
    textAlign: "center",
    fontWeight: "bold"
  }
});
