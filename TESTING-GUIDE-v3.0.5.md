# Testing Guide for v3.0.5 - PDF Photo Thumbnails

## 🎯 What's New in This Version
Version 3.0.5 adds visual photo thumbnails to PDF reports for BOTH PPM and CM tasks.

## ✅ Quick Test Plan

### Test 1: PPM Tasks with Photos in PDF
1. Open the app
2. Go to a PPM task that has photos attached (or add some photos to a task)
3. Click "Generate Report" button
4. Set a date range that includes your PPM task
5. Click "Generate PDF Report"
6. **Verify**: 
   - PDF opens/downloads successfully
   - PPM tasks section shows "PPM TASKS DETAILS" header
   - Task has "Photos: X attached" line
   - Up to 3 small photo thumbnails appear below the task details
   - If more than 3 photos, "+X more photo(s)" text appears

### Test 2: CM Tasks with Photos in PDF
1. Go to CM Tasks view (click "CM Tasks" button)
2. Find or create a CM task with photos
3. Click "Generate Report" button
4. Set date range to include your CM task (based on dateReported)
5. Click "Generate PDF Report"
6. **Verify**:
   - PDF includes "CM TASKS DETAILS" section
   - CM task shows work order number in header
   - Photos display as thumbnails (up to 3)
   - "+X more photo(s)" appears if needed

### Test 3: Both PPM and CM Tasks Together
1. Ensure you have at least one PPM task and one CM task with photos
2. Generate report with date range covering both
3. **Verify**:
   - Report header shows "Total PPM Tasks: X | Total CM Tasks: Y"
   - Two separate summary sections appear
   - PPM tasks section comes first
   - CM tasks section follows
   - Both sections show photo thumbnails correctly

### Test 4: Tasks Without Photos
1. Generate report including tasks without photos
2. **Verify**:
   - Tasks show "Photos: 0 attached"
   - No thumbnails or error messages appear
   - Report layout looks clean

### Test 5: Edge Cases
1. **Empty Report**: Try date range with no tasks
   - Should show notification: "No tasks found between [dates]"
2. **Many Photos**: Test task with 5+ photos
   - Should show exactly 3 thumbnails
   - Should show "+2 more photo(s)" or similar
3. **Large Photos**: Tasks with large photo files
   - Should still generate PDF (may take longer)
   - Thumbnails should be small (25px x 25px)

## 🔍 What to Look For

### ✅ Success Indicators
- [ ] PDF generates without errors
- [ ] Both PPM and CM sections appear (if tasks exist)
- [ ] Photo thumbnails are visible and recognizable
- [ ] Photos are small (not full size)
- [ ] Task boxes have proper spacing
- [ ] No overlapping text or images
- [ ] Page breaks work correctly (tasks not cut off)
- [ ] Footer shows correct page numbers

### ❌ Potential Issues to Watch For
- PDF generation fails with error message
- Photos appear as broken images or blank squares
- Photos are too large (taking up full page)
- Text overlaps with photos
- Task boxes are misaligned
- CM tasks missing from report
- "+X more photos" count is incorrect

## 🐛 If You Find Issues

### Photos Not Showing
- Check browser console (F12) for errors
- Verify photos exist in task (view in app first)
- Try regenerating the task's photos

### PDF Generation Errors
- Check if jsPDF library loaded (console errors)
- Verify date range is valid
- Try with fewer tasks first

### Layout Issues
- Note which task number has the problem
- Take screenshot if possible
- Check if specific to PPM or CM tasks

## 📊 Sample Test Data

### Good Test Scenario
1. **PPM Task**: "Daily runway inspection" with 2 photos
2. **CM Task**: "Repair taxiway light" (WO-1234) with 4 photos
3. **Date Range**: Covering both tasks
4. **Expected Result**: 
   - 2 summary sections
   - PPM task with 2 photo thumbnails
   - CM task with 3 photo thumbnails + "+1 more photo(s)"

## 🎯 Priority Tests
If time is limited, focus on these:
1. ✅ Test 3 (Both task types together)
2. ✅ Test 2 (CM tasks with photos)
3. ✅ Test 5 (Many photos edge case)

## 📝 Reporting Results
When testing is complete, note:
- ✅ What worked perfectly
- ⚠️ What had minor issues
- ❌ What failed completely
- 💡 Suggestions for improvement

---

**Ready to Deploy**: Once these tests pass, v3.0.5 is ready for production use!
