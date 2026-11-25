import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncillaryServicesListComponent } from './ancillary-services-list.component';

describe('AncillaryServicesListComponent', () => {
  let component: AncillaryServicesListComponent;
  let fixture: ComponentFixture<AncillaryServicesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncillaryServicesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncillaryServicesListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
