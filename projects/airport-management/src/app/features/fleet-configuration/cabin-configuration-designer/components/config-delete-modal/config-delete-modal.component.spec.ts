import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigDeleteModalComponent } from './config-delete-modal.component';

describe('ConfigDeleteModalComponent', () => {
  let component: ConfigDeleteModalComponent;
  let fixture: ComponentFixture<ConfigDeleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigDeleteModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigDeleteModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
