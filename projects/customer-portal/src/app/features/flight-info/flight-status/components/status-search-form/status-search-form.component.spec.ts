import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusSearchFormComponent } from './status-search-form.component';

describe('StatusSearchFormComponent', () => {
  let component: StatusSearchFormComponent;
  let fixture: ComponentFixture<StatusSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusSearchFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusSearchFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
