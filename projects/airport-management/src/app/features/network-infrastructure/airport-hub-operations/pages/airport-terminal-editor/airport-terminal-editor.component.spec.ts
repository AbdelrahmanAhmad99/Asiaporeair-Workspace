import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirportTerminalEditorComponent } from './airport-terminal-editor.component';

describe('AirportTerminalEditorComponent', () => {
  let component: AirportTerminalEditorComponent;
  let fixture: ComponentFixture<AirportTerminalEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirportTerminalEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirportTerminalEditorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
