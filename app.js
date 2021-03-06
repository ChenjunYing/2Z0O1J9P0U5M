let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session'); 
let encrypt = require('./models/encrypt.js');
//============================================================
let paymentRouter = require('./routes/payment'); //支付处理路由
let accountRouter = require('./routes/account'); //样例理由
let bookRouter    = require('./routes/book');    //在线预订路由
let adminRouter = require('./routes/admin'); // backend router
let indexRouter = require('./routes/index'); // backend router
var checkRouter = require('./routes/check');
var updateRouter = require('./routes/update');
//============================================================

let app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'recommand 128 bytes random string', // 建议使用 128 个字符的随机字符串    
	cookie: { maxAge: 20 * 60 * 1000 }, //cookie生存周期20*60秒    
	resave: true,  //cookie之间的请求规则,假设每次登陆，就算会话存在也重新保存一次    
	saveUninitialized: true //强制保存未初始化的会话到存储器    
}));  //这些是写在app.js里面的    
app.use(express.static(path.join(__dirname, 'public')));

//============================================================
app.use('/book', bookRouter);
app.use('/check', checkRouter);
app.use('/update', updateRouter);
app.use('/payment', paymentRouter);  //支付处理路由
app.use('/account', accountRouter);   //账户管理路由
app.use('/account/admin', adminRouter);   //管理路由
app.use('/', indexRouter);

//============================================================

app.use(function(req, res, next) {
	next(createError(404));
});

app.use(function(err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	res.render('error');
});


//====================可在ejs模板中使用的函数====================
Date.prototype.format = function(fmt) { 
    var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt; 
}

app.locals.dateFormat = function(dateStr) {
    let date = new Date(dateStr);
    return date.format('yyyy-MM-dd hh:mm:ss');
}

app.locals.compileStr = encrypt.base64encode;

//============================================================

module.exports = app;
