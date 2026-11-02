@api @bank-accounts
Feature: Bank accounts
  As a bank employee using the API
  I want to open, rename and close customer accounts
  So that customers can hold money with us

  Background:
    Given I have a valid access token

  @smoke @critical
  Scenario: Open a savings account with an opening balance
    Given a customer exists
    When I open a "savings" account with an opening balance of 10000
    Then the response status should be 201
    And the account should belong to the customer with a balance of 10000
    And the customer should have exactly that account

  @regression
  Scenario: Rename an account
    Given a customer has an account with a balance of 10000
    When I rename the account to "Emergency Fund"
    Then the response status should be 200
    And the account nickname should be "Emergency Fund"
    And the account balance should be 10000

  @regression @negative
  Scenario: Reject an account for an unknown customer
    When I open a "savings" account for customer "CUST-DOES-NOT-EXIST"
    Then the response status should be 404

  @regression @negative
  Scenario: Refuse to close an account that still has a balance
    Given a customer has an account with a balance of 300
    When I close the account
    Then the response status should be 409
    And the response error should be "Account has balance"
    And the account balance should be 300

  @regression @negative
  Scenario: Refuse to delete a customer who still has accounts
    Given a customer has an account with a balance of 0
    When I delete the customer
    Then the response status should be 409
    And the response error should be "Customer has active accounts"
    And the customer should still exist

  @regression
  Scenario: Close an emptied account and then its customer
    Given a customer has an account with a balance of 300
    When I debit 300 from the account
    And I close the account
    And I delete the customer
    Then the account should no longer exist
    And the customer should no longer exist
