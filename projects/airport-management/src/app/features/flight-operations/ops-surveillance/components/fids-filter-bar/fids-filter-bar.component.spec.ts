import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FidsFilterBarComponent } from './fids-filter-bar.component';

describe('FidsFilterBarComponent', () => {
  let component: FidsFilterBarComponent;
  let fixture: ComponentFixture<FidsFilterBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FidsFilterBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FidsFilterBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
