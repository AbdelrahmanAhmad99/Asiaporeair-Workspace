import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaresDirectoryComponent } from './fares-directory.component';

describe('FaresDirectoryComponent', () => {
  let component: FaresDirectoryComponent;
  let fixture: ComponentFixture<FaresDirectoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaresDirectoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaresDirectoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
