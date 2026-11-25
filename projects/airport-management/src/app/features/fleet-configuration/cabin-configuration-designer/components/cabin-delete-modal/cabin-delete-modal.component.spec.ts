import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinDeleteModalComponent } from './cabin-delete-modal.component';

describe('CabinDeleteModalComponent', () => {
  let component: CabinDeleteModalComponent;
  let fixture: ComponentFixture<CabinDeleteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinDeleteModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabinDeleteModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
