"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     19.06.2016
 * Time     17:16
 */

var KGSUSER_FLAGS_GUEST     = 0x00000001; // 0 бит
var KGSUSER_FLAGS_ONLINE    = 0x00000002; // 0 бит
var KGSUSER_FLAGS_DELETED   = 0x00000004;
var KGSUSER_FLAGS_SLEEPING  = 0x00000008;
var KGSUSER_FLAGS_AVATAR    = 0x00000010;
var KGSUSER_FLAGS_ROBOT     = 0x00000020;
var KGSUSER_FLAGS_WINNER    = 0x00000040;
var KGSUSER_FLAGS_RUNNERUP  = 0x00000080;
var KGSUSER_FLAGS_PLAYING   = 0x00000100;
var KGSUSER_FLAGS_PLAYING_T = 0x00000200;
var KGSUSER_FLAGS_KGSPLUS   = 0x00000400;
var KGSUSER_FLAGS_MEIJIN    = 0x00000800;
var KGSUSER_FLAGS_RANKED    = 0x00001000;
var KGSUSER_FLAGS_TILDE     = 0x00002000;

var KGSUSER_LEVEL_USER        = 0x01;
var KGSUSER_LEVEL_ROBOT       = 0x02;
var KGSUSER_LEVEL_TEACHER     = 0x04;
var KGSUSER_LEVEL_JR_ADMIN    = 0x08;
var KGSUSER_LEVEL_SR_ADMIN    = 0x10;
var KGSUSER_LEVEL_SUPER_ADMIN = 0x20;

function CKGSUser(oClient)
{
	this.m_oClient = oClient;

	this.m_sName  = "";
	this.m_nRank  = -2;
	this.m_nFlags = 0x00000000;
	this.m_nLevel = KGSUSER_LEVEL_USER;
}

CKGSUser.prototype.GetName = function()
{
	return this.m_sName;
};
CKGSUser.prototype.GetRank = function()
{
	return this.m_nRank;
};
CKGSUser.prototype.GetStringRank = function()
{
	return this.m_oClient.GetStringRank(this.m_nRank);
};
CKGSUser.prototype.IsFriend = function()
{
	return this.m_oClient.IsUserInFriendList(this.m_sName);
};
CKGSUser.prototype.Update = function(oUserRecord)
{
	if (oUserRecord.name)
		this.m_sName = oUserRecord.name;

	this.m_nRank = this.m_oClient.GetRank(oUserRecord.rank);

	if (oUserRecord.flags)
		this.private_ParseFlags(oUserRecord.flags);

	if (oUserRecord.authLevel)
		this.private_ParseLevel(oUserRecord.authLevel);
};
CKGSUser.prototype.IsTeacher = function()
{
	return (this.m_nLevel === KGSUSER_LEVEL_TEACHER ? true : false);
};
CKGSUser.prototype.IsAdmin = function()
{
	return ((this.m_nLevel === KGSUSER_LEVEL_JR_ADMIN || this.m_nLevel === KGSUSER_LEVEL_SR_ADMIN || this.m_nLevel === KGSUSER_LEVEL_SUPER_ADMIN) ? true : false);
};
CKGSUser.prototype.IsGuest = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_GUEST ? true : false);
};
CKGSUser.prototype.IsOnline = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_ONLINE? true : false);
};
CKGSUser.prototype.IsDeleted = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_DELETED? true : false);
};
CKGSUser.prototype.IsSleeping = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_SLEEPING ? true : false);
};
CKGSUser.prototype.HasAvatar = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_AVATAR ? true : false);
};
CKGSUser.prototype.IsRobot = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_ROBOT ? true : false);
};
CKGSUser.prototype.IsTournamentWinner = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_WINNER ? true : false);
};
CKGSUser.prototype.IsTournamentRunnerup = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_RUNNERUP ? true : false);
};
CKGSUser.prototype.IsPlaying = function()
{
	return (((this.m_nFlags & KGSUSER_FLAGS_PLAYING) || (this.m_nFlags & KGSUSER_FLAGS_PLAYING_T)) ? true : false);
};
CKGSUser.prototype.IsKgsPlusSubscriber = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_KGSPLUS ? true : false);
};
CKGSUser.prototype.IsMeijin = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_MEIJIN ? true : false);
};
CKGSUser.prototype.CanPlayRanked = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_RANKED ? true : false);
};
CKGSUser.prototype.IsTilde = function()
{
	return (this.m_nFlags & KGSUSER_FLAGS_TILDE ? true : false);
};
CKGSUser.prototype.private_ParseFlags = function(sFlags)
{
	// 	Flags
	//  g  Guest
	//  c  Connected (logged in right now)
	//  d  Account has been deleted
	//  s  User is sleeping (more than 10 minutes since last interaction)
	//  a  User has an avatar.
	//  r  User is a robot.
	//  T  User has won a KGS tournament.
	//  t  User has been runner up in a KGS tournament.
	//  p  User is currently playing in a game.
	//  P  User is currently playing in a KGS tournament game.
	//  *  User is a KGS Plus subscriber.
	//  !  User is KGS Meijin
	//  =  User can play ranked games.
	//  ~  User plays stronger players far more often that weaker ones.

	this.m_nFlags = 0x00000000;
	for (var nPos = 0, nLength = sFlags.length; nPos < nLength; ++nPos)
	{
		var nChar = sFlags.charAt(nPos);
		if ('g' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_GUEST;
		else if ('c' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_ONLINE;
		else if ('d' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_DELETED;
		else if ('s' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_SLEEPING;
		else if ('a' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_AVATAR;
		else if ('r' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_ROBOT;
		else if ('T' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_WINNER;
		else if ('t' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_RUNNERUP;
		else if ('p' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_PLAYING;
		else if ('P' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_PLAYING_T;
		else if ('*' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_KGSPLUS;
		else if ('!' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_MEIJIN;
		else if ('=' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_RANKED;
		else if ('~' === nChar)
			this.m_nFlags |= KGSUSER_FLAGS_TILDE;
	}
};
CKGSUser.prototype.private_ParseLevel = function(sLevel)
{
	if ("robot_ranked" === sLevel)
		this.m_nLevel = KGSUSER_LEVEL_ROBOT;
	else if ("teacher" === sLevel)
		this.m_nLevel = KGSUSER_LEVEL_TEACHER;
	else if ("jr_admin" === sLevel)
		this.m_nLevel = KGSUSER_LEVEL_JR_ADMIN;
	else if ("sr_admin" === sLevel)
		this.m_nLevel = KGSUSER_LEVEL_SR_ADMIN;
	else if ("super_admin" === sLevel)
		this.m_nLevel = KGSUSER_LEVEL_SUPER_ADMIN;
	else //if ("normal" === sLevel)
	 	this.m_nLevel = KGSUSER_LEVEL_USER;
};

function GetKGSUser(oUserRecord)
{
	var oUser = new CKGSUser(oApp.GetClient());
	oUser.Update(oUserRecord);
	return oUser;
}
