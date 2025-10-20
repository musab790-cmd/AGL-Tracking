# AGL MCT Airfield Maintenance Tracker - Version 3.0.5

## 📸 PDF Photo Thumbnails Release

**Version:** 3.0.5  
**Release Date:** October 20, 2025  
**Previous Version:** 3.0.4 (CM Photos)

---

## 🎯 What's New

### Photo Thumbnails in PDF Reports
Your PDF reports now include **visual photo thumbnails** for both PPM and CM tasks!

**Before v3.0.5:**
```
Photos: 3 photo(s) attached
```

**After v3.0.5:**
```
Photos: 3 attached
[📷] [📷] [📷]    <- Actual photo thumbnails!
```

### Key Features
- ✅ **Visual Documentation**: See photo previews directly in PDF reports
- ✅ **Both Task Types**: PPM and CM tasks both show photos
- ✅ **Smart Display**: Shows up to 3 thumbnails + counter for additional photos
- ✅ **Optimized Size**: Medium-sized thumbnails (25px) for readability
- ✅ **Professional Layout**: Clean, organized report structure

---

## 📦 Package Contents

### Core Files
- **app.js** - Main application logic (UPDATED)
- **index.html** - User interface
- **styles.css** - Styling
- **config.html** - Configuration page
- **firebase-config.js** - Firebase credentials template
- **manifest.json** - PWA manifest

### Documentation
- **README-v3.0.5.md** - This file
- **CHANGELOG-v3.0.5.md** - Detailed changelog
- **DEPLOYMENT-GUIDE-v3.0.5.md** - Step-by-step deployment
- **TESTING-GUIDE-v3.0.5.md** - Testing procedures
- **FIREBASE-SETUP-GUIDE.md** - Firebase configuration help
- **UPDATE-HISTORY-GUIDE.md** - Complete version history

---

## 🚀 Quick Start

### New Installation
1. Extract ZIP to your hosting location
2. Update `firebase-config.js` with your Firebase credentials
3. Upload all files to Microsoft Teams/SharePoint
4. Open `index.html` in browser
5. Test by generating a PDF report

### Upgrade from v3.0.4
1. **Backup** your current `app.js` (just in case)
2. **Replace** only `app.js` with new version
3. **Refresh** browser (Ctrl+Shift+R to clear cache)
4. **Test** by generating a PDF with photos
5. **Verify** photos appear as thumbnails

---

## 📊 PDF Report Structure

### PPM Tasks Section
```
PPM TASK 1
Description: Daily runway inspection
Shift: A | Type: Inspection | Frequency: Daily
Status: ✓ Completed | Due Date: 2025-10-20
Assignments: Day: John Smith | Night: Jane Doe
Photos: 3 attached
[📷] [📷] [📷]
```

### CM Tasks Section
```
CM TASK 1 - WO: 12345
Description: Repair taxiway light
Priority: High | Location: Taxiway B
Status: In Progress | Reported: 2025-10-15
Reported By: Mike Johnson | Assigned To: Tom Wilson
Photos: 5 attached
[📷] [📷] [📷] +2 more photo(s)
```

---

## ⚙️ Configuration

### Photo Thumbnail Size
Default: 25px x 25px (medium)

To adjust, edit `app.js`:
```javascript
// Line 1373 (PPM tasks)
const photoSize = 25; // Change to desired size (20-40 recommended)

// Line 1493 (CM tasks)
const photoSize = 25; // Change to desired size (20-40 recommended)
```

### Photos Per Task Display
Default: 3 photos + counter

To show more, edit `app.js`:
```javascript
// Line 1371 (PPM tasks)
const photos = task.photos.slice(0, 3); // Change 3 to desired number

// Line 1491 (CM tasks)
const photos = task.photos.slice(0, 3); // Change 3 to desired number
```

---

## 🔧 Technical Details

### What Changed
- **New Function**: `generatePDFDocument(ppmTasks, cmTasks, dateFrom, dateTo)`
  - Now accepts both PPM and CM task arrays
  - Generates separate sections for each type
- **New Function**: `renderTaskInPDF()` - Renders PPM tasks with photos
- **New Function**: `renderCMTaskInPDF()` - Renders CM tasks with photos
- **Updated**: Date filtering for both task types
- **Updated**: Report statistics for both task types

### Data Structure
```javascript
// Task with photos
{
  description: "Task description",
  photos: [
    {
      name: "photo1.jpg",
      data: "data:image/jpeg;base64,...",
      timestamp: "2025-10-20T10:30:00"
    }
  ]
  // ... other fields
}
```

### PDF Generation
- **Library**: jsPDF 2.5.1
- **Image Format**: JPEG embedded as base64
- **Thumbnail Size**: 25px x 25px
- **Max Photos Shown**: 3 per task
- **Page Size**: A4 (210mm x 297mm)

