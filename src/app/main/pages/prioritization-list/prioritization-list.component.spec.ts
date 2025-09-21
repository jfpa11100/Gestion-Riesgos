import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrioritizationListComponent } from './prioritization-list.component';

describe('PrioritizationListComponent', () => {
  let component: PrioritizationListComponent;
  let fixture: ComponentFixture<PrioritizationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrioritizationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrioritizationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
