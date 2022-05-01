const Router = require('koa-router'),
cheerio = require('cheerio'),
charset = require('superagent-charset'),
superagent = charset(require('superagent')),
router = new Router();

const { testElement } = require('domutils');
const knex = require("../db")

router.get('/posts/list', async (ctx, next) => {
    const pageNum = parseInt(ctx.query.pagenum)
    const pageSize = parseInt(ctx.query.pagesize)
    const startNum = (pageNum - 1)  * pageSize
    const serachWord = '%' + ctx.query.query + '%'


    const postIds = await knex('posts').select('id')
    const posts = await knex.select('posts.*', 'website.url as weburl').from('posts')
        .leftJoin('website', 'posts.webid', 'website.id')
        .where('posts.name', 'like', serachWord)
        .limit(pageSize).offset(startNum)
    let meta = {
        "msg": "获取帖子列表成功",
        "status": 200,
        "time": Date.now()
    }
    let data = {
        "total": postIds.length,
        "pagenum": pageNum,
        "posts": posts
    }    
   ctx.body = {
       meta,
       data
   }
});

module.exports = router