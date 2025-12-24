import { Observable } from 'rxjs';
import { Booking, CreateBookingRequest } from './model/booking.model';

/**
 * BookingRepository - Abstract repository interface (Domain Layer)
 * 
 * Defines the contract for booking data operations.
 * Implementation details are handled in the infrastructure layer.
 * 
 * This follows the Dependency Inversion Principle:
 * - Domain layer defines the interface
 * - Infrastructure layer implements it
 * - Application layer depends on the abstraction, not the implementation
 */
export abstract class BookingRepository {
  /**
   * Create a new booking
   * @param request Minimal data required to create a booking
   * @returns Observable of the created booking with all server-generated fields
   */
  abstract create(request: CreateBookingRequest): Observable<Booking>;

  /**
   * Retrieve a booking by its unique identifier
   * @param id Booking ID
   * @returns Observable of the booking or error if not found
   */
  abstract getById(id: string): Observable<Booking>;

  /**
   * Retrieve all bookings for a specific user
   * @param userId User ID
   * @returns Observable array of bookings
   */
  abstract getByUserId(userId: string): Observable<Booking[]>;

  /**
   * Get the active booking for a user (if any)
   * @param userId User ID
   * @returns Observable of active booking or null if none exists
   */
  abstract getActiveBooking(userId: string): Observable<Booking | null>;

  /**
   * Cancel a booking
   * @param id Booking ID to cancel
   * @returns Observable of the updated booking
   */
  abstract cancel(id: string): Observable<Booking>;

  /**
   * Update booking status (for activation, completion, etc.)
   * @param id Booking ID
   * @param status New status
   * @returns Observable of the updated booking
   */
  abstract updateStatus(id: string, status: string): Observable<Booking>;
}
