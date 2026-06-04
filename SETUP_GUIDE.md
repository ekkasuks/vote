# 📋 คู่มือติดตั้ง ระบบโหวตผลงานนักเรียน
## โรงเรียนบ้านใหม่ สพป.นครปฐม เขต 1

---

## ขั้นตอนที่ 1 — สร้าง Google Sheet

1. ไปที่ [sheets.google.com](https://sheets.google.com) → สร้าง Spreadsheet ใหม่
2. ตั้งชื่อ เช่น `ระบบโหวตผลงานนักเรียน`
3. คัดลอก **Spreadsheet ID** จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
4. ระบบจะสร้าง sheet ย่อย (voters, works, votes, config) ให้อัตโนมัติ

---

## ขั้นตอนที่ 2 — ติดตั้ง Google Apps Script

1. ใน Spreadsheet → เมนู **Extensions → Apps Script**
2. ลบโค้ดเดิมออกทั้งหมด → วางเนื้อหา `Code.gs` ที่ให้มา
3. บรรทัดแรกของไฟล์ แก้ไข:
   ```javascript
   const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID';
   ```
   ใส่ Spreadsheet ID ที่ได้จากขั้นตอนที่ 1
4. กด **Save** (Ctrl+S)
5. รันฟังก์ชัน `initSheets` ก่อนครั้งแรก:
   - เลือก `initSheets` จาก dropdown → กด **Run**
   - อนุญาต Permission ที่ระบบถาม
6. **Deploy เป็น Web App:**
   - กด **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - กด **Deploy** → คัดลอก **Web App URL**

---

## ขั้นตอนที่ 3 — ตั้งค่า Google Drive (สำหรับรูปผลงาน)

1. อัปโหลดรูปผลงานนักเรียนไปที่ Google Drive
2. คลิกขวาที่รูป → **Share → Anyone with the link → Viewer**
3. คัดลอก **File ID** จาก URL:
   ```
   https://drive.google.com/file/d/[FILE_ID]/view
   ```
4. นำ File ID ไปใส่ในหน้า Settings ของเว็บแอพ

---

## ขั้นตอนที่ 4 — ติดตั้งบน GitHub Pages

1. สร้าง Repository ใหม่บน GitHub
2. อัปโหลดไฟล์ `index.html` ที่ให้มา
3. แก้ไขบรรทัดนี้ในไฟล์ `index.html`:
   ```javascript
   const GAS_URL = 'YOUR_GAS_WEB_APP_URL';
   ```
   ใส่ Web App URL จากขั้นตอนที่ 2
4. ไปที่ Repository Settings → **Pages**
5. Source: **main branch / root**
6. เว็บจะพร้อมใช้งานที่ `https://[username].github.io/[repo-name]`

---

## การใช้งาน

### สำหรับนักเรียน/ผู้โหวต
1. เข้าเว็บ → เลือกชื่อของตัวเอง
2. เลือกผลงานที่ชอบ **3 อันดับ** (แตะที่รูปผลงาน)
3. กด **ยืนยันการโหวต** → โหวตได้ครั้งเดียวต่อคน

### สำหรับแอดมิน
1. กดปุ่ม ⚙️ มุมบนขวา → ใส่ PIN (ค่าเริ่มต้น: **1234**)
2. แท็บ **ตั้งค่า** จะปรากฏขึ้น
3. จัดการได้:
   - เพิ่ม/แก้ไข/ลบ รายชื่อผู้โหวต
   - เพิ่ม/แก้ไข/ลบ ผลงานนักเรียน (ใส่ Drive File ID)
   - เปิด/ปิดรับการโหวต
   - ล้างผลโหวตทั้งหมด
   - เปลี่ยน Admin PIN

### ดูผลคะแนน
- แท็บ **ผลคะแนน** → ดูได้ทุกคน ทุกเวลา
- แสดง Podium อันดับ 1-2-3 + ตารางคะแนนทุกผลงาน

---

## ระบบคะแนน
| อันดับที่เลือก | คะแนนที่ได้ |
|---|---|
| 🥇 อันดับ 1 | 3 คะแนน |
| 🥈 อันดับ 2 | 2 คะแนน |
| 🥉 อันดับ 3 | 1 คะแนน |

คะแนนรวมสูงสุด = ชนะเลิศ

---

## หมายเหตุสำคัญ
- ผู้โหวต 1 คน โหวตได้ **1 ครั้ง** เท่านั้น (ป้องกันโดย voterId ใน Google Sheet)
- รูปผลงานต้องตั้งค่า **Share → Anyone with link** ใน Google Drive จึงจะแสดงได้
- หากรูปไม่แสดง ให้ตรวจสอบว่า Sharing Permission ถูกต้อง

---

*จัดทำโดย นายเอกศักดิ์ ปรีติประสงค์ โรงเรียนบ้านใหม่*
