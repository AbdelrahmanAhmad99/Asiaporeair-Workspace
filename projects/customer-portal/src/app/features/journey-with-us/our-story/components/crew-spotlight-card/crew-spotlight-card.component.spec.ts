import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewSpotlightCardComponent } from './crew-spotlight-card.component';

describe('CrewSpotlightCardComponent', () => {
  let component: CrewSpotlightCardComponent;
  let fixture: ComponentFixture<CrewSpotlightCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrewSpotlightCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrewSpotlightCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
