# -*- coding: utf-8 -*-

import time
import re
import const
import copy
from KBEDebug import *
from datetime import datetime
from KBEDebug import *
import hashlib
import time
import AsyncRequest
import json
import switch

def get_count(tiles, t):
	return sum([1 for i in tiles if i == t])

def meld_with_pair_need_num(tiles, history):
	case1 = case2 = 999
	if meld_only_need_num(tiles, history) == 0:
		case1 = 2

	for i in tiles:
		tmp = list(tiles)
		if get_count(tiles, i) == 1:
			tmp.remove(i)
			case2 = min(case2, 1 + meld_only_need_num(tmp, history))
		else:
			tmp.remove(i)
			tmp.remove(i)
			case2 = min(case2, meld_only_need_num(tmp, history))

	return min(case1, case2)

def meld_only_need_num(tiles, history, used = 0):
	if used > 4:
		return 999
	tiles = sorted(tiles)
	key = tuple(tiles)
	if key in history.keys():
		return history[key]

	size = len(tiles)
	if size == 0:
		return 0
	if size == 1:
		return 2
	if size == 2:
		p1, p2 = tiles[:2]
		case1 = 999
		if not(p1 == 9 or p1 == 19 or p1 >= 29):
			if p2 - p1 <= 2:
				case1 = 1
		case2 = 0
		if p1 == p2:
			case2 = 1
		else:
			case2 = 4
		return min(case1, case2)
		# if p1 == p2 or p2 - p1 <= 2:
		# 	return 1
		# else:
		# 	return 4

	first = tiles[0]
	# 自己组成顺子
	left1 = list(tiles[1:])
	case1 = 0
	if first == 9 or first == 19 or first >= 29:
		case1 = 999
	else:
		if first+1 in left1:
			left1.remove(first+1)
		else:
			case1 += 1
		if first+2 in left1:
			left1.remove(first+2)
		else:
			case1 += 1
		res1 = meld_only_need_num(left1, history)
		history[tuple(left1)] = res1
		case1 += res1

	# 自己组成刻子
	left2 = list(tiles[1:])
	case2 = 0
	count = get_count(left2, first)
	if count >= 2:
		left2.remove(first)
		left2.remove(first)
	elif count == 1:
		left2.remove(first)
		case2 += 1
	else:
		case2 += 2
	res2 = meld_only_need_num(left2, history)
	history[tuple(left2)] = res2
	case2 += res2
	result = min(case1, case2)
	history[tuple(tiles)] = result
	return result

def is_same_day(ts1, ts2):
	d1 = datetime.fromtimestamp(ts1)
	d2 = datetime.fromtimestamp(ts2)

	if (d1.year, d1.month, d1.day) == (d2.year, d2.month, d2.day):
		return True
	return False

def gen_room_id(kbe_pid):
	return 100168 + kbe_pid

def filter_emoji(nickname):
	try:
		# UCS-4
		highpoints = re.compile(u'[\U00010000-\U0010ffff]')
	except re.error:
		# UCS-2
		highpoints = re.compile(u'[\uD800-\uDBFF][\uDC00-\uDFFF]')
	nickname = highpoints.sub(u'', nickname)
	return nickname

def classifyTiles(tiles, kingTiles):
	kings = []
	chars = []
	bambs = []
	dots = []
	winds = []
	dragons = []

	tiles = sorted(tiles)
	for t in tiles:
		if t in kingTiles:
			kings.append(t)
		elif t in const.CHARACTER:
			chars.append(t)
		elif t in const.BAMBOO:
			bambs.append(t)
		elif t in const.DOT:
			dots.append(t)
		elif t in const.WINDS:
			winds.append(t)
		elif t in const.DRAGONS:
			dragons.append(t)
	return [kings, chars, bambs, dots, winds, dragons]

def classifyTiles4Type(tiles):
	chars = []
	bambs = []
	dots = []
	winds_dragons = []
	tiles = sorted(tiles)
	for t in tiles:
		if t in const.CHARACTER:
			chars.append(t)
		elif t in const.BAMBOO:
			bambs.append(t)
		elif t in const.DOT:
			dots.append(t)
		elif t in const.WINDS or t in const.DRAGONS:
			winds_dragons.append(t)
	return [chars, bambs, dots, winds_dragons]

def getTile2NumDict(tiles):
	tile2NumDict = {}
	for t in tiles:
		if t not in tile2NumDict:
			tile2NumDict[t] = 1
		else:
			tile2NumDict[t] += 1
	return tile2NumDict

def getPairNum(tiles, isContainTriple = False, isContainKong = False):
	num = 0
	tile2NumDict = getTile2NumDict(tiles)
	for tile in tile2NumDict:
		if tile2NumDict[tile] == 2:
			num += 1
		elif tile2NumDict[tile] == 3 and isContainTriple:
			num += 1
		elif tile2NumDict[tile] == 4 and isContainKong:
			num += 2
	return num

def getKongNum(tiles):
	num = 0
	tile2NumDict = getTile2NumDict(tiles)
	for tile in tile2NumDict:
		if tile2NumDict[tile] == 4:
			num += 1
	return num

