Feature: Editing Card
  Background:
    Given I navigate to the "editingCard" component

  Scenario: Switch to Edit mode
    When I "Save" the card
    Then the content of the card should be save
    And I get into the "Edit" mode

  Scenario: Switch to View mode
    Given I "Save" the card
    When I "Edit" the card
    Then I can edit the content of the card
    And I get into the "Save" mode

  Scenario: Deleting in Edit mode
    When I "Delete" the card
    Then the card should be deleted
