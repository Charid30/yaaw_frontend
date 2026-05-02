// src/app/dashboard/dashboard-layout.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  LucideAngularModule, LucideIconData,
  LayoutDashboard, Package, ShoppingCart, Archive,
  History, BarChart2, Settings, LogOut, X, Menu,
  Users, UserCog, Truck, Bell, ChevronRight,
} from 'lucide-angular';
import { AuthService } from '../auth/auth';
import { ShopService } from '../shop/shop.service';
import { StockService } from './stock/stock.service';
import { ShopModules } from '../shop/shop.model';

interface NavItem {
  path:    string;
  label:   string;
  exact:   boolean;
  icon:    LucideIconData;
  module?: keyof ShopModules;
  roles?:  string[];
  group?:  string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './dashboard-layout.html',
  styleUrl:    './dashboard-layout.scss',
})
export class DashboardLayoutComponent implements OnInit {
  private auth         = inject(AuthService);
  private shopService  = inject(ShopService);
  private stockService = inject(StockService);
  private router       = inject(Router);

  sidebarOpen     = signal(false);
  stockAlertCount = signal(0);

  readonly user  = this.auth.user;
  readonly shop  = this.shopService.shop;

  readonly userInitials = computed(() => {
    const u = this.auth.user();
    if (!u) return '?';
    return `${u.prenom[0] ?? ''}${u.nom[0] ?? ''}`.toUpperCase();
  });

  readonly userName = computed(() => {
    const u = this.auth.user();
    if (!u) return '';
    return `${u.prenom} ${u.nom}`;
  });

  // URL courante réactive
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  // Titre de la page courante
  readonly pageTitle = computed(() => {
    const url = this.currentUrl();
    const item = this.navItems.find(i =>
      i.exact ? url === i.path : url.startsWith(i.path)
    );
    return item?.label ?? 'Dashboard';
  });

  readonly pageIcon = computed(() => {
    const url = this.currentUrl();
    return this.navItems.find(i =>
      i.exact ? url === i.path : url.startsWith(i.path)
    )?.icon ?? LayoutDashboard;
  });

  // Date formatée
  readonly today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  readonly icons = { X, Menu, LogOut, Bell, ChevronRight };

  readonly navItems: NavItem[] = [
    { path: '/dashboard',           label: 'Tableau de bord', exact: true,  icon: LayoutDashboard, roles: ['GERANT'],               group: 'principal' },
    { path: '/dashboard/sales',     label: 'Caisse',          exact: false, icon: ShoppingCart,                                     group: 'principal' },
    { path: '/dashboard/history',   label: 'Historique',      exact: false, icon: History,                                          group: 'principal' },
    { path: '/dashboard/products',  label: 'Produits',        exact: false, icon: Package,         roles: ['GERANT'],               group: 'gestion'   },
    { path: '/dashboard/stock',     label: 'Stock',           exact: false, icon: Archive,         module: 'stock',  roles: ['GERANT'], group: 'gestion' },
    { path: '/dashboard/reports',   label: 'Rapports',        exact: false, icon: BarChart2,       module: 'rapports', roles: ['GERANT'], group: 'gestion' },
    { path: '/dashboard/customers', label: 'Clients',         exact: false, icon: Users,           roles: ['GERANT'],               group: 'relations' },
    { path: '/dashboard/suppliers', label: 'Fournisseurs',    exact: false, icon: Truck,           roles: ['GERANT'],               group: 'relations' },
    { path: '/dashboard/employees', label: 'Employés',        exact: false, icon: UserCog,         roles: ['GERANT'],               group: 'relations' },
    { path: '/dashboard/settings',  label: 'Paramètres',      exact: false, icon: Settings,        roles: ['GERANT'],               group: 'config'    },
  ];

  readonly visibleNavItems = computed(() => {
    const modules = this.shopService.shop()?.modules;
    const role    = this.auth.user()?.role ?? 'GERANT';
    return this.navItems.filter(item => {
      if (item.roles && !item.roles.includes(role)) return false;
      if (item.module) return modules ? !!modules[item.module as keyof ShopModules] : false;
      return true;
    });
  });

  // Groupes de nav pour l'affichage
  readonly navGroups = computed(() => {
    const items = this.visibleNavItems();
    const groups: { label: string; key: string; items: NavItem[] }[] = [
      { label: 'Principal',  key: 'principal', items: items.filter(i => i.group === 'principal') },
      { label: 'Gestion',    key: 'gestion',   items: items.filter(i => i.group === 'gestion')   },
      { label: 'Relations',  key: 'relations', items: items.filter(i => i.group === 'relations') },
      { label: 'Config',     key: 'config',    items: items.filter(i => i.group === 'config')    },
    ];
    return groups.filter(g => g.items.length > 0);
  });

  ngOnInit(): void {
    this.stockService.getSummary().subscribe({
      next: (res) => {
        this.stockAlertCount.set((res.data.outOfStock ?? 0) + (res.data.lowStock ?? 0));
      },
      error: () => {},
    });
  }

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar():  void { this.sidebarOpen.set(false); }
  logout():        void { this.auth.logout(); }
}
