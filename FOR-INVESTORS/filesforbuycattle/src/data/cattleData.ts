
// Data model for Dairy-Lift cattle breeds
export interface CattleBreed {
  id: string;
  name: string;
  type: 'Cow' | 'Buffalo' | 'Bull' | 'Calf';
  breed: string;
  shortDescription: string;
  imageUrl: string;
  age: string;
  price: number;
  lactationCycle?: string;
  milkProduction?: number;
  healthStatus: 'Excellent' | 'Good' | 'Fair';
  isVaccinated: boolean;
  monthlyEstimatedIncome: number;
  location: string;
}

// Sample data for cattle breeds
export const cattleBreeds: CattleBreed[] = [
  {
    id: '1',
    name: 'Lakshmi',
    type: 'Cow',
    breed: 'Gir',
    shortDescription: 'High milk-yielding indigenous cow breed from Gujarat',
    imageUrl: 'https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?auto=format&fit=crop&w=600&h=400',
    age: '4 years',
    price: 85000,
    lactationCycle: '3rd Lactation',
    milkProduction: 16,
    healthStatus: 'Excellent',
    isVaccinated: true,
    monthlyEstimatedIncome: 12000,
    location: 'Gujarat'
  },
  {
    id: '2',
    name: 'Kali',
    type: 'Buffalo',
    breed: 'Murrah',
    shortDescription: 'Premium buffalo breed known for rich milk content',
    imageUrl: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=600&h=400',
    age: '5 years',
    price: 120000,
    lactationCycle: '4th Lactation',
    milkProduction: 22,
    healthStatus: 'Excellent',
    isVaccinated: true,
    monthlyEstimatedIncome: 18000,
    location: 'Haryana'
  },
  {
    id: '3',
    name: 'Raja',
    type: 'Bull',
    breed: 'Sahiwal',
    shortDescription: 'Strong and healthy bull with superior genetics',
    imageUrl: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?auto=format&fit=crop&w=600&h=400',
    age: '6 years',
    price: 150000,
    healthStatus: 'Excellent',
    isVaccinated: true,
    monthlyEstimatedIncome: 20000,
    location: 'Punjab'
  },
  {
    id: '4',
    name: 'Nandi',
    type: 'Calf',
    breed: 'Red Sindhi',
    shortDescription: 'Healthy male calf from high milk-yielding mother',
    imageUrl: 'https://images.unsplash.com/photo-1485833077593-4278bba3f11f?auto=format&fit=crop&w=600&h=400',
    age: '6 months',
    price: 35000,
    healthStatus: 'Good',
    isVaccinated: true,
    monthlyEstimatedIncome: 0,
    location: 'Rajasthan'
  },
  {
    id: '5',
    name: 'Gauri',
    type: 'Cow',
    breed: 'Rathi',
    shortDescription: 'Adaptable cow breed with good milk yield',
    imageUrl: 'https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?auto=format&fit=crop&w=600&h=400',
    age: '3 years',
    price: 75000,
    lactationCycle: '2nd Lactation',
    milkProduction: 14,
    healthStatus: 'Good',
    isVaccinated: true,
    monthlyEstimatedIncome: 10000,
    location: 'Rajasthan'
  },
  {
    id: '6',
    name: 'Sona',
    type: 'Buffalo',
    breed: 'Jaffarabadi',
    shortDescription: 'Heavy milk-producing buffalo with high fat content',
    imageUrl: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=600&h=400',
    age: '4 years',
    price: 110000,
    lactationCycle: '3rd Lactation',
    milkProduction: 18,
    healthStatus: 'Excellent',
    isVaccinated: true,
    monthlyEstimatedIncome: 15000,
    location: 'Gujarat'
  }
];

// Function to get recommended cattle based on type, location, or income range
export function getRecommendedCattle(currentCattle: CattleBreed): CattleBreed[] {
  // Filter out the current cattle and return similar breeds
  return cattleBreeds
    .filter(cattle => 
      cattle.id !== currentCattle.id && 
      (cattle.type === currentCattle.type || 
       cattle.location === currentCattle.location || 
       Math.abs(cattle.monthlyEstimatedIncome - currentCattle.monthlyEstimatedIncome) < 5000)
    )
    .slice(0, 3); // Return top 3 recommendations
}
