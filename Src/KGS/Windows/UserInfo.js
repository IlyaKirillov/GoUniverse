"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     03.06.2016
 * Time     22:54
 */

// TODO: Admin stuff. Implement forcedNoRank

function CKGSUserInfoWindow()
{
	CKGSUserInfoWindow.superclass.constructor.call(this);

	this.m_sUserName        = "";
	this.m_oUser            = null;
	this.m_oClient          = null;
	this.m_oContainerDiv    = null;
	this.m_oInfoScroll      = null;
	this.m_oGamesListView   = new CListView();
	this.m_oTabs            = new CVisualUserInfoTabs();
	this.m_oRankCanvas      = null;
	this.m_oRankCanvasEvent = null;
	this.m_oRankData        = [];
	this.m_arrPoints        = [];
	this.m_nStepX           = 0;

	this.m_oInfoTable = {
		UserName    : null,
		Rank        : null,
		LastOn      : null,
		Locale      : null,
		Name        : null,
		Games       : null,
		RecentGames : null,
		RegisteredOn: null,
		Email       : null
	};

	this.m_oRawInfo = {};

	this.m_oRankHint = null;

	this.m_arrGameArchive = [];

	this.m_bOwnInfo          = false;
	this.m_oFriendsListView  = null;
	this.m_oCensoredListView = null;
	this.m_oFollowedListView = null;

	this.m_oFriendsPageInfo  = null;
	this.m_oCensoredPageInfo = null;
	this.m_oFollowedPageInfo = null;
	this.m_oEditButton       = null;
	this.m_oSaveButton       = null;
	this.m_oCancelButton     = null;

	this.m_oMainInfoDiv     = null;
	this.m_oMainInfoControl = null;

	this.m_bEditing            = false;
	this.m_oExtensionEditDiv   = null;
	this.m_oInfoEditScroll     = null;
	this.m_oInfoEditNameInput  = null;
	this.m_oInfoEditEmailInput = null;
	this.m_oInfoRankWanted     = null;

	this.m_arrAllRecentGames          = [];
	this.m_arrRankedRecentGames       = [];
	this.m_bShowOnlyRankedRecentGames = true;
	this.m_sAllGamesStats             = "";
	this.m_sRankedGamesStats          = "";

	this.m_nCheckBoxHeight = 17;
}
CommonExtend(CKGSUserInfoWindow, CKGSWindowBase);

CKGSUserInfoWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSUserInfoWindow.superclass.Init.apply(this, arguments);

	if (oPr)
	{
		this.m_sUserName = oPr.UserName ? oPr.UserName : "";
		this.m_oClient   = oPr.Client;

		var sCurrentName = this.m_oClient ? this.m_oClient.GetUserName() : "";

		if (sCurrentName.toLowerCase() === this.m_sUserName.toLowerCase())
		{
			this.m_bOwnInfo          = true;
			this.m_oFriendsListView  = new CListView();
			this.m_oCensoredListView = new CListView();
			this.m_oFollowedListView = new CListView();

			this.m_oFriendsListView.EnableSelect();
			this.m_oCensoredListView.EnableSelect();
			this.m_oFollowedListView.EnableSelect();

			this.m_oFriendsPageInfo  = {
				AddButton    : null,
				RemoveButton : null,
				NameInput    : null,
				NotesInput   : null
			};
			this.m_oCensoredPageInfo = {
				AddButton    : null,
				RemoveButton : null,
				NameInput    : null,
				NotesInput   : null
			};
			this.m_oFollowedPageInfo = {
				AddButton    : null,
				RemoveButton : null,
				NameInput    : null,
				NotesInput   : null
			};
		}
		else
		{
			this.m_bOwnInfo = false;
		}

		this.m_bShowOnlyRankedRecentGames = this.m_oClient.m_oApp.GetGlobalSettings().GetKGSUserInfoRecentOnlyRanked();
	}

	this.Set_Caption(this.m_sUserName);

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	oMainDiv.style.fontSize = "16px";
	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";

	var sTabsId         = sDivId + "T";
	var sTabsBackId     = sDivId + "B";
	var sInfoWrapperId  = sDivId + "I";
	var sGamesWrapperId = sDivId + "G";
	var sRankWrapperId  = sDivId + "R";
	var sFriendsWrapperId  = sDivId + "F";
	var sCensoredWrapperId = sDivId + "C";
	var sFollowerWrapperId = sDivId + "W";


	var oInfoDivWrapper = this.protected_CreateDivElement(oMainDiv, sInfoWrapperId);
	var oInfoDifWrapperControl = CreateControlContainer(sInfoWrapperId);
	oInfoDifWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
	oInfoDifWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	oMainControl.AddControl(oInfoDifWrapperControl);
	oInfoDivWrapper.style.display = "none";

	var oGamesDivWrapper = this.protected_CreateDivElement(oMainDiv, sGamesWrapperId);
	var oGamesDifWrapperControl = CreateControlContainer(sGamesWrapperId);
	oGamesDifWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
	oGamesDifWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	oMainControl.AddControl(oGamesDifWrapperControl);
	oGamesDivWrapper.style.display = "none";

	var oRankDivWrapper = this.protected_CreateDivElement(oMainDiv, sRankWrapperId);
	var oRankDifWrapperControl = CreateControlContainer(sRankWrapperId);
	oRankDifWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
	oRankDifWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	oMainControl.AddControl(oRankDifWrapperControl);
	oRankDivWrapper.style.display = "none";


	this.private_CreateInfoPage(oInfoDivWrapper, oInfoDifWrapperControl);
	this.private_CreateGamesPage(oGamesDivWrapper, oGamesDifWrapperControl);
	this.private_CreateRankPage(oRankDivWrapper, oRankDifWrapperControl);

	var oTabsBack = this.protected_CreateDivElement(oMainDiv, sTabsBackId);
	oTabsBack.style.borderBottom = "1px solid #BEBEBE";
	var oTabsBackControl = CreateControlContainer(sTabsBackId);
	oTabsBackControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, 24);
	oTabsBackControl.Anchor = (g_anchor_top |g_anchor_left | g_anchor_right);
	oMainControl.AddControl(oTabsBackControl);

	this.protected_CreateDivElement(oMainDiv, sTabsId);
	var oTabsControl = this.m_oTabs.Init(sTabsId);
	oTabsControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, 25);
	oTabsControl.Anchor = (g_anchor_top |g_anchor_left | g_anchor_right);
	oMainControl.AddControl(oTabsControl);

	var oTab;
	oTab = new CVisualUserInfoTab(this);
	oTab.Init(0, oInfoDivWrapper, g_oLocalization.KGS.window.userInfo.tabInfo);
	this.m_oTabs.AddTab(oTab);
	oTab.OnClick();

	oTab = new CVisualUserInfoTab(this);
	oTab.Init(1, oGamesDivWrapper, g_oLocalization.KGS.window.userInfo.tabGames);
	this.m_oTabs.AddTab(oTab);

	oTab = new CVisualUserInfoTab(this);
	oTab.Init(2, oRankDivWrapper, g_oLocalization.KGS.window.userInfo.tabRank);
	this.m_oTabs.AddTab(oTab);

	if (this.m_bOwnInfo)
	{
		var oFriendsDivWrapper = this.protected_CreateDivElement(oMainDiv, sFriendsWrapperId);
		var oFriendsDivWrapperControl = CreateControlContainer(sFriendsWrapperId);
		oFriendsDivWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
		oFriendsDivWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
		oMainControl.AddControl(oFriendsDivWrapperControl);
		oFriendsDivWrapper.style.display = "none";

		var oCensoredDivWrapper = this.protected_CreateDivElement(oMainDiv, sCensoredWrapperId);
		var oCensoredDivWrapperControl = CreateControlContainer(sCensoredWrapperId);
		oCensoredDivWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
		oCensoredDivWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
		oMainControl.AddControl(oCensoredDivWrapperControl);
		oCensoredDivWrapper.style.display = "none";

		var oFollowerDivWrapper = this.protected_CreateDivElement(oMainDiv, sFollowerWrapperId);
		var oFollowerDivWrapperControl = CreateControlContainer(sFollowerWrapperId);
		oFollowerDivWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
		oFollowerDivWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
		oMainControl.AddControl(oFollowerDivWrapperControl);
		oFollowerDivWrapper.style.display = "none";

		this.private_CreateFriendsPage(oFriendsDivWrapper, oFriendsDivWrapperControl);
		this.private_CreateCensoredPage(oCensoredDivWrapper, oCensoredDivWrapperControl);
		this.private_CreateFollowerPage(oFollowerDivWrapper, oFollowerDivWrapperControl);

		oTab = new CVisualUserInfoTab(this);
		oTab.Init(3, oFriendsDivWrapper, g_oLocalization.KGS.window.userInfo.tabFriends);
		this.m_oTabs.AddTab(oTab);

		oTab = new CVisualUserInfoTab(this);
		oTab.Init(4, oCensoredDivWrapper, g_oLocalization.KGS.window.userInfo.tabCensored);
		this.m_oTabs.AddTab(oTab);

		oTab = new CVisualUserInfoTab(this);
		oTab.Init(5, oFollowerDivWrapper, g_oLocalization.KGS.window.userInfo.tabFuns);
		this.m_oTabs.AddTab(oTab);

		this.UpdateFriendsLists();
	}

	this.m_oGamesListView.Set_BGColor(243, 243, 243);
};
CKGSUserInfoWindow.prototype.Get_DefaultWindowSize = function(bForce)
{
	return {W : 800, H : 600};
};
CKGSUserInfoWindow.prototype.Close = function()
{
	CKGSUserInfoWindow.superclass.Close.call(this);
	if (this.m_oClient)
		this.m_oClient.CloseUserInfo(this.m_sUserName);

	if (this.m_oRankHint)
		this.private_HideRankHint();
};
CKGSUserInfoWindow.prototype.Hide = function()
{
	CKGSUserInfoWindow.superclass.Close.call(this);
};
CKGSUserInfoWindow.prototype.Update_Size = function(bForce)
{
	CKGSUserInfoWindow.superclass.Update_Size.call(this, bForce);

	if (this.m_oInfoScroll && 0 === this.m_oTabs.GetCurrentId())
		this.m_oInfoScroll.CheckVisibility();

	if (this.m_oInfoEditScroll && this.m_oExtensionDiv && 0 === this.m_oTabs.GetCurrentId() && true === this.m_bEditing)
		this.m_oInfoEditScroll.CheckVisibility();

	if (this.m_oGamesListView && 1 === this.m_oTabs.GetCurrentId())
		this.m_oGamesListView.Update_Size();

	if (this.m_oRankCanvas && 2 === this.m_oTabs.GetCurrentId())
		this.private_DrawRank();

	if (this.m_oFriendsListView && 3 === this.m_oTabs.GetCurrentId())
		this.m_oFriendsListView.Update_Size();

	if (this.m_oCensoredListView && 4 === this.m_oTabs.GetCurrentId())
		this.m_oCensoredListView.Update_Size();

	if (this.m_oFollowedListView && 5 === this.m_oTabs.GetCurrentId())
		this.m_oFollowedListView.Update_Size();
};
CKGSUserInfoWindow.prototype.OnUserUpdate = function()
{
	if (true === this.m_bEditing || !this.m_oUser || !this.m_oInfoTable.Rank)
		return;

	if (true === this.m_oRawInfo.ForcedNoRank)
	{
		Common.Set_InnerTextToElement(this.m_oInfoTable.Rank, "-");
		this.m_oRawInfo.RankWanted = false;
	}
	else
	{
		Common.Set_InnerTextToElement(this.m_oInfoTable.Rank, this.m_oUser.GetStringRank());
		this.m_oRawInfo.RankWanted = (this.m_oUser && !this.m_oUser.IsRankHided());
	}
};
CKGSUserInfoWindow.prototype.OnUserDetails = function(oDetails)
{
	if (oDetails)
	{
		var oUser = this.m_oClient.private_HandleUserRecord(oDetails.user, true);
		this.m_sUserName = oUser.GetName();
		this.m_oUser     = oUser;
		this.private_SetCaption(this.m_sUserName, oUser.IsOnline());

		if (oUser.HasAvatar())
			this.OnUserAvatar();

		Common.Set_InnerTextToElement(this.m_oInfoTable.UserName, oUser.GetName());
		Common.Set_InnerTextToElement(this.m_oInfoTable.Rank, oUser.GetStringRank());

		if (oUser.IsOnline())
		{
			Common.Set_InnerTextToElement(this.m_oInfoTable.LastOn, g_oLocalization.common.connectionStatus.online);
		}
		else
		{
			var oTimeStamp = new CTimeStamp(oDetails.lastOn);
			Common.Set_InnerTextToElement(this.m_oInfoTable.LastOn, oTimeStamp.GetDifferenceString() + " (" + oTimeStamp.ToLocaleString() + ")");
		}

		if (this.m_oInfoCheckboxPrivate && this.m_bOwnInfo)
			this.m_oInfoCheckboxPrivate.checked = oDetails.privateEmail ? true : false;

		if (this.m_oInfoCheckboxKGSEmail && this.m_bOwnInfo)
			this.m_oInfoCheckboxKGSEmail.checked = oDetails.emailWanted ? true : false;

		if (this.m_oInfoRankWanted && this.m_bOwnInfo && oUser)
			this.m_oInfoRankWanted.checked = !oUser.IsRankHided() && true !== oDetails.forcedNoRank;

		this.OnDetailsUpdate(oDetails);
	}
};
CKGSUserInfoWindow.prototype.OnUserAvatar = function()
{
	this.m_oAvatarDiv.style.display = "block";
	this.m_oMainInfoControl.SetParams(5, 5, 155, 0, true, true, true, false, -1, this.m_nInfoHeight);

	var oImg = document.createElement("img");
	oImg.style.float  = "right";
	oImg.style.width  = "141px";
	oImg.style.height = "200px";
	oImg.src          = "http://files.gokgs.com/avatars/" + this.m_sUserName + ".jpg";
	this.m_oAvatarDiv.appendChild(oImg);
};
CKGSUserInfoWindow.prototype.OnUserGameArchive = function(oMessage)
{
	var arrGames = oMessage.games;
	if (!arrGames)
		return;

	for (var nIndex = arrGames.length - 1; nIndex >= 0; --nIndex)
	{
		var oGame          = arrGames[nIndex];
		var oArchiveRecord = new CKGSUserInfoGameArchiveRecord(this.m_oClient, oGame);
		this.m_arrGameArchive.push(oArchiveRecord);
	}

	this.private_UpdateGameArchiveStats();
	this.private_UpdateGameArchiveListView();
};
CKGSUserInfoWindow.prototype.OnRankGraph = function(arrRankData)
{
	while (arrRankData.length > 0 && 0x7fff === arrRankData[0])
		arrRankData.splice(0, 1);

	for (var nPointIndex = 0, nPointsCount = arrRankData.length; nPointIndex < nPointsCount; ++nPointIndex)
	{
		if (0x7fff === arrRankData[nPointIndex] && nPointIndex > 0)
			arrRankData[nPointIndex] = arrRankData[nPointIndex - 1];
	}

	this.m_oRankData = arrRankData;
	this.m_arrPoints = [];
	this.private_DrawRank();
};
CKGSUserInfoWindow.prototype.OnUserGameArchiveUpdate = function(oMessage)
{
	var arrGames = oMessage.games;
	if (!arrGames)
		return;

	for (var nIndex = 0, nCount = arrGames.length; nIndex < nCount; ++nIndex)
	{
		var oGame = arrGames[nIndex];
		var oArchiveRecord = new CKGSUserInfoGameArchiveRecord(this.m_oClient, oGame);

		var bExist = false;
		var sTimeStamp = oArchiveRecord.GetTimeStamp();
		for (var nArchiveIndex = 0, nArchiveLen = this.m_arrGameArchive.length; nArchiveIndex < nArchiveLen; ++nArchiveIndex)
		{
			var oArchiveRecord2 = this.m_arrGameArchive[nArchiveIndex];
			if (sTimeStamp === oArchiveRecord2.GetTimeStamp())
			{
				this.m_arrGameArchive.splice(nArchiveIndex, 1, oArchiveRecord);
				bExist = true;
				break;
			}
		}

		if (!bExist)
			this.m_arrGameArchive.splice(0, 0, oArchiveRecord);
	}

	this.private_UpdateGameArchiveStats();
	this.private_UpdateGameArchiveListView();
};
CKGSUserInfoWindow.prototype.OnUserArchiveGameRemove = function(oMessage)
{
	var sTimeStamp = oMessage.timestamp;
	for (var nIndex = 0, nCount = this.m_arrGameArchive.length; nIndex < nCount; ++nIndex)
	{
		var oArchiveRecord = this.m_arrGameArchive[nIndex];
		if (sTimeStamp === oArchiveRecord.GetTimeStamp())
		{
			this.m_arrGameArchive.splice(nIndex, 1);
			break;
		}
	}

	this.private_UpdateGameArchiveStats();
	this.private_UpdateGameArchiveListView();
};
CKGSUserInfoWindow.prototype.OnDetailsUpdate = function(oMessage)
{
	Common.Set_InnerTextToElement(this.m_oInfoTable.Locale, GetLanguage(oMessage.locale));
	Common.Set_InnerTextToElement(this.m_oInfoTable.Name, oMessage.personalName);

	var oRegisterTimeStamp = new CTimeStamp(oMessage.regStartDate);
	this.m_oInfoTable.RegisteredOn.textContent = oRegisterTimeStamp.ToLocaleDate();

	this.private_AddEmail(oMessage.email);

	if (true)//oMessage.personalInfo !== this.m_oRawInfo.PersonalInfo)
	{
		this.private_AddInfo(oMessage.personalInfo);
		this.m_oRawInfo.PersonalInfo = oMessage.personalInfo;
	}

	this.m_oRawInfo.ChannelId    = oMessage.channelId;
	this.m_oRawInfo.PersonalName = oMessage.personalName;
	this.m_oRawInfo.Email        = oMessage.email;
	this.m_oRawInfo.PrivateEmail = oMessage.privateEmail ? true : false;
	this.m_oRawInfo.EmailWanted  = oMessage.emailWanted ? true : false;
	this.m_oRawInfo.AuthLevel    = oMessage.authLevel ? oMessage.authLevel : "normal";
	this.m_oRawInfo.ForcedNoRank = oMessage.forcedNoRank;
	this.m_oRawInfo.RankWanted   = (this.m_oUser && !this.m_oUser.IsRankHided() && true !== oMessage.forcedNoRank);

	if (this.m_oInfoScroll && 0 === this.m_oTabs.GetCurrentId())
		this.m_oInfoScroll.CheckVisibility();

	if (this.m_oInfoEditScroll && this.m_oExtensionDiv && 0 === this.m_oTabs.GetCurrentId() && true === this.m_bEditing)
		this.m_oInfoEditScroll.CheckVisibility();
};
CKGSUserInfoWindow.prototype.EditUserInfo = function()
{
	var oMessage = {
		"type"          : "DETAILS_CHANGE",
		"channelId"     : this.m_oRawInfo.ChannelId,
		"personalName"  : this.m_oRawInfo.PersonalName,
		"personalInfo"  : this.m_oRawInfo.PersonalInfo,
		"personalEmail" : this.m_oRawInfo.Email,
		"privateEmail"  : this.m_oRawInfo.PrivateEmail,
		"emailWanted"   : this.m_oRawInfo.EmailWanted,
		"authLevel"     : this.m_oRawInfo.AuthLevel,
		"rankWanted"    : this.m_oRawInfo.RankWanted,
		"forcedNoRank"  : false
	};
	this.m_oClient.private_SendMessage(oMessage);
};
CKGSUserInfoWindow.prototype.private_UpdateGameArchiveStats = function()
{
	var nWins = 0, nLoses = 0, nUnfinished = 0;
	var nWinsR = 0, nLosesR = 0, nUnfinishedR = 0;

	var nAllRecentGamesCount    = 20;
	var nRankedRecentGamesCount = 20;

	var sUserName = this.m_sUserName.toLocaleLowerCase();

	var arrAllRecent    = [];
	var arrRankedRecent = [];

	var oThis = this;
	function privateCreateRecentLink(sUrl, sLabel, sText)
	{
		var oSpan = document.createElement("span");
		oSpan.className = "recentGamesSpan";
		oSpan.title     = sLabel;
		Common.Set_InnerTextToElement(oSpan, sText);
		oSpan.onclick = function()
		{
			privateLoadSgfByUrl(sUrl, privateViewGame, oThis.m_oClient, oThis.m_oClient ? oThis.m_oClient.m_oApp : null);
		};
		return oSpan;
	}

	var sWin = "O", sLose = "\u2715";

	for (var nIndex = 0, nCount = this.m_arrGameArchive.length; nIndex < nCount; ++nIndex)
	{
		var oArchiveRecord = this.m_arrGameArchive[nIndex];

		var nType = oArchiveRecord.GetType();
		if (EKGSGameType.Ranked === nType || EKGSGameType.Free === nType)
		{
			var sBlack    = oArchiveRecord.GetBlackName().toLowerCase();
			var sWhite    = oArchiveRecord.GetWhiteName().toLowerCase();
			var bBlackWon = oArchiveRecord.IsBlackWon();
			var sGameUrl  = oArchiveRecord.GetUrl();
			var sLabel    = oArchiveRecord.GetLabel();

			if (null === bBlackWon)
			{
				nUnfinished++;

				if (EKGSGameType.Ranked === nType)
					nUnfinishedR++;
			}
			else if ((true === bBlackWon && sBlack === sUserName)
				|| (true !== bBlackWon && sWhite === sUserName))
			{
				nWins++;

				if (nAllRecentGamesCount > 0)
				{
					arrAllRecent.push(privateCreateRecentLink(sGameUrl, sLabel, sWin));
					nAllRecentGamesCount--;
				}

				if (nRankedRecentGamesCount > 0 && EKGSGameType.Ranked === nType)
				{
					arrRankedRecent.push(privateCreateRecentLink(sGameUrl, sLabel, sWin));
					nRankedRecentGamesCount--;
				}

				if (EKGSGameType.Ranked === nType)
					nWinsR++;
			}
			else
			{
				nLoses++;
				if (nAllRecentGamesCount > 0)
				{
					arrAllRecent.push(privateCreateRecentLink(sGameUrl, sLabel, sLose));
					nAllRecentGamesCount--;
				}


				if (nRankedRecentGamesCount > 0 && EKGSGameType.Ranked === nType)
				{
					arrRankedRecent.push(privateCreateRecentLink(sGameUrl, sLabel, sLose));
					nRankedRecentGamesCount--;
				}

				if (EKGSGameType.Ranked === nType)
					nLosesR++;
			}
		}
	}

	this.m_arrAllRecentGames    = arrAllRecent;
	this.m_arrRankedRecentGames = arrRankedRecent;

	this.m_sAllGamesStats = "" + nWins + "-" + nLoses + "-" + nUnfinished;
	this.m_sRankedGamesStats = "" + nWinsR + "-" + nLosesR + "-" + nUnfinishedR;
	this.private_FillGamesStats();
};
CKGSUserInfoWindow.prototype.private_UpdateGameArchiveListView = function()
{
	this.m_oGamesListView.Clear();
	for (var nIndex = 0, nCount = this.m_arrGameArchive.length; nIndex < nCount; ++nIndex)
	{
		var oArchiveRecord = this.m_arrGameArchive[nIndex];
		this.m_oGamesListView.Handle_Record([0, oArchiveRecord.GetTimeStamp(), oArchiveRecord]);
	}
	this.m_oGamesListView.Update_Size();
};
CKGSUserInfoWindow.prototype.private_DrawRank = function()
{
	var arrRankData = this.m_oRankData;
	if (!this.m_oRankCanvas || !arrRankData || arrRankData.length <= 0 || "-" === this.m_oInfoTable.Rank.textContent)
		return this.private_DrawNoRank();

	var nMin = null, nMax = null;
	var nPointsCount = arrRankData.length;
	for (var nPointIndex = 0; nPointIndex < nPointsCount; ++nPointIndex)
	{
		if (null === nMin || nMin > arrRankData[nPointIndex])
			nMin = arrRankData[nPointIndex];

		if (null === nMax || nMax < arrRankData[nPointIndex])
			nMax = arrRankData[nPointIndex];
	}

	if (nPointsCount < 2 || null === nMin || null === nMax)
		return this.private_DrawNoRank();

	nMax = Math.ceil(nMax / 100) * 100;
	nMin = Math.floor(nMin / 100) * 100;

	if (nMax === nMin)
		nMin -= 100;

	var nRank0 = (nMin / 100) | 0;
	var nRank1 = (nMax / 100) | 0;

	nMin -= 10;
	nMax += 10;

	var oContext = this.m_oRankCanvas.getContext("2d");

	var nW = this.m_oRankCanvas.width;
	var nH = this.m_oRankCanvas.height;

	oContext.clearRect(0, 0, nW, nH);

	var nGraphH = nH - 30;

	var nStepX = nW / (nPointsCount - 1);
	var dKoefY = nGraphH / (nMax - nMin);

	oContext.strokeStyle = "rgba(128,128,128,1)";
	oContext.lineWidth   = 1;
	for (var nRankCounter = nRank0; nRankCounter <= nRank1; ++nRankCounter)
	{
		var dY = ((nGraphH - (nRankCounter * 100 - nMin) * dKoefY) | 0) + 0.5;
		oContext.beginPath();
		oContext.moveTo(0, dY);
		oContext.lineTo(nW, dY);
		oContext.stroke();
	}


	var nX = 0;
	var nY = 0;

	oContext.strokeStyle = "rgba(0,255,0,1)";
	oContext.beginPath();

	var arrPoints = [];
	for (var nPointIndex = 0; nPointIndex < nPointsCount; ++nPointIndex)
	{
		nY = (nGraphH - (arrRankData[nPointIndex] - nMin) * dKoefY);
		arrPoints.push({x : nX, y : nY, rank : arrRankData[nPointIndex]});
		nX += nStepX;
	}

	var arrSpline = GetSpline(arrPoints);
	oContext.lineWidth = 1;
	oContext.strokeStyle = "rgba(0,255, 0,1)";
	oContext.beginPath();

	for (var nSegmentIndex = 0, nSegmentsCount = arrSpline.length; nSegmentIndex < nSegmentsCount; ++nSegmentIndex)
	{
		var oSegment = arrSpline[nSegmentIndex];

		if (0 == nSegmentIndex)
			oContext.moveTo(oSegment.points[0].x, oSegment.points[0].y);

		oContext.bezierCurveTo(
			oSegment.points[1].x, oSegment.points[1].y,
			oSegment.points[2].x, oSegment.points[2].y,
			oSegment.points[3].x, oSegment.points[3].y);
	}
	oContext.stroke();

	oContext.font        = "14px Arial";
	oContext.fillStyle   = "rgba(255, 255, 255, 1)";
	oContext.strokeStyle = "rgba(128,128,128,1)";
	oContext.lineWidth   = 1;

	for (var nRankCounter = nRank0; nRankCounter <= nRank1; ++nRankCounter)
	{
		var sText = "";
		if (nRankCounter >= 0)
			sText = (nRankCounter + 1) + "d";
		else
			sText = (-nRankCounter) + "k";

		var dY = nGraphH - (nRankCounter * 100 - nMin) * dKoefY;

		if (dY - 5 - 14 >= 0)
		{
			oContext.fillText(sText, 5, dY - 5);
		}
	}

	oContext.font = "14px Arial";
	oContext.fillStyle = "rgba(255, 255, 255, 1)";
	var oCurDate  = new Date();
	var nCurTime  = oCurDate.getTime();
	var nCurMonth = oCurDate.getUTCMonth() + 1;
	for (var nPointIndex = nPointsCount - 1; nPointIndex >= 0; --nPointIndex)
	{
		var nTime  = nCurTime - 86400000 * (nPointsCount - 1 - nPointIndex); // 1000 * 60 * 60 * 24
		var oDate  = new Date(nTime);
		var nMonth = oDate.getUTCMonth() + 1;

		arrPoints[nPointIndex].time = nTime;

		if (nMonth !== nCurMonth)
		{
			var dX = nPointIndex * nStepX + nStepX;

			oContext.beginPath();
			oContext.moveTo(dX, nH - 20);
			oContext.lineTo(dX, nH);
			oContext.stroke();

			var sText = "";
			switch (nCurMonth)
			{
				case 1: sText = g_oLocalization.common.months.Jan; break;
				case 2: sText = g_oLocalization.common.months.Feb; break;
				case 3: sText = g_oLocalization.common.months.Mar; break;
				case 4: sText = g_oLocalization.common.months.Apr; break;
				case 5: sText = g_oLocalization.common.months.May; break;
				case 6: sText = g_oLocalization.common.months.Jun; break;
				case 7: sText = g_oLocalization.common.months.Jul; break;
				case 8: sText = g_oLocalization.common.months.Aug; break;
				case 9: sText = g_oLocalization.common.months.Sep; break;
				case 10: sText = g_oLocalization.common.months.Oct; break;
				case 11: sText = g_oLocalization.common.months.Nov; break;
				case 12: sText = g_oLocalization.common.months.Dec; break;
			}

			oContext.fillText(sText, dX + 5, nH - 5);
			nCurMonth = nMonth;
		}
	}

	this.m_arrSpline = arrSpline;
	this.m_arrPoints = arrPoints;
	this.m_nStepX    = nStepX;
};
CKGSUserInfoWindow.prototype.private_DrawNoRank = function()
{
	if (!this.m_oRankCanvas)
		return;

	var sText = g_oLocalization.KGS.window.userInfo.rankGraphReplacementText;
	var sFont = "20px 'Times New Roman', Helvetica";

	var oContext = this.m_oRankCanvas.getContext("2d");
	var nW = this.m_oRankCanvas.width;
	var nH = this.m_oRankCanvas.height;
	oContext.clearRect(0, 0, nW, nH);

	oContext.font = sFont;
	oContext.fillStyle = "rgba(255, 255, 255, 1)";

	g_oTextMeasurer.SetFont(sFont);
	var nTextWidth = g_oTextMeasurer.Measure(sText);
	oContext.fillText(sText, (nW - nTextWidth) / 2, (nH - 20) / 2);
};
CKGSUserInfoWindow.prototype.private_FillGamesStats = function()
{
	var arrRecent = this.m_bShowOnlyRankedRecentGames ? this.m_arrRankedRecentGames : this.m_arrAllRecentGames;
	var sStats    = this.m_bShowOnlyRankedRecentGames ? this.m_sRankedGamesStats : this.m_sAllGamesStats;

	var oDiv = this.m_oInfoTable.RecentGames;
	Common.ClearNode(oDiv);
	for (var nIndex = 0, nCount = arrRecent.length; nIndex < nCount; ++nIndex)
	{
		oDiv.appendChild(arrRecent[nIndex]);
	}

	Common.Set_InnerTextToElement(this.m_oInfoTable.Games, sStats);
};
CKGSUserInfoWindow.prototype.Show = function(oPr)
{
	CKGSUserInfoWindow.superclass.Show.call(this, oPr);

	if (this.m_oInfoScroll)
		this.m_oInfoScroll.CheckVisibility();

	if (this.m_oInfoEditScroll && this.m_oExtensionDiv && 0 === this.m_oTabs.GetCurrentId() && "block" === this.m_oExtensionDiv.style.display)
		this.m_oInfoEditScroll.CheckVisibility();

	this.Update_Size(true);
};
CKGSUserInfoWindow.prototype.private_AddMainInfo = function()
{
	var oThis = this;

	var oDiv     = this.m_oMainInfoDiv;
	var oControl = this.m_oMainInfoControl;

	var nLeftWidth = 50;

	var arrLabels = [];
	var sUserName = arrLabels[0] = g_oLocalization.KGS.window.userInfo.fieldUserName;
	var sName     = arrLabels[1] = g_oLocalization.KGS.window.userInfo.fieldRealName;
	var sRank     = arrLabels[2] = g_oLocalization.KGS.window.userInfo.fieldRank;
	var sLastOn   = arrLabels[3] = g_oLocalization.KGS.window.userInfo.fieldLastOn;
	var sRegister = arrLabels[4] = g_oLocalization.KGS.window.userInfo.fieldRegisteredOn;
	var sLocale   = arrLabels[5] = g_oLocalization.KGS.window.userInfo.fieldLocale;
	var sEmail    = arrLabels[6] = g_oLocalization.KGS.window.userInfo.fieldEmail;
	var sGames    = arrLabels[7] = g_oLocalization.KGS.window.userInfo.fieldGames;
	var sRecent   = arrLabels[8] = g_oLocalization.KGS.window.userInfo.fieldRecentGames;

	var sPrivateEmail         = g_oLocalization.KGS.window.userInfo.flagPrivateEmail;
	var sReceiveAnnouncements = g_oLocalization.KGS.window.userInfo.flagReceiveAnnouncements;
	var sOnlyRanked           = g_oLocalization.KGS.window.userInfo.flagOnlyRanked;

	g_oTextMeasurer.SetFont("italic bold 16px 'Segoe UI', Tahoma, sans-serif");
	for (var nIndex = 0, nCount = arrLabels.length; nIndex < nCount; ++nIndex)
	{
		var nLabelW = g_oTextMeasurer.Measure(arrLabels[nIndex]);
		if (nLeftWidth <= nLabelW)
			nLeftWidth = nLabelW;
	}

	var nTop = 0;

	var oUserName     = this.private_AddInfoField(oDiv, oControl, nTop, nLeftWidth, sUserName, "", false); nTop += oUserName.Height;
	var oName         = this.private_AddInfoField(oDiv, oControl, nTop, nLeftWidth, sName, "", true); nTop += oName.Height;
	var oRank         = this.private_AddInfoField(oDiv, oControl, nTop, nLeftWidth, sRank, "", false); nTop += oRank.Height;

	var oRankWanted = null;
	if (this.m_bOwnInfo)
	{
		oRankWanted = this.private_AddInfoCheckboxFields(oDiv, oControl, nTop - (oRank.Height + this.m_nCheckBoxHeight) / 2, nLeftWidth, "", false);

		oRankWanted.CheckBox.onclick = function()
		{
			if (true === oRankWanted.CheckBox.checked && oThis.m_oUser)
				Common.Set_InnerTextToElement(oRank.Div, oThis.m_oUser.GetStringRank());
			else
				Common.Set_InnerTextToElement(oRank.Div, "-");
		};
	}

	var oLastOn       = this.private_AddInfoField(oDiv, oControl, nTop, nLeftWidth, sLastOn, "", false); nTop += oLastOn.Height;
	var oRegisteredOn = this.private_AddInfoField(oDiv, oControl, nTop, nLeftWidth, sRegister, "", false); nTop += oRegisteredOn.Height;
	var oLocale       = this.private_AddInfoField(oDiv, oControl, nTop, nLeftWidth, sLocale, "", false); nTop += oLocale.Height;
	var oEmail        = this.private_AddInfoField(oDiv, oControl, nTop, nLeftWidth, sEmail, "Private", true); nTop += oEmail.Height;

	var oPrivateEmail = null, oKGSEmail = null;
	if (this.m_bOwnInfo)
	{
		oPrivateEmail = this.private_AddInfoCheckboxFields(oDiv, oControl, nTop, nLeftWidth, sPrivateEmail, false);	nTop += oPrivateEmail.Height;
		oKGSEmail     = this.private_AddInfoCheckboxFields(oDiv, oControl, nTop, nLeftWidth, sReceiveAnnouncements, false);	nTop += oKGSEmail.Height;
	}
	var oGames        = this.private_AddInfoField(oDiv, oControl, nTop, nLeftWidth, sGames, "", false); nTop += oGames.Height;
	var oRecentGames  = this.private_AddInfoField(oDiv, oControl, nTop, nLeftWidth, sRecent, "", false); nTop += oRecentGames.Height;
	var oOnlyRanked   = this.private_AddInfoCheckboxFields(oDiv, oControl, nTop, nLeftWidth, sOnlyRanked, false); nTop += oOnlyRanked.Height;


	this.m_oInfoTable.UserName     = oUserName.Div;
	this.m_oInfoTable.Name         = oName.Div;
	this.m_oInfoTable.Rank         = oRank.Div;
	this.m_oInfoTable.LastOn       = oLastOn.Div;
	this.m_oInfoTable.RegisteredOn = oRegisteredOn.Div;
	this.m_oInfoTable.Locale       = oLocale.Div;
	this.m_oInfoTable.Email        = oEmail.Div;
	this.m_oInfoTable.Games        = oGames.Div;
	this.m_oInfoTable.RecentGames  = oRecentGames.Div;

	function privateChangeOnlyRanked()
	{
		var isChecked = oOnlyRanked.CheckBox.checked;
		oThis.m_bShowOnlyRankedRecentGames = isChecked ? true : false;
		oThis.private_FillGamesStats();

		if (oThis.m_oClient)
			oThis.m_oClient.m_oApp.GetGlobalSettings().SetKGSUserInfoRecentOnlyRanked(oThis.m_bShowOnlyRankedRecentGames);
	}

	oOnlyRanked.CheckBox.checked  = this.m_bShowOnlyRankedRecentGames;
	oOnlyRanked.CheckBox.disabled = "";
	oOnlyRanked.CheckBox.onclick  = privateChangeOnlyRanked;
	oOnlyRanked.Label.onclick     = function()
	{
		oOnlyRanked.CheckBox.checked = !oOnlyRanked.CheckBox.checked;
		privateChangeOnlyRanked();
	};

	if (this.m_bOwnInfo)
	{
		this.m_oInfoEditNameInput    = oName.Input;
		this.m_oInfoEditEmailInput   = oEmail.Input;
		this.m_oInfoCheckboxPrivate  = oPrivateEmail.CheckBox;
		this.m_oInfoCheckboxKGSEmail = oKGSEmail.CheckBox;
		this.m_oInfoRankWanted       = oRankWanted.CheckBox;

		this.m_oInfoEditNameInput.maxLength  = "50";
		this.m_oInfoEditEmailInput.maxLength = "70";
	}
};
CKGSUserInfoWindow.prototype.private_AddInfoField = function(oParent, oParentControl, nTop, nLeftWidth, sField, sText, bAddInput)
{
	var nHeight = 23;

	var oLabel              = document.createElement("div");
	oLabel.style.position   = "absolute";
	oLabel.style.top        = nTop + "px";
	oLabel.style.left       = "5px";
	oLabel.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
	oLabel.style.fontSize   = "16px";
	oLabel.style.height     = nHeight + "px";
	oLabel.style.lineHeight = nHeight + "px";

	var oTextSpan              = document.createElement("span");
	oTextSpan.style.fontWeight = "bold";
	oTextSpan.style.fontStyle  = "italic";
	oTextSpan.textContent      = sField + ": ";
	oLabel.appendChild(oTextSpan);

	oParent.appendChild(oLabel);

	var oDiv = document.createElement("div");
	oDiv.className += " Selectable";
	oParent.appendChild(oDiv);

	oDiv.style.position    = "absolute";
	oDiv.style.display     = "block";
	oDiv.style.top         = nTop + "px";
	oDiv.style.left        = (nLeftWidth + 10) + "px";
	oDiv.style.border      = "1px solid transparent";
	oDiv.style.paddingLeft = "3px";
	oDiv.style.height      = (nHeight - 2) + "px";
	oDiv.style.lineHeight  = (nHeight - 2) + "px";
	Common.Set_InnerTextToElement(oDiv, sText);

	var oInput = null;
	if (bAddInput && this.m_bOwnInfo)
	{
		oInput                  = document.createElement("input");
		oInput.className        = "userInfoInput userInfoInputEditable";
		oInput.value            = sText;
		oInput.style.position   = "absolute";
		oInput.style.display    = "none";
		oInput.style.top        = nTop + "px";
		oInput.style.left       = (nLeftWidth + 10) + "px";
		oInput.style.right      = "0px";
		oInput.style.height     = nHeight + "px";
		oInput.style.lineHeight = nHeight + "px";
		oParent.appendChild(oInput);

		var oControl = CreateControlContainerByElement(oInput);
		oControl.Bounds.SetParams((nLeftWidth + 10), nTop, 0, 0, true, true, true, false, -1, nHeight);
		oControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
		oParentControl.AddControl(oControl);
	}

	return {Div : oDiv, Input : oInput, Height : nHeight};
};
CKGSUserInfoWindow.prototype.private_AddInfoCheckboxFields = function(oParent, oParentControl, nTop, nLeftWidth, sLabel, isChecked)
{
	var nHeight = this.m_nCheckBoxHeight;

	var oWrapper              = document.createElement("div");
	oWrapper.style.position   = "absolute";
	oWrapper.style.top        = nTop + "px";
	oWrapper.style.left       = (nLeftWidth - 2) + "px";
	oWrapper.style.border     = "1px solid transparent";
	oWrapper.style.height     = nHeight + "px";
	oParent.appendChild(oWrapper);

	var oCheckBox     = document.createElement("input");
	oCheckBox.style.position = "relative";
	oCheckBox.style.top      = Math.ceil((nHeight - 12) / 2) + "px";
	oCheckBox.style.width    = "12px";
	oCheckBox.style.height   = "12px";
	oCheckBox.type           = "checkbox";
	oCheckBox.checked        = isChecked;
	oCheckBox.disabled       = "disabled";
	oWrapper.appendChild(oCheckBox);

	var oLabel               = document.createElement("div");
	oLabel.style.position    = "absolute";
	oLabel.style.top         = nTop + "px";
	oLabel.style.left        = (nLeftWidth + 10) + "px";
	oLabel.style.border      = "1px solid transparent";
	oLabel.style.paddingLeft = "3px";
	oLabel.style.fontFamily  = "'Segoe UI', Tahoma, sans-serif";
	oLabel.style.fontSize    = "13px";
	oLabel.style.height      = nHeight + "px";
	oLabel.style.lineHeight  = nHeight + "px";
	oLabel.textContent       = sLabel;
	oParent.appendChild(oLabel);

	return {CheckBox : oCheckBox, Height : nHeight, Label : oLabel};
};
CKGSUserInfoWindow.prototype.private_AddEmail = function(sEmail)
{
	var oSpan = this.m_oInfoTable.Email;

	while (oSpan.firstChild)
	{
		oSpan.removeChild(oSpan.firstChild);
	}

	if (!sEmail)
	{
		oSpan.textContent = g_oLocalization.KGS.window.userInfo.emailPrivate;
	}
	else
	{
		var oLink = document.createElement("a");
		oLink.href = "mailto:" + sEmail;
		oLink.textContent = sEmail;
		oSpan.appendChild(oLink);
	}
};
CKGSUserInfoWindow.prototype.private_AddInfo = function(sText)
{
	var oDiv = this.m_oExtensionDiv;
	while (oDiv.firstChild)
	{
		oDiv.removeChild(oDiv.firstChild);
	}

	var oTextDiv = document.createElement("div");
	oTextDiv.style.height      = "100%";
	oTextDiv.style.paddingLeft = "1px";

	var oInfoDiv = document.createElement("div");
	var aLines = SplitTextToLines(sText);
	for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
	{
		var oTextSpan        = document.createElement("span");
		oTextSpan.innerHTML  = aLines[nIndex];

		oInfoDiv.appendChild(oTextSpan);
		oInfoDiv.appendChild(document.createElement("br"));
	}

	oTextDiv.appendChild(oInfoDiv);
	oDiv.appendChild(oTextDiv);

	ProcessUserLinks(oTextDiv, this.m_oClient);

	this.m_oInfoScroll = new CVerticalScroll();
	this.m_oInfoScroll.Init(oTextDiv, "VerScroll", "VerScrollActive", true);
	this.m_oInfoScroll.SetPaddings(-1, 1, 1);

	return oTextDiv;
};
CKGSUserInfoWindow.prototype.private_SetCaption = function(sCaption, bOnline)
{
	if (bOnline)
		this.HtmlElement.CaptionText.innerHTML = "\<span\>" + sCaption + "\<\/span\>" + '<span style="font-family:NotoEmoji;position:absolute;left:0px;color:rgb(0,130,57)">&#x2600;</span>';
	else
		this.HtmlElement.CaptionText.innerHTML = "\<span\>" + sCaption + "\<\/span\>" + '<span style="font-family:NotoEmoji;position:absolute;left:0px;color:rgb(199,40,40)">&#x26C5;</span>';
};
CKGSUserInfoWindow.prototype.private_CreateInfoPage = function(oDiv, oControl)
{
	var sInfoHeight = this.m_bOwnInfo ? 227 + 2 * 17 : 227;
	var sDivId = oDiv.id;

	var nEditH = 25;
	var nBot   = nEditH + 10;//this.m_bOwnInfo ?  nEditH + 10 : 7;

	var sMainInfo  = sDivId + "M";
	var sAvatar    = sDivId + "A";
	var sExtension = sDivId + "E";

	this.m_nInfoHeight = sInfoHeight;

	this.m_oMainInfoDiv = this.protected_CreateDivElement(oDiv, sMainInfo);
	var oMainInfoControl = CreateControlContainer(sMainInfo);
	oMainInfoControl.Bounds.SetParams(5, 5, 5, 0, true, true, true, false, -1, sInfoHeight);
	oMainInfoControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oControl.AddControl(oMainInfoControl);
	this.m_oMainInfoControl = oMainInfoControl;

	var nAvatarYoffset = (sInfoHeight - 200 + 10) / 2;
	this.m_oAvatarDiv = this.protected_CreateDivElement(oDiv, sAvatar);
	var oAvatarControl = CreateControlContainer(sAvatar);
	oAvatarControl.Bounds.SetParams(0, nAvatarYoffset, 5, 0, false, true, true, false, 150, 200);
	oAvatarControl.Anchor = (g_anchor_top | g_anchor_right);
	this.m_oAvatarDiv.style.display = "none";
	oControl.AddControl(oAvatarControl);

	this.m_oExtensionDiv = this.protected_CreateDivElement(oDiv, sExtension);
	this.m_oExtensionDiv.className += " Selectable";
	var oExtensionControl = CreateControlContainer(sExtension);
	oExtensionControl.Bounds.SetParams(5, sInfoHeight + 10, 5, nBot, true, true, true, true, -1, -1);
	oExtensionControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	oControl.AddControl(oExtensionControl);

	this.m_oExtensionDiv.style.borderBottom = "1px solid #BEBEBE";
	this.m_oExtensionDiv.style.borderTop    = "1px solid #BEBEBE";

	var oThis = this;
	function private_AddButton(oParent, sText, nW, nRight, fOnClick)
	{
		var oButton              = oThis.protected_CreateDivElement(oParent, null, "div");
		oButton.className        = "ButtonCommon";
		oButton.style.display    = "block";
		oButton.style.textAlign  = "center";
		oButton.style.width      = "100px";
		oButton.style.height     = "25px";
		oButton.style.lineHeight = "23px";
		oButton.style.fontSize   = "14px";
		oButton.style.userSelect = "none";
		oButton.style.fontFamily = "'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif";
		Common.Set_InnerTextToElement(oButton, sText);
		var oButtonControl = CreateControlContainerByElement(oButton);
		oButtonControl.SetParams(0, 0, nRight, 0, false, true, true, true, nW, nEditH);
		oButtonControl.SetAnchor(false, true, true, false);
		oEditAreaControl.AddControl(oButtonControl);
		oButton.addEventListener("click", fOnClick, false);
		oButton.addEventListener("selectstart", function(){return false;}, false);
		oButton.addEventListener("mousedown", function(){return false;}, false);
		return oButton;
	}

	var sEditId = sDivId + "D";
	var oEditAreaElement = this.protected_CreateDivElement(oDiv, sEditId);
	var oEditAreaControl = CreateControlContainer(sEditId);
	oEditAreaControl.SetParams(5, 0, 5, 5, true, false, true, true, -1, nEditH);
	oEditAreaControl.SetAnchor(true, false, true, true);
	oControl.AddControl(oEditAreaControl);

	if (this.m_bOwnInfo)
	{
		var sSaveButton   = g_oLocalization.common.button.save;
		var sEditButton   = g_oLocalization.common.button.edit;
		var sCancelButton = g_oLocalization.common.button.cancel;

		g_oTextMeasurer.SetFont("14px 'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif");
		var nPadding = 20;
		var nEditButtonW   = g_oTextMeasurer.Measure(sEditButton);
		var nSaveButtonW   = g_oTextMeasurer.Measure(sSaveButton);
		var nCancelButtonW = g_oTextMeasurer.Measure(sCancelButton);

		nEditButtonW = nSaveButtonW = nCancelButtonW = nPadding + Math.max(nEditButtonW, nSaveButtonW, nCancelButtonW, 40);

		this.m_oEditButton   = private_AddButton(oEditAreaElement, sEditButton, nEditButtonW, 0, function(){return oThis.private_OnClickEdit()});
		this.m_oSaveButton   = private_AddButton(oEditAreaElement, sSaveButton, nSaveButtonW, 0 + nCancelButtonW + 3, function(){return oThis.private_OnClickSave()});
		this.m_oCancelButton = private_AddButton(oEditAreaElement, sCancelButton, nCancelButtonW, 0, function(){return oThis.private_OnClickCancel()});

		this.m_oSaveButton.style.display   = "none";
		this.m_oCancelButton.style.display = "none";

		this.m_oExtensionEditDiv = this.protected_CreateDivElement(oDiv, null, "textarea");
		var oExtensionEditControl = CreateControlContainerByElement(this.m_oExtensionEditDiv);
		oExtensionEditControl.Bounds.SetParams(5, sInfoHeight + 10, 5, nBot - 2, true, true, true, true, -1, -1);
		oExtensionEditControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
		oControl.AddControl(oExtensionEditControl);

		this.m_oExtensionEditDiv.className      = "ChatInput";
		this.m_oExtensionEditDiv.style.border   = "1px solid #BEBEBE";
		this.m_oExtensionEditDiv.style.fontSize = "16px";

		this.m_oExtensionEditDiv.style.display = "none";

		this.m_oInfoEditScroll = new CVerticalScroll();
		this.m_oInfoEditScroll.Init(this.m_oExtensionEditDiv, "VerScroll", "VerScrollActive", true);
		this.m_oInfoEditScroll.SetPaddings(0, 0, -1);

		this.m_oExtensionEditDiv.maxLength = "1500";
	}
	else
	{
		var oClient = this.m_oClient;
		this.private_AddUserListCheckbox(oEditAreaElement,
			g_oLocalization.mainRoom.playersList.contextMenuFriend,
			function(s)
			{
				return oClient.IsUserInFriendList(s);
			},
			function(s)
			{
				return oClient.AddToFriendList(s);
			},
			function(s)
			{
				return oClient.RemoveFromFriendList(s);
			}
		);
		this.private_AddUserListCheckbox(oEditAreaElement,
			g_oLocalization.mainRoom.playersList.contextMenuCensored,
			function(s)
			{
				return oClient.IsUserInBlackList(s);
			},
			function(s)
			{
				return oClient.AddToBlackList(s);
			},
			function(s)
			{
				return oClient.RemoveFromBlackList(s);
			}
		);
		this.private_AddUserListCheckbox(oEditAreaElement,
			g_oLocalization.mainRoom.playersList.contextMenuFollow,
			function(s)
			{
				return oClient.IsUserInFollowerList(s);
			},
			function(s)
			{
				return oClient.AddToFollowerList(s);
			},
			function(s)
			{
				return oClient.RemoveFromFollowerList(s);
			}
		);
	}

	this.private_AddMainInfo();
};
CKGSUserInfoWindow.prototype.private_CreateGamesPage = function(oDiv, oControl)
{
	var sGameViewId = oDiv.id + "L";

	var oGamesDiv = this.protected_CreateDivElement(oDiv, sGameViewId);
	var oGamesListControl = this.m_oGamesListView.Init(sGameViewId, new CKGSUserInfoGamesList(this.m_oApp));
	oGamesListControl.Bounds.SetParams(0, 0, 0, 0, true, false, true, true, -1, -1);
	oGamesListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oGamesListControl.HtmlElement.style.background = "#F3F3F3";
	oControl.AddControl(oGamesListControl);
};
CKGSUserInfoWindow.prototype.private_CreateRankPage = function(oDiv, oControl)
{
	var sCanvasId = oDiv.id + "C";
	var oCanvas = document.createElement("canvas");
	oCanvas.id = sCanvasId;
	oDiv.appendChild(oCanvas);
	oCanvas.style.position = "absolute";

	var oCanvasControl = CreateControlContainer(sCanvasId);
	oCanvasControl.Bounds.SetParams(0, 0, 0, 0, true, false, true, true, -1, -1);
	oCanvasControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oCanvasControl.HtmlElement.style.background = "#000000";
	oControl.AddControl(oCanvasControl);

	this.m_oRankCanvas = oCanvas;

	var sCanvasEventId = oDiv.id + "E";
	var oCanvasEvent = document.createElement("canvas");
	oCanvasEvent.id = sCanvasEventId;
	oDiv.appendChild(oCanvasEvent);
	oCanvasEvent.style.position = "absolute";

	var oCanvasEventControl = CreateControlContainer(sCanvasEventId);
	oCanvasEventControl.Bounds.SetParams(0, 0, 0, 0, true, false, true, true, -1, -1);
	oCanvasEventControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oControl.AddControl(oCanvasEventControl);

	this.m_oRankCanvasEvent = oCanvasEvent;

	var oThis = this;
	oCanvasEvent.addEventListener("mousemove", function(e)
	{
		check_MouseMoveEvent(e);
		var oPos = oThis.private_UpdateMousePosOnRankGraph(global_mouseEvent.X, global_mouseEvent.Y);
		oThis.private_OnMouseMoveRankGraph(oPos.X, oPos.Y);
	}, false);

	oCanvasEvent.addEventListener("mouseout", function(e)
	{
		check_MouseMoveEvent(e);
		var oPos = oThis.private_UpdateMousePosOnRankGraph(global_mouseEvent.X, global_mouseEvent.Y);
		oThis.private_OnMouseOutRankGraph(oPos.X, oPos.Y);
	}, false);
};
CKGSUserInfoWindow.prototype.private_CreateFriendsPage = function(oDiv, oControl)
{
	var oClient = this.m_oClient;
	this.private_CreateUserListPage(oDiv, oControl, this.m_oFriendsListView, this.m_oFriendsPageInfo,
		function(sName, sNotes)
		{
			oClient.AddToFriendList(sName, sNotes);
		},
		function(sName)
		{
			oClient.RemoveFromFriendList(sName);
		}
	);
};
CKGSUserInfoWindow.prototype.private_CreateCensoredPage = function(oDiv, oControl)
{
	var oClient = this.m_oClient;
	this.private_CreateUserListPage(oDiv, oControl, this.m_oCensoredListView, this.m_oCensoredPageInfo,
		function(sName, sNotes)
		{
			oClient.AddToBlackList(sName, sNotes);
		},
		function(sName)
		{
			oClient.RemoveFromBlackList(sName);
		}
	);
};
CKGSUserInfoWindow.prototype.private_CreateFollowerPage = function(oDiv, oControl)
{
	var oClient = this.m_oClient;
	this.private_CreateUserListPage(oDiv, oControl, this.m_oFollowedListView, this.m_oFollowedPageInfo,
		function(sName, sNotes)
		{
			oClient.AddToFollowerList(sName, sNotes);
		},
		function(sName)
		{
			oClient.RemoveFromFollowerList(sName);
		}
	);
};
CKGSUserInfoWindow.prototype.private_CreateUserListPage = function(oDiv, oControl, oListView, oInfo, fOnAdd, fOnRemove)
{
	var nRightPanelW = 200;

	var sDivId = oDiv.id;

	oListView.Set_BGColor(243, 243, 243);

	var sListViewDivId = sDivId + "L";
	var oListViewDiv   = this.protected_CreateDivElement(oDiv, sListViewDivId);
	oListViewDiv.style.borderRight = "1px solid rgb(190, 190, 190)";

	var oListControl = oListView.Init(sListViewDivId, new CKGSUsersList(this.m_oClient.m_oApp));
	oListControl.Bounds.SetParams(0, 0, nRightPanelW, 1000, false, false, true, false, -1, -1);
	oListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right);
	oListControl.HtmlElement.style.background = "#F3F3F3";
	oControl.AddControl(oListControl);

	var oNameInput   = this.protected_CreateDivElement(oDiv, null, "input");
	var oNameControl = CreateControlContainerByElement(oNameInput);
	oNameControl.SetParams(2, 2, 2, 1000, true, true, true, false, nRightPanelW - 6, 30);
	oNameControl.SetAnchor(false, true, true, false);
	oControl.AddControl(oNameControl);
	oNameInput.className += " inputKGSWindow";
	oNameInput.style.padding  = "0px 5px 0px 5px";
	oNameInput.type           = "text";
	oNameInput.maxLength      = "20";
	oNameInput["aria-label"]  = g_oLocalization.KGS.window.userInfo.userslistNamePlaceholder;
	oNameInput["placeholder"] = g_oLocalization.KGS.window.userInfo.userslistNamePlaceholder;
	var oThis = this;
	oNameInput.addEventListener("input", function()
	{
		if (null === oListView.SelectByKey(oNameInput.value.toLowerCase()))
		{
			oNotesInput.value = "";
			Common.Set_InnerTextToElement(oAddButton, g_oLocalization.common.button.add);

			oRemoveButton.className = "ButtonCommonDisabled";
		}
		else
		{
			Common.Set_InnerTextToElement(oAddButton, g_oLocalization.common.button.change);
			oRemoveButton.className = "ButtonCommon";
		}
	}, false);

	var oNotesInput   = this.protected_CreateDivElement(oDiv, null, "input");
	var oNotesControl = CreateControlContainerByElement(oNotesInput);
	oNotesControl.SetParams(2, 36, 2, 1000, true, true, true, false, nRightPanelW - 6, 30);
	oNotesControl.SetAnchor(false, true, true, false);
	oControl.AddControl(oNotesControl);
	oNotesInput.className += " inputKGSWindow";
	oNotesInput.style.padding  = "0px 5px 0px 5px";
	oNotesInput.type           = "text";
	oNotesInput.maxLength      = "256";
	oNotesInput["aria-label"]  = g_oLocalization.KGS.window.userInfo.userslistNotesPlaceholder;
	oNotesInput["placeholder"] = g_oLocalization.KGS.window.userInfo.userslistNotesPlaceholder;

	var nButtonW = (nRightPanelW - 4 - 2) / 2 - 2;
	var oAddButton              = this.protected_CreateDivElement(oDiv, null, "div");
	oAddButton.className        = "ButtonCommon";
	oAddButton.style.textAlign  = "center";
	oAddButton.style.width      = "100px";
	oAddButton.style.height     = "25px";
	oAddButton.style.lineHeight = "23px";
	oAddButton.style.fontSize   = "14px";
	oAddButton.style.fontFamily = "'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif";
	Common.Set_InnerTextToElement(oAddButton, g_oLocalization.common.button.add);
	var oAddControl = CreateControlContainerByElement(oAddButton);
	oAddControl.SetParams(2, 70, nRightPanelW - 4 - nButtonW, 1000, true, true, true, false, nButtonW, 25);
	oAddControl.SetAnchor(false, true, true, false);
	oControl.AddControl(oAddControl);

	var oClient = this.m_oClient;
	oAddButton.addEventListener("click", function()
	{
		if (oNameInput.value.length > 0 && fOnAdd)
		{
			fOnAdd(oNameInput.value, oNotesInput.value ? oNotesInput.value : "");
		}
	}, false);

	var oRemoveButton              = this.protected_CreateDivElement(oDiv, null, "div");
	oRemoveButton.className        = "ButtonCommonDisabled";
	oRemoveButton.style.textAlign  = "center";
	oRemoveButton.style.width      = "100px";
	oRemoveButton.style.height     = "25px";
	oRemoveButton.style.lineHeight = "23px";
	oRemoveButton.style.fontSize   = "14px";
	oRemoveButton.style.fontFamily = "'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif";
	Common.Set_InnerTextToElement(oRemoveButton, g_oLocalization.common.button.remove);
	var oRemoveControl = CreateControlContainerByElement(oRemoveButton);
	oRemoveControl.SetParams(2, 70, 2, 1000, true, true, true, false, nButtonW, 25);
	oRemoveControl.SetAnchor(false, true, true, false);
	oControl.AddControl(oRemoveControl);

	oRemoveButton.addEventListener("click", function()
	{
		if (oNameInput.value.length > 0 && fOnRemove)
		{
			fOnRemove(oNameInput.value);
			oListView.ResetSelection();
		}
	}, false);

	oListView.GetListObject().SetSelectCallback(function(sName, sNotes)
	{
		oNameInput.value  = sName;
		oNotesInput.value = sNotes;
		Common.Set_InnerTextToElement(oAddButton, g_oLocalization.common.button.change);
		oRemoveButton.className = "ButtonCommon";
	});
	oListView.GetListObject().SetUnselectCallback(function()
	{
		oNameInput.value  = "";
		oNotesInput.value = "";
		Common.Set_InnerTextToElement(oAddButton, g_oLocalization.common.button.add);
		oRemoveButton.className = "ButtonCommonDisabled";
	});

	oInfo.AddButton    = oAddButton;
	oInfo.RemoveButton = oRemoveButton;
	oInfo.NameInput    = oNameInput;
	oInfo.NotesInput   = oNotesInput;
};
CKGSUserInfoWindow.prototype.private_UpdateMousePosOnRankGraph = function(X, Y)
{
	var oPos = Common_FindPosition(this.m_oRankCanvas);
	return { X: X - oPos.X, Y : Y - oPos.Y };
};
CKGSUserInfoWindow.prototype.private_OnMouseMoveRankGraph = function(X, Y)
{
	for (var nPointIndex = 0, nPointsCount = this.m_arrPoints.length; nPointIndex < nPointsCount; ++nPointIndex)
	{
		var oPoint = this.m_arrPoints[nPointIndex];
		var oPrevPoint = 0 === nPointIndex ? null : this.m_arrPoints[nPointIndex - 1];

		if (oPoint.x - this.m_nStepX < X && X < oPoint.x + 1 &&
			(Y >= this.m_oRankCanvas.height - 30
			|| (0 === nPointIndex && oPoint.y - 7 < Y && Y < oPoint.y + 7)
			|| (0 !== nPointIndex && ((oPoint.y - 7 < Y && Y < oPrevPoint.y + 7) || (oPrevPoint.y - 7 < Y && Y < oPoint.y + 7)))))
		{
			var oPos = Common_FindPosition(this.m_oRankCanvas);

			var nRank = oPoint.rank;
			var sRank = "1d";
			if (nRank >= 0)
				sRank = (((((nRank + 100) / 100) * 100) | 0) / 100) + "d";
			else
				sRank = ((((-nRank / 100) * 100) | 0) / 100) + "k";

			var oDate = new Date(oPoint.time);

			this.private_ShowRankHint(oPoint.x + oPos.X, oPoint.y + oPos.Y, sRank + " " + oDate.toLocaleDateString(g_oLocalization.locale));

			if (nPointIndex > 0)
			{
				var oContext = this.m_oRankCanvasEvent.getContext("2d");
				var nW = this.m_oRankCanvasEvent.width;
				var nH = this.m_oRankCanvasEvent.height;
				oContext.clearRect(0, 0, nW, nH);

				oContext.strokeStyle = "rgb(255, 0, 0)";
				oContext.lineWidth   = 2;

				var oSegment = this.m_arrSpline[nPointIndex - 1];

				oContext.beginPath();
				oContext.moveTo(oSegment.points[0].x, oSegment.points[0].y);
				oContext.bezierCurveTo(
					oSegment.points[1].x, oSegment.points[1].y,
					oSegment.points[2].x, oSegment.points[2].y,
					oSegment.points[3].x, oSegment.points[3].y);
				oContext.stroke();
			}

			return;
		}
	}

	this.private_HideRankHint();
};
CKGSUserInfoWindow.prototype.private_OnMouseOutRankGraph = function(X, Y)
{
	this.private_HideRankHint();
};
CKGSUserInfoWindow.prototype.private_ShowRankHint = function(X, Y, sText)
{
	var oThis = this;
	if (!this.m_oRankHint)
	{
		this.m_oRankHint = {
			Div    : null,
			Canvas : null,
			Parent : this.m_oApp.GetMainDiv()
		};
	}

	if (!this.m_oRankHint.Div)
	{
		var oMainDiv = this.m_oApp.GetMainDiv();

		var oElement              = document.createElement("div");
		oElement.style.position   = "absolute";
		oElement.style.width      = "auto";
		oElement.style.height     = "auto";
		oElement.style.background = "rgb(243, 243, 243)";
		oElement.style.border     = "1px solid rgb(0,0,0)";
		oElement.style.display    = "block";
		oElement.style.overflow   = "hidden";
		oElement.style.zIndex     = 0xFFFF;
		oMainDiv.appendChild(oElement);

		oElement.addEventListener("mousemove", function(e){
			check_MouseMoveEvent(e);
			var oPos = oThis.private_UpdateMousePosOnRankGraph(global_mouseEvent.X, global_mouseEvent.Y);
			oThis.private_OnMouseMoveRankGraph(oPos.X, oPos.Y);
		});

		this.m_oRankHint.Div = oElement;
	}

	if (!this.m_oRankHint.Canvas)
	{
		var oMainDiv = this.m_oApp.GetMainDiv();

		var nW = 8;
		var nH = 8;
		var nR = 3;

		var oElement            = document.createElement("canvas");
		oElement.style.position = "absolute";
		oElement.style.width    = nW + "px";
		oElement.style.height   = nH + "px";
		oElement.style.display  = "block";
		oElement.style.overflow = "hidden";
		oElement.style.zIndex   = 0xFFFF;
		oElement.width          = nW;
		oElement.height         = nH;
		oMainDiv.appendChild(oElement);

		this.m_oRankHint.Canvas = oElement;

		oElement.addEventListener("mousemove", function(e){
			check_MouseMoveEvent(e);
			var oPos = oThis.private_UpdateMousePosOnRankGraph(global_mouseEvent.X, global_mouseEvent.Y);
			oThis.private_OnMouseMoveRankGraph(oPos.X, oPos.Y);
		});

		var oContext = oElement.getContext("2d");
		oContext.strokeStyle = "rgb(255, 0, 0)";
		oContext.lineWidth = 1;
		oContext.beginPath();
		oContext.arc(nW / 2, nH / 2, nR, 0, 2 * Math.PI, false);
		oContext.stroke();
	}

	var oDiv           = this.m_oRankHint.Div;
	oDiv.style.top     = (Y + 5) + "px";
	oDiv.style.left    = (X + 10) + "px";
	oDiv.style.display = "block";
	oDiv.innerHTML     = sText;

	var oCanvas           = this.m_oRankHint.Canvas;
	oCanvas.style.top     = (Y - 2) + "px";
	oCanvas.style.left    = (X - 2) + "px";
	oCanvas.style.display = "block";
};
CKGSUserInfoWindow.prototype.private_HideRankHint = function()
{
	if (this.m_oRankCanvasEvent)
	{
		var oContext = this.m_oRankCanvasEvent.getContext("2d");
		var nW = this.m_oRankCanvasEvent.width;
		var nH = this.m_oRankCanvasEvent.height;
		oContext.clearRect(0, 0, nW, nH);
	}

	if (!this.m_oRankHint)
		return;

	var oParent = this.m_oRankHint.Parent;
	if (oParent && this.m_oRankHint.Div)
		oParent.removeChild(this.m_oRankHint.Div);

	if (oParent && this.m_oRankHint.Canvas)
		oParent.removeChild(this.m_oRankHint.Canvas);

	this.m_oRankHint = null;

};
CKGSUserInfoWindow.prototype.UpdateFriendsLists = function()
{
	var oFriends = this.m_oClient.GetFriendsList();
	this.m_oFriendsListView.Clear();
	for (var sId in oFriends)
	{
		this.m_oFriendsListView.Handle_Record([0, oFriends[sId]]);
	}
	this.m_oFriendsListView.Update_Size();

	var oCensored = this.m_oClient.GetBlackList();
	this.m_oCensoredListView.Clear();
	for (var sId in oCensored)
	{
		this.m_oCensoredListView.Handle_Record([0, oCensored[sId]]);
	}
	this.m_oCensoredListView.Update_Size();

	var oFollowed = this.m_oClient.GetFollowedList();
	this.m_oFollowedListView.Clear();
	for (var sId in oFollowed)
	{
		this.m_oFollowedListView.Handle_Record([0, oFollowed[sId]]);
	}
	this.m_oFollowedListView.Update_Size();

	function private_UpdateSelection(oListView, oInfo)
	{
		var oNameInput    = oInfo.NameInput;
		var oNotesInput   = oInfo.NotesInput;
		var oAddButton    = oInfo.AddButton;
		var oRemoveButton = oInfo.RemoveButton;

		if (null === oListView.SelectByKey(oNameInput.value.toLowerCase()))
		{
			oNotesInput.value = "";
			Common.Set_InnerTextToElement(oAddButton, g_oLocalization.common.button.add);

			oRemoveButton.className = "ButtonCommonDisabled";
		}
		else
		{
			Common.Set_InnerTextToElement(oAddButton, g_oLocalization.common.button.change);
			oRemoveButton.className = "ButtonCommon";
		}
	}

	private_UpdateSelection(this.m_oFriendsListView, this.m_oFriendsPageInfo);
	private_UpdateSelection(this.m_oCensoredListView, this.m_oCensoredPageInfo);
	private_UpdateSelection(this.m_oFollowedListView, this.m_oFollowedPageInfo);
};
CKGSUserInfoWindow.prototype.private_OnClickEdit = function()
{
	this.m_bEditing = true;

	this.m_oEditButton.style.display   = "none";
	this.m_oSaveButton.style.display   = "block";
	this.m_oCancelButton.style.display = "block";

	this.m_oExtensionEditDiv.style.display = "block";
	this.m_oExtensionEditDiv.value = this.m_oRawInfo.PersonalInfo;

	this.m_oInfoTable.Name.style.display    = "none";
	this.m_oInfoEditNameInput.style.display = "block";
	this.m_oInfoEditNameInput.value         = this.m_oRawInfo.PersonalName;

	this.m_oInfoTable.Email.style.display    = "none";
	this.m_oInfoEditEmailInput.style.display = "block";
	this.m_oInfoEditEmailInput.value         = this.m_oRawInfo.Email;

	this.m_oInfoCheckboxPrivate.disabled = "";
	this.m_oInfoCheckboxPrivate.checked  = this.m_oRawInfo.PrivateEmail;

	this.m_oInfoCheckboxKGSEmail.disabled = "";
	this.m_oInfoCheckboxKGSEmail.checked  = this.m_oRawInfo.EmailWanted;

	this.m_oInfoRankWanted.disabled = (true !== this.m_oRawInfo.ForcedNoRank ? "" : "disabled");
	this.m_oInfoRankWanted.checked  = this.m_oRawInfo.RankWanted;

	if (this.m_oInfoEditScroll && this.m_oExtensionDiv && 0 === this.m_oTabs.GetCurrentId() && true === this.m_bEditing)
		this.m_oInfoEditScroll.CheckVisibility();

	if (this.m_oInfoScroll && this.m_oInfoEditScroll)
		this.m_oInfoEditScroll.CopyPosition(this.m_oInfoScroll);
};
CKGSUserInfoWindow.prototype.private_OnClickSave = function()
{
	this.m_bEditing = false;

	if (this.m_oInfoScroll && this.m_oInfoEditScroll)
		this.m_oInfoScroll.CopyPosition(this.m_oInfoEditScroll);

	if (this.m_oInfoEditScroll)
		this.m_oInfoEditScroll.Hide();


	this.m_oEditButton.style.display   = "block";
	this.m_oSaveButton.style.display   = "none";
	this.m_oCancelButton.style.display = "none";

	this.m_oExtensionEditDiv.style.display = "none";
	this.m_oRawInfo.PersonalInfo           = this.m_oExtensionEditDiv.value;

	this.m_oInfoTable.Name.style.display    = "block";
	this.m_oInfoEditNameInput.style.display = "none";
	this.m_oRawInfo.PersonalName            = this.m_oInfoEditNameInput.value;

	this.m_oInfoTable.Email.style.display    = "block";
	this.m_oInfoEditEmailInput.style.display = "none";
	this.m_oRawInfo.Email                    = this.m_oInfoEditEmailInput.value;

	this.m_oInfoCheckboxKGSEmail.disabled = "disabled";
	this.m_oInfoCheckboxPrivate.disabled  = "disabled";
	this.m_oInfoRankWanted.disabled       = "disabled";

	this.m_oRawInfo.PrivateEmail = this.m_oInfoCheckboxPrivate.checked;
	this.m_oRawInfo.EmailWanted  = this.m_oInfoCheckboxKGSEmail.checked;
	this.m_oRawInfo.RankWanted   = this.m_oInfoRankWanted.checked;

	this.EditUserInfo();
};
CKGSUserInfoWindow.prototype.private_OnClickCancel = function()
{
	this.m_bEditing = false;

	if (this.m_oInfoScroll && this.m_oInfoEditScroll)
		this.m_oInfoScroll.CopyPosition(this.m_oInfoEditScroll);

	if (this.m_oInfoEditScroll)
		this.m_oInfoEditScroll.Hide();


	this.m_oEditButton.style.display   = "block";
	this.m_oSaveButton.style.display   = "none";
	this.m_oCancelButton.style.display = "none";

	this.m_oExtensionEditDiv.style.display  = "none";

	this.m_oInfoTable.Name.style.display    = "block";
	this.m_oInfoEditNameInput.style.display = "none";

	this.m_oInfoTable.Email.style.display    = "block";
	this.m_oInfoEditEmailInput.style.display = "none";

	this.m_oInfoCheckboxPrivate.disabled = "disabled";
	this.m_oInfoCheckboxPrivate.checked  = this.m_oRawInfo.PrivateEmail;

	this.m_oInfoCheckboxKGSEmail.disabled = "disabled";
	this.m_oInfoCheckboxKGSEmail.checked  = this.m_oRawInfo.EmailWanted;

	this.m_oInfoRankWanted.disabled = "disabled";
	this.m_oInfoRankWanted.checked  = (this.m_oUser && !this.m_oUser.IsRankHided() && true !== this.m_oRawInfo.ForcedNoRank);

	// Вызываем, чтобы обновить рейтинг, если он был скрыт
	this.OnUserUpdate();
};
CKGSUserInfoWindow.prototype.private_AddUserListCheckbox = function(oParent, sLabel, fIsInList, fAdd, fRemove)
{
	var nHeight = 25;

	var oWrapper                = document.createElement("div");
	oWrapper.style["user-select"] = "none";
	oWrapper.style.paddingLeft  = "5px";
	oWrapper.style.paddingRight = "15px";
	oWrapper.style.height       = nHeight + "px";
	oWrapper.style["float"]     = "left";
	oWrapper.style.cursor       = "default";
	oParent.appendChild(oWrapper);

	oWrapper.addEventListener("selectstart", function(){return false}, false);

	var oCheckBox     = document.createElement("input");
	oCheckBox.style.position = "relative";
	oCheckBox.style.top      = Math.ceil((nHeight - 12 + 2) / 2) + "px";
	oCheckBox.style.width    = "12px";
	oCheckBox.style.height   = "12px";
	oCheckBox.style["float"] = "left";
	oCheckBox.type           = "checkbox";
	oCheckBox.checked        = fIsInList(this.m_sUserName);
	oWrapper.appendChild(oCheckBox);

	var oLabel               = document.createElement("div");
	oLabel.style["float"]    = "left";
	oLabel.style.paddingLeft = "3px";
	oLabel.style.fontFamily  = "'Segoe UI', Tahoma, sans-serif";
	oLabel.style.fontSize    = "16px";
	oLabel.style.height      = nHeight + "px";
	oLabel.style.lineHeight  = nHeight + "px";
	oLabel.textContent       = sLabel;
	oWrapper.appendChild(oLabel);

	var oThis = this;
	function privateOnClick()
	{
		if (fIsInList(oThis.m_sUserName))
		{
			fRemove(oThis.m_sUserName);
			oCheckBox.checked = false;
		}
		else
		{
			fAdd(oThis.m_sUserName);
			oCheckBox.checked = true;
		}
	}
	oCheckBox.onclick = privateOnClick;
	oLabel.onclick    = privateOnClick;
};

