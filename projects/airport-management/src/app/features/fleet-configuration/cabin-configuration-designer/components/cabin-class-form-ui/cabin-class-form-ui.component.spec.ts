import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinClassFormUiComponent } from './cabin-class-form-ui.component';

describe('CabinClassFormUiComponent', () => {
  let component: CabinClassFormUiComponent;
  let fixture: ComponentFixture<CabinClassFormUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinClassFormUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabinClassFormUiComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
