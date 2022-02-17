const db = require('../db/index')
var _ = require('lodash');

exports.menus = (req, res) => {
    const sql = `select * from sys_menu`
    db.query(sql, (err, menus) => {
        // 执行 SQL 语句失败
        if (err) {
            //   return res.send({ status: 1, message: err.message })
            return res.cc(err)
        }
        const menusObj = {};
        // 处理一级菜单
        for(idx in menus) {
            menu = menus[idx];
            
            if(menu.level == 0) {
                menusObj[menu.id] = {
                    "id":menu.id,
                    "authName":menu.name,
                    "path":menu.path,
                    "children":[],
                };
            }
        }

        // 处理二级菜单
        for(idx in menus) {
            menu = menus[idx];
            if(menu.level == 1) {
                parentmenuResult = menusObj[menu.parent_id];
                if(parentmenuResult) {
                    parentmenuResult.children.push({
                        "id":menu.id,
                        "authName":menu.name,
                        "path":menu.path,
                        "children":[],
                    });
                }
            }
        }
        const result = _.values(menusObj);
        res.send({
            data: result,
            meta: {
                ms: "获取菜单列表成功",
                status: 200
            }
        })
    })
}