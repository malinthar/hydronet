import { Address } from './addressApi';

// Define the prediction step interface
export interface PredictionStep {
  depth: string;
  risk: string;
  timestamp: string;
}

// Define the prediction result interface
export interface FloodPrediction {
  location: string;
  steps: PredictionStep[];
}

/**
 * Get flood predictions for a specific address
 * @param address The address to get predictions for
 * @param hours Number of hours to predict (default 4)
 * @returns Promise with flood prediction data
 */
export const getFloodPrediction = async (
  address: Address | null,
  locationString: string,
  hours: number = 4
): Promise<FloodPrediction> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get current time
  const currentTime = new Date();
  
  // Format hours and minutes with leading zeros if needed
  const formatTimeDisplay = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Generate prediction steps based on location
  // In a real app, this would call an AI model or external API
  const generateSteps = (): PredictionStep[] => {
    // Mock depth values based on location
    let baseDepth = 0.2;
    let riskPattern = 'increasing';
    
    // Use coordinates to slightly vary predictions if available
    if (address?.coordinates) {
      // Add some variability based on coordinates
      const latMod = address.coordinates.latitude % 1;
      const lngMod = address.coordinates.longitude % 1;
      baseDepth = 0.1 + (latMod + lngMod) * 0.3;
      
      // Different risk patterns based on location
      if (address.city === 'Wellington') {
        riskPattern = 'spike-then-decrease';
      } else if (address.city === 'Auckland') {
        riskPattern = 'gradual-increase';
      } else if (address.city === 'Christchurch') {
        riskPattern = 'high-sustained';
      }
    }
    
    // Generate steps based on pattern
    const steps: PredictionStep[] = [];
    for (let i = 0; i < hours; i++) {
      let depth = baseDepth;
      
      switch (riskPattern) {
        case 'increasing':
          depth = baseDepth + (i * 0.2);
          break;
        case 'spike-then-decrease':
          depth = baseDepth + (i === 2 ? 0.8 : i * 0.1);
          break;
        case 'gradual-increase':
          depth = baseDepth + (i * 0.1);
          break;
        case 'high-sustained':
          depth = baseDepth + 0.5;
          break;
      }
      
      // Round depth to 1 decimal place
      depth = Math.round(depth * 10) / 10;
      
      // Determine risk level based on depth       
      let risk = 'Low';
      if (depth >= 0.5) risk = 'High';
      else if (depth >= 0.3) risk = 'Moderate';
      
      steps.push({
        depth: depth.toString(),
        risk,
        timestamp: formatTimeDisplay(new Date(currentTime.getTime() + (i + 1) * 3600000))
      });
    }
    
    return steps;
  };
  
  return {
    location: address ? address.fullAddress : locationString || "Current Location",
    steps: generateSteps()
  };
};
