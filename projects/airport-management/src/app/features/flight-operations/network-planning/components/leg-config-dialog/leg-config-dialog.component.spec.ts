import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegConfigDialogComponent } from './leg-config-dialog.component';

describe('LegConfigDialogComponent', () => {
  let component: LegConfigDialogComponent;
  let fixture: ComponentFixture<LegConfigDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegConfigDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegConfigDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
