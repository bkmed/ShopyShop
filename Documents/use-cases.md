# Use Cases by Role – ShopyShop

## Overview

This document describes the main use cases for each user role in the **ShopyShop omnichannel e-commerce platform** (Web, Mobile, Back-Office).

Roles are designed to support **catalog management, ordering, stock control, customer experience, and platform administration**.

---

## 1. Admin (Platform Administrator)

### Primary Responsibilities

* Global platform administration
* Multi-store / multi-tenant management
* Configuration & integrations
* Analytics & monitoring
* Access & security management

### Use Cases

#### UC-A1: Store Onboarding

**Actor**: Admin
**Goal**: Create and configure a new store on the platform
**Steps**:

1. Navigate to Stores
2. Click "Add Store"
3. Enter store details (name, brand, locale, currency)
4. Configure tax, delivery zones, and payment methods
5. Assign initial Admin / Stock Manager
6. Activate store

---

#### UC-A2: Global Analytics Review

**Actor**: Admin
**Goal**: Monitor platform-wide performance
**Steps**:

1. Navigate to Analytics
2. Select "All Stores"
3. Review KPIs:

   * Orders volume
   * Revenue
   * Conversion rate
   * Stock alerts
4. Compare stores
5. Export executive reports

---

#### UC-A3: Global Notification Broadcast

**Actor**: Admin
**Goal**: Send platform-wide communication
**Steps**:

1. Navigate to Notifications
2. Click "Send Global Notification"
3. Define target (all users / all stores)
4. Compose message
5. Select priority (info / warning / critical)
6. Send or schedule

---

#### UC-A4: User & Role Management

**Actor**: Admin
**Goal**: Manage users and permissions
**Steps**:

1. Navigate to Users
2. Search or add user
3. Assign role (Admin / Stock Manager / User)
4. Attach user to store(s)
5. Update permissions
6. Save changes

---

#### UC-A5: Platform Configuration

**Actor**: Admin
**Goal**: Configure global platform settings
**Steps**:

1. Navigate to Settings
2. Configure:

   * Payment providers
   * Delivery providers
   * Taxes & currencies
   * Feature toggles
3. Save configuration

---

## 2. Gestionnaire de stock (Stock Manager)

### Primary Responsibilities

* Product & catalog management
* Stock control
* Order preparation
* Store-level reporting

### Use Cases

#### UC-S1: Product Management

**Actor**: Gestionnaire de stock
**Goal**: Create or update a product
**Steps**:

1. Navigate to Products
2. Click "Add / Edit Product"
3. Enter product details:

   * Name, description
   * Price & promotions
   * Category & tags
4. Upload images
5. Save product

---

#### UC-S2: Stock Update

**Actor**: Gestionnaire de stock
**Goal**: Adjust stock quantity
**Steps**:

1. Navigate to Stock
2. Select product
3. Update quantity
4. Define stock threshold
5. Save changes
6. System updates availability

---

#### UC-S3: Order Preparation

**Actor**: Gestionnaire de stock
**Goal**: Prepare customer orders
**Steps**:

1. Navigate to Orders
2. Filter by status "Paid"
3. Open order
4. Prepare items
5. Mark as "Ready for shipment"
6. Notify customer

---

#### UC-S4: Stock Analytics

**Actor**: Gestionnaire de stock
**Goal**: Monitor store inventory
**Steps**:

1. Navigate to Analytics → Stock
2. View:

   * Low stock alerts
   * Best sellers
   * Slow-moving products
3. Export report

---

## 3. User (Customer)

### Primary Responsibilities

* Browse catalog
* Place orders
* Manage account
* Track deliveries

### Use Cases

#### UC-U1: Browse & Search Products

**Actor**: User
**Goal**: Discover products
**Steps**:

1. Open catalog
2. Browse categories
3. Use search & filters
4. View product details

---

#### UC-U2: Place Order

**Actor**: User
**Goal**: Buy products
**Steps**:

1. Add product to cart
2. Review cart
3. Proceed to checkout
4. Select delivery & payment
5. Confirm order
6. Receive confirmation

---

#### UC-U3: Track Order

**Actor**: User
**Goal**: Follow order status
**Steps**:

1. Navigate to My Orders
2. Select order
3. View status (paid / shipped / delivered)
4. Track delivery

---

#### UC-U4: Manage Profile

**Actor**: User
**Goal**: Update personal data
**Steps**:

1. Navigate to Profile
2. Edit contact info
3. Manage addresses
4. Save changes

---

## 4. Anonyme (Guest)

### Primary Responsibilities

* Discover platform
* Browse products
* Convert to user

### Use Cases

#### UC-G1: Browse Catalog as Guest

**Actor**: Anonyme
**Goal**: Explore products without account
**Steps**:

1. Access store homepage
2. Browse categories
3. View product details

---

#### UC-G2: Account Creation

**Actor**: Anonyme
**Goal**: Create an account
**Steps**:

1. Click "Sign Up"
2. Enter email & password
3. Validate email
4. Account becomes User

---

## Summary Matrix

| Use Case Type       | Admin | Stock Manager | User | Anonyme |
| ------------------- | ----- | ------------- | ---- | ------- |
| Platform Management | ✅     | ❌             | ❌    | ❌       |
| Store Management    | ✅     | ✅             | ❌    | ❌       |
| Product Management  | ✅     | ✅             | ❌    | ❌       |
| Stock Management    | ❌     | ✅             | ❌    | ❌       |
| Orders Processing   | ❌     | ✅             | ❌    | ❌       |
| Ordering            | ❌     | ❌             | ✅    | ❌       |
| Profile Management  | ❌     | ❌             | ✅    | ❌       |
| Analytics           | ✅     | ✅             | ❌    | ❌       |
| Browsing Catalog    | ❌     | ❌             | ✅    | ✅       |

---

*Last Updated: 2026-01-30*
