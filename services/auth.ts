// import {
//     AuthError,
//     createUserWithEmailAndPassword,
//     onAuthStateChanged,
//     sendPasswordResetEmail,
//     signInWithEmailAndPassword,
//     signOut,
//     updateProfile,
//     User
// } from 'firebase/auth';
// import { auth } from './firebase';

// export interface AuthUser {
//   uid: string;
//   email: string | null;
//   displayName: string | null;
//   photoURL: string | null;
// }

// export class AuthService {
//   static async signIn(email: string, password: string): Promise<AuthUser> {
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       return this.mapFirebaseUser(userCredential.user);
//     } catch (error) {
//       throw this.handleAuthError(error as AuthError);
//     }
//   }

//   static async signUp(email: string, password: string, displayName?: string): Promise<AuthUser> {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
//       if (displayName) {
//         await updateProfile(userCredential.user, { displayName });
//       }
      
//       return this.mapFirebaseUser(userCredential.user);
//     } catch (error) {
//       throw this.handleAuthError(error as AuthError);
//     }
//   }

//   static async signOut(): Promise<void> {
//     try {
//       await signOut(auth);
//     } catch (error) {
//       throw this.handleAuthError(error as AuthError);
//     }
//   }

//   static async resetPassword(email: string): Promise<void> {
//     try {
//       await sendPasswordResetEmail(auth, email);
//     } catch (error) {
//       throw this.handleAuthError(error as AuthError);
//     }
//   }

//   static onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
//     return onAuthStateChanged(auth, (user) => {
//       callback(user ? this.mapFirebaseUser(user) : null);
//     });
//   }

//   static getCurrentUser(): AuthUser | null {
//     const user = auth.currentUser;
//     return user ? this.mapFirebaseUser(user) : null;
//   }

//   private static mapFirebaseUser(user: User): AuthUser {
//     return {
//       uid: user.uid,
//       email: user.email,
//       displayName: user.displayName,
//       photoURL: user.photoURL,
//     };
//   }

//   private static handleAuthError(error: AuthError): Error {
//     switch (error.code) {
//       case 'auth/user-not-found':
//         return new Error('No account found with this email address.');
//       case 'auth/wrong-password':
//         return new Error('Incorrect password.');
//       case 'auth/email-already-in-use':
//         return new Error('An account with this email already exists.');
//       case 'auth/weak-password':
//         return new Error('Password should be at least 6 characters.');
//       case 'auth/invalid-email':
//         return new Error('Please enter a valid email address.');
//       default:
//         return new Error(error.message || 'An authentication error occurred.');
//     }
//   }
// }
