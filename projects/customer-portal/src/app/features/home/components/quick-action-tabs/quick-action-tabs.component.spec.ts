import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickActionTabsComponent } from './quick-action-tabs.component';

describe('QuickActionTabsComponent', () => {
  let component: QuickActionTabsComponent;
  let fixture: ComponentFixture<QuickActionTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickActionTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickActionTabsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
