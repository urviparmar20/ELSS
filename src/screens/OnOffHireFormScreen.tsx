
import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Pressable, Platform, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { Card } from "../components/Card";
import { Image } from "expo-image";
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
import { ONOffHireStackParamList } from "../navigation/OnOffHireStackNavigator";
import { mapRawGM } from "../utils/mapRawGM";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useOnOffHireCategory } from "../hooks/useOnOffHireCategory";
import OnOffHireCategoryChecklist, {
  ChecklistItem,
} from "../components/OnOffHireCategoryChecklist";
import { useEquipmentTypeList } from "../hooks/useEquipmentType";
import { useEquipmentListByType } from "../hooks/useEquipmentListByType";
import { validateForm } from "../utils/validateOnOffHire";
import { buildOnOffHireFormData } from "../utils/buildOnOffHireFormData";
import { downloadRemoteFile } from "../utils/downloadRemoteFile";
import { ensureFileExists } from "../utils/ensureFileExists";
import { useStoreOnOffHire } from "../hooks/useStoreOnOffHire";
import { useCompanies } from "../hooks/useCompanies";
import { isCompanyV2Enabled } from "../utils/appVersion";
import { resetOnOffHireForm } from "../utils/resetOnOffHireForm";
import CustomLoader from "../components/CustomLoader";

type OnOffHireFormRouteProp = RouteProp<ONOffHireStackParamList, "OnOffHireForm">;
type OnOffHireNavigationProp = NativeStackNavigationProp<ONOffHireStackParamList>;

const SERVICE_REVERSE_MAP: Record<string, keyof typeof services> = {
  "On Hiring Checking": "onHiringChecking",
  "External Condition":  "externalCondition",
  "Washing / Cleaning":  "washingCleaning",
  "Painting Checking":  "paintingChecking",
  "Internal Checking":  "internalChecking",
  "Running Condition":  "runningCondition",
};

