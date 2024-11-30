const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { status = 'upcoming', page = 1, pageSize = 20 } = event

  try {
    // 构建查询条件
    const matchCondition = {
      'participants.escortId': wxContext.OPENID
    }

    if (status === 'upcoming') {
      matchCondition.startTime = _.gt(db.serverDate())
    } else if (status === 'completed') {
      matchCondition.endTime = _.lt(db.serverDate())
    }

    // 聚合查询培训信息
    const { list } = await db.collection('trainings')
      .aggregate()
      .match(matchCondition)
      .lookup({
        from: 'training_records',
        let: {
          trainingId: '$_id',
          escortId: wxContext.OPENID
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$trainingId', '$$trainingId'] },
                  { $eq: ['$escortId', '$$escortId'] }
                ]
              }
            }
          }
        ],
        as: 'records'
      })
      .addFields({
        isCompleted: $.gt([$.size('$records'), 0]),
        score: $.arrayElemAt(['$records.score', 0])
      })
      .sort({
        startTime: 1
      })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .end()

    // 获取总数
    const { total } = await db.collection('trainings')
      .where(matchCondition)
      .count()

    return {
      success: true,
      data: {
        list: list.map(item => ({
          ...item,
          startTime: item.startTime.toLocaleString(),
          endTime: item.endTime.toLocaleString()
        })),
        pagination: {
          total,
          page,
          pageSize
        }
      }
    }
  } catch (err) {
    console.error('获取培训列表失败', err)
    return {
      success: false,
      error: err
    }
  }
} 