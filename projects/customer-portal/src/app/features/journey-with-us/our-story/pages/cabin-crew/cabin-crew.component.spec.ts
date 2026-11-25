import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinCrewComponent } from './cabin-crew.component';

describe('CabinCrewComponent', () => {
  let component: CabinCrewComponent;
  let fixture: ComponentFixture<CabinCrewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinCrewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabinCrewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
