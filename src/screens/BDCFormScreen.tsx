import React, { useEffect, useState } from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { Card } from "../components/Card";
import { FormInput } from "../components/FormInput";
import { FormDropdown } from "../components/FormDropdown";
import { FormDatePicker } from "../components/FormDatePicker";
import { CustomButton } from "../components/CustomButton";
import { KeyboardAwareScrollViewCompat } from "../components/KeyboardAwareScrollViewCompat";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Toast } from "react-native-toast-message/lib/src/Toast";

import { Colors, Spacing } from "../constants/theme";
import { useEquipmentTypeList } from "../hooks/useEquipmentType";
import { useEquipmentListByType } from "../hooks/useEquipmentListByType";
import { BDCStackParamList } from "../navigation/BreakdownCheckoutStackNavigator";
import { mapRawBDC } from "../utils/mapRawBDC";
import { validateForm } from "../utils/validateBDC";
import { buildBDCFormData } from "../utils/buildBDCFormData";
import { RootState } from "../store";
import { useSelector } from "react-redux";
import { useStoreBDC } from "../hooks/useStoreBDC";
import { useQueryClient } from "@tanstack/react-query";
import CustomLoader from "../components/CustomLoader";
import { useUpdateBDC } from "../hooks/useUpdateBDC";

type BDCFormRouteProp = RouteProp<BDCStackParamList, "BDCForm">;
type BDCNavigationProp = NativeStackNavigationProp<BDCStackParamList>;

