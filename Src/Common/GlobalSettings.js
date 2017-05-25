"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     23.10.2016
 * Time     0:27
 */

function CGoUniverseGlobalSettings(oApp)
{
	this.m_oApp = oApp;

	// Common
	this.m_dChatSplitterPosition = 500;
	this.m_bChatTabsFullHeight   = false;
	this.m_sLocale               = "en-US";


	// KGS specific
	this.m_nKGSGamesListType = EKGSGamesListType.AllGames;
	this.m_nKGSChatRoomId    = -1;
	this.m_bKGSSavePassword  = false;
	this.m_sKGSLogin         = "";
	this.m_sKGSPassword      = "";

	this.m_nKGSChallengeGameType   = EKGSGameType.Free;
	this.m_sKGSChallengeComment    = "";
	this.m_nKGSChallengeRoomId     = -1;
	this.m_nKGSChallengeRules      = EKGSGameRules.Japanese;
	this.m_nKGSChallengeBoardSize  = 19;
	this.m_nKGSChallengeTimeSystem = ETimeSettings.ByoYomi;
	this.m_nKGSChallengeMainTime   = 600;
	this.m_nKGSChallengeOverTime   = 30;
	this.m_nKGSChallengeOverCount  = 5;

	this.m_bKGSUserInfoRecentOnlyRanked = true;

	this.private_ParseChatSplitterPosition();
	this.private_ParseChatTabsFullHeight();
	this.private_ParseLocale();

	this.private_ParseKGSSavePassword();
	this.private_ParseKGSLogin();
	this.private_ParseKGSPassword();

	this.private_ParseKGSUserInfoRecentOnlyRanked();
}
CGoUniverseGlobalSettings.prototype.ParseUserSettings = function()
{
	// Здесь мы парсим только те параметры, которые зависят от пользователя

	// KGS
	this.private_ParseKGSGamesListType();
	this.private_ParseKGSChatRoomId();
	this.private_ParseKGSChallengeGameType();
	this.private_ParseKGSChallengeComment();
	this.private_ParseKGSChallengeRoomId();
	this.private_ParseKGSChallengeRules();
	this.private_ParseKGSChallengeBoardSize();
	this.private_ParseKGSChallengeTimeSystem();
	this.private_ParseKGSChallengeMainTime();
	this.private_ParseKGSChallengeOverTime();
	this.private_ParseKGSChallengeOverCount();
};
CGoUniverseGlobalSettings.prototype.SetChatSplitterPosition = function(dValue)
{
	this.m_dChatSplitterPosition = dValue;
	this.private_SetValue("ChatSplitterPosition", "" + dValue);
};
CGoUniverseGlobalSettings.prototype.GetChatSplitterPosition = function()
{
	return this.m_dChatSplitterPosition;
};
CGoUniverseGlobalSettings.prototype.private_ParseChatSplitterPosition = function()
{
	this.m_dChatSplitterPosition = parseFloat(this.private_GetValue("ChatSplitterPosition"));

	if (isNaN(this.m_dChatSplitterPosition)
		|| null === this.m_dChatSplitterPosition
		|| undefined === this.m_dChatSplitterPosition
		|| this.m_dChatSplitterPosition < 0
		|| this.m_dChatSplitterPosition > 1000)
		this.m_dChatSplitterPosition = 500;
};
CGoUniverseGlobalSettings.prototype.SetChatTabsFullHeight = function(bValue)
{
	this.m_bChatTabsFullHeight = bValue;
	this.private_SetValue("ChatTabsFullHeight", bValue ? "1" : "0");
};
CGoUniverseGlobalSettings.prototype.GetChatTabsFullHeight = function()
{
	return this.m_bChatTabsFullHeight;
};
CGoUniverseGlobalSettings.prototype.private_ParseChatTabsFullHeight = function()
{
	var nValue = this.private_GetValue("ChatTabsFullHeight");
	if (null === nValue
		|| undefined === nValue
		|| "0" === nValue)
		this.m_bChatTabsFullHeight = false;
	else
		this.m_bChatTabsFullHeight = true;
};
CGoUniverseGlobalSettings.prototype.SetLocale = function(sValue)
{
	this.m_sLocale = sValue;
	this.private_SetValue("Locale", sValue);
};
CGoUniverseGlobalSettings.prototype.GetLocale = function()
{
	return this.m_sLocale;
};
CGoUniverseGlobalSettings.prototype.private_ParseLocale = function()
{
	this.m_sLocale = this.private_GetValue("Locale");
	if (null === this.m_sLocale
		|| undefined === this.m_sLocale)
		this.m_sLocale = "en-EN";
};
CGoUniverseGlobalSettings.prototype.SetKGSGamesListType = function(nValue)
{
	this.m_nKGSGamesListType = nValue;
	this.private_SetValueForUser("KGSGamesListType", "" + nValue);
};
CGoUniverseGlobalSettings.prototype.GetKGSGamesListType = function()
{
	return this.m_nKGSGamesListType;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSGamesListType = function()
{
	this.m_nKGSGamesListType = parseInt(this.private_GetValueForUser("KGSGamesListType"));

	if (isNaN(this.m_nKGSGamesListType)
		|| null === this.m_nKGSGamesListType
		|| undefined === this.m_nKGSGamesListType
		|| this.m_nKGSGamesListType < EKGSGamesListType.Min
		|| this.m_nKGSGamesListType > EKGSGamesListType.Max)
		this.m_nKGSGamesListType = EKGSGamesListType.AllGames;
};
CGoUniverseGlobalSettings.prototype.SetKGSChatRoomId = function(nRoomId)
{
	this.m_nKGSChatRoomId = nRoomId;
	this.private_SetValueForUser("KGSChatRoomId", "" + nRoomId);
};
CGoUniverseGlobalSettings.prototype.GetKGSChatRoomId = function()
{
	return this.m_nKGSChatRoomId;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChatRoomId = function()
{
	this.m_nKGSChatRoomId = parseInt(this.private_GetValueForUser("KGSChatRoomId"));
	if (isNaN(this.m_nKGSChatRoomId)
		|| null === this.m_nKGSChatRoomId
		|| undefined === this.m_nKGSChatRoomId)
		this.m_nKGSChatRoomId = -1;
};
CGoUniverseGlobalSettings.prototype.private_SetValue = function(sType, sValue)
{
	if (undefined !== window.localStorage)
		localStorage.setItem("GoUniverseSettings_" + sType, sValue);
};
CGoUniverseGlobalSettings.prototype.private_GetValue = function(sType)
{
	if (undefined !== window.localStorage)
		return localStorage.getItem("GoUniverseSettings_" + sType);

	return "";
};
CGoUniverseGlobalSettings.prototype.private_SetValueForUser = function(sType, sValue)
{
	var oClient = this.m_oApp.GetClient();
	var sUserName = oClient ? oClient.GetUserName() : "";

	if (undefined !== window.localStorage)
		localStorage.setItem("GoUniverseSettings_" + sUserName + "_" + sType, sValue);
};
CGoUniverseGlobalSettings.prototype.private_GetValueForUser = function(sType)
{
	var oClient = this.m_oApp.GetClient();
	var sUserName = oClient ? oClient.GetUserName() : "";

	if (undefined !== window.localStorage)
		return localStorage.getItem("GoUniverseSettings_" + sUserName + "_" + sType);

	return "";
};
CGoUniverseGlobalSettings.prototype.SetKGSChallengeRules = function(nRules)
{
	this.m_nKGSChallengeRules = nRules;
	this.private_SetValueForUser("KGSChallengeRules", "" + nRules);
};
CGoUniverseGlobalSettings.prototype.GetKGSChallengeRules = function()
{
	return this.m_nKGSChallengeRules;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChallengeRules = function()
{
	this.m_nKGSChallengeRules = parseInt(this.private_GetValueForUser("KGSChallengeRules"));
	if (isNaN(this.m_nKGSChallengeRules)
		|| null === this.m_nKGSChallengeRules
		|| undefined === this.m_nKGSChallengeRules)
		this.m_nKGSChallengeRules = EKGSGameRules.Japanese;
};
CGoUniverseGlobalSettings.prototype.SetKGSChallengeBoardSize = function(nSize)
{
	this.m_nKGSChallengeBoardSize = nSize;
	this.private_SetValueForUser("KGSChallengeBoardSize", "" + nSize);
};
CGoUniverseGlobalSettings.prototype.GetKGSChallengeBoardSize = function()
{
	return this.m_nKGSChallengeBoardSize;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChallengeBoardSize = function()
{
	this.m_nKGSChallengeBoardSize = parseInt(this.private_GetValueForUser("KGSChallengeBoardSize"));
	if (isNaN(this.m_nKGSChallengeBoardSize)
		|| null === this.m_nKGSChallengeBoardSize
		|| undefined === this.m_nKGSChallengeBoardSize
		|| this.m_nKGSChallengeBoardSize < 2
		|| this.m_nKGSChallengeBoardSize > 38)
		this.m_nKGSChallengeBoardSize = 19;
};
CGoUniverseGlobalSettings.prototype.SetKGSChallengeTimeSystem = function(nSystem)
{
	this.m_nKGSChallengeTimeSystem = nSystem;
	this.private_SetValueForUser("KGSChallengeTimeSystem", "" + nSystem);
};
CGoUniverseGlobalSettings.prototype.GetKGSChallengeTimeSystem = function()
{
	return this.m_nKGSChallengeTimeSystem;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChallengeTimeSystem = function()
{
	this.m_nKGSChallengeTimeSystem = parseInt(this.private_GetValueForUser("KGSChallengeTimeSystem"));
	if (isNaN(this.m_nKGSChallengeTimeSystem)
		|| null === this.m_nKGSChallengeTimeSystem
		|| undefined === this.m_nKGSChallengeTimeSystem)
		this.m_nKGSChallengeTimeSystem = ETimeSettings.None;
};
CGoUniverseGlobalSettings.prototype.SetKGSChallengeMainTime = function(nMainTime)
{
	this.m_nKGSChallengeMainTime = nMainTime;
	this.private_SetValueForUser("KGSChallengeMainTime", "" + nMainTime);
};
CGoUniverseGlobalSettings.prototype.GetKGSChallengeMainTime = function()
{
	return this.m_nKGSChallengeMainTime;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChallengeMainTime = function()
{
	this.m_nKGSChallengeMainTime = parseInt(this.private_GetValueForUser("KGSChallengeMainTime"));
	if (isNaN(this.m_nKGSChallengeMainTime)
		|| null === this.m_nKGSChallengeMainTime
		|| undefined === this.m_nKGSChallengeMainTime)
		this.m_nKGSChallengeMainTime = 600;
};
CGoUniverseGlobalSettings.prototype.SetKGSChallengeOverTime = function(nOverTime)
{
	this.m_nKGSChallengeOverTime = nOverTime;
	this.private_SetValueForUser("KGSChallengeOverTime", "" + nOverTime);
};
CGoUniverseGlobalSettings.prototype.GetKGSChallengeOverTime = function()
{
	return this.m_nKGSChallengeOverTime;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChallengeOverTime = function()
{
	this.m_nKGSChallengeOverTime = parseInt(this.private_GetValueForUser("KGSChallengeOverTime"));
	if (isNaN(this.m_nKGSChallengeOverTime)
		|| null === this.m_nKGSChallengeOverTime
		|| undefined === this.m_nKGSChallengeOverTime)
		this.m_nKGSChallengeOverTime = 30;
};
CGoUniverseGlobalSettings.prototype.SetKGSChallengeOverCount = function(nCount)
{
	this.m_nKGSChallengeOverCount = nCount;
	this.private_SetValueForUser("KGSChallengeOverCount", "" + nCount);
};
CGoUniverseGlobalSettings.prototype.GetKGSChallengeOverCount = function()
{
	return this.m_nKGSChallengeOverCount;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChallengeOverCount = function()
{
	this.m_nKGSChallengeOverCount = parseInt(this.private_GetValueForUser("KGSChallengeOverCount"));
	if (isNaN(this.m_nKGSChallengeOverCount)
		|| null === this.m_nKGSChallengeOverCount
		|| undefined === this.m_nKGSChallengeOverCount)
		this.m_nKGSChallengeOverCount = 5;
};
CGoUniverseGlobalSettings.prototype.SetKGSChallengeGameType = function(nGameType)
{
	this.m_nKGSChallengeGameType = nGameType;
	this.private_SetValueForUser("KGSChallengeGameType", "" + nGameType);
};
CGoUniverseGlobalSettings.prototype.GetKGSChallengeGameType = function()
{
	return this.m_nKGSChallengeGameType;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChallengeGameType = function()
{
	this.m_nKGSChallengeGameType = parseInt(this.private_GetValueForUser("KGSChallengeGameType"));
	if (isNaN(this.m_nKGSChallengeGameType)
		|| null === this.m_nKGSChallengeGameType
		|| undefined === this.m_nKGSChallengeGameType)
		this.m_nKGSChallengeGameType = EKGSGameType.Free;
};
CGoUniverseGlobalSettings.prototype.SetKGSChallengeComment = function(sComment)
{
	this.m_sKGSChallengeComment = sComment;
	this.private_SetValueForUser("KGSChallengeComment", "" + sComment);
};
CGoUniverseGlobalSettings.prototype.GetKGSChallengeComment = function()
{
	return this.m_sKGSChallengeComment;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChallengeComment = function()
{
	this.m_sKGSChallengeComment = this.private_GetValueForUser("KGSChallengeComment");
	if (null === this.m_sKGSChallengeComment
		|| undefined === this.m_sKGSChallengeComment)
		this.m_sKGSChallengeComment = "";
};
CGoUniverseGlobalSettings.prototype.SetKGSChallengeRoomId = function(nRoomId)
{
	this.m_nKGSChallengeRoomId = nRoomId;
	this.private_SetValueForUser("KGSChallengeRoomId", "" + nRoomId);
};
CGoUniverseGlobalSettings.prototype.GetKGSChallengeRoomId = function()
{
	return this.m_nKGSChallengeRoomId;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSChallengeRoomId = function()
{
	this.m_nKGSChallengeRoomId = parseInt(this.private_GetValueForUser("KGSChallengeRoomId"));
	if (isNaN(this.m_nKGSChallengeRoomId)
		|| null === this.m_nKGSChallengeRoomId
		|| undefined === this.m_nKGSChallengeRoomId)
		this.m_nKGSChallengeRoomId = -1;
};
CGoUniverseGlobalSettings.prototype.SetKGSSavePassword = function(bSave)
{
	this.m_bKGSSavePassword = bSave;
	this.private_SetValue("KGSSavePassword", bSave ? "1" : "0");
};
CGoUniverseGlobalSettings.prototype.GetKGSSavePassword = function()
{
	return this.m_bKGSSavePassword;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSSavePassword = function()
{
	var nValue = this.private_GetValue("KGSSavePassword");
	if (null === nValue
		|| undefined === nValue
		|| "0" === nValue)
		this.m_bKGSSavePassword = false;
	else
		this.m_bKGSSavePassword = true;
};
CGoUniverseGlobalSettings.prototype.SetKGSLogin = function(sLogin)
{
	this.m_sKGSLogin = sLogin;
	this.private_SetValue("KGSLogin", sLogin);
};
CGoUniverseGlobalSettings.prototype.GetKGSLogin = function()
{
	return this.m_sKGSLogin;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSLogin = function()
{
	var sValue = this.private_GetValue("KGSLogin");

	if (null === sValue
		|| undefined === sValue)
		sValue = "";

	this.m_sKGSLogin = sValue;
};
CGoUniverseGlobalSettings.prototype.SetKGSPassword = function(sPassword)
{
	var aPassword = [];
	for (var nIndex = 0, nCount = sPassword.length; nIndex < nCount; ++nIndex)
	{
		aPassword.push(sPassword.charCodeAt(nIndex));
	}
	var _sPassword = Common.Encode_Base64(aPassword);

	this.m_sKGSPassword = _sPassword;
	this.private_SetValue("KGSPassword", _sPassword);
};
CGoUniverseGlobalSettings.prototype.GetKGSPassword = function()
{
	var aPassword = Common.Decode_Base64(this.m_sKGSPassword);
	var sPassword = "";
	for(var nIndex = 0, nCount = aPassword.length; nIndex < nCount; ++nIndex)
	{
		sPassword += String.fromCharCode(aPassword[nIndex]);
	}

	return sPassword;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSPassword = function()
{
	if (true === this.GetKGSSavePassword())
	{
		var sValue = this.private_GetValue("KGSPassword");

		if (null === sValue
			|| undefined === sValue)
			sValue = "";

		this.m_sKGSPassword = sValue;
	}
	else
	{
		this.m_sKGSPassword = "";
	}
};
CGoUniverseGlobalSettings.prototype.SetKGSUserInfoRecentOnlyRanked = function(bOnlyRanked)
{
	this.m_bKGSUserInfoRecentOnlyRanked = bOnlyRanked;
	this.private_SetValue("KGSUserInfoRecentOnlyRanked", bOnlyRanked ? "1" : "0");
};
CGoUniverseGlobalSettings.prototype.GetKGSUserInfoRecentOnlyRanked = function()
{
	return this.m_bKGSUserInfoRecentOnlyRanked;
};
CGoUniverseGlobalSettings.prototype.private_ParseKGSUserInfoRecentOnlyRanked = function()
{
	var nValue = this.private_GetValue("KGSUserInfoRecentOnlyRanked");
	if (null === nValue
		|| undefined === nValue
		|| "0" === nValue)
		this.m_bKGSUserInfoRecentOnlyRanked = false;
	else
		this.m_bKGSUserInfoRecentOnlyRanked = true;
};