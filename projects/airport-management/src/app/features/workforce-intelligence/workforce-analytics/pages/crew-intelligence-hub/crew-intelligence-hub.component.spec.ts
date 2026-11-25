import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewIntelligenceHubComponent } from './crew-intelligence-hub.component';

describe('CrewIntelligenceHubComponent', () => {
  let component: CrewIntelligenceHubComponent;
  let fixture: ComponentFixture<CrewIntelligenceHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrewIntelligenceHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrewIntelligenceHubComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
