// 导入数据库操作模块
const db = require('../db/index')
// 导入 bcryptjs
const bcrypt = require('bcryptjs')

// 获取用户基本信息的处理函数
exports.getUserInfo = (req, res) => {

    // 根据用户的 id，查询用户的基本信息
    // 注意：为了防止用户的密码泄露，需要排除 password 字段
    const sql = `select id, username, nickname, email, user_pic from ev_users where id=?`
    
    // 注意：req 对象上的 user 属性，是 Token 解析成功，express-jwt 中间件帮我们挂载上去的
    db.query(sql, req.user.id, (err, results) => {
        // 1. 执行 SQL 语句失败
        if (err) return res.cc(err)
    
        // 2. 执行 SQL 语句成功，但是查询到的数据条数不等于 1
        if (results.length !== 1) return res.cc('获取用户信息失败！')
    
        // 3. 将用户信息响应给客户端
        res.send({
            status: 0,
            message: '获取用户基本信息成功！',
            data: results[0],
        })
    })
  }

  // 更新用户基本信息的处理函数
exports.updateUserInfo = (req, res) => {
    const sql = `update ev_users set ? where id=?`
    db.query(sql, [req.body, req.body.id], (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
      
        // 执行 SQL 语句成功，但影响行数不为 1
        if (results.affectedRows !== 1) return res.cc('修改用户基本信息失败！')
      
        // 修改用户信息成功
        return res.cc('修改用户基本信息成功！', 0)
    })
}

// 重置密码的处理函数
exports.updatePassword = (req, res) => {
    // 定义根据 id 查询用户数据的 SQL 语句
    const sql = `select * from ev_users where id=?`

    // 执行 SQL 语句查询用户是否存在
    db.query(sql, req.user.id, (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)

        // 检查指定 id 的用户是否存在
        if (results.length !== 1) return res.cc('用户不存在！')

        // 在头部区域导入 bcryptjs 后，
        // 即可使用 bcrypt.compareSync(提交的密码，数据库中的密码) 方法验证密码是否正确
        // compareSync() 函数的返回值为布尔值，true 表示密码正确，false 表示密码错误
        const bcrypt = require('bcryptjs')

        // 判断提交的旧密码是否正确
        const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
        if (!compareResult) return res.cc('原密码错误！')

        // 定义更新用户密码的 SQL 语句
        const sql = `update ev_users set password=? where id=?`

        // 对新密码进行 bcrypt 加密处理
        const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

        // 执行 SQL 语句，根据 id 更新用户的密码
        db.query(sql, [newPwd, req.user.id], (err, results) => {
        // SQL 语句执行失败
        if (err) return res.cc(err)

        // SQL 语句执行成功，但是影响行数不等于 1
        if (results.affectedRows !== 1) return res.cc('更新密码失败！')

        // 更新密码成功
        res.cc('更新密码成功！', 0)
        })
    })
}

// 更新用户头像的处理函数
exports.updateAvatar = (req, res) => {
    const sql = 'update ev_users set user_pic=? where id=?'
    db.query(sql, [req.body.avatar, req.user.id], (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
        
        // 执行 SQL 语句成功，但是影响行数不等于 1
        if (results.affectedRows !== 1) return res.cc('更新头像失败！')
        
        // 更新用户头像成功
        return res.cc('更新头像成功！', 0)
    })
}

// 获取用户列表
exports.getUsers = (req, res) => {
    const pageNum = parseInt(req.query.pagenum)
    const pageSize = parseInt(req.query.pagesize)
    const serachWord = '%' + req.query.query + '%'
    const sql = `select * from sys_user where username like ? `
    const sql1 = `select id, username, mobile, email, user_pic, role_id, state, create_time from sys_user where username like ? limit ${(pageNum - 1)  * pageSize}, ${pageSize} `
    db.query(sql, serachWord, (err, results) => {
        const total = results.length
        db.query(sql1, serachWord, (err, results1) => {
            for(idx in results1) {
                results1[idx].state = results1[idx].state === 0 ? false : true
                results1[idx].role_name =  results1[idx].role_id === 1 ? '超级管理员' : '普通用户'
            }
            const data = {
                total: total,
                pagenum: pageNum,
                users: results1
            }
            res.aa("获取用户列表成功", 200, data)
        })
    })
}

// 添加用户
exports.addUser = (req, res) => {
    // 获取客户端提交到服务器的用户信息
    const userInfo = req.body
    
    // 定义 SQL 语句
    const sql = `select * from sys_user where username=?`
    db.query(sql, [userInfo.username], function (err, results) {
        // 执行 SQL 语句失败
        if (err) {
        //   return res.send({ status: 1, message: err.message })
            return res.cc(err)
        }
        // 用户名被占用
        if (results.length > 0) {
        //   return res.send({ status: 1, message: '用户名被占用，请更换其他用户名！' })
        //   return res.cc('用户名被占用，请更换其他用户名！')
            res.send({
                meta: {
                    ms: "用户名被占用，请更换其他用户名",
                    status: 422
                }
            })
        }
        // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
        userInfo.password = bcrypt.hashSync(userInfo.password, 10)

        // 定义插入用户的 SQL 语句
        const sql = 'insert into sys_user set ?'
        // 调用 db.query() 执行 SQL 语句，插入新用户
        db.query(sql, 
            { 
                username: userInfo.username, 
                password: userInfo.password,

                email: userInfo.email,
                mobile: userInfo.mobile,
                role_id: 2,
                state: 1,
                create_time: Math.round(new Date().getTime()/1000).toString()
             }, function (err, results) {
            // 执行 SQL 语句失败
            if (err) return res.cc(err)
            // SQL 语句执行成功，但影响行数不为 1
            if (results.affectedRows !== 1) {
                //   return res.send({ status: 1, message: '注册用户失败，请稍后再试！' })
                return res.aa('添加用户失败，请稍后再试！', 500)
            }
            // 注册成功
            // res.send({ status: 0, message: '注册成功！' })
            res.aa("添加用户成功", 201)
        })
          
    })
}

exports.updateUser = (req, res) => {
    const sql = `update sys_user set ? where id=?` 
    req.body.role_id = req.body.role_name === '超级管理员'? 1 : 2
    delete req.body.role_name
    db.query(sql, [req.body, req.body.id], (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
      
        // 执行 SQL 语句成功，但影响行数不为 1
        if (results.affectedRows !== 1) return res.aa('修改用户失败！', 500)
      
        // 修改用户信息成功
        return res.aa('修改用户成功！', 200)
    })
}

exports.deleteUser = (req, res) => {
    const id = req.params.id
    const sql = `delete from sys_user where id = ?`
    db.query(sql, id, (err, results) => {
        // 执行 SQL 语句成功，但影响行数不为 1
        if (results.affectedRows === 1) {
            res.aa("删除成功", 200)
        }
    })
    
}

exports.updateUserState = (req, res) => {
    const id = req.params.id
    const state = req.params.state
    const stateNum = state === 'true'? 1 : 0
    const sql = `update sys_user set state = ? where id = ?`
    db.query(sql, [stateNum, id], (err, results) => {
        if(err || results.affectedRows !== 1) return res.aa('用户状态更新报错', 500)
        return res.aa('用户状态更新成功！', 200)
    })
}