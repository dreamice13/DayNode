const Koa = require('koa'),
app = new Koa();
const router = require("./router")

app.use(router.routes())
.use(router.allowedMethods());

// 监听端口
app.listen(3008, () => {
    console.log("hihub-api服务器已启动，http://localhost:3008");
})