import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeArchiveManagerComponent } from './type-archive-manager.component';

describe('TypeArchiveManagerComponent', () => {
  let component: TypeArchiveManagerComponent;
  let fixture: ComponentFixture<TypeArchiveManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeArchiveManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeArchiveManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
