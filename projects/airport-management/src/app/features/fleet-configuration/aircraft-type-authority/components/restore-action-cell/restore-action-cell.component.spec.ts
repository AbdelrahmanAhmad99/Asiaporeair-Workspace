import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestoreActionCellComponent } from './restore-action-cell.component';

describe('RestoreActionCellComponent', () => {
  let component: RestoreActionCellComponent;
  let fixture: ComponentFixture<RestoreActionCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RestoreActionCellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestoreActionCellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
