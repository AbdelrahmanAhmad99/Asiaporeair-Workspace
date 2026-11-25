import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusToggleSwitchComponent } from './status-toggle-switch.component';

describe('StatusToggleSwitchComponent', () => {
  let component: StatusToggleSwitchComponent;
  let fixture: ComponentFixture<StatusToggleSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusToggleSwitchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusToggleSwitchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
