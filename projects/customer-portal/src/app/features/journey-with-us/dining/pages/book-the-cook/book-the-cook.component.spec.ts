import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookTheCookComponent } from './book-the-cook.component';

describe('BookTheCookComponent', () => {
  let component: BookTheCookComponent;
  let fixture: ComponentFixture<BookTheCookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookTheCookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookTheCookComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
