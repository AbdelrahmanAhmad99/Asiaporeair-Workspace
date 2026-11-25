import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalAccessFormComponent } from './technical-access-form.component';

describe('TechnicalAccessFormComponent', () => {
  let component: TechnicalAccessFormComponent;
  let fixture: ComponentFixture<TechnicalAccessFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalAccessFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicalAccessFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
