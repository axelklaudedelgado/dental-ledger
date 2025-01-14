# Dental Ledger App

## Project Overview
This is a **solo project** being developed for a client, who is a **relative of someone I know**. The purpose of the app is to provide a **simple and efficient ledger system** to help track client balances, payments, and transactions. Due to the sensitive nature of the information it handles, the app is designed to run **locally** to ensure **privacy and security**, avoiding any external interference.

The application is currently a **work in progress**, with the following features and enhancements under development.

---

## Key Features
1. **Statement of Account**  
   - View detailed statements for each client, including:
     - Transaction date  
     - Job order number  
     - Particulars  
     - Amount, payment, and balance   

2. **Data Persistence**  
   - Built to handle offline functionality with data syncing when back online.  

3. **Data Table Enhancements**  
   - Filtering, sorting, and pagination for the clients and transactions table.  
   - Persistent sorting and highlighted new entries for improved usability.  

4. **Export to Spreadsheet**  
   - Export client records and transaction statements to spreadsheet files for offline analysis.  

5. **Authentication and Role Management**  
   - Role-based access control:
     - Admin users can add, update, and delete records.  
     - Regular users can only create records.  
   - Login page is the app's entry point unless a user is already authenticated.  

6. **Local Deployment**  
    - The app is designed for **local deployment only**, ensuring complete control over sensitive data.  

---

## Current Progress
- **Frontend**:  
   Built using **React** with **Tailwind CSS** and **Shadcn UI components** for a modern and responsive design.  
   - Data tables leverage **TanStack Table** for efficient rendering and interaction.  
   - The app uses **Redux** for state management and **React Router** for navigation.  

- **Backend**:  
   Built using **Node.js** with a **PostgreSQL** database. The backend ensures data validation and seamless interaction with the frontend.  

- **Key Features in Progress**:  
   - Transaction and client CRUD functionality.  
   - Exporting client and transaction data to spreadsheets.  
   - Offline functionality with data syncing.  
