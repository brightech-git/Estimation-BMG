// import React, { useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   StyleSheet, 
//   KeyboardAvoidingView, 
//   Platform,
//   Alert,
//   Animated,
//   Dimensions,
  
//   ScrollView,
// } from 'react-native';
// import Footer from "../../Components/Footer/Footer";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const { width, height } = Dimensions.get('window');

// export default function LoginScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [emailFocused, setEmailFocused] = useState(false);
//   const [passwordFocused, setPasswordFocused] = useState(false);
  
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(50)).current;
//   const emailInputRef = useRef(null);
//   const passwordInputRef = useRef(null);

//   // Hardcoded credentials
//   const HARDCODED_EMAIL = 'BMG';
//   const HARDCODED_PASSWORD = 'Bmg@123';

//   React.useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       })
//     ]).start();
//   }, []);

// const handleLogin = async () => {
//   if (!email.trim() || !password.trim()) {
//     Alert.alert("Error", "Please enter both username and password");
//     return;
//   }

//   setIsLoading(true);

//   // Simulate API call delay
//   setTimeout(async () => {
//     if (
//       email.trim() === HARDCODED_EMAIL &&
//       password.trim() === HARDCODED_PASSWORD
//     ) {
//       try {
//         // Save login state
//         await AsyncStorage.setItem("isLoggedIn", "true");

//         setIsLoading(false);

//         // Navigate directly to Home (skip alert if you prefer)
//         navigation.replace("Home");
//       } catch (error) {
//         setIsLoading(false);
//         Alert.alert("Error", "Failed to save login state");
//       }
//     } else {
//       setIsLoading(false);
//       Alert.alert("Login Failed", "Invalid credentials");
//     }
//   }, 1500);
// };

//   const handleEmailFocus = () => setEmailFocused(true);
//   const handleEmailBlur = () => setEmailFocused(false);
//   const handlePasswordFocus = () => setPasswordFocused(true);
//   const handlePasswordBlur = () => setPasswordFocused(false);

//   return (
//     <KeyboardAvoidingView 
//       style={styles.container} 
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
//     >
//         <ScrollView 
//           contentContainerStyle={styles.scrollContainer}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           <View style={styles.background}>
//             {/* Header Section */}
//             <Animated.View 
//               style={[
//                 styles.header,
//                 { 
//                   opacity: fadeAnim,
//                   transform: [{ translateY: slideAnim }] 
//                 }
//               ]}
//             >
//               <View style={styles.logoContainer}>
//                 <Text style={styles.logo}>🔐</Text>
//               </View>
//               <Text style={styles.title}>Welcome Back</Text>
//               <Text style={styles.subtitle}>Sign in to your account</Text>
//             </Animated.View>

//             {/* Form Section */}
//             <Animated.View 
//               style={[
//                 styles.formContainer,
//                 { 
//                   opacity: fadeAnim,
//                   transform: [{ translateY: slideAnim }] 
//                 }
//               ]}
//             >
//               <View style={styles.inputContainer}>
//                 <Text style={styles.label}>Username</Text>
//                 <TextInput
//                   ref={emailInputRef}
//                   placeholder="Enter your username"
//                   placeholderTextColor="#9ca3af"
//                   style={[
//                     styles.input,
//                     emailFocused && styles.inputFocused,
//                     email.length > 0 && styles.inputFilled
//                   ]}
//                   value={email}
//                   onChangeText={setEmail}
//                   onFocus={handleEmailFocus}
//                   onBlur={handleEmailBlur}
//                   autoCorrect={false}
//                   returnKeyType="next"
//                   onSubmitEditing={() => passwordInputRef.current?.focus()}
//                   blurOnSubmit={false}
//                 />
//               </View>

//               <View style={styles.inputContainer}>
//                 <Text style={styles.label}>Password</Text>
//                 <TextInput
//                   ref={passwordInputRef}
//                   placeholder="Enter your password"
//                   placeholderTextColor="#9ca3af"
//                   style={[
//                     styles.input,
//                     passwordFocused && styles.inputFocused,
//                     password.length > 0 && styles.inputFilled
//                   ]}
//                   value={password}
//                   secureTextEntry
//                   onChangeText={setPassword}
//                   onFocus={handlePasswordFocus}
//                   onBlur={handlePasswordBlur}
//                   autoCapitalize="none"
//                   returnKeyType="done"
//                   onSubmitEditing={handleLogin}
//                 />
//               </View>

        

//               <TouchableOpacity 
//                 style={[
//                   styles.loginButton,
//                   isLoading && styles.loginButtonDisabled
//                 ]} 
//                 onPress={handleLogin}
//                 disabled={isLoading}
//                 activeOpacity={0.8}
//               >
//                 {isLoading ? (
//                   <View style={styles.loadingContainer}>
//                     <Text style={styles.loginButtonText}>Signing In...</Text>
//                   </View>
//                 ) : (
//                   <Text style={styles.loginButtonText}>Sign In</Text>
//                 )}
//               </TouchableOpacity>

             
//             </Animated.View>

          
//           </View>
//         </ScrollView>
        
//         {/* Footer Component */}
//         <View style={styles.footerWrapper}>
//           <Footer style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} />
//         </View>
//       </KeyboardAvoidingView>
  
//   );
// }

// const styles = StyleSheet.create({
//   safeContainer: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     minHeight: height * 0.85,
//   },
//   background: {
//     flex: 1,
//     justifyContent: 'flex-start',
//     paddingHorizontal: 30,
//     paddingVertical: 20,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   logoContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#6366f1',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     shadowColor: '#6366f1',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 10,
//   },
//   logo: {
//     fontSize: 35,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#1f2937',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#6b7280',
//     textAlign: 'center',
//   },
//   formContainer: {
//     backgroundColor: '#ffffff',
//     borderRadius: 20,
//     padding: 25,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 20,
//     elevation: 5,
//     marginBottom: 20,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 8,
//     marginLeft: 5,
//   },
//   input: {
//     backgroundColor: '#f9fafb',
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 16,
//     color: '#1f2937',
//     minHeight: 52,
    
//   },
//   inputFocused: {
//     borderColor: '#6366f1',
//     backgroundColor: '#ffffff',
//     shadowColor: '#6366f1',
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   inputFilled: {
//     borderColor: '#10b981',
//     backgroundColor: '#ffffff',
//   },
//   demoButton: {
//     backgroundColor: '#e0e7ff',
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   demoButtonText: {
//     color: '#6366f1',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   loginButton: {
//     backgroundColor: '#6366f1',
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 20,
//     shadowColor: '#6366f1',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//     minHeight: 54,
//     justifyContent: 'center',
//   },
//   loginButtonDisabled: {
//     backgroundColor: '#a5b4fc',
//     shadowOpacity: 0.1,
//   },
//   loginButtonText: {
//     color: '#ffffff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   credentialsHint: {
//     backgroundColor: '#f3f4f6',
//     padding: 15,
//     borderRadius: 10,
//     borderLeftWidth: 4,
//     borderLeftColor: '#6366f1',
//   },
//   hintText: {
//     fontSize: 12,
//     color: '#6b7280',
//     textAlign: 'center',
//     lineHeight: 18,
//   },
//   boldText: {
//     fontWeight: 'bold',
//     color: '#374151',
//   },
//   footerSection: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   footerText: {
//     color: '#6b7280',
//     fontSize: 14,
//   },
//   signUpText: {
//     color: '#6366f1',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   footerWrapper: {
//     backgroundColor: '#f8f9fa',
//   },
// });