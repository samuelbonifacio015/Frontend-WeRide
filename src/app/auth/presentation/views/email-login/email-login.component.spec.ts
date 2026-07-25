import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { EmailLoginComponent } from './email-login.component';
import { AuthStore } from '../../../application/auth.store';
import { AuthCredentials } from '../../../domain/model/auth-credentials.entity';
import { RegistrationData } from '../../../domain/model/registration-data.entity';

describe('EmailLoginComponent', () => {
  let component: EmailLoginComponent;
  let authStoreSpy: jasmine.SpyObj<Pick<InstanceType<typeof AuthStore>, 'loginWithEmail' | 'registerUser'>>;

  beforeEach(async () => {
    authStoreSpy = jasmine.createSpyObj('AuthStore', ['loginWithEmail', 'registerUser']);

    await TestBed.configureTestingModule({
      imports: [EmailLoginComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthStore, useValue: authStoreSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(EmailLoginComponent);
    component = fixture.componentInstance;
  });

  it('en modo login, llama a authStore.loginWithEmail con las credenciales del formulario', () => {
    component.email.set('nico@weride.com');
    component.password.set('secret123');

    component.continue();

    expect(authStoreSpy.loginWithEmail).toHaveBeenCalledWith(
      new AuthCredentials('nico@weride.com', 'secret123')
    );
  });

  it('en modo registro, llama a authStore.registerUser con el password del formulario', () => {
    component.isRegisterMode.set(true);
    component.email.set('nico@weride.com');
    component.password.set('secret123');
    component.firstName.set('Nico');
    component.lastName.set('Ramos');

    component.continue();

    expect(authStoreSpy.registerUser).toHaveBeenCalledWith(
      new RegistrationData('Nico', 'Ramos', '', 'nico@weride.com', 'secret123')
    );
  });
});
