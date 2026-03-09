-- =============================================================
-- N-BOM 機器ブロックマスター管理システム MVP スキーマ
-- Version: 3.0
-- Database: PostgreSQL 15+
-- =============================================================

BEGIN;

-- -----------------------------------------------------------
-- マスタ定義層
-- -----------------------------------------------------------

CREATE TABLE list_type_master (
    list_type_cd    VARCHAR(10)  PRIMARY KEY,
    list_type_name  VARCHAR(100) NOT NULL,
    category        VARCHAR(30)  NOT NULL,  -- 構造物/回転機/内蔵品/計装品/自動弁/手動弁
    display_color   VARCHAR(7)   DEFAULT '#6366F1',
    sort_order      INT          DEFAULT 0
);

COMMENT ON TABLE  list_type_master IS 'リストタイプマスタ：原価項目のカテゴリー定義';
COMMENT ON COLUMN list_type_master.category IS '大分類（ツリーのグルーピングに使用）';

CREATE TABLE param_def (
    param_def_id  SERIAL       PRIMARY KEY,
    list_type_cd  VARCHAR(10)  NOT NULL REFERENCES list_type_master(list_type_cd),
    param_no      VARCHAR(5)   NOT NULL,  -- D01〜D50, E01〜E40, F01〜F10
    label         VARCHAR(100) NOT NULL,  -- UIに表示するラベル（例: 口径, 弁種）
    data_type     VARCHAR(20)  NOT NULL DEFAULT 'text',  -- text/number/select
    unit          VARCHAR(20),             -- A, mm, kW 等
    options       JSONB,                   -- selectの場合の選択肢 ["BF","DI","GL"]
    sort_order    INT          DEFAULT 0,
    is_required   BOOLEAN      DEFAULT FALSE,

    UNIQUE (list_type_cd, param_no)
);

COMMENT ON TABLE  param_def IS 'パラメータ定義マスタ：D/E/F列の意味をリストタイプ別に定義';
COMMENT ON COLUMN param_def.param_no IS 'D01〜D50=設計条件, E01〜E40=仕様, F01〜F10=付帯';
COMMENT ON COLUMN param_def.data_type IS 'text=自由入力, number=数値, select=選択肢';

-- -----------------------------------------------------------
-- ブロックマスタ層
-- -----------------------------------------------------------

