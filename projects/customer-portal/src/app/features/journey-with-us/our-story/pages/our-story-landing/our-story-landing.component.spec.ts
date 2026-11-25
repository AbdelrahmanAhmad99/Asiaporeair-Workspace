import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurStoryLandingComponent } from './our-story-landing.component';

describe('OurStoryLandingComponent', () => {
  let component: OurStoryLandingComponent;
  let fixture: ComponentFixture<OurStoryLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurStoryLandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurStoryLandingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
