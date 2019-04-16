// var UIBase = require("src/views/ui/UIBase.js")
// cc.loader.loadJs("src/views/ui/UIBase.js")
"use strict"
var CreateRoomUI = UIBase.extend({
	ctor:function() {
		this._super();
		this.resourceFilename = "res/ui/CreateRoomUI.json";
	},

	initUI:function(){
		this.player_num = 4
		this.round_num = 8
		this.lucky_num = 0
		this.extra_score = 0
		
		this.createroom_panel = this.rootUINode.getChildByName("createroom_panel");
		this.initCreateRoomPanel()

		this.initCreateRoom()
		// create_btn
		this.updateCardDiamond()
	},

	updateCardDiamond:function(){
		var Text_9 = this.rootUINode.getChildByName("createroom_panel").getChildByName("Text_9");
		// Text_9.setString("消耗100钻石，游戏开始后扣除");
        // if(round_num == 8) {
         //    Text_9.setString("AA制，每人消耗2颗钻石，游戏开始后扣除");
        // }else if(round_num == 16){
         //    Text_9.setString("AA制，每人消耗4颗钻石，游戏开始后扣除");
        // }else if(round_num == 32){
         //    Text_9.setString("AA制，每人消耗8颗钻石，游戏开始后扣除");
        // }
		Text_9.setString("AA制,每8局2钻石/人,游戏开始后扣除")
	},

	initCreateRoomPanel:function(){
		var self = this
		var return_btn = ccui.helper.seekWidgetByName(this.createroom_panel, "return_btn")
		function return_btn_event(sender, eventType){
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				self.hide()
			}
		}
		return_btn.addTouchEventListener(return_btn_event)


		//人数
		this.player_num_chx_list = []
		function player_num_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.player_num_chx_list.length; i++) {
					if (sender != self.player_num_chx_list[i]) {
						self.player_num_chx_list[i].setSelected(false)
						self.player_num_chx_list[i].setTouchEnabled(true)
					}else{
						self.player_num = 4-i
                        sender.setSelected(true);
						sender.setTouchEnabled(false)
						cc.log("player_num:", self.player_num)
					}
				}
			}
		}
		for (var i = 0; i < 2; i++) {
			var player_num_chx = ccui.helper.seekWidgetByName(this.createroom_panel, "player_num_chx_" + String(i+1))
			this.player_num_chx_list.push(player_num_chx)
			player_num_chx.addTouchEventListener(player_num_event)
		}
		this.player_num_chx_list[0].setTouchEnabled(false)
		cc.log("player_num:", this.player_num)

		//局数选择
		this.round_num_chx_list = []
		function round_num_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.round_num_chx_list.length; i++) {
					if (sender != self.round_num_chx_list[i]) {
						self.round_num_chx_list[i].setSelected(false)
						self.round_num_chx_list[i].setTouchEnabled(true)
					}else{
						self.round_num = Math.pow(2, i+3)
                        sender.setSelected(true);
						sender.setTouchEnabled(false)
						cc.log("round_num:", self.round_num)
					}
				}
			}
		}
		for (var i = 0; i < 3; i++) {
			var round_num_chx = ccui.helper.seekWidgetByName(this.createroom_panel, "round_chx_" + String(i+1))
			this.round_num_chx_list.push(round_num_chx)
			round_num_chx.addTouchEventListener(round_num_event)
		}
		this.round_num_chx_list[0].setTouchEnabled(false)
		cc.log("round_num:", this.round_num)


		// 滴麻油数
		this.lucky_num_chx_list = []
		function lucky_num_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.lucky_num_chx_list.length; i++) {
					if (sender != self.lucky_num_chx_list[i]) {
						self.lucky_num_chx_list[i].setSelected(false)
						self.lucky_num_chx_list[i].setTouchEnabled(true)
					}else{
						self.lucky_num = i
                        sender.setSelected(true);
						sender.setTouchEnabled(false)
						cc.log("lucky_num:", self.lucky_num)
					}
				}
			}
		}
		for (var i = 0; i < 3; i++) {
			var lucky_num_chx = ccui.helper.seekWidgetByName(this.createroom_panel, "lucky_num_chx_" + String(i+1))
			this.lucky_num_chx_list.push(lucky_num_chx)
			lucky_num_chx.addTouchEventListener(lucky_num_event)
		}
		this.lucky_num_chx_list[0].setTouchEnabled(false)
		cc.log("lucky_num:", this.lucky_num)

		// 捆买分数
		this.extra_score_chx_list = []
		function extra_score_event(sender, eventType){
			if (eventType == ccui.CheckBox.EVENT_SELECTED || eventType == ccui.CheckBox.EVENT_UNSELECTED) {
				for (var i = 0; i < self.extra_score_chx_list.length; i++) {
					if (sender != self.extra_score_chx_list[i]) {
						self.extra_score_chx_list[i].setSelected(false)
						self.extra_score_chx_list[i].setTouchEnabled(true)
					}else{
						self.extra_score = i
                        sender.setSelected(true);
						sender.setTouchEnabled(false)
						cc.log("extra_score:", self.extra_score)
					}
				}
			}
		}
		for (var i = 0; i < 3; i++) {
			var extra_score_chx = ccui.helper.seekWidgetByName(this.createroom_panel, "extra_score_chx_" + String(i+1))
			this.extra_score_chx_list.push(extra_score_chx)
			extra_score_chx.addTouchEventListener(extra_score_event)
		}
		this.extra_score_chx_list[0].setTouchEnabled(false)
		cc.log("extra_score:", this.extra_score)
	},


	initCreateRoom:function(){
		var self = this
		var create_btn = ccui.helper.seekWidgetByName(this.createroom_panel, "create_btn")
		function create_btn_event(sender, eventType){
			if (eventType == ccui.Widget.TOUCH_ENDED) {
				cutil.lock_ui();
				h1global.entityManager.player().createRoom(self.player_num, self.round_num, self.lucky_num, self.extra_score, 0);
				self.hide()
			}
		}
		create_btn.addTouchEventListener(create_btn_event)
	}
});