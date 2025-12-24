import { Booking, CreateBookingRequest } from '../domain/model/booking.model';
import { BookingResponse, CreateBookingDTO } from './bookings-response';

/**
 * BookingAssembler - Maps between domain models and infrastructure DTOs
 * 
 * Responsibilities:
 * - Convert API responses to domain entities
 * - Convert domain requests to API payloads
 * - Handle data type transformations (ISO strings ↔ Date objects, string ↔ number)
 */

/**
 * Maps API response to domain Booking entity
 */
export function toDomainBooking(response: BookingResponse): Booking {
  return {
    id: response.id,
    userId: response.userId,
    vehicleId: response.vehicleId,
    startLocationId: response.startLocationId,
    endLocationId: response.endLocationId,
    reservedAt: new Date(response.reservedAt),
    startDate: new Date(response.startDate),
    endDate: new Date(response.endDate),
    actualStartDate: response.actualStartDate ? new Date(response.actualStartDate) : null,
    actualEndDate: response.actualEndDate ? new Date(response.actualEndDate) : null,
    status: response.status,
    activationStatus: response.activationStatus,
    isActivated: response.isActivated,
    activatedAt: response.activatedAt ? new Date(response.activatedAt) : undefined,
    totalCost: response.totalCost,
    discount: response.discount,
    finalCost: response.finalCost,
    paymentMethod: response.paymentMethod,
    paymentStatus: response.paymentStatus,
    distance: response.distance,
    duration: response.duration,
    averageSpeed: response.averageSpeed,
    rating: response.rating,
    issues: response.issues,
    qrCode: response.qrCode,
    unlockCode: response.unlockCode
  };
}

/**
 * Maps domain CreateBookingRequest to API DTO
 * 
 * IMPORTANT: This ensures the exact contract is sent to backend
 */
export function toCreateBookingDTO(request: CreateBookingRequest): CreateBookingDTO {
  return {
    userId: request.userId,
    vehicleId: request.vehicleId,
    startLocationId: request.startLocationId,
    endLocationId: request.endLocationId,
    reservedAt: request.reservedAt,
    startDate: request.startDate,
    endDate: request.endDate,
    totalCost: request.totalCost,
    finalCost: request.finalCost,
    paymentMethod: request.paymentMethod,
    paymentStatus: request.paymentStatus,
    duration: request.duration
  };
}
