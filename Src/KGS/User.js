"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     19.06.2016
 * Time     17:16
 */

function CKGSUser(oClient)
{
	this.m_oClient = oClient;

	this.m_sName = "";
	this.m_nRank = -2;

	this.m_bFriend = false;
	this.m_bAvatar = false;
	this.m_bOnline = false;
}

CKGSUser.prototype.GetName = function()
{
	return this.m_sName;
};
CKGSUser.prototype.GetRank = function()
{
	return this.m_nRank;
};
CKGSUser.prototype.IsFriend = function()
{
	return this.m_bFriend;
};
CKGSUser.prototype.IsOnline = function()
{
	return this.m_bOnline;
};
CKGSUser.prototype.Update = function(oUserRecord)
{
	if (oUserRecord.name)
	{
		this.m_sName   = oUserRecord.name;
		this.m_bFriend = this.m_oClient.IsUserInFriendList(this.m_sName);
	}
	
	if (oUserRecord.rank)
	{
		this.m_nRank = this.m_oClient.GetRank(oUserRecord.rank);
	}

	if (oUserRecord.flags)
	{

	}
};