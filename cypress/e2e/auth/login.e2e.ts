/// <reference types="cypress" />
describe('Authentication - Login', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login form', () => {
    cy.contains('Welcome Back');
    cy.get('input[placeholder="Enter your email"]').should('be.visible');
    cy.get('input[placeholder="Enter your password"]').should('be.visible');
    cy.contains('button', 'Sign In').should('be.visible');
  });

  it('should show validation errors when submitting empty form', () => {
    cy.contains('button', 'Sign In').click();
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.contains('Sign Up').click();
    cy.contains('Create Account').should('be.visible');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('input[placeholder="Enter your email"]').type('invalid@demo.com');
    cy.get('input[placeholder="Enter your password"]').type('wrongpassword');
    cy.contains('button', 'Sign In').click();
    // Assuming alert or toast is shown with login failed message
    cy.contains('Login failed').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[placeholder="Enter your email"]').type('user@demo.com');
    cy.get('input[placeholder="Enter your password"]').type('user123');
    cy.contains('button', 'Sign In').click();

    // Verify redirection to home/catalog
    cy.contains('Featured Products').should('be.visible');
  });
});
