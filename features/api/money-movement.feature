@api @money-movement
Feature: Transactions and transfers
  As a bank employee using the API
  I want to credit, debit and transfer money
  So that balances always reflect what customers own

  Background:
    Given I have a valid access token

  @smoke @critical
  Scenario: Credits and debits update the balance and history
    Given a customer has an account with a balance of 10000
    When I credit 2500 to the account with reference "Salary"
    And I debit 1000 from the account with reference "Rent"
    Then the account balance should be 11500
    And the transaction history should contain a credit of 2500 and a debit of 1000

  @regression @negative
  Scenario: Reject a debit larger than the balance
    Given a customer has an account with a balance of 500
    When I debit 501 from the account
    Then the response status should be 422
    And the account balance should be 500

  @regression @negative
  Scenario Outline: Reject a non-positive amount
    Given a customer has an account with a balance of 500
    When I credit <amount> to the account
    Then the response status should be 400
    And the account balance should be 500

    # title-format: Amount of <amount>
    Examples:
      | amount |
      | 0      |
      | -100   |

  @smoke @critical
  Scenario: Move funds between two accounts
    Given a customer has an account "A" with a balance of 5000
    And a customer has an account "B" with a balance of 1000
    When I transfer 1500 from account "A" to account "B"
    Then the response status should be 201
    And account "A" should have a balance of 3500
    And account "B" should have a balance of 2500

  @regression @negative
  Scenario: Reject a transfer with insufficient funds
    Given a customer has an account "A" with a balance of 100
    And a customer has an account "B" with a balance of 0
    When I transfer 101 from account "A" to account "B"
    Then the response status should be 422
    And account "A" should have a balance of 100
    And account "B" should have a balance of 0

  @regression @negative
  Scenario: Reject a transfer to the same account
    Given a customer has an account "A" with a balance of 1000
    When I transfer 100 from account "A" to account "A"
    Then the response status should be 400
    And account "A" should have a balance of 1000
