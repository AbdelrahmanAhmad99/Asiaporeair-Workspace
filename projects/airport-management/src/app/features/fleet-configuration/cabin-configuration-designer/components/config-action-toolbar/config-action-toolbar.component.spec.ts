import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigActionToolbarComponent } from './config-action-toolbar.component';

describe('ConfigActionToolbarComponent', () => {
  let component: ConfigActionToolbarComponent;
  let fixture: ComponentFixture<ConfigActionToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigActionToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigActionToolbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
