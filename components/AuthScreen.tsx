// import { Ionicons } from '@expo/vector-icons';
// import React, { useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     KeyboardAvoidingView,
//     Platform,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { useAuth } from '../hooks/useAuth';

// export const AuthScreen: React.FC = () => {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [displayName, setDisplayName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { signIn, signUp } = useAuth();

//   const handleSubmit = async () => {
//     if (!email.trim() || !password.trim()) {
//       Alert.alert('Error', 'Please fill in all required fields');
//       return;
//     }

//     if (isSignUp && !displayName.trim()) {
//       Alert.alert('Error', 'Please enter your name');
//       return;
//     }

//     setLoading(true);
//     try {
//       if (isSignUp) {
//         await signUp(email.trim(), password, displayName.trim());
//       } else {
//         await signIn(email.trim(), password);
//       }
//     } catch (error) {
//       Alert.alert('Error', (error as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView 
//       style={styles.container} 
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       <View style={styles.header}>
//         <View style={styles.iconContainer}>
//           <Ionicons name="water-outline" size={48} color="#4FA3C1" />
//         </View>
//         <Text style={styles.title}>HYDRONET</Text>
//         <Text style={styles.subtitle}>AI-Powered Flood Forecasts</Text>
//       </View>

//       <View style={styles.form}>
//         <Text style={styles.formTitle}>
//           {isSignUp ? 'Create Account' : 'Sign In'}
//         </Text>

//         {isSignUp && (
//           <View style={styles.inputContainer}>
//             <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Full Name"
//               value={displayName}
//               onChangeText={setDisplayName}
//               autoCapitalize="words"
//             />
//           </View>
//         )}

//         <View style={styles.inputContainer}>
//           <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
//           <TextInput
//             style={styles.input}
//             placeholder="Email"
//             value={email}
//             onChangeText={setEmail}
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
//           <TextInput
//             style={styles.input}
//             placeholder="Password"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry
//           />
//         </View>

//         <TouchableOpacity 
//           style={[styles.submitButton, loading && styles.disabledButton]}
//           onPress={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#FFFFFF" />
//           ) : (
//             <Text style={styles.submitButtonText}>
//               {isSignUp ? 'Create Account' : 'Sign In'}
//             </Text>
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={styles.switchButton}
//           onPress={() => setIsSignUp(!isSignUp)}
//         >
//           <Text style={styles.switchButtonText}>
//             {isSignUp 
//               ? 'Already have an account? Sign In' 
//               : "Don't have an account? Sign Up"
//             }
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F8FA',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   header: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   iconContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 50,
//     padding: 20,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#4FA3C1',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
//   form: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 24,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   formTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 24,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F5F8FA',
//     borderRadius: 12,
//     marginBottom: 16,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderColor: '#E1E8ED',
//   },
//   inputIcon: {
//     marginRight: 12,
//   },
//   input: {
//     flex: 1,
//     paddingVertical: 16,
//     fontSize: 16,
//     color: '#333',
//   },
//   submitButton: {
//     backgroundColor: '#4FA3C1',
//     borderRadius: 12,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   disabledButton: {
//     opacity: 0.6,
//   },
//   submitButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   switchButton: {
//     marginTop: 16,
//     alignItems: 'center',
//   },
//   switchButtonText: {
//     color: '#4FA3C1',
//     fontSize: 14,
//   },
// });
