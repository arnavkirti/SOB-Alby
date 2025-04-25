# Lightning WebLN Demo

A React-based demonstration application for interacting with the Bitcoin Lightning Network using the WebLN standard.

## Overview

This application demonstrates how to integrate WebLN functionality into a web application, allowing users to interact with Lightning Network wallets like Alby directly from the browser. The demo showcases various Lightning Network operations including:

- Connecting to a WebLN provider
- Retrieving node information
- Generating Lightning invoices
- Sending Lightning payments
- Making keysend payments
- Implementing auto-payments on scroll events

## Prerequisites

- A WebLN-compatible wallet extension (like [Alby](https://getalby.com/))
- Node.js and npm installed

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lightning-webln-demo.git
cd lightning-webln-demo
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

## Features

### WebLN Connection
The application automatically attempts to connect to a WebLN provider when loaded. If no provider is found, it prompts the user to install one.

### Node Information
Users can retrieve information about their Lightning node, including alias and public key.

### Invoice Generation
Generate Lightning invoices with customizable amounts.

### Payment Sending
Send payments using Lightning invoices or LNURL.

### Keysend Payments
Send keysend payments directly to node public keys with custom records.

### Auto-payment on Scroll
Experimental feature that sends micro-payments (1 sat) when scrolling the page.

## Technologies Used

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [WebLN](https://webln.dev/) - Lightning Network browser integration
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Acknowledgments

- [WebLN Standard](https://webln.dev/)
- [Alby](https://getalby.com/) - WebLN provider
- [Bitcoin Lightning Network](https://lightning.network/)

        