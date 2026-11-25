import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveDataTableComponent } from './archive-data-table.component';

describe('ArchiveDataTableComponent', () => {
  let component: ArchiveDataTableComponent;
  let fixture: ComponentFixture<ArchiveDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchiveDataTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveDataTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
