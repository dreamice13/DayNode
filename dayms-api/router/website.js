const express = require('express')
const router = express.Router()

const websiteHandler = require('../router_handler/website')

router.get('/websites', websiteHandler.websiteList)
router.post('/websites', websiteHandler.addWebsite)
router.put('/websites/:id', websiteHandler.updateWebsite)
router.delete('/websites/:id', websiteHandler.deleteWebsite)

module.exports = router