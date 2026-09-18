import React, { useEffect, useState } from "react";

import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { Card } from "../components/Card";
import { CustomButton } from "../components/CustomButton";
import { FormInput } from "../components/FormInput";
import { FormDatePicker } from "../components/FormDatePicker";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useEquipmentTypeList } from "../hooks/useEquipmentType";
import { useEquipmentListByType } from "../hooks/useEquipmentListByType";
import {
  BorderRadius,
  Colors,
  Spacing,
} from "../constants/theme";
import ChecklistSection from "../components/ChecklistSection";
import { FormDropdown } from "../components/FormDropdown";
import { Feather } from "@expo/vector-icons";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { SendInReturnStackParamList } from "../navigation/SendInReturnStackNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SignatureBox } from "../components/SignatureBox";
import { useSendInReturnChecklist } from "../hooks/useSendInReturnChecklist";
import { validateForm } from "../utils/validateSendInRerurn";
import { downloadRemoteFile } from "../utils/downloadRemoteFile";
import { ensureFileExists } from "../utils/ensureFileExists";
import { buildSendInReturnFormData } from "../utils/buildSendInReturnFormData";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useQueryClient } from "@tanstack/react-query";
import { useStoreSendInReturn } from "../hooks/useStoreSendInReturn";
import { formatDateDDMMYYYY } from "../utils/formatDateDDMMYYYY";
import { mapRawSendInReturn } from "../utils/mapRawSendInReturn";
import { convertToISODate } from "../utils/convertToISODate";
import CustomLoader from "../components/CustomLoader";
import { useUpdateSendIn } from "../hooks/useUpdateSendIn";


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

type SendInReturnFormRouteProp = RouteProp<SendInReturnStackParamList, "SendInReturnForm">;
type SendInReturnNavigationProp = NativeStackNavigationProp<SendInReturnStackParamList>;

