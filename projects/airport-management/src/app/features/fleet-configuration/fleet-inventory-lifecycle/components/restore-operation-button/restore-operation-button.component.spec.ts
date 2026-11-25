import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreOperationButtonComponent } from './restore-operation-button.component';

describe('RestoreOperationButtonComponent', () => {
  let component: RestoreOperationButtonComponent;
  let fixture: ComponentFixture<RestoreOperationButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestoreOperationButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestoreOperationButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
