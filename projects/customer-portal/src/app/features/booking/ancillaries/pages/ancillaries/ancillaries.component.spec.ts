import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncillariesComponent } from './ancillaries.component';

describe('AncillariesComponent', () => {
  let component: AncillariesComponent;
  let fixture: ComponentFixture<AncillariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncillariesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncillariesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
