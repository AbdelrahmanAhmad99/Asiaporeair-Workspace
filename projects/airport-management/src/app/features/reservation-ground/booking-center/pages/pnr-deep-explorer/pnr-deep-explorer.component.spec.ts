import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PnrDeepExplorerComponent } from './pnr-deep-explorer.component';

describe('PnrDeepExplorerComponent', () => {
  let component: PnrDeepExplorerComponent;
  let fixture: ComponentFixture<PnrDeepExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PnrDeepExplorerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PnrDeepExplorerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
