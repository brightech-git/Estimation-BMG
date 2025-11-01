import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Easing,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LoginContext } from "../../Context/LoginContext";
import { COLORS, FONTS, SIZES } from "../../Utills/Theme";
import { useToast } from '../../Context/ToastContext';
import Footer from "../../Components/Footer/Footer"

const { width, height } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { login, loading } = useContext(LoginContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const { showToast } = useToast();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const formScale = useRef(new Animated.Value(0.95)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Input border animations
  const usernameBorderAnim = useRef(new Animated.Value(0)).current;
  const passwordBorderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(formScale, {
        toValue: 1,
        duration: 800,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer effect loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle pulse animation for divider
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
    const anim = inputName === 'username' ? usernameBorderAnim : passwordBorderAnim;
    Animated.spring(anim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  };

  const handleInputBlur = (inputName) => {
    setFocusedInput(null);
    const anim = inputName === 'username' ? usernameBorderAnim : passwordBorderAnim;
    Animated.spring(anim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  };

  const handleLogin = async () => {
    // Validation with toast messages
    if (!username && !password) {
      showToast("Please enter username and password", "warning");
      return;
    }
    
    if (!username) {
      showToast("Username is required", "warning");
      return;
    }
    
    if (!password) {
      showToast("Password is required", "warning");
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.spring(buttonScale, {
        toValue: 0.92,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const success = await login(username, password);
      
      if (success) {
        showToast("Login successful! Welcome back", "success");
        // Delay navigation slightly to show success toast
        setTimeout(() => {
          navigation.replace("Home");
        }, 500);
      } else {
        showToast("Invalid username or password", "error");
      }
    } catch (error) {
      showToast("Login failed. Please try again", "error");
      console.error("Login error:", error);
    }
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const usernameBorderColor = usernameBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(212, 175, 55, 0.4)', '#D4AF37'],
  });

  const passwordBorderColor = passwordBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(212, 175, 55, 0.4)', '#D4AF37'],
  });

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={require("../../Assets/Images/background.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(0, 20, 50, 0.75)",
            "rgba(28, 70, 124, 0.50)",
            "rgba(28, 70, 124, 0.60)",
            "rgba(0, 20, 50, 0.80)",
          ]}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Logo/Title Section with shimmer */}
              <Animated.View
                style={[
                  styles.logoContainer,
                  { transform: [{ scale: logoScale }] },
                ]}
              >
                <View style={styles.logoWrapper}>
                  <Text style={[styles.title, FONTS.heading]}>
                    Retail{'\n'}
                    <Text style={styles.titleAccent}>Jewellery Estimation</Text>
                  </Text>
                </View>
                <Text style={[styles.subtitle, FONTS.body]}>Exquisite Craftsmanship</Text>
                <Animated.View 
                  style={[
                    styles.divider,
                    { transform: [{ scaleX: pulseAnim }] }
                  ]} 
                />
              </Animated.View>

              {/* Login Form with glassmorphism */}
              <Animated.View
                style={[
                  styles.formContainer,
                  { transform: [{ scale: formScale }] },
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0.08)']}
                  style={styles.glassBackground}
                >
                  <View style={styles.formInner}>
                    <Text style={[styles.formTitle, FONTS.text]}>Welcome Back</Text>
                    
                    <Animated.View
                      style={[
                        styles.inputWrapper,
                        { borderColor: usernameBorderColor },
                      ]}
                    >
                      <TextInput
                        style={[styles.input, FONTS.text]}
                        placeholder="Username"
                        placeholderTextColor="rgba(212, 175, 55, 1)"
                        value={username}
                        onChangeText={setUsername}
                        onFocus={() => handleInputFocus('username')}
                        onBlur={() => handleInputBlur('username')}
                        autoCapitalize="none"
                        editable={!loading}
                      />
                    </Animated.View>

                    <Animated.View
                      style={[
                        styles.inputWrapper,
                        { borderColor: passwordBorderColor },
                      ]}
                    >
                      <TextInput
                        style={[styles.input, FONTS.text]}
                        placeholder="Password"
                        placeholderTextColor="rgba(212, 175, 55, 1)"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => handleInputFocus('password')}
                        onBlur={() => handleInputBlur('password')}
                        editable={!loading}
                        onSubmitEditing={handleLogin}
                      />
                    </Animated.View>

                    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                      <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.85}
                      >
                        <LinearGradient
                          colors={['#D4AF37', '#F4D03F', '#D4AF37']}
                          style={styles.gradientButton}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          {loading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator color="#1c467c" size="small" />
                              <Text style={[styles.loadingText, FONTS.font]}>Signing in...</Text>
                            </View>
                          ) : (
                            <Text style={[styles.buttonText, FONTS.text]}>SIGN IN</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.decorativeLine}>
                      <View style={styles.decorativeDot} />
                      <View style={styles.decorativeLineFill} />
                      <View style={styles.decorativeDot} />
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>

              
            </Animated.View>
          </KeyboardAvoidingView>
          {/* Footer ornament */}
              <Footer />
        </LinearGradient>
        
      </ImageBackground>
    </>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: -40,
  },
  content: {
    width: "100%",
    alignItems: "center",
    maxWidth: 440,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoWrapper: {
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: '100%',
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    letterSpacing: 5,
    textAlign: 'center',
    textShadowColor: "rgba(0, 0, 0, 0.7)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  titleAccent: {
    color: '#D4AF37',
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: "#F0E68C",
    letterSpacing: 3,
    marginBottom: 24,
    fontWeight: "400",
    fontSize: 26,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  divider: {
    width: 100,
    height: 2.5,
    backgroundColor: '#D4AF37',
    opacity: 0.85,
    borderRadius: 2,
    shadowColor: "#D4AF37",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  formContainer: {
    width: "100%",
    borderRadius: 24,
    overflow: 'hidden',
  },
  glassBackground: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  formInner: {
    padding: 35,
  },
  formTitle: {
    color: '#FFFFFF',
    textAlign: "center",
    marginBottom: 22,
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    fontWeight: "600",
    fontSize: 20, 
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: "rgba(78, 78, 78, 1)",
    borderWidth: 2,
    overflow: 'hidden',
  },
  input: {
    width: "100%",
    height: 58,
    paddingHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 58,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 15,
    shadowColor: "#D4AF37",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  buttonText: {
    color: '#00275aff',
    fontWeight: "600",
    letterSpacing: 2.5,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontSize: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#1c467c',
    fontWeight: '600',
    marginLeft: 8,
  },
  decorativeLine: {
    width: "100%",
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  decorativeLineFill: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(212, 175, 55, 0.4)",
  },
  decorativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
    marginHorizontal: 8,
    shadowColor: "#D4AF37",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  footerOrnament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  ornamentLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.5)',
  },
  footerText: {
    color: "#F0E68C",
    letterSpacing: 3,
    marginHorizontal: 20,
    fontWeight: "400",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});