import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaxManifestTableComponent } from './pax-manifest-table.component';

describe('PaxManifestTableComponent', () => {
  let component: PaxManifestTableComponent;
  let fixture: ComponentFixture<PaxManifestTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaxManifestTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaxManifestTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
