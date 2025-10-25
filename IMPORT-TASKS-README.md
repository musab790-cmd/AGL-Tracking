# 📥 Task Import Guide - AGL-Tracking

## Overview
This guide explains how to import the 371 PPM tasks from the Excel file into your AGL-Tracking system.

---

## 📊 What's Being Imported?

### Task Summary
- **Total Tasks**: 371 PPM (Preventive Maintenance) tasks
- **Source**: 11445575_with_shifts.xlsx
- **Frequency**: Weekly maintenance schedule
- **Type**: Service tasks
- **Equipment**: Airfield lighting systems

### Equipment Categories
1. **Flash Light Controllers** (08L, 26R)
2. **Runway Lighting**
   - Center Line (RCL)
   - Edge Lights (08L, 26R)
   - End Lights (08L, 26R)
   - Guard Lights (RGL)
3. **Taxiway Lighting**
   - Center Line (7 zones: TCL Zone 1-7)
   - Edge Lights (various zones)
4. **Additional Systems**
   - Various airfield lighting equipment
   - Control systems
   - Navigation aids

---

## 🚀 Quick Start Guide

### Method 1: Web Interface (Recommended)

#### Step 1: Open Import Interface
```bash
# Simply open the import file in your browser
open import_tasks.html
# Or navigate to it manually
```

#### Step 2: Verify Connection
- Ensure you see "Ready to Import: 371 PPM tasks"
- Check that your Firebase is configured in `firebase-config.js`

#### Step 3: Import
1. Click **"Import Tasks Now"** button
2. Confirm the import dialog
3. Watch the progress bar (takes ~30-60 seconds)
4. Wait for "Success!" message

#### Step 4: View Tasks
1. Click "Go to Main Application" or open `index.html`
2. You should see 371 new PPM tasks
3. Tasks will have staggered due dates over the next 30 days

### Method 2: Command Line (Advanced)

If you need to modify tasks before importing:

```bash
# 1. Review the JSON data
cat imported_ppm_tasks.json | head -50

# 2. Modify if needed (using your preferred editor)
nano imported_ppm_tasks.json

# 3. Use the HTML interface to import
open import_tasks.html
```

---

## 📁 Files Included

### Core Import Files
1. **`import_tasks.html`** - Web interface for importing
   - User-friendly UI
   - Progress tracking
   - Error handling
   - Direct Firebase integration

2. **`imported_ppm_tasks.json`** - Ready-to-import task data
   - 371 tasks in AGL format
   - Firebase-compatible structure
   - Staggered due dates

3. **`import_tasks.py`** - Python import script
   - Converts Excel to JSON
   - Smart frequency detection
   - Task type classification
   - Due date calculation

### Utility Files
4. **`parse_excel.py`** - Excel analysis tool
   - Reads Excel structure
   - Validates data format
   - Exports to JSON

5. **`11445575_with_shifts.xlsx`** - Original Excel file
   - Source data
   - 371 PM tasks
   - Reference for future imports

6. **`parsed_tasks.json`** - Raw parsed data
   - For debugging
   - Data validation
   - Structure reference

---

## 🔍 Task Structure

Each imported task has this structure:

```javascript
{
  "id": 1761387702898,                           // Unique timestamp ID
  "description": "PPM for Flash Light Controller at 08L",
  "shiftType": "Both",                           // Day and Night shifts
  "type": "Service",                             // Task category
  "dueDate": "2025-10-25",                       // First due date
  "frequency": "Weekly",                         // Repeat schedule
  "status": "Not Started",                       // Initial status
  "dayShift": "",                                // Assign after import
  "nightShift": "",                              // Assign after import
  "photos": [],                                  // No photos initially
  "lastCompleted": null                          // Track completions
}
```

---

## ⚙️ Customization Options

### Before Import: Modify Tasks

If you need to customize tasks before importing:

```python
# Run the import script with modifications
python3 import_tasks.py

# Then edit the generated JSON
nano imported_ppm_tasks.json
```

### Modify Frequencies
Default is "Weekly" for all tasks. Options:
- `Daily`
- `Weekly`
- `Monthly`
- `Quarterly`
- `Yearly`

### Modify Task Types
Default is "Service" for PPM tasks. Options:
- `Inspection`
- `Cleaning`
- `Repair`
- `Service`
- `Testing`

### Stagger Due Dates
Tasks are automatically staggered over 30 days. To change:

```python
# Edit import_tasks.py line ~145
due_date = calculate_due_date(start_date, task_count % 30, frequency)
#                                                    ^^
# Change 30 to desired number of days
```

---

## 📋 After Import: Task Management

### 1. Assign Personnel
Once imported, assign staff to tasks:
1. Go to main application (`index.html`)
2. Click on a task to edit
3. Fill in "Day Shift" and "Night Shift" personnel
4. Save changes

### 2. Adjust Due Dates
If the auto-generated dates don't work:
1. Edit each task
2. Set your preferred due date
3. The system will auto-calculate next dates based on frequency

