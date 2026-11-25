import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatPropertyEditorComponent } from './seat-property-editor.component';

describe('SeatPropertyEditorComponent', () => {
  let component: SeatPropertyEditorComponent;
  let fixture: ComponentFixture<SeatPropertyEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatPropertyEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeatPropertyEditorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
