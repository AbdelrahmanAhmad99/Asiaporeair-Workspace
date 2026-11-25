import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteAnalysisDetailComponent } from './route-analysis-detail.component';

describe('RouteAnalysisDetailComponent', () => {
  let component: RouteAnalysisDetailComponent;
  let fixture: ComponentFixture<RouteAnalysisDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteAnalysisDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteAnalysisDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