CREATE TABLE block_master (
    block_cd    VARCHAR(20)  PRIMARY KEY,
    block_name  VARCHAR(200) NOT NULL,
    segment     VARCHAR(20)  DEFAULT '共通',  -- 共通/電力/土壌/医薬/海外
    revision    VARCHAR(10)  DEFAULT '1.00',
    status      VARCHAR(10)  DEFAULT 'draft'
                             CHECK (status IN ('draft','published','deprecated')),
    notes       TEXT,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE block_master IS '機器ブロックマスタ：N-BOM第三階層の標準ブロック定義';

CREATE TABLE variation_axis (
    axis_id      SERIAL      PRIMARY KEY,
    block_cd     VARCHAR(20) NOT NULL REFERENCES block_master(block_cd) ON DELETE CASCADE,
    axis_no      SMALLINT    NOT NULL DEFAULT 1,  -- 1 or 2（最大2軸）
    axis_name    VARCHAR(100) NOT NULL,            -- 塔径×高さ
    axis_type_cd VARCHAR(5),                        -- 01 等

    UNIQUE (block_cd, axis_no)
);

COMMENT ON TABLE  variation_axis IS 'バリエーション軸：ブロック単位で「何を軸にバリエーションを持つか」を定義';
COMMENT ON COLUMN variation_axis.axis_no IS '1=第一軸, 2=第二軸';

CREATE TABLE variation_step (
    step_id     SERIAL       PRIMARY KEY,
    axis_id     INT          NOT NULL REFERENCES variation_axis(axis_id) ON DELETE CASCADE,
    step_code   VARCHAR(20)  NOT NULL,   -- !!1200 （Excelインポート互換キー）
    step_label  VARCHAR(100) NOT NULL,   -- D1200×H3500
    pclass_key  VARCHAR(20),             -- 1W1P
    sort_order  INT          DEFAULT 0,

    UNIQUE (axis_id, step_code)
);

COMMENT ON TABLE  variation_step IS 'バリエーション刻み：軸上の個々の設計条件バリエーション';
COMMENT ON COLUMN variation_step.step_code IS 'Excelグループコード互換（!!1200等）';

CREATE TABLE cost_item (
    item_cd        VARCHAR(30)  PRIMARY KEY,
    block_cd       VARCHAR(20)  NOT NULL REFERENCES block_master(block_cd) ON DELETE CASCADE,
    item_name      VARCHAR(200) NOT NULL,
    kiki_no_tmpl   VARCHAR(30),              -- FV-GFP01 等のテンプレート
    list_type_cd   VARCHAR(10)  NOT NULL REFERENCES list_type_master(list_type_cd),
    list_type_sub  VARCHAR(10),              -- L831細分類
    is_main_item   BOOLEAN      DEFAULT FALSE,
    base_qty       INT          DEFAULT 1,
    spare_qty      INT          DEFAULT 0,
    qty_scale_type VARCHAR(5)   DEFAULT 'a', -- a=系列比例
    oilfree        VARCHAR(10),              -- OR 等
    is_excluded    BOOLEAN      DEFAULT FALSE,
    sort_order     INT          DEFAULT 0,
    notes          TEXT
);

COMMENT ON TABLE  cost_item IS '原価項目：機器ブロックを構成する個々の機器・部材';
COMMENT ON COLUMN cost_item.kiki_no_tmpl IS '機器番号テンプレート（案件適用時にXXXY→実番号に置換）';
COMMENT ON COLUMN cost_item.is_excluded IS 'TRUE=標準構成から除外（UIでグレーアウト）';

CREATE INDEX idx_cost_item_block ON cost_item(block_cd);

CREATE TABLE item_step_spec (
    spec_id     SERIAL       PRIMARY KEY,
    item_cd     VARCHAR(30)  NOT NULL REFERENCES cost_item(item_cd) ON DELETE CASCADE,
    step_id     INT          REFERENCES variation_step(step_id) ON DELETE CASCADE,
                             -- NULL = デフォルト行（刻み未選択時）
    qty         INT,
    maker_name  VARCHAR(100),
    model_no    VARCHAR(100),
    pclass      VARCHAR(20),
    std_dwg_no  VARCHAR(50),
    url_3d      VARCHAR(500),

    UNIQUE (item_cd, step_id)
);

COMMENT ON TABLE  item_step_spec IS '原価項目×刻み仕様：刻み毎の基本仕様（メーカー/型式/図番等）';
COMMENT ON COLUMN item_step_spec.step_id IS 'NULL=デフォルト行。設計条件未選択時のプレースホルダー';

CREATE INDEX idx_item_step_spec_item ON item_step_spec(item_cd);
CREATE INDEX idx_item_step_spec_step ON item_step_spec(step_id);

CREATE TABLE item_param_value (
    value_id  SERIAL       PRIMARY KEY,
    spec_id   INT          NOT NULL REFERENCES item_step_spec(spec_id) ON DELETE CASCADE,
    param_no  VARCHAR(5)   NOT NULL,  -- D01, D02, ..., E20, F01 等
    val       VARCHAR(500) NOT NULL,

    UNIQUE (spec_id, param_no)
);

COMMENT ON TABLE  item_param_value IS 'パラメータ値：D/E/F列の実データ（EAV構造）';
COMMENT ON COLUMN item_param_value.param_no IS 'D01〜D50/E01〜E40/F01〜F10。意味はparam_defを参照';

CREATE INDEX idx_item_param_value_spec ON item_param_value(spec_id);

CREATE TABLE motor_spec (
    motor_id      SERIAL       PRIMARY KEY,
    spec_id       INT          NOT NULL REFERENCES item_step_spec(spec_id) ON DELETE CASCADE,
    motor_type    VARCHAR(50),
    output_kw     DECIMAL(10,2),
    rpm           INT,
    direction     VARCHAR(10),
    enclosure     VARCHAR(30),
    protection    VARCHAR(30),
    insulation    VARCHAR(10),
    connection    VARCHAR(30),
    manufacturer  VARCHAR(100),
    inverter_ctrl BOOLEAN      DEFAULT FALSE,

    UNIQUE (spec_id)
);

COMMENT ON TABLE motor_spec IS '電動機仕様：回転機（L002等）の電動機属性';

CREATE TABLE piping_pattern (
    pattern_id  SERIAL       PRIMARY KEY,
    block_cd    VARCHAR(20)  NOT NULL REFERENCES block_master(block_cd) ON DELETE CASCADE,
    step_id     INT          NOT NULL REFERENCES variation_step(step_id) ON DELETE CASCADE,
    pipe_size   VARCHAR(20)  NOT NULL,  -- 65A, 100A 等
    pipe_class  VARCHAR(20),            -- 1W1P

    UNIQUE (block_cd, step_id)
);

COMMENT ON TABLE piping_pattern IS '配管パターン：刻み毎の主配管口径マッピング';

CREATE TABLE block_document (
    doc_id       SERIAL       PRIMARY KEY,
    block_cd     VARCHAR(20)  NOT NULL REFERENCES block_master(block_cd) ON DELETE CASCADE,
    doc_type     VARCHAR(20)  NOT NULL DEFAULT 'block_flow',
                              -- block_flow / spec_sheet / other
    file_name    VARCHAR(200) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    notes        TEXT,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE block_document IS 'ブロック添付文書：PDF等の関連ファイル';

-- -----------------------------------------------------------
-- 案件層（Phase 2 実装、MVP段階ではテーブルのみ作成）
-- -----------------------------------------------------------

CREATE TABLE project (
    project_id   VARCHAR(30)  PRIMARY KEY,
    project_name VARCHAR(200) NOT NULL,
    client_name  VARCHAR(200),
    status       VARCHAR(10)  DEFAULT 'active'
                              CHECK (status IN ('active','completed','cancelled')),
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE project IS '【Phase 2】案件：個別プロジェクトの定義';

CREATE TABLE project_block (
    pj_block_id      SERIAL      PRIMARY KEY,
    project_id       VARCHAR(30) NOT NULL REFERENCES project(project_id),
    block_cd         VARCHAR(20) NOT NULL REFERENCES block_master(block_cd),
    selected_step_id INT         REFERENCES variation_step(step_id),
    train_count      INT         DEFAULT 1,   -- 系列数
    spare_count      INT         DEFAULT 0,
    notes            TEXT,

    UNIQUE (project_id, block_cd)
);

COMMENT ON TABLE  project_block IS '【Phase 2】案件ブロック：案件に適用されたブロックのインスタンス';
COMMENT ON COLUMN project_block.selected_step_id IS '案件で採用した刻み';
COMMENT ON COLUMN project_block.train_count IS '系列数（並列設置台数）';

CREATE TABLE pj_item_override (
    override_id    SERIAL      PRIMARY KEY,
    pj_block_id    INT         NOT NULL REFERENCES project_block(pj_block_id) ON DELETE CASCADE,
    item_cd        VARCHAR(30) NOT NULL REFERENCES cost_item(item_cd),
    override_field VARCHAR(50) NOT NULL,   -- maker_name / model_no / D02 等
    override_value VARCHAR(500),
    reason         TEXT,                    -- 変更理由

    UNIQUE (pj_block_id, item_cd, override_field)
);

COMMENT ON TABLE  pj_item_override IS '【Phase 2】案件原価項目オーバーライド：マスタとの差分のみ保持';
COMMENT ON COLUMN pj_item_override.override_field IS '上書き対象フィールド名 or パラメータ番号';

-- -----------------------------------------------------------
-- updated_at 自動更新トリガー
-- -----------------------------------------------------------

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_master_updated
    BEFORE UPDATE ON block_master
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- -----------------------------------------------------------
-- 初期マスタデータ投入
-- -----------------------------------------------------------

INSERT INTO list_type_master (list_type_cd, list_type_name, category, display_color, sort_order) VALUES
('L201', '製缶リスト',        '構造物', '#6366F1', 10),
('L002', 'ポンプリスト',      '回転機', '#3B82F6', 20),
('L136', 'ろ材リスト',        '内蔵品', '#22C55E', 30),
('L083', 'ストレーナーリスト', '内蔵品', '#14B8A6', 40),
('L121', '流量計リスト',      '計装品', '#F59E0B', 50),
('L122', '圧力計リスト',      '計装品', '#F59E0B', 51),
('L831', '計装品リスト',      '計装品', '#A855F7', 52),
('L151', '自動弁リスト',      '自動弁', '#EF4444', 60),
('L152', '手動弁リスト',      '手動弁', '#F97316', 70);

-- パラメータ定義（E000000028の実データから抽出）
INSERT INTO param_def (list_type_cd, param_no, label, data_type, unit, options, sort_order, is_required) VALUES
-- L201 製缶
('L201', 'D02', '塔径',   'text',   'mm',  NULL, 1, TRUE),
('L201', 'D03', '高さ',   'text',   'mm',  NULL, 2, TRUE),
('L201', 'D08', '材質',   'select', NULL,  '["SS400","SUS304","SUS316L"]', 3, TRUE),
-- L002 ポンプ
('L002', 'D01', '形式',       'select', NULL, '["横型渦巻","立型渦巻","水中ポンプ"]', 1, TRUE),
('L002', 'D22', 'ケーシング材', 'text',  NULL, NULL, 2, FALSE),
('L002', 'D23', 'インペラー材', 'text',  NULL, NULL, 3, FALSE),
-- L151 自動弁
('L151', 'D01', '弁種',     'select', NULL, '["BF","DI","GL","CH","BA"]', 1, TRUE),
('L151', 'D02', '口径',     'text',   'A',  NULL, 2, TRUE),
('L151', 'D03', '面間規格', 'select', NULL, '["JIS10K","JIS20K","ANSI150"]', 3, FALSE),
('L151', 'D04', '接続',     'select', NULL, '["WAFER","FF","RF"]', 4, FALSE),
('L151', 'D05', 'ボデー材', 'text',   NULL, NULL, 5, FALSE),
('L151', 'D06', 'シート材', 'text',   NULL, NULL, 6, FALSE),
('L151', 'D12', '駆動',     'select', NULL, '["A","M"]', 7, FALSE),
('L151', 'D13', '操作',     'select', NULL, '["DB","SP","SP,HINGE"]', 8, FALSE),
('L151', 'D17', 'リミットSW','select', NULL, '["有","無"]', 9, FALSE),
('L151', 'D18', 'ソレノイド','select', NULL, '["有","無"]', 10, FALSE),
-- L152 手動弁
('L152', 'D01', '弁種',     'select', NULL, '["BF","DI","GL","CH","CH(SP)","BA"]', 1, TRUE),
('L152', 'D02', '口径',     'text',   'A',  NULL, 2, TRUE),
('L152', 'D03', '面間規格', 'select', NULL, '["JIS10K","JIS20K"]', 3, FALSE),
('L152', 'D04', '接続',     'select', NULL, '["WAFER","FF","RF"]', 4, FALSE),
('L152', 'D05', 'ボデー材', 'text',   NULL, NULL, 5, FALSE),
('L152', 'D06', 'シート材', 'text',   NULL, NULL, 6, FALSE),
('L152', 'D12', '操作',     'select', NULL, '["GEAR","LEVER","HANDLE"]', 7, FALSE),
-- L136 ろ材
('L136', 'D05', '粒度',     'text',   'mm',  NULL, 1, FALSE),
('L136', 'D07', '洗浄有無', 'select', NULL,  '["有","無"]', 2, FALSE),
('L136', 'D08', 'ろ材種別', 'text',   NULL,  NULL, 3, TRUE),
-- L083 ストレーナー
('L083', 'D04', '種別',     'text',   NULL, NULL, 1, FALSE),
('L083', 'D06', 'スリット幅','text',  'mm', NULL, 2, FALSE),
('L083', 'D07', '材質',     'text',   NULL, NULL, 3, FALSE),
-- L121 流量計
('L121', 'D01', '種類',     'text',   NULL, NULL, 1, TRUE),
('L121', 'D02', '形式',     'text',   NULL, NULL, 2, FALSE),
('L121', 'D08', '接続規格', 'text',   NULL, NULL, 3, FALSE),
('L121', 'D39', '口径',     'text',   'A',  NULL, 4, FALSE),
-- L831 計装品
('L831', 'D15', '機器種別',   'text', NULL, NULL, 1, FALSE),
('L831', 'D19', '測定レンジ', 'text', NULL, NULL, 2, FALSE),
('L831', 'D21', '動作',       'text', NULL, NULL, 3, FALSE),
('L831', 'D22', '口径',       'text', 'A',  NULL, 4, FALSE),
('L831', 'D24', 'ボデー材',   'text', NULL, NULL, 5, FALSE),
('L831', 'D25', 'トリム材',   'text', NULL, NULL, 6, FALSE),
('L831', 'E20', '出力信号',   'text', NULL, NULL, 7, FALSE),
('L831', 'E21', '付属品',     'text', NULL, NULL, 8, FALSE);


COMMIT;