var EKGSUserInfoGameListRecord = {
	Type      : 1,
	WRank     : 2,
	WName     : 3,
	Vs        : 4,
	BRank     : 5,
	BName     : 6,
	SizeHandi : 7,
	Komi      : 8,
	Result    : 9,
	TimeStamp : 10
};

function CKGSUserInfoGamesList(oApp)
{
	CKGSGamesList.superclass.constructor.call(this);

	this.m_oHeaders = {
		Sizes : [0, 16, 56, 196, 221, 261, 381, 450, 515, 609],
		Count : 10,
		1     : g_oLocalization.mainRoom.gamesList.listHeaderType,
		2     : g_oLocalization.mainRoom.gamesList.listHeaderWhiteRank,
		3     : g_oLocalization.mainRoom.gamesList.listHeaderWhiteName,
		4     : "",
		5     : g_oLocalization.mainRoom.gamesList.listHeaderBlackRank,
		6     : g_oLocalization.mainRoom.gamesList.listHeaderBlackName,
		7     : "",
		8     : g_oLocalization.mainRoom.gamesList.listHeaderKomi,
		9     : g_oLocalization.mainRoom.gamesList.listHeaderResult,
		10    : g_oLocalization.mainRoom.gamesList.listHeaderDate
	};

	this.m_nSortType = -EKGSUserInfoGameListRecord.TimeStamp;

	this.m_oApp = oApp;
}

