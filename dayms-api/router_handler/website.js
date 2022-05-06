const db = require('../db/index')

exports.websiteList = (req, res) => {
    const pageNum = parseInt(req.query.pagenum)
    const pageSize = parseInt(req.query.pagesize)
    const serachWord = '%' + req.query.query + '%'
    // 获取标签并生成对应sql
    const tags = req.query.tags
    let tagSql = "";
    if(tags.length > 0){
        let count = tags.length;
        let tagStr = "";
        for(tag of tags){
            tagStr = tagStr + tag + ","
        }
        tagStr = tagStr.substring(0, tagStr.length - 1)
        tagSql = `AND w.id IN (SELECT webid FROM rel_web_tag WHERE tagid IN (${tagStr}) GROUP BY webid HAVING COUNT(webid) = ${count})`
    }
    // sql
    const sql_total = `select * from website where name like ? `
    const sql_select = `SELECT w.id, w.name, w.url, w.favicon, tags.tags_name, tags.tags_id, w.create_time,
        w.update_time, w.description, lc.num_click
    FROM website w
    LEFT JOIN (SELECT rwt.webid, GROUP_CONCAT(st.name) tags_name, GROUP_CONCAT(st.id) tags_id FROM rel_web_tag rwt 
            LEFT JOIN sys_tag st ON rwt.tagid = st.id
            GROUP BY rwt.webid) tags ON w.id = tags.webid
    LEFT JOIN log_click lc ON w.id = lc.website_id
    where w.name like ?
    ${tagSql}
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

exports.addWebsite = (req, res) => {debugger
    const websiteInfo = req.body;
    const tags = websiteInfo.tags.split(",");
    const time = Math.round(new Date().getTime()/1000).toString();
    delete websiteInfo.tags;
    const sql = `insert into website set ?`
    const sqlSelect = `select count(1) count from website where url = ? or name = ?`
    const sqlInsertRel = `insert into rel_web_tag set ?`
    websiteInfo.create_time = time
    db.query(sqlSelect, [req.body.url, req.body.name], (err, results) => {
        if(err){
            return res.aa('插入查询website报错', 500)
        } else if(results[0].count == 0){
            db.query(sql, websiteInfo, (err, results) => {
                if(err || results.affectedRows !== 1) return res.aa('添加website报错', 500)
                let webId = results.insertId;
                for(tag of tags){
                    let rel = {};
                    rel.webid = webId;
                    rel.tagid = parseInt(tag);
                    rel.create_time = time;
                    rel.update_time = time;
                    db.query(sqlInsertRel, rel, (err, results) => {
                        if(err || results.affectedRows !== 1) return res.aa('添加website标签报错', 500)
                    })
                }
                return res.aa('添加网站成功', 201)
            })
        }  else  {
            return res.aa('该网站已存在，不需要重复添加', 422)
        }
    })    
}

exports.updateWebsite = (req, res) => {
    // 获取参数
    const id = req.body.id;
    const name = req.body.name;
    const url = req.body.url;
    const tags = req.body.tags;
    const description = req.body.description;
    // 获取系统时间
    const update_time =  Math.round(new Date().getTime()/1000).toString();
    // 构造插入网站对象
    const webObj = {name, url, update_time, description}
    // sql:更新网站
    const sql = `update website set ? where id = ?`
    // sql:删除标签
    const sqlDelTag = `delete from rel_web_tag where id = ?`
    // sql:插入标签
    const sqlInsertRel = `insert into rel_web_tag set ?`
    // sql:更新标签
    const sqlUpdateRel = `update rel_web_tag set ? where id = ?`
    // sql:查询某个网站的标签
    const sqlSelectRel = `select * from rel_web_tag where webid = ?`
    db.query(sql, [webObj, id], async (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('修改website报错', 500)
            db.query(sqlSelectRel, id, async (err, results) => {
                let oldTagArr = []
                for(const oldTag of results){
                    // 如果旧标签不在新标签内，删除；在则不变
                    if(!tags.includes(oldTag.tagid)){
                        db.query(sqlDelTag, oldTag.id, async (err, results) => {
                            if(err) return res.aa('删除website标签报错', 500)
                        })
                    }
                    oldTagArr.push(oldTag.tagid)
                }
                // 如果新标签不在旧标签内，添加；在则不变
                for(const newTag of tags){
                    if(!oldTagArr.includes(newTag)){
                        let relWebTag = {};
                        relWebTag.webid = id;
                        relWebTag.tagid = newTag;
                        relWebTag.create_time = update_time;
                        relWebTag.update_time = update_time;
                        db.query(sqlInsertRel, relWebTag, (err, results) => {
                            if(err || results.affectedRows !== 1) return res.aa('添加website标签报错', 500)
                        })
                    }
                }
                return res.aa('修改网站成功！', 200)
            })

            /* db.query(sqlDelTag, id, async (err, results) => {
                if(err) return res.aa('删除website标签报错', 500)
                // 如果网站需要添加标签
                if(tags.length > 0){
                    for(let tag of tags){
                        let relWebTag = {};
                        relWebTag.webid = id;
                        relWebTag.tagid = tag;
                        db.query(sqlInsertRel, relWebTag, (err, results) => {
                            if(err || results.affectedRows !== 1) return res.aa('添加website标签报错', 500)
                        })
                    }
                    return res.aa('修改网站成功！', 200)
                } else {
                    return res.aa('修改网站成功！', 200)
                }
            }) */
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