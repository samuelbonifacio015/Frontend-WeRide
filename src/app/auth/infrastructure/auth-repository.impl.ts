import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, map, tap } from 'rxjs'; 
import { AuthRepository } from '../domain/auth.repository';
import { User } from '../domain/model/user.entity';
import { AuthCredentials } from '../domain/model/auth-credentials.entity';
import { PhoneCredentials } from '../domain/model/phone-credentials.entity';
import { AuthSession } from '../domain/model/auth-session.entity';
import { RegistrationData } from '../domain/model/registration-data.entity';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthRepositoryImpl extends AuthRepository {
  private http = inject(HttpClient);
  private readonly AUTH_SESSION_KEY = 'auth_session';
  private baseUrl = `${environment.apiUrl}/authentication`;
  
  // Restauramos esta propiedad que faltaba y causaba el error TS2551
  private verificationCodes: Map<string, string> = new Map();

  constructor() {
    super();
  }

  loginWithEmail(credentials: AuthCredentials): Observable<AuthSession> {
    const payload = { 
      username: credentials.email, 
      password: credentials.password 
    };

    return this.http.post<any>(`${this.baseUrl}/sign-in`, payload).pipe(
      map(response => {
        // El backend devuelve: { id: 1, username: "...", token: "..." }
        // Convertimos id a string para el frontend ("1")
        const user = new User(
          response.id.toString(), 
          response.username,
          credentials.email,
          '', // Phone no disponible en login
          'basic-plan',
          false,
          'assets/users/default.jpg',
          '', '', '', 'verified',
          new Date().toISOString(),
          { language: 'es', notifications: true, theme: 'light' },
          { totalTrips: 0, totalDistance: 0, totalSpent: 0, averageRating: 0 }
        );

        return this.createSession(user, response.token, false);
      }),
      tap(session => this.saveSession(session))
    );
  }

  // Stubs para métodos no implementados (pero con imports corregidos)
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
      { language: 'es', notifications: false, theme: 'light' },
      { totalTrips: 0, totalDistance: 0, totalSpent: 0, averageRating: 0 }
    );

    // Generar token falso para invitado
    const fakeToken = this.generateToken();
    const session = this.createSession(guestUser, fakeToken, true);
    this.saveSession(session);
    return of(session);
  }

  register(data: RegistrationData): Observable<User> {
    const payload = {
      username: data.email,
      password: data.password,
      roles: ['ROLE_USER'] // El backend espera una lista de roles
    };

    return this.http.post<any>(`${this.baseUrl}/sign-up`, payload).pipe(
      map(response => {
        // Mapeamos la respuesta del registro (AccountResource) a nuestra entidad User
        return new User(
          response.id.toString(),
          response.username,
          data.email,
          '', // Phone
          'basic-plan',
          false, // isGuest
          'assets/users/default.jpg',
          data.firstName, // Usamos los datos del formulario local ya que el backend de IAM no devuelve nombre
          data.lastName,
          '',
          'verified',
          new Date().toISOString(),
          { language: 'es', notifications: true, theme: 'light' },
          { totalTrips: 0, totalDistance: 0, totalSpent: 0, averageRating: 0 }
        );
      })
    );
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.AUTH_SESSION_KEY);
    }
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

  // --- Helpers Privados ---

  private createSession(user: User, token: string, isGuest: boolean): AuthSession {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    return new AuthSession(user, token, expiresAt, isGuest);
  }

  private generateToken(): string {
    return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  private saveSession(session: AuthSession): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.AUTH_SESSION_KEY, JSON.stringify({
        user: session.user,
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
        isGuest: session.isGuest
      }));
    }
  }

  private getStoredSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;

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