const db = require('../db/index')

exports.tagList = (req, res) => {
    const pageNum = parseInt(req.query.pagenum)
    const pageSize = parseInt(req.query.pagesize)
    const serachWord = '%' + req.query.query + '%'
    const sqlSelTotal = `select * from sys_tag where name like ? `
    const sqlSelLimit = `select id, name, orders from sys_tag 
        where name like ?
        order by orders
        limit ${(pageNum - 1)  * pageSize}, ${pageSize} `
    db.query(sqlSelTotal, serachWord, (error, results) => {
        if (error) throw error
        const total = results.length
        db.query(sqlSelLimit, serachWord, (error, results1) => {
            if (error) throw error
            const data = {
                total: total,
                pagenum: pageNum,
                tags: results1
            }
            res.aa("获取标签列表成功", 200, data)
        })
        
    })
} 

exports.addTag = (req, res) => {
    const tagInfo = req.body
    const sql = `insert into sys_tag set ?`
    tagInfo.state = 0
    tagInfo.create_time = Math.round(new Date().getTime()/1000).toString()
    db.query(sql, tagInfo, (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('添加文章报错', 500)
        res.aa('添加文章成功', 201)
    })
}

exports.updateTag = (req, res) => {
    const sql = `update sys_tag set ? where id = ?`
    db.query(sql, [req.body, req.body.id], (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('修改文章报错', 500)
        return res.aa('修改文章成功！', 200)
    })
}

exports.deleteTag = (req, res) => {
    const id = req.params.id
    const sql = `delete from sys_tag where id = ?`
    db.query(sql, id, (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('删除文章报错', 500)
        return res.aa('删除文章成功！', 200)
    })
}

exports.updateArticleState = (req, res) => {
    const id = req.params.id
    const state = req.params.state
    const stateNum = state === 'true'? 1 : 0
    const sql = `update sys_tag set state = ? where id = ?`
    db.query(sql, [stateNum, id], (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('文章状态更新报错', 500)
        return res.aa('文章状态更新成功！', 200)
    })
}