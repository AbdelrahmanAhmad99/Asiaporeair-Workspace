import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalStatsPanelComponent } from './operational-stats-panel.component';

describe('OperationalStatsPanelComponent', () => {
  let component: OperationalStatsPanelComponent;
  let fixture: ComponentFixture<OperationalStatsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalStatsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationalStatsPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
