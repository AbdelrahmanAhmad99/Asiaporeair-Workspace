import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CulinaryExpertsComponent } from './culinary-experts.component';

describe('CulinaryExpertsComponent', () => {
  let component: CulinaryExpertsComponent;
  let fixture: ComponentFixture<CulinaryExpertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CulinaryExpertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CulinaryExpertsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
