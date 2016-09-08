"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     06.07.2016
 * Time     1:05
 */

var EKGSGameType = {
	Challenge     : 0,
	Demonstration : 1,
	Review        : 2,
	RengoReview   : 3,
	Teaching      : 4,
	Simul         : 5,
	Rengo         : 6,
	Free          : 7,
	Ranked        : 8,
	Tournament    : 9
};

function CKGSGameListRecord(oClient)
{
	this.m_oClient = oClient;
	this.m_oRooms  = {};

	this.m_nGameId     = -1;
	this.m_nRoomId     = -1;
	this.m_nGameType   = EKGSGameType.Ranked;
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
	this.m_bPrivate    = false;

	this.m_oChallengeCreator = null;
	this.m_oProposal         = null;
	this.m_sComment          = "";
}
CKGSGameListRecord.prototype.Update = function(oGameRecord)
{
	this.private_ParseGameType(oGameRecord.gameType);

	this.m_nGameId  = oGameRecord.channelId;
	this.m_nRoomId  = oGameRecord.roomId;
	this.m_bPrivate = true === oGameRecord.private ? true : false;

	if (EKGSGameType.Challenge === this.m_nGameType)
		return this.private_ParseChallenge(oGameRecord);

	this.m_nMoveNumber = oGameRecord.moveNum;
	this.m_nObservers  = undefined !== oGameRecord.observers ? oGameRecord.observers : 0;
	this.m_sScore      = undefined !== oGameRecord.score ? this.m_oClient.private_ParseScore(oGameRecord.score) : null;

	if (oGameRecord.players.black)
		this.m_oBlack = GetKGSUser(oGameRecord.players.black);

	if (oGameRecord.players.white)
		this.m_oWhite = GetKGSUser(oGameRecord.players.white);

	if (oGameRecord.players.owner)
		this.m_oOwner = GetKGSUser(oGameRecord.players.owner);

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
CKGSGameListRecord.prototype.GetOwner = function ()
{
	return this.m_oOwner;
};
CKGSGameListRecord.prototype.GetObservers = function()
{
	return this.m_nObservers;
};
CKGSGameListRecord.prototype.GetGameType = function()
{
	return this.m_nGameType;
};
CKGSGameListRecord.prototype.private_ParseGameType = function(sGameType)
{
	if ("challenge" === sGameType)
		this.m_nGameType = EKGSGameType.Challenge;
	else if ("demonstration" === sGameType)
		this.m_nGameType = EKGSGameType.Demonstration;
	else if ("review" === sGameType)
		this.m_nGameType = EKGSGameType.Review;
	else if ("rengo_review" === sGameType)
		this.m_nGameType = EKGSGameType.RengoReview;
	else if ("teaching" === sGameType)
		this.m_nGameType = EKGSGameType.Teaching;
	else if ("simul" === sGameType)
		this.m_nGameType = EKGSGameType.Simul;
	else if ("rengo" === sGameType)
		this.m_nGameType = EKGSGameType.Rengo;
	else if ("free" === sGameType)
		this.m_nGameType = EKGSGameType.Free;
	else if ("ranked" === sGameType)
		this.m_nGameType = EKGSGameType.Ranked;
	else if ("tournament" === sGameType)
		this.m_nGameType = EKGSGameType.Tournament;
};
CKGSGameListRecord.prototype.GetGameId = function()
{
	return this.m_nGameId;
};
CKGSGameListRecord.prototype.GetMoveNum = function()
{
	return this.m_nMoveNumber;
};
CKGSGameListRecord.prototype.GetScore = function()
{
	return this.m_sScore;
};
CKGSGameListRecord.prototype.IsPrivate = function()
{
	return this.m_bPrivate;
};
CKGSGameListRecord.prototype.IsAdjourned = function()
{
	return this.m_bAdjourned;
};
CKGSGameListRecord.prototype.IsEvent = function()
{
	return this.m_bEvent;
};
CKGSGameListRecord.prototype.GetRoomId = function()
{
	return this.m_nRoomId;
};
CKGSGameListRecord.prototype.GetBoardSize = function()
{
	return this.m_nBoardSize;
};
CKGSGameListRecord.prototype.GetHandicap = function()
{
	return this.m_nHandicap;
};
CKGSGameListRecord.prototype.private_ParseChallenge = function(oGameRecord)
{
	if (oGameRecord.players.challengeCreator)
		this.m_oChallengeCreator = GetKGSUser(oGameRecord.players.challengeCreator);

	this.m_oProposal = new CKGSChallengeProposal(oGameRecord.initialProposal);
	this.m_sComment  = oGameRecord.name ? oGameRecord.name : "";
};
CKGSGameListRecord.prototype.GetProposal = function()
{
	return this.m_oProposal;
};
CKGSGameListRecord.prototype.GetChallengeCreator = function()
{
	return this.m_oChallengeCreator;
};
CKGSGameListRecord.prototype.GetComment = function()
{
	return this.m_sComment;
};
CKGSGameListRecord.prototype.IsChallenge = function()
{
	return (this.m_nGameType === EKGSGameType.Challenge ? true : false);
};

function CKGSChallengeProposal(oGameRecord)
{
	this.m_nGameType  = EKGSGameType.free;
	this.m_sRules     = "japanese";
	this.m_sKomi      = "6.5";
	this.m_nSize      = 19;
	this.m_oTime      = new CTimeSettings();
	this.m_bNigiri    = true === oGameRecord.nigiri ? true : false;
	this.m_arrPlayers = [];

	this.private_ParseGameType(oGameRecord.gameType);
	this.private_ParseRules(oGameRecord.rules);
}
CKGSChallengeProposal.prototype.private_ParseGameType = function(sGameType)
{
	if ("teaching" === sGameType)
		this.m_nGameType = EKGSGameType.Teaching;
	else if ("simul" === sGameType)
		this.m_nGameType = EKGSGameType.Simul;
	else if ("rengo" === sGameType)
		this.m_nGameType = EKGSGameType.Rengo;
	else if ("free" === sGameType)
		this.m_nGameType = EKGSGameType.Free;
	else if ("ranked" === sGameType)
		this.m_nGameType = EKGSGameType.Ranked;
	else if ("tournament" === sGameType)
		this.m_nGameType = EKGSGameType.Tournament;
};
CKGSChallengeProposal.prototype.GetGameType = function()
{
	return this.m_nGameType;
};
CKGSChallengeProposal.prototype.GetRules = function()
{
	return this.m_sRules;
};
CKGSChallengeProposal.prototype.GetKomi = function()
{
	return this.m_sKomi;
};
CKGSChallengeProposal.prototype.GetBoardSize = function()
{
	return this.m_nSize;
};
CKGSChallengeProposal.prototype.private_ParseRules = function(oRules)
{
	this.m_sRules = oRules.rules ? oRules.rules : "japanese";
	this.m_sKomi  = "" + oRules.komi;
	this.m_nSize  = oRules.size ? oRules.size : 19;

	var sTimeType = oRules.timeSystem;
	if ("absolute" === sTimeType)
		this.m_oTime.SetAbsolute(oRules.mainTime);
	else if ("byo_yomi" === sTimeType)
		this.m_oTime.SetByoYomi(oRules.mainTime, oRules.byoYomiTime, oRules.byoYomiPeriods);
	else if ("canadian" === sTimeType)
		this.m_oTime.SetCanadian(oRules.mainTime, oRules.byoYomiTime, oRules.byoYomiStones);
};
CKGSChallengeProposal.prototype.GetTimeSettingsString = function()
{
	return this.m_oTime.GetTimeSystemString();
};