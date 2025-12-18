import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserStore } from '../../../application/user.store';
import { UserStats } from '../user-stats/user-stats';
import { UserSettings } from '../user-settings/user-settings';
import { UserWalletCard } from '../user-wallet-card/user-wallet-card';
import { UserHistoryCard } from '../user-history-card/user-history-card';
import { UserSecurityCard } from '../user-security-card/user-security-card';
import { UserHelpCard } from '../user-help-card/user-help-card';
import { UserSettingsCard } from '../user-settings-card/user-settings-card';
import { UserPersonalInfoCard } from '../user-personal-info-card/user-personal-info-card';
import { UserSettingsStateService, UserSettingsSection } from '../../../application/user-settings-state.service';
import { AuthRepositoryImpl } from '../../../../auth/infrastructure/auth-repository.impl';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [
    CommonModule,
    UserStats,
    UserSettings,
    UserWalletCard,
    UserHistoryCard,
    UserSecurityCard,
    UserHelpCard,
    UserSettingsCard,
    UserPersonalInfoCard
  ],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css'
})
export class UserLayout implements OnInit {
  private readonly userStore = inject(UserStore);
  private readonly route = inject(ActivatedRoute);
  private readonly stateService = inject(UserSettingsStateService);
  private readonly authRepository = inject(AuthRepositoryImpl);

  activeSection: UserSettingsSection = null;

  ngOnInit(): void {
    // Check route params first
    this.route.paramMap.subscribe(params => {
      const raw = params.get('profileId');
      const id = raw ? Number(raw) : NaN;
      if (Number.isFinite(id)) {
        this.userStore.loadUsers(id);
        return;
      }
      // No profileId in params, load current user from session
      this.loadCurrentUserFromSession();
    });

    this.stateService.activeSection$.subscribe(section => {
      this.activeSection = section;
    });
  }

  private loadCurrentUserFromSession(): void {
    this.authRepository.getCurrentUser().subscribe(sessionUser => {
      if (sessionUser) {
        // Immediate fallback from auth session
        this.userStore.setFromAuthUser(sessionUser);
        // Try to fetch from backend by email, but don't clear UI if it fails
        const email = sessionUser.email ?? '';
        if (email) {
          this.userStore.loadCurrentUserByEmail(email);
        }
      }
    });
  }
}

