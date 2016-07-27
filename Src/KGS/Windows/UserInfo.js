"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     03.06.2016
 * Time     22:54
 */

function CKGSUserInfoWindow()
{
	CKGSUserInfoWindow.superclass.constructor.call(this);

	this.m_sUserName      = "";
	this.m_oClient        = null;
	this.m_oContainerDiv  = null;
	this.m_oInfoScroll    = null;
	this.m_oGamesListView = new CListView();
}
CommonExtend(CKGSUserInfoWindow, CKGSWindowBase);

CKGSUserInfoWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSUserInfoWindow.superclass.Init.apply(this, arguments);

	if (oPr)
	{
		this.m_sUserName = oPr.UserName;
		this.m_oClient   = oPr.Client;
	}

	this.Set_Caption(this.m_sUserName);

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	oMainDiv.style.fontSize = "16px";
	oMainDiv.className += " Selectable";
	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";

	var sInfoWrapperId  = sDivId + "I";
	var sGamesWrapperId = sDivId + "G";
	var sRankWrapperId  = sDivId + "R";

	var oInfoDivWrapper = this.protected_CreateDivElement(oMainDiv, sInfoWrapperId);
	var oInfoDifWrapperControl = CreateControlContainer(sInfoWrapperId);
	oInfoDifWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
	oInfoDifWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	oMainControl.AddControl(oInfoDifWrapperControl);

	var oGamesDivWrapper = this.protected_CreateDivElement(oMainDiv, sGamesWrapperId);
	var oGamesDifWrapperControl = CreateControlContainer(sGamesWrapperId);
	oGamesDifWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
	oGamesDifWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	oMainControl.AddControl(oGamesDifWrapperControl);

	// var oRankDivWrapper = this.protected_CreateDivElement(oMainDiv, sRankWrapperId);
	// var oRankDifWrapperControl = CreateControlContainer(sRankWrapperId);
	// oRankDifWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
	// oRankDifWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	// oMainControl.AddControl(oRankDifWrapperControl);


	this.private_CreateInfoPage(oInfoDivWrapper, oInfoDifWrapperControl);
	this.private_CreateGamesPage(oGamesDivWrapper, oGamesDifWrapperControl);

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
};
CKGSUserInfoWindow.prototype.Hide = function()
{
	CKGSUserInfoWindow.superclass.Close.call(this);
};
CKGSUserInfoWindow.prototype.Update_Size = function(bForce)
{
	CKGSUserInfoWindow.superclass.Update_Size.call(this, bForce);

	if (this.m_oInfoScroll)
		this.m_oInfoScroll.CheckVisibility();

	if (this.m_oGamesListView)
		this.m_oGamesListView.Update_Size();
};
CKGSUserInfoWindow.prototype.OnUserDetails = function(oDetails)
{
	if (oDetails)
	{
		var oUser = this.m_oClient.private_HandleUserRecord(oDetails.user, true);
		this.m_sUserName = oUser.GetName();
		this.private_SetCaption(this.m_sUserName, oUser.IsOnline());

		if (oUser.HasAvatar())
			this.OnUserAvatar();

		this.private_AddConsoleMessage("UserName", oUser.GetName());
		this.private_AddConsoleMessage("Rank", oUser.GetStringRank());


		if (oUser.IsOnline())
		{
			this.private_AddConsoleMessage("Last on", "online");
		}
		else
		{
			var oTimeStamp = new CTimeStamp(oDetails.lastOn);
			this.private_AddConsoleMessage("Last on", oTimeStamp.GetDifferenceString() + " (" + oTimeStamp.ToLocaleString() + ")");
		}


		this.private_AddConsoleMessage("Locale", oDetails.locale);
		this.private_AddConsoleMessage("Name", oDetails.personalName);

		this.private_AddInfo(oDetails.personalInfo);
	}
};
CKGSUserInfoWindow.prototype.OnUserAvatar = function()
{
	var oImg = document.createElement("img");
	oImg.style.float  = "right";
	oImg.style.width  = "141px";
	oImg.style.height = "200px";
	oImg.src          = "http://goserver.gokgs.com/avatars/" + this.m_sUserName + ".jpg";
	this.m_oAvatarDiv.appendChild(oImg);
};
CKGSUserInfoWindow.prototype.OnUserGameArchive = function(oMessage)
{
	var arrGames = oMessage.games;
	if (!arrGames)
		return;

	var nWins = 0, nLoses = 0, nUnfinished = 0;

	var nRecentGamesCount = 20;
	var sRecentGames = "";

	var sUserName = this.m_sUserName.toLocaleLowerCase();

	this.m_oGamesListView.Clear();
	for (var nIndex = arrGames.length - 1; nIndex >= 0; --nIndex)
	{
		var oGame  = arrGames[nIndex];
		var sType  = oGame.gameType;

		if ("ranked" === sType || "free" === sType)
		{
			var sBlack = oGame.players.black.name.toLowerCase();
			var sWhite = oGame.players.white.name.toLowerCase();
			var sScore = "" + oGame.score;

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

			if (null === bBlackWon)
			{
				nUnfinished++;
			}
			else if ((true === bBlackWon && sBlack === sUserName)
				|| (true !== bBlackWon && sWhite === sUserName))
			{
				nWins++;

				if (nRecentGamesCount > 0)
				{
					sRecentGames += "W";
					nRecentGamesCount--;
				}
			}
			else
			{
				nLoses++;
				if (nRecentGamesCount > 0)
				{
					sRecentGames += "L";
					nRecentGamesCount--;
				}
			}
		}

		this.m_oGamesListView.Handle_Record([0, oGame.timestamp, oGame]);
	}

	this.m_oGamesListView.Update_Size();

	this.private_AddConsoleMessage("Games", "" + nWins + "-" + nLoses + "-" + nUnfinished);
	this.private_AddConsoleMessage("Recent games", sRecentGames);
};
CKGSUserInfoWindow.prototype.OnRankGraph = function(arrRankData)
{
	console.log(arrRankData);
};
CKGSUserInfoWindow.prototype.Show = function(oPr)
{
	CKGSUserInfoWindow.superclass.Show.call(this, oPr);

	if (this.m_oInfoScroll)
		this.m_oInfoScroll.CheckVisibility();
};
CKGSUserInfoWindow.prototype.private_AddMainInfo = function(oDetails)
{
	var oDiv = this.m_oMainInfoDiv;

	this.m_oMainInfoTable = document.createElement("table");


	oDiv.appendChild(this.m_oMainInfoTable);
};
CKGSUserInfoWindow.prototype.private_AddConsoleMessage = function(sField, sText)
{
	var oTable = this.m_oMainInfoTable;

	var oRow = document.createElement("tr");
	oTable.appendChild(oRow);

	var oCell = document.createElement("td");
	oRow.appendChild(oCell);

	var oTextSpan              = document.createElement("span");
	oTextSpan.style.fontWeight = "bold";
	oTextSpan.style.fontStyle  = "italic";
	oTextSpan.textContent      = sField + ": ";
	oCell.appendChild(oTextSpan);

	oCell = document.createElement("td");
	oRow.appendChild(oCell);


	oTextSpan             = document.createElement("span");
	oTextSpan.textContent = sText;
	oCell.appendChild(oTextSpan);
};
CKGSUserInfoWindow.prototype.private_AddInfo = function(sText)
{
	var oDiv = this.m_oExtensionDiv;

	var oTextDiv = document.createElement("div");
	oTextDiv.style.height = "100%";

	var oTextSpan;

	oTextSpan                  = document.createElement("div");
	oTextSpan.style.fontWeight = "bold";
	oTextSpan.style.fontStyle  = "italic";
	oTextSpan.textContent      = "Info: ";
	oTextDiv.appendChild(oTextSpan);

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

	this.m_oInfoScroll = new CVerticalScroll();
	this.m_oInfoScroll.Init(oTextDiv, "VerScroll", "VerScrollActive", true);
	this.m_oInfoScroll.SetPaddings(0, 2, 1);

	return oTextDiv;
};
CKGSUserInfoWindow.prototype.private_SetCaption = function(sCaption, bOnline)
{
	if (bOnline)
		this.HtmlElement.CaptionText.innerHTML = "\<span\>" + sCaption + "\<\/span\>" + "\<span style='position:absolute;left:0px;color:rgb(0,130,57)'\>&#x2600;\<\/span\>";
	else
		this.HtmlElement.CaptionText.innerHTML = "\<span\>" + sCaption + "\<\/span\>" + "\<span style='position:absolute;left:0px;color:rgb(199,40,40)'\>&#x26C5;\<\/span\>";
};
CKGSUserInfoWindow.prototype.private_CreateInfoPage = function(oDiv, oControl)
{
	var sDivId = oDiv.id;

	var sMainInfo  = sDivId + "M";
	var sAvatar    = sDivId + "A";
	var sExtension = sDivId + "E";

	this.m_oMainInfoDiv = this.protected_CreateDivElement(oDiv, sMainInfo);
	var oMainInfoControl = CreateControlContainer(sMainInfo);
	oMainInfoControl.Bounds.SetParams(5, 5, 155, 0, true, true, true, false, -1, 200);
	oMainInfoControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oControl.AddControl(oMainInfoControl);

	this.m_oAvatarDiv = this.protected_CreateDivElement(oDiv, sAvatar);
	var oAvatarControl = CreateControlContainer(sAvatar);
	oAvatarControl.Bounds.SetParams(0, 5, 5, 0, false, true, true, false, 150, 200);
	oAvatarControl.Anchor = (g_anchor_top | g_anchor_right);
	oControl.AddControl(oAvatarControl);

	this.m_oExtensionDiv = this.protected_CreateDivElement(oDiv, sExtension);
	var oExtensionControl = CreateControlContainer(sExtension);
	oExtensionControl.Bounds.SetParams(5, 205, 5, 5, true, true, true, true, -1, -1);
	oExtensionControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	oControl.AddControl(oExtensionControl);

	this.private_AddMainInfo();
};
CKGSUserInfoWindow.prototype.private_CreateGamesPage = function(oDiv, oControl)
{
	var sGameViewId = oDiv.id + "L";

	var oGamesDiv = this.protected_CreateDivElement(oDiv, sGameViewId);
	var oGamesListControl = this.m_oGamesListView.Init(sGameViewId, new CKGSUserInfoGamesList(this.m_oApp));
	oGamesListControl.Bounds.SetParams(0, 0, 2, 0, true, false, true, true, -1, -1);
	oGamesListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oGamesListControl.HtmlElement.style.background = "#F3F3F3";
	oControl.AddControl(oGamesListControl);
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
		1     : "Kind",
		2     : "wr",
		3     : "White",
		4     : "",
		5     : "br",
		6     : "Black",
		7     : "",
		8     : "Komi",
		9     : "Result",
		10    : "Date"
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
		if (oRecord1.m_nWhiteRank < oRecord2.m_nWhiteRank)
			return -1;
		else if (oRecord1.m_nWhiteRank > oRecord2.m_nWhiteRank)
			return 1;
	}
	else if (-EKGSUserInfoGameListRecord.WRank === SortType)
	{
		if (oRecord1.m_nWhiteRank < oRecord2.m_nWhiteRank)
			return 1;
		else if (oRecord1.m_nWhiteRank > oRecord2.m_nWhiteRank)
			return -1;
	}
	else if (EKGSUserInfoGameListRecord.WName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sWhiteName, oRecord2.m_sWhiteName) < 0)
			return -1;
		else if (Common.Compare_Strings(oRecord1.m_sWhiteName, oRecord2.m_sWhiteName) > 0)
			return 1;
	}
	else if (-EKGSUserInfoGameListRecord.WName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sWhiteName, oRecord2.m_sWhiteName) < 0)
			return 1;
		else if (Common.Compare_Strings(oRecord1.m_sWhiteName, oRecord2.m_sWhiteName) > 0)
			return -1;
	}
	else if (EKGSUserInfoGameListRecord.BRank === SortType)
	{
		if (oRecord1.m_nBlackRank < oRecord2.m_nBlackRank)
			return -1;
		else if (oRecord1.m_nBlackRank > oRecord2.m_nBlackRank)
			return 1;
	}
	else if (-EKGSUserInfoGameListRecord.BRank === SortType)
	{
		if (oRecord1.m_nBlackRank < oRecord2.m_nBlackRank)
			return 1;
		else if (oRecord1.m_nBlackRank > oRecord2.m_nBlackRank)
			return -1;
	}
	else if (EKGSUserInfoGameListRecord.BName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sBlackName, oRecord2.m_sBlackName) < 0)
			return -1;
		else if (Common.Compare_Strings(oRecord1.m_sBlackName, oRecord2.m_sBlackName) > 0)
			return 1;
	}
	else if (-EKGSUserInfoGameListRecord.BName === SortType)
	{
		if (Common.Compare_Strings(oRecord1.m_sBlackName, oRecord2.m_sBlackName) < 0)
			return 1;
		else if (Common.Compare_Strings(oRecord1.m_sBlackName, oRecord2.m_sBlackName) > 0)
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
		return -1;
	else if (oRecord1.GetDate() > oRecord2.GetDate())
		return 1;

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
	if (true === oRecord.IsInPlay())
	{
		var oClient = this.m_oApp.GetClient();
		if (!oClient)
			return;

		oClient.EnterGameRoomByTimeStamp(oRecord.GetTimeStamp());
	}
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
	this.m_bPrivate   = false;
	this.m_sScore     = "";
	this.m_nSize      = 19;
	this.m_sTimeStamp = "";
	this.m_oDate      = new Date();
	this.m_bInPlay    = false;
	this.m_bAdjourned = false;
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

	if ((EKGSUserInfoGameListRecord.WName === eType && -1 !== this.m_sScore.indexOf("W+"))
		|| (EKGSUserInfoGameListRecord.BName === eType && -1 !== this.m_sScore.indexOf("B+")))
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
	var oRecord = aLine[2];

	this.private_ParseGameType(oRecord.gameType);
	this.m_nHandicap = oRecord.handicap ? parseInt(oRecord.handicap) : 0;
	this.m_nKomi     = oRecord.komi ? parseFloat(oRecord.komi) : 0;
	this.m_oBlack    = null;
	this.m_oWhite    = null;
	this.m_oOwner    = null;

	if (oRecord.players)
	{
		if (oRecord.players.black)
		{
			this.m_oBlack = new CKGSUser(this.m_oClient);
			this.m_oBlack.Update(oRecord.players.black);
		}

		if (oRecord.players.white)
		{
			this.m_oWhite = new CKGSUser(this.m_oClient);
			this.m_oWhite.Update(oRecord.players.white);
		}

		if (oRecord.players.owner)
		{
			this.m_oOwner = new CKGSUser(this.m_oClient);
			this.m_oOwner.Update(oRecord.players.owner);
		}
	}

	this.m_bPrivate   = true === oRecord.private ? true : false;
	this.m_sScore     = oRecord.score ? this.m_oClient.private_ParseScore(oRecord.score) : "";
	this.m_nSize      = oRecord.size ? parseInt(oRecord.size) : 19;
	this.m_sTimeStamp = oRecord.timestamp;
	this.m_oDate      = new Date(Date.parse(this.m_sTimeStamp));
	this.m_bInPlay    = true === oRecord.inPlay ? true : false;

	this.private_ParseAbjourned(oRecord.score);
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
CKGSUserInfoGamesListRecord.prototype.private_ParseGameType = function(sGameType)
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
	if (null === this.m_oOwner && this.m_oBlack)
		return this.m_oBlack.GetStringRank();

	return "";
};
CKGSUserInfoGamesListRecord.prototype.private_GetBlackName = function()
{
	if (null === this.m_oOwner && this.m_oBlack)
		return this.m_oBlack.GetName();

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
	return this.m_oDate.toLocaleString();
};
CKGSUserInfoGamesListRecord.prototype.private_ParseAbjourned = function(sScore)
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





