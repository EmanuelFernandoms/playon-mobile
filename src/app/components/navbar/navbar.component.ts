import { IonicModule } from '@ionic/angular';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from 'src/app/services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule
  ],
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {

  logoPath = 'assets/icon/playon vermelho.svg';

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    // Atualiza logo baseado no tema
    this.updateLogo();
    
    // Observa mudanças no tema
    this.themeService.darkMode$.subscribe(() => {
      this.updateLogo();
    });
  }

  updateLogo() {
    this.logoPath = this.themeService.isDarkMode() 
      ? 'assets/icon/playon roxo.svg' 
      : 'assets/icon/playon vermelho.svg';
  }

  irParaHome(){
    this.router.navigateByUrl('/home');
  }

  ngAfterViewInit() {
    // Expor função no window para eventos nativos
    (window as any).handleIrParaHome = () => {
      console.log('🏠 handleIrParaHome chamado via onclick nativo!');
      this.irParaHome();
    };
  }

  ngOnDestroy() {
    delete (window as any).handleIrParaHome;
  }

}
