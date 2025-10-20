# AGL Maintenance Tracker - Version 3.0.5 Changelog

## 🎯 Version 3.0.5 - PDF Photo Thumbnails
**Release Date:** October 20, 2025

### ✨ New Features

#### 📊 Enhanced PDF Reports with Photo Thumbnails
- **Both PPM and CM Tasks in Reports**: PDF reports now include BOTH PPM (Preventive Maintenance) and CM (Corrective Maintenance) tasks in the same report
- **Visual Photo Thumbnails**: Photos from both task types now display as small-to-medium sized thumbnails (25px x 25px) directly in the PDF
- **Smart Photo Display**: 
  - Shows up to 3 photo thumbnails per task inline
  - Displays "+X more photo(s)" text when tasks have more than 3 photos
  - Proper error handling for corrupted images
- **Separate Task Sections**: Report clearly distinguishes between PPM and CM tasks with dedicated sections and headers
- **Enhanced Statistics**: 
  - Separate summary statistics for PPM and CM tasks
  - Photo count indicators for both task types
  - Work order numbers displayed for CM tasks

#### 📋 Improved Report Structure
- **PPM Tasks Section**:
  - Task number, shift type, maintenance type, frequency
  - Smart status badges with color coding
  - Due dates and assignments
  - Photo thumbnails inline with task details
  
- **CM Tasks Section**:
  - Work order numbers in headers
  - Priority levels with color coding (High/Critical = Red, Medium = Orange, Low = Blue)
  - Location and status information
  - Reported by / Assigned to details
  - Photo thumbnails inline with task details

### 🔧 Technical Improvements

#### Code Architecture
- **Modular PDF Rendering**: Split PDF generation into specialized functions
  - `generatePDFDocument()` - Main coordinator accepting both task types
  - `renderTaskInPDF()` - Dedicated PPM task renderer with photos
  - `renderCMTaskInPDF()` - Dedicated CM task renderer with photos
- **Dynamic Box Heights**: Task boxes automatically adjust height based on photo count
- **Smart Pagination**: Improved page break logic to prevent task splitting

#### Data Filtering
- **Date-Based Filtering**: 
  - PPM tasks filtered by `dueDate`
  - CM tasks filtered by `dateReported`
  - Accurate task counts in generation notification

### 📦 What's Included
- `app.js` - Updated with new PDF generation functions
- `index.html` - v3.0.4 interface (unchanged, already supports photo uploads)
- `styles.css` - v3.0.3 styles (unchanged)
- `config.html` - Configuration page
- `firebase-config.js` - User's Firebase credentials template
- `manifest.json` - PWA manifest
- Documentation files from previous versions

### 🔄 Upgrade Path from v3.0.4
1. **Backup**: Your data is already synced to Firebase
2. **Replace Files**: Only `app.js` has changed
3. **Test**: Generate a PDF report to verify photo thumbnails appear correctly
4. **Verify**: Check that both PPM and CM tasks with photos display thumbnails

### ✅ Testing Checklist
- [x] PDF generation with PPM tasks only (photos display)
- [x] PDF generation with CM tasks only (photos display)
- [x] PDF generation with both PPM and CM tasks (both display correctly)
- [x] Multiple photos per task (shows 3 + "more" indicator)
- [x] Tasks without photos (displays "0 attached" correctly)
- [x] Empty reports (handled with appropriate notification)
- [x] Date range filtering for both task types

### 🐛 Bug Fixes
- Fixed PDF reports only showing PPM tasks (now includes CM tasks)
- Fixed photo thumbnails not displaying in reports (previously only showed text count)
- Fixed inconsistent photo thumbnail sizing (now standardized at 25px)
- Improved error handling for invalid image data in PDF generation

### 📊 Performance Notes
- PDF generation time may increase slightly due to image processing
- Base64 image data is embedded directly in PDF (no external dependencies)
- Photo thumbnails are optimized to 25px to balance quality and file size
- Maximum 3 photos rendered per task to keep reports readable

### 🎨 Visual Improvements
- Consistent photo thumbnail sizing across PPM and CM tasks
- Clean "+X more" indicators for additional photos
- Proper spacing between photos and task details
- Color-coded priority indicators for CM tasks
- Color-coded status badges for PPM tasks

### 🔐 Security & Data Integrity
- All photo data remains base64-encoded
- Photos synced through Firebase remain intact
- No changes to data structure or storage format
- Backward compatible with v3.0.4 data

### 📝 Notes
- Photo quality in PDF is optimized for file size (25px thumbnails)
- For full-size photo viewing, use the in-app photo viewer
- PDF file size will increase with more photos attached to tasks
- Maximum recommended photos per task: 10 (for reasonable PDF size)

### 🚀 Next Steps (Future Enhancements)
- Adjustable photo thumbnail size in report settings
- Option to include/exclude photos from reports
- Photo galleries on separate PDF pages
- Export individual task photos as ZIP archive

---

## Version History
- **v3.0.5** (Current) - PDF reports with photo thumbnails for both PPM and CM tasks
- **v3.0.4** - CM photo upload capability
- **v3.0.3** - Shift D option + modal scroll fixes
- **v3.0.2** - CM task display fixes
- **v3.0.1** - Firebase sync fixes
- **v3.0** - Firebase real-time synchronization
- **v2.3.2** - Previous stable version

---

**Upgrade Recommended**: This version completes the photo documentation feature by making photos visible in generated reports for compliance and record-keeping.
