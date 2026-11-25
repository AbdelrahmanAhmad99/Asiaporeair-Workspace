import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InflightMenusComponent } from './inflight-menus.component';

describe('InflightMenusComponent', () => {
  let component: InflightMenusComponent;
  let fixture: ComponentFixture<InflightMenusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InflightMenusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InflightMenusComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
