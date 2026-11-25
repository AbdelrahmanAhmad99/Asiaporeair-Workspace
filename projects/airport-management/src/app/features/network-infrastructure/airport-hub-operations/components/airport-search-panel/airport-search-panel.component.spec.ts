import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportSearchPanelComponent } from './airport-search-panel.component';

describe('AirportSearchPanelComponent', () => {
  let component: AirportSearchPanelComponent;
  let fixture: ComponentFixture<AirportSearchPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportSearchPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportSearchPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
