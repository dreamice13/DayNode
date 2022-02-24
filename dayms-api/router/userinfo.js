// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()
// 导入验证数据合法性的中间件
const expressJoi = require('@escook/express-joi')
// 导入需要的验证规则对象
const { update_userinfo_schema, update_password_schema, update_avatar_schema } = require('../schema/user')

// 导入用户信息的处理函数模块
const userinfo_handler = require('../router_handler/userinfo')

// 获取用户的基本信息
router.get('/userinfo', userinfo_handler.getUserInfo)
// 更新用户的基本信息
router.post('/userinfo', expressJoi(update_userinfo_schema), userinfo_handler.updateUserInfo)
// 重置密码的路由
router.post('/updatepwd', expressJoi(update_password_schema), userinfo_handler.updatePassword)
// 更新用户头像
router.post('/update/avatar', expressJoi(update_avatar_schema), userinfo_handler.updateAvatar)
// 获取用户列表
router.get('/users', userinfo_handler.getUsers)
// 添加用户
router.post('/users', userinfo_handler.addUser)
// 修改用户
router.put('/users/:id', userinfo_handler.updateUser)
// 删除用户
router.delete('/users/:id', userinfo_handler.deleteUser)
// 修改用户状态
router.put('/users/:id/state/:state', userinfo_handler.updateUserState)

// 向外共享路由对象
module.exports = router
