import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerManifestListComponent } from './passenger-manifest-list.component';

describe('PassengerManifestListComponent', () => {
  let component: PassengerManifestListComponent;
  let fixture: ComponentFixture<PassengerManifestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PassengerManifestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerManifestListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
