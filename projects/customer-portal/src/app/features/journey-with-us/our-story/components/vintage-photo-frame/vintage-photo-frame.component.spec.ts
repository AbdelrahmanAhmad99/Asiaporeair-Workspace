import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VintagePhotoFrameComponent } from './vintage-photo-frame.component';

describe('VintagePhotoFrameComponent', () => {
  let component: VintagePhotoFrameComponent;
  let fixture: ComponentFixture<VintagePhotoFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VintagePhotoFrameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VintagePhotoFrameComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
