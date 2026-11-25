import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoungeFacilityIconsComponent } from './lounge-facility-icons.component';

describe('LoungeFacilityIconsComponent', () => {
  let component: LoungeFacilityIconsComponent;
  let fixture: ComponentFixture<LoungeFacilityIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoungeFacilityIconsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoungeFacilityIconsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
