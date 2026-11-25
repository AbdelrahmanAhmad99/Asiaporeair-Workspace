import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeritageComponent } from './heritage.component';

describe('HeritageComponent', () => {
  let component: HeritageComponent;
  let fixture: ComponentFixture<HeritageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeritageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeritageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
