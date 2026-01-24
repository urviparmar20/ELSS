import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "../components/ThemedView";
import { ThemedText } from "../components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "../components/KeyboardAwareScrollViewCompat";
import { CustomButton } from "../components/CustomButton";

import { Colors, Spacing, BorderRadius } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";
import { RootState } from "../store";
import { useSelector } from "react-redux";

/* ----------------------------------
   FORM TYPES + VALIDATION
---------------------------------- */
type ChangePasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

import { z } from "zod";
import { useNavigation } from "@react-navigation/native";
import { useChangePassword } from "../hooks/useChangePassword";
import { Toast } from "react-native-toast-message/lib/src/Toast";

const changePasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(8, "Minimum 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/* ----------------------------------
   SCREEN
---------------------------------- */
const ChangePasswordScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = Colors.light;
  const user = useSelector((state: RootState) => state.auth.user);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });
  const {
    mutate: changePassword,
    isPending,
    isSuccess
  } = useChangePassword();

  const onSubmit = (values: ChangePasswordFormValues) => {
    console.log("Change password payload:", values);
    changePassword(values.newPassword, {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Password changed successfully!!",
        });
        navigation.goBack()
      },
      onError: () => {
        Toast.show({
          type: "error",
          text1: "Password invalid",
          text2: "Please try again",
        });
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["2xl"],
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
      >
        {/* HEADER */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <ThemedText type="h1" style={{ color: "#fff" }}>
              {user?.first_name?.charAt(0).toUpperCase() || "T"}
            </ThemedText>
          </View>

          <ThemedText type="h2">
            {user?.first_name} {user?.last_name}
          </ThemedText>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* NEW PASSWORD */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              New Password
            </ThemedText>

            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showNewPassword}
                    value={value}
                    onChangeText={onChange}
                  />
                  <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Feather
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                </View>
              )}
            />

            {errors.newPassword && (
              <ThemedText style={styles.errorText}>
                {errors.newPassword.message}
              </ThemedText>
            )}
          </View>

          {/* CONFIRM PASSWORD */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Confirm Password
            </ThemedText>

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Confirm password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showConfirmPassword}
                    value={value}
                    onChangeText={onChange}
                  />
                  <Pressable
                    onPress={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    <Feather
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                </View>
              )}
            />

            {errors.confirmPassword && (
              <ThemedText style={styles.errorText}>
                {errors.confirmPassword.message}
              </ThemedText>
            )}
          </View>

          {/* SUBMIT */}
          <View style={styles.buttonRow}>
            <CustomButton
              onPress={handleSubmit(onSubmit)}
              style={styles.updateButton}
            >
              Update
            </CustomButton>

            <CustomButton
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              Cancel
            </CustomButton>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
};

export default ChangePasswordScreen;

/* ----------------------------------
   STYLES
---------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl },
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  form: { width: "100%" },
  inputGroup: { marginBottom: Spacing.lg, marginTop: Spacing.sm },
  label: { marginBottom: Spacing.sm },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    height: Spacing.inputHeight,
  },
  input: { flex: 1, fontSize: 16 },
  errorText: {
    marginTop: Spacing.xs,
    color: Colors.light.error,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  
  cancelButton: {
    flex: 1,
  },
  
  updateButton: {
    flex: 1,
  },
  
});
