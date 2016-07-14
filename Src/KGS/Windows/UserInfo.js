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

	this.m_sUserName = "";
	this.m_oClient   = null;

	this.m_oContainerDiv = null;
	this.m_oInfoScroll   = null;
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

	var oRankDivWrapper = this.protected_CreateDivElement(oMainDiv, sRankWrapperId);
	var oRankDifWrapperControl = CreateControlContainer(sRankWrapperId);
	oRankDifWrapperControl.Bounds.SetParams(0, 25, 0, 0, true, true, true, true, -1, -1);
	oRankDifWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	oMainControl.AddControl(oRankDifWrapperControl);


	this.private_CreateInfoPage(oInfoDivWrapper, oInfoDifWrapperControl);
	this.private_CreateInfoPage(oGamesDivWrapper, oGamesDifWrapperControl);

};
CKGSUserInfoWindow.prototype.Get_DefaultWindowSize = function(bForce)
{
	return {W : 500, H : 600};
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
	}

	this.private_AddConsoleMessage("Games", "" + nWins + "-" + nLoses + "-" + nUnfinished);
	this.private_AddConsoleMessage("Recent games", sRecentGames);
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
	var sMainInfo  = sInfoWrapperId + "M";
	var sAvatar    = sInfoWrapperId + "A";
	var sExtension = sInfoWrapperId + "E";

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
	
};