### 3. Modify Frequencies
Change task frequencies as needed:
1. Edit task
2. Select different frequency
3. System will recalculate next due dates

### 4. Set Priorities
Although not in import data, you can add priority later:
- Edit task descriptions to include priority indicators
- Use status to track urgency

---

## 🔄 Batch Operations

### Re-import Modified Tasks
If you need to re-import after changes:

```bash
# 1. Delete old tasks from Firebase (use app interface)
# 2. Modify imported_ppm_tasks.json as needed
# 3. Re-run import_tasks.html
```

### Export Tasks
To backup or transfer tasks:

```bash
# From browser console (F12) in main app
firebase.database().ref('ppmTasks').once('value', (snapshot) => {
  const tasks = snapshot.val();
  console.log(JSON.stringify(tasks, null, 2));
  // Copy output to file
});
```

---

## ✅ Verification Checklist

After importing, verify:

- [ ] All 371 tasks appear in PPM Tasks view
- [ ] Due dates are spread over time (not all same date)
- [ ] Task descriptions are correct and readable
- [ ] Frequency is set to "Weekly"
- [ ] Type is set to "Service"
- [ ] Status shows "Not Started"
- [ ] ShiftType shows "Both"
- [ ] No errors in browser console (F12)

---

## 🐛 Troubleshooting

### Issue: Import Button Not Working
**Solution:**
1. Check Firebase configuration in `firebase-config.js`
2. Ensure you're connected to the internet
3. Check browser console (F12) for errors
4. Verify Firebase database rules allow writes

### Issue: Tasks Not Appearing
**Solution:**
1. Refresh the main app (Ctrl+Shift+R)
2. Check Firebase console to verify data
3. Clear browser cache
4. Check sync status indicator in app

### Issue: Duplicate Tasks
**Solution:**
1. Delete duplicates manually from app
2. Or clear Firebase database and re-import
3. Ensure you only run import once

### Issue: Wrong Due Dates
**Solution:**
1. Edit tasks individually to fix dates
2. Or modify `imported_ppm_tasks.json` and re-import
3. Check system date on your computer

### Issue: Firebase Permission Denied
**Solution:**
1. Check Firebase security rules
2. Ensure user is authenticated (if required)
3. Verify Firebase config is correct
4. Check Firebase console for errors

---

## 📊 Import Statistics

### Expected Performance
- **Import Time**: 30-60 seconds for 371 tasks
- **Batch Size**: 10 tasks per batch
- **Total Batches**: 38 batches
- **Network Usage**: ~120KB upload to Firebase

### Success Criteria
- ✅ All 371 tasks imported without errors
- ✅ Progress bar reaches 100%
- ✅ Success message displayed
- ✅ Tasks visible in main application

---

## 🔐 Data Privacy & Security

### Firebase Security
- Tasks are stored in your Firebase database
- Access controlled by Firebase security rules
- Data encrypted in transit (HTTPS)
- Configure rules based on your needs

### Recommended Firebase Rules
```json
{
  "rules": {
    "ppmTasks": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## 💡 Best Practices

### 1. Backup Before Import
```bash
# Export current tasks first (if any exist)
# Use app's export feature or Firebase console
```

### 2. Test with Small Batch First
- Modify JSON to include only 5-10 tasks
- Import and verify
- Then import full dataset

### 3. Document Customizations
- Keep notes on any changes made
- Save modified JSON files with version numbers
- Track assignment of personnel

### 4. Regular Maintenance
- Review task frequencies quarterly
- Update personnel assignments as needed
- Archive completed tasks periodically

---

## 📞 Support & Updates

### Need Help?
1. Check this README first
2. Review browser console errors (F12)
3. Check Firebase console logs
4. Verify all files are present

### Future Enhancements
Planned features:
- [ ] Bulk personnel assignment during import
- [ ] Import validation and conflict detection
- [ ] Multi-sheet Excel support
- [ ] Scheduled automatic imports
- [ ] Task templates library

---

## 📝 Version Information

- **Script Version**: 1.0
- **Compatible With**: AGL-Tracking v3.0.5
- **Last Updated**: 2025-10-25
- **Python Required**: 3.6+
- **Dependencies**: openpyxl

---

## 🎯 Quick Reference Commands

```bash
# View first 5 tasks
head -n 50 imported_ppm_tasks.json

# Count total tasks
cat imported_ppm_tasks.json | grep '"id"' | wc -l

# Search for specific equipment
grep "Flash Light" imported_ppm_tasks.json

# Validate JSON format
python3 -m json.tool imported_ppm_tasks.json > /dev/null && echo "Valid JSON"

# Re-run import script
python3 import_tasks.py
```

---

## ✈️ Ready to Import!

You're all set! Open `import_tasks.html` in your browser and click "Import Tasks Now" to add these 371 maintenance tasks to your AGL-Tracking system.

**Happy Tracking!** 🚀

---

*AGL MCT Airfield - Maintenance Excellence Through Digital Innovation*
