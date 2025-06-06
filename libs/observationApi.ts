import { Address } from './addressApi';

// Define the observation interface
export interface FloodObservation {
  id: string;
  timestamp: Date;
  address: Address | null;
  locationText: string;
  depth: number;
  notes?: string;
  observedAt: Date; // When the actual observation was made
  photos?: string[]; // Add photos array
}

// Storage for observations (in a real app, this would be a database)
const observations: FloodObservation[] = [];

// Function to submit a new observation
export const submitFloodObservation = async (
  address: Address | null,
  locationText: string,
  depth: number,
  notes?: string,
  observedAt: Date = new Date(), // Default to current time if not provided
  photos?: string[] // Add photos parameter
): Promise<FloodObservation> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newObservation: FloodObservation = {
    id: Date.now().toString(),
    timestamp: new Date(), // When submitted to the system
    observedAt, // When the user actually observed the flood
    address,
    locationText,
    depth,
    notes,
    photos: photos || [] // Include photos in the observation
  };
  
  // In a real app, this would be an API POST request
  observations.push(newObservation);
  
  console.log('Observation submitted:', newObservation);
  
  return newObservation;
};

// Get observations for a specific location
export const getObservationsForLocation = async (
  address: Address | null,
  locationText: string
): Promise<FloodObservation[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Filter observations based on location
  return observations.filter(obs => {
    // If address is available, match by coordinates
    if (address?.coordinates && obs.address?.coordinates) {
      const distSquared = 
        Math.pow(address.coordinates.latitude - obs.address.coordinates.latitude, 2) + 
        Math.pow(address.coordinates.longitude - obs.address.coordinates.longitude, 2);
      // Consider observations within roughly 200m
      return distSquared < 0.000032;
    }
    
    // Otherwise match by text
    return obs.locationText === locationText;
  });
};
