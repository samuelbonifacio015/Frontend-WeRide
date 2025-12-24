import { Provider } from '@angular/core';
import { BookingRepository } from './domain/booking.repository';
import { BookingRepositoryImpl } from './infrastructure/booking-repository.impl';
import { BookingService } from './application/booking.service';

/**
 * Booking Module Providers
 * 
 * Configures dependency injection for the booking module:
 * - Binds BookingRepository abstract class to concrete implementation
 * - Registers BookingService as singleton
 * 
 * Usage in app.config.ts or component providers:
 * ```typescript
 * import { bookingProviders } from './booking/booking.providers';
 * 
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     ...bookingProviders,
 *     // other providers
 *   ]
 * };
 * ```
 */
export const bookingProviders: Provider[] = [
  // Bind abstract repository to concrete implementation
  {
    provide: BookingRepository,
    useClass: BookingRepositoryImpl
  },
  
  // Register service (already providedIn: 'root', but explicit for clarity)
  BookingService
];
