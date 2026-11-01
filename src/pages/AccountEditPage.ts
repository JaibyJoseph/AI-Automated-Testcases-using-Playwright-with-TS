import type { Locator, Page } from '@playwright/test';

export type AccountFormData = {
  name?: string;
  type?: string;
  industry?: string;
};

export class AccountEditPage {
  readonly createHeading: Locator;
  readonly nameInput: Locator;
  readonly typeSelect: Locator;
  readonly industrySelect: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.createHeading = page.getByRole('heading', { name: 'CREATE', level: 2 });
    // SuiteCRM renders these fields without an associated <label>, so no accessible name exists.
    // The id/name attributes are SuiteCRM field names from the module definition and are stable.
    this.nameInput = page.locator('#name');
    this.typeSelect = page.locator('select[name="account_type"]');
    this.industrySelect = page.locator('select[name="industry"]');
    // The form has identical Save buttons at the top and bottom.
    this.saveButton = page.getByRole('button', { name: 'Save' }).first();
  }

  readonly url = /module=Accounts&action=EditView/;

  async openNew(): Promise<void> {
    await this.page.goto('/index.php?module=Accounts&action=EditView');
  }

  async fill(data: AccountFormData): Promise<void> {
    if (data.name !== undefined) await this.nameInput.fill(data.name);
    if (data.type !== undefined) await this.typeSelect.selectOption({ label: data.type });
    if (data.industry !== undefined) await this.industrySelect.selectOption({ label: data.industry });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  message(text: string): Locator {
    return this.page.getByText(text, { exact: true });
  }
}
