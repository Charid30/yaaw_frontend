// src/app/dashboard/employees/employees.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideAngularModule,
  UserCog, UserPlus, Pencil, Trash2, X, Eye, EyeOff,
  CheckCircle, XCircle, KeyRound, ShieldCheck,
} from 'lucide-angular';
import { EmployeeService } from './employee.service';
import { Employee, EmployeeFormData } from './employee.model';

const EMPTY_FORM = (): EmployeeFormData => ({ nom: '', prenom: '', telephone: '', password: '' });

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './employees.html',
  styleUrl:    './employees.scss',
})
export class EmployeesComponent implements OnInit {
  employees  = signal<Employee[]>([]);
  loading    = signal(false);
  saving     = signal(false);
  toggling   = signal<string | null>(null);
  deleting   = signal<string | null>(null);

  showModal    = signal(false);
  editingId    = signal<string | null>(null);
  form         = EMPTY_FORM();
  showPassword = signal(false);

  showResetModal   = signal(false);
  resetTargetId    = signal<string | null>(null);
  resetTargetName  = signal('');
  newPassword      = signal('');
  showNewPwd       = signal(false);
  savingReset      = signal(false);

  errorMsg   = signal('');
  successMsg = signal('');

  readonly icons = { UserCog, UserPlus, Pencil, Trash2, X, Eye, EyeOff, CheckCircle, XCircle, KeyRound, ShieldCheck };

  constructor(private svc: EmployeeService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (r) => { this.employees.set(r.data.employees); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form = EMPTY_FORM();
    this.showPassword.set(false);
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  openEdit(e: Employee): void {
    this.editingId.set(e.id);
    this.form = { nom: e.nom, prenom: e.prenom, telephone: e.telephone, password: '' };
    this.showPassword.set(false);
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  save(): void {
    if (!this.form.nom.trim() || !this.form.prenom.trim() || !this.form.telephone.trim()) {
      this.errorMsg.set('Nom, prénom et téléphone sont requis.'); return;
    }
    if (!this.editingId() && !this.form.password) {
      this.errorMsg.set('Le mot de passe est requis.'); return;
    }
    this.saving.set(true);
    this.errorMsg.set('');

    const obs$ = this.editingId()
      ? this.svc.update(this.editingId()!, { nom: this.form.nom, prenom: this.form.prenom, telephone: this.form.telephone })
      : this.svc.create(this.form);

    obs$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.showSuccess(this.editingId() ? 'Caissier mis à jour.' : 'Caissier créé.');
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Une erreur est survenue.');
        this.saving.set(false);
      },
    });
  }

  toggle(e: Employee): void {
    this.toggling.set(e.id);
    this.svc.toggle(e.id).subscribe({
      next: (r) => {
        this.employees.update(list => list.map(emp => emp.id === e.id ? r.data.employee : emp));
        this.toggling.set(null);
      },
      error: () => this.toggling.set(null),
    });
  }

  openReset(e: Employee): void {
    this.resetTargetId.set(e.id);
    this.resetTargetName.set(`${e.prenom} ${e.nom}`);
    this.newPassword.set('');
    this.showNewPwd.set(false);
    this.errorMsg.set('');
    this.showResetModal.set(true);
  }

  closeReset(): void { this.showResetModal.set(false); }

  confirmReset(): void {
    if (!this.newPassword() || this.newPassword().length < 6) {
      this.errorMsg.set('Minimum 6 caractères.'); return;
    }
    this.savingReset.set(true);
    this.svc.resetPassword(this.resetTargetId()!, this.newPassword()).subscribe({
      next: () => {
        this.savingReset.set(false);
        this.showResetModal.set(false);
        this.showSuccess('Mot de passe réinitialisé.');
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Erreur.');
        this.savingReset.set(false);
      },
    });
  }

  confirmDelete(e: Employee): void {
    if (!confirm(`Supprimer le compte de ${e.prenom} ${e.nom} ?`)) return;
    this.deleting.set(e.id);
    this.svc.delete(e.id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.showSuccess('Caissier supprimé.');
        this.load();
      },
      error: () => this.deleting.set(null),
    });
  }

  initials(e: Employee): string {
    return `${e.prenom[0] ?? ''}${e.nom[0] ?? ''}`.toUpperCase();
  }

  formatDate(iso: string | null): string {
    if (!iso) return 'Jamais';
    return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3500);
  }
}
