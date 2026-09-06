# ⚡ DESCO Smart Prepaid Meter - Enterprise Backend & Automation Engine
> **ডাটাবেজ:** MySQL (`desco1`) | **পাসওয়ার্ড:** `rabbi1067` | **ফ্রেমওয়ার্ক:** FastAPI & Python 3.11+ | **অটোমেশন:** GitHub Actions & Cron

---

## 🌟 এই সিস্টেমে যা যা রয়েছে (Core Capabilities)

১. **মাল্টিপল ইউজার ও মাল্টিপল মিটার (Multi-User & Multi-Meter Architecture)**:
   - একজন ইউজারের একাধিক মিটার থাকতে পারে (যেমন: ফ্ল্যাট, অফিস, কারখানা, গ্রামের বাড়ি)।
   - প্রতিটি মিটারের জন্য আলাদা আলাদা কাস্টম থ্রেশহোল্ড সেট করা যায় (যেমন: মিটার ১-এ ৩০০ টাকা, মিটার ২-এ ২০০ টাকা, মিটার ৩-এ ১০০ টাকা)।

২. **স্মার্ট থ্রেশহোল্ড অটোমেশন ও অ্যালার্ট ডিসপ্যাচ**:
   - যখনই কোনো মিটারের ব্যালেন্স তার নির্ধারিত থ্রেশহোল্ডের নিচে নামবে (যেমন ২০০ টাকার নিচে), সাথে সাথে সিস্টেম সক্রিয় হয়ে সতর্কবার্তা পাঠাবে।
   - স্প্যাম রোধে স্মার্ট কুলডাউন মেকানিজম রয়েছে। ব্যালেন্স সংকটপূর্ণ লেভেলে নামলে তাৎক্ষণিক দ্বিতীয় জরুরি অ্যালার্ট পাঠাবে।

৩. **প্রফেশনাল বাইলিঙ্গুয়াল এইচটিএমএল ইমেইল (Professional Email Template)**:
   - ডেসকো অফিশিয়াল ব্র্যান্ডিং, জরুরি সতর্কতা ব্যানার, বর্তমান ব্যালেন্স, অনুমোদিত লোড, আনুমানিক বিদ্যুৎ থাকার দিন এবং তাৎক্ষণিক রিচার্জের লিংক ও ডেসকো ১৬১২০ হেল্পলাইন সহ সুন্দর ইমেইল।

৪. **সম্পূর্ণ ডাটাবেজ পারসিসটেন্স (100% MySQL Persistence)**:
   - প্রতিটি ব্যালেন্সের পাঠ `balance_history` টেবিলে টাইমস্ট্যাম্প সহ জমা হয়।
   - প্রতিবার মেইল পাঠানোর পূর্ণ বিবরণ `alert_dispatches` টেবিলে সংরক্ষিত হয় (কে পেল, কখন পেল, তৎকালীন ব্যালেন্স কত ছিল, স্ট্যাটাস sent নাকি simulated)।
   - ব্যবহারকারীর ড্যাশবোর্ডে রিয়েল-টাইম `notifications` তৈরি হয়।

৫. **GitHub Actions ও লোকাল ক্রন অটোমেশন (Zero-Touch Cloud Execution)**:
   - `.github/workflows/desco_meter_monitor.yml` রেডি করা রয়েছে। গিটহাবে পুশ করলে প্রতি ১ ঘণ্টা পরপর নিজে নিজে ব্যাকগ্রাউন্ডে চেক করবে অথবা Actions ট্যাবে গিয়ে **"Run workflow"** বাটনে এক ক্লিকে ম্যানুয়ালি রান করা যাবে।

---

## 🚀 লোকাল সেটআপ নির্দেশিকা (VS Code Setup Guide)

### ধাপ ১: MySQL ডাটাবেজ তৈরি এবং স্কিমা ইমপোর্ট
আপনার MySQL টার্মিনালে ঢুকে রান করুন:
```sql
create database desco1;
```
এরপর `backend/schema.sql` ফাইলটি এক্সিকিউট করুন:
```bash
mysql -u root -p desco1 < backend/schema.sql
# পাসওয়ার্ড চাইবে: rabbi1067
```
*(অথবা phpMyAdmin / MySQL Workbench-এ গিয়ে `schema.sql` ফাইলের পুরো কোড কপি করে Run করুন)*

---

### ধাপ ২: এনভায়রনমেন্ট ফাইল চেক
`backend/.env` ফাইলটিতে আপনার ক্রেডেনশিয়াল ইতিমধ্যেই প্রি-কনফিগার করা আছে:
```ini
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rabbi1067
MYSQL_DATABASE=desco1
```

> **ইমেইল পাঠানোর জন্য (Gmail / Mailgun):**
> আপনি যদি সরাসরি আপনার জিমেইল দিয়ে নোটিফিকেশন পাঠাতে চান, তবে `backend/.env`-এ দিন:
> ```ini
> SMTP_HOST=smtp.gmail.com
> SMTP_PORT=587
> SMTP_USER=your_email@gmail.com
> SMTP_PASSWORD=your_16_digit_google_app_password
> SMTP_USE_TLS=true
> ```

