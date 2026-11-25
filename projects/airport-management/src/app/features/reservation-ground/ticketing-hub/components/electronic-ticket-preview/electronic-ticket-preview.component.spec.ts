import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicTicketPreviewComponent } from './electronic-ticket-preview.component';

describe('ElectronicTicketPreviewComponent', () => {
  let component: ElectronicTicketPreviewComponent;
  let fixture: ComponentFixture<ElectronicTicketPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectronicTicketPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectronicTicketPreviewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
