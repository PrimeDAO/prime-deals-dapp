import { Then, When } from "@badeball/cypress-cucumber-preprocessor/methods";

Then('I am presented with errors for DAO details fields', () => {
  cy.get('[data-test="dao-name-field"] .errorMessage').should('have.text', 'Required Input');
  cy.get('[data-test="dao-treasury-field"] .errorMessage').should('have.text', 'Required Input');
  cy.get('[data-test="dao-avatar-url-field"] .errorMessage').should('have.text', 'Required Input');
})

Then('I can add link to DAO avatar', () => {
  cy.get('[data-test="dao-avatar-section"]').within(() => {
    const avatarUrl = 'https://assets.website-files.com/608bd350d67fe62ab7818c74/6138bc3d43a38d248fae12ce_Prime%20Network%20_%20Simplified.png';
    cy.get('[data-test="dao-avatar-url-field"]').within(() => {
      cy.get('input').type(avatarUrl)
    })

    cy.get('[data-test="dao-avatar"]').should('have.attr', 'src', avatarUrl)
  })
})

Then('I can add up to 5 social media', () => {
  cy.get('[data-test="dao-social-media-list"]').within(() => {
    cy.get('[data-test="dao-social-media-item"]').should(($socialMedias) => {
      expect($socialMedias).to.have.length(1);
    });
    cy.get('[data-test="add-social-media"]').click();
    cy.get('[data-test="dao-social-media-item"]').should(($socialMedias) => {
      expect($socialMedias).to.have.length(2);
    });
    cy.get('[data-test="add-social-media"]').click();
    cy.get('[data-test="dao-social-media-item"]').should(($socialMedias) => {
      expect($socialMedias).to.have.length(3);
    });
    cy.get('[data-test="add-social-media"]').click();
    cy.get('[data-test="dao-social-media-item"]').should(($socialMedias) => {
      expect($socialMedias).to.have.length(4);
    });
    cy.get('[data-test="add-social-media"]').click();
    cy.get('[data-test="dao-social-media-item"]').should(($socialMedias) => {
      expect($socialMedias).to.have.length(5);
    });
    cy.get('[data-test="add-social-media"]').should('not.exist')
  });
})

Then('I can remove all social media', () => {
  cy.get('[data-test="dao-social-media-item"]').should(($socialMedias) => {
    expect($socialMedias).to.have.length(5);
  });
  cy.get('[data-test="remove-social-media"]').last().click();
  cy.get('[data-test="remove-social-media"]').last().click();
  cy.get('[data-test="remove-social-media"]').last().click();
  cy.get('[data-test="remove-social-media"]').last().click();
  cy.get('[data-test="remove-social-media"]').last().click();
  cy.get('[data-test="remove-social-media"]').should('not.exist')
})

When('I fill in DAO details', () => {
  cy.get('[data-test="dao-name-field"] input').type('Dao name')
  cy.get('[data-test="dao-treasury-field"] input').type('0xc0ffee254729296a45a3885639AC7E10F9d54979')
  cy.get('[data-test="dao-avatar-url-field"] input').type('https://example.com/image.png')
})

Then('No errors for DAO details fields are visible', () => {
  cy.get('[data-test="dao-name-field"] .errorMessage').should('not.exist')
  cy.get('[data-test="dao-treasury-field"] .errorMessage').should('not.exist')
  cy.get('[data-test="dao-avatar-url-field"] .errorMessage').should('not.exist')
})

Then('I can add up to 5 DAO representatives', () => {
  cy.get('[data-test="dao-representatives-section"]').within(() => {
    cy.get('[data-test="dao-representative"]').should(($representatives) => {
      expect($representatives).to.have.length(1);
    });
    cy.get('[data-test="add-dao-representative"]').click();
    cy.get('[data-test="dao-representative"]').should(($representatives) => {
      expect($representatives).to.have.length(2);
    });
    cy.get('[data-test="add-dao-representative"]').click();
    cy.get('[data-test="dao-representative"]').should(($representatives) => {
      expect($representatives).to.have.length(3);
    });
    cy.get('[data-test="add-dao-representative"]').click();
    cy.get('[data-test="dao-representative"]').should(($representatives) => {
      expect($representatives).to.have.length(4);
    });
    cy.get('[data-test="add-dao-representative"]').click();
    cy.get('[data-test="dao-representative"]').should(($representatives) => {
      expect($representatives).to.have.length(5);
    });
    cy.get('[data-test="add-dao-representative"]').should('not.exist')
  });
})

Then('I can remove all but one DAO representative', () => {
  cy.get('[data-test="dao-representative"]').should(($representatives) => {
    expect($representatives).to.have.length(5);
  });
  cy.get('[data-test="remove-dao-representative"]').last().click();
  cy.get('[data-test="remove-dao-representative"]').last().click();
  cy.get('[data-test="remove-dao-representative"]').last().click();
  cy.get('[data-test="remove-dao-representative"]').last().click();
  cy.get('[data-test="remove-dao-representative"]').should('not.exist')
})

Then('I am presented with error about missing representative address', () => {
  cy.get('[data-test="dao-representative"] pform-input').within(() => {
    cy.get('.errorMessage').should('have.text', 'Required Input')
  })
})

When('I add 2 incorrect representative addresses', () => {
  cy.get('[data-test="add-dao-representative"]').click();
  cy.get('[data-test="dao-representative"] pform-input input').each(($el) => {
    cy.wrap($el).type('incorrect address')
  })
})

Then('I am presented with errors about incorrect representative addresses', () => {
  cy.get('[data-test="dao-representative"] pform-input .errorMessage').each(($el) => {
    cy.wrap($el).should('have.text', 'Please enter a valid wallet address')
  })
})