# エクササイズ画像表示の修正

## 問題
エクササイズライブラリタブで、エクササイズ作成時に画像をアップロードしても、サムネイルが表示されない問題がありました。

## 原因
1. バックエンドの`Exercise`モデルに`ImageField`がなく、`image_url`（URL文字列）フィールドしかありませんでした
2. フロントエンドで画像URLを正しく構築していませんでした
3. FormDataを送信する際のContent-Typeヘッダーが適切に設定されていませんでした

## 実施した修正

### 1. バックエンドの修正

#### `apps/workouts/models.py`
- `Exercise`モデルに`image`フィールドを追加しました：
```python
image = models.ImageField(upload_to='exercises/', blank=True, null=True)
```

#### `apps/workouts/serializers.py`
- `ExerciseSerializer`に`image`フィールドを追加しました：
```python
image = serializers.ImageField(required=False, allow_null=True)
```

#### データベースマイグレーション
- 新しいマイグレーションを作成して実行しました：
```bash
python manage.py makemigrations workouts
python manage.py migrate workouts
```

### 2. フロントエンドの修正

#### `src/services/api.js`
1. 画像URLを構築するヘルパー関数を追加：
```javascript
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  // If it's a relative path, construct full URL
  return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}
```

2. FormData送信時のContent-Typeヘッダー処理を改善：
```javascript
// If data is FormData, remove Content-Type header to let browser set it with boundary
if (config.data instanceof FormData) {
  delete config.headers['Content-Type']
}
```

#### `src/pages/Workouts.jsx`
1. `getImageUrl`ヘルパー関数をインポート
2. エクササイズライブラリの画像表示を改善：
```javascript
<Image
  src={getImageUrl(exercise.image) || exercise.image_url}
  alt={exercise.name}
  boxSize="60px"
  objectFit="cover"
  borderRadius="md"
  fallback={<Box>...</Box>}
/>
```

## テスト手順

1. バックエンドサーバーを起動：
```bash
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

2. フロントエンドサーバーを起動：
```bash
cd frontend
npm run dev
```

3. エクササイズライブラリタブで新しいエクササイズを作成：
   - 「エクササイズを追加」ボタンをクリック
   - エクササイズ情報を入力
   - 「デバイスから画像を選択」をクリックして画像をアップロード
   - プレビューが表示されることを確認
   - 「追加」をクリック

4. エクササイズライブラリに戻り、新しく追加したエクササイズのサムネイルが表示されることを確認

## 期待される結果

- エクササイズ作成時に画像をアップロードすると、プレビューが表示される
- エクササイズライブラリタブで、画像がアップロードされたエクササイズにサムネイルが表示される
- 画像がないエクササイズには、グレーのプレースホルダーアイコンが表示される
- 画像の読み込みに失敗した場合、フォールバックアイコンが表示される

## 注意事項

- 既存のエクササイズで`image_url`フィールドを使用している場合は、引き続き表示されます
- 新しく作成するエクササイズでは、`image`フィールド（ファイルアップロード）を使用することをお勧めします
- アップロードされた画像は`backend/media/exercises/`ディレクトリに保存されます

## 関連ファイル

- `backend/apps/workouts/models.py`
- `backend/apps/workouts/serializers.py`
- `backend/apps/workouts/migrations/0003_exercise_image_alter_exercise_exercise_type.py`
- `frontend/src/services/api.js`
- `frontend/src/pages/Workouts.jsx`
