import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreDomainsGridComponent } from './core-domains-grid.component';

describe('CoreDomainsGridComponent', () => {
  let component: CoreDomainsGridComponent;
  let fixture: ComponentFixture<CoreDomainsGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoreDomainsGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreDomainsGridComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
