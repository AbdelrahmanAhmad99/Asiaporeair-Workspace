import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AncillaryCategoryCardComponent } from './ancillary-category-card.component';

describe('AncillaryCategoryCardComponent', () => {
  let component: AncillaryCategoryCardComponent;
  let fixture: ComponentFixture<AncillaryCategoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AncillaryCategoryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AncillaryCategoryCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
