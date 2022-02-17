const express = require('express')
const router = express.Router()
const menuHandler = require('../router_handler/menu')

router.get('/menus', menuHandler.menus)

module.exports = router