import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddServicesComponent } from './add-services.component';

describe('AddServicesComponent', () => {
  let component: AddServicesComponent;
  let fixture: ComponentFixture<AddServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddServicesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
