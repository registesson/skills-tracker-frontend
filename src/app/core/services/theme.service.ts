import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'app-theme';
  private readonly DARK_THEME = 'dark';
  private readonly LIGHT_THEME = 'light';

  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Récupérer la préférence sauvegardée
    const savedTheme = localStorage.getItem(this.THEME_STORAGE_KEY);
    
    let isDark: boolean;
    
    if (savedTheme) {
      isDark = savedTheme === this.DARK_THEME;
    } else {
      // Utiliser la préférence système si aucune préférence sauvegardée
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);
  }

  toggleTheme(): void {
    const newMode = !this.isDarkMode();
    this.isDarkMode.set(newMode);
    this.applyTheme(newMode);
    // Sauvegarder la préférence
    localStorage.setItem(
      this.THEME_STORAGE_KEY,
      newMode ? this.DARK_THEME : this.LIGHT_THEME
    );
  }

  private applyTheme(isDark: boolean): void {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }
}
