import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkGenerationFormComponent } from './bulk-generation-form.component';

describe('BulkGenerationFormComponent', () => {
  let component: BulkGenerationFormComponent;
  let fixture: ComponentFixture<BulkGenerationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkGenerationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkGenerationFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
