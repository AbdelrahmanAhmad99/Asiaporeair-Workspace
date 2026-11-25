import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceSearchBarComponent } from './instance-search-bar.component';

describe('InstanceSearchBarComponent', () => {
  let component: InstanceSearchBarComponent;
  let fixture: ComponentFixture<InstanceSearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstanceSearchBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstanceSearchBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
