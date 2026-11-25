import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RosterActionToolbarComponent } from './roster-action-toolbar.component';

describe('RosterActionToolbarComponent', () => {
  let component: RosterActionToolbarComponent;
  let fixture: ComponentFixture<RosterActionToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RosterActionToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RosterActionToolbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
