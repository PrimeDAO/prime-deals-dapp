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

    @focus
    Scenario: User can successfully change Metamask accounts
        Given I'm not connected to a wallet
        And I connect to the wallet with address "0xE834627cDE2dC8F55Fe4a26741D3e91527A8a498"
        And I Wait for the modal with the message "Thank you for your patience while we initialize for a few moments..." to disappear
        And I change the address to "0xd1F29D0e34c7A9D54f607733e5A113493c58F1Cb"
        And I Wait for the modal with the message "Thank you for your patience while we initialize for a few moments..." to disappear
        Then The modal with the message "Thank you for your patience while we initialize for a few moments..." is hidden
        And I'm connected to my wallet with address "0xd1F2...F1Cb"
