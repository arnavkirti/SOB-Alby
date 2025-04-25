# Lightning WebLN Demo

![Lightning Network](https://img.shields.io/badge/Lightning%20Network-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A React-based demonstration application for interacting with the Bitcoin Lightning Network using the WebLN standard. This project showcases how web applications can integrate with Lightning Network wallets to enable Bitcoin payments.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [Technologies Used](#-technologies-used)
- [Development](#-development)
- [Acknowledgments](#-acknowledgments)

## 🔍 Overview

This application demonstrates how to integrate WebLN functionality into a web application, allowing users to interact with Lightning Network wallets like Alby directly from the browser. The demo showcases various Lightning Network operations including:

- Connecting to a WebLN provider
- Retrieving node information and balance
- Generating Lightning invoices
- Sending Lightning payments
- Making keysend payments
- Implementing auto-payments on scroll events
- QR code scanning for invoices

## ⚡ Features

### WebLN Connection

The application automatically attempts to connect to a WebLN provider when loaded. If no provider is found, it prompts the user to install one.

### Node Information

Users can retrieve information about their Lightning node, including alias and public key.

### Balance Checking

Check your Lightning wallet balance directly from the application.

### Invoice Generation

Generate Lightning invoices with customizable amounts. The application displays both the invoice string and a QR code for easy payment.

### Payment Sending

Send payments using Lightning invoices or LNURL. The application supports both regular and asynchronous payment methods.

### Keysend Payments

Send keysend payments directly to node public keys with custom records.

### Auto-payment on Scroll

Experimental feature that sends micro-payments (1 sat) when scrolling the page, demonstrating how web applications can implement novel payment models.

### QR Code Scanner

Scan Lightning invoice QR codes using your device's camera for quick payments.

### Dark Mode Support

Toggle between light and dark themes with automatic system preference detection and local storage of user preferences.

## 🔧 Prerequisites

- A WebLN-compatible wallet extension (like [Alby](https://getalby.com/))
- Node.js and npm installed

## 📥 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SOB-Alby.git
cd SOB-Alby/lightning-webln-demo
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the local development server (typically http://localhost:5173)

## 🚀 Usage

1. **Connect your WebLN wallet**: When you first load the application, it will attempt to connect to your WebLN provider. If you don't have one installed, you'll be prompted to install Alby or another compatible wallet.

2. **Explore WebLN methods**: Use the buttons in the WebLN Methods section to test different Lightning Network operations:
   - Get node information
   - Check your balance
   - Generate invoices
   - Send payments
   - Make keysend payments

3. **Generate an invoice**: Enter an amount in sats and click "Generate Invoice" to create a Lightning invoice. The invoice will be displayed as text and as a QR code.

4. **Pay an invoice**: Paste a Lightning invoice into the text area and click "Send Payment" to pay it. You can also scan a QR code by clicking "Scan QR Code".

5. **Send a keysend payment**: Enter a node pubkey and amount, then click "Keysend" to send a direct payment.

6. **Try auto-payments**: Enable the auto-payment feature to send 1 sat each time you scroll the page (experimental).

## 💻 Technologies Used

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [WebLN](https://webln.dev/) - Lightning Network browser integration
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [QRCode.react](https://www.npmjs.com/package/qrcode.react) - QR code generation
- [React QR Reader](https://www.npmjs.com/package/react-qr-reader) - QR code scanning

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure

- `/src` - Source code
  - `App.jsx` - Main application component with WebLN integration
  - `main.jsx` - Application entry point
  - `index.css` - Tailwind CSS imports
- `/public` - Static assets

## 🙏 Acknowledgments

- [WebLN Standard](https://webln.dev/)
- [Alby](https://getalby.com/) - WebLN provider
- [Bitcoin Lightning Network](https://lightning.network/)

---

Made with ⚡ by Arnav Kirti

        