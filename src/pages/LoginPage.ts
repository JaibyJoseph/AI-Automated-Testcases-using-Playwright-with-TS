import type { Locator, Page } from '@playwright/test';
import { fillSecret } from '../support/secretInput';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    // Role-based locators match what a user (and a screen reader) sees.
    // Hidden "forgot password" fields are excluded automatically.
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Log In' });
  }

  readonly url = /module=Users&action=Login/;

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await fillSecret(this.passwordInput, password);
    await this.loginButton.click();
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }
}
