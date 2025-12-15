import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BookingResponse, BookingsListResponse } from './bookings-response';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingsApiEndpoint {
  private baseUrl = `${environment.apiUrl}${environment.endpoints.bookings}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[] | BookingsListResponse>(this.baseUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'bookings' in response) {
          return (response as BookingsListResponse).bookings || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching bookings:', error);
        return of([]);
      })
    );
  }

  // Crear una nueva reserva
  create(booking: Omit<BookingResponse, 'id'>): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.baseUrl, booking);
  }

  // Obtener una reserva por ID
  getById(id: string): Observable<BookingResponse> {
    return this.http.get<BookingResponse>(`${this.baseUrl}/${id}`);
  }

  // Actualizar una reserva
  update(id: string, booking: Partial<BookingResponse>): Observable<BookingResponse> {
    return this.http.patch<BookingResponse>(`${this.baseUrl}/${id}`, booking);
  }

  // Eliminar una reserva
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Obtener reservas por userId
  getByUserId(userId: string): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.baseUrl}?userId=${userId}`);
  }

  // Obtener reservas por vehicleId
  getByVehicleId(vehicleId: string): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.baseUrl}?vehicleId=${vehicleId}`);
  }
}
