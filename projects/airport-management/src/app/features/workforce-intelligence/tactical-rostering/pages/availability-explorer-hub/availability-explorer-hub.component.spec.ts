import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityExplorerHubComponent } from './availability-explorer-hub.component';

describe('AvailabilityExplorerHubComponent', () => {
  let component: AvailabilityExplorerHubComponent;
  let fixture: ComponentFixture<AvailabilityExplorerHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailabilityExplorerHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailabilityExplorerHubComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
