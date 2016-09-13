"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     08.09.2016
 * Time     23:29
 */

function CKGSChallengeWindow()
{
	CKGSChallengeWindow.superclass.constructor.call(this);

	this.m_nChannelId = -1;
	this.m_oGameRecord = null;

	this.m_bCanEdit = false;

	this.m_bNigiri       = true;
	this.m_bCreatorBlack = false;

	this.m_nTop           = 0;
	this.m_nHeaderHeight  = 30;
	this.m_nPlayersHeight = 30;
	this.m_nFieldHeight   = 30;

	this.m_oPlayersColorsCanvas = null;
}
CommonExtend(CKGSChallengeWindow, CKGSWindowBase);

CKGSChallengeWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSChallengeWindow.superclass.Init.apply(this, arguments);

	this.m_nChannelId = oPr.ChannelId;
	this.m_oGameRecord = oPr.GameRecord;

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	oMainDiv.style.background = "rgb(243, 243, 243)";

	var oProposal = this.m_oGameRecord.GetProposal();
	var oChallengeCreator = this.m_oGameRecord.GetChallengeCreator();

	this.Set_Caption(oChallengeCreator ? "New game vs. " + oChallengeCreator.GetName() : "New game");


	this.private_CreateName();
	this.private_CreatePlayers();
	this.private_CreateRules();

	this.Update_Size();
};
CKGSChallengeWindow.prototype.Update_Size = function(bForce)
{
	CKGSChallengeWindow.superclass.Update_Size.call(this, bForce);

	this.private_DrawPlayerColor();
};
CKGSChallengeWindow.prototype.Get_DefaultWindowSize = function()
{
	return {W : 360, H : 450};
};
CKGSChallengeWindow.prototype.Close = function()
{
	CKGSChallengeWindow.superclass.Close.call(this);
	this.m_oClient.CloseChallenge(this.m_nChannelId);
};
CKGSChallengeWindow.prototype.private_CreateName = function()
{
	var nLeftWidth = 120;
	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	var oWrapperDiv     = this.protected_CreateDivElement(oMainDiv);
	var oWrapperControl = CreateControlContainterByElement(oWrapperDiv);
	oWrapperControl.SetParams(nLeftWidth, 0, 1000, 1000, true, false, false, false, -1, this.m_nHeaderHeight);
	oWrapperControl.SetAnchor(false, true, true, false);
	oMainControl.AddControl(oWrapperControl);

	var oInput = this.protected_CreateDivElement(oWrapperDiv, null, "input");
	oInput.className += " challengeInput";
	var oInputControl = CreateControlContainterByElement(oInput);
	oInputControl.SetParams(5, 5, 5, 0, true, true, true, true, -1, -1);
	oInputControl.SetAnchor(true, true, true, true);
	oWrapperControl.AddControl(oInputControl);

	var sComment = this.m_oGameRecord.GetComment();
	if (sComment)
		oInput.value = sComment;

	if (true !== this.m_bCanEdit)
		oInput.disabled = "disabled";
	else
		oInput.className += " challengeInputEditable";

	var oWrapperTypeDiv     = this.protected_CreateDivElement(oMainDiv);
	var oWrapperTypeControl = CreateControlContainterByElement(oWrapperTypeDiv);
	oWrapperTypeControl.SetParams(0, 0, -1, -1, true, true, false, false, nLeftWidth, this.m_nHeaderHeight);
	oWrapperTypeControl.SetAnchor(true, true, false, false);
	oMainControl.AddControl(oWrapperTypeControl);

	var oTypeList       = this.protected_CreateDivElement(oWrapperTypeDiv, null, "select");
	oTypeList.className += " challengeSelect";
	oTypeList.style.fontWeight = "bold";
	this.private_AddOptionToSelect(oTypeList, "Ranked");
	this.private_AddOptionToSelect(oTypeList, "Free");
	this.private_AddOptionToSelect(oTypeList, "Rengo");
	this.private_AddOptionToSelect(oTypeList, "Simulation");

	var oProposal = this.m_oGameRecord.GetProposal();
	if (oProposal)
	{
		var nType = oProposal.GetGameType();
		if (EKGSGameType.Ranked === nType)
			oTypeList.selectedIndex = 0;
		else if (EKGSGameType.Free === nType)
			oTypeList.selectedIndex = 1;
		else if (EKGSGameType.Rengo === nType)
			oTypeList.selectedIndex = 2;
		else if (EKGSGameType.Simul === nType)
			oTypeList.selectedIndex = 3;
	}

	var oTypeListControl = CreateControlContainterByElement(oTypeList);
	oTypeListControl.SetParams(5, 5, 5, 0, true, true, true, true, -1, -1);
	oTypeListControl.SetAnchor(true, true, true, true);
	oWrapperTypeControl.AddControl(oTypeListControl);


	if (true !== this.m_bCanEdit)
	{
		oTypeList.disabled = "disabled";
		oTypeList.className += " challengeSelectDisabled";
	}
	else
	{
		oTypeList.className += " challengeSelectEditable";
	}


	this.m_nTop = this.m_nHeaderHeight;
};
CKGSChallengeWindow.prototype.private_CreatePlayers = function()
{
	var nTop = this.m_nHeaderHeight;

	nTop += 10;

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	var oPlayersColor        = this.protected_CreateDivElement(oMainDiv, null, "canvas");
	var oPlayersColorControl = CreateControlContainterByElement(oPlayersColor);
	oPlayersColorControl.SetParams(10, nTop, 0, 0, true, true, false, false, 50, 2 * this.m_nPlayersHeight);
	oPlayersColorControl.SetAnchor(true, true, false, false);
	oMainControl.AddControl(oPlayersColorControl);
	this.m_oPlayersColorsCanvas = oPlayersColor;

	oPlayersColor.style.cursor = "pointer";
	oPlayersColor.title = "Switch colors";
	var oThis = this;
	oPlayersColor.addEventListener("click", function (e)
	{
		if (true === oThis.m_bNigiri)
		{
			oThis.m_bNigiri       = false;
			oThis.m_bCreatorBlack = true;
		}
		else if (true === oThis.m_bCreatorBlack)
		{
			oThis.m_bCreatorBlack = false;
		}
		else
		{
			oThis.m_bNigiri = true;
		}

		oThis.private_DrawPlayerColor();
	}, false);


	var oCreatorPlayer = this.protected_CreateDivElement(oMainDiv);
	var oCreatorControl = CreateControlContainterByElement(oCreatorPlayer);
	oCreatorControl.SetParams(70, nTop, 10, 0, true, true, true, false, -1, this.m_nPlayersHeight);
	oCreatorControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oCreatorControl);

	var oChallengeCreator = this.m_oGameRecord.GetChallengeCreator();
	if (oChallengeCreator)
	{
		oCreatorPlayer.className += "challengePlayer";
		oCreatorPlayer.innerHTML = oChallengeCreator.GetName() + "[" + oChallengeCreator.GetStringRank() + "]";
		oCreatorPlayer.addEventListener("click", function()
		{
			oThis.m_oClient.LoadUserInfo(oChallengeCreator.GetName());
		}, false);
		oCreatorPlayer.title = "View user info";
	}

	var oChallengerPlayer = this.protected_CreateDivElement(oMainDiv);
	var oChallengerControl = CreateControlContainterByElement(oChallengerPlayer);
	oChallengerControl.SetParams(70, nTop + this.m_nPlayersHeight, 10, 0, true, true, true, false, -1, this.m_nPlayersHeight);
	oChallengerControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oChallengerControl);

	var oCurrentUserName = this.m_oClient.GetCurrentUser();
	if (oCurrentUserName)
	{
		oChallengerPlayer.className += "challengePlayer";
		oChallengerPlayer.innerHTML = oCurrentUserName.GetName() + "[" + oCurrentUserName.GetStringRank() + "]";
		oChallengerPlayer.addEventListener("click", function()
		{
			oThis.m_oClient.LoadUserInfo(oCurrentUserName.GetName());
		}, false);
		oChallengerPlayer.title = "View user info";
	}

	this.m_nTop = nTop + 2 * this.m_nPlayersHeight;
};
CKGSChallengeWindow.prototype.private_DrawPlayerColor = function()
{
	var oCanvas  = this.m_oPlayersColorsCanvas;
	var oContext = oCanvas.getContext("2d");
	var nW = oCanvas.width;
	var nH = oCanvas.height;

	oContext.clearRect(0, 0, nW, nH);

	var nSize = this.m_nPlayersHeight;

	var nRad = nSize / 2  * 0.7;
	var nY1 = nSize / 2;
	var nY2 = nSize * 1.5;
	var nX = 25;

	oContext.lineWidth   = 2;
	oContext.strokeStyle = "rgb(0, 0, 0)";

	if (true === this.m_bNigiri)
	{
		oContext.fillStyle = "rgb(255, 255, 255)";
		oContext.beginPath();
		oContext.arc(nX, nY1, nRad, 0, 2 * Math.PI, false);
		oContext.closePath();
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(0, 0, 0)";
		oContext.beginPath();
		oContext.arc(nX, nY1, nRad, 1.75 * Math.PI, 0.75 * Math.PI, false);
		oContext.closePath();
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(255, 255, 255)";
		oContext.beginPath();
		oContext.arc(nX, nY2, nRad, 0, 2 * Math.PI, false);
		oContext.closePath();
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(0, 0, 0)";
		oContext.beginPath();
		oContext.arc(nX, nY2, nRad, 1.75 * Math.PI, 0.75 * Math.PI, false);
		oContext.closePath();
		oContext.stroke();
		oContext.fill();
	}
	else if (true === this.m_bCreatorBlack)
	{
		oContext.fillStyle = "rgb(0, 0, 0)";

		oContext.beginPath();
		oContext.arc(nX, nY1, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(255, 255, 255)";

		oContext.beginPath();
		oContext.arc(nX, nY2, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();
	}
	else
	{
		oContext.fillStyle = "rgb(255, 255, 255)";

		oContext.beginPath();
		oContext.arc(nX, nY1, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(0, 0, 0)";

		oContext.beginPath();
		oContext.arc(nX, nY2, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();
	}

};
CKGSChallengeWindow.prototype.private_CreateRules = function()
{
	var oGameRecord = this.m_oGameRecord;
	var oProposal   = oGameRecord.GetProposal();

	var nLeftWidth = 100;
	var nTop = this.m_nTop + 10;

	// Rules
	var oRulesSelectElement = this.private_AddRulesField(nLeftWidth, nTop, "select", "Rules:");
	oRulesSelectElement.className += "challengeSelect";
	this.private_AddOptionToSelect(oRulesSelectElement, "Japanese");
	this.private_AddOptionToSelect(oRulesSelectElement, "Chinese");
	this.private_AddOptionToSelect(oRulesSelectElement, "AGA");
	this.private_AddOptionToSelect(oRulesSelectElement, "New Zeland");
	if (true !== this.m_bCanEdit)
	{
		oRulesSelectElement.disabled = "disabled";
		oRulesSelectElement.className += " challengeSelectDisabled";
	}
	else
	{
		oRulesSelectElement.className += " challengeSelectEditable";
	}

	if (oProposal)
	{
		var sRules = oProposal.GetRules();
		if ("japanese" == sRules)
			oRulesSelectElement.selectedIndex = 0;
		else if ("chinese" == sRules)
			oRulesSelectElement.selectedIndex = 1;
		else if ("aga" == sRules)
			oRulesSelectElement.selectedIndex = 2;
		else if ("new zeland" == sRules)
			oRulesSelectElement.selectedIndex = 3;
	}

	nTop += this.m_nFieldHeight;

	// BoardSize
	var oBoardElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Board size:");
	oBoardElement.className += " challengeInput";
	oBoardElement.value = "19";
	if (true !== this.m_bCanEdit)
		oBoardElement.disabled = "disabled";
	else
		oBoardElement.className += " challengeInputEditable";

	if (oProposal)
	{
		oBoardElement.value = oProposal.GetBoardSize();
	}

	nTop += this.m_nFieldHeight;

	// Handicap
	var oHandicapElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Handicap:");
	oHandicapElement.className += " challengeInput challengeInputEditable";
	oHandicapElement.value = "0";

	if (oProposal)
	{
	}

	nTop += this.m_nFieldHeight;

	// Komi
	var oKomiElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Komi:");
	oKomiElement.className += " challengeInput challengeInputEditable";
	oKomiElement.value = "6.5";

	if (oProposal)
	{
		oKomiElement.value = oProposal.GetKomi();
	}

	nTop += this.m_nFieldHeight;

	// TimeSystem
	var oTimeSystemElement = this.private_AddRulesField(nLeftWidth, nTop, "select", "Time system:");
	oTimeSystemElement.className += "challengeSelect";
	this.private_AddOptionToSelect(oTimeSystemElement, "Absolute");
	this.private_AddOptionToSelect(oTimeSystemElement, "Byo-Yomi");
	this.private_AddOptionToSelect(oTimeSystemElement, "Canadian");
	this.private_AddOptionToSelect(oTimeSystemElement, "No time limit");
	if (true !== this.m_bCanEdit)
	{
		oTimeSystemElement.disabled = "disabled";
		oTimeSystemElement.className += " challengeSelectDisabled";
	}
	else
	{
		oTimeSystemElement.className += " challengeSelectEditable";
	}

	nTop += this.m_nFieldHeight;

	// MainTime
	var oMainTimeElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Main time:");
	oMainTimeElement.className += " challengeInput";
	oMainTimeElement.value = "10:00";
	if (true !== this.m_bCanEdit)
		oMainTimeElement.disabled = "disabled";
	else
		oMainTimeElement.className += " challengeInputEditable";

	nTop += this.m_nFieldHeight;

	// ByoYomi time
	var oByoTimeElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Byo-yomi:");
	oByoTimeElement.className += " challengeInput";
	oByoTimeElement.value = "00:30";
	if (true !== this.m_bCanEdit)
		oByoTimeElement.disabled = "disabled";
	else
		oByoTimeElement.className += " challengeInputEditable";

	nTop += this.m_nFieldHeight;

	// ByoYomi count
	var oByoCountElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Count:");
	oByoCountElement.className += " challengeInput";
	oByoCountElement.value = "5";
	if (true !== this.m_bCanEdit)
		oByoCountElement.disabled = "disabled";
	else
		oByoCountElement.className += " challengeInputEditable";

	nTop += this.m_nFieldHeight;

	if (oProposal)
	{
		var oTimeSettings = oProposal.GetTimeSettings();
		if (oTimeSettings.IsNone())
		{
			oTimeSystemElement.selectedIndex = 3;
			oMainTimeElement.value = "--:--";
			oByoTimeElement.value  = "--:--";
			oByoCountElement.value = "";
		}
		else if (oTimeSettings.IsAbsolute())
		{
			oTimeSystemElement.selectedIndex = 0;
			oMainTimeElement.value = oTimeSettings.GetMainTimeString();
			oByoTimeElement.value  = "--:--";
			oByoCountElement.value = "";
		}
		else if (oTimeSettings.IsByoYomi())
		{
			oTimeSystemElement.selectedIndex = 1;
			oMainTimeElement.value = oTimeSettings.GetMainTimeString();
			oByoTimeElement.value  = oTimeSettings.GetByoYomiTimeString();
			oByoCountElement.value = oTimeSettings.GetOverCount();
		}
		else if (oTimeSettings.IsCanadian())
		{
			oTimeSystemElement.selectedIndex = 2;
			oMainTimeElement.value = oTimeSettings.GetMainTimeString();
			oByoTimeElement.value  = oTimeSettings.GetByoYomiTimeString();
			oByoCountElement.value = oTimeSettings.GetOverCount();
		}
	}


	this.m_nTop = nTop;
};
CKGSChallengeWindow.prototype.private_AddOptionToSelect = function(oSelect, sName)
{
	var oOption         = document.createElement("option");
	oOption.value       = sName;
	oOption.textContent = sName;
	oSelect.appendChild(oOption);
};
CKGSChallengeWindow.prototype.private_AddRulesField = function(nLeftWidth, nTop, sTag, sFieldName)
{
	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	var oTitleElement = this.protected_CreateDivElement(oMainDiv);
	var oTitleControl = CreateControlContainterByElement(oTitleElement);
	oTitleControl.SetParams(10, nTop, 0, 0, true, true, false, false, nLeftWidth, this.m_nFieldHeight);
	oTitleControl.SetAnchor(true, true, false, false);
	oMainControl.AddControl(oTitleControl);
	oTitleElement.innerHTML = sFieldName;
	oTitleElement.className += " challengeField";

	var oElement = this.protected_CreateDivElement(oMainDiv, "", sTag);
	oElement.style.paddingLeft= "3px";
	var oControl = CreateControlContainterByElement(oElement);
	oControl.SetParams(20 + nLeftWidth, nTop + 1, 10, 0, true, true, true, false, -1, this.m_nFieldHeight - 2);
	oControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oControl);
	return oElement;
};