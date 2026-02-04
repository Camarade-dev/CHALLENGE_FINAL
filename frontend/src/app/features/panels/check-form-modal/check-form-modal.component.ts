import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Panel } from '../../../core/services/panel.service';

export interface CheckFormValue {
  state: string;
  comment?: string;
  photoUrl?: string | null;
}

@Component({
  selector: 'app-check-form-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (panel) {
      <div class="overlay" (click)="cancelClick.emit()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Contrôle : {{ panel.name }}</h3>
          <form (ngSubmit)="onSubmit()" #f="ngForm">
            <label>
              État du panneau
              <select name="state" [(ngModel)]="form.state" required>
                <option value="OK">Bon</option>
                <option value="DAMAGED">Endommagé</option>
                <option value="MISSING">Absent</option>
                <option value="OTHER">Autre</option>
              </select>
            </label>
            <label>
              Commentaire (optionnel)
              <textarea name="comment" [(ngModel)]="form.comment" rows="3"></textarea>
            </label>
            <label>
              URL photo (optionnel)
              <input type="url" name="photoUrl" [(ngModel)]="form.photoUrl" />
            </label>
            <div class="actions">
              <button type="submit" [disabled]="f.invalid || sending">
                {{ sending ? 'Envoi…' : 'Envoyer' }}
              </button>
              <button type="button" class="cancel" (click)="cancelClick.emit()">Annuler</button>
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
    }
    .modal {
      background: #fff;
      padding: 1.5rem;
      border-radius: 8px;
      min-width: 320px;
      max-width: 90vw;
    }
    .modal h3 { margin: 0 0 1rem; font-size: 1.1rem; }
    .modal label {
      display: block;
      margin-bottom: 1rem;
    }
    .modal label select,
    .modal label textarea,
    .modal label input {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      padding: 0.5rem;
      box-sizing: border-box;
    }
    .actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .actions button { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; border: none; }
    .actions button[type="submit"] { background: #059669; color: #fff; }
    .actions button.cancel { background: #e5e7eb; color: #374151; }
  `],
})
export class CheckFormModalComponent {
  @Input() panel: Panel | null = null;
  @Input() sending = false;
  @Output() submitCheck = new EventEmitter<CheckFormValue>();
  @Output() cancelClick = new EventEmitter<void>();

  form: CheckFormValue = { state: 'OK', comment: '', photoUrl: null };

  onSubmit(): void {
    this.submitCheck.emit({
      state: this.form.state,
      comment: this.form.comment || undefined,
      photoUrl: this.form.photoUrl || null,
    });
    this.form = { state: 'OK', comment: '', photoUrl: null };
  }
}
