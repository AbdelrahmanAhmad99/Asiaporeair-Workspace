import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiringCertsListComponent } from './expiring-certs-list.component';

describe('ExpiringCertsListComponent', () => {
  let component: ExpiringCertsListComponent;
  let fixture: ComponentFixture<ExpiringCertsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiringCertsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiringCertsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
