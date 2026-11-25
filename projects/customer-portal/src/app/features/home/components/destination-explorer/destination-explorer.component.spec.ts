import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationExplorerComponent } from './destination-explorer.component';

describe('DestinationExplorerComponent', () => {
  let component: DestinationExplorerComponent;
  let fixture: ComponentFixture<DestinationExplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationExplorerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationExplorerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