export default function SendInReturnFormScreen() {

  const queryClient = useQueryClient();
  const navigation = useNavigation<SendInReturnNavigationProp>();

  const colors = Colors.light;
  const route = useRoute<SendInReturnFormRouteProp>();
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  const existingReport = route.params?.sendInReturn || null;
  const readOnly = route.params?.readOnly ?? false;
  const sendInId = route.params?.sendIn_id;  
  const flag = route.params?.flag || "";

  const isEditing = !!existingReport;
  const isSubmitted = isEditing && existingReport?.is_pending === "N";
  const [isManualSerialNo, setIsManualSerialNo] = useState(false);
  const [isManualBrand, setIsManualBrand] = useState(false);
  const [isManualModelNo, setIsManualModelNo] = useState(false);


  const formData = React.useMemo(
    () => (existingReport ? mapRawSendInReturn(existingReport) : null),
    [existingReport]
  );

  const [brand, setBrand] = useState(formData?.brand || "");
  const [serialNo, setSerialNo] = useState(formData?.mcSerialNo || "");
  const [modelNo, setModelNo] = useState(formData?.modelNo || "");
  const [hourMeter, setHourMeter] = useState(
    formData?.hourMeter?.toString() ?? ""
  );
  const [date, setDate] = useState(convertToISODate(formData?.date));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [time, setTime] = useState(formData?.time || "");
  const [images, setImages] = useState<RNImage[]>(formData?.images || []);
  const [comments, setComments] = useState(formData?.comments || "");

  const [equipmentTypeId, setEquipmentTypeId] = useState<string | null>(
    String(formData?.equipmentTypeId) ?? null
  );
  const [equipmentId, setEquipmentId] = useState(formData?.equipmentId || "");

  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<
  { id: string; name: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{
    location: string; id: string; name: string; serialNo: string 
  }[]>([]);

  const [sendIn, setSendIn] = useState(formData?.sendIn || "");
  const [sendInSignature, setSendInSignature] = useState("");
  const [sendInDate, setSendInDate] = useState(new Date().toISOString().split("T")[0]);

  const [receivedBy, setReceivedBy] = useState(formData?.receivedBy || "");
  const [receivedbySignature, setReceivedbySignature] = useState("");
  const [receivedByDate, setReceivedByDate] = useState(new Date().toISOString().split("T")[0]);

  const [acceptedBy, setAcceptedBy] = useState("");
  const [acceptedBySignature, setAcceptedBySignature] = useState("");
  const [acceptedByDate, setAcceptedByDate] = useState(new Date().toISOString().split("T")[0]);

  const [mechanic, setMechanic] = useState("");
  const [mechanicSignature, setMechanicSignature] = useState("");
  const [mechanicDate, setMechanicDate] = useState(new Date().toISOString().split("T")[0]);

  const [foreman, setForeman] = useState("");
  const [foremanSignature, setForemanSignature] = useState("");
  const [foremanDate, setForemanDate] = useState(new Date().toISOString().split("T")[0]);

  const [checklistValues, setChecklistValues] = useState({});


  const { data: eqTypeData } = useEquipmentTypeList();
  const { data: equipmentListData } = useEquipmentListByType(equipmentTypeId);
  const { data: sendInReturnChecklistData } = useSendInReturnChecklist(equipmentTypeId);
  const { mutateAsync: createSendInReturn, isPending: isCreatePending } = useStoreSendInReturn(token, flag); 
  const { mutateAsync: updateSendIn , isPending: isUpdatePending } = useUpdateSendIn(token);

  //navigation
  useEffect(() => {
    let title = "New Send In";

    if (flag === "needToReturn") {
      title = "Do Return";
    } else if (isEditing) {
      title = String(sendInId);
    }

    navigation.setOptions({
      headerTitle: title,
    });
  }, [flag, isEditing, sendInId, navigation]);

  //checklist
  useEffect(() => {
    // Clear checklist for Return
    if (flag === "needToReturn") {
      setChecklistValues({});
      return;
    }
  
    if (!formData?.checklistValues?.length) {
      setChecklistValues({});
      return;
    }
  
    const formattedChecklist = formData.checklistValues.reduce(
      (acc: any, item: any) => {
        let status = "";
  
        if (item.status === "1") {
          status = "good";
        } else if (item.status === "0") {
          status = "faulty";
        }
  
        acc[item.checklist_item_id] = {
          sendIn: {
            status,
            remarks: item.remarks ?? "",
          },
        };
  
        return acc;
      },
      {}
    );
  
    setChecklistValues(formattedChecklist);
  }, [formData, flag]);
  
  //signature
  useEffect(() => {
    if (!formData) return;
  
    setSendInSignature(formData.sendInSignature || "");
    setReceivedbySignature(formData.receivedbySignature || "");
  }, [formData]);

  useEffect(() => {
    const equipmentTypeList = eqTypeData?.data?.equipmentTypeList;
    if (equipmentTypeList?.ids && equipmentTypeList?.types) {
      const eqTypes = equipmentTypeList.ids.map((id: number, index: number) => ({
        id: String(id),
        name: equipmentTypeList.types[index],
      }));
      setEquipmentTypeOptions(eqTypes);
    }
  }, [ eqTypeData]);

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

  //sr no
  useEffect(() => {
    if (!equipmentId) return;
    if (!equipmentListData?.data?.equipmentList) return;
  
    const equipmentList = equipmentListData.data.equipmentList;
  
    const selectedIndex = equipmentList.ids?.findIndex(
      (itemId: number) => String(itemId) === String(equipmentId)
    );
  
    if (selectedIndex === -1 || selectedIndex === undefined) return;
  
  }, [equipmentId, equipmentListData]);

  const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

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

  const handleChecklistChange = (
    checklist_item_id: number,
    section: "sendIn" | "onReturn",
    field: "status" | "remarks",
    value: string
  ) => {
    setChecklistValues(prev => ({
      ...prev,
      [checklist_item_id]: {
        ...(prev[checklist_item_id] || {}),
        [section]: {
          ...(prev[checklist_item_id]?.[section] || {}),
          [field]: value,
        },
      },
    }));
  };  
  
  const buildChecklistPayload = () => {
    const result: any = {};

    sendInReturnChecklistData?.data?.checklist?.forEach((section: any) => {
      section.items.forEach((item: any) => {
        result[item.checklist_item_id] = {
          sendIn: {
            status:
              checklistValues[item.checklist_item_id]?.sendIn?.status || "",
            remarks:
              checklistValues[item.checklist_item_id]?.sendIn?.remarks || "",
          },
          onReturn: {
            status:
              checklistValues[item.checklist_item_id]?.onReturn?.status || "",
            remarks:
              checklistValues[item.checklist_item_id]?.onReturn?.remarks || "",
          },
        };
      });
    });

    return result;
  };
  const finalChecklist = buildChecklistPayload();

//   console.log("FINAL CHECKLIST");
// console.log(JSON.stringify(finalChecklist, null, 2));


  const handleSubmit = async() => {
    const { valid, errors } = validateForm({
      isSendIn: true,
      equipmentType: equipmentId,
      equipmentId,
      sendIn,
      signatureSendInBy: sendInSignature,
      checkedReceivedBy: receivedBy,
      signatureCheckedReceivedBy: receivedbySignature,
    
      //Return
      checkedAcceptedBy: acceptedBy,
      signatureCheckedAcceptedBy: acceptedBySignature,
      mechanic,
      signatureMechanic: mechanicSignature,
      foreman,
      signatureForeman: foremanSignature,
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
       let sendInUri = sendInSignature;
       let receivedByUri = receivedbySignature;
       let acceptedByUri = acceptedBySignature;
       let mechanicByUri = mechanicSignature;
       let foremanInUri = foremanSignature;
   
       // 2. convert remote → local if needed
       if (sendInUri?.startsWith("http")) {
        sendInUri = await downloadRemoteFile(sendInUri);
       }
       if (receivedByUri?.startsWith("http")) {
        receivedByUri = await downloadRemoteFile(receivedByUri);
       }
       if (acceptedByUri?.startsWith("http")) {
        acceptedByUri = await downloadRemoteFile(acceptedByUri);
       }
       if (mechanicByUri?.startsWith("http")) {
        mechanicByUri = await downloadRemoteFile(mechanicByUri);
       }
       if (foremanInUri?.startsWith("http")) {
        foremanInUri = await downloadRemoteFile(foremanInUri);
       }
  
   
       // 3. IMPORTANT: ensure files are ready
       if (sendInUri) await ensureFileExists(sendInUri);
       if (receivedByUri) await ensureFileExists(receivedByUri);
   
      // Build FormData (fresh instance always)
      const isReturn = flag === "needToReturn";
      
      const payload = buildSendInReturnFormData({
        userId,
        sendInId: isEditing ? String(sendInId ?? "") : "0",
        isReturn,
        equipmentType: isReturn ? undefined : equipmentTypeId || "",
        equipmentId: isReturn ? undefined : equipmentId,
        brand,
        modelNo,
        serialNo,
        hourMeter,
        complaints: comments,
        date: formatDateDDMMYYYY(date),
        time,
        checklist: finalChecklist,
        images,

          //SendIn
        sendInBy: isReturn ? undefined : sendIn,
        signatureSendInBy: isReturn ? undefined : sendInUri
        ? { uri: sendInUri, name: "sendInBy.png", type: "image/png" }
        : undefined,

        checkedReceivedBy: isReturn ? undefined : receivedBy,
        signatureCheckedReceivedBy: isReturn ? undefined : receivedByUri
          ? { uri: receivedByUri, name: "receivedBy.png", type: "image/png" }
          : undefined,

          //Return
        checkedAcceptedBy: isReturn ? acceptedBy : undefined,
        signatureCheckedAcceptedBy: isReturn ?  acceptedByUri
        ? { uri: acceptedByUri, name: "checkedAcceptedBy.png", type: "image/png" }
        : undefined : undefined,

        mechanic: isReturn ? mechanic : undefined,
        signatureMechanic: isReturn ? mechanicByUri
          ? { uri: mechanicByUri, name: "mechanic.png", type: "image/png" }
          : undefined : undefined,

        foreman: isReturn ? foreman : undefined,
        signatureForeman: isReturn ? foremanInUri
        ? { uri: foremanInUri, name: "foreman.png", type: "image/png" }
        : undefined : undefined,


      });
  
      //  clone FormData (prevents RN mutation bug)
      const safeFormData = new FormData();
      (payload as any)._parts?.forEach(([k, v]: any) => {
        safeFormData.append(k, v);
        // console.log('safeFormData', k, v);
      });
  
      //  6. retry wrapper (prevents first-call network glitch)
      const uploadWithRetry = async (data: FormData) => {
        let lastErr;
      
        for (let i = 0; i < 3; i++) {
          try {
            if (flag === "needToUpdate") {
              return await updateSendIn({formData: data});
            }
      
            return await createSendInReturn({ 
              formData: data, 
              flag 
            });
      
          } catch (e: any) {
            lastErr = e;
            await new Promise(r => setTimeout(r, 700));
          }
        }
      
        throw lastErr;
      };
      
  
      const res = await uploadWithRetry(safeFormData);

      if (res?.status_code === 200) {
        
        await queryClient.invalidateQueries({
          queryKey: ["send-in-return-list"],
        });
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Submitted Successfully",
        });
  
        navigation.navigate("SendInReturnList");
      
      }
  
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Erroe",
        text2: "Submitted Successfully",
      });

      let errorMessage = "Something went wrong";
    
      if (error.response?.data) {
        const { message, errors } = error.response.data;
    
        if (errors) {
          // Combine all validation messages
          errorMessage = Object.values(errors)
            .flat()
            .join("\n");
        } else if (message) {
          errorMessage = message;
        }
      }
    
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: errorMessage,
        visibilityTime: 5000,
      });
    
      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } 
  }
 
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Equipment Details */}
        <Card style={styles.section}>
          <ThemedText
            type="h3"
            style={styles.sectionTitle}
          >
            Equipment Information
          </ThemedText>

           <FormDropdown
            label="Equipment Type"
            placeholder="Select equipment type"
            options={equipmentTypeOptions} // { id, name }
            selectedValue={equipmentTypeId}
            onValueChange={(id) => {
              setEquipmentTypeId(id);
              setEquipmentId(""); // reset equipment
              setSerialNo("");
              setBrand("");
              setModelNo("");
              setIsManualSerialNo(false);
            }}
            readOnly={readOnly || flag === "needToReturn"}
          />

          <FormDropdown
            label="Equipment ID"
            placeholder="Select equipment"
            options={equipmentOptions} // { id, name }
            selectedValue={equipmentId}
            // onValueChange={(id) => setEquipmentId(id)}
            onValueChange={(id) => {
              setEquipmentId(id);
            
              const selectedIndex =
                equipmentListData?.data?.equipmentList?.ids?.findIndex(
                  (itemId: number) => String(itemId) === id
                );
            
              if (selectedIndex !== -1 && selectedIndex !== undefined) {
                const serialNo =
                  equipmentListData?.data?.equipmentList?.serial_no?.[
                    selectedIndex
                  ];
            
                const invalidSerial =
                  !serialNo ||
                  serialNo === "null";
            
                setSerialNo(invalidSerial ? "" : serialNo);
            
                setIsManualSerialNo(invalidSerial);

                // Brand
                const selectedBrand = equipmentListData?.data?.equipmentList?.brand?.[selectedIndex];
                
                if (!selectedBrand) {
                  setBrand("");
                  setIsManualBrand(true);
                } else {
                  setBrand(selectedBrand);
                  setIsManualBrand(false);
                }

                // Model No
                const selectedModel = equipmentListData?.data?.equipmentList?.model_no?.[selectedIndex];
                if (!selectedModel) {
                  setModelNo("");
                  setIsManualModelNo(true);
                } else {
                  setModelNo(selectedModel);
                  setIsManualModelNo(false);
                }
              }
            }}
            readOnly={readOnly || flag === "needToReturn"}
            searchable
          />

          <FormInput
            label="Brand"
            value={brand}
            onChangeText={setBrand}
            placeholder="Enter brand"
            readOnly={readOnly || (!isManualBrand && !!brand) || flag === "needToReturn"}
          />

          <FormInput
            label="Model No"
            value={modelNo}
            onChangeText={setModelNo}
            placeholder="Enter Model no"
            readOnly={readOnly || (!isManualModelNo && !!modelNo) || flag === "needToReturn"}
          />

          <FormInput
            label="Serial No"
            value={serialNo}
            onChangeText={setSerialNo}
            placeholder="Enter serial no"
            editable={!readOnly && isManualSerialNo}
            selectTextOnFocus={!readOnly && isManualSerialNo}
            readOnly={readOnly || !isManualSerialNo || flag === "needToReturn"}
          />

          <FormInput
            label="Hour Meter"
            value={hourMeter}
            onChangeText={setHourMeter}
            keyboardType="numeric"
            placeholder="Enter hour meter"
          />

          <FormDatePicker
            label="Date"
            value={date}
            onChange={setDate}
          />

          <Pressable onPress={() => setShowTimePicker(true)}>
            <FormInput
              label="Time"
              value={time}
              placeholder="HH:mm"
              editable={false}
              pointerEvents="none"
            />
          </Pressable>
            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display={"default"}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);

                  if (event.type === "dismissed" || !selectedTime) return;

                  setTime(formatTime(selectedTime));
                }}
              />
            )} 
        </Card>

        {/* Checklist Sections */}
          {sendInReturnChecklistData?.data?.checklist?.map((section: any) => (
            <ChecklistSection
              key={section.category}
              title={section.category}
              items={section.items}
              values={checklistValues}
              onChange={handleChecklistChange}
              sectionType={flag === "needToReturn" ? "onReturn" : "sendIn"}
            />
          ))}
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
          <ThemedText type="h4" style={styles.sectionTitle}>Complaints and Comments</ThemedText>
          <FormInput  placeholder="Enter any complaints and comments" value={comments} onChangeText={setComments} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} editable={!readOnly}
            selectTextOnFocus={!readOnly}
            readOnly={readOnly}/>
        </Card>
        {
          flag === "needToReturn" ?
            <Card elevation={1} style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>On Return</ThemedText>
              <FormInput 
                label="Check and Accepted by" 
                placeholder="Enter accepted by" 
                value={acceptedBy} onChangeText={setAcceptedBy}
                editable={!readOnly}
                selectTextOnFocus={!readOnly}
                readOnly={readOnly}
              />
              <SignatureBox label="Check and Accepted by Signature" value={acceptedBySignature} onChange={setAcceptedBySignature} readOnly={readOnly}/>

              <FormInput 
                label="Mechanic" 
                placeholder="Enter mechanic" 
                value={mechanic} 
                onChangeText={setMechanic}
                editable={!readOnly}
                selectTextOnFocus={!readOnly}
                readOnly={readOnly}
              />
              <SignatureBox label="Mechanic Signature" value={mechanicSignature} onChange={setMechanicSignature} readOnly={readOnly}/>

              <FormInput 
                label="Foreman/Engineer" 
                placeholder="Enter Foreman/Engineer name" 
                value={foreman} 
                onChangeText={setForeman}
                editable={!readOnly}
                selectTextOnFocus={!readOnly}
                readOnly={readOnly}
              />
              <SignatureBox label="Foreman/Engineer Signature" value={foremanSignature} onChange={setForemanSignature} readOnly={readOnly}/>
            </Card>
           :
            <Card elevation={1} style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>Send In</ThemedText>
              <FormInput 
                label="Send In By" 
                placeholder="Enter send in by" 
                value={sendIn} onChangeText={setSendIn}
                editable={!readOnly}
                selectTextOnFocus={!readOnly}
                readOnly={readOnly}
              />
              <SignatureBox label="Send In By Signature" value={sendInSignature} onChange={setSendInSignature} readOnly={readOnly}/>

              <FormInput 
                label="Checked & Received by" 
                placeholder="Enter received by" 
                value={receivedBy} 
                onChangeText={setReceivedBy}
                editable={!readOnly}
                selectTextOnFocus={!readOnly}
                readOnly={readOnly}
              />
              <SignatureBox label="Checked & Received by Signature" value={receivedbySignature} onChange={setReceivedbySignature} readOnly={readOnly}/>
            </Card>
        }
        
        
       
        <CustomButton
          onPress={handleSubmit}
          style={{
            backgroundColor: Colors.light.primary,
          }}
        >
          {isCreatePending ? (
              <CustomLoader color="#fff" />
            ): flag === "needToReturn" ? (
              "Submit Return" 
            ) : isEditing ? (
              "Update"
            ) : (
              "Submit Send In"
            )}
        </CustomButton>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },

  section: { marginBottom: Spacing.lg },

  sectionTitle: {
    marginBottom: Spacing.md,
  },

  subTitle: {
    marginTop: 4,
    color: Colors.light.textSecondary,
  },

  submitButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.light.primary,
  },
  imageButtonsRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg },
  imageButton: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: Spacing.md, borderRadius: BorderRadius.sm },
  imagesGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  imageContainer: { width: 100, height: 100, position: "relative" },
  imagePreview: { width: "100%", height: "100%", borderRadius: BorderRadius.sm },
  imageRemoveButton: { position: "absolute", top: -8, right: -8, width: 24, height: 24, 
  borderRadius: 12, alignItems: "center", justifyContent: "center" },
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
});