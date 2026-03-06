import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationPreferences } from '../../../core/models/skill.model';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notification-preferences">
      <h3>Préférences de notification</h3>
      
      <div class="preference-item">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            [(ngModel)]="localPreferences.enabled"
            (change)="onPreferencesChange()"
          />
          <span>Activer les notifications pour cette compétence</span>
        </label>
      </div>

      @if (localPreferences.enabled) {
        <div class="preference-item">
          <label>
            <span>Me notifier après</span>
            <input 
              type="number" 
              min="1" 
              max="30"
              [(ngModel)]="localPreferences.inactiveDaysThreshold"
              (change)="onPreferencesChange()"
              class="days-input"
            />
            <span>jours sans pratique</span>
          </label>
        </div>
      }

      <div class="actions">
        <button 
          class="btn btn-primary" 
          (click)="onSave()"
          [disabled]="!hasChanges"
        >
          Enregistrer
        </button>
        <button 
          class="btn btn-secondary" 
          (click)="onCancel()"
        >
          Annuler
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-preferences {
      padding: 1.5rem;
      background: var(--surface-color, #fff);
      border-radius: 8px;
      border: 1px solid var(--border-color, #ddd);
    }

    h3 {
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      color: var(--text-primary, #333);
    }

    .preference-item {
      margin-bottom: 1.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
    }

    .days-input {
      width: 80px;
      padding: 0.5rem;
      margin: 0 0.5rem;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      font-size: 1rem;
      text-align: center;
    }

    .days-input:focus {
      outline: none;
      border-color: var(--primary-color, #007bff);
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .btn {
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: var(--primary-color, #007bff);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: var(--primary-color-dark, #0056b3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: var(--secondary-color, #6c757d);
      color: white;
    }

    .btn-secondary:hover {
      background-color: var(--secondary-color-dark, #545b62);
    }
  `]
})
export class NotificationPreferencesComponent {
  @Input() set preferences(value: NotificationPreferences | undefined) {
    this.localPreferences = value ? { ...value } : {
      enabled: true,
      inactiveDaysThreshold: 3
    };
    this.initialPreferences = { ...this.localPreferences };
  }
  
  @Output() save = new EventEmitter<NotificationPreferences>();
  @Output() cancel = new EventEmitter<void>();

  localPreferences: NotificationPreferences = {
    enabled: true,
    inactiveDaysThreshold: 3
  };

  initialPreferences: NotificationPreferences = {
    enabled: true,
    inactiveDaysThreshold: 3
  };

  hasChanges = false;

  onPreferencesChange(): void {
    this.hasChanges = 
      this.localPreferences.enabled !== this.initialPreferences.enabled ||
      this.localPreferences.inactiveDaysThreshold !== this.initialPreferences.inactiveDaysThreshold;
  }

  onSave(): void {
    this.save.emit(this.localPreferences);
    this.hasChanges = false;
    this.initialPreferences = { ...this.localPreferences };
  }

  onCancel(): void {
    this.localPreferences = { ...this.initialPreferences };
    this.hasChanges = false;
    this.cancel.emit();
  }
}
