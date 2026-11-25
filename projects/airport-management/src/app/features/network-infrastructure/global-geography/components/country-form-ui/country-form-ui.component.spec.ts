import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryFormUiComponent } from './country-form-ui.component';

describe('CountryFormUiComponent', () => {
  let component: CountryFormUiComponent;
  let fixture: ComponentFixture<CountryFormUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountryFormUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountryFormUiComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