def getTileNum(tiles, aimTile):
	num = 0
	tile2NumDict = getTile2NumDict(tiles)
	if aimTile in tile2NumDict:
		num = tile2NumDict[aimTile]
	return num

# 发送网络请求
def get_user_info(accountName, callback):
	ts = int(time.mktime(datetime.now().timetuple()))
	tosign = accountName + "_" + str(ts) + "_" + switch.PHP_SERVER_SECRET
	m1 = hashlib.md5()
	m1.update(tosign.encode())
	sign = m1.hexdigest()
	url = switch.PHP_SERVER_URL + 'user_info_server'
	suffix = '?timestamp=' + str(ts) + '&unionid=' + accountName + '&sign=' + sign
	AsyncRequest.Request(url + suffix, lambda x:callback(x.read()) if x else DEBUG_MSG(url + suffix + " error!"))

def update_card_diamond(accountName, deltaCard, deltaDiamond, callback, reason = ""):
	ts = int(time.mktime(datetime.now().timetuple()))
	tosign = accountName + "_" + str(ts) + "_" + str(deltaCard) + "_" + str(deltaDiamond) + "_" + switch.PHP_SERVER_SECRET
	m1 = hashlib.md5()
	m1.update(tosign.encode())
	sign = m1.hexdigest()
	DEBUG_MSG("MD5::" +sign)
	url = switch.PHP_SERVER_URL + 'update_card_diamond'
	data = {
		"timestamp" : ts,
		"delta_card" : deltaCard,
		"delta_diamond" : deltaDiamond,
		"unionid" : accountName,
		"sign" : sign,
		"reason" : reason
	}
	AsyncRequest.Post(url, data, lambda x:callback(x.read()) if x else DEBUG_MSG(url + str(data) + " error!"))

#**********************************************************武宁麻将**************************************************
# 7对
def checkIs7Pair(handTiles):
	if len(handTiles) != const.INIT_TILE_NUMBER + 1:
		return False
	tile2NumDict = getTile2NumDict(handTiles)
	for t in tile2NumDict:
		if tile2NumDict[t] % 2 != 0:
			return False
	return True

#移除 手牌 最后 一张的对子（判断 是否 可以 吊将）
def getRemoveFinalPairTiles(handTiles, finalTile):
	tiles = handTiles[:]
	tile2NumDict = getTile2NumDict(tiles)
	if finalTile not in tile2NumDict or tile2NumDict[finalTile] < 2:
		return []
	tiles.remove(finalTile)
	tiles.remove(finalTile)
	return tiles

#移除 手牌 最后 一张的夹（判断 是否 可以 夹胡）
def getRemoveFinalMidTiles(handTiles, finalTile):
	for mid in const.MID:
		if finalTile in mid and finalTile in handTiles and finalTile-1 in handTiles and finalTile+1 in handTiles:
			handTiles.remove(finalTile)
			handTiles.remove(finalTile-1)
			handTiles.remove(finalTile+1)
	return []
# 清一色
def checkIsSameSuit(handTiles, uptiles):
	copyTiles = handTiles[:]
	tile = copyTiles[0]
	if tile in const.DRAGONS or tile in const.WINDS or tile in const.SEASON or tile in const.FLOWER:
		return False
	for t in copyTiles[1:]:
		if t//10 != tile//10:
			return False
	for meld in uptiles:
		for t in meld:
			if t//10 != tile//10:
				return False
	return True

# 碰碰胡
def checkIsPongPongWin(handTiles, uptiles):
	for meld in uptiles:
		if (len(meld) != 3 and len(meld) != 4) or meld[0] != meld[-1]:
			return False
	if checkIs7Pair(handTiles):
		return False
	tiles = handTiles[:]
	tile2NumDict = getTile2NumDict(tiles)

	pairNum = 0
	for tile in tile2NumDict:
		if tile2NumDict[tile] != 2 and tile2NumDict[tile] != 3:
			return False
		if tile2NumDict[tile] == 2:
			pairNum +=1
		if pairNum > 1:
			return False
	return True

# 是否打牌
def checkIsDiscard(op_record):
	for i in range(0, len(op_record))[::-1]:
		if op_record[i][0] == const.OP_DISCARD:
			return True
	return False

# 杠上开花
def checkIsKongDrawWin(p_op_r):
	for i in range(0, len(p_op_r))[::-1]:
		DEBUG_MSG(p_op_r[i])
		if p_op_r[i][0] == const.OP_DRAW or p_op_r[i][0] == const.OP_CUT:
			continue
		if p_op_r[i][0] == const.OP_CONCEALED_KONG:
			return True
		elif p_op_r[i][0] == const.OP_EXPOSED_KONG:
			return True
		return False
	return False

# 杠后打牌
def checkIsKongDiscard(p_op_r):
	if len(p_op_r) <= 0:
		return False
	if p_op_r[-1][0] == const.OP_DISCARD:
		for i in range(0, len(p_op_r))[-2::-1]:
			DEBUG_MSG(p_op_r[i])
			if p_op_r[i][0] == const.OP_DRAW or p_op_r[i][0] == const.OP_CUT:
				continue
			if p_op_r[i][0] == const.OP_CONCEALED_KONG:
				return True
			elif p_op_r[i][0] == const.OP_EXPOSED_KONG:
				return True

			return False
	return False