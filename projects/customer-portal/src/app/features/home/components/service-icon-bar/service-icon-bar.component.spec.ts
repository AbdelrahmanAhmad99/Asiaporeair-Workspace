import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceIconBarComponent } from './service-icon-bar.component';

describe('ServiceIconBarComponent', () => {
  let component: ServiceIconBarComponent;
  let fixture: ComponentFixture<ServiceIconBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceIconBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceIconBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
