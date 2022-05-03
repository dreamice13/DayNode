const express = require('express')
const router = express.Router()

const tagHandler = require('../router_handler/tag')

router.get('/tag', tagHandler.tagList)
router.post('/tag', tagHandler.addTag)
router.put('/tag/:id', tagHandler.updateTag)
router.delete('/tag/:id', tagHandler.deleteTag)

module.exports = router