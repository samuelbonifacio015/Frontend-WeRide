import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-guest-block-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './guest-block-modal.html',
  styleUrl: './guest-block-modal.css'
})
export class GuestBlockModal {
  constructor(
    private dialogRef: MatDialogRef<GuestBlockModal>,
    private router: Router
  ) {}

  goToLogin(): void {
    this.dialogRef.close();
    this.router.navigate(['/auth/login']);
  }

  close(): void {
    this.dialogRef.close();
  }
}
