"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impGameRules = impGameOperation.extend({
	__init__ : function()
	{
		this._super();
		this.allTiles = const_val.CHARACTER.concat(const_val.BAMBOO);
  	this.allTiles = this.allTiles.concat(const_val.DOT);
  	this.allTiles.push(const_val.DRAGON_RED);
  	this.allTiles.push(const_val.DRAGON_WHITE);
    // this.meld_history = {};
	  KBEngine.DEBUG_MSG("Create impGameRules");
  	},

  	getCanWinTiles:function(){
      // return [];
      //听牌提示
  		var canWinTiles = [];
  		for(var i = 0; i < this.allTiles.length; i++){
  			var handTiles = this.curGameRoom.handTilesList[this.serverSitNum].concat([this.allTiles[i]]);
  			if(this.canWin(handTiles)){
  				canWinTiles.push(this.allTiles[i]);
  			}
  		}
  		return canWinTiles;
  	},

  	canConcealedKong:function(tiles){
      //暗杠
  		if(this.getOneConcealedKongNum(tiles) > 0){
        return true;
      } else {
        return false;
      }
  	},

    getOneConcealedKongNum:function(tiles){
      var hashDict = {};
      for(var i = 0; i < tiles.length; i++){
        if (this.curGameRoom.kingTiles.indexOf(tiles[i]) >= 0) {continue;}
        if (tiles[i] == const_val.DRAGON_GREEN) {continue;}
        if(hashDict[tiles[i]]){
          hashDict[tiles[i]]++;
          if(hashDict[tiles[i]] >= 4){
            return tiles[i];
          }
        } else {
          hashDict[tiles[i]] = 1;
        }
      }
      return 0;
    },

  	canExposedKong:function(tiles, lastTile){
      if (this.curGameRoom.kingTiles.indexOf(lastTile) >= 0) {return false;}
      if (lastTile == const_val.DRAGON_GREEN) {return false}
  		var tile = 0;
  		for(var i = 0; i < tiles.length; i++){
  			if(tiles[i] == lastTile){
  				tile++;
  			}
  		}
  		if(tile >= 3){
  			return true;
  		}
  		return false;
  	},

  	canSelfExposedKong:function(upTilesList, drawTile){
  		if(this.getSelfExposedKongIdx(upTilesList, drawTile) >= 0){
  			return true;
  		}
  		return false;
  	},

  	getSelfExposedKongIdx:function(upTilesList, drawTile){
      if (this.curGameRoom.kingTiles.indexOf(drawTile) >= 0) {return -1;}
      if (drawTile == const_val.DRAGON_GREEN) {return -1;}
  		for(var i = 0; i < upTilesList.length; i++){
  			if(upTilesList[i].length == 3 && drawTile == upTilesList[i][0] && 
  				upTilesList[i][0] == upTilesList[i][1] && upTilesList[i][1] == upTilesList[i][2]){
  				return i;
  			}
  		}
  		return -1;
  	},

  	canPong:function(tiles, lastTile){
      if (this.curGameRoom.kingTiles.indexOf(lastTile) >= 0) {return false;}
      // 正常碰牌逻辑
  		var tile = 0;
  		for(var i = 0; i < tiles.length; i++){
  			if(tiles[i] == lastTile){
  				tile++;
  			}
  		}
  		if(tile >= 2){
  			return true;
  		}
  		return false;
  	},

    getCanChowTilesList:function(lastTile){
      return false
    },

    canChow:function(tiles, lastTile){
      return false;
    },

  	// canWin:function(tiles){
  	// 	if (tiles.length % 3 != 2){
			// return false;
  	// 	}

   //    tiles = tiles.concat([]).sort(function(a, b){return a-b;});

  	// 	var tilesInfo = this.classifyTiles(tiles);
  	// 	var chars = tilesInfo[0];
  	// 	var bambs = tilesInfo[1];
  	// 	var dots = tilesInfo[2];
  	// 	var dragon_red = tilesInfo[3];
  	// 	var c_need1 = cutil.meld_only_need_num(chars, cutil.meld_history);
  	// 	var c_need2 = cutil.meld_with_pair_need_num(chars, cutil.meld_history);
  	// 	if (c_need1 > dragon_red && c_need2 > dragon_red){
  	// 		return false;
  	// 	}

  	// 	var b_need1 = cutil.meld_only_need_num(bambs, cutil.meld_history);
  	// 	var b_need2 = cutil.meld_with_pair_need_num(bambs, cutil.meld_history);
  	// 	if (b_need1 > dragon_red && b_need2 > dragon_red){
  	// 		return false;
  	// 	}

  	// 	var d_need1 = cutil.meld_only_need_num(dots, cutil.meld_history);
  	// 	var d_need2 = cutil.meld_with_pair_need_num(dots, cutil.meld_history);
  	// 	if (d_need1 > dragon_red && d_need2 > dragon_red){
  	// 		return false;
  	// 	}

  	// 	if(	(c_need2 + b_need1 + d_need1) <= dragon_red ||
  	// 		(c_need1 + b_need2 + d_need1) <= dragon_red ||
  	// 		(c_need1 + b_need1 + d_need2) <= dragon_red){
  	// 		return true;
  	// 	}
  	// 	return false;
  	// },

    getNormalTipsWinList:function(handTiles, finalTile){
      var tipList = []
      var copyHandTiles = handTiles.concat([]).sort(function(a,b){return a-b;})
      if (copyHandTiles.indexOf(finalTile) < 0) {
        return tipList
      }
      copyHandTiles.splice(copyHandTiles.indexOf(finalTile), 1)

      var tup = [const_val.CHARACTER, const_val.BAMBOO, const_val.DOT]
      for (var i = 0; i < tup.length; i++) {
        for (var j = 0; j < tup[i].length; j++) {
          var tile = tup[i][j]
          var tryTiles = copyHandTiles.concat([])
          tryTiles.push(tile)
          tryTiles = tryTiles.sort(function(a,b){return a-b;})
          if (cutil.meld_with_pair_need_num(tryTiles, {}) <= 0) {
            tipList.push(tile)
          }
        }
      }

      var tryTiles = copyHandTiles.concat([])
      tryTiles.push(const_val.DRAGON_RED)
      tryTiles = tryTiles.sort(function(a,b){return a-b;})
      if (cutil.meld_with_pair_need_num(tryTiles, {}) <= 0) {
        tipList.push(const_val.DRAGON_RED)
      }

      var tryTiles = copyHandTiles.concat([])
      tryTiles.push(const_val.DRAGON_WHITE)
      tryTiles = tryTiles.sort(function(a,b){return a-b;})
      if (cutil.meld_with_pair_need_num(tryTiles, {}) <= 0) {
        tipList.push(const_val.DRAGON_WHITE)
      }
      return tipList
    },
    
    canWin:function(handTiles, finalTile, win_op){
      var victory_value = 0;
      var min_victory_val = 2;
      var copyHandTiles = handTiles.concat([]).sort(function(a,b){return a-b;})
      if (copyHandTiles.indexOf(const_val.DRAGON_GREEN) >= 0) {
        return victory_value >= min_victory_val
      }
      var uptiles = this.curGameRoom.upTilesList[this.serverSitNum]
      var dragon_green_num = this.curGameRoom.dragonGreenList[this.serverSitNum].length
      var upTilesOpsList = this.curGameRoom.upTilesOpsList[this.serverSitNum]
      var tile2NumDict = cutil.getTileNumDict(copyHandTiles)
      // 杠子
      var kong_num = 0
      for (var i = 0; i < uptiles.length; i++) {
        if (uptiles[i].length == 4) {
          kong_num ++;
        }
      }
      // 门前清
      var pongExposedKongNum = 0
      for (var i = 0; i < upTilesOpsList.length; i++) {
        var op_list = upTilesOpsList[i]
        if (op_list.length > 0 && (op_list[0]['opId'] == const_val.OP_PONG || op_list[0]['opId'] == const_val.OP_EXPOSED_KONG)) {
          pongExposedKongNum ++;
        }
      }

      // 7对
      if (cutil.checkIs7Pair(handTiles)) {
        // 平胡
        cc.log("平胡")
        victory_value += 1;
        // 自摸
        cc.log("自摸")
        if (win_op == const_val.OP_DRAW_WIN) {
          victory_value += 1;
        }
        // 手抓3红中/白板

        if (tile2NumDict[const_val.DRAGON_RED.toString()] >= 3) {
          victory_value += 2;
          cc.log("手抓3红中")
        }
        if (tile2NumDict[const_val.DRAGON_WHITE.toString()] >= 3) {
          victory_value += 2;
          cc.log("手抓3白板")
        }
        // 抢杠
        if (win_op == const_val.OP_KONG_WIN) {
           victory_value += 5;
           cc.log("抢杠")
        }
        // 7对
        victory_value += 7; 
        cc.log("7对")
        // 4发财
        if (dragon_green_num == 4) {
          victory_value += 8;
          cc.log("4发财")
        } else {
          victory_value += dragon_green_num; 
          cc.log("发财",dragon_green_num)
        }
        // 清一色
        if (cutil.checkIsSameSuit(handTiles, uptiles)) {
          victory_value += 10;
          cc.log("清一色")
        }
        cc.log("=====>:",victory_value)
        return victory_value >= min_victory_val
      } else if (copyHandTiles.length % 3 == 2 && cutil.meld_with_pair_need_num(copyHandTiles, {}) <= 0) {
        // 平胡
        victory_value += 1;
        cc.log("平胡")
        // 自摸
        if (win_op == const_val.OP_DRAW_WIN) {
          victory_value += 1
          cc.log("自摸")
        }
        // 胡单张
        var tipList = this.getNormalTipsWinList(handTiles, finalTile)
        if (tipList.length <= 1) {
          victory_value += 1;
          cc.log("胡单张")
        }
        // 门前清
        if (pongExposedKongNum <= 0) {
          victory_value += 1;
          cc.log("门前清")
        }
        // 碰红中/白板
        var pongDragonRed_White = 0;
        for (var i = 0; i < uptiles.length; i++) {
          if (uptiles[i].length == 3 && (uptiles[i][0] == const_val.DRAGON_RED || uptiles[i][0] == const_val.DRAGON_WHITE)) {
            pongDragonRed_White ++;
          }
        }
        victory_value += pongDragonRed_White
        cc.log("碰红中/白板",pongDragonRed_White)
        // 杠相关
        var kongList = cutil.getKongClassify(upTilesOpsList)
        // 明杠(不包括 红中/白板)
        victory_value += kongList[0]
        cc.log("明杠",kongList[0])
        //手抓 3 红中/白板
        if (tile2NumDict[const_val.DRAGON_RED.toString()] >= 3) {
          victory_value += 2;
          cc.log("手抓 3 红中")
        }
        if (tile2NumDict[const_val.DRAGON_WHITE.toString()] >= 3) {
          victory_value += 2;
          cc.log("手抓 3 白板")
        }
        // 暗杠(不包括 红中/白板)
        victory_value += 2*kongList[1]
        cc.log("暗杠(不包括 红中/白板)", 2*kongList[1])
        // 明杠 红中/白板
        victory_value += 3*kongList[2]
        cc.log("明杠 红中/白板", 3*kongList[2])
        // 暗杠 红中/白板
        victory_value += 4*kongList[3]
        cc.log("暗杠 红中/白板", 4*kongList[3])
        // 碰碰胡
        if (cutil.checkIsPongPongWin(copyHandTiles, uptiles)) {
          victory_value += 5
          cc.log("碰碰胡")
        }
        // 抢杠
        if (win_op == const_val.OP_KONG_WIN) {
          victory_value += 5
          cc.log("抢杠")
        }
        // 杠开
        if (win_op == const_val.OP_DRAW_WIN && cutil.checkIsKongDrawWin(upTilesOpsList)) {
          victory_value += 5
          cc.log("杠开")
        }
        // 流泪
        if (win_op == const_val.OP_GIVE_WIN && cutil.checkIsKongDiscard(this.curGameRoom.upTilesOpsList[this.curGameRoom.lastDiscardTileFrom])) {
          victory_value += 5
          cc.log("流泪")
        }
        // 4发财
        if (dragon_green_num == 4) {
          victory_value += 8;
          cc.log("4发财")
        } else {
          victory_value += dragon_green_num; 
          cc.log("发财",dragon_green_num)
        }
        //清一色
        if (cutil.checkIsSameSuit(handTiles, uptiles)) {
          victory_value += 10;
          cc.log("清一色")
        }
        // 全求人
        if (copyHandTiles.length == 2) {
          victory_value += 10
          cc.log("全求人")
        }
        cc.log("=====>:",victory_value)
        return victory_value >= min_victory_val
      }
      return victory_value >= min_victory_val
    },
});
