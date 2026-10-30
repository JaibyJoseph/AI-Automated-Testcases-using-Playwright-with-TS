import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly mainNavigation: Locator;
  readonly salesMenu: Locator;

  constructor(page: Page) {
    this.mainNavigation = page.getByRole('navigation');
    this.salesMenu = this.mainNavigation.getByRole('link', { name: 'Sales', exact: true });
  }

  readonly url = /module=Home/;
  readonly title = /^Home » /;
}
