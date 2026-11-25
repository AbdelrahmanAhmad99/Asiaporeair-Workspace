import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaxActionBarComponent } from './pax-action-bar.component';

describe('PaxActionBarComponent', () => {
  let component: PaxActionBarComponent;
  let fixture: ComponentFixture<PaxActionBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaxActionBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaxActionBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