type RNImage = {
  uri: string;
  name: string;
  type: string;
  size?: number;
  isExisting?: boolean;
};
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 3;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export default function OnOffHireFormScreen() {

  const queryClient = useQueryClient();
  const navigation = useNavigation<OnOffHireNavigationProp>();

  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);
  const insets = useSafeAreaInsets();
  const route = useRoute<OnOffHireFormRouteProp>();
  const colors = Colors.light;
  const scrollViewRef = useRef<any>(null);

  const existingReport = route.params?.report || null;
  const readOnly = route.params?.readOnly ?? false;
  const gmId = route.params?.gm_id;  

  const isEditing = !!existingReport;
  const isSubmitted = isEditing && existingReport?.is_pending === "N";

  const formData = React.useMemo(
    () => (existingReport ? mapRawGM(existingReport) : null),
    [existingReport]
  );
  const [isAutoSerialNo, setIsAutoSerialNo] = useState(false);
  const [hireType, setHireType] = useState<"ON" | "OFF">("ON");

  const [address, setAddress] = useState(formData?.address || "");
  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [companyId, setCompanyId] = useState(formData?.companyId || "");
  const [companyName, setCompanyName] = useState(formData?.companyName || "");
  const [contactPersonOptions, setContactPersonOptions] = useState<
  { id: string; name: string; phone?: string; email?: string }[]
  >([]);
  const [location, setLocation] = useState(formData?.location || "")
  const [contactPerson, setContactPerson] = useState(formData?.contactPerson || "");
  const [selectedContactPersonId, setSelectedContactPersonId] = useState("");

  const [contactNo, setContactNo] = useState(formData?.contactNo || "");
  const [mcSerialNo, setMcSerialNo] = useState(formData?.mcSerialNo || "");
  const [hourMeter, setHourMeter] = useState(formData?.hourMeter || "");
  const [remarks, setRemarks] = useState(formData?.remarks || "");
  const [serviceTechnician, setServiceTechnician] = useState(formData?.serviceTechnician || ""); 
  const [technicianSignature, setTechnicianSignature] = useState("");
  const [acceptedBy, setAcceptedBy] = useState(formData?.acceptedBy || "");
  const [acceptedbySignature, setAcceptedbySignature] = useState("");
  const [nRIC, setNRIC] = useState(formData?.nRIC || "");
  const [contractorName, setContractorName] = useState(formData?.contractorName || "");
  const [images, setImages] = useState<RNImage[]>(formData?.images || []);

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const [date, setDate] = useState(formData?.completionDate || new Date().toISOString().split("T")[0]);
  const [hireDate, setHireDate] = useState(formData?.completionDate || new Date().toISOString().split("T")[0]);

  const [services, setServices] = useState({
    onHiringChecking: false,
    offHiringChecking: false,
    externalCondition: false,
    washingCleaning: false,
    paintingChecking: false,
    internalChecking: false,
    runningCondition: false,
  });

  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<
  { id: string; name: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{ id: string; name: string; serialNo: string }[]>([]);
  const [equipmentTypeId, setEquipmentTypeId] = useState<string | null>(
    formData?.equipmentTypeId ?? null
  );

  const [equipmentId, setEquipmentId] = useState(formData?.equipmentId || "");

  const conditionList = {
    on_hire_checking: services.onHiringChecking,
    off_hire_checking: services.offHiringChecking,
    external_condition: services.externalCondition,
    washing_or_cleaning: services.washingCleaning,
    painting_checking: services.paintingChecking,
    internal_checking: services.internalChecking,
    running_condition: services.runningCondition,
  };

  const getDefaultServices = () => ({
    onHiringChecking: false,
    offHiringChecking: false,
    externalCondition: false,
    washingCleaning: false,
    paintingChecking: false,
    internalChecking: false,
    runningCondition: false,
  });
  
  const clearForm = () => {
    resetOnOffHireForm({
      setAddress,
      setLocation,
      setEquipmentTypeId,
      setEquipmentId,
      setMcSerialNo,
      setHourMeter,
      setIsAutoSerialNo,
      setServices,
      getDefaultServices,
      setChecklist,
      setImages,
      setRemarks,
      setServiceTechnician,
      setTechnicianSignature,
      setAcceptedBy,
      setAcceptedbySignature,
      setNRIC,
      setContractorName,
      setDate,
      setHireDate,
    });
  };

  const { data: onOffHireCategoryData } = useOnOffHireCategory(equipmentTypeId);  
  const { data: eqTypeData } = useEquipmentTypeList();
  const { data: companyData } = useCompanies();
  const { data: equipmentListData } = useEquipmentListByType(equipmentTypeId);
  const { mutateAsync: createOnOffHire, isPending: isCreatePending, } = useStoreOnOffHire(token, hireType); 

  const {
    mutateAsync: updateOnOffHire,
    isPending: isUpdatePending,
  } = useStoreOnOffHire(token, hireType);
  
  const isPending = isCreatePending || isUpdatePending; 


  useEffect(() => {
    if (onOffHireCategoryData?.data?.category) {
      setChecklist(onOffHireCategoryData.data.category);
    }
  }, [onOffHireCategoryData]);

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
   //Company
   useEffect(() => {
    if(isCompanyV2Enabled())
    {
      const companies = companyData?.data?.companies;
      
      if (Array.isArray(companies)) {
        const formattedCompanies = companies.map((item: any) => ({
          id: String(item.id),
          name: item.company_name,
        }));
    
        setCompanyOptions(formattedCompanies);
      }
    }
    else
    {
      const company = companyData?.data?.company;
    
      if (!companyOptions.length && company?.company_names && company?.ids) {
        const companiesArr = company.company_names.map((name: string, index: number) => ({
          id: String(company.ids[index]),
          name,
        }));
        setCompanyOptions(companiesArr);
      }
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


  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Toast.show({
        type: "error",
        text1: "Image Limit",
        text2: `You can upload a maximum of ${MAX_IMAGES} images`,
      });
      return;
    }
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!res.canceled) {
      const remainingSlots = MAX_IMAGES - images.length;
  
      const validImages = res.assets
        .slice(0, remainingSlots)
        .filter((a) => {
          if (a.fileSize && a.fileSize > MAX_IMAGE_SIZE_BYTES) {
            Toast.show({
              type: "error",
              text1: "Image Too Large",
              text2: "Each image must be 3 MB or less",
            });
            return false;
          }
          return true;
        })
        .map((a) => ({
          uri: a.uri,
          name: a.fileName ?? `img_${Date.now()}.jpg`,
          type: a.mimeType ?? "image/jpeg",
          size: a.fileSize,
        }));
  
      setImages((prev) => [...prev, ...validImages]);
    }
  };

  const takePhoto = async () => {
    if (images.length >= MAX_IMAGES) {
      Toast.show({
        type: "error",
        text1: "Image Limit",
        text2: "You can upload a maximum of 5 images",
      });
      return;
    }
    const { status } =
      await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;

    const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!res.canceled) {
      const a = res.assets[0];
  
      if (a.fileSize && a.fileSize > MAX_IMAGE_SIZE_BYTES) {
        Toast.show({
          type: "error",
          text1: "Image Too Large",
          text2: "Each image must be 3 MB or less",
        });
        return;
      }
  
      setImages((prev) => [
        ...prev,
        {
          uri: a.uri,
          name: a.fileName ?? `photo_${Date.now()}.jpg`,
          type: a.mimeType ?? "image/jpeg",
          size: a.fileSize,
        },
      ]);
    }
  };


  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

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
      setIsAutoSerialNo(true); // disable editing
    } else {
      // allow manual entry
      setMcSerialNo("");
      setIsAutoSerialNo(false); // enable editing
    }
  };

  const handleChecklistChange = (
    updatedData: ChecklistItem[]
  ) => {
    setChecklist(updatedData);

    console.log("Updated Checklist:", updatedData);
  };
  const resetFormAndScrollTop = () => {
    clearForm();
  
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: 0,
        y: 0,
        animated: true,
      });
    }, 100);
  };
  const handleCompanySelect = (id: string) => {    
    if (isCompanyV2Enabled()) {
      handleCompanyChange(id);
    } else {
      setCompanyId(id);
    }
  };

  const handleCompanyChange = (id: string) => {
    setCompanyId(id);
  
    const company = companyData?.data?.companies?.find(
      (item: any) => String(item.id) === id
    );
  
    if (!company) return;
  
    // Address
    setAddress(
      [
        company.address?.address_line_1,
        company.address?.address_line_2,
        company.address?.postal_code,
        company.address?.country,
      ]
        .filter(Boolean)
        .join(", ")
    );
  
    // Contact Person Dropdown
    const contacts =
      company.contact_persons?.map((person: any, index: number) => ({
        id: String(person.id ?? index),
        name:
          person.name ||
          person.contact_person ||
          person.contact_person_name ||
          `Contact ${index + 1}`,
        phone: person.contact_no || person.phone || "",
        email: person.email || "",
      })) || [];
  
    setContactPersonOptions(contacts);
  
    // Reset previous selection
    if (!isEditing) {
      setSelectedContactPersonId("");
      setContactPerson("");
      setContactNo("");
    }
  };

  const handleContactPersonChange = (id: string) => {
    setSelectedContactPersonId(id);
  
    const selected = contactPersonOptions.find(
      (item) => item.id === id
    );
  
    if (!selected) return;
  
    setContactPerson(selected.name);
    setContactNo(selected.phone || "");
  };
  const formatDateDDMMYYYY = (dateString: string) => {
    const d = new Date(dateString);
  
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  const handleFormSubmit = async() => {
    const { valid, errors } = validateForm({
      companyId,
      address,
      location,
      contactPerson,
      contactNo,
      date,
      equipmentType: equipmentId,
      equipmentId,
      mcSerialNo,
      hourMeter,
      remarks,
      technician: serviceTechnician,
      signatureTechnician: technicianSignature,
      acceptedBy,
      signatureAcceptedBy: acceptedbySignature,
      hireDate,
      contractorName,
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
      
       // 1. normalize URIs
       let techUri = technicianSignature;
       let supUri = acceptedbySignature;
   
       // 2. convert remote → local if needed
       if (techUri?.startsWith("http")) {
         techUri = await downloadRemoteFile(techUri);
       }
   
       if (supUri?.startsWith("http")) {
         supUri = await downloadRemoteFile(supUri);
       }
   
       // 3. IMPORTANT: ensure files are ready
       if (techUri) await ensureFileExists(techUri);
       if (supUri) await ensureFileExists(supUri);
   
       const cleanedContactNo = String(contactNo).replace(/\D/g, "");
      // Build FormData (fresh instance always)
      const payload = buildOnOffHireFormData({
        onOffId: isEditing ? existingReport?.id : 0,
        userId,
        company_name: companyId,
        address,
        location,
        contactPerson,
        contactNo: cleanedContactNo,
        date: formatDateDDMMYYYY(date),
        equipmentType: equipmentTypeId || "",
        equipmentId: equipmentId,
        hourMeter,
        mcSerialNo,
        services: conditionList,
        checklist,
        images,
        remarks,
        technician: serviceTechnician,
        signatureTechnician: techUri
          ? { uri: techUri, name: "tech.png", type: "image/png" }
          : undefined,
        acceptedBy,
        signatureAcceptedBy: supUri
          ? { uri: supUri, name: "sup.png", type: "image/png" }
          : undefined,
        hireDate: formatDateDDMMYYYY(hireDate),
        nricWpPs:nRIC,
        contractorName
      });
  
      //  clone FormData (prevents RN mutation bug)
      const safeFormData = new FormData();
      (payload as any)._parts?.forEach(([k, v]: any) => {
        safeFormData.append(k, v);
        console.log('safeFormData', k, v);
      });
  
      //  6. retry wrapper (prevents first-call network glitch)
      const uploadWithRetry = async (data: FormData) => {
        let lastErr;
  
        for (let i = 0; i < 3; i++) {
          try {
            return await createOnOffHire({ formData: data });
          } catch (e) {
            lastErr = e;
            await new Promise(r => setTimeout(r, 700));
          }
        }
  
        throw lastErr;
      };
  
      const res = await uploadWithRetry(safeFormData);
      console.log("SUBMIT RESPONSE", res);

      if (res?.status_code === 200) {
        console.log("INVALIDATING...");
        
        await queryClient.invalidateQueries({
          queryKey: ["on-off-hire-list"],
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Submitted Successfully",
        });
  
        navigation.navigate("OnOffHireList");
      
        console.log("INVALIDATED");
      }
  
    } catch (error: any) {
      console.log("SUBMIT ERROR:", error);
    
      let errorMessage = "Something went wrong";
    
      try {
        const match = error?.message?.match(/\{.*\}/);
    
        if (match) {
          const parsed = JSON.parse(match[0]);
          errorMessage = parsed?.message || errorMessage;
        }
      } catch (e) {
        console.log("PARSE ERROR:", e);
      }
    
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } 
  }

  return ( 
    <ThemedView style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.row}>
          <CustomButton
            onPress={() => {
              if (hireType !== "ON") {
                setHireType("ON");
                resetFormAndScrollTop();
              }
            }}
            style={[
              styles.button,
              hireType !== "ON" && styles.inactiveButton,
            ]}
            textStyle={
              hireType !== "ON"
                ? { color: "red" }
                : undefined
            }
          >
            On Hire
          </CustomButton>

          <CustomButton
            onPress={() => {
              if (hireType !== "OFF") {
                setHireType("OFF");
                resetFormAndScrollTop();
              }
            }}
            style={[
              styles.button,
              hireType !== "OFF" && styles.inactiveButton,
            ]}
            textStyle={
              hireType !== "OFF"
                ? { color: "red" }
                : undefined
            }
          >
            Off Hire
          </CustomButton>
        </View>
      </View>

      {/* Scrollable Content */}
      <KeyboardAwareScrollViewCompat 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing["6xl"], paddingTop: 90, }]}   
        ref={scrollViewRef}
        keyboardShouldPersistTaps="handled"

      >
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Details</ThemedText>

          {/* Company */}
          <FormDropdown
            label="Company *"
            placeholder="Select company"
            options={companyOptions}
            selectedValue={companyId}
            onValueChange={handleCompanySelect}
            readOnly={readOnly || isEditing}
          />
         
          <FormInput 
            label="Address" 
            placeholder="Enter address" 
            value={address} 
            onChangeText={setAddress} 
            multiline editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}/>

          <FormInput 
            label="Location" 
            placeholder="Enter location" 
            value={location} 
            onChangeText={setLocation} 
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}/>
          
          {isCompanyV2Enabled() ? (
              <FormDropdown
              label="Contact Person"
              placeholder="Select contact person"
              options={contactPersonOptions}
              selectedValue={selectedContactPersonId}
              onValueChange={handleContactPersonChange}
              readOnly={readOnly || isEditing}
            />
            ) : (
              <FormInput label="Contact Person" placeholder="Enter contact person" value={contactPerson} onChangeText={setContactPerson} editable={!readOnly && !isEditing}selectTextOnFocus={!readOnly && !isEditing} readOnly={readOnly || isEditing}/>
          )}
          
          <FormInput 
            label="Contact No" 
            placeholder="Enter contact number" 
            value={contactNo} 
            onChangeText={setContactNo} 
            keyboardType="phone-pad" 
            // editable={!readOnly && !isEditing} 
            // selectTextOnFocus={!readOnly && !isEditing} 
            // readOnly={readOnly || isEditing}
            />

          <FormDatePicker 
            label="Date" 
            value={date} 
            onChange={setDate} 
            readOnly={readOnly}
          />

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
            // readOnly={readOnly || isEditing}
          />
          {/*Equipment ID */}
          <FormDropdown
            label="Equipment ID"
            placeholder="Select equipment"
            options={equipmentOptions} // { id, name }
            selectedValue={equipmentId}
            // onValueChange={(id) => setEquipmentId(id)}
            onValueChange={handleEquipmentChange}
            // readOnly={readOnly || isEditing}
            searchable
          />

          <FormInput
            label="M/C or Serial No *"
            placeholder="Enter serial number"
            value={mcSerialNo}
            onChangeText={setMcSerialNo}
            editable={!readOnly && !isAutoSerialNo}
            selectTextOnFocus={!readOnly && !isAutoSerialNo}
            readOnly={readOnly || isAutoSerialNo}
          />
          <FormInput label="Hour Meter" placeholder="Enter hour meter reading" value={hourMeter} onChangeText={setHourMeter} keyboardType="numeric" editable={!readOnly} selectTextOnFocus={!readOnly} readOnly={readOnly}/>

          
        </Card>
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Service Type
          </ThemedText>

          <View style={styles.twoColumn}>
            <View style={styles.inputHalf}>
              <FormCheckbox
                label={
                  hireType === "ON"
                    ? "On Hiring Checking"
                    : "Off Hiring Checking"
                }
                checked={
                  hireType === "ON"
                    ? services.onHiringChecking
                    : services.offHiringChecking
                }
                onChange={(val) =>
                  setServices((prev) => ({
                    ...prev,
                    [hireType === "ON"
                      ? "onHiringChecking"
                      : "offHiringChecking"]: val,
                  }))
                }
                readOnly={readOnly}
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="External Condition"
                checked={services.externalCondition}
                onChange={(val) =>
                  setServices((prev) => ({
                    ...prev,
                    externalCondition: val,
                  }))
                }
                readOnly={readOnly}
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Washing / Cleaning"
                checked={services.washingCleaning}
                onChange={(val) =>
                  setServices((prev) => ({
                    ...prev,
                    washingCleaning: val,
                  }))
                }
                readOnly={readOnly}
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Painting Checking"
                checked={services.paintingChecking}
                onChange={(val) =>
                  setServices((prev) => ({
                    ...prev,
                    paintingChecking: val,
                  }))
                }
                readOnly={readOnly}
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Internal Checking"
                checked={services.internalChecking}
                onChange={(val) =>
                  setServices((prev) => ({
                    ...prev,
                    internalChecking: val,
                  }))
                }
                readOnly={readOnly}
              />
            </View>

            <View style={styles.inputHalf}>
              <FormCheckbox
                label="Running Condition"
                checked={services.runningCondition}
                onChange={(val) =>
                  setServices((prev) => ({
                    ...prev,
                    runningCondition: val,
                  }))
                }
                readOnly={readOnly}
              />
            </View>
          </View>
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4">
            {hireType === "ON"
              ? "On Hire Checklist"
              : "Off Hire Checklist"}
          </ThemedText>
            <OnOffHireCategoryChecklist
              data={checklist}
              onChange={handleChecklistChange}
            />
        </Card>

        {/* Images */}
        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={[styles.sectionTitle, { marginBottom: Spacing.md }]}>
            Images
          </ThemedText>

          {!isSubmitted && (<ThemedText
            type="small"
            style={{ color: colors.textSecondary, marginBottom: Spacing.md }}
          >
            Add photos of the equipment or service work
          </ThemedText>)}

          {/* Hide buttons when submitted */}
          {!isSubmitted && (
            <View style={styles.imageButtonsRow}>
              <Pressable
                style={[
                  styles.imageButton,
                  { backgroundColor: colors.primary + "15" },
                ]}
                onPress={takePhoto}
              >
                <Feather name="camera" size={20} color={colors.primary} />
                <ThemedText
                  type="small"
                  style={{
                    color: colors.primary,
                    marginLeft: Spacing.sm,
                    marginTop: Spacing.sm,
                  }}
                >
                  Take Photo
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.imageButton,
                  { backgroundColor: colors.primary + "15" },
                ]}
                onPress={pickImage}
              >
                <Feather name="image" size={20} color={colors.primary} />
                <ThemedText
                  type="small"
                  style={{
                    color: colors.primary,
                    marginLeft: Spacing.sm,
                    marginTop: Spacing.sm,
                  }}
                >
                  Choose from Gallery
                </ThemedText>
              </Pressable>
            </View>
          )}

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
                    <ThemedText style={styles.imageIndexText}>
                      {index + 1}
                    </ThemedText>
                  </View>

                  {/* Hide remove button when submitted */}
                  {!isSubmitted && (
                    <Pressable
                      style={[
                        styles.imageRemoveButton,
                        { backgroundColor: colors.error },
                      ]}
                      onPress={() => removeImage(index)}
                    >
                      <Feather name="x" size={14} color="#fff" />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Remarks</ThemedText>
          <FormInput label="Remarks/Description" placeholder="Enter any remarks or description" value={remarks} onChangeText={setRemarks} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}/>
        </Card>

        <Card elevation={1} style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>{hireType == "ON" ? "Handover / On Hire checking": "Return / Off Hire Checking"}</ThemedText>
          <FormInput 
            label="Service Technician" 
            placeholder="Enter service technician" 
            value={serviceTechnician} onChangeText={setServiceTechnician}
            editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}
          />
          <SignatureBox label="Service Technician Signature" value={technicianSignature} onChange={setTechnicianSignature} readOnly={readOnly}/>

          <FormInput 
            label="Checked & Accepted by" 
            placeholder="Enter accepted by" 
            value={acceptedBy} 
            onChangeText={setAcceptedBy}
            editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}
          />
          <SignatureBox label="Accepted By Signature" value={acceptedbySignature} onChange={setAcceptedbySignature} readOnly={readOnly}/>

          <FormDatePicker 
            label="Date" 
            value={hireDate} 
            onChange={setHireDate} 
            readOnly={readOnly}
          />

          <FormInput 
            label="NRIC/WP/PS" 
            placeholder="Enter NRIC/WP/PS" 
            value={nRIC} 
            onChangeText={setNRIC}
            editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}
          />

          <FormInput 
            label="Contractor Name" 
            placeholder="Enter contractor name" 
            value={contractorName} 
            onChangeText={setContractorName}
            editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}
          />
        </Card>

        <CustomButton
          onPress={handleFormSubmit}
          style={{
            backgroundColor: Colors.light.primary,
          }}
        >
          {isPending
                ? <CustomLoader color="#fff" />
                : isEditing
                  ? "Update"
                  : "Submit"}
        </CustomButton>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.lg },
  sectionTitle: { marginBottom: 4 },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  button: {
    flex: 1,
  },
  inactiveButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "red",
  },
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
  imageButtonsRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg },
  imageButton: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: Spacing.md, borderRadius: BorderRadius.sm },
  imagesGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  imageContainer: { width: 100, height: 100, position: "relative" },
  imagePreview: { width: "100%", height: "100%", borderRadius: BorderRadius.sm },
  imageRemoveButton: { position: "absolute", top: -8, right: -8, width: 24, height: 24, 
  borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#FFF",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  
    // Android shadow
    elevation: 4,
  
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
});