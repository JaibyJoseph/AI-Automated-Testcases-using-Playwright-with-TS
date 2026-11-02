@api @customers
Feature: Customer management
  As a bank employee using the API
  I want to create, read, replace and delete customer profiles
  So that customer records stay accurate

  Background:
    Given I have a valid access token

  @smoke @critical
  Scenario: Create a customer
    When I create a customer
    Then the response status should be 201
    And the customer should be active with an id starting with "CUST-"
    And the customer details should match what was sent

  @regression
  Scenario: Retrieve a customer by id
    Given a customer exists
    When I retrieve the customer
    Then the response status should be 200
    And the customer details should match what was sent

  @regression
  Scenario: Replace a customer profile
    Given a customer exists
    When I replace the customer with last name "Replaced", gender "M" and date of birth "1985-01-31"
    Then the response status should be 200
    And the customer details should match what was sent
    And retrieving the customer should return the replaced details

  @regression
  Scenario: Delete a customer
    Given a customer exists
    When I delete the customer
    Then the response status should be 204
    And the customer should no longer exist

  @regression @negative
  Scenario: Reject a customer without the required fields
    When I create a customer with an empty body
    Then the response status should be 400
    And the response error should be "Validation failed"
    And the response message should name the fields "firstName, lastName, dateOfBirth, gender"

  @regression @negative
  Scenario: Return not found for an unknown customer
    When I retrieve the customer with id "CUST-DOES-NOT-EXIST"
    Then the response status should be 404

  @regression
  Scenario: Keep customers isolated per access token
    Given a customer exists
    When another user lists customers with their own access token
    Then the customer should not be visible to the other user
