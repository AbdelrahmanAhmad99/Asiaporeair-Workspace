import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleMasterInventoryComponent } from './schedule-master-inventory.component';

describe('ScheduleMasterInventoryComponent', () => {
  let component: ScheduleMasterInventoryComponent;
  let fixture: ComponentFixture<ScheduleMasterInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleMasterInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleMasterInventoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
