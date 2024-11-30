# 医疗陪诊小程序接口文档

## 目录
- [用户相关](#用户相关)
- [陪诊员相关](#陪诊员相关) 
- [订单相关](#订单相关)
- [评价相关](#评价相关)
- [支付相关](#支付相关)
- [系统相关](#系统相关)

## 用户相关

### 用户登录
```
POST /login

请求参数:
{
  "code": "wx.login获取的code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像地址",
    "gender": 1  // 1男 2女
  }
}

响应数据:
{
  "success": true,
  "data": {
    "token": "登录凭证",
    "userInfo": {
      "id": "用户ID",
      "nickName": "昵称",
      "avatarUrl": "头像",
      "gender": 1,
      "phone": "手机号",
      "createTime": "注册时间"
    }
  }
}
```

### 绑定手机号
```
POST /bindPhone

请求参数:
{
  "phone": "手机号",
  "code": "验证码"
}

响应数据:
{
  "success": true,
  "data": {
    "phone": "手机号"
  }
}
```

### 发送验证码
```
POST /sendSmsCode

请求参数:
{
  "phone": "手机号"
}

响应数据:
{
  "success": true,
  "data": {
    "expireTime": "过期时间"
  }
}
```

### 更新用户信息
```
POST /updateUserInfo

请求参数:
{
  "nickName": "昵称",
  "avatarUrl": "头像",
  "gender": 1,
  "region": ["省","市","区"],
  "address": "详细地址",
  "emergencyContact": "紧急联系人",
  "emergencyPhone": "紧急联系人电话"
}

响应数据:
{
  "success": true,
  "data": {
    "userInfo": "更新后的用户信息"
  }
}
```

## 陪诊员相关

### 陪诊员注册
```
POST /submitEscortRegistration

请求参数:
{
  "name": "姓名",
  "gender": "性别",
  "idCard": "身份证号",
  "phone": "手机号",
  "avatar": "头像",
  "region": ["省","市","区"],
  "serviceTypes": ["普通陪诊","专业陪诊"],
  "introduction": "自我介绍",
  "idCardFront": "身份证正面照片",
  "idCardBack": "身份证反面照片", 
  "healthCert": "健康证照片",
  "experience": "工作年限"
}

响应数据:
{
  "success": true,
  "data": {
    "registrationId": "注册ID"
  }
}
```

### 陪诊员登录
```
POST /escortLogin

请求参数:
{
  "phone": "手机号",
  "code": "验证码"
}

响应数据:
{
  "success": true,
  "data": {
    "token": "登录凭证",
    "escortInfo": {
      "id": "陪诊员ID",
      "name": "姓名",
      "avatar": "头像",
      "phone": "手机号",
      "status": "状态"
    }
  }
}
```

### 更新工作状态
```
POST /updateWorkStatus

请求参数:
{
  "isOnline": true  // 是否在线
}

响应数据:
{
  "success": true
}
```

### 更新排班信息
```
POST /updateSchedule

请求参数:
{
  "schedules": [{
    "date": "2024-03-20",
    "timeSlots": ["上午","下午"]
  }],
  "workingDays": [1,2,3,4,5],  // 工作日
  "workingHours": {
    "start": "08:00",
    "end": "18:00"
  }
}

响应数据:
{
  "success": true,
  "data": {
    "conflictOrders": 0  // 冲突订单数
  }
}
```

### 请假申请
```
POST /requestLeave

请求参数:
{
  "startDate": "开始日期",
  "endDate": "结束日期",
  "reason": "请假原因",
  "type": "请假类型"
}

响应数据:
{
  "success": true,
  "data": {
    "leaveId": "请假记录ID"
  }
}
```

## 订单相关

### 创建订单
```
POST /createOrder

请求参数:
{
  "patientInfo": {
    "name": "就医人姓名",
    "idCard": "身份证号",
    "phone": "手机号"
  },
  "hospitalId": "医院ID",
  "departmentId": "科室ID",
  "appointmentDate": "就医日期",
  "timeSlot": "就医时段",
  "services": [{
    "id": "服务ID",
    "name": "服务名称",
    "price": "服务价格"
  }],
  "totalPrice": "订单总价",
  "remark": "备注",
  "escortId": "陪诊员ID"
}

响应数据:
{
  "success": true,
  "data": {
    "orderId": "订单ID",
    "orderNo": "订单编号"
  }
}
```

### 接受订单
```
POST /acceptOrder

请求参数:
{
  "orderId": "订单ID"
}

响应数据:
{
  "success": true
}
```

### 完成订单
```
POST /completeOrder

请求参数:
{
  "orderId": "订单ID"
}

响应数据:
{
  "success": true
}
```

### 取消订单
```
POST /cancelOrder

请求参数:
{
  "orderId": "订单ID",
  "reason": "取消原因"
}

响应数据:
{
  "success": true
}
```

## 评价相关

### 提交评价
```
POST /submitEvaluation

请求参数:
{
  "orderId": "订单ID",
  "escortId": "陪诊员ID",
  "ratings": {
    "attitude": 5,
    "professional": 5,
    "experience": 5
  },
  "comment": "评价内容",
  "images": ["图片地址"],
  "isAnonymous": false
}

响应数据:
{
  "success": true,
  "data": {
    "evaluationId": "评价ID"
  }
}
```

### 获取评价列表
```
GET /getEscortEvaluations

请求参数:
{
  "page": 1,
  "pageSize": 20
}

响应数据:
{
  "success": true,
  "data": {
    "total": "总数",
    "list": [{
      "id": "评价ID",
      "orderId": "订单ID",
      "userId": "用户ID",
      "ratings": {
        "attitude": 5,
        "professional": 5,
        "experience": 5
      },
      "comment": "评价内容",
      "images": ["图片地址"],
      "createTime": "评价时间",
      "order": "订单信息",
      "user": "用户信息"
    }],
    "page": 1,
    "pageSize": 20
  }
}
```

## 支付相关

### 创建支付订单
```
POST /createPayment

请求参数:
{
  "orderId": "订单ID",
  "totalFee": "支付金额(分)"
}

响应数据:
{
  "success": true,
  "data": {
    "payParams": "支付参数"
  }
}
```

### 查询支付结果
```
GET /queryPayment

请求参数:
{
  "orderId": "订单ID"
}

响应数据:
{
  "success": true,
  "data": {
    "isPaid": true,
    "payTime": "支付时间"
  }
}
```

### 申请退款
```
POST /refundOrder

请求参数:
{
  "orderId": "订单ID",
  "reason": "退款原因"
}

响应数据:
{
  "success": true,
  "data": {
    "refundId": "退款单号"
  }
}
```

## 系统相关

### 获取配置信息
```
GET /getConfig

响应数据:
{
  "success": true,
  "data": {
    "serviceTypes": ["普通陪诊","专业陪诊"],
    "timeSlots": ["上午","下午"],
    "cancelReasons": ["临时有事","其他原因"],
    "serviceAgreement": "服务协议内容",
    "privacyPolicy": "隐私政策内容"
  }
}
```

### 意见反馈
```
POST /submitFeedback

请求参数:
{
  "type": "反馈类型",
  "content": "反馈内容",
  "images": ["图片地址"],
  "contact": "联系方式"
}

响应数据:
{
  "success": true,
  "data": {
    "feedbackId": "反馈ID"
  }
}
```

### 版本检查
```
GET /checkVersion

请求参数:
{
  "version": "当前版本号"
}

响应数据:
{
  "success": true,
  "data": {
    "hasUpdate": false,
    "version": "最新版本号",
    "updateContent": "更新内容"
  }
} 