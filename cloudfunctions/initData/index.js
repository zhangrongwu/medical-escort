const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 初始化医院数据
const hospitals = [
  {
    name: '浙一医院',
    level: '三级甲等',
    address: '浙江省杭州市上城区庆春路88号',
    imageUrl: 'cloud://xxx/hospitals/zy.jpg',
    departments: [
      { id: 1, name: '内科' },
      { id: 2, name: '外科' },
      { id: 3, name: '妇产科' },
      { id: 4, name: '儿科' },
      { id: 5, name: '骨科' }
    ],
    status: 'active',
    orderCount: 0
  },
  {
    name: '浙二医院',
    level: '三级甲等',
    address: '浙江省杭州市上城区解放路88号',
    imageUrl: 'cloud://xxx/hospitals/ze.jpg',
    departments: [
      { id: 1, name: '内科' },
      { id: 2, name: '外科' },
      { id: 3, name: '妇产科' },
      { id: 4, name: '儿科' }
    ],
    status: 'active',
    orderCount: 0
  }
]

// 初始化陪诊员数据
const escorts = [
  {
    name: '张护士',
    avatar: 'cloud://xxx/escorts/avatar1.jpg',
    gender: '女',
    phone: '13800138000',
    experience: 5,
    introduction: '从事护理工作5年，有丰富的陪诊经验',
    score: 4.8,
    orderCount: 100,
    status: 'active',
    isRecommended: true,
    price: 200,
    tag: '专业护士'
  },
  {
    name: '王医生',
    avatar: 'cloud://xxx/escorts/avatar2.jpg',
    gender: '男',
    phone: '13800138001',
    experience: 8,
    introduction: '退休主治医师，专业医疗知识丰富',
    score: 4.9,
    orderCount: 150,
    status: 'active',
    isRecommended: true,
    price: 300,
    tag: '退休医生'
  }
]

exports.main = async (event, context) => {
  try {
    // 插入医院数据
    for (const hospital of hospitals) {
      await db.collection('hospitals').add({
        data: hospital
      })
    }

    // 插入陪诊员数据
    for (const escort of escorts) {
      await db.collection('escorts').add({
        data: escort
      })
    }

    return {
      success: true,
      message: '初始化数据成功'
    }
  } catch (err) {
    console.error('初始化数据失败:', err)
    return {
      success: false,
      error: err
    }
  }
} 