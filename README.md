# ShopyShop 🛍️

A premium, comprehensive ecommerce platform built with **React Native Web**. This project provides a seamless shopping experience across Web, iOS, and Android from a single codebase.

## 🌟 Key Features

### 🛒 Core E commerce Modules

- **Product Catalog**: Browse, search, and filter products with advanced filtering and sorting.
- **Shopping Cart**: Add products, manage quantities, and proceed to secure checkout.
- **Order Management**: Track orders, view history, manage returns and refunds.
- **Stock Management**: Real-time inventory tracking for stock managers and admins.
- **Multi-Currency**: Support for global commerce with currency conversion.

### 🤖 Intelligent Features

- **AI Shopping Assistant**: Integrated chatbot to help customers find products, track orders, and navigate the store.
- **Analytics Dashboard**: Real-time visualization of sales metrics, conversion rates, and customer trends.

### 🎨 Premium UI/UX

- **Dark Mode Support**: System-wide dark mode with carefully curated color palettes.
- **Modern Themes**: Ecommerce-optimized themes with vibrant blues, greens, and oranges.
- **Responsive Design**: Adaptive navigation tailored for all screen sizes.

### 🌍 Global Ready

- **Multilingual**: Native support for English, French, Arabic (RTL), German, Spanish, Chinese, and Hindi.
- **i18n Integration**: Dynamic language switching without reload.

---

## Documentation

- [Pages and Roles](Documents/pages-and-roles.md): Detailed access control matrix.
- [Use Cases](Documents/use-cases.md): Common user scenarios and workflows.
- [Commercial Overview](Documents/Comercial.md): Product features and value proposition.

## 🛠 Tech Stack

- **Framework**: [React Native Web](https://necolas.github.io/react-native-web/) for cross-platform excellence.
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with persistent storage.
- **Navigation**: [React Navigation 7](https://reactnavigation.org/) with deep linking.
- **Service Layer**: [Firebase](https://firebase.google.com/) for notifications, analytics, and authentication.
- **Persistence**: [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) for high-performance storage.
- **Styling**: Vanilla CSS, NativeWind, and a dedicated theme system.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- React Native environment (for mobile builds)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ShopyShop.git
   cd ShopyShop
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start Development:

   ```bash
   # Web (Dev Server with Hot Reload)
   npm run start-web-dev-nossr

   # Mobile (Metro Bundler)
   npm start
   ```

---

## 🏗 Project Structure

- `src/components/`: Reusable UI components (Modals, Dropdowns, Cards).
- `src/screens/`: Feature-specific screens (Catalog, Cart, Checkout, Orders).
- `src/store/`: Redux slices and store configuration.
- `src/database/`: Local database services and persistence logic.
- `src/theme/`: Theme definitions (Light, Dark, Premium).
- `src/i18n/`: Translation files and localization setup.

---

## 🧪 Development & Testing

### E2E Testing with Cypress
The project includes a comprehensive set of E2E tests for authentication, admin dashboard, and shopping flows.

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run all tests headlessly
npm run cypress:run
```

### 👤 Demo Accounts
To explore the platform with different roles, use the following demo credentials (automatically seeded):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@demo.com` | `admin123` |
| **Stock Manager** | `stock@demo.com` | `stock123` |
| **User (Customer)** | `user@demo.com` | `user123` |

### 🛠 Other Commands
```bash
# Linting
npm run lint

# Formatting (Prettier)
npm run format
```

---

## 📄 License

This project is licensed under the MIT License.
