import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAccessManagerComponent } from './system-access-manager.component';

describe('SystemAccessManagerComponent', () => {
  let component: SystemAccessManagerComponent;
  let fixture: ComponentFixture<SystemAccessManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemAccessManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemAccessManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
