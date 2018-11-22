var path = require("path");
var webpack = require("webpack");
var express = require("express");
var devMiddleware = require("webpack-dev-middleware");
var hotMiddleware = require("webpack-hot-middleware");

var ProgressPlugin = require("webpack/lib/ProgressPlugin");
var config = require("./webpack.config.js")({prod: false, hash: true, test: true});

var app = express();
var compiler = webpack(config);


compiler.apply(new ProgressPlugin(function (percentage, msg) {
    process.stdout.write((percentage * 100).toFixed(2) + '% ' + msg + '                 \033[0G');
}));


app.use(devMiddleware(compiler, {
    publicPath: config.output.publicPath,
    historyApiFallback: true
}));

app.use(hotMiddleware(compiler));

app.get("*", function (req, res,next) {
    //res.sendFile(path.join(__dirname, "app/assets/index-dev.html"));
    //res.redirect("/index-dev.html");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next()
});

app.listen(8380, function (err) {
    if (err) {
        return console.error(err);
    }

    console.log("Listening at http://localhost:8380/");
});