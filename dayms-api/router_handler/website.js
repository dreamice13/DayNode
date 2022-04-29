const db = require('../db/index')

exports.websiteList = (req, res) => {
    const pageNum = parseInt(req.query.pagenum)
    const pageSize = parseInt(req.query.pagesize)
    const serachWord = '%' + req.query.query + '%'
    const type = req.query.type
    const sql_total = `select * from website where name like ? `
    const sql_select = `select w.id, w.name, w.url, w.favicon, sd.name type, w.type type_id, w.create_time 
    from website w
    left join sys_dict sd on w.type = sd.id and sd.parent_id = 4 
    left join log_click lc on w.id = lc.website_id
    where w.name like ?
    ${type == "0" ? "" : "and w.type =" + type}
    order by lc.num_click desc
    limit ${(pageNum - 1)  * pageSize}, ${pageSize} `
    db.query(sql_total, serachWord, (err, results) => {
        const total = results.length
        db.query(sql_select, serachWord, (err, results1) => {
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
    const sqlSelect = `select count(1) count from website where url = ? or name = ?`
    websiteInfo.create_time = Math.round(new Date().getTime()/1000).toString()
    db.query(sqlSelect, [req.body.url, req.body.name], (err, results) => {
        if(err){
            return res.aa('插入查询website报错', 500)
        } else if(results[0].count == 0){
            db.query(sql, websiteInfo, (err, results) => {
                if(err || results.affectedRows !== 1) return res.aa('添加website报错', 500)
                return res.aa('添加网站成功', 201)
            })
        }  else  {
            return res.aa('该网站已存在，不需要重复添加', 422)
        }
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

exports.clickWebsite = (req, res) => {
    const id = req.params.id;
    const sql_select = `select num_click from log_click where website_id = ?`
    const sql_insert = `insert into log_click (user_id, website_id, num_click) values (1000, ?, 1)`
    const sql_update = `update log_click set num_click = ? where website_id = ?`
    db.query(sql_select, id, (err, results) => {
        if(err) return res.aa('网址访问埋点记录查询报错', 500)
        if(results.length == 0){
            db.query(sql_insert, id, (err, results) => {
                if(err || results.affectedRows !== 1) return res.aa('网址访问埋点记录新增报错', 500)
                return res.aa('网址访问埋点记录成功！', 200)
            })
        } else {
            let num_click = results[0].num_click + 1;
            db.query(sql_update, [num_click, id], (err, results) => {
                if(err || results.affectedRows !== 1) return res.aa('网址访问埋点记录更新报错', 500)
                return res.aa('网址访问埋点记录成功！', 200)
            })
        } 
    })  
}