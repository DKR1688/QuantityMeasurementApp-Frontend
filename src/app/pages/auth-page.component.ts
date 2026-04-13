import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { THEME_STORAGE_KEY } from '../app.constants';
import { AuthService } from '../services/auth.service';
import { getApiErrorMessage } from '../utils/api-error';

type AuthMode = 'login' | 'signup';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth-page.component.html'
})
export class AuthPageComponent implements OnInit {
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly authMode = signal<AuthMode>('login');
  readonly darkMode = signal(localStorage.getItem(THEME_STORAGE_KEY) !== 'light');
  readonly pageTitle = computed(() =>
    this.authMode() === 'login' ? 'Sign in to continue' : 'Create your account'
  );

  loginEmail = '';
  loginPassword = '';
  signupEmail = '';
  signupPassword = '';

  showLoginPassword = false;
  showSignupPassword = false;
  loginFeedback = '';
  signupFeedback = '';
  oauthFeedback = '';
  submitting = false;

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const oauthError = this.route.snapshot.queryParamMap.get('error');

    if (token) {
      this.authService.storeToken(token);
      void this.router.navigate(['/dashboard']);
      return;
    }

    if (oauthError) {
      this.oauthFeedback = oauthError;
    }
  }

  setMode(mode: AuthMode): void {
    this.clearFeedback();
    this.authMode.set(mode);
  }

  toggleTheme(): void {
    const next = !this.darkMode();
    this.darkMode.set(next);
    localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
  }

  async submitLogin(): Promise<void> {
    this.clearFeedback();
    const email = this.loginEmail.trim();

    if (!this.isValidEmail(email)) {
      this.loginFeedback = 'Please enter a valid email address.';
      return;
    }

    this.submitting = true;

    try {
      await this.authService.login(email, this.loginPassword);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.loginFeedback = getApiErrorMessage(error, 'Login failed.');
    } finally {
      this.submitting = false;
    }
  }

  async submitSignup(): Promise<void> {
    this.clearFeedback();
    const email = this.signupEmail.trim();

    if (!this.isValidEmail(email)) {
      this.signupFeedback = 'Please enter a valid email address.';
      return;
    }

    this.submitting = true;

    try {
      await this.authService.register(email, this.signupPassword);
      await this.authService.login(email, this.signupPassword);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.signupFeedback = getApiErrorMessage(error, 'Registration failed.');
    } finally {
      this.submitting = false;
    }
  }

  continueWithGoogle(): void {
    this.clearFeedback();
    this.authService.googleLogin();
  }

  private clearFeedback(): void {
    this.loginFeedback = '';
    this.signupFeedback = '';
    this.oauthFeedback = '';
  }

  private isValidEmail(email: string): boolean {
    return AuthPageComponent.EMAIL_PATTERN.test(email);
  }
}
