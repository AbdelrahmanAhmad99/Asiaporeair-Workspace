import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarePolicyFormComponent } from './fare-policy-form.component';

describe('FarePolicyFormComponent', () => {
  let component: FarePolicyFormComponent;
  let fixture: ComponentFixture<FarePolicyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarePolicyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarePolicyFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
