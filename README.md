# 医疗陪诊小程序

## 项目介绍
本项目包含医疗陪诊小程序的用户端和陪诊员工作台两个小程序,实现患者与陪诊员的在线匹配和服务管理。

## 项目结构
medical-escort/
├── client/ # 用户端小程序
│ ├── miniprogram/ # 小程序代码
│ └── cloudfunctions/ # 云函数
└── escort-end/ # 陪诊员工作台小程序
├── miniprogram/ # 小程序代码
└── cloudfunctions/ # 云函数


## 技术栈
- 前端框架: 微信小程序
- 后端服务: 微信云开发
- 数据库: 云数据库
- 存储: 云存储
- 计算: 云函数

## 功能模块

### 用户端
1. 首页
   - 轮播图展示
   - 服务分类导航
   - 热门医院推荐
   - 推荐陪诊员展示
   
2. 预约模块
   - 选择就医人
   - 选择医院科室
   - 选择就医时间
   - 选择陪诊服务
   - 填写备注信息
   - 在线支付

3. 订单模块
   - 订单列表展示
   - 订单状态跟踪
   - 订单详情查看
   - 订单评价功能
   - 申请退款

4. 用户中心
   - 个人资料管理
   - 就医人管理
   - 常用地址管理
   - 意见反馈
   - 关于我们

### 陪诊员工作台
1. 工作台
   - 在线状态切换
   - 新订单提醒
   - 订单列表管理
   - 订单状态更新
   - 位置签到打卡

2. 收入模块
   - 收入统计展示
   - 收入明细查询
   - 提现功能
   - 账单管理

3. 注册认证
   - 基本信息填写
   - 身份认证
   - 健康证上传
   - 审核状态查询

4. 个人中心
   - 资料管理
   - 排班管理
   - 请假申请
   - 培训管理
   - 系统通知

## 数据库设计

### users - 用户集合
json
{
"id": "用户ID",
"openid": "微信openid",
"nickName": "用户昵称",
"avatarUrl": "头像地址",
"gender": 1, // 1男 2女
"phone": "手机号",
"region": ["省", "市", "区"],
"address": "详细地址",
"emergencyContact": "紧急联系人",
"emergencyPhone": "紧急联系人电话",
"createTime": "创建时间",
"updateTime": "更新时间"
}

### escorts - 陪诊员集合
json
{
"id": "陪诊员ID",
"openid": "微信openid",
"name": "姓名",
"gender": "性别",
"idCard": "身份证号",
"phone": "手机号",
"avatar": "头像",
"region": ["省", "市", "区"],
"serviceTypes": ["普通陪诊", "专业陪诊"],
"introduction": "自我介绍",
"idCardFront": "身份证正面照片",
"idCardBack": "身份证反面照片",
"healthCert": "健康证照片",
"experience": "工作年限",
"status": "PENDING/ACTIVE/REJECTED",
"rating": 5.0,
"orderCount": 0,
"balance": 0,
"isOnline": false,
"createTime": "创建时间",
"updateTime": "更新时间"
}
### orders - 订单集合
son
{
"id": "订单ID",
"orderNo": "订单编号",
"openid": "用户openid",
"escortId": "陪诊员ID",
"escortName": "陪诊员姓名",
"escortPhone": "陪诊员电话",
"patientInfo": {
"name": "就医人姓名",
"idCard": "就医人身份证号",
"phone": "就医人电话"
},
"hospitalId": "医院ID",
"hospitalName": "医院名称",
"departmentId": "科室ID",
"departmentName": "科室名称",
"appointmentDate": "就医日期",
"timeSlot": "就医时段",
"services": [{
"id": "服务ID",
"name": "服务名称",
"price": "服务价格"
}],
"totalPrice": "订单总价",
"status": "UNPAID/PAID/PROCESSING/FINISHED/CANCELLED",
"remark": "备注",
"createTime": "创建时间",
"payTime": "支付时间",
"acceptTime": "接单时间",
"completeTime": "完成时间",
"updateTime": "更新时间"
}
### evaluations - 评价集合
json
{
"id": "评价ID",
"orderId": "订单ID",
"userId": "用户ID",
"escortId": "陪诊员ID",
"ratings": {
"attitude": "服务态度评分",
"professional": "专业水平评分",
"experience": "服务体验评分"
},
"comment": "评价内容",
"images": ["评价图片"],
"isAnonymous": "是否匿名",
"createTime": "创建时间"
}

## 环境配置

### 开发环境要求
- 微信开发者工具 1.06.2301180 或以上版本
- Node.js 12.0.0 或以上版本
- 云开发环境

### 环境变量配置
微信小程序
APPID=微信小程序APPID
APPSECRET=微信小程序密钥
支付相关
MCH_ID=商户号
MCH_KEY=商户密钥
NOTIFY_URL=支付回调地址
短信服务
SMS_APPID=短信服务APPID
SMS_APPKEY=短信服务密钥
SMS_SIGN=短信签名
SMS_TEMPLATE_ID=短信模板ID


## 部署步骤

1. 创建云开发环境
2. 初始化数据库
   ```bash
   cd cloudfunctions/initDatabase
   npm install
   npm run deploy
   ```

3. 部署云函数
   ```bash
   # 安装依赖
   npm install

   # 部署所有云函数
   npm run deploy
   ```

4. 上传云存储文件
   - 默认头像
   - 医院图片
   - 轮播图
   - 图标资源

5. 配置小程序
   - 修改 project.config.json 中的 appid
   - 修改 app.js 中的云环境 ID
   - 配置服务器域名

## 开发规范

### 命名规范
- 文件命名: kebab-case
- 变量命名: camelCase
- 常量命名: UPPER_CASE
- 组件命名: PascalCase

### 代码规范
- 使用 ESLint 进行代码检查
- 遵循小程序开发规范
- 使用 async/await 处理异步
- 统一错误处理

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建过程或辅助工具的变动

## 更新日志

### v1.0.0 (2024-03-20)
- 初始版本发布
- 实现基础功能

## 联系方式

如有问题请联系技术支持:
- 邮箱: support@example.com
- 电话: 123-4567-8900