import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinClassBuilderComponent } from './cabin-class-builder.component';

describe('CabinClassBuilderComponent', () => {
  let component: CabinClassBuilderComponent;
  let fixture: ComponentFixture<CabinClassBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinClassBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabinClassBuilderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
