import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMembersModalComponent } from './edit-members-modal.component';

describe('EditMembersModalComponent', () => {
  let component: EditMembersModalComponent;
  let fixture: ComponentFixture<EditMembersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMembersModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMembersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