---

## 🧪 Testing

### Quick Test
1. Create/find a task with photos
2. Click "Generate Report"
3. Set date range to include your task
4. Click "Generate PDF Report"
5. Open PDF and verify photos appear

### Comprehensive Testing
See `TESTING-GUIDE-v3.0.5.md` for detailed test scenarios

---

## 🐛 Known Issues & Limitations

### Current Limitations
- Maximum 3 photos displayed per task (by design)
- Photo quality optimized for file size (25px thumbnails)
- Very large photos may slow PDF generation slightly
- Base64 encoding increases PDF file size

### Workarounds
- **Full-size photos**: Use in-app photo viewer
- **More than 3 photos**: Counter shows "+X more photo(s)"
- **Large PDFs**: Limit date range to reduce task count

---

## 🔄 Version Compatibility

### Upgrade Path
- **From v3.0.4**: Direct upgrade ✅ (just replace app.js)
- **From v3.0.3**: Direct upgrade ✅ (replace all files)
- **From v3.0.0-3.0.2**: Direct upgrade ✅ (replace all files)
- **From v2.x**: Multi-step upgrade (see UPDATE-HISTORY-GUIDE.md)

### Data Compatibility
- **100% backward compatible** with v3.0.4 data
- No database changes required
- Firebase structure unchanged
- Photos stored as before (base64 in task objects)

---

## 📈 Performance

### Expected Performance
- **PDF Generation**: 1-5 seconds for typical reports
- **With Photos**: +0.5-2 seconds per task with photos
- **File Size**: ~50-200KB base + ~5-15KB per photo
- **Recommended**: Maximum 50 tasks per report

### Optimization Tips
- Limit date ranges for faster generation
- Use photo uploads sparingly (quality over quantity)
- Clear old photos from resolved tasks
- Generate separate reports for PPM and CM if needed

---

## 🆘 Support & Troubleshooting

### Common Issues

**Photos don't appear in PDF**
- Solution: Verify tasks have photos in app first
- Check: Browser console (F12) for errors
- Try: Regenerate PDF, clear browser cache

**PDF generation fails**
- Solution: Check date range is valid
- Try: Smaller date range (fewer tasks)
- Check: Internet connection (jsPDF loads from CDN)

**Layout issues in PDF**
- Solution: Verify photo data is valid base64
- Try: Delete and re-upload problematic photos
- Check: Browser console for specific errors

### Getting Help
1. Check `DEPLOYMENT-GUIDE-v3.0.5.md` for troubleshooting
2. Review browser console (F12) for error messages
3. Test with sample data first
4. Verify Firebase connection is stable

---

## 🔐 Security & Privacy

### Data Handling
- Photos stored as base64 in Firebase (encrypted in transit)
- PDFs generated client-side (no server upload)
- No external API calls for images
- Firebase security rules apply (your configuration)

### Best Practices
- Limit photo file sizes (compress before upload)
- Use secure Firebase rules to protect data
- Regular backups (export to CSV)
- Monitor Firebase usage/costs

---

## 📚 Additional Resources

### Documentation Files
- **CHANGELOG-v3.0.5.md** - Complete list of changes
- **DEPLOYMENT-GUIDE-v3.0.5.md** - Deployment instructions
- **TESTING-GUIDE-v3.0.5.md** - Testing procedures
- **FIREBASE-SETUP-GUIDE.md** - Firebase configuration
- **UPDATE-HISTORY-GUIDE.md** - Version history

### External Resources
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [Firebase Documentation](https://firebase.google.com/docs)
- Microsoft Teams SharePoint integration guides

---

## 🎯 Future Enhancements (Roadmap)

### Potential Features
- Adjustable thumbnail size in UI settings
- Option to include/exclude photos from reports
- Photo gallery pages in PDF
- Export photos as ZIP archive
- Photo compression before storage
- Photo captions/annotations

### Under Consideration
- Multi-page photo displays
- Photo editing tools
- Batch photo upload
- Photo search/filter
- Photo sharing links

---

## 📞 Contact & Feedback

### Version Information
- **Current Version**: 3.0.5
- **Release Date**: October 20, 2025
- **Build**: PDF-PHOTOS
- **Codename**: "Visual Documentation"

### Feedback
We'd love to hear your thoughts:
- What works well?
- What could be improved?
- What features would you like to see?
- Any bugs or issues?

---

## 🎉 Thank You

Thank you for using AGL MCT Airfield Maintenance Tracker!

This version represents a significant enhancement to documentation capabilities, making photo evidence immediately visible in generated reports for compliance, training, and record-keeping purposes.

**Happy Tracking!** ✈️

---

*AGL MCT Airfield - Maintenance Excellence Through Digital Innovation*
