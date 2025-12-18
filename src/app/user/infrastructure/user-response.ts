export interface UserResponse {
  id: number;
  name: string;
  email: string;
  password: number;
  phone: string;
  membershipPlanId: string;
  isActive: boolean;
  profilePicture: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  verificationStatus: string;
  registrationDate: string;
  preferences: {
    language: string;
    notifications: boolean;
    theme: string;
  };
  statistics: {
    totalTrips: number;
    totalDistance: number;
    totalSpent: number;
    averageRating: number;
  };
}

export interface UsersListResponse {
  users: UserResponse[];
}

export interface ProfileResponse {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}
