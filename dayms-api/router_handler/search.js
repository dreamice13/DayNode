const db = require('../db/index')

exports.addSearchLog = (req, res) => {
    const searchInfo = req.body
    const sql = `insert into log_search set ?`
    // 用户id暂时默认设置为1000
    searchInfo.user_id = 1000
    searchInfo.create_time = Math.round(new Date().getTime()/1000).toString()
    db.query(sql, searchInfo, (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('添加搜索日志报错', 500)
        res.aa('添加搜索日志成功', 201)
    })
}