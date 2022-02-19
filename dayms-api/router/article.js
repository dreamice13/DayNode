const express = require('express')
const router = express.Router()

const articleHandler = require('../router_handler/article')

router.get('/article', articleHandler.articleList)
router.post('/article', articleHandler.addArticle)
router.put('/article/:id', articleHandler.updateArticle)
router.delete('/article/:id', articleHandler.deleteArticle)
router.put('/article/:id/:state', articleHandler.updateArticleState)

module.exports = router