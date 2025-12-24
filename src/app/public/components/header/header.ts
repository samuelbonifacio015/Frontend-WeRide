import { Component, Output, EventEmitter, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { NotificationsApiEndpoint } from '../../../booking/infrastructure/notifications-api-endpoint';
import { Notification } from '../../../booking/domain/model/notification';
import { toDomainNotification } from '../../../booking/infrastructure/notification-assembler';
import { NotificationResponse } from '../../../booking/infrastructure/notifications-response';
import { UserStore } from '../../../user/application/user.store';
import { AuthStore } from '../../../auth/application/auth.store';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    TranslateModule,
    LanguageSwitcher
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();

  private notificationsApi = inject(NotificationsApiEndpoint);
  private router = inject(Router);
  private userStore = inject(UserStore);
  private authStore = inject(AuthStore);

  userName$ = this.userStore.selectedUser$.pipe(
    map(user => user?.name?.trim() || this.authStore.session()?.user?.name?.trim() || '')
  );

  notifications = signal<Notification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  ngOnInit() {
    this.loadNotifications();
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  loadNotifications() {
    const currentUser = this.authStore.currentUser();
    const sessionUser = this.authStore.session()?.user;
    const userId = currentUser?.id || sessionUser?.id || '1';

    this.notificationsApi.getByUserId(userId).subscribe({
      next: (responses: NotificationResponse[]) => {
        const notificationList = responses.map(r => toDomainNotification(r));
        const sortedNotifications = notificationList
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 10);
        this.notifications.set(sortedNotifications);
      },
      error: (error) => {
        // Fallback silencioso si el backend exige userId
        console.error('Error cargando notificaciones:', error);
        this.notifications.set([]);
      }
    });
  }

  onNotificationMenuOpened() {
    this.loadNotifications();
  }

  markAsRead(notification: Notification, event: Event) {
    event.stopPropagation();
    if (!notification.isRead) {
      this.notificationsApi.markAsRead(notification.id).subscribe({
        next: () => {
          this.loadNotifications();
        },
        error: (error) => console.error('Error marking notification as read:', error)
      });
    }
  }

  getNotificationTime(notification: Notification): string {
    const now = new Date();
    const diff = now.getTime() - notification.createdAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  }

  navigateToProfile() {
    this.router.navigate(['/user']);
  }

  logout() {
    this.router.navigate(['/auth/login']);
  }

  getUserInitials(): string {
    const user = this.userStore.selectedUserSubject?.value;
    const authUser = this.authStore.session()?.user;
    const name = user?.name || authUser?.name || 'U';
    
    return name.split(' ')
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() || '')
      .join('') || 'U';
  }
}