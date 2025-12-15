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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cc9e027b-0e24-4d5d-bafb-2fcebd8f5e3f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings-api-endpoint.ts:33',message:'POST request sent',data:{payload:booking,baseUrl:this.baseUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    return this.http.post<BookingResponse>(this.baseUrl, booking).pipe(
      map(response => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cc9e027b-0e24-4d5d-bafb-2fcebd8f5e3f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings-api-endpoint.ts:36',message:'POST response received in endpoint',data:{response,responseType:typeof response,hasId:'id' in response,hasBookingId:'bookingId' in response,keys:Object.keys(response || {})},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (response && 'bookingId' in response && !('id' in response)) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/cc9e027b-0e24-4d5d-bafb-2fcebd8f5e3f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings-api-endpoint.ts:39',message:'Normalizing bookingId to id',data:{bookingId:(response as any).bookingId},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        }
        return response;
      }),
      catchError(error => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/cc9e027b-0e24-4d5d-bafb-2fcebd8f5e3f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'bookings-api-endpoint.ts:45',message:'POST error in endpoint',data:{error:error?.error,status:error?.status,message:error?.message,fullError:JSON.stringify(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        throw error;
      })
    );
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
