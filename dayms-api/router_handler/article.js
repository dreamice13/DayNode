const db = require('../db/index')

exports.articleList = (req, res) => {
    const pageNum = parseInt(req.query.pagenum)
    const pageSize = parseInt(req.query.pagesize)
    const serachWord = '%' + req.query.query + '%'
    const sql = `select * from article where name like ? `
    const sql1 = `select id, name, url, type, website, state, create_time from article where name like ? limit ${(pageNum - 1)  * pageSize}, ${pageSize} `
    db.query(sql, serachWord, (error, results) => {
        if (error) throw error
        const total = results.length
        db.query(sql1, serachWord, (error, results1) => {
            if (error) throw error
            for(idx in results1) {
                results1[idx].state = results1[idx].state === 0 ? false : true               
            }
            const data = {
                total: total,
                pagenum: pageNum,
                articles: results1
            }
            res.aa("获取文章列表成功", 200, data)
        })
        
    })
} 

exports.addArticle = (req, res) => {
    const articleInfo = req.body
    const sql = `insert into article set ?`
    articleInfo.state = 0
    articleInfo.create_time = Math.round(new Date().getTime()/1000).toString()
    db.query(sql, articleInfo, (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('添加文章报错', 500)
        res.aa('添加文章成功', 201)
    })
}

exports.updateArticle = (req, res) => {
    const sql = `update article set ? where id = ?`
    db.query(sql, [req.body, req.body.id], (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('修改文章报错', 500)
        return res.aa('修改文章成功！', 200)
    })
}

exports.deleteArticle = (req, res) => {
    const id = req.params.id
    const sql = `delete from article where id = ?`
    db.query(sql, id, (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('删除文章报错', 500)
        return res.aa('删除文章成功！', 200)
    })
}

exports.updateArticleState = (req, res) => {
    const id = req.params.id
    const state = req.params.state
    const stateNum = state === 'true'? 1 : 0
    const sql = `update article set state = ? where id = ?`
    db.query(sql, [stateNum, id], (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('文章状态更新报错', 500)
        return res.aa('文章状态更新成功！', 200)
    })
}