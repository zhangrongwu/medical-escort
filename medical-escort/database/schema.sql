-- 用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    openid TEXT UNIQUE,
    name TEXT,
    phone TEXT,
    avatar TEXT,
    gender TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 陪诊员表
CREATE TABLE escorts (
    id TEXT PRIMARY KEY,
    openid TEXT UNIQUE,
    name TEXT,
    phone TEXT,
    avatar TEXT,
    gender TEXT,
    id_card TEXT,          -- 身份证号
    id_card_front TEXT,    -- 身份证正面照片
    id_card_back TEXT,     -- 身份证背面照片
    health_cert TEXT,      -- 健康证
    service_areas TEXT,    -- 服务区域，JSON格式
    introduction TEXT,     -- 自我介绍
    status TEXT DEFAULT 'PENDING',
    online BOOLEAN DEFAULT false,
    balance INTEGER DEFAULT 0,  -- 余额，单位：分
    rating FLOAT DEFAULT 5.0,   -- 评分
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    order_no TEXT UNIQUE,      -- 订单号
    user_id TEXT,
    escort_id TEXT,
    patient_name TEXT,         -- 就医人姓名
    patient_gender TEXT,
    patient_age INTEGER,
    hospital_name TEXT,
    department_name TEXT,
    service_type TEXT,         -- 服务类型
    service_time DATETIME,     -- 服务时间
    amount INTEGER,            -- 订单金额，单位：分
    status TEXT DEFAULT 'PENDING',
    payment_status TEXT DEFAULT 'UNPAID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (escort_id) REFERENCES escorts(id)
);

-- 评价表
CREATE TABLE evaluations (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE,
    user_id TEXT,
    escort_id TEXT,
    rating INTEGER,            -- 评分(1-5)
    comment TEXT,              -- 评价内容
    images TEXT,               -- 图片，JSON数组
    reply TEXT,               -- 回复内容
    reply_time DATETIME,      -- 回复时间
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (escort_id) REFERENCES escorts(id)
);

-- 银行卡表
CREATE TABLE bank_cards (
    id TEXT PRIMARY KEY,
    escort_id TEXT,
    bank_name TEXT,
    card_number TEXT,
    holder_name TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (escort_id) REFERENCES escorts(id)
);

-- 提现记录表
CREATE TABLE withdrawals (
    id TEXT PRIMARY KEY,
    escort_id TEXT,
    card_id TEXT,
    amount INTEGER,            -- 提现金额，单位：分
    status TEXT DEFAULT 'PENDING',
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (escort_id) REFERENCES escorts(id),
    FOREIGN KEY (card_id) REFERENCES bank_cards(id)
);

-- 管理员表
CREATE TABLE admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,            -- 加密存储
    name TEXT,
    role TEXT DEFAULT 'admin',
    status TEXT DEFAULT 'ACTIVE',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 系统配置表
CREATE TABLE configs (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 操作日志表
CREATE TABLE operation_logs (
    id TEXT PRIMARY KEY,
    operator_id TEXT,         -- 操作者ID
    operator_type TEXT,       -- user/escort/admin
    action TEXT,             -- 操作类型
    target_type TEXT,        -- 操作对象类型
    target_id TEXT,          -- 操作对象ID
    detail TEXT,             -- 操作详情，JSON格式
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
); 