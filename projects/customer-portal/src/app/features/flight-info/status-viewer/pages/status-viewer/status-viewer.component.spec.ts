import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusViewerComponent } from './status-viewer.component';

describe('StatusViewerComponent', () => {
  let component: StatusViewerComponent;
  let fixture: ComponentFixture<StatusViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
