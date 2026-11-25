import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDishCardComponent } from './menu-dish-card.component';

describe('MenuDishCardComponent', () => {
  let component: MenuDishCardComponent;
  let fixture: ComponentFixture<MenuDishCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuDishCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuDishCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
