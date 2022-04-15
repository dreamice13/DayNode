const db = require('../db/index')

exports.englishList = (req, res) => {
    const pageNum = parseInt(req.query.pagenum)
    const pageSize = parseInt(req.query.pagesize)
    const serachWord = '%' + req.query.query + '%'
    const sql = `select * from english where name like ? `
    const sql1 = `select id, name, chinese, type, create_time from english where name like ? limit ${(pageNum - 1)  * pageSize}, ${pageSize} `
    db.query(sql, serachWord, (err, results) => {
        const total = results.length
        db.query(sql1, serachWord, (err, results1) => {
            const data = {
                total: total,
                pagenum: pageNum,
                englishs: results1
            }
            res.aa("获取英文单词列表成功", 200, data)
        })
    })
} 

exports.addEnglish = (req, res) => {
    const englishInfo = req.body
    const sql = `insert into english set ?`
    const sqlSelect = `select count(1) count from english where name = ?`
    englishInfo.create_time = Math.round(new Date().getTime()/1000).toString()
    db.query(sqlSelect, req.body.name, (err, results) => {
        if(err){
            return res.aa('插入查询english报错', 500)
        } else if(results[0].count == 0){
            db.query(sql, englishInfo, (err, results) => {
                if(err || results.affectedRows !== 1) return res.aa('添加english报错', 500)
                res.aa('添加英文单词成功', 201)
            })
        }  else  {
            return res.aa('该单词已存在，不需要重复添加', 422)
        }
    })
    
}

exports.updateEnglish = (req, res) => {
    const sql = `update english set ? where id = ?`
    db.query(sql, [req.body, req.body.id], (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('修改english报错', 500)
        return res.aa('修改英文单词成功！', 200)
    })
}

exports.deleteEnglish = (req, res) => {
    const id = req.params.id
    const sql = `delete from english where id = ?`
    db.query(sql, id, (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('删除english报错', 500)
        return res.aa('删除英文单词成功！', 200)
    })
}