---

### ধাপ ৩: পাইথন ভার্চুয়াল এনভায়রনমেন্ট ও লাইব্রেরি ইনস্টল
VS Code টার্মিনালে রান করুন:
```bash
cd backend
python -m venv venv

# উইন্ডোজ হলে (Windows):
venv\Scripts\activate

# ম্যাক বা লিনাক্স হলে (Mac/Linux):
source venv/bin/activate

# প্রয়োজনীয় সব প্যাকেজ ইনস্টল করুন:
pip install -r requirements.txt
```

---

### ধাপ ৪: অটোমেটেড ক্রন স্ক্যানার এক ক্লিকে রান করুন
```bash
python cron_scanner.py
```
**আউটপুট দেখতে পাবেন:**
```text
⚡ [DESCO AUTOMATED CRON ENGINE] Starting Grid Telemetry Scan...
[*] Found 5 meter(s) across registered users...
[1/5] Scanning Meter: 'Banani Residence Flat 4B' (#4501239841)
     Owner: Tanvir Ahmed (user@desco.com)
     Configured Thresholds -> Low: ৳300.00 | Critical: ৳100.00
     Live Balance: ৳240.50 BDT
     🚨 THRESHOLD BREACHED: ৳240.50 <= ৳300.00 [WARNING ALERT]
     📨 Dispatching professional alert email to: user@desco.com
     [✓] Email dispatched and recorded in MySQL 'alert_dispatches' table.

[2/5] Scanning Meter: 'Gulshan Office Unit 201' (#4509871234)
     Configured Thresholds -> Low: ৳200.00 | Critical: ৳80.00
     Live Balance: ৳190.00 BDT
     🚨 THRESHOLD BREACHED: ৳190.00 <= ৳200.00 [WARNING ALERT]
     [✓] Email dispatched to user@desco.com.
...
```

তাৎক্ষণিক টেস্টের জন্য কুলডাউন উপেক্ষা করে ফোর্স রান করতে:
```bash
python cron_scanner.py --force
```

---

### ধাপ ৫: ফুল FastAPI ব্যাকএন্ড সার্ভার চালু করুন
```bash
uvicorn main:app --reload --port 8000
```
- 📘 **ইন্টারঅ্যাক্টিভ সোয়াগার ডকুমেন্টেশন (API Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)
- 📡 **অন-ডিমান্ড গ্রিড স্ক্যান এপিআই:** `POST http://localhost:8000/api/scan-all`
- 📨 **ডিসপ্যাচ হিস্টোরি অডিট:** `GET http://localhost:8000/api/alert-dispatches`

---

## 🌐 GitHub Actions এ ডিপ্লয়মেন্ট ও অটোমেশন গাইড

১. আপনার এই প্রজেক্টটি গিটহাব রিপোজিটরিতে পুশ করুন:
```bash
git add .
git commit -m "feat: complete multi-user multi-meter engine with MySQL desco1 and actions"
git push origin main
```

২. আপনার GitHub রিপোজিটরির **Settings -> Secrets and variables -> Actions** এ গিয়ে নিচের সিক্রেটগুলো দিন:
   - `MYSQL_HOST`: আপনার ক্লাউড বা রিমোট MySQL হোস্ট
   - `MYSQL_PASSWORD`: `rabbi1067`
   - `MYSQL_DATABASE`: `desco1`
   - `SMTP_USER`: আপনার ইমেইল অ্যাড্রেস
   - `SMTP_PASSWORD`: আপনার ইমেইল অ্যাপ পাসওয়ার্ড

৩. রিপোজিটরির **Actions** ট্যাবে যান:
   - বাম পাশে **"DESCO Smart Meter Automated Monitor & Email Dispatch"** দেখতে পাবেন।
   - **"Run workflow"** বাটনে ক্লিক করলে তাৎক্ষণিক কোড এক্সিকিউট হবে এবং সমস্ত মিটারের ব্যালেন্স অডিট করে যাদের থ্রেশহোল্ড পার হয়েছে তাদের সবার কাছে মেইল চলে যাবে!
   - এছাড়াও প্রতি ১ ঘণ্টা পর পর এটি নিজে থেকেই ক্লাউডে রান হবে।

---

## 🔑 ডিফল্ট সিস্টেম ইউজার একাউন্টস
| ইউজার টাইপ | ইমেইল | পাসওয়ার্ড | মিটারের সংখ্যা |
|---|---|---|---|
| **Super Admin** | `super@desco.com` | `123456` | সিস্টেম অ্যাডমিনিস্ট্রেটর |
| **Operations Admin** | `admin@desco.com` | `123456` | গ্রিড মনিটরিং অফিসার |
| **Citizen (Tanvir Ahmed)** | `user@desco.com` | `123456` | ৩টি মিটার (ফ্ল্যাট, অফিস, বাড়ি) |
| **Citizen (Sabbir Hossain)**| `sabbir@gmail.com` | `123456` | ২টি মিটার (শোরুম, ফ্যাক্টরি) |
