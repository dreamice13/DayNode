const Koa = require('koa'),
cors = require('koa2-cors');

const app = new Koa();
app.use(cors());
const router = require("./router")
const posts = require("./router/posts")

app.use(router.routes())
.use(router.allowedMethods())
.use(posts.routes()).use(posts.allowedMethods);

// 监听端口
app.listen(3008, () => {
    console.log("hihub-api服务器已启动，http://localhost:3008");
})