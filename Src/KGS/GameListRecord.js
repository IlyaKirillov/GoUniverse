"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     06.07.2016
 * Time     1:05
 */

function CKGSGameListRecord(oClient)
{
	this.m_oClient = oClient;
	this.m_oRooms  = {};

	this.m_nGameId     = -1;
	this.m_nRoomId     = -1;
	this.m_nMoveNumber = 0;
	this.m_nObservers  = 0;
	this.m_sScore      = null;
	this.m_oBlack      = null;
	this.m_oWhite      = null;
	this.m_oOwner      = null;
	this.m_nHandicap   = 0;
	this.m_nBoardSize  = 19;
	this.m_bAdjourned  = false;
	this.m_bEvent      = false;
}
CKGSGameListRecord.prototype.Update = function(oGameRecord)
{
	if ("challenge" === oGameRecord.gameType)
		return;

	this.m_nGameId     = oGameRecord.channelId;
	this.m_nRoomId     = oGameRecord.roomId;
	this.m_nMoveNumber = oGameRecord.moveNum;
	this.m_nObservers  = undefined !== oGameRecord.observers ? oGameRecord.observers : 0;
	this.m_sScore      = undefined !== oGameRecord.score ? this.m_oClient.private_ParseScore(oGameRecord.score) : null;

	if (oGameRecord.players.black)
		this.m_oBlack = this.m_oClient.private_HandleUserRecord2(oGameRecord.players.black);

	if (oGameRecord.players.white)
		this.m_oWhite = this.m_oClient.private_HandleUserRecord2(oGameRecord.players.white);

	if (oGameRecord.players.owner)
		this.m_oOwner = this.m_oClient.private_HandleUserRecord2(oGameRecord.players.owner);

	this.m_nHandicap  = oGameRecord.handicap ? parseInt(oGameRecord.handicap) : 0;
	this.m_nBoardSize = oGameRecord.size ? oGameRecord.size : 19;

	this.m_bAdjourned  = oGameRecord.adjourned ? oGameRecord.adjourned : false;
	this.m_bEvent      = oGameRecord.event ? oGameRecord.event : false;
};
CKGSGameListRecord.prototype.AddRoom = function(nRoomId)
{
	this.m_oRooms[nRoomId] = nRoomId;
};
CKGSGameListRecord.prototype.RemoveRoom = function(nRoomId)
{
	delete this.m_oRooms[nRoomId];

	for (var nId in this.m_oRooms)
	{
		return false;
	}

	return true;
};
CKGSGameListRecord.prototype.GetBlack = function()
{
	return this.m_oBlack;
};
CKGSGameListRecord.prototype.GetWhite = function()
{
	return this.m_oWhite;
};