const db = require('../db/index')

exports.dictionaryList = (req, res) => {
    const sql_select = `select * from sys_dict where parent_id = 4 order by orders`
    db.query(sql_select, (err, results) => {
        if(err) return res.aa('网站类型查询报错', 500)
        const data = {
            dicts: results
        }
        res.aa("网站类型查询成功", 200, data)
    })
}