CommonExtend(CKGSUserInfoGamesList, CListBase);

CKGSUserInfoGamesList.prototype.private_Sort = function (oRecord1, oRecord2)
{
	var SortType = this.m_nSortType;
	if (EKGSUserInfoGameListRecord.WRank === SortType)
	{
		if (oRecord1.GetWhiteRank() < oRecord2.GetWhiteRank())
			return -1;
		else if (oRecord1.GetWhiteRank() > oRecord2.GetWhiteRank())
			return 1;
	}
	else if (-EKGSUserInfoGameListRecord.WRank === SortType)
	{
		if (oRecord1.GetWhiteRank() < oRecord2.GetWhiteRank())
			return 1;
		else if (oRecord1.GetWhiteRank() > oRecord2.GetWhiteRank())
			return -1;
	}
	else if (EKGSUserInfoGameListRecord.WName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.GetWhiteName(), oRecord2.GetWhiteName()) < 0)
			return -1;
		else if (Common.Compare_Strings(oRecord1.GetWhiteName(), oRecord2.GetWhiteName()) > 0)
			return 1;
	}
	else if (-EKGSUserInfoGameListRecord.WName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.GetWhiteName(), oRecord2.GetWhiteName()) < 0)
			return 1;
		else if (Common.Compare_Strings(oRecord1.GetWhiteName(), oRecord2.GetWhiteName()) > 0)
			return -1;
	}
	else if (EKGSUserInfoGameListRecord.BRank === SortType)
	{
		if (oRecord1.GetBlackRank() < oRecord2.GetBlackRank())
			return -1;
		else if (oRecord1.GetBlackRank() > oRecord2.GetBlackRank())
			return 1;
	}
	else if (-EKGSUserInfoGameListRecord.BRank === SortType)
	{
		if (oRecord1.GetBlackRank() < oRecord2.GetBlackRank())
			return 1;
		else if (oRecord1.GetBlackRank() > oRecord2.GetBlackRank())
			return -1;
	}
	else if (EKGSUserInfoGameListRecord.BName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.GetBlackName(), oRecord2.GetBlackName()) < 0)
			return -1;
		else if (Common.Compare_Strings(oRecord1.GetBlackName(), oRecord2.GetBlackName()) > 0)
			return 1;
	}
	else if (-EKGSUserInfoGameListRecord.BName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.GetBlackName(), oRecord2.GetBlackName()) < 0)
			return 1;
		else if (Common.Compare_Strings(oRecord1.GetBlackName(), oRecord2.GetBlackName()) > 0)
			return -1;
	}
	else if (EKGSUserInfoGameListRecord.TimeStamp === SortType)
	{
		if (oRecord1.GetDate() < oRecord2.GetDate())
			return -1;
		else if (oRecord1.GetDate() > oRecord2.GetDate())
			return 1;
	}
	else if (-EKGSUserInfoGameListRecord.TimeStamp === SortType)
	{
		if (oRecord1.GetDate() < oRecord2.GetDate())
			return 1;
		else if (oRecord1.GetDate() > oRecord2.GetDate())
			return -1;
	}

	return 0;
};
CKGSUserInfoGamesList.prototype.private_PreSort = function(oRecord1, oRecord2)
{
	return 0;
};
CKGSUserInfoGamesList.prototype.private_PostSort = function(oRecord1, oRecord2)
{
	if (oRecord1.GetDate() < oRecord2.GetDate())
		return 1;
	else if (oRecord1.GetDate() > oRecord2.GetDate())
		return -1;

	if (Common.Compare_Strings(oRecord1.GetTimeStamp(), oRecord2.GetTimeStamp()) < 0)
		return -1;
	else if (Common.Compare_Strings(oRecord1.GetTimeStamp(), oRecord2.GetTimeStamp()) > 0)
		return 1;

	return 0;
};
CKGSUserInfoGamesList.prototype.Is_Sortable = function(nColNum)
{
	var eType = nColNum + 1;
	switch (eType)
	{
		case EKGSUserInfoGameListRecord.WRank    :
		case EKGSUserInfoGameListRecord.WName    :
		case EKGSUserInfoGameListRecord.BRank    :
		case EKGSUserInfoGameListRecord.BName    :
		case EKGSUserInfoGameListRecord.TimeStamp:
			return true;
	}

	return false;
};
CKGSUserInfoGamesList.prototype.Draw_Record = function(dX, dY, oContext, oRecord, nColNum, oListView)
{
	var eType = nColNum + 1;
	if (null !== oRecord.m_oOwner)
	{
		if (null !== oRecord.m_oOwner && 2 === nColNum)
			oListView.Start_ClipException(oContext, 2, 6);

		if (3 !== nColNum && 4 !== nColNum && 5 !== nColNum)
			oRecord.Draw(oContext, dX, dY, eType);

		if (null !== oRecord.m_oOwner && 2 === nColNum)
			oListView.Restore_Clip(oContext, 2);
	}
	else
	{
		oRecord.Draw(oContext, dX, dY, eType);
	}
};
CKGSUserInfoGamesList.prototype.Get_Record = function(aLine)
{
	var oRecord = new CKGSUserInfoGamesListRecord(this.m_oApp.GetClient());
	oRecord.Update(aLine);
	return oRecord;
};
CKGSUserInfoGamesList.prototype.Handle_DoubleClick = function(oRecord)
{
	if (!oRecord)
		return;

	if (true === oRecord.IsInPlay())
	{
		var oClient = this.m_oApp.GetClient();
		if (!oClient)
			return;

		oClient.EnterGameRoomByTimeStamp(oRecord.GetTimeStamp());
	}
};
CKGSUserInfoGamesList.prototype.Handle_RightClick = function(oRecord, e)
{
	if (!oRecord)
		return;

	var oClient = this.m_oApp.GetClient();
	if (!oClient)
		return;

	var isDemo    = oRecord.IsDemo();
	var isPrivate = oRecord.IsPrivate();
	var sUrl      = oRecord.GetUrl();
	var nX        = e.pageX,
		nY        = e.pageY;

	var isPrivateForMe = isPrivate;
	if (true === isPrivate)
		isPrivateForMe = oRecord.CheckUserOwnership(oClient.GetCurrentUser()) ? false : true;

	var oContextMenu = new CVisualContextMenu(this.m_oApp, nX, nY);
	var oThis = this;
	function privateLoadIn(e, isLoadPrivately)
	{
		var oContextMenu2 = oContextMenu.GetAdditionalInfo("LoadIn");
		if (undefined === oContextMenu2)
		{
			var nWidth    = oContextMenu.GetWidth();
			oContextMenu2 = new CVisualContextMenu(oThis.m_oApp, nX + nWidth + 3, nY + 10 + (true === isLoadPrivately ? 20 : 0));
			oContextMenu2.SetMaxHeight(412);

			var arrRooms = oClient.GetRooms();
			for (var nRoomIndex = 0, nRoomsCount = arrRooms.length; nRoomIndex < nRoomsCount; ++nRoomIndex)
			{
				var oRoom = arrRooms[nRoomIndex];
				oContextMenu2.AddListItem(oRoom.Name, function(e, nChannelId)
				{
					oClient.LoadGameInRoom(oRecord.GetTimeStamp(), nChannelId, isLoadPrivately);
				}, false, oRoom.ChannelId);
			}

			oContextMenu2.Show();
			oContextMenu.SetAdditionalInfo("LoadIn", oContextMenu2);
		}
		else
		{
			oContextMenu2.Hide();
			oContextMenu.SetAdditionalInfo("LoadIn", undefined);
		}

		e.stopPropagation();
		return false;
	}

	if (true === oRecord.IsInPlay())
	{
		oContextMenu.AddListItem(g_oLocalization.KGS.window.userInfo.gamesArchive.contextMenu.observe, function()
		{
			oClient.EnterGameRoomByTimeStamp(oRecord.GetTimeStamp());
		}, isPrivate);
	}
	else
	{
		oContextMenu.AddListItem(g_oLocalization.KGS.window.userInfo.gamesArchive.contextMenu.view, function(e)
		{
			privateLoadSgfByUrl(sUrl, privateViewGame, oClient, oThis.m_oApp);
		}, isPrivate || isDemo, false);
		oContextMenu.AddListItem(g_oLocalization.KGS.window.userInfo.gamesArchive.contextMenu.download, function(e)
		{
			function privateDownload(sUrl, sSgf)
			{
				var sGameName = sUrl.substring(sUrl.lastIndexOf('/') + 1);
				var oBlob = new Blob([sSgf], {type: "text/plain;charset=utf-8"});
				Common.SaveAs(oBlob, sGameName, "application/x-go-sgf");
			}

			privateLoadSgfByUrl(sUrl, privateDownload);
		}, isPrivate || "" === sUrl);
		oContextMenu.AddListItem(g_oLocalization.KGS.window.userInfo.gamesArchive.contextMenu.loadIn, privateLoadIn, isPrivate, false);
		oContextMenu.AddListItem(g_oLocalization.KGS.window.userInfo.gamesArchive.contextMenu.loadPIn, privateLoadIn, isPrivateForMe, true);
	}

	oContextMenu.Show();
	return oContextMenu;
};

