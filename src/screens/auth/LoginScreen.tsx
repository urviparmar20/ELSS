import React, { useState } from 'react'
import { View, StyleSheet, Image, TextInput, Pressable, ImageBackground } from 'react-native'
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormValues } from '../../validation/login.schema';
import { ThemedView } from '../../components/ThemedView'
import { ThemedText } from "../../components/ThemedText";
import { KeyboardAwareScrollViewCompat } from '../../components/KeyboardAwareScrollViewCompat'
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Spacing, BorderRadius } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";
import { useTheme } from '../../hooks/useTheme';
import { CustomButton } from "../../components/CustomButton";
import CustomLoader from '../../components/CustomLoader';
import { Images } from '../../../assets/images';
import { useLogin } from '../../hooks/useLogin';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = Colors.light;
  const loginMutation = useLogin();

  const dispatch = useDispatch();

  type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
  const navigation = useNavigation<NavProp>()
  
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // real-time validation
    defaultValues: {
      employeeId: '',
      password: '',
    },
  });
  
   

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: (data) => {
        // Save token in Redux
        dispatch(
          loginSuccess({
            token: data?.data.access_token,
            user: data?.data.user,
          })
        );

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
        });
      },
      onError: (error: any) => {
        console.log('error',error);
        
        const backendError = error?.response?.data?.message;

        // if (backendError?.includes('employee_id')) {
        //   setError('employeeId', { type: 'manual', message: backendError });
        // } else if (backendError?.includes('password')) {
        //   setError('password', { type: 'manual', message: backendError });
        // } else {
          Toast.show({
            type: 'error',
            text1: 'Login Failed',
            text2: backendError || 'Something went wrong',
          });
        // }
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      {/* Background */}
      <Image source={Images.bgLogin} style={styles.backgroundImage} resizeMode="cover" />

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
          <ThemedText type="small" style={[styles.tagline, { color: colors.textSecondary }]}>
            Equipment Maintenance System
          </ThemedText>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* Employee ID */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Employee ID
            </ThemedText>

            <Controller
              control={control}
              name="employeeId"
              rules={{ required: 'Employee ID is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your Employee ID"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            {errors.employeeId && (
              <ThemedText  style={[styles.errorText, { color: theme.primary }]}
              >{errors.employeeId.message}</ThemedText>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Password
            </ThemedText>

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showPassword}
                    value={value}
                    onChangeText={onChange}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>
              )}
            />

            {errors.password && (
              <ThemedText  style={[styles.errorText, { color: theme.primary }]}
              >{errors.password.message}</ThemedText>
            )}
          </View>

          {/* Forgot */}
          <Pressable
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <ThemedText type="link" style={{ color: colors.primary }}>
              Forgot Password?
            </ThemedText>
          </Pressable>

          {/* Submit */}
          <CustomButton
            onPress={handleSubmit(onSubmit)}
            disabled={loginMutation.isPending}
            style={styles.loginButton}
          >
            {loginMutation.isPending ? <CustomLoader color="#fff" /> : 'Login'}
          </CustomButton>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
};

 export default LoginScreen

 const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
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
  tagline: {
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: Spacing.xl,
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
  },
  backgroundImage: { position: 'absolute', width: '100%', height: '100%' },

});
