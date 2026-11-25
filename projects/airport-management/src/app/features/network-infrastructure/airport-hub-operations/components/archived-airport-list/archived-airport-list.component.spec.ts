import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedAirportListComponent } from './archived-airport-list.component';

describe('ArchivedAirportListComponent', () => {
  let component: ArchivedAirportListComponent;
  let fixture: ComponentFixture<ArchivedAirportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivedAirportListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchivedAirportListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
