import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInLookupFormComponent } from './check-in-lookup-form.component';

describe('CheckInLookupFormComponent', () => {
  let component: CheckInLookupFormComponent;
  let fixture: ComponentFixture<CheckInLookupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInLookupFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckInLookupFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
