Feature: Partnered Deal - Description

  Scenario: Proposal lead can edit or cancel an open proposal
    Given I'm the Proposal Lead of a new Open Proposal
    And I'm viewing that deal
    Then I can view the "Deal edit button"
    And I can view the "Deal cancel button"

  Scenario: Proposal lead can edit or cancel a partnered deal
    Given I'm the Proposal Lead of a new Partnered Deal
    And I'm viewing that deal
    Then I can view the "Deal edit button"
    And I can view the "Deal cancel button"

  Scenario: User that is not the proposal lead cannot edit or cancel a deal
    Given I'm an "Anonymous" user
    And I'm viewing an Open Proposal
    Then I can't view the "Deal edit button"
    And I can't view the "Deal cancel button"

  Scenario: Proposal lead can't edit or cancel a canceled deal
    Given I'm the Proposal Lead of a new Partnered Deal
    And I'm viewing that deal
    And I cancel the deal
    Then I can't view the "Deal edit button"
    And I can't view the "Deal cancel button"

  Scenario: Proposal lead can't edit or cancel a deal that is funding
    Given I'm the Proposal Lead of the funding Partnered deal
    Then I can't view the "Deal edit button"
    And I can't view the "Deal cancel button"

  Scenario: Proposal lead can't edit or cancel a failed deal
    Given I'm the Proposal Lead of the failed Partnered deal
    Then I can't view the "Deal edit button"
    And I can't view the "Deal cancel button"
