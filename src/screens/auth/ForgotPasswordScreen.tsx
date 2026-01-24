import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Image } from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { CustomButton } from "../../components/CustomButton";
import CustomLoader from "../../components/CustomLoader";
import { BorderRadius, Colors, Spacing } from "../../constants/theme";
import { forgotPassword } from "../../api/forgotPassword";
import { KeyboardAwareScrollViewCompat } from "../../components/KeyboardAwareScrollViewCompat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Images } from '../../../assets/images';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const colors = Colors.light;

  const insets = useSafeAreaInsets();

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.show({
        type: "error",
        text1: "Enter Registered Mail Address",
      });
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email);

      Toast.show({
        type: "success",
        text1: "Reset link sent to your registered Mail Address",
      });

      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Enter valid Mail Address",
      });
    } finally {
      setLoading(false);
    }
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
      {/* Logo */}
      <View style={styles.logoContainer}>
          <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
        </View>
      <ThemedText type="small" style={styles.label}>Forgot Password</ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Registered Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <Pressable
        style={styles.forgotPassword}
        onPress={() => navigation.goBack()}
      >
        <ThemedText type="link" style={{ color: colors.primary }}>
          Back to Sign In
        </ThemedText>
      </Pressable>
      <CustomButton onPress={handleForgotPassword} disabled={loading}>
        {loading ? <CustomLoader color="#fff" /> : "Send Reset Link"}
      </CustomButton>
      </KeyboardAwareScrollViewCompat>

    </ThemedView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },  
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: Spacing.xl,
  },
  label: {
    fontWeight: "500",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.sm
  },
});
