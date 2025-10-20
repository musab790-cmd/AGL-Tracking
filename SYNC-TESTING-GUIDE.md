# Firebase Sync Testing Guide
## AGL MCT Airfield Maintenance Tracker v3.0.1

---

## 🎯 Purpose
This guide will help you verify that the Firebase real-time sync is working correctly between your phone and laptop (or any two devices).

---

## ⚙️ Prerequisites

Before testing, ensure:

1. ✅ Firebase project is set up correctly
2. ✅ `firebase-config.js` has your correct credentials
3. ✅ Firebase Database Rules allow read/write:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
4. ✅ Both devices have internet connection
5. ✅ App is deployed and accessible from both devices

---

## 🧪 Testing Procedure

### Test 1: Initial Connection Verification

**On Device A (Phone):**
1. Open the app
2. Look at the top-right corner for sync status
3. ✅ Expected: Green dot with "Synced" text

**On Device B (Laptop):**
1. Open the app
2. Look at the top-right corner for sync status
3. ✅ Expected: Green dot with "Synced" text

**Open Browser Console (F12) on Laptop:**
- ✅ Expected log messages:
  - `✅ Firebase connected`
  - `🚀 Firebase initialized successfully!`
  - `📥 PPM tasks synced from Firebase: X`
  - `📥 CM tasks synced from Firebase: X`

⚠️ **If you see "Offline" or "Sync Error":** Check Firebase configuration and internet connection.

---

### Test 2: Add PPM Task (Phone → Laptop)

