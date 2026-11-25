import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeSpecificationDetailComponent } from './type-specification-detail.component';

describe('TypeSpecificationDetailComponent', () => {
  let component: TypeSpecificationDetailComponent;
  let fixture: ComponentFixture<TypeSpecificationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeSpecificationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeSpecificationDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
