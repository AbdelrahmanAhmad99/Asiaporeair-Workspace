import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkInstanceGeneratorComponent } from './bulk-instance-generator.component';

describe('BulkInstanceGeneratorComponent', () => {
  let component: BulkInstanceGeneratorComponent;
  let fixture: ComponentFixture<BulkInstanceGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkInstanceGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkInstanceGeneratorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
