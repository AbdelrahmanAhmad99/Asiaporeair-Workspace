import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteConnectionCardComponent } from './route-connection-card.component';

describe('RouteConnectionCardComponent', () => {
  let component: RouteConnectionCardComponent;
  let fixture: ComponentFixture<RouteConnectionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteConnectionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteConnectionCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
