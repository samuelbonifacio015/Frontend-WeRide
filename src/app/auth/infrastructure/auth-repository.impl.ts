import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthRepository } from '../domain/auth.repository';
import { User } from '../domain/model/user.entity';
import { AuthCredentials } from '../domain/model/auth-credentials.entity';
import { PhoneCredentials } from '../domain/model/phone-credentials.entity';
import { AuthSession } from '../domain/model/auth-session.entity';
import { RegistrationData } from '../domain/model/registration-data.entity';

@Injectable({
  providedIn: 'root'
})
export class AuthRepositoryImpl extends AuthRepository {
  private readonly AUTH_SESSION_KEY = 'auth_session';
  private verificationCodes: Map<string, string> = new Map();

  constructor() {
    super();
  }

  loginWithEmail(credentials: AuthCredentials): Observable<AuthSession> {
    return throwError(() => new Error('Email login no implementado. Use backend API.'));
  }

  loginWithPhone(credentials: PhoneCredentials): Observable<AuthSession> {
    return throwError(() => new Error('Phone login no implementado. Use backend API.'));
  }

  loginWithGoogle(): Observable<AuthSession> {
    return throwError(() => new Error('Google login no implementado'));
  }

  loginAsGuest(): Observable<AuthSession> {
    const guestUser = new User(
      'guest',
      'Invitado',
      'guest@weride.com',
      '',
      'free-plan',
      true,
      'assets/users/guest.jpg',
      '',
      '',
      '',
      'guest',
      new Date().toISOString(),
      {
        language: 'es',
        notifications: false,
        theme: 'light'
      },
      {
        totalTrips: 0,
        totalDistance: 0,
        totalSpent: 0,
        averageRating: 0
      }
    );

    const session = this.createSession(guestUser, true);
    this.saveSession(session);
    return of(session);
  }

  register(data: RegistrationData): Observable<User> {
    return throwError(() => new Error('Registration no implementado. Use backend API.'));
  }

  sendVerificationCode(phone: string): Observable<boolean> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    this.verificationCodes.set(phone, code);
    return of(true);
  }

  verifyCode(phone: string, code: string): Observable<boolean> {
    const storedCode = this.verificationCodes.get(phone);
    return of(storedCode === code);
  }

  logout(): Observable<void> {
    localStorage.removeItem(this.AUTH_SESSION_KEY);
    return of(void 0);
  }

  getCurrentUser(): Observable<User | null> {
    const session = this.getStoredSession();
    return of(session?.user || null);
  }

  refreshSession(): Observable<AuthSession> {
    const session = this.getStoredSession();
    if (!session) {
      return throwError(() => new Error('No hay sesión activa'));
    }
    return of(session);
  }

  private createSession(user: User, isGuest: boolean): AuthSession {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const token = this.generateToken();
    return new AuthSession(user, token, expiresAt, isGuest);
  }

  private generateToken(): string {
    return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  private saveSession(session: AuthSession): void {
    localStorage.setItem(this.AUTH_SESSION_KEY, JSON.stringify({
      user: session.user,
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      isGuest: session.isGuest
    }));
  }

  private getStoredSession(): AuthSession | null {
    const stored = localStorage.getItem(this.AUTH_SESSION_KEY);
    if (!stored) return null;

    try {
      const data = JSON.parse(stored);
      return new AuthSession(
        data.user,
        data.token,
        new Date(data.expiresAt),
        data.isGuest
      );
    } catch {
      return null;
    }
  }
}
