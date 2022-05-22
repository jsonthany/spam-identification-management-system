/// <reference types="cypress" />

describe('Smoke test', () => {
  it('renders top-level app component', () => {
    cy.visit('http://localhost:3000/');
    cy.get('.app-container').should('exist');
  });
});
