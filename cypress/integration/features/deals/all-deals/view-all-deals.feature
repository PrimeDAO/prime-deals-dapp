Feature: View All Deals
    Background:
        Given I go to the All Deals page

    Scenario: View all deals page
        Then I can see Initiate A Deal button
        And I can see Open Proposals tab
        And I can see Partnered Deals tab
        And I can see Open Proposals Carousel
        And I can see All Deals grid

    Scenario: View partnered deals
        When I select Partnered Deals tab
        Then I can see Partnered Deals
