import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualTourButtonComponent } from './virtual-tour-button.component';

describe('VirtualTourButtonComponent', () => {
  let component: VirtualTourButtonComponent;
  let fixture: ComponentFixture<VirtualTourButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualTourButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualTourButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
