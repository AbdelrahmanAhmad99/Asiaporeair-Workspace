import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteDataGridComponent } from './route-data-grid.component';

describe('RouteDataGridComponent', () => {
  let component: RouteDataGridComponent;
  let fixture: ComponentFixture<RouteDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteDataGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteDataGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
