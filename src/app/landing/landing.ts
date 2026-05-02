// landing/landing.ts
import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../auth/auth';

interface Feature { icon: SafeHtml; color: string; title: string; desc: string; }
interface CommerceType { icon: SafeHtml; label: string; }

// Raccourci pour les SVG Heroicons outline
function svg(path: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">${path}</svg>`;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.html',
})
export class LandingComponent {
  private auth      = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  scrolled = signal(false);
  readonly year = new Date().getFullYear();

  get isLoggedIn() { return this.auth.isLoggedIn(); }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 20); }

  private safe(s: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(s);
  }

  readonly features: Feature[] = [
    {
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.962-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>`)),
      color: 'indigo',
      title: 'Caisse intelligente',
      desc: 'Interface tactile rapide, compatible clavier et code-barres. Finalisez une vente en quelques secondes.',
    },
    {
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/>`)),
      color: 'amber',
      title: 'Gestion des stocks',
      desc: 'Suivez vos niveaux de stock en temps réel. Alertes automatiques avant la rupture de stock.',
    },
    {
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>`)),
      color: 'emerald',
      title: 'Rapports analytiques',
      desc: "Tableaux de bord clairs avec chiffre d'affaires, ventes par produit et tendances mensuelles.",
    },
    {
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>`)),
      color: 'violet',
      title: 'Gestion des clients',
      desc: 'Fidélisez votre clientèle grâce à un carnet client complet avec historique des achats.',
    },
    {
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>`)),
      color: 'rose',
      title: 'Multi-employes',
      desc: "Creez des comptes pour chaque employe avec des droits d'acces distincts et un suivi individuel.",
    },
    {
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3M6.75 3h.008v.008H6.75V3zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>`)),
      color: 'teal',
      title: 'Tickets de caisse',
      desc: 'Impression automatique sur imprimante thermique 80mm. Partagez aussi par WhatsApp ou SMS.',
    },
  ];

  readonly stats = [
    { value: '500+', label: 'Boutiques actives' },
    { value: '99.9%', label: 'Disponibilite' },
    { value: '< 2s',  label: "Temps d'ouverture" },
    { value: '24/7',  label: 'Support client' },
  ];

  readonly types: CommerceType[] = [
    {
      label: 'Boutiques',
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.962-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>`)),
    },
    {
      label: 'Restaurants',
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 4.5h12M6 16.5h12m-12 0v2.25A2.25 2.25 0 008.25 21h7.5A2.25 2.25 0 0018 18.75V16.5M6 16.5v-2.25m12 2.25v-2.25"/>`)),
    },
    {
      label: 'Pharmacies',
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>`)),
    },
    {
      label: 'Caves & bars',
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 01.75 1.68v.345A2.25 2.25 0 0118.3 19.2H5.7a2.25 2.25 0 01-2.25-2.175V16.68a2.25 2.25 0 01.75-1.68L5 14.5m14.8.5-1.7-1.5M5 14.5l-1.7 1.5"/>`)),
    },
    {
      label: 'Superettes',
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016 2.993 2.993 0 002.25-1.016 3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"/>`)),
    },
    {
      label: 'Salons',
      icon: this.safe(svg(`<path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"/>`)),
    },
  ];
}