**On Device A (Phone):**
1. Click "Add PPM Task" button
2. Fill in the form:
   - **Shift Type:** Day Shift
   - **Description:** TEST SYNC - Phone to Laptop
   - **Type:** Daily Checks
   - **Due Date:** [Today's date]
   - **Frequency:** Daily
   - **Status:** Not Started
   - **Assigned - Day Shift:** Your Name
3. Click "Add Task"
4. ✅ Expected: "PPM task added successfully!" notification

**On Device B (Laptop) - Within 1-2 seconds:**
1. Watch the tasks table
2. ✅ Expected: The new task "TEST SYNC - Phone to Laptop" appears automatically
3. ✅ Expected: Dashboard "Tasks Due Today" count increases by 1

**Check Laptop Browser Console:**
- ✅ Expected: `📥 PPM tasks synced from Firebase: X` (count increased)

---

### Test 3: Add PPM Task (Laptop → Phone)

**On Device B (Laptop):**
1. Click "Add PPM Task" button
2. Fill in the form:
   - **Shift Type:** Night Shift
   - **Description:** TEST SYNC - Laptop to Phone
   - **Type:** Safety Checks
   - **Due Date:** [Tomorrow's date]
   - **Frequency:** Daily
   - **Status:** Not Started
   - **Assigned - Night Shift:** Your Name
3. Click "Add Task"

**Check Laptop Console:**
- ✅ Expected logs:
  - `💾 Data saved to Firebase successfully`
  - `   - PPM Tasks: X`
  - `✅ Sync flag cleared`

**On Device A (Phone) - Within 1-2 seconds:**
1. Watch the tasks table
2. ✅ Expected: The new task "TEST SYNC - Laptop to Phone" appears automatically

---

### Test 4: Edit Existing Task (Phone → Laptop)

**On Device A (Phone):**
1. Find the "TEST SYNC - Phone to Laptop" task
2. Click "Edit" button
3. Change status to "In Progress"
4. Add a note to description: " - EDITED ON PHONE"
5. Click "Update Task"

**On Device B (Laptop) - Within 1-2 seconds:**
1. Watch the task row
2. ✅ Expected: 
   - Status changes to "In Progress" with orange color
   - Description updates to include "- EDITED ON PHONE"
   - Dashboard "In Progress" count increases

---

### Test 5: Complete Task with Auto-Progression (Laptop → Phone)

**On Device B (Laptop):**
1. Find a task with frequency set (e.g., "TEST SYNC - Phone to Laptop")
2. Click "Edit" button
3. Change status to "Completed"
4. Click "Update Task"
5. ✅ Expected: "Task completed! Next due date set to [tomorrow's date]" notification

**On Device A (Phone) - Within 1-2 seconds:**
1. Watch the tasks table
2. ✅ Expected:
   - Task due date automatically moves to tomorrow
   - Status resets to "Not Started"
   - Dashboard counts update accordingly

---

### Test 6: Add CM Task (Phone → Laptop)

**On Device A (Phone):**
1. Click "Add CM Task" button
2. Fill in the form:
   - **Equipment:** Runway Lights
   - **Issue Description:** TEST CM SYNC from Phone
   - **Priority:** High
   - **Status:** Open
   - **Reported By:** Your Name
3. Click "Add Task"
4. ✅ Expected: Auto-switches to "CM Tasks" view

**On Device B (Laptop) - Within 1-2 seconds:**
1. Click "CM Tasks" tab
2. ✅ Expected: The new CM task appears in the table
3. ✅ Expected: Dashboard "Open CM Tasks" count increases

---

### Test 7: Delete Task (Laptop → Phone)

**On Device B (Laptop):**
1. Find one of the test tasks
2. Click "Delete" button
3. Confirm deletion
4. ✅ Expected: Task disappears immediately

**On Device A (Phone) - Within 1-2 seconds:**
1. Watch the tasks table
2. ✅ Expected: 
   - Deleted task disappears automatically
   - Dashboard counts update

---

### Test 8: Offline Mode (Advanced)

**On Device A (Phone):**
1. Turn on airplane mode (disconnect internet)
2. Add a new PPM task: "OFFLINE TEST"
3. ✅ Expected: 
   - Status shows "Offline" (red dot)
   - Task is saved locally
   - Notification: "Task added locally (offline)"

**Turn internet back ON on Phone:**
1. ✅ Expected: Status changes to "Synced" (green dot)
2. Within 2-3 seconds, check Laptop
3. ✅ Expected: "OFFLINE TEST" task appears on Laptop

---

### Test 9: Concurrent Edits (Stress Test)

**On Both Devices Simultaneously:**
1. Device A: Add a task "CONCURRENT TEST A"
2. Device B: Add a task "CONCURRENT TEST B"
3. Both devices: Click "Add Task" at nearly the same time

**Expected Result:**
- ✅ Both tasks appear on both devices
- ✅ No tasks are lost
- ✅ No duplicate tasks
- ✅ Dashboard counts are accurate on both devices

---

## 🔍 Console Monitoring

### Key Log Messages to Watch

**Successful Sync:**
```
✅ Firebase connected
🚀 Firebase initialized successfully!
💾 Data saved to Firebase successfully
   - PPM Tasks: X
   - CM Tasks: Y
📥 PPM tasks synced from Firebase: X
✅ Sync flag cleared
```

**Sync in Progress:**
```
⏸️ Skipping listener (sync in progress)
```

**Error States:**
```
❌ Firebase disconnected
❌ Error saving to Firebase: [error details]
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Sync Error" Status
**Symptoms:** Red dot with "Sync Error" text

**Causes:**
- Firebase credentials incorrect in `firebase-config.js`
- Firebase Database Rules too restrictive
- Network connectivity issues

**Solutions:**
1. Verify all fields in `firebase-config.js` are correct
2. Check Firebase Console → Database → Rules
3. Try reloading the app

---

### Issue 2: Changes Not Syncing
**Symptoms:** Task added on one device but doesn't appear on another

**Causes:**
- One device is actually offline
- Browser cache is stale
- Sync flag stuck (rare)

**Solutions:**
1. Check both devices show "Synced" status
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close and reopen the app on both devices
4. Check browser console for error messages

---

### Issue 3: Slow Sync (>5 seconds)
**Symptoms:** Changes take too long to appear

**Causes:**
- Poor internet connection
- Firebase server latency
- Too many concurrent users

**Solutions:**
1. Check internet speed on both devices
2. Wait a bit longer (Firebase may be busy)
3. Refresh the app if it takes >10 seconds

---

### Issue 4: Duplicate Tasks
**Symptoms:** Same task appears multiple times

**Causes:**
- Multiple rapid saves
- Browser back/forward navigation
- Sync flag issue (v3.0.1 should fix this)

**Solutions:**
1. Ensure you're using v3.0.1
2. Delete duplicate tasks manually
3. Clear browser cache and reload

---

## ✅ Success Criteria

Your sync is working correctly if:

1. ✅ Both devices show "Synced" status
2. ✅ Tasks added on one device appear on the other within 1-2 seconds
3. ✅ Dashboard counts update in real-time
4. ✅ Status changes sync immediately
5. ✅ No duplicate tasks appear
6. ✅ Offline changes sync when connection is restored
7. ✅ Console shows successful sync messages

---

## 📊 Sync Performance Benchmarks

**Normal Operation:**
- Connection establishment: < 2 seconds
- Task creation sync: 1-2 seconds
- Task update sync: 1-2 seconds
- Dashboard refresh: Instant
- Offline recovery: 2-3 seconds after reconnection

**If sync times exceed these benchmarks:**
- Check internet speed
- Verify Firebase project is in your nearest region
- Consider upgrading Firebase plan if you have many concurrent users

---

## 🆘 Getting Help

If sync still doesn't work after following this guide:

1. **Collect Information:**
   - Screenshot of sync status on both devices
   - Console logs from browser (F12 → Console tab)
   - Error messages (if any)
   - Firebase Database Rules

2. **Check Firebase Console:**
   - Firebase Console → Database → Data tab
   - Verify data is being written (you should see `ppmTasks` and `cmTasks` nodes)

3. **Verify Network:**
   - Open Firebase Console on both devices
   - If Firebase Console loads, connectivity is OK

---

## 🎉 Test Completion

Once all tests pass, your app is ready for production use!

**Recommended Final Steps:**
1. Delete all test tasks
2. Inform your team about the sync feature
3. Monitor console logs for the first few days
4. Set up Firebase usage alerts (optional)

---

**Document Version:** 3.0.1  
**Last Updated:** Current  
**For Support:** Check CHANGELOG-v3.0.1.md for known issues
