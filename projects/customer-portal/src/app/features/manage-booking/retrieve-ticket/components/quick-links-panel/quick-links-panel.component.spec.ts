import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickLinksPanelComponent } from './quick-links-panel.component';

describe('QuickLinksPanelComponent', () => {
  let component: QuickLinksPanelComponent;
  let fixture: ComponentFixture<QuickLinksPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickLinksPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickLinksPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
