import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroVisualBackgroundComponent } from './hero-visual-background.component';

describe('HeroVisualBackgroundComponent', () => {
  let component: HeroVisualBackgroundComponent;
  let fixture: ComponentFixture<HeroVisualBackgroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroVisualBackgroundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroVisualBackgroundComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
