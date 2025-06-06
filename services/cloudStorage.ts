// import {
//     addDoc,
//     collection,
//     getDocs,
//     orderBy,
//     query,
//     serverTimestamp,
//     Timestamp,
//     where
// } from 'firebase/firestore';
// import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
// import { ObservationRecord } from './database';
// import { db, storage } from './firebase';

// export interface CloudObservation {
//   id?: string;
//   userId: string;
//   location: string;
//   latitude: number;
//   longitude: number;
//   depth: number;
//   notes?: string;
//   timestamp: string;
//   photoUrls?: string[];
//   createdAt: Timestamp;
//   updatedAt: Timestamp;
// }

// export class CloudStorageService {
//   static async uploadObservation(observation: ObservationRecord, photoUris?: string[]): Promise<string> {
//     try {
//       let photoUrls: string[] = [];
      
//       // Upload photos if provided
//       if (photoUris && photoUris.length > 0) {
//         photoUrls = await this.uploadPhotos(photoUris, observation.userId);
//       }

//       const cloudObservation: Omit<CloudObservation, 'id'> = {
//         userId: observation.userId,
//         location: observation.location,
//         latitude: observation.latitude,
//         longitude: observation.longitude,
//         depth: observation.depth,
//         notes: observation.notes,
//         timestamp: observation.timestamp,
//         photoUrls,
//         createdAt: serverTimestamp() as Timestamp,
//         updatedAt: serverTimestamp() as Timestamp,
//       };

//       const docRef = await addDoc(collection(db, 'observations'), cloudObservation);
//       return docRef.id;
//     } catch (error) {
//       console.error('Error uploading observation:', error);
//       throw error;
//     }
//   }

//   static async getObservations(userId: string): Promise<CloudObservation[]> {
//     try {
//       const q = query(
//         collection(db, 'observations'),
//         where('userId', '==', userId),
//         orderBy('createdAt', 'desc')
//       );

//       const querySnapshot = await getDocs(q);
//       return querySnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       } as CloudObservation));
//     } catch (error) {
//       console.error('Error fetching observations:', error);
//       throw error;
//     }
//   }

//   static async uploadPhotos(photoUris: string[], userId: string): Promise<string[]> {
//     const uploadPromises = photoUris.map(async (uri, index) => {
//       try {
//         const response = await fetch(uri);
//         const blob = await response.blob();
        
//         const timestamp = Date.now();
//         const fileName = `observations/${userId}/${timestamp}_${index}.jpg`;
//         const storageRef = ref(storage, fileName);
        
//         await uploadBytes(storageRef, blob);
//         return await getDownloadURL(storageRef);
//       } catch (error) {
//         console.error(`Error uploading photo ${index}:`, error);
//         throw error;
//       }
//     });

//     return Promise.all(uploadPromises);
//   }

//   static async syncObservations(observations: ObservationRecord[]): Promise<{ success: string[], failed: string[] }> {
//     const results = { success: [] as string[], failed: [] as string[] };

//     for (const observation of observations) {
//       try {
//         const photoUris = observation.photos ? JSON.parse(observation.photos) : [];
//         await this.uploadObservation(observation, photoUris);
//         results.success.push(observation.id!);
//       } catch (error) {
//         console.error(`Failed to sync observation ${observation.id}:`, error);
//         results.failed.push(observation.id!);
//       }
//     }

//     return results;
//   }
// }
