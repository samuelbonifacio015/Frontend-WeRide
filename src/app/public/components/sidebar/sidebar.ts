import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs';
import { UserStore } from '../../../user/application/user.store';
import { AuthStore } from '../../../auth/application/auth.store';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, MatIconModule, RouterModule, MatIconButton, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() collapsed = false;

  private userStore = inject(UserStore);
  private authStore = inject(AuthStore);

  userName$ = this.userStore.selectedUser$.pipe(
    map(user => user?.name?.trim() || this.authStore.session()?.user?.name?.trim() || '')
  );
}