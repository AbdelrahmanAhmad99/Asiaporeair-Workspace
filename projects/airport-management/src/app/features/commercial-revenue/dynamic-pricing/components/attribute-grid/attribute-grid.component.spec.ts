import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeGridComponent } from './attribute-grid.component';

describe('AttributeGridComponent', () => {
  let component: AttributeGridComponent;
  let fixture: ComponentFixture<AttributeGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttributeGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
