import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthRepositoryImpl } from './auth-repository.impl';
import { AuthCredentials } from '../domain/model/auth-credentials.entity';
import { AUTH_SESSION_KEY } from './token-storage';
import { environment } from '../../../environments/environment';

describe('AuthRepositoryImpl - login real', () => {
  let repository: AuthRepositoryImpl;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    TestBed.configureTestingModule({
      providers: [
        AuthRepositoryImpl,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    repository = TestBed.inject(AuthRepositoryImpl);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(AUTH_SESSION_KEY);
  });

  it('llama a POST /authentication/sign-in con username y password', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const fakeToken = `h.${btoa(JSON.stringify({ sub: 'nico', exp }))}.s`;

    repository.loginWithEmail(new AuthCredentials('nico', 'secret123')).subscribe(session => {
      expect(session.token).toBe(fakeToken);
      expect(session.user.id).toBe('7');
      expect(session.user.name).toBe('nico');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}${environment.endpoints.authentication}/sign-in`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'nico', password: 'secret123' });
    req.flush({ id: 7, token: fakeToken });
  });

  it('guarda la sesión en localStorage tras el login', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const fakeToken = `h.${btoa(JSON.stringify({ sub: 'nico', exp }))}.s`;

    repository.loginWithEmail(new AuthCredentials('nico', 'secret123')).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}${environment.endpoints.authentication}/sign-in`);
    req.flush({ id: 7, token: fakeToken });

    const stored = JSON.parse(localStorage.getItem(AUTH_SESSION_KEY)!);
    expect(stored.token).toBe(fakeToken);
  });

  it('traduce un 401 del backend a un mensaje de credenciales inválidas', () => {
    let receivedError: Error | undefined;

    repository.loginWithEmail(new AuthCredentials('nico', 'wrong')).subscribe({
      error: (err) => (receivedError = err)
    });

    const req = httpMock.expectOne(`${environment.apiUrl}${environment.endpoints.authentication}/sign-in`);
    req.flush('credenciales inválidas', { status: 401, statusText: 'Unauthorized' });

    expect(receivedError?.message).toBe('Usuario o contraseña incorrectos');
  });
});
