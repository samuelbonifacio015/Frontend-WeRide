import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationResponse } from './notifications-response';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationsApiEndpoint {
  private baseUrl = `${environment.apiUrl}${environment.endpoints.notifications}`;

  constructor(private http: HttpClient) {}

  // Obtener todas las notificaciones del usuario autenticado.
  // El backend real exige el query param (400 si falta) aunque ignora su
  // valor — el filtrado real sale del JWT.
  getAll(userId: string): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.baseUrl}?userId=${userId}`);
  }

  // Crear una nueva notificación
  create(notification: Omit<NotificationResponse, 'id'>): Observable<NotificationResponse> {
    return this.http.post<NotificationResponse>(this.baseUrl, notification);
  }

  // GET /notifications/{id} sí existe en el backend real (devuelve 404 si
  // no pertenece al usuario autenticado) — sin callers hoy, pero no hay
  // gap que documentar.
  getById(id: string): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.baseUrl}/${id}`);
  }

  // PENDIENTE backend: no existe PUT/PATCH /notifications/{id} genérico
  // en el backend real (fuera de /read, ver markAsRead). Sin callers hoy.
  update(id: string, notification: Partial<NotificationResponse>): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.baseUrl}/${id}`, notification);
  }

  // PENDIENTE backend: no existe DELETE /notifications/{id} en el
  // backend real. Caller: notification-list.ts (eliminar notificación) —
  // hoy fallará con 404/405 contra el backend real.
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Marcar una notificación como leída.
  // El backend real es PATCH /notifications/{id}/read, sin body, y
  // devuelve un string plano (no un NotificationResource).
  markAsRead(id: string): Observable<string> {
    return this.http.patch(`${this.baseUrl}/${id}/read`, null, { responseType: 'text' });
  }
}
