/**
 * Booking Module - Public API
 * 
 * This file exposes the public interfaces for the booking module.
 * Import from this file instead of deep imports.
 * 
 * Example:
 * ```typescript
 * import { 
 *   BookingService, 
 *   CreateBookingRequest, 
 *   Booking,
 *   bookingProviders 
 * } from './booking';
 * ```
 */

// Domain exports
export type { Booking, CreateBookingRequest, BookingSummary, BookingRating, BookingStatus, BookingActivationStatus, PaymentStatus } from './domain/model/booking.model';
export { BookingRepository } from './domain/booking.repository';

// Application exports
export { BookingService } from './application/booking.service';

// Infrastructure exports (only if needed outside the module)
export { BookingRepositoryImpl } from './infrastructure/booking-repository.impl';

// Providers
export { bookingProviders } from './booking.providers';
