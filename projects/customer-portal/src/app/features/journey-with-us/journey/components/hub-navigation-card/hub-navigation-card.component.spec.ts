import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubNavigationCardComponent } from './hub-navigation-card.component';

describe('HubNavigationCardComponent', () => {
  let component: HubNavigationCardComponent;
  let fixture: ComponentFixture<HubNavigationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HubNavigationCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HubNavigationCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
