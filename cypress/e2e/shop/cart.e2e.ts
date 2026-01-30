/// <reference types="cypress" />

describe('Shopping - Cart', () => {
  beforeEach(() => {
    cy.visit('/cart');
  });

  it('should display the cart title', () => {
    cy.contains('Cart').should('be.visible');
  });

  it('should display empty cart message when no items added', () => {
    cy.contains('Your cart is empty').should('be.visible');
    cy.contains('🛒').should('be.visible');
  });

  it('should navigate to catalog when clicking Shop Now', () => {
    cy.contains('Shop Now').click();
    cy.url().should('include', '/catalog');
    cy.contains('Catalog').should('be.visible');
  });
});
