-- 借入データテーブル
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('A', 'B')),
  principal NUMERIC(15, 2) DEFAULT 0,
  current_balance NUMERIC(15, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) NOT NULL,
  monthly_payment NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_created_at ON debts(created_at);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_debts_updated_at
  BEFORE UPDATE ON debts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) を有効化
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "Users can view their own debts"
  ON debts
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLSポリシー: ユーザーは自分のデータのみ挿入可能
CREATE POLICY "Users can insert their own debts"
  ON debts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLSポリシー: ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users can update their own debts"
  ON debts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLSポリシー: ユーザーは自分のデータのみ削除可能
CREATE POLICY "Users can delete their own debts"
  ON debts
  FOR DELETE
  USING (auth.uid() = user_id);

