import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeSearchFilterBarComponent } from './type-search-filter-bar.component';

describe('TypeSearchFilterBarComponent', () => {
  let component: TypeSearchFilterBarComponent;
  let fixture: ComponentFixture<TypeSearchFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeSearchFilterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeSearchFilterBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
