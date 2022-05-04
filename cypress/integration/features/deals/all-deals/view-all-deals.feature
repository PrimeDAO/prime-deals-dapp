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
        And I connect to the wallet with address "0x0F73E89617FEDee6cCaB07d1d842FF8a5A1f08CC"
        And I Wait for the modal with the message "Thank you for your patience while we initialize for a few moments..." to disappear
        And I change the address to "0x15f23CF16Ee88B87019C716eDbFD920B54244a8f"
        And I Wait for the modal with the message "Thank you for your patience while we initialize for a few moments..." to disappear
        Then The modal with the message "Thank you for your patience while we initialize for a few moments..." is hidden
        And I'm connected to my wallet with address "0x15f2...4a8f"
