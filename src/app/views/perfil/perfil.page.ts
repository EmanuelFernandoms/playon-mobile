import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from 'src/app/components/navbar/navbar.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { AuthService, User } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  usuario: User | null = null;
  darkMode = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getCurrentUser();
    this.themeService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
    this.darkMode = this.themeService.isDarkMode();
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}

