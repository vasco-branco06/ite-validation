# Bakery Cake Orders

One page on the shop laptop for writing down cake orders and seeing them all in one list.
It works only on this laptop and needs no internet and no password.

## 1. Install once

Do this only the first time.

1. Install **Node.js** (version 18 or newer) from <https://nodejs.org>. Choose the "LTS" button and accept the defaults.
2. Open the app folder (the folder that holds this README).
3. Click the address bar at the top of the folder window, type `cmd` and press **Enter**. A black window opens.
4. Type this and press **Enter**, then wait until it finishes:

   ```
   npm install
   ```

## 2. Start the app

1. Open the app folder, click the address bar, type `cmd` and press **Enter**.
2. Type this and press **Enter**:

   ```
   npm start
   ```

3. Wait for the line `Bakery Cake Orders running at http://127.0.0.1:3000`.
4. Open the web browser and go to **<http://127.0.0.1:3000>**. Tip: bookmark it.

Leave the black window open while you work. Closing it stops the app.

## 3. Stop the app

Click the black window and press **Ctrl + C**. If it asks "Terminate batch job (Y/N)?", type **Y** and press **Enter**.
You can also just close the window.
Every saved order stays saved. You will see it again the next time you start the app.

## 4. Back up the orders

All orders are in one file: **`data\orders.db`** inside the app folder.

1. Stop the app (step 3), so the file is not changing while you copy it.
2. Open the `data` folder inside the app folder.
3. Copy `orders.db` to a USB stick or another safe place.
   Add the date to the copy's name, for example `orders-2026-10-16.db`.
4. Start the app again (step 2).

Do this at least once a week, and before the holidays.

**To bring back a backup:** stop the app, copy your backup into the `data` folder,
rename it to `orders.db` (replace the old file), and start the app.

## If something goes wrong

- **The page does not open:** check that the black window is still open and shows the "running at" line. If not, start the app again.
- **"The database file cannot be written":** nothing was saved, and the order is still in the form. Check that the laptop's disk is not full and that no backup program has `orders.db` open, then click **Save** again.
- **"address already in use" when starting:** the app is already running in another black window. Use that one, or close it and start again.
