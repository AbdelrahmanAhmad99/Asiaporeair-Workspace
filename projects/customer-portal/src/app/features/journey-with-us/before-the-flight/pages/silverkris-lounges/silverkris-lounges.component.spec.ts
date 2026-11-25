import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SilverkrisLoungesComponent } from './silverkris-lounges.component';

describe('SilverkrisLoungesComponent', () => {
  let component: SilverkrisLoungesComponent;
  let fixture: ComponentFixture<SilverkrisLoungesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SilverkrisLoungesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SilverkrisLoungesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
