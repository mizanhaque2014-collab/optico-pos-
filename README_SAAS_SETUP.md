# SaaS Multi-Tenant Architecture & Setup Guide

This guide explains how your Optico POS SaaS system operates from a single centralized Google Sheet backend under your control.

## How The Architecture Works (Single Backend, Multi-Tenant)

1. **One Central Database**: You have a single Google Sheet on your personal Google Account. This sheet holds the tables for all Companies, Branches, Users, Customers, Sales, and Inventory.
2. **Super Admin Control**: You access the Super Admin Portal to manage all Tenants (Companies). 
3. **Data Isolation**: Each client (Tenant) is assigned a unique `CompanyID`. The client logs in with their credentials. The application only shows data belonging to their `CompanyID` and `BranchID`.

## Step 1: Deploy Your Master Backend

1. Log in to **your Google Account** (Gmail).
2. Go to Google Drive and create a **Blank Google Sheet**.
3. In the Google Sheet, click **Extensions > Apps Script**.
4. Delete any existing code in the editor.
5. In your project workspace, open the file `public/backend-bundle.gs` and copy ALL of its contents.
6. Paste the contents into the Apps Script editor.
7. Click the **Save** icon (floppy disk).
8. Click **Deploy > New deployment**.
   - **Select type:** Web app
   - **Execute as:** Me (your email)
   - **Who has access:** Anyone
9. Click **Deploy** and copy the generated **Web app URL**.

## Step 2: Configure the App

1. In the codebase, open `lib/config.ts`.
2. Replace `DEFAULT_API_URL` with your new Web app URL.
3. Deploy your Next.js application to Vercel/Netlify.
4. Now, every client who visits your URL will hit your master database.

## Step 3: Setting up a New Client

1. Log into the Optico POS app using the Super Admin credentials:
   - **Username:** `superadmin`
   - **Password:** `superadmin`
2. Open the side menu and click **Companies**.
3. Click **Add Company** to register the new client (Tenant).
4. Click **Branches** and create one or more branches for that Company.
5. Click **Users** and create a User Account for the client. 
   - Assign the user to the correct Company.
   - Set the role to **COMPANY_ADMIN**.
6. Provide the new Username and Password to your client. 
7. When the client logs in, they will only have access to their Company's dashboard and branches.
