# 🏀 DBO Basketball Academy Web Application

ระบบเว็บแอปพลิเคชันสำหรับ **DBO Basketball Academy** (ระบบพอร์ทัลผู้ปกครอง, เช็คชื่อนักเรียนแบบ Post-Teaching, ตารางเรียนปฏิทิน, จัดการสิทธิ์พี่น้อง, และ Sports Science Metrics)

พัฒนาด้วยสถาปัตยกรรม **Node.js** แยกหมวดหมู่โค้ดเป็นโมดูลอย่างเป็นระเบียบ สะอาดตา และแก้ไขง่าย

---

## 📁 โครงสร้างโปรเจกต์ (Project Architecture)

```
dbo-basketball-app/
├── package.json                 # Node.js project manifest & start scripts
├── server.js                    # Node.js native HTTP server & SPA fallback router
├── index.html                   # โครงสร้างหน้าเว็บหลัก (Clean HTML Skeleton ~2,600 บรรทัด)
├── sw.js                        # Service Worker สำหรับ PWA และ Push Notification
├── manifest.json                # PWA Web App Manifest
├── vercel.json                  # การตั้งค่า Vercel Deployment & Caching
│
├── api/                         # Backend API Serverless Functions
│   └── sync.js                  # ระบบ Real-Time Cloud State Sync & Merge Engine
│
├── css/                         # หมวดหมู่สไตล์และการแสดงผล
│   └── style.css                # Custom CSS, Typography, Safe-area & Animation
│
└── js/                          # รหัสโปรแกรม JavaScript แบ่งแยกตามหมวดหมู่
    ├── config/                  # ข้อมูลค่าคงที่และฐานข้อมูลเริ่มต้น
    │   ├── constants.js         # รายชื่อโค้ช, สิทธิ์พี่น้อง, หัวข้อ Real-time Topic
    │   └── initialData.js       # ข้อมูลนักเรียนตั้งต้น 54 คน (ค่าสมรรถภาพ & คอมเมนต์ว่างรอโค้ชกรอก)
    │
    ├── state/                   # ระบบจัดการสถานะและซิงค์ข้อมูล
    │   ├── store.js             # ตัวแปรสถานะส่วนกลาง, LocalStorage & Import/Export
    │   ├── siblingSync.js       # ระบบรวมสิทธิ์พี่น้อง (Pooled Quota) & ลิงก์เบอร์เดียวแยกคอร์ส
    │   └── cloudSync.js         # Real-Time Multi-Device Sync (MQTT WebSocket & Vercel API)
    │
    ├── modules/                 # ฟังก์ชันการทำงานแยกตามส่วนการใช้งาน (Domain Modules)
    │   ├── auth.js              # ระบบล็อกอินเบอร์โทรผู้ปกครอง & รหัสผ่านทีมโค้ช
    │   ├── parent.js            # หน้าพอร์ทัลผู้ปกครอง (Parent Portal), แจ้งลา/เข้าเรียน, รายชื่อเพื่อนร่วมคลาส
    │   ├── coach.js             # หน้าแดชบอร์ดโค้ช (Coach Roster), ปรับสิทธิ์ (+1, -1, +10), แก้ไขข้อมูลนักเรียน
    │   ├── attendance.js        # ระบบเช็คชื่อ TWS Post-Teaching (New Record, เลือกรอบวัน/เวลา, บันทึกประวัติ)
    │   ├── schedule.js          # ปฏิทินรวมประจำเดือน (Monthly Calendar) & ตารางเรียนประจำสัปดาห์
    │   ├── notification.js      # ระบบแจ้งเตือน (Lock Screen Notification, Web Audio & Web Push)
    │   └── pwa.js               # ระบบติดตั้งแอป (PWA Installation Banner & iOS Add to Home)
    │
    └── app.js                   # Application Main Entry Point & Router
```

---

## 🚀 วิธีการรันโปรเจกต์ (Getting Started)

### 1. รันในเครื่อง (Local Development)
ต้องมี [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป):

```bash
# ติดตั้ง dependencies (โปรเจกต์ใช้ Node.js native standard modules ไม่ต้องติดตั้ง npm packages เพิ่มเติม)
npm start

# หรือรันผ่านคำสั่ง node โดยตรง
node server.js
```
จากนั้นเปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

### 2. การ Deploy ขึ้น Vercel
โปรเจกต์รองรับการ Deploy บน Vercel แบบอัตโนมัติ โดย Vercel จะดึง `index.html`, โฟลเดอร์ `css/`, `js/` และรัน `api/sync.js` เป็น Serverless Function โดยตรง

- Production URL: `https://dbobasketball.vercel.app/`
