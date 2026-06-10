export interface User {
  id: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  lastDonationDate: string | null; // YYYY-MM-DD
  totalDonations: number;
  livesSaved: number;
  requestsAccepted: number;
  badges: string[];
  isAvailable: boolean;
  createdAt: string;
}

export interface Hospital {
  id: string;
  hospitalName: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  isApproved: boolean;
  bloodInventory: { [key: string]: number };
  createdAt: string;
}

export interface BloodRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: string;
  unitsRequired: number;
  unitsMatched: number;
  urgency: 'Low' | 'Medium' | 'Critical';
  patientReference: string;
  notes: string;
  city: string;
  status: 'pending' | 'broadcasted' | 'matched' | 'accepted' | 'completed';
  createdAt: string;
  acceptedByDonorId?: string | null;
  acceptedByDonorName?: string | null;
  acceptedByDonorPhone?: string | null;
}

export interface DonationHistory {
  id: string;
  donorId: string;
  donorName: string;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: string;
  units: number;
  date: string;
  status: 'completed' | 'cancelled';
}

export interface Notification {
  id: string;
  userId?: string;       // target donor
  hospitalId?: string;   // target hospital
  requestId?: string;
  title: string;
  message: string;
  type: 'emergency' | 'match' | 'system';
  read: boolean;
  createdAt: string;
}

export interface DonationCamp {
  id: string;
  title: string;
  location: string;
  city: string;
  date: string;
  time: string;
  organizer: string;
  contact: string;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
}

export interface GlobalStats {
  registeredDonors: number;
  livesSaved: number;
  partnerHospitals: number;
  totalRequests: number;
}
