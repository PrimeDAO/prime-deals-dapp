Feature: Landing page
    Background:
        Given I navigate to the Deals home page

    Scenario: All Deals
        Given I navigate to the All Deals page

    @focus
    Scenario: Initiate a Deal
        Given I choose Deal Type

    Scenario: Open Deals
        Given I Open Deals

    Scenario: Running Deals
        Given I want to see Running Deals


# 1. **User** can navigate to All Deals Page by clicking All Deals.
# 2. **User** can navigate to Choose Deal Type Page by clicking Initiate a deal.
# 3. **User** can review Open and Running Deals. Deals are sorted by their End Date.
# TODO 4. User can click on the deal card to navigate to that deal.
# 5. User can click View All Deals Link to navigate to All Deals Page.
# 6. **User** can click Play Button to watch the tutorial.

#     Aside from the mock below:

#     - [x]  -"Partner" Button for Open Deals is replaced with "View"