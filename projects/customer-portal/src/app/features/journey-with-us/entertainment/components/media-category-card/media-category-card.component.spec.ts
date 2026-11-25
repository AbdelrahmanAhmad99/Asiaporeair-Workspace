import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaCategoryCardComponent } from './media-category-card.component';

describe('MediaCategoryCardComponent', () => {
  let component: MediaCategoryCardComponent;
  let fixture: ComponentFixture<MediaCategoryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaCategoryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaCategoryCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
