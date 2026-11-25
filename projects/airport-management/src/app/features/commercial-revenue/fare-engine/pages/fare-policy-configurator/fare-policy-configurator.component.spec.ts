import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarePolicyConfiguratorComponent } from './fare-policy-configurator.component';

describe('FarePolicyConfiguratorComponent', () => {
  let component: FarePolicyConfiguratorComponent;
  let fixture: ComponentFixture<FarePolicyConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarePolicyConfiguratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarePolicyConfiguratorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
