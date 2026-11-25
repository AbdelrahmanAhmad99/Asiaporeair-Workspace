import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigVersionCardComponent } from './config-version-card.component';

describe('ConfigVersionCardComponent', () => {
  let component: ConfigVersionCardComponent;
  let fixture: ComponentFixture<ConfigVersionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigVersionCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigVersionCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
