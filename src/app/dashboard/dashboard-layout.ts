// src/app/dashboard/dashboard-layout.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule, LucideIconData,
  LayoutDashboard, Package, ShoppingCart, Archive,
  History, BarChart2, Settings, LogOut, X, Menu, Users, UserCog, Truck,
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
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    LucideAngularModule,
  ],
  templateUrl: './dashboard-layout.html',
  styleUrl:    './dashboard-layout.scss',
})
export class DashboardLayoutComponent implements OnInit {
  private auth         = inject(AuthService);
  private shopService  = inject(ShopService);
  private stockService = inject(StockService);

  sidebarOpen     = signal(false);
  stockAlertCount = signal(0);

  readonly user  = this.auth.user;
  readonly shop  = this.shopService.shop;

  readonly userInitials = computed(() => {
    const u = this.auth.user();
    if (!u) return '?';
    return `${u.prenom[0] ?? ''}${u.nom[0] ?? ''}`.toUpperCase();
  });

  ngOnInit(): void {
    this.stockService.getSummary().subscribe({
      next: (res) => {
        this.stockAlertCount.set((res.data.outOfStock ?? 0) + (res.data.lowStock ?? 0));
      },
      error: () => {},
    });
  }

  // Icons exposés pour le template
  readonly icons = { X, Menu, LogOut };

  readonly navItems: NavItem[] = [
    { path: '/dashboard',           label: 'Tableau de bord', exact: true,  icon: LayoutDashboard },
    { path: '/dashboard/products',  label: 'Produits',        exact: false, icon: Package         },
    { path: '/dashboard/sales',     label: 'Caisse',          exact: false, icon: ShoppingCart    },
    { path: '/dashboard/history',   label: 'Historique',      exact: false, icon: History         },
    { path: '/dashboard/stock',     label: 'Stock',           exact: false, icon: Archive,         module: 'stock'    },
    { path: '/dashboard/reports',   label: 'Rapports',        exact: false, icon: BarChart2,       module: 'rapports' },
    { path: '/dashboard/customers', label: 'Clients',         exact: false, icon: Users            },
    { path: '/dashboard/suppliers', label: 'Fournisseurs',    exact: false, icon: Truck            },
    { path: '/dashboard/employees', label: 'Employés',        exact: false, icon: UserCog          },
    { path: '/dashboard/settings',  label: 'Paramètres',      exact: false, icon: Settings         },
  ];

  readonly visibleNavItems = computed(() => {
    const modules = this.shopService.shop()?.modules;
    return this.navItems.filter(item => {
      if (!item.module) return true;
      return modules ? !!modules[item.module as keyof ShopModules] : false;
    });
  });

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  closeSidebar():  void { this.sidebarOpen.set(false); }
  logout():        void { this.auth.logout(); }
}
