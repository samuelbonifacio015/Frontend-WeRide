import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../domain/model/user.entity';
import { ProfileResponse, UserResponse, UsersListResponse } from './user-response';
import { map, catchError } from 'rxjs/operators';
import { UserAssembler } from './user-assembler';

@Injectable({
  providedIn: 'root'
})
export class UserApiEndpoint {
  private baseUrl = `${environment.apiUrl}${environment.endpoints.users}`;

  constructor(private http: HttpClient) {}

  // METODOS PARA CONSUMIR LA API REST DE USUARIOS
  // ENDPOINT PENDIENTE A CREAR EN EL BACKEND
  //

  getCurrentUser(profileId: number): Observable<User | null> {
    return this.http.get<ProfileResponse>(`${this.baseUrl}/${profileId}`).pipe(
      map(res => UserAssembler.fromProfile(res)),
      catchError(err => { console.error('Error fetching profile:', err); return of(null); })
    );
  }

  getById(id: number): Observable<User | null> {
    return this.http.get<ProfileResponse>(`${this.baseUrl}/${id}`).pipe(
      map(response => UserAssembler.fromProfile(response)),
      catchError(error => {
        console.error('Error fetching user by ID:', error);
        return of(null);
      })
    );
  }

  getByName(name: string): Observable<User | null> {
    return this.http.get<UserResponse>(`${this.baseUrl}/name/${name}`).pipe(
      map(response => UserAssembler.toDomain(response)),
      catchError(error => {
        console.error('Error fetching user by name:', error);
        return of(null);
      })
    );
  }

  getByEmail(email: string): Observable<User | null> {
    return this.http.get<UserResponse>(`${this.baseUrl}/email/${encodeURIComponent(email)}`).pipe(
      map(response => UserAssembler.toDomain(response)),
      catchError(error => {
        console.error('Error fetching user by email:', error);
        return of(null);
      })
    );
  }

  create(user: User): Observable<User | null> {
    return this.http.post<UserResponse>(this.baseUrl, user).pipe(
      map(response => UserAssembler.toDomain(response)),
      catchError(error => {
        console.error('Error creating user:', error);
        return of(null);
      })
    );
  }

  update(id: number, user: User): Observable<User | null> {
    return this.http.put<UserResponse>(`${this.baseUrl}/${id}`, user).pipe(
      map(response => UserAssembler.toDomain(response)),
      catchError(error => {
        console.error('Error updating user:', error);
        return of(null);
      })
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error deleting user:', error);
        return of(false);
      })
    );
  }
}
