import { CommonModule } from '@angular/common';
import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../auth/application/auth.store';

@Component({
  selector: 'app-guest-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest-banner.html',
  styleUrl: './guest-banner.css'
})
export class GuestBannerComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  //IsGuestBanner only shows if the user is authenticated as guest
  isGuest = computed(() => !!this.authStore.session()?.isGuest);

  goToLogin(): void {
    this.router.navigate(['/auth']);
  }
}