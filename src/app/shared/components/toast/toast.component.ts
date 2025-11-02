import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styles: ``
})
export class ToastComponent implements OnInit, AfterViewInit {
  @ViewChildren('toast') toast!: QueryList<ElementRef>;
  @Input() title = '';
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'info' | 'confirmation' = 'info';
  @Input() timeout!: number;
  @Output() confirmed = new EventEmitter<boolean>();
  @Output() stopShowing = new EventEmitter<void>;

  ngOnInit(){
    // Disappear component after timeout if necessary
    if (this.timeout){
      setTimeout(() => {
        this.stopShowing.emit();
      }, this.timeout);
    }
  }

  ngAfterViewInit(){
    // Scroll to the toast
    const toastElement = this.toast.first.nativeElement;
    if (toastElement) {
      toastElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }


  confirm(confirmed: boolean){
    if (confirmed)
      this.confirmed.emit(confirmed);
    this.stopShowing.emit();
  }

}
