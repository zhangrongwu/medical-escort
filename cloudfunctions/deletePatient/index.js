const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    return await db.collection('patients').doc(event.id).remove()
  } catch (err) {
    console.error(err)
    return err
  }
} 