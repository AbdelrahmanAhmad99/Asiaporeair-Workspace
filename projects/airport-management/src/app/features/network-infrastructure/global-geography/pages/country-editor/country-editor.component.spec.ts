import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryEditorComponent } from './country-editor.component';

describe('CountryEditorComponent', () => {
  let component: CountryEditorComponent;
  let fixture: ComponentFixture<CountryEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryEditorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
