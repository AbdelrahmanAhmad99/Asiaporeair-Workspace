import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorConfigModalComponent } from './operator-config-modal.component';

describe('OperatorConfigModalComponent', () => {
  let component: OperatorConfigModalComponent;
  let fixture: ComponentFixture<OperatorConfigModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorConfigModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperatorConfigModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
