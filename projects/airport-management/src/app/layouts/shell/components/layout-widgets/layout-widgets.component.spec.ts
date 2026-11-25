import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutWidgetsComponent } from './layout-widgets.component';

describe('LayoutWidgetsComponent', () => {
  let component: LayoutWidgetsComponent;
  let fixture: ComponentFixture<LayoutWidgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutWidgetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutWidgetsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
