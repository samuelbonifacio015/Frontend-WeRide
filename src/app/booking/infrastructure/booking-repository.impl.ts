import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookingRepository } from '../domain/booking.repository';
import { Booking, CreateBookingRequest } from '../domain/model/booking.model';
import { BookingsApiEndpoint } from './bookings-api-endpoint';
import { toDomainBooking, toCreateBookingDTO } from './booking-assembler';

/**
 * BookingRepositoryImpl - Concrete implementation of BookingRepository
 * 
 * Implements the repository pattern by:
 * - Delegating HTTP calls to BookingsApiEndpoint
 * - Converting between domain models and infrastructure DTOs
 * - Providing a clean interface for the application layer
 */
@Injectable({ providedIn: 'root' })
export class BookingRepositoryImpl extends BookingRepository {
  constructor(private apiEndpoint: BookingsApiEndpoint) {
    super();
  }

  /**
   * Create a new booking
   * Converts domain CreateBookingRequest to API DTO and back
   */
  create(request: CreateBookingRequest): Observable<Booking> {
    const dto = toCreateBookingDTO(request);
    return this.apiEndpoint.create(dto).pipe(
      map(response => toDomainBooking(response))
    );
  }

  /**
   * Get booking by ID
   */
  getById(id: string): Observable<Booking> {
    return this.apiEndpoint.getById(id).pipe(
      map(response => toDomainBooking(response))
    );
  }

  /**
   * Get all bookings for a user
   */
  getByUserId(userId: string): Observable<Booking[]> {
    return this.apiEndpoint.getAll().pipe(
      map(responses => responses
        .filter(r => r.userId === userId)
        .map(r => toDomainBooking(r))
      )
    );
  }

  /**
   * Get active booking for a user
   * Returns the first booking with status 'active' or null
   */
  getActiveBooking(userId: string): Observable<Booking | null> {
    return this.apiEndpoint.getAll().pipe(
      map(responses => {
        const activeBooking = responses.find(
          r => r.userId === userId && r.status === 'active'
        );
        return activeBooking ? toDomainBooking(activeBooking) : null;
      })
    );
  }

  /**
   * Cancel a booking
   * Updates status to 'cancelled'
   */
  cancel(id: string): Observable<Booking> {
    return this.apiEndpoint.update(id, { status: 'cancelled' }).pipe(
      map(response => toDomainBooking(response))
    );
  }

  /**
   * Update booking status
   */
  updateStatus(id: string, status: string): Observable<Booking> {
    return this.apiEndpoint.update(id, { status: status as any }).pipe(
      map(response => toDomainBooking(response))
    );
  }
}
