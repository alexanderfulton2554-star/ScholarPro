# ScholarPro

A full-stack academic-support marketplace starter built with React + Vite, Node.js + Express and PostgreSQL-ready architecture.

## Requirements
- Node.js LTS
- PostgreSQL
- VS Code
- Git

## Run
1. Open this folder in VS Code.
2. In the terminal:
   npm install
   npm run install:all
3. Copy `server/.env.example` to `server/.env`.
4. Set DATABASE_URL and JWT_SECRET.
5. Create the database and run `database/schema.sql`.
6. Start:
   npm run dev

Frontend: http://localhost:5173
API: http://localhost:4000

## Demo mode
The application runs without PostgreSQL in demo mode if DATABASE_URL is not configured. Demo data is stored in memory and is intended only for UI/testing. Configure PostgreSQL before production use.

## Payment
ZetuPay is configured as a server-side payment boundary. Add real ZetuPay credentials and webhook verification before production. Never expose the secret key in the browser or commit it to version control.

## Wallet rule
A verified KSh 300 registration payment creates KSh 300 non-withdrawable platform credit. Withdrawals use only `withdrawable_balance`, which is never populated from registration credit.
