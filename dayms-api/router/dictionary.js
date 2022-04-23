const express = require('express')
const router = express.Router()

const dictionaryHandler = require('../router_handler/dictionary')

router.get('/dictionary', dictionaryHandler.dictionaryList)
// router.post('/dictionary', dictionaryHandler.adddictionary)
// router.put('/dictionary/:id', dictionaryHandler.updatedictionary)
// router.delete('/dictionary/:id', dictionaryHandler.deletedictionary)

module.exports = router