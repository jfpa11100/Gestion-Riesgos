import { effect, Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private key = 'openSideMenu'
  public isSideMenuOpen = signal(this.getSideMenuConf());

  constructor(){
    effect(() => {
      this.setSideMenuConf(this.isSideMenuOpen());
    });
  }

  private getSideMenuConf(): boolean {
    const current = localStorage.getItem(this.key);
    return current === 'true' ? true : false;
  }

  private setSideMenuConf(value: boolean){
    const valor = value ? 'true' : 'false';
    localStorage.setItem(this.key, valor);
  }
}

