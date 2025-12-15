import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Payment {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: string;
  cardLast4?: string;
  status: string;
  transactionId: string;
  processedAt: string;
  description: string;
  invoice?: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
}

export interface PaymentsListResponse {
  payments: Payment[];
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsApiEndpoint {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${environment.endpoints.payments}`;

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[] | PaymentsListResponse>(this.baseUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'payments' in response) {
          return (response as PaymentsListResponse).payments || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching payments:', error);
        return of([]);
      })
    );
  }

  getByUserId(userId: string): Observable<Payment[]> {
    return this.http.get<Payment[] | PaymentsListResponse>(`${this.baseUrl}?userId=${userId}`).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'payments' in response) {
          return (response as PaymentsListResponse).payments || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching payments by userId:', error);
        return of([]);
      })
    );
  }

  getById(id: string): Observable<Payment | null> {
    return this.http.get<Payment>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching payment by ID:', error);
        return of(null);
      })
    );
  }
}

