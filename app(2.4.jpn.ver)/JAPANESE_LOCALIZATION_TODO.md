# 日本語化実装 TODO

## フロントエンド (React)

### 認証ページ
- [x] frontend/src/pages/auth/Login.jsx ✅
- [x] frontend/src/pages/auth/Register.jsx ✅

### レイアウトコンポーネント
- [x] frontend/src/components/layout/Navbar.jsx ✅
- [x] frontend/src/components/layout/Sidebar.jsx ✅
- [x] frontend/src/components/layout/Layout.jsx ✅ (日本語化不要)

### メインページ
- [x] frontend/src/pages/Dashboard.jsx ✅
- [x] frontend/src/pages/Measurements.jsx ✅
- [x] frontend/src/pages/Nutrition.jsx ✅
- [x] frontend/src/pages/Workouts.jsx ✅
- [x] frontend/src/pages/Progress.jsx ✅
- [x] frontend/src/pages/Recommendations.jsx ✅
- [x] frontend/src/pages/Profile.jsx ✅
- [x] frontend/src/pages/Settings.jsx ✅

### 共通コンポーネント
- [x] frontend/src/components/common/Button.jsx ✅ (日本語化不要)
- [x] frontend/src/components/common/Input.jsx ✅ (日本語化不要)

### ユーティリティ
- [x] frontend/src/utils/constants.js ✅
- [x] frontend/src/utils/helpers.js ✅
- [x] frontend/src/utils/validators.js ✅

## バックエンド (Django)

### ユーザーアプリ
- [x] backend/apps/users/models.py ✅
- [x] backend/apps/users/serializers.py ✅
- [x] backend/apps/users/views.py ✅

### その他のアプリ
- [x] backend/apps/measurements/models.py ✅
- [x] backend/apps/measurements/serializers.py ✅
- [x] backend/apps/nutrition/models.py ✅
- [x] backend/apps/workouts/models.py ✅
- [ ] backend/apps/nutrition/serializers.py
- [ ] backend/apps/workouts/serializers.py
- [ ] backend/apps/nutrition/views.py
- [ ] backend/apps/workouts/views.py
- [ ] backend/apps/recommendations/services.py

## 進捗状況
- 完了: 25/30 (83.3%)
- 進行中: 0/30
- 未着手: 5/30

## 完了したファイル
1. ✅ Login.jsx - ログインフォーム、エラーメッセージ
2. ✅ Register.jsx - 登録フォーム、バリデーションメッセージ
3. ✅ Navbar.jsx - ナビゲーション、通知、ユーザーメニュー
4. ✅ Sidebar.jsx - サイドバーメニュー項目
5. ✅ Dashboard.jsx - ダッシュボード、統計、クイックアクション
6. ✅ constants.js - 活動レベル、フィットネス目標、BMIカテゴリー
7. ✅ Measurements.jsx - 測定値入力、履歴、統計カード
8. ✅ Nutrition.jsx - 食事記録、栄養統計、お気に入り食品
9. ✅ Workouts.jsx - ワークアウト記録、エクササイズ選択、週間統計
10. ✅ Profile.jsx - プロフィール設定、個人情報、統計
11. ✅ Settings.jsx - 通知設定、パスワード変更、アカウント削除
12. ✅ Progress.jsx - 進捗追跡、グラフ、目標、達成
13. ✅ Recommendations.jsx - AIおすすめ、ワークアウトプラン、食事プラン
14. ✅ Layout.jsx - レイアウトコンポーネント（日本語化不要）
15. ✅ Button.jsx - ボタンコンポーネント（日本語化不要）
16. ✅ Input.jsx - 入力コンポーネント（日本語化不要）
17. ✅ helpers.js - ヘルパー関数、BMIカテゴリー、日付フォーマット
18. ✅ validators.js - バリデーションメッセージ
19. ✅ backend/apps/users/models.py - ユーザーモデル、verbose_name
20. ✅ backend/apps/users/serializers.py - シリアライザーエラーメッセージ
21. ✅ backend/apps/users/views.py - APIレスポンスメッセージ
22. ✅ backend/apps/measurements/models.py - 測定モデル、verbose_name
23. ✅ backend/apps/measurements/serializers.py - シリアライザーエラーメッセージ
24. ✅ backend/apps/nutrition/models.py - 栄養モデル、カテゴリー、verbose_name
25. ✅ backend/apps/workouts/models.py - ワークアウトモデル、運動タイプ、難易度
