import type { Locator, Page } from '@playwright/test';

export class AccountDetailPage {
  readonly actionsMenu: Locator;
  readonly deleteButton: Locator;
  readonly recordNotFound: Locator;

  constructor(private readonly page: Page) {
    this.actionsMenu = page.getByRole('link', { name: 'ACTIONS' });
    this.deleteButton = page.locator('#tab-actions').getByRole('button', { name: 'Delete' });
    this.recordNotFound = page.getByText(/Error retrieving record/);
  }

  // Query parameter order varies between navigations, so match both parts independently.
  readonly url = /^(?=.*module=Accounts)(?=.*action=DetailView).*/;

  heading(name: string): Locator {
    return this.page.getByRole('heading', { name, level: 2, exact: true });
  }

  /** Value cell for a SuiteCRM field, e.g. "name", "account_type", "industry". Works across detail-view tabs. */
  field(fieldName: string): Locator {
    return this.page.locator(`[field="${fieldName}"]`);
  }

  async open(recordId: string): Promise<void> {
    await this.page.goto(`/index.php?module=Accounts&action=DetailView&record=${encodeURIComponent(recordId)}`);
  }

  recordId(): string {
    const id = new URL(this.page.url()).searchParams.get('record');
    if (!id) throw new Error(`No record id in URL: ${this.page.url()}`);
    return id;
  }

  async delete(): Promise<void> {
    // Accept only the expected confirmation; anything else is dismissed so it surfaces as a failure.
    this.page.once('dialog', (dialog) => {
      const expected = dialog.message().includes('delete this record');
      void (expected ? dialog.accept() : dialog.dismiss());
    });
    await this.actionsMenu.click();
    await this.deleteButton.click();
    await this.page.waitForURL(/module=Accounts&action=ListView/);
  }

  /** Used by cleanup: deletes the record if it still exists. Returns true if it deleted something. */
  async deleteIfPresent(recordId: string): Promise<boolean> {
    await this.open(recordId);
    await this.actionsMenu.or(this.recordNotFound).first().waitFor();
    if (await this.recordNotFound.isVisible()) return false;
    await this.delete();
    return true;
  }
}
