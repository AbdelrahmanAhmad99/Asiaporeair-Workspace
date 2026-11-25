import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinsLandingComponent } from './cabins-landing.component';

describe('CabinsLandingComponent', () => {
  let component: CabinsLandingComponent;
  let fixture: ComponentFixture<CabinsLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinsLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabinsLandingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
