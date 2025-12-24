import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, catchError, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BookingDraft } from '../domain/model/booking-draft.entity';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../../auth/application/auth.store';

@Injectable({ providedIn: 'root' })
export class DraftBookingService {
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);
  private draftsListUrl = `${environment.apiUrl}/bookings/drafts`;
  private draftUrl = `${environment.apiUrl}/bookings/draft`;
  
  private draftsSubject = new BehaviorSubject<BookingDraft[]>([]);
  drafts$ = this.draftsSubject.asObservable();

  constructor() {
    this.loadDrafts();
  }

  private loadDrafts() {
    const currentUser = this.authStore.currentUser();
    const sessionUser = this.authStore.session()?.user;
    const rawUserId = currentUser?.id || sessionUser?.id;
    const userId = rawUserId && !String(rawUserId).startsWith('temp-') ? rawUserId : '1';

    const url = `${this.draftsListUrl}?userId=${encodeURIComponent(userId)}`;
    this.http.get<any[]>(url).pipe(
      map(drafts => drafts
        .map(d => new BookingDraft(
          d.id,
          d.userId,
          d.vehicleId,
          d.selectedDate,
          d.unlockTime,
          d.duration,
          d.smsReminder,
          d.emailConfirmation,
          d.pushNotification,
          new Date(d.savedAt),
          new Date(d.expiresAt)
        ))
        .filter(d => d.expiresAt > new Date())
      ),
      catchError((error) => {
        if (error?.status === 400 || error?.status === 404) {
          console.warn('Borradores no disponibles en el backend actual. Se continúa sin borradores.');
          return of([]);
        }
        console.error('Error cargando borradores:', error);
        return of([]);
      })
    ).subscribe(drafts => this.draftsSubject.next(drafts));
  }

  saveDraft(draft: Partial<BookingDraft>): Observable<BookingDraft> {
    const currentUser = this.authStore.currentUser();
    const sessionUser = this.authStore.session()?.user;
    const rawUserId = currentUser?.id || sessionUser?.id;
    const userId = rawUserId && !String(rawUserId).startsWith('temp-') ? rawUserId : '1';

    const draftData: any = {
      ...draft,
      userId,
      savedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    return this.http.post<any>(this.draftUrl, draftData).pipe(
      map(d => new BookingDraft(
        d.id,
        d.userId,
        d.vehicleId,
        d.selectedDate,
        d.unlockTime,
        d.duration,
        d.smsReminder,
        d.emailConfirmation,
        d.pushNotification,
        new Date(d.savedAt),
        new Date(d.expiresAt)
      )),
      tap(draft => {
        const currentDrafts = this.draftsSubject.value;
        this.draftsSubject.next([...currentDrafts, draft]);
      })
    );
  }

  deleteDraft(draftId: string): Observable<void> {
    return this.http.delete<void>(`${this.draftUrl}/${draftId}`).pipe(
      tap(() => {
        const currentDrafts = this.draftsSubject.value;
        this.draftsSubject.next(currentDrafts.filter(d => d.id !== draftId));
      })
    );
  }

  getDrafts(): BookingDraft[] {
    return this.draftsSubject.value;
  }
}
