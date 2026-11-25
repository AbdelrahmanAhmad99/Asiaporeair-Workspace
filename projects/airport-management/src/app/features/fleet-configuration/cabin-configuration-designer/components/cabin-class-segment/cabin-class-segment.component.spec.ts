import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinClassSegmentComponent } from './cabin-class-segment.component';

describe('CabinClassSegmentComponent', () => {
  let component: CabinClassSegmentComponent;
  let fixture: ComponentFixture<CabinClassSegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinClassSegmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabinClassSegmentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
