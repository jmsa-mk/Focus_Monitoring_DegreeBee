<div align="center">

# DegreeBee

**AI-Powered Student Learning Platform with Focus Monitoring**

A community based video learning platform that helps students stay focused while they study, powered by real time tab activity tracking and client side computer vision.

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2-9553E9?logo=inertia&logoColor=white)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php&logoColor=white)](https://php.net)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks_Vision-0097A7?logo=google&logoColor=white)](https://developers.google.com/mediapipe)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Default Accounts](#default-accounts)
- [How Focus Monitoring Works](#how-focus-monitoring-works)
- [Computer Vision (Eye Tracking and Virtual Background)](#computer-vision-eye-tracking-and-virtual-background)
- [Roles and Premium Gating](#roles-and-premium-gating)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Configuration Notes](#configuration-notes)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## Overview

DegreeBee is a full stack learning platform where students share educational YouTube videos, study together inside classes, and keep themselves accountable with a focus monitoring system. While a student watches a video, the app tracks whether they stay on the tab and (optionally, for premium users) uses on device computer vision to detect when their eyes leave the screen. Every study session is scored and logged so students can review their focus history on their profile.

The project was built as a single sprint following a Scrum workflow and is structured as a monolithic Laravel application with an Inertia + React single page frontend.

---

## Key Features

### Learning and Video
- Community video library with infinite scroll, topic filtering, and search
- Add a video by pasting a YouTube link; the title is fetched automatically
- Video detail page with embedded player, 1 to 5 star ratings, and bookmarking
- YouTube style comment threads with nested replies, likes, edit, and delete
- Manage and edit your own uploaded videos

### Focus Monitoring
- State machine with four states: Focused, Idle, Distracted, and Paused
- Tiered warnings (gentle reminder, alert with beep, full screen overlay) as distraction time grows
- Integration with the YouTube IFrame API so monitoring only runs while the video is actually playing
- End session summary modal with a computed focus score
- Per session focus logs stored and visualized on the profile page

### Computer Vision (Premium)
- Eye tracking with MediaPipe Face Landmarker to detect when the user looks away
- Virtual background with MediaPipe Selfie Segmenter (blur or replace the background)
- All inference runs in the browser via WebAssembly, no camera frames are ever sent to the server

### Classes (Premium)
- Create, join (via class code), edit, and delete classes
- Learning Resources: curated videos inside a class
- Forum: post discussions with file attachments and an in app file preview
- Notes: Padlet style sticky notes with a masonry layout
- Question Bank: a Google Drive style file repository with upload progress and preview

### Profile and Gamification
- Aggregate study statistics, total study hours, and recent sessions
- Level system and achievements driven by accumulated focus time
- Avatar upload and password change

### Subscription
- Premium plans (monthly and yearly) with a mock payment flow
- Atomic database transactions for subscribe, renew, and cancel
- Full transaction audit log with human readable reference codes (TXN-XXXXXXXX)
- Dedicated transaction history page

### Admin Panel
- Role based admin area protected by dedicated middleware
- Dashboard with platform wide statistics (users, premium users, videos, classes, study hours, revenue, pending reports)
- User management: grant or revoke premium, promote or demote admins, delete users
- Content moderation for videos and classes
- Subscription transaction overview across all users

### Report to Admin
- Users can report suspicious videos or classes with a reason and optional detail
- Admin reports panel with status filters (pending, reviewed, dismissed) and a live pending count badge
- One click actions to review, dismiss, reopen, delete the report, or delete the reported content

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12, PHP 8.2 |
| Frontend | React 19, Inertia.js 2 |
| Styling | Tailwind CSS 4 (with dark mode) |
| Build tool | Vite 7 |
| Database | SQLite (default), works with MySQL or PostgreSQL |
| Computer Vision | MediaPipe Tasks Vision (Face Landmarker, Selfie Segmenter) |
| Icons | FontAwesome 7, lucide-react |
| Notifications | react-hot-toast |
| Video | YouTube IFrame API, YouTube oEmbed for titles |

---

## Architecture

DegreeBee uses Inertia.js as the bridge between the Laravel backend and the React frontend, which means there is no separate REST API to maintain. Controllers return Inertia responses that render React page components directly, while shared data (the authenticated user, flash messages, and the admin pending report count) is injected globally through a single Inertia middleware.

```
Browser (React 19 pages)
      |
      | Inertia visits (XHR + JSON props)
      v
Laravel 12 controllers  ->  Eloquent models  ->  SQLite
      |
      +-- EnsurePremium middleware (premium feature gating)
      +-- EnsureAdmin middleware   (admin area gating)
      +-- HandleInertiaRequests    (shared props)
```

The computer vision pipeline is fully client side. The webcam stream is processed in the browser with MediaPipe and WebAssembly, and only the resulting focus statistics (numbers, not images) are sent back to Laravel and stored.

---

## Getting Started

### Prerequisites

- PHP 8.2 or higher with the `pdo_sqlite` extension enabled
- Composer
- Node.js 18+ and npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/jmsa-mk/Focus_Monitoring_DegreeBee.git
cd degreebee

# 2. Install PHP dependencies
composer install

# 3. Create the environment file and app key
cp .env.example .env
php artisan key:generate

# 4. Create the SQLite database file
#    (Linux / macOS)
touch database/database.sqlite
#    (Windows PowerShell)
#    New-Item -ItemType File database/database.sqlite

# 5. Run migrations and seed the admin account
php artisan migrate --seed

# 6. Link storage for uploaded files (avatars, thumbnails, attachments)
php artisan storage:link

# 7. Install JS dependencies and build the frontend
npm install
npm run build
```

### Running in Development

Option A, run everything with one command:

```bash
composer dev
```

This starts the PHP server, the queue listener, the log viewer, and the Vite dev server concurrently.

Option B, run the two processes manually in separate terminals:

```bash
php artisan serve
npm run dev
```

The app will be available at `http://127.0.0.1:8000`.

---

## Default Accounts

The seeder creates an administrator account:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gmail.com` | `admin1234` |

Log in with this account to access the admin panel via the user menu in the navbar. Regular users can register through the sign up page; new accounts default to the `student` role.

---

## How Focus Monitoring Works

The focus monitor on the video detail page is a state machine with four states:

| State | Meaning |
|-------|---------|
| Focused | The video is playing and the tab is active |
| Idle | No mouse or keyboard activity for a while |
| Distracted | The user switched to another tab |
| Paused | The video is paused (monitoring is suspended) |

When the user becomes distracted, warnings escalate in tiers: a gentle text reminder, then an alert with an audible beep (Web Audio API), and finally a full screen overlay asking if they are still studying. Monitoring is gated behind the YouTube IFrame API so the timer only counts while the video is genuinely playing, not while it is buffering or paused. At the end of a session a summary modal shows the focus score, and the session is persisted to the `focus_logs` table for the profile statistics.

---

## Computer Vision (Eye Tracking and Virtual Background)

Premium users can enable two on device computer vision features:

- **Eye tracking** uses the MediaPipe Face Landmarker to estimate gaze and detect when the user looks away from the screen, feeding additional distraction time into the focus score.
- **Virtual background** uses the MediaPipe Selfie Segmenter to separate the person from the background, then composites a blurred or replaced background onto a canvas in real time.

Both features run entirely in the browser using WebAssembly. The camera feed never leaves the device, which keeps the feature private by design. Only numeric focus metrics are transmitted to the server.

---

## Roles and Premium Gating

There are two access tiers and one role flag:

- **Free vs Premium**: premium status is derived from the user's subscription tier and expiry date. Premium only routes (classes, forum, notes, question bank, eye tracking, virtual background) are protected by the `EnsurePremium` middleware.
- **Admin role**: users with `role = admin` access the `/admin` area, protected by the `EnsureAdmin` middleware. Admins automatically bypass the premium gate, so they can inspect every feature without a subscription.

---

## Project Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php            # register, login, logout
│   │   ├── VideoController.php           # explore, upload, rate, manage
│   │   ├── BookmarkController.php
│   │   ├── CommentController.php         # nested comments + likes
│   │   ├── ClassesController.php         # class CRUD
│   │   ├── ClassVideoController.php      # learning resources
│   │   ├── ForumPostController.php
│   │   ├── NoteController.php
│   │   ├── QuestionBankController.php
│   │   ├── EnrollmentsController.php
│   │   ├── FocusLogController.php        # store focus sessions
│   │   ├── ProfileController.php         # profile, avatar, password
│   │   ├── SubscriptionController.php    # premium + transactions
│   │   ├── ReportController.php          # user reports
│   │   └── AdminController.php           # admin dashboard + management
│   └── Middleware/
│       ├── EnsurePremium.php             # alias: premium
│       ├── EnsureAdmin.php               # alias: admin
│       └── HandleInertiaRequests.php     # shared Inertia props
├── Models/                               # Eloquent models (see Data Model)
└── Support/
    └── YoutubeHelper.php                 # fetches video titles

resources/js/
├── app.jsx                               # Inertia bootstrap
├── Pages/
│   ├── Home, Login, Register, Profile, EditProfile, ChangePassword
│   ├── ExploreVideos, UploadVideo, EditVideo, ManageVideo, VideoDetail, Bookmark
│   ├── ExploreClasses, CreateClass, EditClass, JoinClass, ClassDetail
│   ├── Subscription, TransactionHistory
│   └── Admin/
│       ├── Dashboard, Users, Videos, Classes, Transactions, Reports
└── Component/
    ├── Navbar, Footer, StarRating
    ├── CommentSection, ForumSection, NotesSection, QuestionBankSection
    ├── FilePreviewModal, ReportModal
    ├── AdminLayout, AdminPagination
    ├── useFaceTracker.js                 # MediaPipe Face Landmarker hook
    └── useVirtualBackground.js           # MediaPipe Selfie Segmenter hook

routes/
└── web.php                               # all application routes

database/
├── migrations/                           # schema
└── seeders/
    ├── DatabaseSeeder.php
    └── AdminSeeder.php                    # creates the admin account
```

---

## Data Model

| Model | Purpose |
|-------|---------|
| `User` | Accounts, role, subscription state, premium and admin accessors |
| `Video` | Shared YouTube videos |
| `Rating` | 1 to 5 star video ratings |
| `Bookmark` | Saved videos per user |
| `Comment` / `CommentLike` | Threaded comments and likes |
| `classes` | Study classes |
| `enrollments` | Class membership (pivot) |
| `ForumPost` / `ForumPostInsight` | Class forum posts and reactions |
| `Note` | Sticky notes inside a class |
| `QuestionBankFile` | Files in a class question bank |
| `FocusLog` | Per session focus statistics |
| `SubscriptionTransaction` | Premium payment audit log |
| `Report` | Polymorphic reports against videos or classes |

---

## Configuration Notes

### Large file uploads

The Forum and Question Bank features allow file uploads. PHP limits upload size by default (`upload_max_filesize` and `post_max_size`, often 2 MB). To allow larger files, raise these in your `php.ini`:

```ini
upload_max_filesize = 20M
post_max_size = 20M
```

The application also detects PHP upload errors (such as exceeding the size limit) and returns a clear message instead of failing silently.

### Database

The project ships with SQLite for zero configuration setup. To use MySQL or PostgreSQL instead, update the `DB_*` variables in your `.env` and re run the migrations.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `composer dev` | Run server, queue, logs, and Vite together |
| `php artisan serve` | Start the Laravel development server |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Build the production frontend bundle |
| `php artisan migrate --seed` | Run migrations and seed the admin account |
| `php artisan db:seed --class=AdminSeeder` | (Re)create the admin account only |
| `composer test` | Run the test suite |

---

## License

This project is built on the Laravel framework, which is open sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

<div align="center">

Built with Laravel, Inertia, and React.

</div>
