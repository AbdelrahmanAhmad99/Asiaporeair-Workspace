import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderCommandBarComponent } from './header-command-bar.component';

describe('HeaderCommandBarComponent', () => {
  let component: HeaderCommandBarComponent;
  let fixture: ComponentFixture<HeaderCommandBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderCommandBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderCommandBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
