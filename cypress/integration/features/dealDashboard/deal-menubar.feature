Feature: Partnered Deal - Description

  Scenario: Proposal lead can edit or cancel the deal
    Given I'm the Proposal Lead of an Open Proposal
    And I'm viewing a new public Open Proposal
    Then I can view the "Deal edit button"
    And I can view the "Deal cancel button"

  Scenario: User that is not the proposal lead cannot edit or cancel a deal
    And I'm viewing a new public Open Proposal
    Then I can't view the "Deal edit button"
    And I can't view the "Deal cancel button"

#  Scenario: Proposal lead can't edit or cancel a canceled deal
#    Given I'm the Proposal Lead of a Partnered Deal
#    And I'm viewing the Partnered Deal
#    And The deal is canceled
#    Then I can't view the "Deal edit button"
#    And I can't view the "Deal cancel button"
#
#  Scenario: Proposal lead can't edit or cancel an executed deal
#    Given I'm the Proposal Lead of a Partnered Deal
#    And I'm viewing the Partnered Deal
#    And The deal is executed
#    Then I can't view the "Deal edit button"
#    And I can't view the "Deal cancel button"
#
#  Scenario: Proposal lead can't edit or cancel a deal that is funding
#    Given I'm the Proposal Lead of a Partnered Deal
#    And I'm viewing the Partnered Deal
#    And The deal is funding
#    Then I can't view the "Deal edit button"
#    And I can't view the "Deal cancel button"
#
#  Scenario: Proposal lead can't edit or cancel a failed deal
#    Given I'm the Proposal Lead of a Partnered Deal
#    And I'm viewing the Partnered Deal
#    And The deal is failed
#    Then I can't view the "Deal edit button"
#    And I can't view the "Deal cancel button"
