@api @tokens
Feature: Access tokens
  As a consumer of the banking API
  I want to obtain a Bearer token
  So that I can call the protected banking endpoints

  @smoke @critical
  Scenario: Issue a token with the requested lifetime
    When I request an access token valid for 1800 seconds
    Then the response status should be 201
    And the response should contain a Bearer token valid for 30 minutes

  @regression @negative
  Scenario Outline: Reject an unsupported token lifetime
    When I request an access token valid for <seconds> seconds
    Then the response status should be 400
    And the response error should be "Invalid expires_in"
    And the allowed token lifetimes should be 900, 1800, 2700 and 3600 seconds

    # title-format: Lifetime of <seconds> seconds
    Examples:
      | seconds |
      | 60      |
      | 7200    |

  @smoke @negative
  Scenario: Reject a request without a token
    When I list customers without an access token
    Then the response status should be 401
    And the response error should be "Unauthorized"

  # Known defect (observed 2026-11-02): the API issues a token for a wrong password.
  # @fail marks this scenario as an expected failure. Once the API is fixed, Playwright reports
  # "expected to fail but passed"; then remove @fail and @known-defect.
  @regression @negative @known-defect @fail
  Scenario: Reject a token request with a wrong password
    When I request an access token with a wrong password
    Then the response status should be 401
