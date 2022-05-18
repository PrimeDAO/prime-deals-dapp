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
            | Proposal Lead  | Primary DAO  | 
            | Proposal Lead  | Partner DAO  | 
            | Proposal Lead  | Neither DAO  | 
            
    Scenario Outline: Viewing the funding page as a representative of the primary DAO with the deal funding
        Given I'm a Representative of the Primary Dao
        And I'm viewing a private Deal
        And I am able go to funding page
        And I can navigate to funding page
        And I am on the funding page
        Then I am able to see my dao deposit grid
        Then I am able to see the deposit form
        Then I am able to see the token swap status section
        Then I am able to see the deposits section

    Scenario Outline: Viewing the funding page as a representative of the partner DAO with the deal funding
        Given I'm a Representative of the Partner Dao
        And I'm viewing a private Deal
        And I am able go to funding page
        And I can navigate to funding page
        And I am on the funding page
        Then I am able to see my dao deposit grid
        Then I am able to see the deposit form
        Then I am able to see the token swap status section
        Then I am able to see the deposits section
    
    Scenario Outline: Viewing the funding page as a proposal lead and representative of the primary DAO with the deal funding
        Given I'm a Proposal Lead and Representative of the Primary Dao
        And I'm viewing a private Deal
        And I am able go to funding page
        And I can navigate to funding page
        And I am on the funding page
        Then I am able to see my dao deposit grid
        Then I am able to see the deposit form
        Then I am able to see the token swap status section
        Then I am able to see the deposits section

    Scenario Outline: Viewing the funding page as a proposal lead and representative of the primary DAO with the deal funding
        Given I'm a Proposal Lead and Representative of the Partner Dao
        And I'm viewing a private Deal
        And I am able go to funding page
        And I can navigate to funding page
        And I am on the funding page
        Then I am able to see both dao deposit grids
        Then I am able to see the deposit form
        Then I am able to see the token swap status section
        Then I am able to see the deposits section
    
    Scenario Outline: Viewing the funding page as a proposal lead and representative of the primary DAO with the deal funding
        Given I'm a Proposal Lead and Representative of neither Dao
        And I'm viewing a private Deal
        And I am able go to funding page
        And I can navigate to funding page
        And I am on the funding page
        Then I am able to see both dao deposit grids
        Then I am not able to see the deposit form
        Then I am able to see the token swap status section
        Then I am able to see the deposits section


    # Scenario Outline: Viewing the funding page for cancelled deal
    #     Given I'm a "<Role>" of the "<DaoType>"
    #     And I'm viewing a private Deal
    #     And I am able go to funding page
    #     And I can navigate to funding page
    #     Then I am on the funding page
    #     Examples:
    #         | Role | DaoType | 
    #         | Representative  | Primary DAO  | 
    #         | Representative  | Partner DAO  | 
    #         | Proposal Lead  | Primary DAO  | 
    #         | Proposal Lead  | Partner DAO  | 
    #         | Proposal Lead  | Neither DAO  | 

    # Scenario Outline: Viewing the funding page failed deal
    #     Given I'm a "<Role>" of the "<DaoType>"
    #     And I'm viewing a private Deal
    #     And I am able go to funding page
    #     And I can navigate to funding page
    #     Then I am on the funding page
    #     Examples:
    #         | Role | DaoType | 
    #         | Representative  | Primary DAO  | 
    #         | Representative  | Partner DAO  | 
    #         | Proposal Lead  | Primary DAO  | 
    #         | Proposal Lead  | Partner DAO  | 
    #         | Proposal Lead  | Neither DAO  | 
    
    # Scenario Outline: Viewing the funding page claiming deal
    #     Given I'm a "<Role>" of the "<DaoType>"
    #     And I'm viewing a private Deal
    #     And I am able go to funding page
    #     And I can navigate to funding page
    #     Then I am on the funding page
    #     Examples:
    #         | Role | DaoType | 
    #         | Representative  | Primary DAO  | 
    #         | Representative  | Partner DAO  | 
    #         | Proposal Lead  | Primary DAO  | 
    #         | Proposal Lead  | Partner DAO  | 
    #         | Proposal Lead  | Neither DAO  | 


# Scenario: Viewing the funding page - Proposal Lead Non Representative
# Scenario: Viewing the funding page - Proposal Lead Representative of Primary Dao
# Scenario: Viewing the funding page - Proposal Lead Representative of Partner Dao
# Scenario: Viewing the funding page - Representative of Primary Dao

# Scenario: Viewing the funding page - Non Representative or Proposal Lead

# Given I'm a "Connected Public" user
# Then I should not be able to see Discussions
# ^ Note: Actually, should not be able to access deal dashboard at all, but for now at least have this test

# Scenario: Privacy - Private - Private comment not visible
