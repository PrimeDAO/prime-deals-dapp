Feature: Discussions - Single Comment - Public View
  Scenario Outline: Single comments - Actions - Don't show actions
    Given I'm a "<UserType>" user
    And the Open Proposal has Discussions with replies
    And I'm viewing the Open Proposal

    And I choose a single Topic with replies
    Then I should not see the Comment actions

    Examples:
      | UserType         |
      | Anonymous        |
      | Connected Public |
