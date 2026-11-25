import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupHelperCardComponent } from './lookup-helper-card.component';

describe('LookupHelperCardComponent', () => {
  let component: LookupHelperCardComponent;
  let fixture: ComponentFixture<LookupHelperCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LookupHelperCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupHelperCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
