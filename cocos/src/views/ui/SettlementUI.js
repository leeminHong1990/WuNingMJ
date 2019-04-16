var SettlementUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/SettlementUI.json";
	},
	initUI:function(){
		var player = h1global.entityManager.player();
		var self = this;
		var confirm_btn = this.rootUINode.getChildByName("confirm_btn");
		function confirm_btn_event(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				// TEST:
				// self.hide();
				// h1global.curUIMgr.gameroomprepare_ui.show();
				// h1global.curUIMgr.gameroom_ui.hide();
				// return;
				self.hide();

				//重新开局
				player.curGameRoom.updatePlayerState(player.serverSitNum, 1);
				// player.curGameRoom.curRound = player.curGameRoom.curRound + 1;
				h1global.curUIMgr.gameroomprepare_ui.show();
				h1global.curUIMgr.gameroom_ui.hide();
				player.roundEndCallback();
			}
		}
		confirm_btn.addTouchEventListener(confirm_btn_event);
		this.kongTilesList = [[], [], [], []];

		var settlement_panel = this.rootUINode.getChildByName("settlement_panel");
		var settlement_bg_panel = this.rootUINode.getChildByName("settlement_bg_panel");
		var show_btn = this.rootUINode.getChildByName("show_btn");
		var hide_btn = this.rootUINode.getChildByName("hide_btn");
		show_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				show_btn.setVisible(false);
				hide_btn.setVisible(true);
				settlement_panel.setVisible(true);
				settlement_bg_panel.setVisible(true);
			}
		});
		show_btn.setVisible(false);
		hide_btn.addTouchEventListener(function(sender, eventType){
			if(eventType == ccui.Widget.TOUCH_ENDED){
				show_btn.setVisible(true);
				hide_btn.setVisible(false);
				settlement_panel.setVisible(false);
				settlement_bg_panel.setVisible(false);
			}
		});
	},
	
	show_by_info:function(roundRoomInfo, confirm_btn_func){
		cc.log("结算==========>:")
		cc.log("roundRoomInfo :  ",roundRoomInfo)
		var self = this;	
		this.show(function(){
			self.player_tiles_panels = [];
			self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel1"));
			self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel2"));
			self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel3"));
			self.player_tiles_panels.push(self.rootUINode.getChildByName("settlement_panel").getChildByName("victory_item_panel4"));	
			var playerInfoList = roundRoomInfo["player_info_list"];
			for(var i = 0; i < 4; i++){
				var roundPlayerInfo = playerInfoList[i];
				if (!roundPlayerInfo) {
					self.player_tiles_panels[i].setVisible(false)
					continue
				}
				self.player_tiles_panels[i].setVisible(true)
				self.update_score(roundPlayerInfo["idx"], roundPlayerInfo["score"]);  //显示分数
                self.update_player_hand_tiles(i, roundRoomInfo["player_info_list"][i]["tiles"], roundRoomInfo["win_idx_list"]);   //显示麻将
                self.update_player_up_tiles(i, roundRoomInfo["player_info_list"][i]["concealed_kong"]);
                self.update_player_info(roundPlayerInfo["idx"]);  //idx 表示玩家的座位号
			}

			self.show_title(roundRoomInfo["win_idx_list"])

			if (roundRoomInfo["win_idx_list"][0] >= 0) {
				for(var i = 0; i < roundRoomInfo["win_idx_list"].length; i++){
					self.update_player_win(roundRoomInfo["win_idx_list"][i], roundRoomInfo["player_info_list"][roundRoomInfo["win_idx_list"][i]]["tiles"], roundRoomInfo["result_list"][i], roundRoomInfo["quantity_list"][i]);
					self.update_luckytiles(roundRoomInfo["win_idx_list"][i], roundRoomInfo["lucky_tiles"][roundRoomInfo["win_idx_list"][i]]);
				}
			}
			
			if(confirm_btn_func){
				self.rootUINode.getChildByName("confirm_btn").addTouchEventListener(function(sender, eventType){
					if(eventType ==ccui.Widget.TOUCH_ENDED){
						self.hide();
						confirm_btn_func();
					}
				});
			}
		});
	},

	show_title:function(win_idx_list){
		cc.log(win_idx_list);
        var title_img = this.rootUINode.getChildByName("settlement_panel").getChildByName("title_img");
        title_img.ignoreContentAdaptWithSize(true);
        var win_sum = 0;
        for (var i = 0; i < win_idx_list.length; i++) {
            if (win_idx_list[i] >= 0) {
                win_sum++;
            }
        }
        if (win_sum === 0) {
            title_img.loadTexture("res/ui/SettlementUI/dogfull_title.png")
        } else {
            if (win_idx_list.indexOf(h1global.entityManager.player().serverSitNum) >= 0) {
                //shengli
                title_img.loadTexture("res/ui/SettlementUI/win_title.png")
            } else {
                title_img.loadTexture("res/ui/SettlementUI/fail_title.png")
            }
        }
	},

	update_player_hand_tiles:function(serverSitNum, tileList, win_idx_list){
		if(!this.is_show) {return;}
		var player = h1global.entityManager.player();
		var cur_player_tile_panel = this.player_tiles_panels[serverSitNum].getChildByName("item_hand_panel");
		if(!cur_player_tile_panel){
			return;
		}
		// tileList = tileList.sort(cutil.tileSortFunc);
		if(win_idx_list.indexOf(serverSitNum) >= 0){
			var temp_tile = tileList.pop();
			tileList = tileList.sort(cutil.tileSortFunc);
			tileList.push(temp_tile);
		}else {
			tileList = tileList.sort(cutil.tileSortFunc);
		}
		var mahjong_hand_str = "";
        cur_player_tile_panel.setPositionX((player.curGameRoom.upTilesList[serverSitNum].length * 180) + 280);
		mahjong_hand_str = "mahjong_tile_player_hand.png";
		for(var i = 0; i < 14; i++){
			var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + i.toString());
			tile_img.stopAllActions();
			if(tileList[i]){
				var mahjong_img = tile_img.getChildByName("mahjong_img");
				tile_img.loadTexture("Mahjong/" + mahjong_hand_str, ccui.Widget.PLIST_TEXTURE);
				tile_img.setVisible(true);
				mahjong_img.ignoreContentAdaptWithSize(true);
				mahjong_img.loadTexture("Mahjong/mahjong_big_" + tileList[i].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
				mahjong_img.setVisible(true);
				if(win_idx_list.indexOf(serverSitNum) >= 0 && i === tileList.length - 1){
					tile_img.setPositionX(tile_img.getPositionX() + 20);
				}
			} else {
				tile_img.setVisible(false);
			}
		}
	},

	update_player_up_tiles:function(serverSitNum, concealedKongList){
		if(!this.is_show) {return;}
		var player = h1global.entityManager.player();
        var cur_player_tile_panel = this.player_tiles_panels[serverSitNum].getChildByName("item_up_panel");
		// var cur_player_tile_panel = this.rootUINode.getChildByName("settlement_panel").getChildByName("player_tile_panel").getChildByName("player_up_panel");
		if(!cur_player_tile_panel){
			return;
		}
		// var mahjong_hand_str = "";
		var mahjong_up_str = "";
		var mahjong_down_str = "";
		// var mahjong_desk_str = "";
		// if(idx == 0){
		// 	mahjong_hand_str = "mahjong_tile_player_hand.png";
		// 	mahjong_up_str = "mahjong_tile_player_up.png";
		// 	mahjong_down_str = "mahjong_tile"
		// }
		for(var i = player.curGameRoom.upTilesList[serverSitNum].length * 3; i < 12; i++){
			var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + i.toString());
			tile_img.setVisible(false);
		}
		for(var i = 0; i < this.kongTilesList[serverSitNum].length; i++){
			this.kongTilesList[serverSitNum][i].removeFromParent();
		}
		this.kongTilesList[serverSitNum] = [];
		// mahjong_hand_str = "mahjong_tile_player_hand.png";
		mahjong_up_str = "mahjong_tile_player_up.png";
		mahjong_down_str = "mahjong_tile_player_down.png";
		// mahjong_desk_str = "mahjong_tile_player_desk.png";
		for(var i = 0; i < player.curGameRoom.upTilesList[serverSitNum].length; i++){
			for(var j = 0; j < 3; j++){
				var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + (3*i + j).toString());
				// tile_img.setPositionY(0);
				tile_img.setTouchEnabled(false);
				var mahjong_img = tile_img.getChildByName("mahjong_img");
				if(player.curGameRoom.upTilesList[serverSitNum][i][j]){
					tile_img.loadTexture("Mahjong/" + mahjong_up_str, ccui.Widget.PLIST_TEXTURE);
					mahjong_img.ignoreContentAdaptWithSize(true);
					mahjong_img.loadTexture("Mahjong/mahjong_small_" + player.curGameRoom.upTilesList[serverSitNum][i][j].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
					mahjong_img.setVisible(true);
				} else {
					tile_img.loadTexture("Mahjong/" + mahjong_down_str, ccui.Widget.PLIST_TEXTURE);
					mahjong_img.setVisible(false);
				}
				tile_img.setVisible(true);
			}
			if(player.curGameRoom.upTilesList[serverSitNum][i].length > 3){
				var tile_img = ccui.helper.seekWidgetByName(cur_player_tile_panel, "mahjong_bg_img" + (3*i + 1).toString());
				var kong_tile_img = tile_img.clone();
				this.kongTilesList[serverSitNum].push(kong_tile_img);
				var mahjong_img = kong_tile_img.getChildByName("mahjong_img");
				if(player.curGameRoom.upTilesList[serverSitNum][i][3]){
					kong_tile_img.loadTexture("Mahjong/" + mahjong_up_str, ccui.Widget.PLIST_TEXTURE);
					mahjong_img.ignoreContentAdaptWithSize(true);
					mahjong_img.loadTexture("Mahjong/mahjong_small_" + player.curGameRoom.upTilesList[serverSitNum][i][j].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
					mahjong_img.setVisible(true);
				} else {
					if(concealedKongList[0]){
						kong_tile_img.loadTexture("Mahjong/" + mahjong_up_str, ccui.Widget.PLIST_TEXTURE);
						mahjong_img.ignoreContentAdaptWithSize(true);
						mahjong_img.loadTexture("Mahjong/mahjong_small_" + concealedKongList[0].toString() + ".png", ccui.Widget.PLIST_TEXTURE);
						concealedKongList.splice(0, 1);
						mahjong_img.setVisible(true);
					} else {
						kong_tile_img.loadTexture("Mahjong/" + mahjong_down_str, ccui.Widget.PLIST_TEXTURE);
						mahjong_img.setVisible(false);
					}
				}
				kong_tile_img.setPositionY(kong_tile_img.getPositionY() + 16);
				kong_tile_img.setVisible(true);
				cur_player_tile_panel.addChild(kong_tile_img);
			}
		}
	},

	update_player_info:function(serverSitNum){
		if(!this.is_show) {return;}
		cc.log("update_player_info", serverSitNum)
		var player = h1global.entityManager.player();
		var cur_player_info_panel = this.player_tiles_panels[serverSitNum];
		cc.log(cur_player_info_panel)
		if(!cur_player_info_panel){
			return;
		}
		var playerInfo = player.curGameRoom.playerInfoList[serverSitNum];
		cur_player_info_panel.getChildByName("item_name_label").setString(playerInfo["nickname"]);
		// var frame_img = ccui.helper.seekWidgetByName(cur_player_info_panel, "frame_img");
		// cur_player_info_panel.reorderChild(frame_img, 1);
		cutil.loadPortraitTexture(playerInfo["head_icon"], function(img){
			if (cur_player_info_panel.getChildByName("item_avatar_img")) {
				cur_player_info_panel.getChildByName("item_avatar_img").removeFromParent();
			}
			var portrait_sprite  = new cc.Sprite(img);
			portrait_sprite.setName("portrait_sprite");
			portrait_sprite.setScale(67 / portrait_sprite.getContentSize().width);
            portrait_sprite.x = 145;
            portrait_sprite.y = 45;
			cur_player_info_panel.addChild(portrait_sprite);
			portrait_sprite.setLocalZOrder(-1);
			// frame_img.setLocalZOrder(0);
		}, playerInfo["uuid"].toString() + ".png");
	},

	update_player_win:function(serverSitNum, handTiles, result, cannon_num){
		if(serverSitNum < 0 || serverSitNum > 3){
			return;
		}
        var player = h1global.entityManager.player();
		var cur_player_info_panel = this.player_tiles_panels[serverSitNum];
		var cannon_num_label = cur_player_info_panel.getChildByName("cannon_num_label");
		cannon_num_label.setString(cannon_num.toString() + "炮");
        cannon_num_label.setVisible(true);
		var win_type_img_list = [];
		for (var i = 1; i <= 7; i++) {
			var img = cur_player_info_panel.getChildByName("item_card_type_img" + String(i));
			win_type_img_list.push(img)
		}
		var index = 0;
		var cannon_value = [1,1,1,1,5,5,7,8,10,5,5,10,0,0,0,0,0];
		for (var i = 0; i < result.length; i++) {
			if (index >= win_type_img_list.length) {break;}
			if (result[i]) {
				cc.log(i, index);
				win_type_img_list[index].loadTexture("res/ui/SettlementUI/win_type_" + String(i) +".png");
				win_type_img_list[index].setVisible(true);
                this.create_label(cannon_value[i], index, win_type_img_list);
				index += 1
			}
		}

        var uptiles = player.curGameRoom.upTilesList[serverSitNum];
        var copyHandTiles = handTiles.concat([]).sort(function(a,b){return a-b;});
        var tile2NumDict = cutil.getTileNumDict(copyHandTiles);
        var upTilesOpsList = player.curGameRoom.upTilesOpsList[serverSitNum];
        var kongList = cutil.getKongClassify(upTilesOpsList);
        // 明杠(不包括 红中/白板)
        cannon_value[12] += kongList[0];
        // 暗杠(不包括 红中/白板)
        cannon_value[13] += 2*kongList[1];
        // 明杠 红中/白板
        cannon_value[12] += 3*kongList[2];
        // 暗杠 红中/白板
        cannon_value[13] += 4*kongList[3];
        //手抓 3 红中/白板
        if (tile2NumDict[const_val.DRAGON_RED.toString()] >= 3) {
            cannon_value[14] += 2;
        }
        if (tile2NumDict[const_val.DRAGON_WHITE.toString()] >= 3) {
            cannon_value[15] += 2;
        }
        // 碰红中/白板
        for (var i = 0; i < uptiles.length; i++) {
            if (uptiles[i].length == 3 && uptiles[i][0] == const_val.DRAGON_RED) {
                cannon_value[14] ++;
            }
            if (uptiles[i].length == 3 && uptiles[i][0] == const_val.DRAGON_WHITE) {
                cannon_value[15] ++;
            }
        }
        //发财
        cannon_value[16] = player.curGameRoom.dragonGreenList[serverSitNum].length;
        for(var i = 0; i < 5 ; i++){
            if(cannon_value[12 + i] > 0 && index <= 6){
                if(i === 4 && cannon_value[12 + i] === 4){
                    continue;
                }
                this.create_label(cannon_value[12 + i], index, win_type_img_list);
                win_type_img_list[index].loadTexture("res/ui/SettlementUI/cannon_value_"+ i.toString() +".png");
                win_type_img_list[index].setVisible(true);
                index += 1;
            }
        }
        cc.log("cannon_value:",cannon_value);
	},

	create_label:function (cannon_num, index, win_type_img_list) {
		if(!cannon_num){
			return;
		}
        var cannon_label = new cc.LabelTTF("", "Arial", 30);
        cannon_label.setAnchorPoint(0, 0.5);
        cannon_label.setColor(cc.color(255, 255, 0));
        cannon_label.setString(cannon_num.toString() + "炮");
        cannon_label.setVisible(true);
        cannon_label.setPosition(cc.p(win_type_img_list[index].getContentSize().width * 0.9, win_type_img_list[index].getContentSize().height * 0.45));
        win_type_img_list[index].addChild(cannon_label);
    },

	update_score:function(serverSitNum, score){
		var score_label = this.player_tiles_panels[serverSitNum].getChildByName("item_score_label");
		if(score >= 0){
			score_label.setTextColor(cc.color(62, 121, 77));
			score_label.setString("+" + score.toString());
		} else {
			score_label.setTextColor(cc.color(144, 71, 64));
			score_label.setString(score.toString());
		}
	},

    update_luckytiles:function(serverSitNum, luckyTileList){
        var lucky_num = h1global.entityManager.player().curGameRoom.lucky_num;
        if(lucky_num == 0){
            return;
        }
		var lucky_tiles_panel = this.player_tiles_panels[serverSitNum].getChildByName("lucky_tiles_panel");
		var panel_width = 70 * lucky_num;
		lucky_tiles_panel.setContentSize(cc.size(panel_width, lucky_tiles_panel.getContentSize().height));
		lucky_tiles_panel.setVisible(true);
		for (var i = 0; i < lucky_num; i++) {
			var tile_img = lucky_tiles_panel.getChildByName("tile_img" + i.toString());
			var mahjong_img = tile_img.getChildByName("mahjong_img");
			var box_img = tile_img.getChildByName("box_img");
			var luckyTileNum = luckyTileList[i];
			if (luckyTileNum) {
				tile_img.setPositionX(lucky_num == 1 ? 35 : 40 + 60 * i);
				tile_img.setVisible(true);
				mahjong_img.ignoreContentAdaptWithSize(true);
				mahjong_img.loadTexture("Mahjong/mahjong_big_" + luckyTileNum.toString() + ".png", ccui.Widget.PLIST_TEXTURE);
				mahjong_img.setVisible(true);
				var luckytiles_list = [1,5,9,11,15,19,21,25,29];
				if(luckytiles_list.indexOf(luckyTileNum) >= 0){
				    box_img.setVisible(true);
                }else {
                    box_img.setVisible(false);
                }
			} else {
				tile_img.setVisible(false);
			}
		}
		if(lucky_num == 1){
			lucky_tiles_panel.getChildByName("tile_img1").setVisible(false);
		}
    },
});