import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigEmptyStateComponent } from './config-empty-state.component';

describe('ConfigEmptyStateComponent', () => {
  let component: ConfigEmptyStateComponent;
  let fixture: ComponentFixture<ConfigEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigEmptyStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigEmptyStateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
