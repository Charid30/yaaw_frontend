// src/app/admin/admin-layout.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard, Store, Users, Activity,
  LogOut, Menu, X, ShieldCheck,
} from 'lucide-angular';
import { AuthService } from '../auth/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-layout.html',
  styleUrl:    './admin-layout.scss',
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);

  sidebarOpen = signal(false);
  readonly user = this.auth.user;
  readonly icons = { Menu, X, LogOut, ShieldCheck };

  readonly navItems = [
    { path: '/admin',          label: 'Vue d\'ensemble', icon: LayoutDashboard, exact: true  },
    { path: '/admin/shops',    label: 'Boutiques',       icon: Store,           exact: false },
    { path: '/admin/users',    label: 'Gérants',         icon: Users,           exact: false },
    { path: '/admin/activity', label: 'Activité',        icon: Activity,        exact: false },
  ];

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar():  void { this.sidebarOpen.set(false); }
  logout():        void { this.auth.logout(); }
}
