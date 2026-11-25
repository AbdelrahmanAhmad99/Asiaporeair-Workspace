import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerManifestComponent } from './passenger-manifest.component';

describe('PassengerManifestComponent', () => {
  let component: PassengerManifestComponent;
  let fixture: ComponentFixture<PassengerManifestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerManifestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerManifestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
