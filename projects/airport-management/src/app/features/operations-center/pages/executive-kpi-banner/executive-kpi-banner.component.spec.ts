import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutiveKpiBannerComponent } from './executive-kpi-banner.component';

describe('ExecutiveKpiBannerComponent', () => {
  let component: ExecutiveKpiBannerComponent;
  let fixture: ComponentFixture<ExecutiveKpiBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveKpiBannerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ExecutiveKpiBannerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
