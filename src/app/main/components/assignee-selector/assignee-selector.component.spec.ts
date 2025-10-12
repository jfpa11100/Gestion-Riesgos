import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigneeSelectorComponent } from './assignee-selector.component';

describe('AssigneeSelectorComponent', () => {
  let component: AssigneeSelectorComponent;
  let fixture: ComponentFixture<AssigneeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssigneeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssigneeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
