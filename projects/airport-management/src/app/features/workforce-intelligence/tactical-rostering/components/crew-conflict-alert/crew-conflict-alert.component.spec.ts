import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewConflictAlertComponent } from './crew-conflict-alert.component';

describe('CrewConflictAlertComponent', () => {
  let component: CrewConflictAlertComponent;
  let fixture: ComponentFixture<CrewConflictAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrewConflictAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrewConflictAlertComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
