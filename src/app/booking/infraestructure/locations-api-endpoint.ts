import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LocationResponse, LocationsListResponse } from './locations-response';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LocationsApiEndpoint {
  private baseUrl = `${environment.apiUrl}${environment.endpoints.locations}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<LocationResponse[]> {
    return this.http.get<LocationResponse[] | LocationsListResponse>(this.baseUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'locations' in response) {
          return (response as LocationsListResponse).locations || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching locations:', error);
        return of([]);
      })
    );
  }

  create(location: Omit<LocationResponse, 'id'>): Observable<LocationResponse> {
    return this.http.post<LocationResponse>(this.baseUrl, location);
  }

  getById(id: string): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(`${this.baseUrl}/${id}`);
  }

  update(id: string, location: Partial<LocationResponse>): Observable<LocationResponse> {
    return this.http.patch<LocationResponse>(`${this.baseUrl}/${id}`, location);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
