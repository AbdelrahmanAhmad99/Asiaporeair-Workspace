import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularRoutesComponent } from './popular-routes.component';

describe('PopularRoutesComponent', () => {
  let component: PopularRoutesComponent;
  let fixture: ComponentFixture<PopularRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularRoutesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularRoutesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
