import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusUpdateDropdownComponent } from './status-update-dropdown.component';

describe('StatusUpdateDropdownComponent', () => {
  let component: StatusUpdateDropdownComponent;
  let fixture: ComponentFixture<StatusUpdateDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusUpdateDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusUpdateDropdownComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
