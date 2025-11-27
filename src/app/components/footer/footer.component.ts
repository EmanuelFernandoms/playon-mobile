import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, searchOutline, calendarOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [CommonModule, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class FooterComponent implements OnInit {

  constructor(private router: Router) {
    addIcons({ homeOutline, searchOutline, calendarOutline, personOutline });
  }

  ngOnInit() {}

  navigateTo(route: string) {
    this.router.navigateByUrl(`/${route}`);
  }

  isActive(route: string): boolean {
    return this.router.url === `/${route}` || this.router.url.startsWith(`/${route}/`);
  }

}
