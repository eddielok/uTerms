# uTerms

uTerms is a comprehensive, enterprise-grade consent management and compliance platform. Built with React and TypeScript, it provides robust features for cookie consent management, policy generation, and compliance monitoring.

## 🚀 Key Features

- **Cookie Consent Management**: Generate, configure, and preview customizable cookie banners tailored to your website's scan results.
- **Cookie Logging & Monitoring**: Comprehensive cookie logging system (`visitor_consent_logs`) to store and monitor user consent data, complete with filtering and CSV export capabilities.
- **Compliance Checklist**: A dynamic dashboard to track the status of website scanning and cookie banner configurations, guiding users through the setup process.
- **Authentication**: Secure user sign-up and login powered by Supabase, including seamless Google Sign-Up integration.
- **Embeddable Script**: Provides a `uterms-embed.js` script to easily integrate the consent banner and consent logging onto any target website.
- **Enterprise Design**: A modern, feature-rich, and scalable interface.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend / Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth, Google Identity Services (GIS)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- A [Supabase](https://supabase.com/) project set up

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/eddielok/uterms.git
   cd uterms
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the frontend development server:

   ```sh
   npm run dev
   ```

5. Start the backend scan service (in a separate terminal):
   ```sh
   node server/index.js
   ```

## API Quick Check (curl)

Use a real user UUID when testing the banner endpoint.

```sh
# Health check
curl -i http://localhost:3001/

# Banner config check (replace with a real Supabase auth.users UUID)
curl -i http://localhost:3001/api/banner/<your-user-uuid>

# Example (invalid on purpose) to verify validation message
curl -i http://localhost:3001/api/banner/test
```

## 🧩 Embedding the Cookie Banner

To embed the uTerms cookie banner on your website, include the provided script in the `<head>` of your HTML document:

```html
<script src="https://your-domain.com/uterms-embed.js"></script>
```

This script will automatically inject the configured cookie banner and handle user consent logging via the `/api/consent` endpoint.
