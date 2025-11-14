# エクササイズ作成時の400エラー修正

## 問題
エクササイズを画像付きで作成しようとすると、以下のエラーが発生：
```
WARNING 2025-11-13 10:56:04,440 log Bad Request: /api/workouts/exercises/
WARNING 2025-11-13 10:56:04,441 basehttp "POST /api/workouts/exercises/ HTTP/1.1" 400 49
```

## 原因
FormDataで`primary_muscles`と`secondary_muscles`（JSONFieldの配列）を送信する際、個別の値として送信していたため、バックエンドで正しく解析できませんでした。

### 問題のあったコード
```javascript
// 間違った方法：各要素を個別に追加
primaryMuscles.forEach(muscle => exerciseData.append('primary_muscles', muscle));
```

DjangoのJSONFieldは配列を期待していますが、この方法では複数の同名キーが送信され、正しく解析されません。

## 修正内容

### 1. フロントエンド修正 (`frontend/src/pages/Workouts.jsx`)

FormDataで配列をJSON文字列として送信：

```javascript
// 正しい方法：JSON文字列として送信
exerciseData.append('primary_muscles', JSON.stringify(primaryMuscles));
exerciseData.append('secondary_muscles', JSON.stringify(newExerciseData.secondary_muscles || []));
```

### 2. バックエンド修正 (`backend/apps/workouts/serializers.py`)

#### シリアライザーに`to_internal_value`メソッドを追加

JSON文字列を自動的に配列に変換：

```python
def to_internal_value(self, data):
    """Convert JSON strings to arrays for JSONField"""
    # Handle FormData JSON strings
    if isinstance(data.get('primary_muscles'), str):
        try:
            data = data.copy() if hasattr(data, 'copy') else dict(data)
            data['primary_muscles'] = json.loads(data['primary_muscles'])
        except (json.JSONDecodeError, TypeError):
            pass
    
    if isinstance(data.get('secondary_muscles'), str):
        try:
            if not hasattr(data, 'copy'):
                data = dict(data)
            data['secondary_muscles'] = json.loads(data['secondary_muscles'])
        except (json.JSONDecodeError, TypeError):
            pass
    
    return super().to_internal_value(data)
```

### 3. デバッグログの追加 (`backend/apps/workouts/views.py`)

`ExerciseViewSet`に詳細なログを追加：

```python
def create(self, request, *args, **kwargs):
    """Override create to add logging"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Exercise create request data: {request.data}")
    logger.info(f"Request content type: {request.content_type}")
    logger.info(f"Request FILES: {request.FILES}")
    
    serializer = self.get_serializer(data=request.data)
    if not serializer.is_valid():
        logger.error(f"Serializer validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    self.perform_create(serializer)
    headers = self.get_success_headers(serializer.data)
    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
```

## テスト手順

1. **サーバーを再起動**：
```bash
# バックエンド
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# 新しいターミナルでフロントエンド
cd frontend
npm run dev
```

2. **エクササイズを作成**：
   - Workoutsページの「エクササイズライブラリ」タブを開く
   - 「エクササイズを追加」ボタンをクリック
   - フォームに入力：
     - 名前：テストエクササイズ
     - タイプ：筋力トレーニング
     - 筋肉群：胸（必須）
     - 器具：ダンベル
     - 難易度：中級
     - 画像をアップロード
   - 「追加」ボタンをクリック

3. **確認事項**：
   - エラーなく作成完了
   - トーストメッセージ「エクササイズを作成しました」が表示
   - エクササイズライブラリにサムネイル付きで表示される

## デバッグ方法

エラーが発生した場合、ログを確認：

```bash
# バックエンドログを確認
cd backend
Get-Content .\logs\*.log -Tail 100
```

ログに以下の情報が出力されます：
- リクエストデータの内容
- Content-Type
- アップロードされたファイル
- バリデーションエラー（ある場合）

## 関連ファイル

- `frontend/src/pages/Workouts.jsx` - FormData送信ロジック
- `backend/apps/workouts/serializers.py` - データ変換ロジック
- `backend/apps/workouts/views.py` - デバッグログ

## 技術的な説明

### FormDataとJSONFieldの扱い

DjangoのJSONFieldは以下の形式を期待：
```json
{
  "primary_muscles": ["胸", "肩"],
  "secondary_muscles": ["腕"]
}
```

FormDataで送信する場合：
- ❌ 間違い：`formData.append('primary_muscles', '胸'); formData.append('primary_muscles', '肩');`
- ✅ 正しい：`formData.append('primary_muscles', JSON.stringify(['胸', '肩']));`

シリアライザーの`to_internal_value`メソッドで、JSON文字列を自動的にPython配列に変換します。
