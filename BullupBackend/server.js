var dependencyUtil = require("./util/dependency_util.js");
dependencyUtil.init(__dirname.toString().replace(/\\/g, "/"));

var io = require('socket.io')();
var logUtil = dependencyUtil.global.utils.logUtil;

// 代理
var userService = dependencyUtil.global.service.userService;
var teamService = dependencyUtil.global.service.teamService;
var socketService = dependencyUtil.global.service.socketService;
var battleService = dependencyUtil.global.service.battleService;
var paymentService = dependencyUtil.global.service.paymentService;
var chatService = dependencyUtil.global.service.chatService;
var adminService = dependencyUtil.global.service.administratorService;
var stripeService = dependencyUtil.global.service.stripeService;
var lolKeyService = dependencyUtil.global.service.lolKeyService;

var rankInfoDao = dependencyUtil.global.dao.rankInfoDao;

// 初始化Service, 所有需要保存数据结构的对象都需要初始化, 只能初始化一次
userService.init();
teamService.init();
socketService.init();
battleService.init();
paymentService.init();
chatService.init();
adminService.init();
lolKeyService.init(); 

io.on('connection', function(socket) {
    logUtil.levelMsgLog(0, 'User ' + socket.id + ' connected!');
    userService.handleLogin(socket);

    userService.handleRegister(socket);

    userService.handleInviteFriend(socket);

    userService.handleRankRequest(socket);

    userService.handleUserInviteResult(io, socket);
   
    userService.insertFeedbackMessage(socket);

    userService.handleLOLBind(socket); 
    userService.handleIconIdUpdate(socket);
    userService.handleAddFriendRequest(socket);
    userService.handleAddFriendResult(socket);

    //余额
    userService.handleGetBalance(socket);
    //登录时间
    userService.handlelastLoginTime(socket);
    //更改信息
    userService.handleUserUpdateInfo(socket);

    userService.handlePersonalCenterRequest(socket);
  
    teamService.handleRoomEstablish(socket);

    teamService.handleTeamEstablish(io, socket);

    teamService.handleVersusLobbyRefresh(socket);

    teamService.handleTeamDetails(socket);

    teamService.handleRefreshFormedBattleRoom(socket);

    battleService.handleBattleInvite(socket);

    battleService.handleBattleInviteResult(io, socket);

    battleService.handleLOLRoomEstablished(io, socket);

    battleService.handleBattleResult(io, socket);

    battleService.handleMatch(io);

    paymentService.handlePayment(socket);
    paymentService.handleBankInfo(socket);
    //资金流动
    paymentService.handleSearchCashFlow(socket);

    //提现管理
    adminService.handleWithdraw(socket);
    adminService.handleWithdrawAgree(socket);
    adminService.handleWithdrawDisagree(socket);

    socketService.handleReceivedTokenData(socket);
    socketService.handleReconnect(io, socket);

    //约战管理
    adminService.handleSearchBattleRecord(socket);
    adminService.handleChangeBattleResult(socket) ;

    //账户管理
    adminService.handleAllAccount(socket);
    adminService.handleSuspendAccount(socket);
    adminService.handleUnblockAccount(socket);

    //申诉反馈管理
    adminService.handleSearchFeedback(socket);
    adminService.handleFeedback(socket);

    //充值管理
    adminService.searchAllRechargeInfo(socket);

    //简单统计
    adminService.handleAnalysis(socket);
    //邀请码信息
    adminService.handleInvitedCode(socket);

    chatService.handleChat(io,socket);

    //LOLkey
    lolKeyService.handleLOLKeyUpdate(socket);
    lolKeyService.handleLOLKeyRequest(socket);

});

io.on('disconnect', function (socket) {
    logUtil.levelMsgLog(0, 'User ' + socket.id + ' disconnected!');
    socketService.remove(socket);
});


//开启消息推送器
socketService.startstableEmiter();

//开启匹配器
teamService.match();

//监听充值请求
stripeService.recharge();

//一天更新一次排行榜
setInterval(function(){
    console.log('update rank');
    rankInfoDao.updateRankList();
},24 * 3600 * 1000);

io.listen(3000);


process.on('uncaughtException', function (err) {
    logUtil.logToFile("./logs/error/errors.txt", "append", err);
    console.log(String(err));
    if(err instanceof Error){
        
    }else if(err instanceof TypeError){
        logUtil.logErrToFile("./logs/error/type_errors.txt", "append", err);
    }else if(err instanceof SyntaxError){
        logUtil.logErrToFile("./logs/error/syntax_errors.txt", "append", err);
    }else if(err instanceof ReferenceError){
        logUtil.logErrToFile("./logs/error/reference_errors.txt", "append", err);
    }else if(err instanceof EvalError){
        logUtil.logErrToFile("./logs/error/eval_errors.txt", "append", err);
    }else if(err instanceof RangeError){
        logUtil.logErrToFile("./logs/error/range_errors.txt", "append", err);
    }else if(err instanceof URIError){
        logUtil.logErrToFile("./logs/error/uri_errors.txt", "append", err);
    }else{

    }
});
