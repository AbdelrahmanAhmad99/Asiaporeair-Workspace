import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreActionButtonComponent } from './restore-action-button.component';

describe('RestoreActionButtonComponent', () => {
  let component: RestoreActionButtonComponent;
  let fixture: ComponentFixture<RestoreActionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestoreActionButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestoreActionButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
