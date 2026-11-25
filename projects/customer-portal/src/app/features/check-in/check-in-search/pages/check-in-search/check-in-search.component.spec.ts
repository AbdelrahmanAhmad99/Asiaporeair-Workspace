import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInSearchComponent } from './check-in-search.component';

describe('CheckInSearchComponent', () => {
  let component: CheckInSearchComponent;
  let fixture: ComponentFixture<CheckInSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckInSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckInSearchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
