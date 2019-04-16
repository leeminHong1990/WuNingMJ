# -*- coding: utf-8 -*-

import KBEngine
from KBEDebug import *
import utility
import const
import random

class iRoomRules(object):

	def __init__(self):
		# 房间的牌堆
		self.tiles = []
		self.meld_dict = dict()

	def initTiles(self):
		# 万 条 筒
		self.tiles = const.CHARACTER * 4 + const.BAMBOO * 4 + const.DOT * 4
		# 中 发 白
		self.tiles += [const.DRAGON_RED, const.DRAGON_WHITE] * 4
		DEBUG_MSG(self.tiles)
		self.shuffle_tiles()

	def shuffle_tiles(self):
		random.shuffle(self.tiles)

	def deal(self, kingTypeNum = 1):
		""" 发牌 """
		for i in range(const.INIT_TILE_NUMBER):
			for j in range(self.player_num):
				self.players_list[j].tiles.append(self.tiles[j])
			self.tiles = self.tiles[self.player_num:]

		for i, p in enumerate(self.players_list):
			DEBUG_MSG("deal{0}:{1}".format(i, p.tiles))
		"""杠发财"""
		for i in range(self.player_num):
			for j in range(len(self.players_list[i].tiles)-1, -1, -1):
				tile = self.players_list[i].tiles[j]
				if tile == const.DRAGON_GREEN:
					del self.players_list[i].tiles[j]
					self.players_list[i].dragon_greens.append(tile)
					DEBUG_MSG("kong dragon_greens{0},{1}".format(i, tile))
		"""补牌"""
		for i in range(self.player_num):
			while len(self.players_list[i].tiles) < const.INIT_TILE_NUMBER:
				if len(self.tiles) <= 0:
					break
				tile = self.tiles[0]
				self.tiles = self.tiles[1:]
				if tile == const.DRAGON_GREEN:
					self.players_list[i].dragon_greens.append(tile)
					DEBUG_MSG("add dragon_greens{0},{1}".format(i, tile))
				else:
					self.players_list[i].tiles.append(tile)
					DEBUG_MSG("add dragon_greens_{0},{1}".format(i, tile))
		"""加入发财"""
		self.tiles += [const.DRAGON_GREEN] * 4
		random.shuffle(self.tiles)
		""" 整理 """
		for i in range(self.player_num):
			self.players_list[i].tidy(self.kingTiles)

	def getLuckyTiles(self, winIdxList):
		luckyTileList = []
		prep_tiles = const.CHARACTER * 4 + const.BAMBOO * 4 + const.DOT * 4 # 万 条 筒
		prep_tiles += [const.DRAGON_RED, const.DRAGON_GREEN, const.DRAGON_WHITE] * 4 # 中 发 白
		random.shuffle(prep_tiles)
		for i, p in enumerate(self.players_list):
			luckyTileList.append([])
			if i in winIdxList:
				for x in range(self.lucky_num):
					if len(self.tiles) > 0:
						tile = self.tiles[0]
						luckyTileList[i].append(tile)
						self.tiles = self.tiles[1:]
						prep_tiles.remove(tile)
					else:
						tile = prep_tiles[0]
						luckyTileList[i].append(tile)
						prep_tiles = prep_tiles[1:]
		return luckyTileList


	def swapTileToTop(self, tile):
		if tile in self.tiles:
			tileIdx = self.tiles.index(tile)
			self.tiles[0], self.tiles[tileIdx] = self.tiles[tileIdx], self.tiles[0]

	def winCount(self):
		pass
	
	def can_cut_after_kong(self):
		return True

	def can_discard(self, tiles, t):
		if t in tiles:
			return True
		return False

	def can_chow(self, tiles, t):
		return False
		# if t >= 30:
		# 	return False
		# neighborTileNumList = [0, 0, 1, 0, 0]
		# for i in range(len(tiles)):
		# 	if (tiles[i] - t >= -2 and tiles[i] - t <= 2):
		# 		neighborTileNumList[tiles[i] - t + 2] += 1
		# for i in range(0,3):
		# 	tileNum = 0
		# 	for j in range(i,i+3):
		# 		if neighborTileNumList[j] > 0:
		# 			tileNum += 1
		# 		else:
		# 			break
		# 	if tileNum >= 3:
		# 		return True
		# return False

	def can_chow_one(self, tiles, tile_list):
		return False
		# """ 能吃 """
		# if tile_list[0] >= 30:
		# 	return False
		# if sum([1 for i in tiles if i == tile_list[1]]) >= 1 and sum([1 for i in tiles if i == tile_list[2]]) >= 1:
		# 	sortLis = sorted(tile_list)
		# 	if (sortLis[2] + sortLis[0])/2 == sortLis[1] and sortLis[2] - sortLis[0] == 2:
		# 		return True
		# return False

	def can_pong(self, tiles, t, idx):
		""" 能碰 """
		if t in self.kingTiles:
			return False
		if t in self.players_list[idx].pass_dealer[1]:
			return False
		return sum([1 for i in tiles if i == t]) >= 2

	def can_exposed_kong(self, tiles, t):
		""" 能明杠 """
		if t in self.kingTiles:
			return False
		if t == const.DRAGON_GREEN:
			return False
		return utility.get_count(tiles, t) == 3

	def can_self_exposed_kong(self, player, t):
		""" 自摸的牌能够明杠 """
		if t in self.kingTiles:
			return False
		if t == const.DRAGON_GREEN:
			return False
		for op in player.op_r:
			if op[0] == const.OP_PONG and op[1][0] == t:
				return True
		return False

	def can_concealed_kong(self, tiles, t):
		""" 能暗杠 """
		if t in self.kingTiles:
			return False
		if t == const.DRAGON_GREEN:
			return False
		return utility.get_count(tiles, t) == 4

	def check_is_dragon_green(self, tiles):
		num = utility.get_count(tiles, const.DRAGON_GREEN)
		if len(tiles) != num or len(tiles) <= 0:
			return False
		return True

	def get_dragon_green_num(self, tiles):
		return utility.get_count(tiles, const.DRAGON_GREEN)

	def can_kong_wreath(self, tiles, t):
		if t in tiles and (t in const.SEASON or t in const.FLOWER):
			return True
		return False

	def can_wreath_win(self, wreaths):
		if len(wreaths) == len(const.SEASON) + len(const.FLOWER):
			return True
		return False

	def classify_tiles(self, tiles):
		chars = []
		bambs = []
		dots  = []
		dragon_red = 0
		for t in tiles:
			if t in const.CHARACTER:
				chars.append(t)
			elif t in const.BAMBOO:
				bambs.append(t)
			elif t in const.DOT:
				dots.append(t)
			elif t == const.DRAGON_RED:
				dragon_red += 1
			else:
				DEBUG_MSG("iRoomRules classify tiles failed, no this tile %s"%t)
		return chars, bambs, dots, dragon_red

	def getNormalTipsWinList(self, handTiles, finalTile):
		copyHandTiles = handTiles[:]
		copyHandTiles = sorted(copyHandTiles)
		tipsList = []
		copyHandTiles.remove(finalTile)
		# 万 条 筒
		for tup in (const.CHARACTER, const.BAMBOO, const.DOT):
			for t in tup:
				tryTiles = copyHandTiles[:]
				tryTiles.append(t)
				tryTiles = sorted(tryTiles)
				if utility.meld_with_pair_need_num(tryTiles, {}) <= 0:
					tipsList.append(t)
		# 红中
		tryTiles = copyHandTiles[:]
		tryTiles.append(const.DRAGON_RED)
		tryTiles = sorted(tryTiles)
		if utility.meld_with_pair_need_num(tryTiles, {}) <= 0:
			tipsList.append(const.DRAGON_RED)
		# 白板
		tryTiles = copyHandTiles[:]
		tryTiles.append(const.DRAGON_WHITE)
		tryTiles = sorted(tryTiles)
		if utility.meld_with_pair_need_num(tryTiles, {}) <= 0:
			tipsList.append(const.DRAGON_WHITE)
		return tipsList


	def can_win(self, handTiles, finalTile, win_op, idx):
		DEBUG_MSG("check can win:{}".format(idx))
		victory_value = 0
		result = [0] * 12
		if const.DRAGON_GREEN in handTiles:
			return False, victory_value, result
		if win_op == const.OP_GIVE_WIN and self.players_list[idx].pass_dealer[0]: # 没过庄不能胡
			return False, victory_value, result
		p = self.players_list[idx]
		copyHandTiles = handTiles[:]
		copyHandTiles = sorted(copyHandTiles)
		tile2NumDict = utility.getTile2NumDict(handTiles)
		# 杠子
		kongNum = sum([1 for meld in p.upTiles if len(meld) == 4])	
		# 门前清
		pongExposedKongNum = sum([1 for player_op in p.op_r if player_op[0] == const.OP_EXPOSED_KONG])
		pongExposedKongNum += sum([1 for meld in p.upTiles if len(meld) <= 3])
		# 发财数量
		dragonGreenNum = len(p.dragon_greens)

		# 7对
		if utility.checkIs7Pair(copyHandTiles):
			#**********1炮*************
			# 平胡
			result[0] = 1
			victory_value += 1
			DEBUG_MSG("PingHu victory_value:{0}".format(victory_value))
			DEBUG_MSG("平胡")
			# 自摸
			if win_op == const.OP_DRAW_WIN:
				result[1] = 1
				victory_value += 1
				DEBUG_MSG("ZiMo victory_value:{0}".format(victory_value))
				DEBUG_MSG("自摸")

			#**********2炮*************
			# 手抓 3 红中/白板
			if const.DRAGON_RED in tile2NumDict and tile2NumDict[const.DRAGON_RED] >= 3:
				victory_value += 2
				DEBUG_MSG("SanHongZhong victory_value:{0}".format(victory_value))
				DEBUG_MSG("手抓 3 红中")
			if const.DRAGON_WHITE in tile2NumDict and tile2NumDict[const.DRAGON_WHITE] >= 3:
				victory_value += 2
				DEBUG_MSG("SanBaiBan victory_value:{0}".format(victory_value))
				DEBUG_MSG("手抓 3 白板")
			#**********5炮*************
			# 抢杠
			if win_op == const.OP_KONG_WIN:
				result[4] = 1
				victory_value += 5
				DEBUG_MSG("QiangGang victory_value:{0}".format(victory_value))
				DEBUG_MSG("抢杠")
			# 流泪
			if win_op == const.OP_GIVE_WIN and utility.checkIsKongDiscard(self.players_list[self.last_player_idx].op_r):
				result[5] = 1
				victory_value += 5
				DEBUG_MSG("LiuLei victory_value:{0}".format(victory_value))
				DEBUG_MSG("流泪")
			#**********7炮*************
			# 7对
			result[6] = 1
			victory_value += 7
			DEBUG_MSG("QiDui victory_value:{0}".format(victory_value))
			DEBUG_MSG("7对")
			#**********8炮*************
			# 4发财
			if dragonGreenNum == 4:
				result[7] = 1
				victory_value += 8
				DEBUG_MSG("SiFangCai victory_value:{0}".format(victory_value))
				DEBUG_MSG("4发财")
			else:
				victory_value += dragonGreenNum
				DEBUG_MSG("FangCai victory_value:{0}".format(victory_value))
				DEBUG_MSG("发财")
			#**********10炮*************
			# 清一色
			if utility.checkIsSameSuit(handTiles, p.upTiles):
				result[8] = 1
				victory_value += 10
				DEBUG_MSG("QingYiSe victory_value:{0}".format(victory_value))
				DEBUG_MSG("清一色")
			DEBUG_MSG("can win, True, 111, {0}:{1},{2}".format(idx,victory_value, result))
			return True, victory_value, result
		# 3x+2
		elif len(copyHandTiles) % 3 == 2 and utility.meld_with_pair_need_num(copyHandTiles, {}) <= 0:
			# 平胡
			result[0] = 1
			victory_value += 1
			DEBUG_MSG("PingHu victory_value:{0}".format(victory_value))
			DEBUG_MSG("平胡")
			# 全求人
			if len(copyHandTiles) == 2 and win_op != const.OP_DRAW_WIN:
				result[11] = 1
				victory_value += 10
				DEBUG_MSG("QuanQiuRen victory_value:{0}".format(victory_value))
				DEBUG_MSG("全求人")
			else:
				#**********1炮*************
				tipsList = self.getNormalTipsWinList(copyHandTiles, finalTile)
				if len(tipsList) == 1:
					victory_value += 1
					DEBUG_MSG("DiaoDanZhang victory_value:{0}".format(victory_value))
					result[2] = 1
					DEBUG_MSG("胡单张")

				#**********5炮*************
				# 碰碰胡
				if utility.checkIsPongPongWin(handTiles, p.upTiles):
					result[9] = 1
					victory_value += 5
					DEBUG_MSG("PengPengHu victory_value:{0}".format(victory_value))
					DEBUG_MSG("碰碰胡")

			#**********1炮*************
			# 自摸
			if win_op == const.OP_DRAW_WIN:
				result[1] = 1
				victory_value += 1
				DEBUG_MSG("ZiMo victory_value:{0}".format(victory_value))
				DEBUG_MSG("自摸")
			

			# if len(copyHandTiles) > 2:
			# 	# 单张吊
			# 	removePairTiles = utility.getRemoveFinalPairTiles(copyHandTiles, finalTile)
			# 	if len(removePairTiles) > 0 and utility.meld_only_need_num(removePairTiles, {}) <= 0:
			# 		victory_value += 1
			# 	else:
			# 		# 卡张
			# 		removeMidTiles = utility.getRemoveFinalMidTiles(copyHandTiles, finalTile)
			# 		if len(removeMidTiles) > 0 and and utility.meld_with_pair_need_num(removeMidTiles, {}) <= 0:
			# 			victory_value += 1
			
			# 门前清
			if pongExposedKongNum <= 0:
				result[3] = 1
				victory_value += 1
				DEBUG_MSG("MenQianQing victory_value:{0}".format(victory_value))
				DEBUG_MSG("门前清")
			
			# 碰红中/白板
			victory_value += sum([i for i in p.pongList])
			DEBUG_MSG("PengBaiBan/HongZhong victory_value:{0}".format(victory_value))
			DEBUG_MSG("碰红中/白板")
			
			# 明杠(不包括红中/白板)
			victory_value += p.exposedKongList[0]
			DEBUG_MSG("MingGang(WuBaiBan/HongZhong) victory_value:{0}".format(victory_value))
			DEBUG_MSG("明杠")

			#**********2炮*************
			# 手抓 3 红中/白板
			if const.DRAGON_RED in tile2NumDict and tile2NumDict[const.DRAGON_RED] >= 3:
				victory_value += 2
				DEBUG_MSG("SanHongZhong victory_value:{0}".format(victory_value))
				DEBUG_MSG("手抓 3 红中")
			if const.DRAGON_WHITE in tile2NumDict and tile2NumDict[const.DRAGON_WHITE] >= 3:
				victory_value += 2
				DEBUG_MSG("SanBaiBan victory_value:{0}".format(victory_value))
				DEBUG_MSG("手抓 3 白板")
			# 暗杠 不包括 红中/白板
			victory_value += 2 * p.concealedKongList[0]
			DEBUG_MSG("AnGang(WuBaiBan/HongZhong) victory_value:{0}".format(victory_value))
			DEBUG_MSG("暗杠 不包括 红中/白板")

			#**********3炮*************
			# 明杠 红中/白板
			victory_value += 3 * p.exposedKongList[1]
			victory_value += 3 * p.exposedKongList[2]
			DEBUG_MSG("MingGang victory_value:{0}".format(victory_value))
			DEBUG_MSG("明杠 红中/白板")
			#**********4炮*************
			# 暗杠 红中/白板
			victory_value += 4 * p.concealedKongList[1]
			victory_value += 4 * p.concealedKongList[2]
			DEBUG_MSG("AnGang victory_value:{0}".format(victory_value))
			DEBUG_MSG("暗杠 红中/白板")
			#**********5炮*************
			# 抢杠
			if win_op == const.OP_KONG_WIN:
				result[4] = 1
				victory_value += 5
				DEBUG_MSG("QiangGangHu victory_value:{0}".format(victory_value))
				DEBUG_MSG("抢杠")
			# 杠开
			if win_op == const.OP_DRAW_WIN and utility.checkIsKongDrawWin(p.op_r):
				result[10] = 1
				victory_value += 5
				DEBUG_MSG("GangKai victory_value:{0}".format(victory_value))
				DEBUG_MSG("杠开")
			# 流泪
			if win_op == const.OP_GIVE_WIN and utility.checkIsKongDiscard(self.players_list[self.last_player_idx].op_r):
				result[5] = 1
				victory_value += 5
				DEBUG_MSG("LiuLei victory_value:{0}".format(victory_value))
				DEBUG_MSG("流泪")
			#**********8炮*************
			# 4发财
			if dragonGreenNum == 4:
				result[7] = 1
				victory_value += 8
				DEBUG_MSG("SiFaCai victory_value:{0}".format(victory_value))
				DEBUG_MSG("4发财")
			else:
				victory_value += dragonGreenNum
				DEBUG_MSG("FaCai victory_value:{0}".format(victory_value))
				DEBUG_MSG("发财")

			#**********10炮*************
			# 清一色
			if utility.checkIsSameSuit(handTiles, p.upTiles):
				result[8] = 1
				victory_value += 10
				DEBUG_MSG("QingYiSe victory_value:{0}".format(victory_value))
				DEBUG_MSG("清一色")
			
			DEBUG_MSG("can win:{0},{1}".format(victory_value, result))
			# 一炮不能抓炮胡
			if victory_value <= 1:
				DEBUG_MSG("can win,False 222,{0}:{1},{2}".format(idx, victory_value, result))
				return False, victory_value, result
			DEBUG_MSG("can win,True 333,{0}:{1},{2}".format(idx, victory_value, result))
			return True, victory_value, result
		DEBUG_MSG("can win,False 444,{0}:{1},{2}".format(idx, victory_value, result))
		return False, victory_value, result