Feature: Partnered Deal - Description - Mobile
  Background:
    Given I'm in the mobile view
    Given I'm viewing the Partnered Deal Dashboard

  Scenario: Partnered Deal - Mobile read more
    When the description text is long
    Then I can expand the text to read more