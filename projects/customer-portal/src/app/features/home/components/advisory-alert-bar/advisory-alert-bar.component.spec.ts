import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisoryAlertBarComponent } from './advisory-alert-bar.component';

describe('AdvisoryAlertBarComponent', () => {
  let component: AdvisoryAlertBarComponent;
  let fixture: ComponentFixture<AdvisoryAlertBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvisoryAlertBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvisoryAlertBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
