const express = require('express')
const router = express.Router()
const searchHandler = require('../router_handler/search')

// 添加搜索日志
router.post('/search', searchHandler.addSearchLog)

module.exports = router