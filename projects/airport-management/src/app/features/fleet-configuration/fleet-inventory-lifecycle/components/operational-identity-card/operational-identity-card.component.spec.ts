import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalIdentityCardComponent } from './operational-identity-card.component';

describe('OperationalIdentityCardComponent', () => {
  let component: OperationalIdentityCardComponent;
  let fixture: ComponentFixture<OperationalIdentityCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalIdentityCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationalIdentityCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
