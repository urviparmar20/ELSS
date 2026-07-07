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
import { checklistSections } from "../constants/sendInReturnChecklist";
import ChecklistSection from "../components/ChecklistSection";
import { FormDropdown } from "../components/FormDropdown";
import { Feather } from "@expo/vector-icons";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { SendInReturnStackParamList } from "../navigation/SendInReturnStackNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SignatureBox } from "../components/SignatureBox";

type RNImage = {
  uri: string;
  name: string;
  type: string;
  size?: number;
  isExisting?: boolean;
};
type ChecklistItem = {
  sendIn: {
    status: string;
    remarks: string;
  };
  onReturn: {
    status: string;
    remarks: string;
  };
};

type ChecklistData = {
  [section: string]: {
    [item: string]: ChecklistItem;
  };
};

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE_MB = 3;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

type SendInReturnFormRouteProp = RouteProp<SendInReturnStackParamList, "SendInReturnForm">;
type SendInReturnNavigationProp = NativeStackNavigationProp<SendInReturnStackParamList>;

export default function SendInReturnFormScreen() {

  const colors = Colors.light;
  const route = useRoute<SendInReturnFormRouteProp>();

  const existingReport = route.params?.report || null;
  const readOnly = route.params?.readOnly ?? false;
  const gmId = route.params?.gm_id;  

  const isEditing = !!existingReport;
  const isSubmitted = isEditing && existingReport?.is_pending === "N";
  const [isManualSerialNo, setIsManualSerialNo] = useState(false);

  const [brand, setBrand] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [hourMeter, setHourMeter] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [time, setTime] = useState("");
  const [images, setImages] = useState<RNImage[]>([]);
  const [comments, setComments] = useState("");
  const [equipmentTypeId, setEquipmentTypeId] = useState<string | null>(
    );
  const [equipmentId, setEquipmentId] = useState("");

  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<
  { id: string; name: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{
    location: string; id: string; name: string; serialNo: string 
  }[]>([]);

  const [sendIn, setSendIn] = useState("");
  const [sendInSignature, setSendInSignature] = useState("");
  const [sendInDate, setSendInDate] = useState(new Date().toISOString().split("T")[0]);

  const [receivedBy, setReceivedBy] = useState("");
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

  const [checklistData, setChecklistData] = useState<ChecklistData>({});

  const { data: eqTypeData } = useEquipmentTypeList();
  const { data: equipmentListData } = useEquipmentListByType(equipmentTypeId);
  
console.log('equipmentListData',equipmentListData);

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
  
    const serialNo = equipmentList.serial_no?.[selectedIndex];
  
    const invalidSerial =
      !serialNo ||
      serialNo === "null" ||
      serialNo.trim() === "";
  
    // IMPORTANT
    // if (invalidSerial) {
    //   // keep existing report value in edit mode
    //   if (isEditing && formData?.mcSerialNo) {
    //     setMcSerialNo(formData.mcSerialNo);
    //   } else {
    //     setMcSerialNo("");
    //   }
  
    //   setIsManualSerialNo(true);
    // } else {
    //   setMcSerialNo(serialNo);
    //   setIsManualSerialNo(false);
    // }
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

  const updateChecklist = (
    sectionTitle: string,
    item: string,
    area: "sendIn" | "onReturn",
    field: "status" | "remarks",
    value: string
  ) => {
    setChecklistData((prev: any) => ({
      ...prev,
      [sectionTitle]: {
        ...(prev[sectionTitle] || {}),
        [item]: {
          ...(prev[sectionTitle]?.[item] || {}),
          [area]: {
            ...(prev[sectionTitle]?.[item]?.[area] || {}),
            [field]: value,
          },
        },
      },
    }));
  };

  const handleSubmit = () => {
    console.log({
      brand,
      equipment_type: equipmentTypeId,
      equipment_id: equipmentId,
      serialNo,
      hourMeter,
      date,
      time,
      checklist: checklistData,
      images,
      comments,
      sendIn,
      sendInSignature,
      sendInDate,
      receivedBy,
      receivedbySignature,
      receivedByDate,
      acceptedBy,
      acceptedBySignature,
      acceptedByDate,
      mechanic,
      mechanicSignature,
      mechanicDate,
      foreman,
      foremanSignature,
      foremanDate
    });
    console.log(
      JSON.stringify(checklistData, null, 2)
    );

    
  };

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
              setIsManualSerialNo(false);
            }}
            readOnly={readOnly}
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
              }
            }}
            readOnly={readOnly}
            searchable
          />

          <FormInput
            label="Brand"
            value={brand}
            onChangeText={setBrand}
            placeholder="Enter brand"
          />

          <FormInput
            label="Serial No"
            value={serialNo}
            onChangeText={setSerialNo}
            placeholder="Enter serial no"
            editable={!readOnly && isManualSerialNo}
            selectTextOnFocus={!readOnly && isManualSerialNo}
            readOnly={readOnly || !isManualSerialNo}
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
        {checklistSections.map((section) => (
          <ChecklistSection
            key={section.title}
            title={section.title}
            items={section.items}
            values={checklistData[section.title] || {}}
            onChange={(item, area, field, value) =>
              updateChecklist(
                section.title,
                item,
                area,
                field,
                value
              )
            }
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

          <FormDatePicker 
            label="Date" 
            value={sendInDate} 
            onChange={setSendInDate} 
            readOnly={readOnly}
          />

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

          <FormDatePicker 
            label="Date" 
            value={receivedByDate} 
            onChange={setReceivedByDate} 
            readOnly={readOnly}
          />
        </Card>
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

          <FormDatePicker 
            label="Date" 
            value={acceptedByDate} 
            onChange={setAcceptedByDate} 
            readOnly={readOnly}
          />

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

          <FormDatePicker 
            label="Date" 
            value={mechanicDate} 
            onChange={setMechanicDate} 
            readOnly={readOnly}
          />

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

          <FormDatePicker 
            label="Date" 
            value={foremanDate} 
            onChange={setForemanDate} 
            readOnly={readOnly}
          />
          
        </Card>

        <CustomButton
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          Submit
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