function CKGSUserInfoGamesListRecord(oClient)
{
	CKGSUserInfoGamesListRecord.superclass.constructor.call(this);

	this.m_oClient         = oClient;

	this.m_nGameType  = EKGSGameType.Free;
	this.m_nHandicap  = 0;
	this.m_nKomi      = 0;
	this.m_oBlack     = null;
	this.m_oWhite     = null;
	this.m_oOwner     = null;
	this.m_oBlack2    = null;
	this.m_oWhite2    = null;
	this.m_bPrivate   = false;
	this.m_sScore     = "";
	this.m_nSize      = 19;
	this.m_sTimeStamp = "";
	this.m_oDate      = new Date();
	this.m_bInPlay    = false;
	this.m_bAdjourned = false;
	this.m_sUrl       = "";
}

CommonExtend(CKGSUserInfoGamesListRecord, CListRecordBase);

CKGSUserInfoGamesListRecord.prototype.Draw = function(oContext, dX, dY, eType)
{
	var bResetFont = false;
	var sFont = oContext.font;
	oContext.fillStyle = "#000000";

	if (true === this.m_bInPlay)
	{
		oContext.font = "bold " + sFont;
		bResetFont    = true;
	}

	var sWplus = g_oLocalization.common.shortWhite + "+";
	var sBplus = g_oLocalization.common.shortBlack + "+";

	if ((EKGSUserInfoGameListRecord.WName === eType && -1 !== this.m_sScore.indexOf(sWplus))
		|| (EKGSUserInfoGameListRecord.BName === eType && -1 !== this.m_sScore.indexOf(sBplus)))
	{
		oContext.fillStyle = "#008272";
		bResetFont         = true;
	}

	if (true === this.m_bAdjourned)
	{
		oContext.font      = "italic " + sFont;
		oContext.fillStyle = "#AAAAAA";
		bResetFont         = true;
	}


	var sString = "";
	switch(eType)
	{
		case EKGSUserInfoGameListRecord.Type     : sString += this.private_GetGameType(); break;
		case EKGSUserInfoGameListRecord.WRank    : sString += this.private_GetWhiteRank(); break;
		case EKGSUserInfoGameListRecord.WName    : sString += this.private_GetWhiteName(); break;
		case EKGSUserInfoGameListRecord.Vs       : sString += this.private_GetVs(); break;
		case EKGSUserInfoGameListRecord.BRank    : sString += this.private_GetBlackRank(); break;
		case EKGSUserInfoGameListRecord.BName    : sString += this.private_GetBlackName(); break;
		case EKGSUserInfoGameListRecord.SizeHandi: sString += this.private_GetSizeAndHandi(); break;
		case EKGSUserInfoGameListRecord.Komi     : sString += this.private_GetKomi(); break;
		case EKGSUserInfoGameListRecord.Result   : sString += this.m_sScore; break;
		case EKGSUserInfoGameListRecord.TimeStamp: sString += this.private_GetTimeStamp(); break;
	}

	oContext.fillText(sString, dX, dY);

	if (true === bResetFont)
		oContext.font = sFont;
};
CKGSUserInfoGamesListRecord.prototype.Compare = function(sKey)
{
	if (this.m_sTimeStamp === sKey)
		return true;

	return false;
};
CKGSUserInfoGamesListRecord.prototype.Get_Key = function()
{
	return this.m_sTimeStamp;
};
CKGSUserInfoGamesListRecord.prototype.Update = function(aLine)
{
	var oArchiveRecord = aLine[2];

	this.m_nGameType  = oArchiveRecord.GetType();
	this.m_nHandicap  = oArchiveRecord.GetHandicap();
	this.m_nKomi      = oArchiveRecord.GetKomi();
	this.m_oBlack     = oArchiveRecord.GetBlack();
	this.m_oWhite     = oArchiveRecord.GetWhite();
	this.m_oOwner     = oArchiveRecord.GetOwner();
	this.m_bPrivate   = oArchiveRecord.IsPrivate();
	this.m_sScore     = oArchiveRecord.GetScore();
	this.m_nSize      = oArchiveRecord.GetBoardSize();
	this.m_sTimeStamp = oArchiveRecord.GetTimeStamp();
	this.m_oDate      = new Date(Date.parse(this.m_sTimeStamp));
	this.m_bInPlay    = oArchiveRecord.IsInPlay();
	this.m_bAdjourned = oArchiveRecord.IsAbjourned();
	this.m_sUrl       = oArchiveRecord.GetUrl();
	this.m_oBlack2    = oArchiveRecord.GetBlack2();
	this.m_oWhite2    = oArchiveRecord.GetWhite2();
};
CKGSUserInfoGamesListRecord.prototype.GetTimeStamp = function()
{
	return this.m_sTimeStamp;
};
CKGSUserInfoGamesListRecord.prototype.GetDate = function()
{
	return this.m_oDate;
};
CKGSUserInfoGamesListRecord.prototype.IsInPlay = function()
{
	return this.m_bInPlay;
};
CKGSUserInfoGamesListRecord.prototype.IsPrivate = function()
{
	return this.m_bPrivate;
};
CKGSUserInfoGamesListRecord.prototype.GetWhiteName = function()
{
	return this.private_GetWhiteName();
};
CKGSUserInfoGamesListRecord.prototype.GetWhiteRank = function()
{
	if (this.m_oOwner)
		return this.m_oOwner.GetRank();
	else if (this.m_oWhite)
		return this.m_oWhite.GetRank();
	else
		return -3;
};
CKGSUserInfoGamesListRecord.prototype.GetBlackName = function()
{
	return this.private_GetBlackName();
};
CKGSUserInfoGamesListRecord.prototype.GetBlackRank = function()
{
	if (this.m_oBlack)
		return this.m_oBlack.GetRank();
	else
		return -3;
};
CKGSUserInfoGamesListRecord.prototype.GetUrl = function()
{
	return this.m_sUrl;
};
CKGSUserInfoGamesListRecord.prototype.IsDemo = function()
{
	if (this.m_oOwner)
		return true;

	return false;
};
CKGSUserInfoGamesListRecord.prototype.CheckUserOwnership = function(oUser)
{
	if (!oUser)
		return false;

	var sName = oUser.GetName().toLowerCase();

	var sBlackName  = this.m_oBlack ? this.m_oBlack.GetName().toLowerCase() : null;
	var sWhiteName  = this.m_oWhite ? this.m_oWhite.GetName().toLowerCase() : null;
	var sOwnerName  = this.m_oOwner ? this.m_oOwner.GetName().toLowerCase() : null;
	var sBlack2Name = this.m_oBlack2 ? this.m_oBlack2.GetName().toLowerCase() : null;
	var sWhite2Name = this.m_oWhite2 ? this.m_oBlack2.GetName().toLowerCase() : null;

	if ((sBlackName && sBlackName === sName)
		|| (sWhiteName && sWhiteName === sName)
		|| (sOwnerName && sOwnerName === sName)
		|| (sBlack2Name && sBlack2Name === sName)
		|| (sWhite2Name && sWhite2Name === sName))
		return true;


	return false;
};
CKGSUserInfoGamesListRecord.prototype.private_GetGameType = function()
{
	if (true === this.m_bPrivate)
		return "P";
	else if (null !== this.m_oOwner)
		return "D";
	else if (EKGSGameType.Demonstration === this.m_nGameType || EKGSGameType.Review === this.m_nGameType || EKGSGameType.RengoReview === this.m_nGameType)
		return "D";
	else if (EKGSGameType.Free === this.m_nGameType)
		return "F";
	else if (EKGSGameType.Ranked === this.m_nGameType)
		return "R";
	else if (EKGSGameType.Teaching === this.m_nGameType)
		return "T";
	else if (EKGSGameType.Simul === this.m_nGameType)
		return "S";
	else if (EKGSGameType.Rengo === this.m_nGameType)
		return "2";
	else if (EKGSGameType.Tournament === this.m_nGameType)
		return "*";

	return "";
};
CKGSUserInfoGamesListRecord.prototype.private_GetWhiteRank = function()
{
	if (this.m_oOwner)
		return this.m_oOwner.GetStringRank();
	else if (this.m_oWhite2 && this.m_oWhite)
		return this.m_oWhite.GetStringRank() + "," + this.m_oWhite2.GetStringRank();
	else if (this.m_oWhite)
		return this.m_oWhite.GetStringRank();
	else
		return "";
};
CKGSUserInfoGamesListRecord.prototype.private_GetWhiteName = function()
{
	var sResult = "";
	if (this.m_oOwner)
	{
		sResult = this.m_oOwner.GetName();

		if (this.m_oWhite && this.m_oBlack)
			sResult +=  " (" + this.m_oWhite.GetName() + "[" + this.m_oWhite.GetStringRank() + "] vs. " +  this.m_oBlack.GetName() + "[" + this.m_oBlack.GetStringRank() + "])";
	}
	else if (this.m_oWhite2 && this.m_oWhite)
	{
		sResult = this.m_oWhite.GetName() + ", " + this.m_oWhite2.GetName();
	}
	else if (this.m_oWhite)
	{
		sResult = this.m_oWhite.GetName();
	}

	return sResult;
};
CKGSUserInfoGamesListRecord.prototype.private_GetVs = function()
{
	if (null === this.m_oOwner && this.m_oBlack && this.m_oWhite)
		return "vs.";

	return "";
};
CKGSUserInfoGamesListRecord.prototype.private_GetBlackRank = function()
{
	if (null === this.m_oOwner)
	{
		if (this.m_oBlack2 && this.m_oBlack)
			return this.m_oBlack.GetStringRank() + "," + this.m_oBlack2.GetStringRank();
		if (this.m_oBlack)
			return this.m_oBlack.GetStringRank();
	}

	return "";
};
CKGSUserInfoGamesListRecord.prototype.private_GetBlackName = function()
{
	if (null === this.m_oOwner)
	{
		if (this.m_oBlack && this.m_oBlack2)
			return this.m_oBlack.GetName() + ", " + this.m_oBlack2.GetName();
		else if (this.m_oBlack)
			return this.m_oBlack.GetName();
	}

	return "";
};
CKGSUserInfoGamesListRecord.prototype.private_GetSizeAndHandi = function()
{
	var sResult = "" + this.m_nSize + "x" + this.m_nSize;
	if (this.m_nHandicap > 1)
		sResult += " H" + this.m_nHandicap;

	return sResult;
};
CKGSUserInfoGamesListRecord.prototype.private_GetKomi = function()
{
	return "" + this.m_nKomi;
};
CKGSUserInfoGamesListRecord.prototype.private_GetTimeStamp = function()
{
	return this.m_oDate.toLocaleString(g_oLocalization.locale);
};

