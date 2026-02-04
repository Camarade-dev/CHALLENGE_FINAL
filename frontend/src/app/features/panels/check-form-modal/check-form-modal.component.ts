import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Panel, PanelService } from '../../../core/services/panel.service';

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
              <textarea name="comment" [(ngModel)]="form.comment" rows="3" maxlength="2000" placeholder="Décrivez l'état du panneau..."></textarea>
            </label>

            <div class="photo-section">
              <p class="label">Photo (optionnel)</p>
              <div class="photo-options">
                <label class="file-label">
                  <input
                    type="file"
                    name="photoFile"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    (change)="onFileChange($event)"
                  />
                  <span class="btn-file">Choisir un fichier</span>
                </label>
                <span class="or">ou</span>
                <label>
                  <input type="url" name="photoUrl" [(ngModel)]="form.photoUrl" placeholder="URL d'une photo" />
                </label>
              </div>
              @if (photoPreview) {
                <div class="preview">
                  <img [src]="photoPreview" alt="Aperçu" />
                  <button type="button" class="remove-preview" (click)="clearPhoto()">Retirer</button>
                </div>
              }
              <p class="hint">JPEG, PNG, GIF ou WebP · max 5 Mo</p>
            </div>

            <div class="actions">
              <button type="submit" [disabled]="f.invalid || sending || uploading">
                {{ uploading ? 'Envoi de la photo…' : sending ? 'Envoi…' : 'Envoyer' }}
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
      max-height: 90vh;
      overflow: auto;
    }
    .modal h3 { margin: 0 0 1rem; font-size: 1.1rem; }
    .modal label {
      display: block;
      margin-bottom: 1rem;
    }
    .modal label select,
    .modal label textarea,
    .modal label input[type="url"] {
      display: block;
      width: 100%;
      margin-top: 0.25rem;
      padding: 0.5rem;
      box-sizing: border-box;
    }
    .photo-section { margin-bottom: 1rem; }
    .photo-section .label { margin: 0 0 0.5rem; font-weight: 500; }
    .photo-options { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .photo-options input[type="url"] { flex: 1; min-width: 180px; }
    .file-label input { display: none; }
    .btn-file {
      display: inline-block;
      padding: 0.4rem 0.75rem;
      background: #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .btn-file:hover { background: #d1d5db; }
    .or { color: #6b7280; font-size: 0.875rem; }
    .preview {
      margin-top: 0.5rem;
      position: relative;
      display: inline-block;
    }
    .preview img {
      max-width: 200px;
      max-height: 150px;
      object-fit: contain;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .remove-preview {
      display: block;
      margin-top: 0.25rem;
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      background: #fef2f2;
      color: #b91c1c;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .hint { margin: 0.25rem 0 0; font-size: 0.75rem; color: #6b7280; }
    .actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .actions button { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; border: none; }
    .actions button[type="submit"] { background: #059669; color: #fff; }
    .actions button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }
    .actions button.cancel { background: #e5e7eb; color: #374151; }
  `],
})
export class CheckFormModalComponent {
  @Input() panel: Panel | null = null;
  @Input() sending = false;
  @Output() submitCheck = new EventEmitter<CheckFormValue>();
  @Output() cancelClick = new EventEmitter<void>();

  form: CheckFormValue = { state: 'OK', comment: '', photoUrl: null };
  selectedFile: File | null = null;
  photoPreview: string | null = null;
  uploading = false;

  constructor(private panelService: PanelService) {}

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    this.selectedFile = file;
    this.form.photoUrl = null;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearPhoto(): void {
    this.selectedFile = null;
    this.photoPreview = null;
    this.form.photoUrl = null;
  }

  onSubmit(): void {
    const payload: CheckFormValue = {
      state: this.form.state,
      comment: this.form.comment || undefined,
      photoUrl: this.form.photoUrl || null,
    };

    if (this.selectedFile) {
      this.uploading = true;
      this.panelService.uploadCheckPhoto(this.selectedFile).subscribe({
        next: (res) => {
          payload.photoUrl = res.url;
          this.submitCheck.emit(payload);
          this.resetForm();
          this.uploading = false;
        },
        error: () => {
          this.uploading = false;
        },
      });
    } else {
      this.submitCheck.emit(payload);
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.form = { state: 'OK', comment: '', photoUrl: null };
    this.selectedFile = null;
    this.photoPreview = null;
  }
}
