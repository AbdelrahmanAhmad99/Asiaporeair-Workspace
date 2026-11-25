import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteSearchFormComponent } from './route-search-form.component';

describe('RouteSearchFormComponent', () => {
  let component: RouteSearchFormComponent;
  let fixture: ComponentFixture<RouteSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteSearchFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteSearchFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
