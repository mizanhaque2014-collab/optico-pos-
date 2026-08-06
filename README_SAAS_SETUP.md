# SaaS Deployment & Multi-Branch Setup Guide

This guide explains how to set up the Optico POS system for a new company using their own Gmail account, and how to configure multiple branches.

## Step 1: Deploy the Backend for the New Company

1. Log in to the **new company's Google Account** (Gmail).
2. Go to Google Drive and create a **Blank Google Sheet**.
3. In the Google Sheet, click **Extensions > Apps Script**.
4. Delete any existing code in the editor.
5. In your project workspace, open the file `public/backend-bundle.gs` and copy ALL of its contents.
6. Paste the contents into the Apps Script editor.
7. Click the **Save** icon (floppy disk).
8. Click **Deploy > New deployment**.
   - **Select type:** Web app
   - **Description:** Version 1
   - **Execute as:** Me (the new company's email)
   - **Who has access:** Anyone
9. Click **Deploy**. (You may need to authorize the permissions).
10. Copy the generated **Web app URL** (this is your new APPS_SCRIPT_API_URL).

## Step 2: Connect the Frontend to the New Company (The Setup Screen)

1. Open your Optico POS application in the browser.
2. Open the **Shop Profile & SaaS Config** screen.
3. In the **APPS_SCRIPT_API_URL** field, paste the Web app URL you copied in Step 1.
4. Under **Shop Identity Details**, enter the new company's name and details.
5. Click **Save Profile**. 
6. The app will refresh and is now connected exclusively to the new company's Google Sheet database.

## Step 3: Create the First Admin Account (Bootstrap)

Because this is a brand new database, it has no users! You need to manually create the first admin account directly in the Google Sheet.

1. Go back to the **Google Sheet** (on the new client's account).
2. Look at the bottom tabs. You should see a sheet named **`Users`**. (If you don't see it, refresh the POS app in your browser once, and the sheets will auto-generate).
3. Open the **`Users`** sheet and type the following in Row 2 (under the headers):
   - **UserID**: `USR-001`
   - **CompanyID**: `COMP-001`
   - **BranchID**: `ALL`
   - **FullName**: (Client's Name)
   - **Username**: `admin`
   - **Password**: `123456`
   - **Role**: `COMPANY_ADMIN`
   - **Status**: `ACTIVE`
4. The client can now go to the POS app and log in using `admin` and `123456`.

## Step 4: Configure Multiple Branches & Staff

Once the client admin is logged in, they can create the rest of their setup directly inside the app:

1. Navigate to the **Super Admin / Settings** dashboard inside the app.
2. Select the **Branch Management** tab.
3. Click **Add Branch** and create the 5 branches.
4. Select the **User Management** tab.
5. Click **Add User** to create accounts for the staff.
   - Assign each user to their specific branch using the dropdown menu.
   - Set their role to **SHOP_USER**.
6. Give the staff their newly created usernames and passwords. When they log in, their sales and inventory will be automatically tagged to their assigned branch!
