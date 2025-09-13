import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styles: ``
})
export class ToastComponent implements OnInit {
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

  confirm(confirmed: boolean){
    if (confirmed) 
      this.confirmed.emit(confirmed);
    this.stopShowing.emit();
  }

}
