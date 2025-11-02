import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MitigationFormComponent } from './mitigation-form.component';

describe('MitigationFormComponent', () => {
  let component: MitigationFormComponent;
  let fixture: ComponentFixture<MitigationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MitigationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MitigationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
