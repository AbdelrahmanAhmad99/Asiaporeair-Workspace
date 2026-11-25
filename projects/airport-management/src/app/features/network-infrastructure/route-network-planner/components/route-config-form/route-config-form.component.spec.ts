import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteConfigFormComponent } from './route-config-form.component';

describe('RouteConfigFormComponent', () => {
  let component: RouteConfigFormComponent;
  let fixture: ComponentFixture<RouteConfigFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteConfigFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteConfigFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
