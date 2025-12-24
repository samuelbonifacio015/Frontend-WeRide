/**
 * BookingResponse - API response for booking read operations
 */
export interface BookingResponse {
  id: string;
  userId: string;
  vehicleId: string;
  startLocationId: string;
  endLocationId: string;
  reservedAt: string; // ISO 8601
  startDate: string;  // ISO 8601
  endDate: string;    // ISO 8601
  actualStartDate: string | null;
  actualEndDate: string | null;
  status: 'draft' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  activationStatus?: 'scheduled' | 'active' | 'completed' | 'cancelled';
  isActivated?: boolean;
  activatedAt?: string;
  totalCost: number;
  discount: number;
  finalCost: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  distance: number | null;
  duration: number | null;
  averageSpeed: number | null;
  rating: { score: number; comment: string } | null;
  issues: string[];
  qrCode?: string;
  unlockCode?: string;
}

/**
 * CreateBookingDTO - API request payload for creating a booking
 * 
 * EXACT contract expected by backend.
 * Numbers for IDs, not strings!
 */
export interface CreateBookingDTO {
  userId: number;
  vehicleId: number;
  startLocationId: number;
  endLocationId: number;
  reservedAt: string;       // ISO 8601
  startDate: string;        // ISO 8601
  endDate: string;          // ISO 8601
  totalCost: number;
  finalCost: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  duration: number;         // in minutes
}
