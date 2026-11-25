import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnrLookupFormComponent } from './pnr-lookup-form.component';

describe('PnrLookupFormComponent', () => {
  let component: PnrLookupFormComponent;
  let fixture: ComponentFixture<PnrLookupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnrLookupFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PnrLookupFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
