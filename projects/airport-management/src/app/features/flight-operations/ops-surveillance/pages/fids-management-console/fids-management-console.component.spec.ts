import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FidsManagementConsoleComponent } from './fids-management-console.component';

describe('FidsManagementConsoleComponent', () => {
  let component: FidsManagementConsoleComponent;
  let fixture: ComponentFixture<FidsManagementConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FidsManagementConsoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FidsManagementConsoleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
