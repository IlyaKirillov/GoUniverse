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

	this.m_nChannelId  = -1;
	this.m_oGameRecord = null;
	this.m_nRoomId     = -1;

	this.m_bCreation = false;

	this.m_bNigiri       = true;
	this.m_bCreatorBlack = false;
	this.m_nHandicap     = 0;
	this.m_dKomi         = 6.5;

	this.m_nTop           = 0;
	this.m_nHeaderHeight  = 30;
	this.m_nPlayersHeight = 30;
	this.m_nFieldHeight   = 32;

	this.m_oPlayersColorsCanvas = null;

	this.m_arrButtons = [];

	this.m_oCommentInput      = null;
	this.m_oGameTypeSelect    = null;
	this.m_oRulesSelect       = null;
	this.m_oSizeInput         = null;
	this.m_oKomiInput         = null;
	this.m_oHandicapInput     = null;
	this.m_oTimeSystemSelect  = null;
	this.m_oMainTimeInput     = null;
	this.m_oByoYomiTimeInput  = null;
	this.m_oByoYomiCountInput = null;
	this.m_oOverCountLabel    = null;

	var oThis = this;
	this.private_OnChangeRules = function()
	{
		if (!oThis.m_oKomiInput)
			return;

		oThis.m_oKomiInput.value = oThis.private_GetDefaultKomi();
	};
	this.private_OnChangeBoardSize = function()
	{
		if (!oThis.m_oSizeInput)
			return;

		var sValue = oThis.m_oSizeInput.value;
		var nValue = parseInt(sValue);

		if (isNaN(nValue))
			nValue = 19;
		else if (nValue < 2)
			nValue = 2;
		else if (nValue > 38)
			nValue = 38;

		oThis.m_oSizeInput.value = nValue;
	};
	this.private_OnChangeTimeSettings = function()
	{
		var nTimeSystem = oThis.private_GetSelectedTimeSystem();
		if (ETimeSettings.Absolute == nTimeSystem)
		{
			oThis.m_oMainTimeInput.value = "20:00";
		}
		else if (ETimeSettings.ByoYomi === nTimeSystem)
		{
			oThis.m_oMainTimeInput.value     = "10:00";
			oThis.m_oByoYomiTimeInput.value  = "00:30";
			oThis.m_oByoYomiCountInput.value = 5;
		}
		else if (ETimeSettings.Canadian === nTimeSystem)
		{
			oThis.m_oMainTimeInput.value     = "10:00";
			oThis.m_oByoYomiTimeInput.value  = "05:00";
			oThis.m_oByoYomiCountInput.value = 25;
		}
		oThis.private_UpdateTimeSystem();
	};
	this.private_OnChangeMainTime = function()
	{
		oThis.private_UpdateTimeSystem();
	};
	this.private_OnChangeOverTime = function()
	{
		oThis.private_UpdateTimeSystem();
	};
	this.private_OnChangeOverCount = function()
	{
		oThis.private_UpdateTimeSystem();
	};
	this.private_OnChangeKomi = function()
	{
		if (!oThis.m_oKomiInput)
			return;

		var sValue = oThis.m_oKomiInput.value;
		var dValue = parseFloat(sValue);

		if (isNaN(dValue))
			dValue = oThis.private_GetDefaultKomi();

		dValue = ((dValue * 2) | 0) / 2;

		oThis.m_oKomiInput.value = dValue;
	};
	this.private_OnChangeHandicap = function()
	{
		if (!oThis.m_oHandicapInput)
			return;

		var sValue = oThis.m_oHandicapInput.value;
		var nValue = parseInt(sValue);

		if (isNaN(nValue))
			nValue = oThis.private_GetDefaultHandicap();
		else if (nValue < 0)
			nValue = 0;
		else if (nValue > 50)
			nValue = 50;

		oThis.m_oHandicapInput.value = nValue;
	};
}
CommonExtend(CKGSChallengeWindow, CKGSWindowBase);

CKGSChallengeWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSChallengeWindow.superclass.Init.apply(this, arguments);

	this.m_nChannelId  = oPr.ChannelId;
	this.m_oGameRecord = oPr.GameRecord;
	this.m_nRoomId     = oPr.RoomId;

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	oMainDiv.style.background = "rgb(243, 243, 243)";

	var oChallengeCreator = this.m_oGameRecord.GetChallengeCreator();

	this.m_bCreation = true === oPr.Create ? true : false;

	if (true !== this.m_bCreation)
		this.Set_Caption(oChallengeCreator ? "New game vs. " + oChallengeCreator.GetName() : "New game");
	else
		this.Set_Caption("Create a new challenge");

	this.private_CreateName();
	this.private_CreatePlayers();
	this.private_CreateRules();
	this.private_CreateButtons();
	this.Update_Size();
};
CKGSChallengeWindow.prototype.Update_Size = function(bForce)
{
	CKGSChallengeWindow.superclass.Update_Size.call(this, bForce);

	this.private_DrawPlayerColor();
	for (var nIndex = 0, nCount = this.m_arrButtons.length; nIndex < nCount; ++nIndex)
	{
		this.m_arrButtons[nIndex].Update_Size();
	}
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
CKGSChallengeWindow.prototype.Submit = function(oUser, oProposal)
{
	this.m_bNigiri = oProposal.IsNigiri();

	if (true !== this.m_bNigiri)
	{
		var oBlackUser = oProposal.GetBlack();
		if (oBlackUser && oBlackUser.GetName() === oUser.GetName())
			this.m_bCreatorBlack = false;
		else
			this.m_bCreatorBlack = true;
	}

	this.private_DrawPlayerColor();

	this.m_oKomiInput.value     = oProposal.GetKomi();
	this.m_oHandicapInput.value = oProposal.GetHandicap();
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

	if (true !== this.m_bCreation)
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
	this.private_AddOptionToSelect(oTypeList, "Demo");

	var oTypeListControl = CreateControlContainterByElement(oTypeList);
	oTypeListControl.SetParams(5, 5, 5, 0, true, true, true, true, -1, -1);
	oTypeListControl.SetAnchor(true, true, true, true);
	oWrapperTypeControl.AddControl(oTypeListControl);


	if (true !== this.m_bCreation)
	{
		oTypeList.disabled = "disabled";
		oTypeList.className += " challengeSelectDisabled";
	}
	else
	{
		oTypeList.className += " challengeSelectEditable";
	}


	this.m_nTop = this.m_nHeaderHeight;

	this.m_oCommentInput   = oInput;
	this.m_oGameTypeSelect = oTypeList;

	var oProposal = this.m_oGameRecord.GetProposal();
	if (oProposal)
	{
		var nType = oProposal.GetGameType();
		this.private_SetSelectedGameType(nType);
	}
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
		if (true === oThis.m_bCreation)
			return;

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
	var oThis = this;

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
	this.private_AddOptionToSelect(oRulesSelectElement, "New Zealand");
	if (true !== this.m_bCreation)
	{
		oRulesSelectElement.disabled = "disabled";
		oRulesSelectElement.className += " challengeSelectDisabled";
	}
	else
	{
		oRulesSelectElement.className += " challengeSelectEditable";
	}
	this.m_oRulesSelect = oRulesSelectElement;

	nTop += this.m_nFieldHeight;

	// BoardSize
	var oBoardElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Board size:");
	oBoardElement.className += " challengeInput";
	oBoardElement.value = "19";
	if (true !== this.m_bCreation)
		oBoardElement.disabled = "disabled";
	else
		oBoardElement.className += " challengeInputEditable";

	this.m_oSizeInput = oBoardElement;
	nTop += this.m_nFieldHeight;

	// Handicap
	var oHandicapElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Handicap:");
	oHandicapElement.value = "0";
	if (true == this.m_bCreation)
	{
		oHandicapElement.className = "challengeInput";
		oHandicapElement.disabled  = "disabled";
	}
	else
	{
		oHandicapElement.className = "challengeInput challengeInputEditable";
	}
	this.m_oHandicapInput = oHandicapElement;

	nTop += this.m_nFieldHeight;

	// Komi
	var oKomiElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Komi:");
	oKomiElement.value = "6.5";
	if (true == this.m_bCreation)
	{
		oKomiElement.className = "challengeInput";
		oKomiElement.disabled  = "disabled";
	}
	else
	{
		oKomiElement.className = "challengeInput challengeInputEditable";
	}

	this.m_oKomiInput = oKomiElement;
	nTop += this.m_nFieldHeight;

	// TimeSystem
	var oTimeSystemElement = this.private_AddRulesField(nLeftWidth, nTop, "select", "Time system:");
	oTimeSystemElement.className += "challengeSelect";
	this.private_AddOptionToSelect(oTimeSystemElement, "Absolute");
	this.private_AddOptionToSelect(oTimeSystemElement, "Byo-Yomi");
	this.private_AddOptionToSelect(oTimeSystemElement, "Canadian");
	this.private_AddOptionToSelect(oTimeSystemElement, "No time limit");
	if (true !== this.m_bCreation)
	{
		oTimeSystemElement.disabled = "disabled";
		oTimeSystemElement.className += " challengeSelectDisabled";
	}
	else
	{
		oTimeSystemElement.className += " challengeSelectEditable";
	}
	this.m_oTimeSystemSelect = oTimeSystemElement;
	nTop += this.m_nFieldHeight;

	// MainTime
	var oMainTimeElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Main time:");
	oMainTimeElement.className += " challengeInput";
	oMainTimeElement.value = "10:00";
	if (true !== this.m_bCreation)
		oMainTimeElement.disabled = "disabled";
	else
		oMainTimeElement.className += " challengeInputEditable";
	this.m_oMainTimeInput = oMainTimeElement;
	nTop += this.m_nFieldHeight;

	// ByoYomi time
	var oByoTimeElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Byo-yomi:");
	oByoTimeElement.className += " challengeInput";
	oByoTimeElement.value = "00:30";
	if (true !== this.m_bCreation)
		oByoTimeElement.disabled = "disabled";
	else
		oByoTimeElement.className += " challengeInputEditable";
	this.m_oByoYomiTimeInput = oByoTimeElement;
	nTop += this.m_nFieldHeight;

	// ByoYomi count
	var oTemp = this.private_AddRulesField(nLeftWidth, nTop, "input", "Count:", true);
	var oByoCountElement = oTemp.Field;
	oByoCountElement.className += " challengeInput";
	oByoCountElement.value = "5";
	if (true !== this.m_bCreation)
		oByoCountElement.disabled = "disabled";
	else
		oByoCountElement.className += " challengeInputEditable";
	this.m_oByoYomiCountInput = oByoCountElement;
	this.m_oOverCountLabel    = oTemp.Title;
	nTop += this.m_nFieldHeight;

	if (oProposal)
	{
		var nRules = oProposal.GetRules();
		this.private_SetSelectedRules(nRules);
		oBoardElement.value = oProposal.GetBoardSize();
		oKomiElement.value  = oProposal.GetKomi();

		var oTimeSettings = oProposal.GetTimeSettings();
		if (oTimeSettings.IsNone())
		{
			oTimeSystemElement.selectedIndex = 3;
		}
		else if (oTimeSettings.IsAbsolute())
		{
			oTimeSystemElement.selectedIndex = 0;
		}
		else if (oTimeSettings.IsByoYomi())
		{
			oTimeSystemElement.selectedIndex = 1;
		}
		else if (oTimeSettings.IsCanadian())
		{
			oTimeSystemElement.selectedIndex = 2;
		}

		this.private_UpdateTimeSystemFields();
	}

	this.m_nTop = nTop;


	this.private_AddEventsForSelect(this.private_OnChangeRules, oRulesSelectElement);
	this.private_AddEventsForInput(this.private_OnChangeBoardSize, oBoardElement);
	this.private_AddEventsForSelect(this.private_OnChangeTimeSettings, oTimeSystemElement);
	this.private_AddEventsForInput(this.private_OnChangeMainTime, oMainTimeElement);
	this.private_AddEventsForInput(this.private_OnChangeOverTime, oByoTimeElement);
	this.private_AddEventsForInput(this.private_OnChangeOverCount, oByoCountElement);
	this.private_AddEventsForInput(this.private_OnChangeKomi, oKomiElement);
	this.private_AddEventsForInput(this.private_OnChangeHandicap, oHandicapElement);
};
CKGSChallengeWindow.prototype.private_AddOptionToSelect = function(oSelect, sName)
{
	var oOption         = document.createElement("option");
	oOption.value       = sName;
	oOption.textContent = sName;
	oSelect.appendChild(oOption);
};
CKGSChallengeWindow.prototype.private_AddRulesField = function(nLeftWidth, nTop, sTag, sFieldName, isReturnLabel)
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

	if (sTag !== "select")
		oElement.style.paddingLeft = "3px";

	var oControl = CreateControlContainterByElement(oElement);
	oControl.SetParams(20 + nLeftWidth, nTop + 1, 5, 0, true, true, true, false, -1, this.m_nFieldHeight - 2);
	oControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oControl);

	if (true === isReturnLabel)
		return {
			Title : oTitleElement,
			Field : oElement
		};

	return oElement;
};
CKGSChallengeWindow.prototype.private_CreateButtons = function()
{
	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	var oThis        = this;

	var nButtonW = 70;
	var nButtonH = 25;

	if (this.m_bCreation)
	{

		var oCreateButtonElement = this.protected_CreateDivElement(oMainDiv, oMainDiv.id + "C");
		var oCreateButtonControl = CreateControlContainterByElement(oCreateButtonElement);
		oCreateButtonControl.SetParams(0, 0, 5 + nButtonW + 5, 5, false, false, true, true, nButtonW, nButtonH);
		oCreateButtonControl.SetAnchor(false, false, true, true);
		oMainControl.AddControl(oCreateButtonControl);
		var oCreateButton = new CDrawingButtonSimpleText("Create", function()
		{
			oThis.private_CreateChallenge();
		}, "Create a new challenge");
		oCreateButton.Init(oMainDiv.id + "C");

		var oCloseButtonElement = this.protected_CreateDivElement(oMainDiv, oMainDiv.id + "S");
		var oCloseButtonControl = CreateControlContainterByElement(oCloseButtonElement);
		oCloseButtonControl.SetParams(0, 0, 5, 5, false, false, true, true, nButtonW, nButtonH);
		oCloseButtonControl.SetAnchor(false, false, true, true);
		oMainControl.AddControl(oCloseButtonControl);
		var oCloseButton = new CDrawingButtonSimpleText("Close", function()
		{
			oThis.Close();
		}, "Close challenge");
		oCloseButton.Init(oMainDiv.id + "S");

		this.m_arrButtons.push(oCreateButton);
		this.m_arrButtons.push(oCloseButton);
	}
};
CKGSChallengeWindow.prototype.private_CreateChallenge = function()
{
	var sComment    = this.m_oCommentInput.value;
	var nGameType   = this.private_GetSelectedGameType();
	var nRules      = this.private_GetSelectedRules();
	var nSize       = this.m_oSizeInput.value;
	var oTimeSystem = this.m_oGameRecord.GetProposal().GetTimeSettings();

	this.m_oClient.SendCreateChallenge(this.m_nRoomId, this.m_nChannelId, nGameType, sComment, nRules, nSize, oTimeSystem);
};
CKGSChallengeWindow.prototype.private_GetSelectedGameType = function()
{
	var nGameType = EKGSGameType.Free;
	var nSelectedIndex = this.m_oGameTypeSelect.selectedIndex;
	if (0 === nSelectedIndex)
		nGameType = EKGSGameType.Ranked;
	else if (1 === nSelectedIndex)
		nGameType = EKGSGameType.Free;
	else if (2 === nSelectedIndex)
		nGameType = EKGSGameType.Rengo;
	else if (3 === nSelectedIndex)
		nGameType = EKGSGameType.Simul;
	else if (4 === nSelectedIndex)
		nGameType = EKGSGameType.Demonstration;

	return nGameType;
};
CKGSChallengeWindow.prototype.private_SetSelectedGameType = function(nGameType)
{
	var nSelectedIndex = 0;
	if (EKGSGameType.Ranked === nGameType)
		nSelectedIndex = 0;
	else if (EKGSGameType.Free === nGameType)
		nSelectedIndex = 1;
	else if (EKGSGameType.Rengo === nGameType)
		nSelectedIndex = 2;
	else if (EKGSGameType.Simul === nGameType)
		nSelectedIndex = 3;
	else if (EKGSGameType.Demonstration === nGameType)
		nSelectedIndex = 4;

	this.m_oGameTypeSelect.selectedIndex = nSelectedIndex;
};
CKGSChallengeWindow.prototype.private_GetSelectedRules = function()
{
	var nRules = EKGSGameRules.Japanese;
	var nSelectedIndex = this.m_oRulesSelect.selectedIndex;
	if (0 === nSelectedIndex)
		nRules = EKGSGameRules.Japanese;
	else if (1 === nSelectedIndex)
		nRules = EKGSGameRules.Chinese;
	else if (2 === nSelectedIndex)
		nRules = EKGSGameRules.Aga;
	else if (3 === nSelectedIndex)
		nRules = EKGSGameRules.NewZealand;

	return nRules;
};
CKGSChallengeWindow.prototype.private_SetSelectedRules = function(nRules)
{
	var nSelectedIndex = 0;
	if (EKGSGameRules.Japanese === nRules)
		nSelectedIndex = 0;
	else if (EKGSGameRules.Chinese === nRules)
		nSelectedIndex = 1;
	else if (EKGSGameRules.Aga === nRules)
		nSelectedIndex = 2;
	else if (EKGSGameRules.NewZealand === nRules)
		nSelectedIndex = 3;

	this.m_oRulesSelect.selectedIndex = nSelectedIndex;
};
CKGSChallengeWindow.prototype.private_GetSelectedTimeSystem = function()
{
	var nSelectedIndex = this.m_oTimeSystemSelect.selectedIndex;
	if (0 === nSelectedIndex)
		return ETimeSettings.Absolute;
	else if (1 === nSelectedIndex)
		return ETimeSettings.ByoYomi;
	else if (2 === nSelectedIndex)
		return ETimeSettings.Canadian;
	else if (3 === nSelectedIndex)
		return ETimeSettings.None;

	return ETimeSettings.None;
};
CKGSChallengeWindow.prototype.private_AddEventsForInput = function(fOnChange, oInput)
{
	oInput.addEventListener("keyup", function(e)
	{
		if (13 === e.keyCode && fOnChange)
			fOnChange(e);
	}, false);
	oInput.addEventListener("blur", function(e)
	{
		if (fOnChange)
			fOnChange(e);

	}, false);
};
CKGSChallengeWindow.prototype.private_AddEventsForSelect = function(fOnChange, oSelect)
{
	oSelect.addEventListener("change", function(e)
	{
		if (fOnChange)
			fOnChange(e);
	}, false);
};
CKGSChallengeWindow.prototype.private_UpdateTimeSystem = function()
{
	var nTimeSystem   = this.private_GetSelectedTimeSystem();
	var oGameRecord   = this.m_oGameRecord;
	var oProposal     = oGameRecord.GetProposal();
	var oTimeSettings = oProposal.GetTimeSettings();

	if (ETimeSettings.Absolute === nTimeSystem)
	{
		var nMainTime = StringToSeconds(this.m_oMainTimeInput.value);

		if (nMainTime < 60)
			nMainTime = 60;

		oTimeSettings.SetAbsolute(nMainTime);
	}
	else if (ETimeSettings.ByoYomi === nTimeSystem)
	{
		var nMainTime = StringToSeconds(this.m_oMainTimeInput.value);
		var nByoTime  = StringToSeconds(this.m_oByoYomiTimeInput.value);
		var nByoCount = parseInt(this.m_oByoYomiCountInput.value);

		if (nByoTime < 1)
			nByoTime = 1;

		if (isNaN(nByoCount) || nByoCount < 1)
			nByoCount = 1;

		oTimeSettings.SetByoYomi(nMainTime, nByoTime, nByoCount);
	}
	else if (ETimeSettings.Canadian === nTimeSystem)
	{
		var nMainTime = StringToSeconds(this.m_oMainTimeInput.value);
		var nByoTime  = StringToSeconds(this.m_oByoYomiTimeInput.value);
		var nByoCount = parseInt(this.m_oByoYomiCountInput.value);

		if (nByoTime < 1)
			nByoTime = 1;

		if (isNaN(nByoCount) || nByoCount < 1)
			nByoCount = 1;

		oTimeSettings.SetCanadian(nMainTime, nByoTime, nByoCount);
	}
	else if (ETimeSettings.None === nTimeSystem)
	{
		oTimeSettings.SetNone();
	}

	this.private_UpdateTimeSystemFields();
};
CKGSChallengeWindow.prototype.private_UpdateTimeSystemFields = function()
{
	var oGameRecord   = this.m_oGameRecord;
	var oProposal     = oGameRecord.GetProposal();
	var oTimeSettings = oProposal.GetTimeSettings();

	if (oTimeSettings.IsAbsolute())
	{
		this.m_oMainTimeInput.value = oTimeSettings.GetMainTimeString();

		if (true === this.m_bCreation)
		{
			this.m_oMainTimeInput.className = "challengeInput challengeInputEditable";
			this.m_oMainTimeInput.disabled  = "";
		}
		else
		{
			this.m_oMainTimeInput.className = "challengeInput";
			this.m_oMainTimeInput.disabled  = "disabled";
		}

		this.m_oByoYomiTimeInput.value     = "-";
		this.m_oByoYomiTimeInput.className = "challengeInput";
		this.m_oByoYomiTimeInput.disabled  = "disabled";

		this.m_oByoYomiCountInput.value = "-";
		this.m_oByoYomiCountInput.className = "challengeInput";
		this.m_oByoYomiCountInput.disabled  = "disabled";
	}
	else if (oTimeSettings.IsByoYomi() || oTimeSettings.IsCanadian())
	{
		this.m_oMainTimeInput.value     = oTimeSettings.GetMainTimeString();
		this.m_oByoYomiTimeInput.value  = oTimeSettings.GetByoYomiTimeString();
		this.m_oByoYomiCountInput.value = oTimeSettings.GetOverCount();

		if (true === this.m_bCreation)
		{
			this.m_oMainTimeInput.className     = "challengeInput challengeInputEditable";
			this.m_oByoYomiTimeInput.className  = "challengeInput challengeInputEditable";
			this.m_oByoYomiCountInput.className = "challengeInput challengeInputEditable";

			this.m_oMainTimeInput.disabled     = "";
			this.m_oByoYomiTimeInput.disabled  = "";
			this.m_oByoYomiCountInput.disabled = "";
		}
		else
		{
			this.m_oMainTimeInput.className     = "challengeInput";
			this.m_oByoYomiTimeInput.className  = "challengeInput";
			this.m_oByoYomiCountInput.className = "challengeInput";

			this.m_oMainTimeInput.disabled     = "disabled";
			this.m_oByoYomiTimeInput.disabled  = "disabled";
			this.m_oByoYomiCountInput.disabled = "disabled";
		}

		if (oTimeSettings.IsByoYomi())
			this.m_oOverCountLabel.innerHTML = "Periods:";
		else
			this.m_oOverCountLabel.innerHTML = "Stones:";
	}
	else if (oTimeSettings.IsNone())
	{
		this.m_oMainTimeInput.value     = "-";
		this.m_oByoYomiTimeInput.value  = "-";
		this.m_oByoYomiCountInput.value = "-";

		this.m_oMainTimeInput.className     = "challengeInput";
		this.m_oByoYomiTimeInput.className  = "challengeInput";
		this.m_oByoYomiCountInput.className = "challengeInput";

		this.m_oMainTimeInput.disabled     = "disabled";
		this.m_oByoYomiTimeInput.disabled  = "disabled";
		this.m_oByoYomiCountInput.disabled = "disabled";
	}
};
CKGSChallengeWindow.prototype.private_GetDefaultHandicap = function()
{
	// TODO: Сделать зависимость от противника
	return 0;
};
CKGSChallengeWindow.prototype.private_GetDefaultKomi = function()
{
	var nRules = this.private_GetSelectedRules();
	if (EKGSGameRules.Japanese === nRules)
		return 6.5;
	else if (EKGSGameRules.Chinese === nRules || EKGSGameRules.Aga === nRules)
		return 7.5;
	else if (EKGSGameRules.NewZealand === nRules)
		return 7;
};