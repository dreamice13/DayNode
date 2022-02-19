const db = require('../db/index')

exports.websiteList = (req, res) => {
    const pageNum = parseInt(req.query.pagenum)
    const pageSize = parseInt(req.query.pagesize)
    const serachWord = '%' + req.query.query + '%'
    const sql = `select * from website where name like ? `
    const sql1 = `select id, name, url, type, create_time from website where name like ? limit ${(pageNum - 1)  * pageSize}, ${pageSize} `
    db.query(sql, serachWord, (err, results) => {
        const total = results.length
        db.query(sql1, serachWord, (err, results1) => {
            const data = {
                total: total,
                pagenum: pageNum,
                websites: results1
            }
            res.aa("获取网站列表成功", 200, data)
        })
    })
} 

exports.addWebsite = (req, res) => {
    const websiteInfo = req.body
    const sql = `insert into website set ?`
    websiteInfo.create_time = Math.round(new Date().getTime()/1000).toString()
    db.query(sql, websiteInfo, (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('添加website报错', 500)
        res.aa('添加网站成功', 201)
    })
}

exports.updateWebsite = (req, res) => {
    const sql = `update website set ? where id = ?`
    db.query(sql, [req.body, req.body.id], (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('修改website报错', 500)
        return res.aa('修改网站成功！', 200)
    })
}

exports.deleteWebsite = (req, res) => {
    const id = req.params.id
    const sql = `delete from website where id = ?`
    db.query(sql, id, (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('删除website报错', 500)
        return res.aa('删除网站成功！', 200)
    })
}