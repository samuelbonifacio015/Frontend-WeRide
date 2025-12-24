import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../application/booking.service';
import { CreateBookingRequest } from '../../domain/model/booking.model';

/**
 * EXAMPLE: Booking Form Component using Clean Architecture
 * 
 * This is a demonstration component showing how to use the new
 * refactored booking module with Angular Signals.
 * 
 * Key Points:
 * - No direct API calls
 * - No hardcoded values
 * - Clean separation of concerns
 * - Reactive UI with Signals
 */
@Component({
  selector: 'app-booking-form-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="booking-form-container">
      <h2>Create New Booking</h2>
      
      <!-- Loading State -->
      @if (bookingService.isLoading()) {
        <div class="loading">Creating booking...</div>
      }
      
      <!-- Error State -->
      @if (bookingService.error()) {
        <div class="error-message">
          {{ bookingService.error() }}
          <button (click)="bookingService.clearError()">Dismiss</button>
        </div>
      }
      
      <!-- Booking Form -->
      <form (ngSubmit)="onSubmit()" #form="ngForm">
        <div class="form-group">
          <label>User ID:</label>
          <input 
            type="text" 
            [(ngModel)]="formData.userId" 
            name="userId"
            placeholder="Get from AuthService"
            required
          />
        </div>
        
        <div class="form-group">
          <label>Vehicle ID:</label>
          <input 
            type="text" 
            [(ngModel)]="formData.vehicleId" 
            name="vehicleId"
            placeholder="Select from vehicle list"
            required
          />
        </div>
        
        <div class="form-group">
          <label>Start Location ID:</label>
          <input 
            type="text" 
            [(ngModel)]="formData.startLocationId" 
            name="startLocationId"
            placeholder="User's current location"
            required
          />
        </div>
        
        <div class="form-group">
          <label>End Location ID:</label>
          <input 
            type="text" 
            [(ngModel)]="formData.endLocationId" 
            name="endLocationId"
            placeholder="Destination"
            required
          />
        </div>
        
        <div class="form-group">
          <label>Start Date:</label>
          <input 
            type="datetime-local" 
            [(ngModel)]="formData.startDate" 
            name="startDate"
            required
          />
        </div>
        
        <div class="form-group">
          <label>End Date:</label>
          <input 
            type="datetime-local" 
            [(ngModel)]="formData.endDate" 
            name="endDate"
            required
          />
        </div>
        
        <div class="form-group">
          <label>Payment Method:</label>
          <select [(ngModel)]="formData.paymentMethod" name="paymentMethod" required>
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="cash">Cash</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          [disabled]="!form.valid || bookingService.isLoading()"
        >
          {{ bookingService.isLoading() ? 'Creating...' : 'Create Booking' }}
        </button>
      </form>
      
      <!-- Active Booking Display -->
      @if (bookingService.activeBooking()) {
        <div class="active-booking">
          <h3>Active Booking</h3>
          <p>ID: {{ bookingService.activeBooking()?.id }}</p>
          <p>Status: {{ bookingService.activeBooking()?.status }}</p>
          <p>Vehicle: {{ bookingService.activeBooking()?.vehicleId }}</p>
          <button (click)="cancelActiveBooking()">Cancel Booking</button>
        </div>
      }
      
      <!-- Booking History (using computed signal) -->
      <div class="booking-history">
        <h3>Completed Bookings: {{ bookingService.completedBookings().length }}</h3>
        <h3>Upcoming Bookings: {{ bookingService.upcomingBookings().length }}</h3>
        
        <h4>Recent History:</h4>
        @for (booking of bookingService.bookingHistory().slice(0, 5); track booking.id) {
          <div class="booking-item">
            <span>{{ booking.startDate | date:'short' }}</span>
            <span>{{ booking.status }}</span>
            <span>\${{ booking.finalCost }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .booking-form-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    
    .loading {
      padding: 10px;
      background: #f0f0f0;
      border-radius: 4px;
      text-align: center;
    }
    
    .error-message {
      padding: 10px;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      color: #c00;
      margin-bottom: 15px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-group input,
    .form-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .active-booking,
    .booking-history {
      margin-top: 30px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
    }
    
    .booking-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class BookingFormExampleComponent implements OnInit {
  // Inject service using Angular 17+ inject function
  bookingService = inject(BookingService);
  
  // Form data (in real app, use reactive forms)
  formData = {
    userId: '',
    vehicleId: '',
    startLocationId: '',
    endLocationId: '',
    startDate: '',
    endDate: '',
    paymentMethod: 'credit_card'
  };
  
  ngOnInit(): void {
    // Load booking history on component initialization
    // In real app, get userId from AuthService
    const mockUserId = '1'; // TODO: Replace with actual user ID
    this.bookingService.loadHistory(mockUserId).catch(err => {
      console.error('Failed to load booking history', err);
    });
  }
  
  async onSubmit(): Promise<void> {
    // Validate dates
    const startDate = new Date(this.formData.startDate);
    const endDate = new Date(this.formData.endDate);
    
    if (startDate >= endDate) {
      alert('End date must be after start date');
      return;
    }
    
    if (startDate < new Date()) {
      alert('Start date cannot be in the past');
      return;
    }
    
    // Create booking request
    const request: CreateBookingRequest = {
      userId: parseInt(this.formData.userId, 10),
      vehicleId: parseInt(this.formData.vehicleId, 10),
      startLocationId: parseInt(this.formData.startLocationId, 10),
      endLocationId: parseInt(this.formData.endLocationId, 10),
      reservedAt: new Date().toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalCost: 0, // Calculate based on vehicle price
      finalCost: 0, // Calculate based on vehicle price
      paymentMethod: this.formData.paymentMethod,
      paymentStatus: 'pending',
      duration: Math.floor((endDate.getTime() - startDate.getTime()) / 60000) // Duration in minutes
    };
    
    try {
      const booking = await this.bookingService.createBooking(request);
      console.log('Booking created successfully:', booking);
      
      // Reset form
      this.resetForm();
      
      // Show success message (in real app, use toast/snackbar)
      alert(`Booking created! ID: ${booking.id}`);
    } catch (error) {
      console.error('Failed to create booking:', error);
      // Error is already set in bookingService.error() signal
    }
  }
  
  async cancelActiveBooking(): Promise<void> {
    const activeBooking = this.bookingService.activeBooking();
    if (!activeBooking) return;
    
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      await this.bookingService.cancelBooking(activeBooking.id);
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  }
  
  private resetForm(): void {
    this.formData = {
      userId: '',
      vehicleId: '',
      startLocationId: '',
      endLocationId: '',
      startDate: '',
      endDate: '',
      paymentMethod: 'credit_card'
    };
  }
}
