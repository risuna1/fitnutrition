# 🎭 デモユーザー作成ガイド

## 📋 概要

FitNutritionアプリのデモ用アカウントを作成する方法を説明します。

---

## 🚀 方法1: Django管理コマンド（推奨）

### 手順

1. **バックエンドディレクトリに移動**
```powershell
cd backend
```

2. **仮想環境をアクティベート**
```powershell
.\venv\Scripts\Activate.ps1
```

3. **デモユーザー作成コマンドを実行**
```powershell
python manage.py create_demo_user
```

### 作成されるデータ

このコマンドは以下を自動作成します：

#### ユーザー情報
- **メールアドレス**: demo@fitnutrition.com
- **パスワード**: demo123456
- **名前**: 山田 太郎
- **生年月日**: 1990年1月1日

#### プロフィール
- **性別**: 男性
- **身長**: 175cm
- **現在の体重**: 75kg
- **目標体重**: 70kg
- **活動レベル**: 中程度の活動
- **フィットネス目標**: 減量
- **体脂肪率**: 20%

#### 食事の好み
- **食事タイプ**: 雑食
- **アレルギー**: なし
- **嫌いな食べ物**: セロリ、パクチー
- **好きな食べ物**: 鶏肉、魚、野菜、果物
- **避ける成分**: 人工甘味料

#### 測定データ
- **過去30日分の体重データ**
- 徐々に減量する傾向のデータ
- 各測定に日本語のメモ付き

---

## 🌐 方法2: Web UIから登録

### 手順

1. **フロントエンドにアクセス**
```
http://localhost:5173/register
```

2. **登録フォームに入力**
```
ユーザー名: demo_user
メールアドレス: demo@fitnutrition.com
パスワード: demo123456
パスワード確認: demo123456
名前: 太郎
姓: 山田
```

3. **「新規登録」ボタンをクリック**

4. **プロフィール設定**
   - ログイン後、プロフィールページで追加情報を入力

---

## 🔧 方法3: API経由で作成

### cURLコマンド

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "email": "demo@fitnutrition.com",
    "password": "demo123456",
    "password2": "demo123456",
    "first_name": "太郎",
    "last_name": "山田"
  }'
```

### PowerShellコマンド

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/register/" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username":"demo_user","email":"demo@fitnutrition.com","password":"demo123456","password2":"demo123456","first_name":"太郎","last_name":"山田"}'
```

---

## 📊 作成後の確認

### ログイン

1. **フロントエンドのログインページにアクセス**
```
http://localhost:5173/login
```

2. **ログイン情報を入力**
```
メールアドレス: demo@fitnutrition.com
パスワード: demo123456
```

3. **「ログイン」ボタンをクリック**

### ダッシュボード確認

ログイン後、以下が表示されます：
- ✅ ユーザー名: 山田 太郎
- ✅ 現在の体重: 75kg
- ✅ BMI: 24.5
- ✅ 目標カロリー: 約2,095kcal/日
- ✅ 過去30日分の体重グラフ

---

## 🗑️ デモユーザーの削除

### Django管理画面から削除

1. **管理画面にアクセス**
```
http://127.0.0.1:8000/admin/
```

2. **スーパーユーザーでログイン**

3. **Users → demo@fitnutrition.com を選択**

4. **「削除」ボタンをクリック**

### コマンドで削除

```python
# Pythonシェルを起動
python manage.py shell

# ユーザーを削除
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.filter(email='demo@fitnutrition.com').delete()
```

---

## 🔄 デモユーザーの再作成

既存のデモユーザーがある場合、管理コマンドは自動的に削除してから新規作成します。

```powershell
python manage.py create_demo_user
```

---

## 📝 カスタマイズ

### デモデータのカスタマイズ

`backend/apps/users/management/commands/create_demo_user.py` を編集して、以下をカスタマイズできます：

- ユーザー情報（名前、メールアドレス、パスワード）
- プロフィール情報（身長、体重、目標）
- 測定データの期間と値
- 食事の好み

### 例: 女性ユーザーの作成

```python
demo_user = User.objects.create_user(
    username='demo_female',
    email='demo_female@fitnutrition.com',
    password='demo123456',
    first_name='花子',
    last_name='佐藤',
    date_of_birth=date(1995, 5, 15)
)

profile = UserProfile.objects.create(
    user=demo_user,
    gender='female',  # 女性に変更
    height=160.0,     # 身長を変更
    current_weight=55.0,  # 体重を変更
    target_weight=50.0,
    activity_level='light',
    fitness_goal='weight_loss',
    body_fat_percentage=25.0
)
```

---

## ⚠️ 注意事項

### セキュリティ

- **本番環境では使用しないでください**
- デモアカウントのパスワードは簡単なので、開発環境のみで使用
- 本番環境では強力なパスワードを使用

### データ

- デモユーザーは開発・テスト目的のみ
- 重要なデータは保存しないでください
- 定期的にデモデータをリセット可能

---

## 🎯 使用例

### 開発者向け

```powershell
# 1. デモユーザー作成
cd backend
.\venv\Scripts\Activate.ps1
python manage.py create_demo_user

# 2. サーバー起動
python manage.py runserver

# 3. フロントエンド起動（別ターミナル）
cd ../frontend
npm run dev

# 4. ブラウザでアクセス
# http://localhost:5173/login
# メール: demo@fitnutrition.com
# パスワード: demo123456
```

### デモ・プレゼンテーション向け

1. デモユーザーで事前にログイン
2. サンプルデータを追加（ワークアウト、食事記録）
3. グラフや統計を表示
4. 機能をデモンストレーション

---

## 📞 トラブルシューティング

### エラー: "User already exists"

```powershell
# 既存ユーザーを削除してから再実行
python manage.py shell
>>> from django.contrib.auth import get_user_model
>>> User = get_user_model()
>>> User.objects.filter(email='demo@fitnutrition.com').delete()
>>> exit()
python manage.py create_demo_user
```

### エラー: "No module named 'apps'"

```powershell
# 正しいディレクトリにいることを確認
cd backend
python manage.py create_demo_user
```

### エラー: "Database connection failed"

```powershell
# PostgreSQLが起動していることを確認
# データベースが作成されていることを確認
python manage.py migrate
```

---

## ✅ チェックリスト

デモユーザー作成前：
- [ ] PostgreSQLが起動している
- [ ] データベースマイグレーションが完了している
- [ ] 仮想環境がアクティベートされている
- [ ] backendディレクトリにいる

デモユーザー作成後：
- [ ] ログイン成功を確認
- [ ] ダッシュボードが表示される
- [ ] プロフィール情報が正しい
- [ ] 測定データが表示される

---

**作成日**: 2025年10月30日  
**バージョン**: 1.0  
**対象**: FitNutrition App
