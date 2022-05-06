Feature: Create Partnered Deal Primary DAO stage

  # Background:
  #   Given I navigate to the "Partnered Deal" "Primary DAO" stage

  # Scenario: Primary DAO stage allows to add information about DAO and its representatives
  #   Then I can see Primary DAO section with inputs for collecting its details
  #   And I can see Primary DAO Representatives section

  # Scenario: Try to proceed from Primary DAO stage without filling the required fields
  #   And I try to proceed to next step
  #   Then I am presented with errors for DAO details fields

  # Scenario: Add Primary DAO avatar link
  #   Then I can add link to DAO avatar

  # Scenario: Add and remove social media fields in Primary DAO stage
  #   Then I can add up to 10 social media
  #   Then I can remove all social media

  # Scenario: Try to proceed from Primary DAO stage after filling the required DAO details fields
  #   When I fill in DAO details
  #   And I try to proceed to next step
  #   Then No errors for DAO details fields are visible

  # Scenario: Add and remove DAO representatives
  #   Then I can add up to 5 DAO representatives
  #   Then I can remove all but one DAO representative

  # Scenario: Try to proceed from Primary DAO stage without adding any representatives
  #   And I try to proceed to next step
  #   Then I am presented with error about missing representative address

  # Scenario: Try to proceed from Primary DAO stage after adding incorrect representative address
  #   When I add 2 incorrect representative addresses
  #   And I try to proceed to next step
  #   Then I am presented with errors about incorrect representative addresses

  Scenario: Getting error when trying to use the same name and address as the Partner DAO
    Given I navigate to the "Partnered Deal" "Partner DAO" stage
    And I want to fill in information for the "Partner DAO" section
    When I fill in the "DAO Name" field with "Dao name"
    When I fill in the "DAO Treasury Address" field with "0x0000000000000000000000000000000000000000"
    When I use the stepper to go to the "Primary DAO" step
    And I want to fill in information for the "Primary DAO" section
    When I fill in the "DAO Name" field with "Dao name"
    When I fill in the "DAO Treasury Address" field with "0x0000000000000000000000000000000000000000"
    And I try to proceed to next step
    Then I am presented with the "Name already used for the other DAO" error message for the "dao name" field
    And I am presented with the "Address already used for the other DAO" error message for the "dao treasury address" field
