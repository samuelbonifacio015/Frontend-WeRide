import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestBanner } from './guest-banner';

describe('GuestBanner', () => {
  let component: GuestBanner;
  let fixture: ComponentFixture<GuestBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestBanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestBanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
