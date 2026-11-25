import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteComposerComponent } from './route-composer.component';

describe('RouteComposerComponent', () => {
  let component: RouteComposerComponent;
  let fixture: ComponentFixture<RouteComposerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteComposerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteComposerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
