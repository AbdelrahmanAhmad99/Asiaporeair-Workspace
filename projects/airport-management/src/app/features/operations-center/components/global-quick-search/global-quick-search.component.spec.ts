import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalQuickSearchComponent } from './global-quick-search.component';

describe('GlobalQuickSearchComponent', () => {
  let component: GlobalQuickSearchComponent;
  let fixture: ComponentFixture<GlobalQuickSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalQuickSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalQuickSearchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
