import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiningLandingComponent } from './dining-landing.component';

describe('DiningLandingComponent', () => {
  let component: DiningLandingComponent;
  let fixture: ComponentFixture<DiningLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiningLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiningLandingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
