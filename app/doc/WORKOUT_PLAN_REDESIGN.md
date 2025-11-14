# Workout Plan Redesign - Perbedaan dengan Workout

## 📋 Ringkasan Perubahan

Telah dilakukan redesign pada fitur **Workout Plan** untuk membedakannya dengan **Workout** biasa. Sekarang keduanya memiliki fungsi yang jelas dan berbeda:

### 🏋️ Workout (ワークアウト)
- **Fungsi**: Mencatat satu sesi latihan individual
- **Durasi**: Satu kali latihan (misalnya: 45 menit pada tanggal tertentu)
- **Penggunaan**: Log harian untuk melacak latihan yang sudah dilakukan
- **Contoh**: "Latihan Dada & Trisep - 1 Januari 2024"

### 📅 Workout Plan / Program (ワークアウトプログラム)
- **Fungsi**: Program latihan terstruktur jangka panjang
- **Durasi**: Beberapa minggu hingga bulan (misalnya: 8-12 minggu)
- **Penggunaan**: Template terstruktur dengan jadwal harian yang bisa diaktifkan
- **Contoh**: "12週間フルボディ改造プログラム" (Program Transformasi Full Body 12 Minggu)

## 🎯 Perubahan Frontend

### 1. Tab Workout Plan yang Diperbaharui

#### Sebelum:
- Tampilan sederhana seperti daftar biasa
- Tidak ada pembeda jelas dengan workout
- Hanya menampilkan nama dan durasi

#### Sesudah:
- **Grid Card Layout** dengan informasi lengkap:
  - Nama program dan deskripsi
  - Badge untuk status (aktif, dipilih)
  - Statistik: Durasi (minggu), Frekuensi (hari/minggu), Tingkat kesulitan
  - Goal badge (減量, 筋肉増強, dll)
  - Jumlah hari dalam program
- **Detail Panel** saat plan dipilih:
  - Overview lengkap program
  - Persyaratan dan equipment
  - Preview jadwal harian (Plan Days)
  - Tombol "Start Plan" untuk mengaktifkan

### 2. Sidebar - Active Program Section

#### Sebelum:
- Hanya list sederhana 3 plan teratas
- Tidak ada indikasi program aktif

#### Sesudah:
- **Active Program Card** dengan:
  - Visual gradient background (purple-pink)
  - Progress tracking (minggu ke-X dari Y)
  - Progress bar visual
  - Quick stats: workout minggu ini, tingkat pencapaian
  - Badge "実行中" (Sedang Berjalan)
- **Available Programs Section**:
  - Daftar program lain yang bisa dipilih
  - Badge tingkat kesulitan
  - Link cepat ke detail

### 3. Create Plan Form yang Disempurnakan

#### Penambahan:
- **Info box** di atas form menjelaskan perbedaan antara Workout dan Program
- Label yang lebih deskriptif:
  - "プログラム期間（週）" dengan hint "推奨2-16週"
  - "週あたりのトレーニング日数" dengan hint "推奨3-5日"
- Placeholder yang lebih informatif
- Helper text di bawah setiap field
- **Next Steps info box** menjelaskan bahwa:
  - Plan days dapat ditambahkan via Django admin
  - Schedule otomatis dibuat saat program diaktifkan

## 🎨 Perubahan Visual

### Color Scheme:
- **Workout**: Warna hijau untuk completed, biru untuk brand
- **Workout Plan**: Warna ungu/purple untuk membedakan sebagai "program"
  - Active Program: Purple-pink gradient
  - Selected Plan: Purple border
  - Plan cards: Purple accents

### Icons:
- **Workout**: `FiActivity`, `FiCheck`, `FiClock`
- **Workout Plan**: `FiStar`, `FiList`, `FiPlay` (untuk start program)

## 🔧 Struktur Backend yang Mendukung

Backend sudah memiliki struktur yang baik untuk mendukung perbedaan ini:

### Models:
1. **WorkoutPlan**
   - `duration_weeks`: Durasi program dalam minggu
   - `days_per_week`: Frekuensi per minggu
   - `goal`: Tujuan program (weight_loss, muscle_gain, dll)
   - `overview`: Penjelasan detail program
   - `requirements`: Persyaratan dan equipment

2. **WorkoutPlanDay**
   - Hari-hari individual dalam program
   - Bisa rest day atau training day
   - Memiliki nama dan deskripsi

3. **WorkoutPlanExercise**
   - Exercise untuk setiap hari
   - Set, reps, weight yang direkomendasikan

4. **WorkoutSchedule**
   - Tracking saat user mengaktifkan program
   - Start date, end date
   - Status aktif/completed
   - Progress tracking

5. **Workout**
   - Log individual workout session
   - Bisa terkait dengan WorkoutPlan atau standalone

## 📊 Fitur yang Sudah Ada vs Yang Perlu Dikembangkan

### ✅ Sudah Ada:
- Model dan serializer lengkap
- CRUD operations untuk semua model
- API endpoints untuk plan dan schedule
- Frontend display yang membedakan kedua konsep

### 🚧 Perlu Dikembangkan:
1. **Schedule Activation**:
   - UI untuk memilih start date dan activate plan
   - Auto-generate workout schedule dari plan
   - Calendar view untuk scheduled workouts

2. **Progress Tracking**:
   - Real-time progress calculation
   - Completion percentage
   - Week-by-week breakdown

3. **Plan Day Management**:
   - UI untuk menambah/edit plan days (saat ini via Django admin)
   - Drag & drop untuk reorder
   - Template exercises per day

## 💡 Manfaat Perubahan

### Untuk User:
1. **Jelas Terbeda**: Tidak bingung antara log harian vs program jangka panjang
2. **Guided Training**: Program terstruktur membantu mencapai goal
3. **Progress Visible**: Bisa melihat kemajuan dalam program
4. **Motivasi**: Status "active program" memberikan accountability

### Untuk Development:
1. **Separation of Concerns**: Kode lebih terorganisir
2. **Scalability**: Mudah menambah fitur per konsep
3. **User Experience**: Flow yang lebih intuitif

## 🎯 Next Steps Rekomendasi

1. **Implement Schedule Activation**:
   ```javascript
   // Modal untuk pilih start date
   // Generate WorkoutSchedule
   // Auto-create Workouts dari WorkoutPlanDays
   ```

2. **Progress Dashboard**:
   - Weekly view dengan completion status
   - Streaks dan achievements
   - Rest day recommendations

3. **Plan Templates**:
   - Pre-made plans untuk common goals
   - Import/export plans
   - Community sharing (optional)

## 📝 Technical Notes

### API Endpoints Already Available:
- `GET /api/workouts/workout-plans/` - List all plans
- `GET /api/workouts/workout-plans/{id}/` - Get plan details with days
- `POST /api/workouts/workout-plans/{id}/schedule/` - Schedule a plan
- `GET /api/workouts/workout-schedules/active/` - Get active schedule

### Frontend State Management:
```javascript
const [plans, setPlans] = useState([]);           // All available plans
const [selectedPlan, setSelectedPlan] = useState(null);  // Currently viewing
const [workouts, setWorkouts] = useState([]);     // Individual workout logs
```

## 📸 Screenshot Reference

Key UI improvements:
1. Tab 2 (Workout Plan): Grid layout dengan detail cards
2. Sidebar: Active Program section dengan progress
3. Create Plan Modal: Info boxes dan better labels
4. Selected Plan Details: Full overview dengan plan days preview

---

**Date**: 2025-01-14
**Status**: ✅ Frontend UI Completed
**Next**: Implement schedule activation and progress tracking
