import { Injectable, signal, computed } from '@angular/core';
import { BookingRepository } from '../domain/booking.repository';
import { Booking, CreateBookingRequest } from '../domain/model/booking.model';

/**
 * BookingService - Application layer service for booking operations
 * 
 * Responsibilities:
 * - Manage booking state using Angular Signals
 * - Coordinate business logic for booking operations
 * - Provide a clean API for the presentation layer
 * 
 * Uses Signals (Angular 17+) for reactive state management:
 * - Better performance than RxJS BehaviorSubject
 * - Automatic change detection
 * - Cleaner syntax
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  // State signals
  private _bookings = signal<Booking[]>([]);
  private _activeBooking = signal<Booking | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // Public readonly signals
  readonly bookings = this._bookings.asReadonly();
  readonly activeBooking = this._activeBooking.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly completedBookings = computed(() => 
    this._bookings().filter(b => b.status === 'completed')
  );

  readonly upcomingBookings = computed(() => 
    this._bookings().filter(b => 
      b.status === 'confirmed' || b.status === 'pending'
    )
  );

  readonly bookingHistory = computed(() => 
    this._bookings()
      .filter(b => b.status === 'completed' || b.status === 'cancelled')
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
  );

  constructor(private repository: BookingRepository) {}

  /**
   * Create a new booking
   * 
   * @param request Minimal booking data required to create a booking
   * @returns Promise resolving to the created booking
   * 
   * Example usage:
   * ```typescript
   * const request: CreateBookingRequest = {
   *   userId: currentUser.id,
   *   vehicleId: selectedVehicle.id,
   *   startLocationId: startLocation.id,
   *   endLocationId: endLocation.id,
   *   startDate: new Date().toISOString(),
   *   endDate: addHours(new Date(), 2).toISOString(),
   *   paymentMethod: 'credit_card'
   * };
   * 
   * const booking = await this.bookingService.createBooking(request);
   * ```
   */
  async createBooking(request: CreateBookingRequest): Promise<Booking> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const booking = await this.repository.create(request).toPromise();
      
      if (!booking) {
        throw new Error('Failed to create booking');
      }

      // Add to bookings list
      this._bookings.update(bookings => [...bookings, booking]);

      // Set as active if status is active
      if (booking.status === 'active') {
        this._activeBooking.set(booking);
      }

      return booking;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create booking';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Load booking history for a user
   * 
   * @param userId User ID to load bookings for
   */
  async loadHistory(userId: string): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const bookings = await this.repository.getByUserId(userId).toPromise();
      this._bookings.set(bookings || []);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load booking history';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Get the active booking for a user
   * 
   * @param userId User ID
   * @returns Promise resolving to active booking or null
   */
  async getActiveBooking(userId: string): Promise<Booking | null> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const activeBooking = await this.repository.getActiveBooking(userId).toPromise();
      this._activeBooking.set(activeBooking || null);
      return activeBooking || null;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to get active booking';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Cancel a booking
   * 
   * @param id Booking ID to cancel
   * @returns Promise resolving to the cancelled booking
   */
  async cancelBooking(id: string): Promise<Booking> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const cancelledBooking = await this.repository.cancel(id).toPromise();
      
      if (!cancelledBooking) {
        throw new Error('Failed to cancel booking');
      }

      // Update in bookings list
      this._bookings.update(bookings => 
        bookings.map(b => b.id === id ? cancelledBooking : b)
      );

      // Clear active booking if it was the cancelled one
      if (this._activeBooking()?.id === id) {
        this._activeBooking.set(null);
      }

      return cancelledBooking;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to cancel booking';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Get a specific booking by ID
   * 
   * @param id Booking ID
   * @returns Promise resolving to the booking
   */
  async getBookingById(id: string): Promise<Booking> {
    this._isLoading.set(true);
    this._error.set(null);

    try {
      const booking = await this.repository.getById(id).toPromise();
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      return booking;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to get booking';
      this._error.set(errorMessage);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Clear all booking state
   */
  clearState(): void {
    this._bookings.set([]);
    this._activeBooking.set(null);
    this._error.set(null);
    this._isLoading.set(false);
  }
}
