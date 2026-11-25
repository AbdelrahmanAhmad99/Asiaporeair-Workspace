import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeDataGridComponent } from './type-data-grid.component';

describe('TypeDataGridComponent', () => {
  let component: TypeDataGridComponent;
  let fixture: ComponentFixture<TypeDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeDataGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeDataGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
