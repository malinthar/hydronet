// Mock NZ address API service

// Address type definition
export interface Address {
  id: string;
  street: string;
  suburb?: string;
  city: string;
  postcode: string;
  fullAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

// Hardcoded list of NZ addresses for now
const mockAddresses: Address[] = [
  {
    id: '1',
    street: '123 Cuba Street',
    suburb: 'Te Aro',
    city: 'Wellington',
    postcode: '6011',
    fullAddress: '123 Cuba Street, Te Aro, Wellington 6011',
    coordinates: {
      latitude: -41.2930,
      longitude: 174.7739
    }
  },
  {
    id: '2',
    street: '45 Lambton Quay',
    suburb: 'CBD',
    city: 'Wellington',
    postcode: '6011',
    fullAddress: '45 Lambton Quay, CBD, Wellington 6011',
    coordinates: {
      latitude: -41.2865,
      longitude: 174.7762
    }
  },
  {
    id: '3',
    street: '67 Karangahape Road',
    suburb: 'CBD',
    city: 'Auckland',
    postcode: '1010',
    fullAddress: '67 Karangahape Road, CBD, Auckland 1010',
    coordinates: {
      latitude: -36.8566,
      longitude: 174.7580
    }
  },
  {
    id: '4',
    street: '89 Riccarton Road',
    suburb: 'Riccarton',
    city: 'Christchurch',
    postcode: '8041',
    fullAddress: '89 Riccarton Road, Riccarton, Christchurch 8041',
    coordinates: {
      latitude: -43.5321,
      longitude: 172.5978
    }
  },
  {
    id: '5',
    street: '12 George Street',
    suburb: 'CBD',
    city: 'Dunedin',
    postcode: '9016',
    fullAddress: '12 George Street, CBD, Dunedin 9016',
    coordinates: {
      latitude: -45.8742,
      longitude: 170.5036
    }
  },
  {
    id: '6',
    street: '34 Victoria Street',
    suburb: 'Hamilton Central',
    city: 'Hamilton',
    postcode: '3204',
    fullAddress: '34 Victoria Street, Hamilton Central, Hamilton 3204',
    coordinates: {
      latitude: -37.7855,
      longitude: 175.2793
    }
  },
  {
    id: '7',
    street: '56 Trafalgar Street',
    city: 'Nelson',
    postcode: '7010',
    fullAddress: '56 Trafalgar Street, Nelson 7010',
    coordinates: {
      latitude: -41.2706,
      longitude: 173.2840
    }
  },
  {
    id: '8',
    street: '78 The Strand',
    city: 'Tauranga',
    postcode: '3110',
    fullAddress: '78 The Strand, Tauranga 3110',
    coordinates: {
      latitude: -37.6793,
      longitude: 176.1654
    }
  }
];

// Function to simulate API call with search functionality
export const searchAddresses = async (query: string): Promise<Address[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Filter addresses based on query
  return mockAddresses.filter(address => 
    address.fullAddress.toLowerCase().includes(normalizedQuery)
  );
};

// Function to get address by ID
export const getAddressById = async (id: string): Promise<Address | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return mockAddresses.find(address => address.id === id);
};
