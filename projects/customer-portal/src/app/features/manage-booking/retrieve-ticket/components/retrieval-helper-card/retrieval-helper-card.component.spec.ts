import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrievalHelperCardComponent } from './retrieval-helper-card.component';

describe('RetrievalHelperCardComponent', () => {
  let component: RetrievalHelperCardComponent;
  let fixture: ComponentFixture<RetrievalHelperCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetrievalHelperCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetrievalHelperCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
