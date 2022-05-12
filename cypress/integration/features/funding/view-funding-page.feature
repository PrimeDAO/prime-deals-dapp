Feature: Funding - View Page

    Scenario Outline: Viewing the funding page
        Given I'm a "<Role>" of the "<DaoType>"
        And I'm viewing a private Deal
        And I am able go to funding page
        And I can navigate to funding page
        Then I am on the funding page
        Examples:
            | Role | DaoType | 
            | Representative  | Primary DAO  | 
            | Representative  | Partner DAO  | 
            | Proposal Lead  | Partner DAO  | 
# Scenario: Viewing the funding page - Proposal Lead Non Representative
# Scenario: Viewing the funding page - Proposal Lead Representative of Primary Dao
# Scenario: Viewing the funding page - Proposal Lead Representative of Partner Dao
# Scenario: Viewing the funding page - Representative of Primary Dao

# Scenario: Viewing the funding page - Non Representative or Proposal Lead

# Given I'm a "Connected Public" user
# Then I should not be able to see Discussions
# ^ Note: Actually, should not be able to access deal dashboard at all, but for now at least have this test

# Scenario: Privacy - Private - Private comment not visible
