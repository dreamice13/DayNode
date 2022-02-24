const express = require('express')
const router = express.Router()

const englishHandler = require('../router_handler/english')

router.get('/englishs', englishHandler.englishList)
router.post('/english', englishHandler.addEnglish)
router.put('/english/:id', englishHandler.updateEnglish)
router.delete('/english/:id', englishHandler.deleteEnglish)

module.exports = router