export default function BDCFormScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<BDCFormRouteProp>();
  const navigation = useNavigation<BDCNavigationProp>();
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);
  const token = useSelector((state: RootState) => state.auth.token);
  const queryClient = useQueryClient();

  const existingReport = route.params?.report || null;
  const readOnly = route.params?.readOnly ?? false;
  const bdcId = route.params?.bdc_id;

  const isEditing = !!existingReport;


  const formData = React.useMemo(
    () => (existingReport ? mapRawBDC(existingReport) : null),
    [existingReport]
  );


  const [equipmentTypeId, setEquipmentTypeId] = useState<string | null>(
    formData?.equipmentTypeName?.id ?? null
  );
  const [equipmentId, setEquipmentId] = useState(formData?.equipmentName?.equip_id || "");

  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<
  { id: string; name: string }[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<{
    location: string; id: string; name: string; serialNo: string 
}[]>([]);

  const [location, setLocation] = useState(formData?.location || "");
  const [compliance, setCompliance] = useState(formData?.complied || "");
  const [replaceParts, setReplaceParts] = useState(formData?.replace_parts || "");

  const [date, setDate] = useState(formData?.ch_date || "");
  const [status, setStatus] = useState(formData?.status || "open");

  const [loginTime, setLoginTime] = useState(formData?.login_time || "");
  const [logoutTime, setLogoutTime] = useState(formData?.logout_time || "");
  const [showLoginPicker, setShowLoginPicker] = useState(false);
  const [showLogoutPicker, setShowLogoutPicker] = useState(false);

  const { data: eqTypeData } = useEquipmentTypeList();
  const { data: equipmentListData } = useEquipmentListByType(equipmentTypeId);
 
  
  // const { mutateAsync, isPending } = useStoreBDC(token); 
  const {
    mutateAsync: createBDC,
    isPending: isCreatePending,
  } = useStoreBDC(token);
  
  const {
    mutateAsync: updateBDC,
    isPending: isUpdatePending,
  } = useUpdateBDC(token);
  
  const isPending = isCreatePending || isUpdatePending; 

  useEffect(() => {
    if (!formData) return;
  
    setEquipmentTypeId(String(formData.equipmentTypeName?.id || ""));
    setEquipmentId(String(formData.equipmentName?.id || ""));
  }, [formData]);

  useEffect(() => {
    if (!formData?.equipmentName?.equip_id) return;
    if (!equipmentOptions.length) return;
  
    const match = equipmentOptions.find(
      x => x.name === formData.equipmentName.equip_id
    );
  
    if (match) {
      setEquipmentId(match.id);
    }
  }, [equipmentOptions, formData]);

  useEffect(() => {
    if (!formData) return;
  
    setEquipmentTypeId(String(formData.equipmentTypeName?.id || ""));
    setEquipmentId(String(formData.equipmentName?.id || ""));
  
    setLoginTime(
      formData.login_time
        ? formData.login_time.split(":").slice(0, 2).join(":")
        : ""
    );
  
    setLogoutTime(
      formData.logout_time
        ? formData.logout_time.split(":").slice(0, 2).join(":")
        : ""
    );
  }, [formData]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing
        ? `Edit Breakdown Checkout (${existingReport?.id ?? bdcId})`
        : "New Breakdown Checkout",
    });
  }, [isEditing, existingReport, bdcId, navigation]);

  //Equipment type
  useEffect(() => {
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
  }, [eqTypeData]); 

   //Equipment ID
   useEffect(() => {
    const list = equipmentListData?.data?.equipmentList;
  
    if (list?.ids && list?.equip_id) {
      const formatted = list.equip_id.map((equipCode: string, index: number) => ({
        id: String(list.ids[index]),   
        name: equipCode,    
        location: list.location?.[index] || "",           
      }));
  
      setEquipmentOptions(formatted);
    } else {
      setEquipmentOptions([]);
    }
  }, [equipmentListData]);

  const formatApiDate = (value: string | Date) => {
    const d = new Date(value);
  
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleEquipmentChange = (id: string) => {
    setEquipmentId(id);
      
    const selectedEquipment = equipmentOptions.find(
      item => item.id === id
    );
  
    if (!selectedEquipment) return;
  
    const sr = selectedEquipment.location;
  
    // auto fill only if valid
    if (
      sr &&
      sr.trim() !== "" &&
      sr.toLowerCase() !== "null"
    ) {
      setLocation(sr);
    } else {
      // allow manual entry
      setLocation("");
    }
  };

  const statusOptions = [
    {
      id: "open",
      name: "Open",
    },
    {
      id: "close",
      name: "Closed",
    },
  ];

  const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSubmit = async () => {
  
    const { valid, errors } = validateForm({
      equipmentTypeId,
      equipmentId,
      location,
      status,
      date,
      loginTime,
      logoutTime
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
      
      // Build FormData (fresh instance always)
      const payload = buildBDCFormData({
        bk_id: isEditing ? existingReport?.id : 0,
        user_id: userId,
        equipment_type: equipmentTypeId,
        equipment_id: equipmentId,
        location: location,
        replace_parts: replaceParts,
        complied: compliance,
        ch_date: formatApiDate(date),
        login_time: loginTime,
        logout_time: logoutTime,
        status: status.toLowerCase(),
      });
  
      // 5. CRITICAL FIX: clone FormData (prevents RN mutation bug)
      const safeFormData = new FormData();
      (payload as any)._parts?.forEach(([k, v]: any) => {
        safeFormData.append(k, v);
      });
      
  
      // 6. retry wrapper (prevents first-call network glitch)
      const uploadWithRetry = async (data: FormData) => {
        let lastErr;
  
        for (let i = 0; i < 3; i++) {
          try {            
            // return await mutateAsync({ formData: data });
            if (isEditing) {
              return await updateBDC({
                formData: data,
              });
            }
            
            return await createBDC({
              formData: data,
            });
          } catch (e) {
            lastErr = e;
            await new Promise(r => setTimeout(r, 700));
          }
        }
  
        throw lastErr;
      };
  
      const res = await uploadWithRetry(safeFormData);
  
      if (res?.status_code === 200) {
        queryClient.invalidateQueries({ queryKey: ["breakdown-checkout-list"] });
  
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Submitted Successfully",
        });
  
        navigation.navigate("BDCList");
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
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: insets.bottom + 50,
          },
        ]}
      >
        {/* Equipment Details */}
        <Card style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Equipment Details
          </ThemedText>

          <View style={styles.row}>
            <View style={styles.col}>
            <FormDropdown
              label="Equipment Type *"
              placeholder="Select equipment type"
              options={equipmentTypeOptions}    
              selectedValue={equipmentTypeId}
              onValueChange={(v) => {
                setEquipmentTypeId(v);
                setEquipmentId("");
                setLocation("");
              }}
            />
            </View>

            <View style={styles.col}>
              <FormDropdown
                label="Equipment *"
                placeholder="Select equipment"
                options={equipmentOptions}
                selectedValue={equipmentId}
                onValueChange={handleEquipmentChange}
                searchable
              />
            </View>
          </View>
        </Card>

        {/* Location & Compliance */}
        <Card style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Location & Compliance
          </ThemedText>

          <View style={styles.row}>
            <View style={styles.col}>
              <FormInput
                label="Location *"
                value={location}
                onChangeText={setLocation}
                placeholder="Enter Location"
              />
            </View>

            <View style={styles.col}>
              <FormInput
                label="Complied"
                value={compliance}
                onChangeText={setCompliance}
                placeholder="Compliance notes"
              />
            </View>
          </View>

          <FormInput
            label="Replace Parts (if any)"
            value={replaceParts}
            onChangeText={setReplaceParts}
            placeholder="List any parts that were replaced..."
            multiline
            numberOfLines={5}
            style={{
              height: 120,
              textAlignVertical: "top",
            }}
          />
        </Card>

        {/* Time & Date */}
        <Card style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Time & Date
          </ThemedText>

          <View style={styles.row}>
            <View style={styles.col}>
              <FormDatePicker
                label="Date *"
                value={date}
                onChange={setDate}
              />
            </View>

            <View style={styles.col}>
              <FormDropdown
                label="Status *"
                placeholder="Select Status"
                options={statusOptions}
                selectedValue={status}
                onValueChange={setStatus}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Pressable onPress={() => setShowLoginPicker(true)}>
                <FormInput
                  label="Login Time"
                  value={loginTime}
                  placeholder="HH:mm"
                  editable={false}
                  pointerEvents="none"
                />
              </Pressable>

              {showLoginPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedTime) => {
                    setShowLoginPicker(false);

                    if (event.type === "dismissed" || !selectedTime) return;

                    setLoginTime(formatTime(selectedTime));
                  }}
                />
              )}     
            </View>

            <View style={styles.col}>
              <Pressable onPress={() => setShowLogoutPicker(true)}>
                <FormInput
                  label="Logout Time"
                  value={logoutTime}
                  placeholder="HH:mm"
                  editable={false}
                  pointerEvents="none"
                />
              </Pressable>

              {showLogoutPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedTime) => {
                    setShowLogoutPicker(false);

                    if (event.type === "dismissed" || !selectedTime) return;

                    const logout = formatTime(selectedTime);

                    setLogoutTime(logout);
                  }}
                />
              )}
            </View>
          </View>
        </Card>

        <CustomButton
          onPress={handleSubmit}
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
  container: {
    flex: 1,
  },

  content: {
    padding: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    marginBottom: Spacing.lg,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  col: {
    width: "48%",
  },
});