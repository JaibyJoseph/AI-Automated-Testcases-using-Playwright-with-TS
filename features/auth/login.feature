@auth
Feature: User login
  As a SuiteCRM user
  I want to log in with my credentials
  So that only authorised people can access CRM data

  Background:
    Given the user is on the login page

  @smoke @critical
  Scenario: Successful login with valid credentials
    When the user logs in with valid credentials
    Then the user should see the home page

  @regression @negative
  Scenario: Login is rejected for an unknown user
    When the user logs in with username "pwauto-no-such-user" and password "not-a-real-password"
    Then the login error "You must specify a valid username and password." should be shown
    And the user should remain on the login page
