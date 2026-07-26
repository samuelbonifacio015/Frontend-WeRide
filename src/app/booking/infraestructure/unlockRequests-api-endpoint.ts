import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnlockRequestResponse } from './unlockRequests-response';
import { environment } from '../../../environments/environment';

// PENDIENTE backend: no existe ningún concepto de "unlock request" en el
// backend real — el desbloqueo de un vehículo no tiene un endpoint
// dedicado, es (aparentemente) solo un cambio de estado del booking. Este
// endpoint apunta a una colección inventada (/unlockRequests) que no
// existe en el backend real. Se deja documentado en modo mock; migrar
// requiere definir primero cómo modela el backend real el desbloqueo.
@Injectable({ providedIn: 'root' })
export class UnlockRequestsApiEndpoint {
  private baseUrl = `${environment.apiUrl}${environment.endpoints.unlockRequests}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<UnlockRequestResponse[]> {
    return this.http.get<UnlockRequestResponse[]>(this.baseUrl);
  }

  getByUserId(userId: string): Observable<UnlockRequestResponse[]> {
    return this.http.get<UnlockRequestResponse[]>(`${this.baseUrl}?userId=${userId}`);
  }

  getByBookingId(bookingId: string): Observable<UnlockRequestResponse[]> {
    return this.http.get<UnlockRequestResponse[]>(`${this.baseUrl}?bookingId=${bookingId}`);
  }

  create(unlockRequest: Omit<UnlockRequestResponse, 'id'>): Observable<UnlockRequestResponse> {
    return this.http.post<UnlockRequestResponse>(this.baseUrl, unlockRequest);
  }

  getById(id: string): Observable<UnlockRequestResponse> {
    return this.http.get<UnlockRequestResponse>(`${this.baseUrl}/${id}`);
  }

  update(id: string, unlockRequest: Partial<UnlockRequestResponse>): Observable<UnlockRequestResponse> {
    return this.http.patch<UnlockRequestResponse>(`${this.baseUrl}/${id}`, unlockRequest);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
