import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule, IonInput } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, AfterViewInit, OnDestroy {

  isLoginMode = true;
  loginForm: FormGroup;
  registerForm: FormGroup;
  emailTokenForm: FormGroup;
  
  step: 'login' | 'email' | 'verify' | 'register' = 'login';
  emailToken: string = '';
  userEmail: string = '';
  logoPath = 'assets/icon/playon vermelho.svg';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private themeService: ThemeService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.emailTokenForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.registerForm = this.fb.group({
      nome: ['', [Validators.required]],
      telefone: ['', [Validators.required]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Debug: Log para verificar se o componente está carregando
    console.log('LoginPage ngOnInit - Componente carregado');
    
    // Se já estiver autenticado, redireciona para home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
    
    // Atualiza logo baseado no tema
    this.updateLogo();
    
    // Observa mudanças no tema
    this.themeService.darkMode$.subscribe(() => {
      this.updateLogo();
    });
    
    // Debug: Verificar se os formulários foram inicializados
    setTimeout(() => {
      console.log('LoginForm válido:', this.loginForm.valid);
      console.log('LoginForm controls:', Object.keys(this.loginForm.controls));
    }, 100);
  }

  ngAfterViewInit() {
    // Expor funções no window para eventos nativos
    (window as any).handleLogin = () => {
      console.log('🔐 handleLogin chamado via onclick nativo!');
      this.onLogin();
    };
    
    (window as any).handleToggleMode = () => {
      console.log('🔄 handleToggleMode chamado via onclick nativo!');
      this.toggleMode();
    };
    
    (window as any).handleSendEmailToken = () => {
      console.log('📧 handleSendEmailToken chamado via onclick nativo!');
      this.onSendEmailToken();
    };
    
    (window as any).handleVerifyCode = () => {
      console.log('✅ handleVerifyCode chamado via onclick nativo!');
      const input = document.querySelector('#codigoInput') as HTMLInputElement;
      if (input) {
        this.onVerifyCode(input.value);
      }
    };
    
    (window as any).handleRegister = () => {
      console.log('📝 handleRegister chamado via onclick nativo!');
      this.onRegister();
    };
    
    (window as any).handleBackToEmail = () => {
      console.log('⬅️ handleBackToEmail chamado via onclick nativo!');
      this.step = 'email';
    };
  }

  ngOnDestroy() {
    delete (window as any).handleLogin;
    delete (window as any).handleToggleMode;
    delete (window as any).handleSendEmailToken;
    delete (window as any).handleVerifyCode;
    delete (window as any).handleRegister;
    delete (window as any).handleBackToEmail;
  }

  updateLogo() {
    this.logoPath = this.themeService.isDarkMode() 
      ? 'assets/icon/playon roxo.svg' 
      : 'assets/icon/playon vermelho.svg';
  }

  passwordMatchValidator(form: FormGroup) {
    const senha = form.get('senha');
    const confirmarSenha = form.get('confirmarSenha');
    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
      confirmarSenha.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.step = this.isLoginMode ? 'login' : 'email';
    this.loginForm.reset();
    this.registerForm.reset();
    this.emailTokenForm.reset();
  }

  async onLogin() {
    console.log('🔐 onLogin chamado!');
    console.log('🔐 Form válido?', this.loginForm.valid);
    console.log('🔐 Form value:', this.loginForm.value);
    
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Entrando...'
      });
      await loading.present();

      const { email, senha } = this.loginForm.value;
      console.log('🔐 Fazendo login com:', { email, senha: '***' });
      console.log('🔐 API URL:', environment.apiBaseUrl);
      
      this.authService.login(email, senha).subscribe({
        next: (response) => {
          console.log('✅ Resposta do login:', response);
          loading.dismiss();
          // Verifica se o login foi bem-sucedido (usuário foi salvo)
          if (this.authService.isAuthenticated()) {
            console.log('✅ Usuário autenticado, redirecionando...');
            this.router.navigate(['/home']);
            this.showToast('Login realizado com sucesso!', 'success');
          } else {
            console.error('❌ Login falhou - usuário não autenticado');
            this.showToast('Erro ao fazer login. Tente novamente.', 'danger');
          }
        },
        error: (error) => {
          console.error('❌ Erro no login:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ URL:', error.url);
          console.error('❌ Mensagem:', error.message);
          console.error('❌ Error completo:', error);
          loading.dismiss();
          const errorMessage = error?.error?.message || 'Email ou senha incorretos';
          this.showToast(errorMessage, 'danger');
        }
      });
    } else {
      console.error('❌ Form inválido!', this.loginForm.errors);
      console.error('❌ Email errors:', this.loginForm.get('email')?.errors);
      console.error('❌ Senha errors:', this.loginForm.get('senha')?.errors);
    }
  }

  async onSendEmailToken() {
    if (this.emailTokenForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Enviando código...'
      });
      await loading.present();

      const email = this.emailTokenForm.get('email')?.value;
      console.log('Email do formulário:', email);
      
      if (!email) {
        loading.dismiss();
        this.showToast('Email é obrigatório', 'danger');
        return;
      }

      this.userEmail = email;

      this.authService.sendEmailToken(email).subscribe({
        next: (response) => {
          loading.dismiss();
          // Converte o código para string para garantir comparação correta
          const codigo = response?.codigo || response?.token || response?.code || response;
          this.emailToken = codigo ? String(codigo) : '';
          console.log('Código recebido:', this.emailToken);
          if (this.emailToken) {
            this.step = 'verify';
            this.showToast('Código enviado para seu email!', 'success');
          } else {
            this.showToast('Resposta inválida do servidor.', 'danger');
          }
        },
        error: (error) => {
          loading.dismiss();
          const errorMessage = error?.error?.message || 'Erro ao enviar código. Tente novamente.';
          this.showToast(errorMessage, 'danger');
          console.error('Erro ao enviar código:', error);
        }
      });
    }
  }

  async onVerifyCode(codigoDigitado: string | number | null | undefined) {
    const codigo = codigoDigitado ? String(codigoDigitado).trim() : '';
    const tokenArmazenado = String(this.emailToken).trim();
    
    console.log('Código digitado:', codigo);
    console.log('Código armazenado:', tokenArmazenado);
    console.log('São iguais?', codigo === tokenArmazenado);
    
    if (codigo === tokenArmazenado) {
      this.step = 'register';
      this.showToast('Código verificado! Preencha seus dados.', 'success');
    } else {
      this.showToast('Código inválido. Tente novamente.', 'danger');
    }
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Cadastrando...'
      });
      await loading.present();

      const { nome, telefone, senha } = this.registerForm.value;

      this.authService.register(this.userEmail, senha, nome, telefone).subscribe({
        next: (user) => {
          loading.dismiss();
          this.router.navigate(['/home']);
          this.showToast('Cadastro realizado com sucesso!', 'success');
        },
        error: (error) => {
          loading.dismiss();
          this.showToast('Erro ao cadastrar. Tente novamente.', 'danger');
          console.error('Erro no cadastro:', error);
        }
      });
    }
  }

  async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

}

