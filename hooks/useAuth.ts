// import { useEffect, useState } from 'react';
// import { AuthService, AuthUser } from '../services/auth';

// export const useAuth = () => {
//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = AuthService.onAuthStateChanged((user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const signIn = async (email: string, password: string) => {
//     setLoading(true);
//     try {
//       const user = await AuthService.signIn(email, password);
//       setUser(user);
//       return user;
//     } catch (error) {
//       setLoading(false);
//       throw error;
//     }
//   };

//   const signUp = async (email: string, password: string, displayName?: string) => {
//     setLoading(true);
//     try {
//       const user = await AuthService.signUp(email, password, displayName);
//       setUser(user);
//       return user;
//     } catch (error) {
//       setLoading(false);
//       throw error;
//     }
//   };

//   const signOut = async () => {
//     try {
//       await AuthService.signOut();
//       setUser(null);
//     } catch (error) {
//       throw error;
//     }
//   };

//   return {
//     user,
//     loading,
//     signIn,
//     signUp,
//     signOut,
//     isAuthenticated: !!user,
//   };
// };
