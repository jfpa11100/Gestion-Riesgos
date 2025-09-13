import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styles: ``
})
export class ToastComponent implements OnInit {
  @Output() stopShowing = new EventEmitter<void>;
  @Input() title = '';
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'info' | 'confirmation' = 'info';
  @Input() timeout!: number;
  @Output() confirmed = new EventEmitter<boolean>();

  ngOnInit(){
    // Disappear component after timeout
    if (this.timeout){
      setTimeout(() => {
        this.stopShowing.emit();
      }, this.timeout);
    }
  }

  confirm(confirmed: boolean){
    if (confirmed) this.confirmed.emit(confirmed);
    this.stopShowing.emit();
  }

}
