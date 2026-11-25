import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessCelebrationComponent } from './success-celebration.component';

describe('SuccessCelebrationComponent', () => {
  let component: SuccessCelebrationComponent;
  let fixture: ComponentFixture<SuccessCelebrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessCelebrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessCelebrationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
