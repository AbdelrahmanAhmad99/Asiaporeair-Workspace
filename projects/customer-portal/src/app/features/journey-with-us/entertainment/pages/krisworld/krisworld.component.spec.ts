import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KrisworldComponent } from './krisworld.component';

describe('KrisworldComponent', () => {
  let component: KrisworldComponent;
  let fixture: ComponentFixture<KrisworldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KrisworldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KrisworldComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
