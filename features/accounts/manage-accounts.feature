@accounts
Feature: Account management
  As a sales user
  I want to create and remove company accounts
  So that the CRM reflects the organisations we work with

  Background:
    Given the user is signed in

  @smoke @critical
  Scenario: Create an account with only the required name
    When the user creates an account named "Acme Logistics"
    Then the account detail page should show the account name

  @regression
  Scenario Outline: Create an account with a type and industry
    When the user creates an account named "<company>" with type "<type>" and industry "<industry>"
    Then the account detail page should show the account name
    And the account should have type "<type>" and industry "<industry>"

    # title-format: Example #<_index_>: <company> (<type>, <industry>)
    Examples:
      | company          | type     | industry   |
      | Northwind Bank   | Customer | Banking    |
      | Contoso Partners | Partner  | Technology |
      | Fabrikam Media   | Press    | Media      |

  @regression @negative
  Scenario: An account cannot be saved without a name
    Given the user is on the new account form
    When the user saves the account form without a name
    Then the validation message "Missing required field: Name" should be shown
    And the account should not be saved

  @regression
  Scenario: Delete an account
    Given an account named "Short Lived Ltd" exists
    When the user deletes the account
    Then the account should no longer be available
