import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  templateUrl: './search-bar.component.html',
  styles: ``
})
export class SearchBarComponent { 
  searchQuery:string = '';
  @Output() onSearch = new EventEmitter<string>()

  search(){
    this.onSearch.emit(this.searchQuery)
  }
}
