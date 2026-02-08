# Form + CRUD Using Local Storage (Plain-English Guide)

## The idea

You have a form on the frontend. When the user fills it and clicks Submit, the data is stored in the browser’s **localStorage**. You can also read that data, edit it, and delete it. Everything happens in the frontend; there is no server or data file. The “storage” is localStorage on the user’s device.

---

## Why localStorage works without a backend

The browser gives your app a small storage area (localStorage) that only your site can use. Your JavaScript can write to it and read from it. So you can do full CRUD (create, read, update, delete) without any server or API. Data stays on that device and in that browser until the user or your app removes it. It does not expire after a few days.

---

## How it works in practice

**1. Form on the frontend**  
User enters data (e.g. date, weight, deficit) and clicks Save or Update. Your code does not call an API; it reads the current data from localStorage, then adds or updates one record and writes the whole list back to localStorage.

**2. Create (add a record)**  
Read the current list from localStorage (e.g. parse a JSON string). Add the new record to the list. Save the list back to localStorage (e.g. stringify and setItem). Update the UI (e.g. chart or table) so the new record appears.

**3. Read (show existing data)**  
On load or when the user opens the log, read the list from localStorage. Parse the JSON and use it to render the chart or list. No server request.

**4. Update (edit a record)**  
User selects an existing date or record. Your code loads that record into the form. User changes weight or deficit and clicks Update. You find that record in the list (e.g. by date), replace it with the new values, save the list back to localStorage, and refresh the UI.

**5. Delete (remove a record)**  
User chooses a record and clicks Delete. You remove that record from the list, save the updated list to localStorage, and refresh the UI.

---

## Important points about localStorage

- **Persistence:** Data does not disappear after a few days. It stays until the user clears site data or you delete it in code.
- **Scope:** Data is per browser and per device. Different phone or browser has different data unless you later add sync (e.g. a backend).
- **Size:** Typically 5–10 MB per site. Enough for many records (e.g. thousands of date–weight–deficit entries).
- **Format:** You store strings. So you keep an array of objects and save it as one JSON string; when reading, you parse that string back into an array.

---

## Summary

With localStorage you do all CRUD in the frontend: form submit adds or updates a record in a list in memory, then you save that list to localStorage and redraw the chart or list. To edit, you load the record into the form and save again; to delete, you remove the record from the list and save. There is no backend and no data file—only the browser’s localStorage. This is what the Weight & Deficit Log in the app uses.
