import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    // Carrega preferência salva
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.setDarkMode(savedTheme === 'true');
    }
  }

  setDarkMode(enabled: boolean) {
    this.darkModeSubject.next(enabled);
    localStorage.setItem('darkMode', enabled.toString());
    this.applyTheme(enabled);
  }

  toggleDarkMode() {
    const current = this.darkModeSubject.value;
    this.setDarkMode(!current);
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  private applyTheme(isDark: boolean) {
    const root = document.documentElement;
    
    if (isDark) {
      // Dark mode colors
      root.style.setProperty('--primary-color', '#150028');
      root.style.setProperty('--primary-light', '#7c3aed'); // Cor mais clara para ícones selecionados
      root.style.setProperty('--background-color', '#040018');
      root.style.setProperty('--footer-background', '#150028');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--text-secondary', '#cccccc');
      root.style.setProperty('--border-color', '#1a0033');
      root.style.setProperty('--card-background', '#0a0012');
    } else {
      // Light mode colors
      root.style.setProperty('--primary-color', '#5900F8');
      root.style.setProperty('--primary-light', '#5900F8'); // Mesma cor no modo claro
      root.style.setProperty('--background-color', '#ffffff');
      root.style.setProperty('--footer-background', '#f4f5f8');
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--border-color', '#e0e0e0');
      root.style.setProperty('--card-background', '#ffffff');
    }
  }
}

