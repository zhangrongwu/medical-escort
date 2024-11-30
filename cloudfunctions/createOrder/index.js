const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const orderNo = generateOrderNo()
    return await db.collection('orders').add({
      data: {
        openid: openid,
        orderNo: orderNo,
        status: 'UNPAID',
        hospitalName: event.hospitalName,
        department: event.department,
        appointmentDate: event.appointmentDate,
        patientName: event.patientName,
        phone: event.phone,
        price: event.price,
        createTime: db.serverDate()
      }
    })
  } catch (err) {
    console.error(err)
    return err
  }
}

function generateOrderNo() {
  const now = new Date()
  return 'PZ' + now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0') +
    String(Math.floor(Math.random() * 1000)).padStart(3, '0')
} 