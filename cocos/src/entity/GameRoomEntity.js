"use strict";

var GameRoomEntity = KBEngine.Entity.extend({
	ctor : function(player_num)
	{
		cc.log(player_num)
		cc.log("==================")
		this._super();
		this.roomID = undefined;
		this.curRound = 0;
		this.maxRound = 4;
		this.ownerId = undefined;
		this.dealerIdx = 0;
		this.isAgent = false;
  		this.player_num = player_num;
  		this.lucky_num = 0;
		this.extra_score = 0;
		this.agentInfo = {};
		if (player_num == 3) {
			this.playerInfoList = [null, null, null];
			this.playerStateList = [0, 0, 0];
			this.handTilesList = [[], [], []];
			this.upTilesList = [[], [], []];
			this.upTilesOpsList = [[], [], []];
			this.discardTilesList = [[], [], []];
			this.cutIdxsList = [[], [], []];
			this.dragonGreenList = [[], [], []];
		} else {
			this.playerInfoList = [null, null, null, null];
			this.playerStateList = [0, 0, 0, 0];
			this.handTilesList = [[], [], [], []];
			this.upTilesList = [[], [], [], []];
			this.upTilesOpsList = [[], [], [], []];
			this.discardTilesList = [[], [], [], []];
			this.cutIdxsList = [[], [], [], []];
			this.dragonGreenList = [[], [], [], []];
		}
		
		this.curPlayerSitNum = 0;
		this.isPlayingGame = 0;
		this.lastDiscardTile = 0;
		this.lastDrawTile = -1
		this.lastDiscardTileFrom = -1;
		this.leftTileNum = 60;

		this.kingTiles = [];	// 财神(多个)

		this.applyCloseLeftTime = 0;
		this.applyCloseFrom = 0;
		if (player_num == 3) {
			this.applyCloseStateList = [0, 0, 0];
		}else {
			this.applyCloseStateList = [0, 0, 0, 0];
		}

		this.waitAid = -1; // 轮询时的上一个操作，-1表示没有被轮询，否则表示被轮询时的上一个人的操作

		// 每局不清除的信息
		if (player_num == 3) {
			this.playerScoreList = [0, 0, 0];
		}else{
			this.playerScoreList = [0, 0, 0, 0];
		}
	    KBEngine.DEBUG_MSG("Create GameRoomEntity")
  	},

  	reconnectRoomData : function(recRoomInfo){
  		cc.log("reconnectRoomData",recRoomInfo)
  		this.curPlayerSitNum = recRoomInfo["curPlayerSitNum"];
  		this.isPlayingGame = recRoomInfo["isPlayingGame"];
  		this.playerStateList = recRoomInfo["player_state_list"];
  		this.lastDiscardTile = recRoomInfo["lastDiscardTile"];
  		this.lastDrawTile = recRoomInfo["lastDrawTile"]
  		this.lastDiscardTileFrom = recRoomInfo["lastDiscardTileFrom"];
  		this.leftTileNum = recRoomInfo["leftTileNum"];
  		this.kingTiles = recRoomInfo["kingTiles"];
  		for(var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++){

  			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];

  			this.handTilesList[i] = curPlayerInfo["tiles"];
  			this.discardTilesList[i] = curPlayerInfo["discard_tiles"];
  			this.cutIdxsList[i] = curPlayerInfo["cut_idxs"];
  			this.dragonGreenList[i] = curPlayerInfo["dragon_greens"];
 
  			for(var j = 0; j < curPlayerInfo["op_list"].length; j++){
  				var op_info = curPlayerInfo["op_list"][j]; //[opId, [tile]]
  				if(op_info["opId"] == const_val.OP_PONG){
  					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
  					this.upTilesOpsList[i].push([op_info]);
  				} else if(op_info["opId"] == const_val.OP_EXPOSED_KONG){
  					// 检查是否有碰过相同的牌
  					var kongIdx = h1global.entityManager.player().getSelfExposedKongIdx(this.upTilesList[i], op_info["tiles"][0]);
  					if(kongIdx >= 0){
  						// 已经碰过相同的牌，说明为自摸杠
	  					this.upTilesList[i][kongIdx].push(op_info["tiles"][0]);
	  					this.upTilesOpsList[i][kongIdx].push(op_info);
	  				} else {
	  					// 否则为普通杠
	  					this.upTilesList[i].push([op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0], op_info["tiles"][0]]);
	  					this.upTilesOpsList[i].push([op_info]);
	  				}
  				} else if(op_info["opId"] == const_val.OP_CONCEALED_KONG){
  					this.upTilesList[i].push([0, 0, 0, op_info["tiles"][0]]);
  					this.upTilesOpsList[i].push([op_info]);
  				} else if(op_info["opId"] == const_val.OP_DRAGON_GREEN_KONG){
  					// this.upTilesList[i].push((op_info["tiles"].concat()).sort(cutil.tileSortFunc));
  					// this.upTilesOpsList[i].push([op_info]);
  				} else if(op_info["opId"] == const_val.OP_CHOW){
  					this.upTilesList[i].push((op_info["tiles"].concat()).sort(cutil.tileSortFunc));
  					this.upTilesOpsList[i].push([op_info]);
  				} else if(op_info["opId"] == const_val.OP_DISCARD){
  					this.upTilesOpsList[i].push([op_info]);
  				}
  			}
  		}

  		this.applyCloseLeftTime = recRoomInfo["applyCloseLeftTime"];
  		this.applyCloseFrom = recRoomInfo["applyCloseFrom"];
		this.applyCloseStateList = recRoomInfo["applyCloseStateList"];
		if(this.applyCloseLeftTime > 0){
			onhookMgr.setApplyCloseLeftTime(this.applyCloseLeftTime);
		}
		this.waitAid = recRoomInfo["waitAid"];

		this.updateRoomData(recRoomInfo["init_info"]);
		for(var i = 0; i < recRoomInfo["player_advance_info_list"].length; i++){
			var curPlayerInfo = recRoomInfo["player_advance_info_list"][i];
			this.playerInfoList[i]["score"] = curPlayerInfo["score"]
			this.playerInfoList[i]["total_score"] = curPlayerInfo["total_score"]
		}
  	},

  	updateRoomData : function(roomInfo){
  		cc.log('updateRoomData:',roomInfo)
  		this.roomID = roomInfo["roomID"];
  		this.ownerId = roomInfo["ownerId"];
  		this.dealerIdx = roomInfo["dealerIdx"];
  		this.curRound = roomInfo["curRound"]
  		this.maxRound = roomInfo["maxRound"];
  		this.player_num = roomInfo["player_num"];
  		this.isAgent = roomInfo["isAgent"];
		this.agentInfo = roomInfo["agentInfo"];
		this.lucky_num = roomInfo["lucky_num"];
		this.extra_score = roomInfo["extra_score"];

  		for(var i = 0; i < roomInfo["player_base_info_list"].length; i++){
  			this.updatePlayerInfo(roomInfo["player_base_info_list"][i]["idx"], roomInfo["player_base_info_list"][i]);
		}

		var self = this;
		if(!((cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) || (cc.sys.os == cc.sys.OS_ANDROID && cc.sys.isNative)) || switches.TEST_OPTION){
			wx.onMenuShareAppMessage({
                title: '房間號【' + self.roomID.toString() + '】', // 分享标题
                desc: '我在[武宁麻将]开了' + self.maxRound.toString() + '局的房间，快来一起玩吧', // 分享描述
                link: switches.h5entrylink, // 分享链接
			    imgUrl: '', // 分享图标
			    type: '', // 分享类型,music、video或link，不填默认为link
			    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
			    success: function () { 
			        // 用户确认分享后执行的回调函数
			        cc.log("ShareAppMessage Success!");
			    },
			    cancel: function () { 
			        // 用户取消分享后执行的回调函数
			        cc.log("ShareAppMessage Cancel!");
			    },
			    fail: function() {
			    	cc.log("ShareAppMessage Fail")
			    },
			});
			wx.onMenuShareTimeline({
                title: '房間號【' + self.roomID.toString() + '】', // 分享标题
                desc: '我在[武宁麻将]开了' + self.maxRound.toString() + '局的房间，快来一起玩吧', // 分享描述
                link: switches.h5entrylink, // 分享链接
			    imgUrl: '', // 分享图标
			    type: '', // 分享类型,music、video或link，不填默认为link
			    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
			    success: function () { 
			        // 用户确认分享后执行的回调函数
			        cc.log("onMenuShareTimeline Success!");
			    },
			    cancel: function () { 
			        // 用户取消分享后执行的回调函数
			        cc.log("onMenuShareTimeline Cancel!");
			    },
			    fail: function() {
			    	cc.log("onMenuShareTimeline Fail")
			    },
			});
		}
  	},

  	updatePlayerInfo : function(serverSitNum, playerInfo){
  		this.playerInfoList[serverSitNum] = playerInfo;
  	},

  	updatePlayerState : function(serverSitNum, state){
  		this.playerStateList[serverSitNum] = state;
  	},

  	updatePlayerOnlineState : function(serverSitNum, state){
  		this.playerInfoList[serverSitNum]["online"] = state;
  	},

  	startGame : function(kingTiles, dragonGreenList){
  		this.curRound = this.curRound + 1;
  		this.isPlayingGame = 1;
  		this.kingTiles = kingTiles
  		this.dragonGreenList = dragonGreenList;
  		var dragon_greens_num = 0
  		for (var i = 0; i < dragonGreenList.length; i++) {
  			dragon_greens_num += dragonGreenList[i].length
  		}
  		if (this.player_num == 3) {
  			this.handTilesList = [	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
			this.upTilesList = [[], [], []];
			this.upTilesOpsList = [[], [], []];
			this.discardTilesList = [[], [], []];
			this.cutIdxsList = [[], [], []];
			this.leftTileNum = 81 - dragon_greens_num;
  		} else {
  			this.handTilesList = [	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
			this.upTilesList = [[], [], [], []];
			this.upTilesOpsList = [[], [], [], []];
			this.discardTilesList = [[], [], [], []];
			this.cutIdxsList = [[], [], [], []];
			this.leftTileNum = 68 - dragon_greens_num;
  		}	
  	},

  	endGame : function(){
  		// 重新开始准备
  		this.isPlayingGame = 0;
  		if (this.player_num == 3) {
  			this.playerStateList = [0, 0, 0];
  		} else {
  			this.playerStateList = [0, 0, 0, 0];
  		}
  	},
});