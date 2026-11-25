import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityViewerComponent } from './identity-viewer.component';

describe('IdentityViewerComponent', () => {
  let component: IdentityViewerComponent;
  let fixture: ComponentFixture<IdentityViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentityViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