function CVisualUserInfoTabs()
{
	CVisualUserInfoTabs.superclass.constructor.call(this);
}
CommonExtend(CVisualUserInfoTabs, CVisualTabs);

function CVisualUserInfoTab(oWindow)
{
	this.m_oParent = null;
	this.m_nId     = -1;
	this.m_oTabDiv = null;

	this.m_oPageDiv = null;
	this.m_oWindow  = oWindow;
}
CVisualUserInfoTab.prototype.Init = function(nId, oPageDiv, sTabName)
{
	this.m_nId = nId;
	this.m_oPageDiv = oPageDiv;
	this.private_InitTab(sTabName);
};
CVisualUserInfoTab.prototype.GetId = function()
{
	return this.m_nId;
};
CVisualUserInfoTab.prototype.SetParent = function(oParent)
{
	this.m_oParent = oParent;
};
CVisualUserInfoTab.prototype.GetDiv = function()
{
	return this.m_oTabDiv;
};
CVisualUserInfoTab.prototype.OnClick = function()
{
	if (!this.m_oParent)
		return;

	var oOldTab = this.m_oParent.OnClick(this);
	if (oOldTab)
	{
		oOldTab.m_oBackDiv.style.borderTop   = "1px solid #BEBEBE";
		oOldTab.m_oBackDiv.style.borderRight = "1px solid #BEBEBE";
		oOldTab.m_oBackDiv.style.borderLeft  = "1px solid transparent";

		oOldTab.m_oTabDiv.style.borderBottom = "1px solid #BEBEBE";
		oOldTab.m_oTabDiv.style.borderTop    = "3px solid #F3F3F3";

		oOldTab.m_oPageDiv.style.display = "none";
	}

	this.m_oBackDiv.style.borderTop          = "1px solid rgb(0, 130, 114)";
	this.m_oBackDiv.style.borderRight        = "1px solid rgb(0, 130, 114)";
	this.m_oBackDiv.style.borderLeft         = "1px solid rgb(0, 130, 114)";

	this.m_oTabDiv.style.borderBottom = "1px solid #F3F3F3";
	this.m_oTabDiv.style.borderTop    = "3px solid rgb(0, 130, 114)";

	this.m_oPageDiv.style.display = "block";
	this.m_oWindow.Update_Size(true);
};
CVisualUserInfoTab.prototype.private_InitTab = function(sTabName)
{
	var oThis      = this;
	this.m_oTabDiv = document.createElement("div");
	var sHeight    = "21px";

	var oBackDiv               = document.createElement("div");
	oBackDiv.style.position    = "absolute";
	oBackDiv.style.top         = "-4px";
	oBackDiv.style.left        = "-1px";
	oBackDiv.style.right       = "-1px";
	oBackDiv.style.height      = "3px";
	oBackDiv.style.borderTop   = "1px solid #BEBEBE";
	oBackDiv.style.borderRight = "1px solid #BEBEBE";
	oBackDiv.style.borderLeft  = "1px solid transparent";

	this.m_oBackDiv = oBackDiv;

	this.m_oTabDiv.appendChild(oBackDiv);


	var DivTab                      = this.m_oTabDiv;
	DivTab.style.overflow           = "visible";
	DivTab.style.position           = "relative";
	DivTab["aria-label"]            = sTabName;
	DivTab.title                    = sTabName;
	DivTab.style.transitionProperty = "width,height,background,margin,border,padding";
	DivTab.style.transitionDuration = ".25s";
	DivTab.style.float              = "left";
	DivTab.style.height             = sHeight;
	DivTab.style.minWidth           = this.m_nMinWidth + "px";
	DivTab.style.margin             = "0px";
	DivTab.style.padding            = "0px";
	DivTab.style.color              = "#000";
	DivTab.style.whiteSpace         = "nowrap";
	DivTab.style.textOverflow       = "ellipsis";
	DivTab.style.borderTop          = "3px solid transparent";
	DivTab.style.borderRight        = "1px solid #BEBEBE";
	DivTab.style.borderBottom       = "1px solid #BEBEBE";
	DivTab.addEventListener("selectstart", function()
	{
		return false;
	}, false);

	var NewTab                             = document.createElement("button");
	NewTab.tabIndex                        = "0";
	NewTab.style.transitionProperty        = "all";
	NewTab.style.transitionDuration        = ".25s";
	NewTab.style.background                = "none";
	NewTab.style.outline                   = "none";
	NewTab.style.cursor                    = "pointer";
	NewTab.style["-webkit-appearance"]     = "none";
	NewTab.style["-webkit-border-radius"]  = "0";
	NewTab.style.overflow                  = "visible";
	NewTab.style.fontFamily                = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
	NewTab.style["-webkit-font-smoothing"] = "antialiased";
	NewTab.style.padding                   = "0px";
	NewTab.style.border                    = "1px solid transparent";
	NewTab.style.boxSizing                 = "border-box";
	NewTab.style.fontSize                  = "14px";
	NewTab.style.lineHeight                = "20px";
	NewTab.style.height                    = "100%";
	NewTab.style.margin                    = "0px";
	NewTab.style.padding                   = "0px 14px 0px 14px";
	NewTab.style.maxWidth                  = "200px";
	NewTab.style.overflow                  = "hidden";
	NewTab.style.float                     = "left";
	NewTab.addEventListener("click", function()
	{
		oThis.OnClick();
	});

	var NewTabDiv = document.createElement("div");
	NewTabDiv.style.textAlign = "left";
	var oCaptionDiv = document.createElement("div");
	if (true === this.m_bPrivateChat)
	{
		oCaptionDiv.style.fontWeight = "bold";
		oCaptionDiv.style.color      = "#008272";
	}
	oCaptionDiv.innerHTML = sTabName;
	NewTabDiv.appendChild(oCaptionDiv);
	NewTabDiv.addEventListener("selectstart", function()
	{
		return false;
	}, false);
	NewTab.appendChild(NewTabDiv);
	DivTab.appendChild(NewTab);

	DivTab.visualTab = this;
	this.m_oTabDiv = DivTab;
};

