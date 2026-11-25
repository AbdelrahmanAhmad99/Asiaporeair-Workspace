import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedPassengersComponent } from './saved-passengers.component';

describe('SavedPassengersComponent', () => {
  let component: SavedPassengersComponent;
  let fixture: ComponentFixture<SavedPassengersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedPassengersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedPassengersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
