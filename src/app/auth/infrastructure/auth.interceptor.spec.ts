import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AUTH_SESSION_KEY } from './token-storage';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem(AUTH_SESSION_KEY);
  });

  it('adjunta el header Authorization cuando hay un token guardado', () => {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ token: 'my-jwt' }));

    httpClient.get('/api/v1/vehicles').subscribe();

    const req = httpMock.expectOne('/api/v1/vehicles');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt');
    req.flush({});
  });

  it('no adjunta el header cuando no hay sesión guardada', () => {
    httpClient.get('/api/v1/authentication/sign-in').subscribe();

    const req = httpMock.expectOne('/api/v1/authentication/sign-in');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
