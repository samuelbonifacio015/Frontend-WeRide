import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingResponse, CreateBookingDTO } from './bookings-response';
import { environment } from '../../../environments/environment';

/**
 * BookingsApiEndpoint - HTTP client for booking API operations
 * 
 * Simplified version without complex normalization logic.
 * Assumes backend returns consistent response format.
 */
@Injectable({ providedIn: 'root' })
export class BookingsApiEndpoint {
  private baseUrl = `${environment.apiUrl}${environment.endpoints.bookings}`;

  constructor(private http: HttpClient) {}

  /**
   * Get all bookings
   */
  getAll(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(this.baseUrl);
  }

  /**
   * Create a new booking
   */
  create(booking: CreateBookingDTO): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.baseUrl, booking);
  }

  /**
   * Get booking by ID
   */
  getById(id: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Update booking (partial update)
   */
  update(id: string, booking: Partial<BookingResponse>): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${this.baseUrl}/${id}`, booking);
  }

  /**
   * Delete booking
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get bookings by user ID
   */
  getByUserId(userId: string): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.baseUrl}?userId=${userId}`);
  }

  /**
   * Get bookings by vehicle ID
   */
  getByVehicleId(vehicleId: string): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.baseUrl}?vehicleId=${vehicleId}`);
  }
}
