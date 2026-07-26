import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trip } from '../domain/model/trip.entity';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripsApiEndpoint {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${environment.endpoints.trips}`;

  // PENDIENTE backend: no existe GET /trips/{id} en el backend real. Sin
  // callers hoy — se deja documentado en vez de eliminarlo.
  getById(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.baseUrl}/${id}`);
  }

  // El backend real ya devuelve solo los trips del usuario autenticado
  // (scoping vía JWT) — no acepta filtro por userId en la URL.
  getMine(): Observable<Trip[]> {
    return this.http.get<Trip[]>(this.baseUrl);
  }

  create(trip: Partial<Trip>): Observable<Trip> {
    return this.http.post<Trip>(this.baseUrl, trip);
  }

  // PENDIENTE backend: no existe PATCH/PUT /trips/{id} en el backend real.
  // Sin callers hoy — se deja documentado en vez de eliminarlo.
  update(id: string, trip: Partial<Trip>): Observable<Trip> {
    return this.http.patch<Trip>(`${this.baseUrl}/${id}`, trip);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

