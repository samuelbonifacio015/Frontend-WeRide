import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { LocationService } from '../../../../core/services/location.service';
import { Location } from '../../../../core/services/api.service';

@Component({
  selector: 'app-location-list',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, RouterModule],
  templateUrl: './location-list.html',
  styleUrl: './location-list.css'
})
export class LocationList implements OnInit {
  private locationService = inject(LocationService);

  locations: Location[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.locationService.loadLocations().subscribe({
      next: (locations: Location[]) => {
        this.locations = locations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.isLoading = false;
      }
    });
  }

  getCapacityPercentage(location: Location): number {
    const capacity = (location as any).capacity || 100;
    const availableSpots = (location as any).availableSpots || 0;
    return (availableSpots / capacity) * 100;
  }

  getCapacityColor(percentage: number): string {
    if (percentage > 50) return 'primary';
    if (percentage > 20) return 'accent';
    return 'warn';
  }
}
