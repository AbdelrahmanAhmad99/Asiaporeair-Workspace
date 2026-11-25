import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceStatusCardComponent } from './instance-status-card.component';

describe('InstanceStatusCardComponent', () => {
  let component: InstanceStatusCardComponent;
  let fixture: ComponentFixture<InstanceStatusCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstanceStatusCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstanceStatusCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
