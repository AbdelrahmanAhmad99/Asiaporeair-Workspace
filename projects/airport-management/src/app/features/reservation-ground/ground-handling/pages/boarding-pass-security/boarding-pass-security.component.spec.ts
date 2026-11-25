import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardingPassSecurityComponent } from './boarding-pass-security.component';

describe('BoardingPassSecurityComponent', () => {
  let component: BoardingPassSecurityComponent;
  let fixture: ComponentFixture<BoardingPassSecurityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardingPassSecurityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardingPassSecurityComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