function CKGSSgfViewerWindow()
{
	CKGSSgfViewerWindow.superclass.constructor.call(this);

	this.m_oGameTree = null;
}
CommonExtend(CKGSSgfViewerWindow, CKGSWindowBase);
CKGSSgfViewerWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSSgfViewerWindow.superclass.Init.call(this, sDivId, oPr, false);

	this.Set_Caption("");

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;


	var sEmbedConfig = {
		"viewPort"  : undefined,
		"moveNumber": 0,
		"boardMode" : "viewer",
		"width"     : 700,
		"sgfData"   : oPr.Sgf
	};

	this.m_oGameTree = GoBoardApi.Embed(sDivId, sEmbedConfig);

	var oCaptionElement = document.getElementById(sDivId + "GBI");
	Common_DragHandler.Init(oCaptionElement, null);
	var oThis = this;
	oCaptionElement.onDrag  = function (X, Y)
	{
		var CurLeft = parseInt(oThis.HtmlElement.Control.HtmlElement.style.left);
		var CurTop  = parseInt(oThis.HtmlElement.Control.HtmlElement.style.top);

		var LeftHandler = parseInt(oCaptionElement.style.left);
		var TopHandler  = parseInt(oCaptionElement.style.top);

		oThis.HtmlElement.Control.HtmlElement.style.left = CurLeft + LeftHandler + "px";
		oThis.HtmlElement.Control.HtmlElement.style.top  = CurTop + TopHandler + "px";

		oCaptionElement.style.left = "0px";
		oCaptionElement.style.top  = "0px";
		oThis.Update_Size();
	};

	// CloseButton
	var sCloseButtonId                        = sDivId + "_Close2";
	var oCloseButtonElement                   = this.protected_CreateDivElement(oCaptionElement, sCloseButtonId);
	var oCloseButtonControl                   = CreateControlContainer(sCloseButtonId);
	oCloseButtonControl.Bounds.SetParams(0, 0, 6, 1000, false, true, true, false, 45, 20);
	oCloseButtonControl.Anchor                = (g_anchor_top | g_anchor_right);
	this.HtmlElement.Control.AddControl(oCloseButtonControl);
	oCloseButtonElement.style.backgroundColor = (new CColor(255, 0, 0, 255)).ToString();

	var oCloseButton             = new CDrawingButtonClose(this.m_oDrawing);
	oCloseButton.Init(sCloseButtonId, this);
	oCloseButton.m_oNormaFColor  = new CColor(199, 80, 80, 255);
	oCloseButton.m_oHoverFColor  = new CColor(224, 67, 67, 255);
	oCloseButton.m_oActiveFColor = new CColor(153, 61, 61, 255);

	this.HtmlElement.CloseButton = oCloseButton;

};
CKGSSgfViewerWindow.prototype.Get_DefaultWindowSize = function(bForce)
{
	return {W : 702, H : 763};
};
CKGSSgfViewerWindow.prototype.Close = function()
{
	CKGSSgfViewerWindow.superclass.Close.call(this);
	RemoveWindow(this);
};

