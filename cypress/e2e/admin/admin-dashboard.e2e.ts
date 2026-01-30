/// <reference types="cypress" />
describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Mock authentication as admin
    cy.window().then(win => {
      win.localStorage.setItem('isAuthenticated', 'true');
      win.localStorage.setItem('userRole', 'admin');
    });

    // Mock API responses for dashboard data
    cy.intercept('GET', '**/analytics/overview*', {
      body: {
        totalRevenue: 12500.5,
        totalOrders: 450,
        averageOrderValue: 27.78,
        activeProducts: 120,
      },
    }).as('getOverview');

    cy.intercept('GET', '**/orders/recent*', {
      body: [
        {
          id: 'ord123',
          customerName: 'John Doe',
          total: 150.0,
          status: 'pending',
          date: '2023-10-27T10:30:00.000Z',
        },
        {
          id: 'ord124',
          customerName: 'Jane Smith',
          total: 85.5,
          status: 'shipped',
          date: '2023-10-27T09:15:00.000Z',
        },
      ],
    }).as('getRecentOrders');

    cy.visit('/admin/dashboard');
    cy.wait(['@getOverview', '@getRecentOrders']);
  });

  it('should display welcome message and dashboard title', () => {
    cy.contains('Welcome').should('be.visible');
    cy.contains('Sales Overview').should('be.visible');
  });

  it('should display stat cards with correct metrics', () => {
    cy.contains('Total Revenue')
      .parent()
      .contains('$12,500.50')
      .should('be.visible');
    cy.contains('Total Orders').parent().contains('450').should('be.visible');
    cy.contains('Active Products')
      .parent()
      .contains('120')
      .should('be.visible');
  });

  it('should display quick actions', () => {
    cy.contains('Quick Actions').should('be.visible');
    cy.contains('Add Product').should('be.visible');
    cy.contains('Manage Inventory').should('be.visible');
    cy.contains('View Reports').should('be.visible');
  });

  it('should display recent orders', () => {
    cy.contains('Recent Orders').should('be.visible');
    cy.contains('John Doe').should('be.visible');
    cy.contains('Jane Smith').should('be.visible');
    cy.get('.badge').contains('Pending').should('be.visible');
    cy.get('.badge').contains('Shipped').should('be.visible');
  });

  it('should navigate to products page when clicking on Active Products', () => {
    cy.contains('Active Products').click();
    cy.url().should('include', '/admin/products');
  });

  it('should navigate to orders page when clicking on Total Orders', () => {
    cy.contains('Total Orders').click();
    cy.url().should('include', '/admin/orders');
  });

  it('should navigate to add product page when clicking on Add Product', () => {
    cy.contains('Add Product').click();
    cy.url().should('include', '/admin/products/new');
  });
});
