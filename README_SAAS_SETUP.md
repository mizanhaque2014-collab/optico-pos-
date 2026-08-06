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

## Step 2: Connect the Frontend to the New Company

1. Open your Optico POS application in the browser.
2. Click the **Gear Icon** (Shop Settings) in the top right corner of the dashboard.
3. Under **Shop Identity Details**, enter the new company's name and details.
4. In the **APPS_SCRIPT_API_URL** field, paste the Web app URL you copied in Step 1.
5. Click **Save Profile**. 
6. The app will refresh and is now connected exclusively to the new company's Google Sheet database.

## Step 3: Configure Multiple Branches

Once the app is connected to the new backend:

1. Navigate to the **Super Admin** dashboard by going to the URL: `your-app-url.com/super-admin`.
2. Select the **Branch Management** tab from the left sidebar.
3. Click **Add Branch**.
4. Enter the details for the 5 branches (e.g., Main Branch, City Center Branch, etc.) one by one and save them.
5. Next, go to the **User Management** tab.
6. When creating user accounts for staff members, assign each user to their specific branch using the dropdown menu.
7. Now, when staff members log in, their sales, inventory, and reports will be tagged to their assigned branch.
