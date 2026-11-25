import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveRevenueDashboardComponent } from './executive-revenue-dashboard.component';

describe('ExecutiveRevenueDashboardComponent', () => {
  let component: ExecutiveRevenueDashboardComponent;
  let fixture: ComponentFixture<ExecutiveRevenueDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveRevenueDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExecutiveRevenueDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
