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

	var sMainInfo  = sDivId + "M";
	var sAvatar    = sDivId + "A";
	var sExtension = sDivId + "E";

	this.m_oMainInfoDiv = this.protected_CreateDivElement(oMainDiv, sMainInfo);
	var oMainInfoControl = CreateControlContainer(sMainInfo);
	oMainInfoControl.Bounds.SetParams(5, 5, 155, 0, true, true, true, false, -1, 200);
	oMainInfoControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oMainControl.AddControl(oMainInfoControl);

	this.m_oAvatarDiv = this.protected_CreateDivElement(oMainDiv, sAvatar);
	var oAvatarControl = CreateControlContainer(sAvatar);
	oAvatarControl.Bounds.SetParams(0, 5, 5, 0, false, true, true, false, 150, 200);
	oAvatarControl.Anchor = (g_anchor_top | g_anchor_right);
	oMainControl.AddControl(oAvatarControl);

	this.m_oExtensionDiv = this.protected_CreateDivElement(oMainDiv, sExtension);
	var oExtensionControl = CreateControlContainer(sExtension);
	oExtensionControl.Bounds.SetParams(5, 205, 5, 5, true, true, true, true, -1, -1);
	oExtensionControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left | g_anchor_bottom);
	oMainControl.AddControl(oExtensionControl);

	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";

	this.private_AddMainInfo();
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
CKGSUserInfoWindow.prototype.OnUserDetails = function(oDetails)
{
	if (oDetails)
	{
		this.m_sUserName = oDetails.user.name;
		this.Set_Caption(this.m_sUserName);

		if (-1 !== oDetails.user.flags.indexOf("a"))
			this.OnUserAvatar();

		this.private_AddConsoleMessage("UserName", oDetails.user.name);
		this.private_AddConsoleMessage("Rank", oDetails.user.rank ? oDetails.user.rank : "-");
		this.private_AddConsoleMessage("Last on", oDetails.lastOn);
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
	var oDiv     = this.m_oExtensionDiv;
	oDiv.style.overflowY = "scroll";

	var oTextDiv = document.createElement("div");

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
	return oTextDiv;
};
