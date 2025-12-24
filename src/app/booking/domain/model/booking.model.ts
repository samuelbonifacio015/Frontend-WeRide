/**
 * Booking Domain Models
 * 
 * Clean separation between read and write operations:
 * - CreateBookingRequest: Exact contract for creating a booking (write-only)
 * - Booking: Full booking data returned from API (read-only)
 * 
 * IMPORTANT: CreateBookingRequest matches EXACTLY the backend contract
 */

export type BookingActivationStatus = 
  | 'scheduled'
  | 'active'
  | 'completed'
  | 'cancelled';

export type BookingStatus = 
  | 'draft' 
  | 'pending' 
  | 'confirmed' 
  | 'active' 
  | 'completed' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded';

/**
 * CreateBookingRequest - Data Transfer Object for creating a new booking
 * 
 * This is the EXACT contract expected by the backend.
 * DO NOT send any fields that are not listed here.
 * 
 * Example payload:
 * ```json
 * {
 *   "userId": 1,
 *   "vehicleId": 11,
 *   "startLocationId": 1,
 *   "endLocationId": 1,
 *   "reservedAt": "2025-12-25T14:30:00.000Z",
 *   "startDate": "2025-12-25T15:00:00.000Z",
 *   "endDate": "2025-12-25T16:00:00.000Z",
 *   "totalCost": 27.50,
 *   "finalCost": 27.50,
 *   "paymentMethod": "card",
 *   "paymentStatus": "pending",
 *   "duration": 60
 * }
 * ```
 */
export interface CreateBookingRequest {
  userId: number;
  vehicleId: number;
  startLocationId: number;
  endLocationId: number;
  reservedAt: string;      // ISO 8601 format (e.g., "2025-12-25T14:30:00.000Z")
  startDate: string;       // ISO 8601 format
  endDate: string;         // ISO 8601 format
  totalCost: number;       // Total cost before discount
  finalCost: number;       // Final cost after discount
  paymentMethod: string;   // e.g., "card", "cash", "wallet"
  paymentStatus: PaymentStatus;
  duration: number;        // Duration in minutes
}

/**
 * Booking - Full domain entity (read-only)
 * 
 * Represents a complete booking as returned from the backend.
 * Includes all computed fields, timestamps, and relationships.
 */
export interface Booking {
  // Core identifiers
  id: string;
  userId: string;
  vehicleId: string;
  startLocationId: string;
  endLocationId: string;

  // Timestamps
  reservedAt: Date;
  startDate: Date;
  endDate: Date;
  actualStartDate: Date | null;
  actualEndDate: Date | null;

  // Status tracking
  status: BookingStatus;
  activationStatus?: BookingActivationStatus;
  isActivated?: boolean;
  activatedAt?: Date;

  // Financial
  totalCost: number;
  discount: number;
  finalCost: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;

  // Trip metrics (computed after completion)
  distance: number | null;
  duration: number | null;
  averageSpeed: number | null;

  // User feedback (only after completion)
  rating: BookingRating | null;

  // Issues tracking
  issues: string[];

  // Unlock codes (for active bookings)
  qrCode?: string;
  unlockCode?: string;
}

/**
 * BookingRating - User feedback after completing a trip
 */
export interface BookingRating {
  score: number;
  comment: string;
}

/**
 * BookingSummary - Lightweight version for lists
 * 
 * Use this for displaying bookings in lists to reduce payload size.
 */
export interface BookingSummary {
  id: string;
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  finalCost: number;
  rating: BookingRating | null;
}