function CKGSUserInfoGameArchiveRecord(oClient, oRecord)
{
	this.m_oClient = oClient;

	this.m_nGameType      = EKGSGameType.Free;
	this.m_nHandicap      = 0;
	this.m_nKomi          = 0;
	this.m_oBlack         = null;
	this.m_oWhite         = null;
	this.m_oOwner         = null;
	this.m_oBlack2        = null;
	this.m_oWhite2        = null;
	this.m_bPrivate       = false;
	this.m_sScore         = "";
	this.m_sScoreOriginal = "";
	this.m_nSize          = 19;
	this.m_sTimeStamp     = "";
	this.m_oDate          = new Date();
	this.m_bInPlay        = false;
	this.m_bAdjourned     = false;
	this.m_sUrl           = "";

	this.Parse(oRecord);
}
CKGSUserInfoGameArchiveRecord.prototype.Parse = function(oRecord)
{
	this.private_ParseGameType(oRecord.gameType);
	this.m_nHandicap = oRecord.handicap ? parseInt(oRecord.handicap) : 0;
	this.m_nKomi     = oRecord.komi ? parseFloat(oRecord.komi) : 0;
	this.m_oBlack    = null;
	this.m_oWhite    = null;
	this.m_oOwner    = null;
	this.m_oBlack2   = null;
	this.m_oWhite2   = null;

	if (oRecord.players)
	{
		if (oRecord.players.black)
			this.m_oBlack = GetKGSUser(oRecord.players.black, this.m_oClient);

		if (oRecord.players.white)
			this.m_oWhite = GetKGSUser(oRecord.players.white, this.m_oClient);

		if (oRecord.players.owner)
			this.m_oOwner = GetKGSUser(oRecord.players.owner, this.m_oClient);

		if (oRecord.players.black_2)
			this.m_oBlack2 = GetKGSUser(oRecord.players.black_2, this.m_oClient);

		if (oRecord.players.white_2)
			this.m_oWhite2 = GetKGSUser(oRecord.players.white_2, this.m_oClient);
	}

	this.m_bPrivate       = true === oRecord.private ? true : false;
	this.m_sScore         = oRecord.score ? this.m_oClient.private_ParseScore(oRecord.score) : "";
	this.m_sScoreOriginal = oRecord.score;
	this.m_nSize          = oRecord.size ? parseInt(oRecord.size) : 19;
	this.m_sTimeStamp     = oRecord.timestamp;
	this.m_oDate          = new Date(Date.parse(this.m_sTimeStamp));
	this.m_bInPlay        = true === oRecord.inPlay ? true : false;

	this.private_ParseAbjourned(oRecord.score);
	this.private_ParseUrl(oRecord.revision);
};
CKGSUserInfoGameArchiveRecord.prototype.private_ParseGameType = function(sGameType)
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
CKGSUserInfoGameArchiveRecord.prototype.private_ParseAbjourned = function(sScore)
{
	if (true !== this.m_bInPlay
		&& true !== this.m_bPrivate
		&& EKGSGameType.Challenge !== this.m_nGameType
		&& EKGSGameType.Demonstration !== this.m_nGameType
		&& EKGSGameType.Review !== this.m_nGameType
		&& EKGSGameType.RengoReview !== this.m_nGameType
		&& "UNFINISHED" === sScore)
		this.m_bAdjourned = true;
	else
		this.m_bAdjourned = false;
};
CKGSUserInfoGameArchiveRecord.prototype.private_ParseUrl = function(nRevision)
{
	// http://files.gokgs.com/games/year/month/day/white-black-revision.sgf

	var sUrl = "http://files.gokgs.com/games/";

	var sYear  = this.m_oDate.getUTCFullYear();
	var sMonth = this.m_oDate.getUTCMonth() + 1;
	var sDay   = this.m_oDate.getUTCDate();

	var sPlayers = "";
	if (this.m_oOwner)
	{
		sPlayers = this.m_oOwner.GetName();
	}
	else if (this.m_oWhite2 && this.m_oBlack2 && this.m_oWhite && this.m_oBlack)
	{
		sPlayers = this.m_oWhite.GetName() + "-" + this.m_oWhite2.GetName() + "-" + this.m_oBlack.GetName() + "-" + this.m_oBlack2.GetName();
	}
	else if (this.m_oWhite && this.m_oBlack)
	{
		sPlayers = this.m_oWhite.GetName() + "-" + this.m_oBlack.GetName();
	}
	else
	{
		this.m_sUrl = "";
		return;
	}

	sUrl += sYear + '/' + sMonth + '/' + sDay + '/' + sPlayers + (undefined !== nRevision ? '-' + (nRevision + 1) : "") + ".sgf";

	this.m_sUrl = sUrl;
};
CKGSUserInfoGameArchiveRecord.prototype.GetType = function()
{
	return this.m_nGameType;
};
CKGSUserInfoGameArchiveRecord.prototype.GetTimeStamp = function()
{
	return this.m_sTimeStamp;
};
CKGSUserInfoGameArchiveRecord.prototype.GetBlackName = function()
{
	if (this.m_oBlack)
		return this.m_oBlack.GetName();

	return "";
};
CKGSUserInfoGameArchiveRecord.prototype.GetWhiteName = function()
{
	if (this.m_oWhite)
		return this.m_oWhite.GetName();

	return "";
};
CKGSUserInfoGameArchiveRecord.prototype.GetScore = function()
{
	return this.m_sScore;
};
CKGSUserInfoGameArchiveRecord.prototype.IsBlackWon = function()
{
	var sScore = "" + this.m_sScoreOriginal;

	var bBlackWon = false;

	if (-1 !== sScore.indexOf("B+"))
		bBlackWon = true;
	else if (-1 !== sScore.indexOf("W+"))
		bBlackWon = false;
	else if (-1 !== sScore.indexOf("UNFINISHED"))
		bBlackWon = null;
	else
	{
		var dScore = parseFloat(sScore);
		if (dScore < 0)
			bBlackWon = false;
		else
			bBlackWon = true;
	}

	return bBlackWon;
};
CKGSUserInfoGameArchiveRecord.prototype.IsWhiteWon = function()
{
	var bBlackWon = this.IsBlackWon();

	if (null == bBlackWon)
		return null;

	return !bBlackWon;
};
CKGSUserInfoGameArchiveRecord.prototype.GetHandicap = function()
{
	return this.m_nHandicap;
};
CKGSUserInfoGameArchiveRecord.prototype.GetKomi = function()
{
	return this.m_nKomi;
};
CKGSUserInfoGameArchiveRecord.prototype.GetBlack = function()
{
	return this.m_oBlack;
};
CKGSUserInfoGameArchiveRecord.prototype.GetWhite = function()
{
	return this.m_oWhite;
};
CKGSUserInfoGameArchiveRecord.prototype.GetOwner = function()
{
	return this.m_oOwner;
};
CKGSUserInfoGameArchiveRecord.prototype.GetBlack2 = function()
{
	return this.m_oBlack2;
};
CKGSUserInfoGameArchiveRecord.prototype.GetWhite2 = function()
{
	return this.m_oWhite2;
};
CKGSUserInfoGameArchiveRecord.prototype.GetBoardSize = function()
{
	return this.m_nSize;
};
CKGSUserInfoGameArchiveRecord.prototype.IsPrivate = function()
{
	return this.m_bPrivate;
};
CKGSUserInfoGameArchiveRecord.prototype.IsInPlay = function()
{
	return this.m_bInPlay;
};
CKGSUserInfoGameArchiveRecord.prototype.IsAbjourned = function()
{
	return this.m_bAdjourned;
};
CKGSUserInfoGameArchiveRecord.prototype.GetUrl = function()
{
	return this.m_sUrl;
};
CKGSUserInfoGameArchiveRecord.prototype.GetLabel = function()
{
	if (this.m_oWhite && this.m_oBlack)
	{
		var sResult = this.m_oWhite.GetName() + "[" + this.m_oWhite.GetStringRank() + "]" + " vs. " + this.m_oBlack.GetName() + "[" + this.m_oBlack.GetStringRank() + "]";
		var sScore = this.GetScore();

		if ("" !== sScore)
			sResult += " " + sScore;

		return sResult;
	}

	return "";
};

function privateLoadSgfByUrl(sUrl, fCallBack, oClient, oApp)
{
	sUrl        = decodeURIComponent(sUrl);
	var rawFile = new XMLHttpRequest();
	rawFile["open"]("GET", sUrl + '?_=' + new Date().getTime(), false);

	rawFile["onreadystatechange"] = function ()
	{
		if (rawFile["readyState"] === 4)
		{
			if (rawFile["status"] === 200 || rawFile["status"] == 0)
			{
				fCallBack(sUrl, rawFile.responseText, oClient, oApp);
			}
		}
	};
	rawFile["send"](null);
}

function privateViewGame(sUrl, sSgf, oClient, oApp)
{
	var oWindow = CreateKGSWindow(EKGSWindowType.SgfViewer, {Client : oClient, App : oApp, Url : sUrl, Sgf : sSgf});
	oWindow.Focus();
}