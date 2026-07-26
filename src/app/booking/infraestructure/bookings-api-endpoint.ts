import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BookingResponse } from './bookings-response';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingsApiEndpoint {
  private baseUrl = `${environment.apiUrl}${environment.endpoints.bookings}`;

  constructor(private http: HttpClient) {}

  // Obtener todas las reservas
  getAll(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(this.baseUrl);
  }

  // Crear una nueva reserva
  create(booking: Omit<BookingResponse, 'id'>): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.baseUrl, booking);
  }

  // Obtener una reserva por ID
  getById(id: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.baseUrl}/${id}`);
  }

  // PENDIENTE backend: no existe PUT/PATCH /bookings/{id} en el backend
  // real — no hay ningún endpoint de edición de reservas confirmadas en
  // el backend real. Callers: booking.store.ts, booking-list.ts (cancelar),
  // booking-form.ts (editar), schedule-unlock.ts (simular desbloqueo) —
  // hoy fallarán con 404/405 contra el backend real.
  update(id: string, booking: Partial<BookingResponse>): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${this.baseUrl}/${id}`, booking);
  }

  // PENDIENTE backend: no existe DELETE /bookings/{id} en el backend real
  // (solo DELETE /bookings/draft/{draftId} para borradores). Caller:
  // booking-list.ts (eliminar reserva) — hoy fallará con 404/405 contra
  // el backend real.
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Obtener reservas por userId
  getByUserId(userId: string): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.baseUrl}/user/${userId}`);
  }

  // Obtener reservas por vehicleId
  getByVehicleId(vehicleId: string): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.baseUrl}/vehicle/${vehicleId}`);
  }
}
