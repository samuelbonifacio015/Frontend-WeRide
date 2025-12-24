import { Component, inject, signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '../../../application/auth.store';
import { AuthCredentials } from '../../../domain/model/auth-credentials.entity';
import { RegistrationData } from '../../../domain/model/registration-data.entity';
import { User } from '../../../domain/model/user.entity';
import { AuthSession } from '../../../domain/model/auth-session.entity';

@Component({
  selector: 'app-email-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './email-login.component.html',
  styleUrl: './email-login.component.css'
})
export class EmailLoginComponent {
  private router = inject(Router);
  protected authStore = inject(AuthStore);

  email = signal('');
  password = signal('');
  firstName = signal('');
  lastName = signal('');
  showPassword = signal(false);
  isRegisterMode = signal(false);
  private actionAttempted = signal(false);

  constructor() {
    effect(() => {
      const session = this.authStore.session();
      const currentUser = this.authStore.currentUser();
      const error = this.authStore.error();
      const isLoading = this.authStore.isLoading();

      if (this.actionAttempted() && !isLoading) {
        if (session && session.isValid && !error) {
          this.router.navigate(['/home']);
          this.actionAttempted.set(false);
        }
        // Si se registró un usuario pero no hay sesión, crear sesión automáticamente
        // (Nota: Esto requerirá que el endpoint de registro devuelva token en el futuro)
        else if (this.isRegisterMode() && currentUser && !error && !session) {
          this.createSessionForRegisteredUser(currentUser);
        }
      }
    });
  }

  private createSessionForRegisteredUser(user: User) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const token = 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    const session = new AuthSession(user, token, expiresAt, false);

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify({
        user: user,
        token: session.token,
        expiresAt: session.expiresAt.toISOString(),
        isGuest: false
      }));
    }

    this.authStore.setSession(session);
  }

  goBack() {
    this.router.navigate(['/auth/login']);
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  toggleMode() {
    this.isRegisterMode.set(!this.isRegisterMode());
    this.email.set('');
    this.password.set('');
    this.firstName.set('');
    this.lastName.set('');
    this.authStore.clearError();
  }

  continue() {
    if (this.isRegisterMode()) {
      if (this.email() && this.password() && this.firstName() && this.lastName()) {
        const registrationData = new RegistrationData(
          this.firstName(),
          this.lastName(),
          '',             
          this.email(),   
          this.password() 
        );
        
        this.actionAttempted.set(true);
        this.authStore.registerUser(registrationData);
      }
    } else {
      if (this.email() && this.password()) {
        this.login();
      }
    }
  }

  // Metodo de login separado para claridad
  private login() {
    const credentials = new AuthCredentials(
      this.email(),
      this.password()
    );

    this.actionAttempted.set(true);

    this.authStore.loginWithEmail(credentials); 
  }
}