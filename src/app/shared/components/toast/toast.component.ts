import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styles: ``
})
export class ToastComponent implements OnInit {
  showComponent = true;
  @Input() title = '';
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'info' | 'confirmation' = 'info';
  @Input() timeout:number = 0;
  @Output() confirmed = new EventEmitter<boolean>();

  ngOnInit(){
    // Disappear component after timeout
    if (this.timeout){
      setTimeout(() => {
        this.showComponent = false;
      }, this.timeout);
    }
  }
  
  confirm(confirmed: boolean){
    this.showComponent = false;
    this.confirmed.emit(confirmed);
  }

}
