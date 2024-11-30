const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    return await db.collection('patients').doc(event.id).update({
      data: {
        name: event.patient.name,
        gender: event.patient.gender,
        idCard: event.patient.idCard,
        phone: event.patient.phone,
        updateTime: db.serverDate()
      }
    })
  } catch (err) {
    console.error(err)
    return err
  }
} 