import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryFilterBarComponent } from './directory-filter-bar.component';

describe('DirectoryFilterBarComponent', () => {
  let component: DirectoryFilterBarComponent;
  let fixture: ComponentFixture<DirectoryFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectoryFilterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectoryFilterBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
