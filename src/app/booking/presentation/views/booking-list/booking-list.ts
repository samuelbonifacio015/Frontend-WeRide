import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BookingsApiEndpoint } from '../../../infraestructure/bookings-api-endpoint';
import { VehiclesApiEndpoint } from '../../../infraestructure/vehicles-api-endpoint';
import { LocationsApiEndpoint } from '../../../infraestructure/locations-api-endpoint';
import { BookingStorageService } from '../../../application/booking-storage.service';
import { BookingStore } from '../../../application/booking.store';
import { ActiveBookingService } from '../../../application/active-booking.service';
import { BookingConfirmationModal } from '../booking-confirmation-modal/booking-confirmation-modal';
import { UnlockMethodSelectionModal } from '../unlock-method-selection-modal/unlock-method-selection-modal';
import { BookingFilterService } from '../../../application/booking-filter.service';
import { BookingFilter } from '../../../domain/model/booking-filter.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface BookingView {
  id: string;
  vehicleId: string;
  vehicleName: string;
  startLocationName: string;
  endLocationName: string;
  startDate: Date;
  duration: number | null;
  finalCost: number | null;
  status: 'draft' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
}

@Component({
  selector: 'app-booking-list',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.css'
})
export class BookingListComponent implements OnInit {
  private bookingsApi = inject(BookingsApiEndpoint);
  private vehiclesApi = inject(VehiclesApiEndpoint);
  private locationsApi = inject(LocationsApiEndpoint);
  private bookingStorage = inject(BookingStorageService);
  private bookingStore = inject(BookingStore);
  private activeBookingService = inject(ActiveBookingService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  private filterService = inject(BookingFilterService);

  bookings: BookingView[] = [];
  filteredBookings: BookingView[] = [];
  isLoading = true;
  isActivating = false;

  searchTerm = '';
  sortBy: 'date' | 'vehicle' | 'status' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';

  currentFilter: BookingFilter = this.filterService.getDefaultFilter();

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;

    const localBookings = Array.isArray(this.bookingStorage.getBookings())
      ? this.bookingStorage.getBookings()
      : [];

    forkJoin({
      bookings: this.bookingsApi.getAll().pipe(catchError(() => of([]))),
      vehicles: this.vehiclesApi.getAll().pipe(catchError(() => of([]))),
      locations: this.locationsApi.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ bookings, vehicles, locations }) => {
        try {
          const bookingsArray = Array.isArray(bookings) ? bookings : [];
          const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];
          const locationsArray = Array.isArray(locations) ? locations : [];
          const allBookings = [...localBookings, ...bookingsArray];
          const uniqueBookings = Array.from(new Map(allBookings.map(b => [b.id, b])).values());

          const normalizeId = (value: any) => `${value ?? ''}`;

          this.bookings = uniqueBookings.map(booking => {
            const vehicle = vehiclesArray.find(
              v => normalizeId(v.id ?? (v as any)._id) === normalizeId(booking.vehicleId)
            );
            const startLocation = locationsArray.find(
              l => normalizeId(l.id ?? (l as any)._id) === normalizeId(booking.startLocationId)
            );
            const endLocation = locationsArray.find(
              l => normalizeId(l.id ?? (l as any)._id) === normalizeId(booking.endLocationId)
            );

            return {
              id: booking.id,
              vehicleId: booking.vehicleId,
              vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle',
              startLocationName: startLocation?.address || startLocation?.name || 'Unknown Location',
              endLocationName: endLocation?.address || endLocation?.name || 'Unknown Location',
              startDate: new Date(booking.startDate),
              duration: booking.duration,
              finalCost: booking.finalCost,
              status: booking.status
            };
          });

          this.applyFilters();
        } catch {
          this.loadFromLocalStorageOnly();
        } finally {
          this.isLoading = false;
        }
      },
      error: () => {
        this.loadFromLocalStorageOnly();
      }
    });
  }

  private loadFromLocalStorageOnly(): void {
    try {
      const localBookings = this.bookingStorage.getBookings();
      this.bookings = Array.isArray(localBookings)
        ? localBookings.map(booking => ({
            id: booking.id,
            vehicleId: booking.vehicleId,
            vehicleName: 'Vehicle',
            startLocationName: 'Start Location',
            endLocationName: 'End Location',
            startDate: new Date(booking.startDate),
            duration: booking.duration,
            finalCost: booking.finalCost,
            status: booking.status
          }))
        : [];
      this.applyFilters();
    } catch {
      this.bookings = [];
      this.filteredBookings = [];
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    this.currentFilter = {
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      vehicleName: this.searchTerm,
      status: ''
    };

    this.filteredBookings = this.filterService.filterAndSortBookings(
      this.bookings,
      this.currentFilter
    );
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.applyFilters();
  }

  editBooking(id: string): void {
    this.router.navigate(['/booking/form', id]);
  }

  cancelBooking(id: string): void {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking || booking.status !== 'pending') return;

    const message = this.translate.instant('booking.confirmCancelMessage');

    if (confirm(message)) {
      const success = this.bookingStorage.cancelBooking(id);

      if (success) {
        booking.status = 'cancelled';
        this.bookingStore.loadFromLocalStorage();

        this.bookingsApi.update(id, { status: 'cancelled' }).subscribe({
          next: () => this.showSuccessMessage('booking.cancelSuccess'),
          error: () => this.showSuccessMessage('booking.cancelSuccess') // mantenemos feedback aunque falle API
        });
      } else {
        this.showErrorMessage('booking.cancelError');
      }
    }
  }

  deleteBooking(id: string): void {
    const message = this.translate.instant('booking.confirmDeleteMessage');

    if (confirm(message)) {
      this.bookingStorage.deleteBooking(id);

      this.bookingsApi.delete(id).subscribe({
        next: () => {
          this.bookings = this.bookings.filter(b => b.id !== id);
          this.applyFilters();
          this.showSuccessMessage('booking.deleteSuccess');
        },
        error: () => this.showErrorMessage('booking.deleteError')
      });
    }
  }

  async activateBooking(bookingView: BookingView): Promise<void> {
    try {
      this.isActivating = true;

      if (bookingView.status !== 'pending' && bookingView.status !== 'confirmed') {
        this.showErrorMessage('booking.cannotActivate');
        return;
      }

      const activeBooking = this.activeBookingService.getActiveBooking();
      if (activeBooking) {
        this.showErrorMessage('booking.alreadyHasActive');
        return;
      }

      const booking = this.bookingStorage.getBookingById(bookingView.id);
      if (!booking) {
        this.showErrorMessage('booking.notFound');
        return;
      }

      this.vehiclesApi.getAll().subscribe({
        next: (vehicles) => {
          const vehicle = vehicles.find(v => v.id === bookingView.vehicleId);

          if (!vehicle) {
            this.showErrorMessage('booking.vehicleNotAvailable');
            this.isActivating = false;
            return;
          }

          const dialogRef = this.dialog.open(BookingConfirmationModal, {
            width: '500px',
            data: { vehicle },
            disableClose: true
          });

          dialogRef.afterClosed().subscribe(result => {
            this.isActivating = false;

            if (result === 'now') {
              this.activateBookingNow(booking, vehicle);
            } else if (result === 'schedule') {
              this.router.navigate(['/booking/schedule-unlock'], {
                queryParams: { bookingId: booking.id }
              });
            }
          });
        },
        error: () => {
          this.showErrorMessage('booking.vehicleNotAvailable');
          this.isActivating = false;
        }
      });

    } catch {
      this.showErrorMessage('booking.activateError');
      this.isActivating = false;
    }
  }

  private activateBookingNow(booking: any, vehicle: any): void {
    booking.status = 'active';
    booking.actualStartDate = new Date();

    this.bookingStorage.updateBooking(booking.id, booking);
    this.bookingStore.loadFromLocalStorage();
    this.activeBookingService.setActiveBooking(booking);

    const bookingView = this.bookings.find(b => b.id === booking.id);
    if (bookingView) {
      bookingView.status = 'active';
    }

    const dialogRef = this.dialog.open(UnlockMethodSelectionModal, {
      width: '500px',
      data: { booking, vehicle },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'manual') {
        this.router.navigate(['/garage'], {
          queryParams: {
            action: 'unlock-manual',
            vehicleId: vehicle.id,
            bookingId: booking.id
          }
        });
      } else if (result === 'qr_code') {
        this.router.navigate(['/garage'], {
          queryParams: {
            action: 'unlock-qr',
            vehicleId: vehicle.id,
            bookingId: booking.id
          }
        });
      }
    });

    this.showSuccessMessage('booking.activatedSuccessfully');
  }

  private showSuccessMessage(key: string): void {
    const message = this.translate.instant(key);
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(key: string): void {
    const message = this.translate.instant(key);
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}