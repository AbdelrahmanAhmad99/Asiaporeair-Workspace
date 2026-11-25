import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrewSelectorModalComponent } from './crew-selector-modal.component';

describe('CrewSelectorModalComponent', () => {
  let component: CrewSelectorModalComponent;
  let fixture: ComponentFixture<CrewSelectorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrewSelectorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrewSelectorModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
