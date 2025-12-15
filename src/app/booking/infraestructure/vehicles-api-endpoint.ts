import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { VehicleResponse, VehiclesListResponse } from './vehicle-response';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VehiclesApiEndpoint {
  private baseUrl = `${environment.apiUrl}${environment.endpoints.vehicles}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[] | VehiclesListResponse>(this.baseUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'vehicles' in response) {
          return (response as VehiclesListResponse).vehicles || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching vehicles:', error);
        return of([]);
      })
    );
  }

  create(vehicle: Omit<VehicleResponse, 'id'>): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.baseUrl, vehicle);
  }

  getById(id: string): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.baseUrl}/${id}`);
  }

  update(id: string, vehicle: Partial<VehicleResponse>): Observable<VehicleResponse> {
    return this.http.patch<VehicleResponse>(`${this.baseUrl}/${id}`, vehicle);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
