// // This file contains the database code that was removed from the main app

// // Import statements for database
// import { CloudStorageService } from '@/services/cloudStorage';
// import { DatabaseService, ObservationRecord } from '@/services/database';

// // Database initialization
// useEffect(() => {
//   const initializeDatabase = async () => {
//     try {
//       await DatabaseService.initialize();
//     } catch (error) {
//       console.error('Failed to initialize database:', error);
//     }
//   };

//   initializeDatabase();
// }, []);

// // Modified getPrediction function with database integration
// const handleGetPrediction = async () => {
//   setIsLoading(true);
  
//   try {
//     const prediction = await getFloodPrediction(selectedAddress, location);
    
//     // Save prediction to local database
//     if (user && selectedAddress) {
//       await DatabaseService.savePrediction({
//         userId: user.uid,
//         location: prediction.location,
//         latitude: selectedAddress.coordinates?.latitude || 0,
//         longitude: selectedAddress.coordinates?.longitude || 0,
//         predictionData: JSON.stringify(prediction),
//         timestamp: new Date().toISOString(),
//         createdAt: new Date().toISOString(),
//       });
//     }
    
//     setPredictionResult(prediction);
//     setActiveStepIndex(0);
//     setShowInputForm(false);
//     setShowResults(true);
//     setShowMap(false);
//   } catch (error) {
//     console.error('Error getting flood prediction:', error);
//     Alert.alert('Error', 'Failed to get flood prediction. Please try again.');
//   } finally {
//     setIsLoading(false);
//   }
// };

// // Modified submit observation with database integration
// const handleSubmitObservation = async () => {
//   if (!observedDepth || !user || !selectedAddress) return;
  
//   setIsSubmitting(true);
  
//   try {
//     const depth = parseFloat(observedDepth);
//     if (isNaN(depth)) {
//       throw new Error('Invalid depth value');
//     }

//     const observationId = DatabaseService.generateId();
//     const observation: ObservationRecord = {
//       id: observationId,
//       userId: user.uid,
//       location: location,
//       latitude: selectedAddress.coordinates?.latitude || 0,
//       longitude: selectedAddress.coordinates?.longitude || 0,
//       depth,
//       notes: observationNotes,
//       timestamp: observedDate.toISOString(),
//       photos: selectedPhotos.length > 0 ? JSON.stringify(selectedPhotos) : undefined,
//       synced: false,
//       createdAt: new Date().toISOString(),
//     };

//     // Save to local database
//     await DatabaseService.saveObservation(observation);

//     // Try to sync to cloud
//     try {
//       await CloudStorageService.uploadObservation(observation, selectedPhotos);
//       await DatabaseService.markObservationSynced(observationId);
//     } catch (syncError) {
//       console.log('Cloud sync failed, data saved locally:', syncError);
//       // Don't show error to user, data is saved locally
//     }

//     // Reset form
//     setObservedDepth('');
//     setObservationNotes('');
//     setObservedDate(new Date());
//     setSelectedPhotos([]);
//     setSubmissionSuccess(true);
    
//     setTimeout(() => {
//       setSubmissionSuccess(false);
//       setShowObservationForm(false);
//     }, 3000);
    
//   } catch (error) {
//     console.error('Error submitting observation:', error);
//     Alert.alert('Error', 'Failed to submit observation. Please try again.');
//   } finally {
//     setIsSubmitting(false);
//   }
// };
