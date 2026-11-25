import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManifestExportButtonComponent } from './manifest-export-button.component';

describe('ManifestExportButtonComponent', () => {
  let component: ManifestExportButtonComponent;
  let fixture: ComponentFixture<ManifestExportButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManifestExportButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManifestExportButtonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
