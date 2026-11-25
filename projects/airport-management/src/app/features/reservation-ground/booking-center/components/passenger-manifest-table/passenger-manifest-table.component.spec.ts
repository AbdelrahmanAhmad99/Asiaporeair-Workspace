import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerManifestTableComponent } from './passenger-manifest-table.component';

describe('PassengerManifestTableComponent', () => {
  let component: PassengerManifestTableComponent;
  let fixture: ComponentFixture<PassengerManifestTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerManifestTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerManifestTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
