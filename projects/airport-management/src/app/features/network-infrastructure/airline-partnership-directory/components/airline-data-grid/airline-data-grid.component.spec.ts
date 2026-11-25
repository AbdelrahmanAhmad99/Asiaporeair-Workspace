import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineDataGridComponent } from './airline-data-grid.component';

describe('AirlineDataGridComponent', () => {
  let component: AirlineDataGridComponent;
  let fixture: ComponentFixture<AirlineDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineDataGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineDataGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
