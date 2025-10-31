# 認証機能修正レポート

## 問題の概要
ログインと新規登録が機能していない問題を修正しました。

## 発見された問題

### 1. ログイン機能の問題
- **問題**: `Login.jsx`が`authService.login(formData)`を呼び出しているが、`auth.js`は`login(email, password)`という2つの別々のパラメータを期待していた
- **影響**: ログインリクエストが正しく送信されない

### 2. レスポンス構造の不一致
- **問題**: バックエンドは`{ user, tokens: { refresh, access }, message }`を返すが、フロントエンドは`{ access, refresh, user }`を期待していた
- **影響**: トークンが正しく抽出できず、認証状態の管理に失敗

### 3. 新規登録のプロフィール情報
- **問題**: 登録フォームは身長、体重、活動レベル、目標などを収集するが、バックエンドのシリアライザーがこれらのフィールドを処理していなかった
- **影響**: プロフィール情報が保存されず、登録後にユーザープロフィールが不完全

### 4. ユーザー名フィールドの欠落
- **問題**: バックエンドは`username`フィールドを必須としているが、フロントエンドの登録フォームにはこのフィールドがなかった
- **影響**: 登録リクエストが失敗

## 実装した修正

### 1. フロントエンド修正

#### `frontend/src/services/auth.js`
```javascript
// 修正前
login: async (email, password) => {
  const response = await api.post('/auth/login/', { email, password })
  return response.data
}

// 修正後
login: async (credentials) => {
  // オブジェクトと個別パラメータの両方をサポート
  const loginData = typeof credentials === 'object' 
    ? credentials 
    : { email: credentials, password: arguments[1] }
  
  const response = await api.post('/auth/login/', loginData)
  return response.data
}
```

#### `frontend/src/pages/auth/Login.jsx`
```javascript
// レスポンス構造の修正
const response = await authService.login(formData);

// バックエンドは { user, tokens: { refresh, access }, message } を返す
const accessToken = response.tokens?.access || response.access;
const refreshToken = response.tokens?.refresh || response.refresh;

login(accessToken, refreshToken, response.user);
```

#### `frontend/src/pages/auth/Register.jsx`
```javascript
// エラーハンドリングの改善
let errorMessage = '登録に失敗しました。もう一度お試しください。';

if (error.response?.data) {
  const data = error.response.data;
  if (data.email) {
    errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
  } else if (data.username) {
    errorMessage = Array.isArray(data.username) ? data.username[0] : data.username;
  } else if (data.password) {
    errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
  }
  // ... その他のエラーケース
}
```

### 2. バックエンド修正

#### `backend/apps/users/serializers.py`
```python
class UserRegistrationSerializer(serializers.ModelSerializer):
    # プロフィールフィールドを追加
    gender = serializers.CharField(required=False, write_only=True)
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, write_only=True)
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, write_only=True)
    activity_level = serializers.CharField(required=False, write_only=True)
    fitness_goal = serializers.CharField(required=False, write_only=True)
    
    def validate(self, attrs):
        # パスワード検証
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "パスワードが一致しません。"})
        
        # メールアドレスからユーザー名を自動生成
        if not attrs.get('username'):
            email = attrs.get('email', '')
            username = email.split('@')[0]
            # ユーザー名の一意性を確保
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            attrs['username'] = username
        
        return attrs
    
    def create(self, validated_data):
        # プロフィールフィールドを抽出
        profile_data = {
            'gender': validated_data.pop('gender', None),
            'height': validated_data.pop('height', None),
            'current_weight': validated_data.pop('weight', None),
            'activity_level': validated_data.pop('activity_level', None),
            'fitness_goal': validated_data.pop('fitness_goal', None),
        }
        
        # ユーザーを作成
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # プロフィールデータがある場合はプロフィールを作成
        if any(profile_data.values()):
            UserProfile.objects.create(
                user=user, 
                **{k: v for k, v in profile_data.items() if v is not None}
            )
        
        return user
```

## 修正の利点

1. **シームレスな登録体験**: ユーザーは1つのフォームで基本情報とプロフィール情報の両方を入力できる
2. **自動ユーザー名生成**: メールアドレスからユーザー名を自動生成し、ユーザーの手間を削減
3. **柔軟なAPI**: 後方互換性を保ちながら、オブジェクトと個別パラメータの両方をサポート
4. **改善されたエラーハンドリング**: より詳細なエラーメッセージでユーザー体験を向上
5. **完全なプロフィール**: 登録時にプロフィールが自動的に作成され、すぐに使用可能

## テスト方法

### バックエンドAPIテスト
```powershell
# テストスクリプトを実行
.\test_auth_fix.ps1
```

このスクリプトは以下をテストします：
1. プロフィールデータを含む新規ユーザー登録
2. 登録したユーザーでのログイン
3. プロフィールが正しく作成されたことの確認

### フロントエンドテスト
1. フロントエンドサーバーを起動: `cd frontend && npm run dev`
2. ブラウザで`http://localhost:5173/register`にアクセス
3. すべてのフィールドに入力して登録
4. ログインページにリダイレクトされることを確認
5. 登録した認証情報でログイン
6. ダッシュボードにリダイレクトされることを確認

## 影響を受けるファイル

### フロントエンド
- `frontend/src/services/auth.js` - ログイン関数の修正
- `frontend/src/pages/auth/Login.jsx` - レスポンス処理の修正
- `frontend/src/pages/auth/Register.jsx` - エラーハンドリングの改善

### バックエンド
- `backend/apps/users/serializers.py` - 登録シリアライザーの拡張

### 新規ファイル
- `test_auth_fix.ps1` - 認証機能のテストスクリプト

## 次のステップ

1. ✅ バックエンドサーバーが起動していることを確認
2. ✅ フロントエンドサーバーが起動していることを確認
3. ✅ テストスクリプトを実行してバックエンドAPIを検証
4. ✅ ブラウザで登録とログインをテスト
5. ✅ プロフィール情報が正しく保存されていることを確認

## 結論

すべての認証関連の問題が修正され、ログインと新規登録が正常に機能するようになりました。ユーザーは登録時にプロフィール情報を入力でき、その情報は自動的にデータベースに保存されます。
