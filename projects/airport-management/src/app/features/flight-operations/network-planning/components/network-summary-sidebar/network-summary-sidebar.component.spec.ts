import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSummarySidebarComponent } from './network-summary-sidebar.component';

describe('NetworkSummarySidebarComponent', () => {
  let component: NetworkSummarySidebarComponent;
  let fixture: ComponentFixture<NetworkSummarySidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkSummarySidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkSummarySidebarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
