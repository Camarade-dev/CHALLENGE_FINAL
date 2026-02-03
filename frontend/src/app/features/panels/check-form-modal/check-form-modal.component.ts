import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Panel } from '../../../core/services/panel.service';

export type CheckState = 'OK' | 'DAMAGED' | 'MISSING' | 'OTHER';

export interface CheckFormValue {
  state: CheckState;
  comment?: string;
  photoUrl?: string | null;
}

@Component({
  selector: 'app-check-form-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (panel) {
      <div class="overlay" (click)="cancel()">
        <div class="modal" (click)="$event.stopPropagation()" role="dialog" aria-labelledby="check-title">
          <h2 id="check-title">Contrôle du panneau : {{ panel.name }}</h2>
          <form (ngSubmit)="onSubmit()" #f="ngForm">
            <label>
              État du panneau <span class="required">*</span>
              <select name="state" [(ngModel)]="state" required>
                <option value="OK">Bon</option>
                <option value="DAMAGED">Endommagé</option>
                <option value="MISSING">Absent</option>
                <option value="OTHER">Autre</option>
              </select>
            </label>
            <label>
              Commentaire (optionnel)
              <textarea name="comment" [(ngModel)]="comment" rows="3" placeholder="Décrivez l'état observé..."></textarea>
            </label>
            <label>
              URL de la photo (optionnel)
              <input type="url" name="photoUrl" [(ngModel)]="photoUrl" placeholder="https://..." />
            </label>
            <div class="actions">
              <button type="button" class="btn-cancel" (click)="cancel()">Annuler</button>
              <button type="submit" [disabled]="f.invalid || sending">{{ sending ? 'Envoi...' : 'Soumettre le contrôle' }}</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .modal {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    h2 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
      color: #1a1a2e;
    }
    .required { color: #b91c1c; }
    label {
      display: block;
      margin-bottom: 1rem;
    }
    label select, label textarea, label input {
      width: 100%;
      padding: 0.5rem;
      margin-top: 0.25rem;
      box-sizing: border-box;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-family: inherit;
    }
    label textarea { resize: vertical; min-height: 60px; }
    .actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
    .actions button {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.9375rem;
      cursor: pointer;
      border: none;
    }
    .actions button[type="submit"] {
      background: #7c3aed;
      color: #fff;
    }
    .actions button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel { background: #e5e7eb; color: #374151; }
  `],
})
export class CheckFormModalComponent implements OnChanges {
  @Input() panel: Panel | null = null;
  @Input() sending = false;
  @Output() submitCheck = new EventEmitter<CheckFormValue>();
  @Output() cancelClick = new EventEmitter<void>();

  state: CheckState = 'OK';
  comment = '';
  photoUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['panel'] && this.panel) {
      this.state = 'OK';
      this.comment = '';
      this.photoUrl = null;
    }
  }

  cancel(): void {
    this.cancelClick.emit();
  }

  onSubmit(): void {
    this.submitCheck.emit({
      state: this.state,
      comment: this.comment || undefined,
      photoUrl: this.photoUrl || undefined,
    });
  }
}
