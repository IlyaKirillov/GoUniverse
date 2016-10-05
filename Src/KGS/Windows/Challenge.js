"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     08.09.2016
 * Time     23:29
 */

var KGS_MAX_TIME         = 2147483;
var KGS_OVER_MAX_COUNT   = 255;
var KGS_MAX_KOMI         = 100;
var KGS_MAX_HANDICAP     = 9;
var KGS_MAX_BYOYOMI_TIME = 36000;

var EKGSChallengeWindowState = {
	Unknown           : 0,
	Creation          : 1,
	CreatorProposal   : 2,
	CreatorWaiting    : 3,
	ChallengerSubmit  : 4,
	ChallengerAccept  : 5,
	Waiting           : 6,
	ChallengerWaiting : 7
};

var EKGSChallengeWindowType = {
	Regular   : 0,
	Unranked  : 1,
	Rengo     : 2,
	Simulation: 3
};

function CKGSChallengeWindow()
{
	CKGSChallengeWindow.superclass.constructor.call(this);

	this.m_nState      = EKGSChallengeWindowState.Unknown;
	this.m_nType       = EKGSChallengeWindowState.Unranked;

	this.m_nChannelId  = -1;
	this.m_oGameRecord = null;
	this.m_nRoomId     = -1;

	this.m_oOwner    = null;

	this.m_bNigiri       = true;
	this.m_bCreatorBlack = false;
	this.m_nGameType     = EKGSGameType.Free;

	this.m_nTop           = 0;
	this.m_nHeaderHeight  = 30;
	this.m_nPlayersHeight = 30;
	this.m_nFieldHeight   = 32;

	this.m_oPlayersColorsCanvas = null;
	this.m_oAnimatedWaiting     = null;

	this.m_oButtons = {
		Close  : null,
		Ok     : null,
		Retry  : null,
		Create : null
	};


	this.m_oCurrentChallenger = null;
	this.m_arrChallengers     = [];

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
	this.m_oChallengerSelect  = null;
	this.m_oChallengerSpan    = null;
	this.m_oChallengerDiv     = null;

	var oThis = this;
	this.private_OnChangeRules = function()
	{
		if (!oThis.m_oKomiInput)
			return;

		oThis.m_oKomiInput.value = oThis.private_GetDefaultKomi();

		oThis.private_GetGlobalSettings().SetKGSChallengeRules(oThis.private_GetSelectedRules());
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

		oThis.private_GetGlobalSettings().SetKGSChallengeBoardSize(nValue);
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
		else if (dValue < -KGS_MAX_KOMI)
			dValue = -KGS_MAX_KOMI;
		else if (dValue > KGS_MAX_KOMI)
			dValue = KGS_MAX_KOMI;

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
		else if (nValue <= 1)
			nValue = 0;
		else if (nValue > KGS_MAX_HANDICAP)
			nValue = KGS_MAX_HANDICAP;

		oThis.m_oHandicapInput.value = nValue;
	};
	this.private_OnChangeChallenger = function()
	{
		var oChallengerListElement = oThis.m_oChallengerSelect;
		var oChallengerSpan        = oThis.m_oChallengerSpan;

		// Ищем выделенного игрока в списке
		var nSelectedIndex = oChallengerListElement.selectedIndex;

		var bChangedColors = false;
		// 0 - элемент пустая строка
		if (0 === nSelectedIndex)
		{
			oThis.m_oCurrentChallenger = null;
			oThis.m_oButtons.Ok.Hide();

			oChallengerSpan.innerHTML = "";
			oChallengerSpan.title     = "";
			oChallengerSpan.onclick   = null;

			oThis.m_oHandicapInput.value = oThis.private_GetDefaultHandicap();
			oThis.m_oKomiInput.value     = oThis.private_GetDefaultKomi();
			oThis.m_bNigiri              = true;

			oThis.m_oKomiInput.className     = "challengeInput";
			oThis.m_oKomiInput.disabled      = "disabled";
			oThis.m_oHandicapInput.className = "challengeInput";
			oThis.m_oHandicapInput.disabled  = "disabled";

			oThis.m_oChallengerReject.style.display = "none";

			oThis.private_SetSelectedGameType(oThis.private_GetDefaultGameType());
		}
		else
		{
			var oChallenger = oThis.m_arrChallengers[nSelectedIndex - 1].User;
			var oProposal   = oThis.m_arrChallengers[nSelectedIndex - 1].Proposal;
			oThis.m_oCurrentChallenger = oChallenger;
			oThis.m_oButtons.Ok.Show();

			oChallengerSpan.innerHTML = oChallenger.GetName() + "[" + oChallenger.GetStringRank() + "]";
			oChallengerSpan.title     = "View user info";

			oThis.m_oHandicapInput.value = oProposal.GetHandicap();
			oThis.m_oKomiInput.value     = oProposal.GetKomi();
			oThis.m_bNigiri              = oProposal.IsNigiri();
			oThis.private_SetSelectedGameType(oProposal.GetGameType());

			if (true !== oThis.m_bNigiri)
			{
				var oBlackUser = oProposal.GetBlack();
				if (oBlackUser && oBlackUser.GetName() === oThis.m_oCurrentChallenger.GetName())
					oThis.m_bCreatorBlack = false;
				else
					oThis.m_bCreatorBlack = true;

				oThis.m_oKomiInput.className     = "challengeInput challengeInputEditable";
				oThis.m_oKomiInput.disabled      = "";
				oThis.m_oHandicapInput.className = "challengeInput challengeInputEditable";
				oThis.m_oHandicapInput.disabled  = "";
			}
			else
			{
				oThis.m_oKomiInput.className     = "challengeInput";
				oThis.m_oKomiInput.disabled      = "disabled";
				oThis.m_oHandicapInput.className = "challengeInput";
				oThis.m_oHandicapInput.disabled  = "disabled";
			}

			if (oThis.m_bNigiri !== oThis.private_GetDefaultNigiri() || (true !== oThis.m_bNigiri && oThis.m_bCreatorBlack !== oThis.private_GetDefaultIsCreatorBlack()))
				bChangedColors = true;

			if (oThis.private_GetDefaultHandicap() !== oProposal.GetHandicap())
				oThis.m_oHandicapInput.className += " challengeInputChanged";

			if (Math.abs(oThis.private_GetDefaultKomi() - oProposal.GetKomi()) > 0.001)
				oThis.m_oKomiInput.className += " challengeInputChanged";

			if (oThis.private_GetSelectedGameType() !== oThis.private_GetDefaultGameType())
				oThis.m_oGameTypeSelect.className += " challengeSelectChanged";

			oThis.m_oChallengerReject.style.display = "block";
		}

		oThis.private_DrawPlayerColor(bChangedColors);
	};
	this.private_OnChangeColors = function()
	{
		if (EKGSChallengeWindowState.ChallengerSubmit === oThis.m_nState || (EKGSChallengeWindowState.CreatorProposal === oThis.m_nState && null !== oThis.m_oCurrentChallenger))
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

			oThis.private_UpdateKomiAndHandicapFields();
			oThis.private_DrawPlayerColor();
		}
	};
	this.private_OnChangeGameType = function()
	{
		oThis.private_GetGlobalSettings().SetKGSChallengeGameType(oThis.private_GetSelectedGameType());
	};
	this.private_OnChangeComment = function()
	{
		oThis.private_GetGlobalSettings().SetKGSChallengeComment(oThis.m_oCommentInput.value);
	};
}
CommonExtend(CKGSChallengeWindow, CKGSWindowBase);

CKGSChallengeWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSChallengeWindow.superclass.Init.call(this, sDivId, oPr, false);

	this.m_nChannelId  = oPr.ChannelId;
	this.m_oGameRecord = oPr.GameRecord;
	this.m_nRoomId     = oPr.RoomId;

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	oMainDiv.style.background = "rgb(243, 243, 243)";

	var oChallengeCreator = this.m_oGameRecord.GetChallengeCreator();
	this.m_oOwner         = oChallengeCreator;

	if (true === oPr.Create)
	{
		this.m_nState = EKGSChallengeWindowState.Creation;
		this.m_nType  = EKGSChallengeWindowType.Unranked;

		if (this.m_oClient.GetCurrentUser().CanPlayRanked())
			this.m_nType = EKGSChallengeWindowType.Regular;
	}
	else
	{
		if (oChallengeCreator.GetName() === this.m_oClient.GetUserName())
		{
			this.m_nState = EKGSChallengeWindowState.CreatorProposal;
		}
		else
		{
			this.m_nState             = EKGSChallengeWindowState.ChallengerSubmit;
			this.m_oCurrentChallenger = this.m_oClient.GetCurrentUser();
		}
		this.m_nGameType = this.m_oGameRecord.GetProposal().GetGameType();

		if (EKGSGameType.Free === this.m_nGameType)
			this.m_nType = EKGSChallengeWindowType.Unranked;
		else if (EKGSGameType.Rengo === this.m_nGameType)
			this.m_nType = EKGSChallengeWindowType.Rengo;
		else if (EKGSGameType.Simul === this.m_nGameType)
			this.m_nType = EKGSChallengeWindowType.Simulation;
		else if (EKGSGameType.Teaching === this.m_nGameType)
			this.m_nType = EKGSChallengeWindowType.Unranked;
		else if (EKGSGameType.Ranked === this.m_nGameType)
		{
			this.m_nType = EKGSChallengeWindowType.Unranked;
			if (this.m_oOwner && this.m_oOwner.CanPlayRanked() && (!this.m_oCurrentChallenger || this.m_oCurrentChallenger.CanPlayRanked()))
				this.m_nType = EKGSChallengeWindowType.Regular;
		}

	}

	this.private_CreateName();
	this.private_CreatePlayers();
	this.private_CreateRules();
	this.private_CreateButtons();
	this.private_CreateAnimatedWaiting();

	if (true === oPr.Create)
		this.private_FillDefaultCreatorValues();
	else
		this.private_FillDefaultChallengerValues();

	this.private_UpdateOnStateChange();
};
CKGSChallengeWindow.prototype.Update_Size = function(bForce)
{
	CKGSChallengeWindow.superclass.Update_Size.call(this, bForce);

	if (this.m_oButtons.Close)
		this.m_oButtons.Close.Update_Size();

	if (this.m_oButtons.Create)
		this.m_oButtons.Create.Update_Size();

	if (this.m_oButtons.Ok)
		this.m_oButtons.Ok.Update_Size();

	if (this.m_oButtons.Retry)
		this.m_oButtons.Retry.Update_Size();


	if (this.m_oPlayersColorsCanvas)
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
CKGSChallengeWindow.prototype.OnSubmit = function(oUser, oProposal)
{
	this.m_arrChallengers.push({
		Proposal : oProposal,
		User     : oUser
	});

	this.private_AddOptionToSelect(this.m_oChallengerSelect, oUser.GetName());

	if (1 === this.m_arrChallengers.length)
	{
		this.m_oChallengerSelect.selectedIndex = 1;
		this.private_OnChangeChallenger();
		this.Update_Size(); // Для обсчета кнопки Ok
	}
};
CKGSChallengeWindow.prototype.OnDecline = function()
{
	var oChallengeCreator = this.m_oOwner;
	this.private_SetState(EKGSChallengeWindowState.ChallengerSubmit);

	CreateKGSWindow(EKGSWindowType.Information, {Client : this.m_oClient, App : this.m_oClient.m_oApp, Caption : "Warning", Text : "Your challenge has been declined.", Image : "WarningSpanWarning", W : 315, H : 145});
};
CKGSChallengeWindow.prototype.OnProposal = function(oProposal)
{
	if (EKGSChallengeWindowState.ChallengerWaiting === this.m_nState || EKGSChallengeWindowState.ChallengerAccept === this.m_nState)
	{
		var nGameType  = oProposal.GetGameType();
		var bNigiri    = oProposal.IsNigiri();
		var oBlackUser = oProposal.GetBlack();
		var bCreatorB  = oBlackUser && oBlackUser.GetName() === this.m_oOwner.GetName() ? true : false;
		var nHandicap  = oProposal.GetHandicap();
		var dKomi      = parseFloat(oProposal.GetKomi());

		if (isNaN(dKomi))
			dKomi = 0;

		var bCanAccept       = true;
		var bGameTypeChanged = false;
		if (nGameType !== this.private_GetSelectedGameType())
		{
			bCanAccept       = false;
			bGameTypeChanged = true;
			this.private_SetSelectedGameType(nGameType);
		}

		var bColorsChanged = false;
		if (bNigiri !== this.m_bNigiri || (true !== this.m_bNigiri && bCreatorB !== this.m_bCreatorBlack))
		{
			bCanAccept           = false;
			bColorsChanged       = true;
			this.m_bNigiri       = bNigiri;
			this.m_bCreatorBlack = bCreatorB;
			this.private_DrawPlayerColor(true);
		}

		var bHandiChanged = false;
		if (nHandicap !== this.private_GetHandicap())
		{
			bCanAccept                  = false;
			bHandiChanged               = true;
			this.m_oHandicapInput.value = nHandicap;
			this.private_OnChangeHandicap();
		}

		var bKomiChanged = false;
		if (Math.abs(dKomi - this.private_GetKomi()) > 0.001)
		{
			bCanAccept              = false;
			bKomiChanged            = true;
			this.m_oKomiInput.value = dKomi;
			this.private_OnChangeKomi();
		}

		if (true === bCanAccept)
		{
			this.m_nState = EKGSChallengeWindowState.ChallengerAccept;
			this.private_OkChallenge();
		}
		else
		{
			this.private_SetState(EKGSChallengeWindowState.ChallengerAccept);

			if (bHandiChanged)
				this.m_oHandicapInput.className += " challengeInputChanged";

			if (bKomiChanged)
				this.m_oKomiInput.className += " challengeInputChanged";

			if (bGameTypeChanged)
				this.m_oGameTypeSelect.className += " challengeSelectChanged";

			if (bColorsChanged)
				this.private_DrawPlayerColor(true);
		}
	}
};
CKGSChallengeWindow.prototype.OnChallengeCreated = function(nChannelId)
{
	this.m_nChannelId = nChannelId;
	this.private_SetState(EKGSChallengeWindowState.CreatorProposal);
};
CKGSChallengeWindow.prototype.OnUserRemoved = function(oUser)
{
	for (var nIndex = 0, nCount = this.m_arrChallengers.length; nIndex < nCount; ++nIndex)
	{
		if (this.m_arrChallengers[nIndex].User.GetName() === oUser.GetName())
		{
			this.m_arrChallengers.splice(nIndex, 1);
			this.m_oChallengerSelect.remove(nIndex + 1);

			if (this.m_oCurrentChallenger.GetName() === oUser.GetName())
			{
				this.m_oChallengerSelect.selectedIndex = 0;
				this.private_OnChangeChallenger();
				this.private_SetState(EKGSChallengeWindowState.CreatorProposal);
			}

			return;
		}
	}
};
CKGSChallengeWindow.prototype.GetChallengeCreator = function()
{
	return this.m_oOwner;
};
CKGSChallengeWindow.prototype.private_CreateName = function()
{
	var nLeftWidth = 120;
	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	var oWrapperDiv     = this.protected_CreateDivElement(oMainDiv);
	var oWrapperControl = CreateControlContainerByElement(oWrapperDiv);
	oWrapperControl.SetParams(nLeftWidth, 0, 1000, 1000, true, false, false, false, -1, this.m_nHeaderHeight);
	oWrapperControl.SetAnchor(false, true, true, false);
	oMainControl.AddControl(oWrapperControl);

	var oInput = this.protected_CreateDivElement(oWrapperDiv, null, "input");
	var oInputControl = CreateControlContainerByElement(oInput);
	oInputControl.SetParams(5, 5, 5, 0, true, true, true, true, -1, -1);
	oInputControl.SetAnchor(true, true, true, true);
	oWrapperControl.AddControl(oInputControl);
	oInput.maxLength = "80";

	var sComment = this.m_oGameRecord.GetComment();
	if (sComment)
		oInput.value = sComment;

	var oWrapperTypeDiv     = this.protected_CreateDivElement(oMainDiv);
	var oWrapperTypeControl = CreateControlContainerByElement(oWrapperTypeDiv);
	oWrapperTypeControl.SetParams(0, 0, -1, -1, true, true, false, false, nLeftWidth, this.m_nHeaderHeight);
	oWrapperTypeControl.SetAnchor(true, true, false, false);
	oMainControl.AddControl(oWrapperTypeControl);

	var oTypeList       = this.protected_CreateDivElement(oWrapperTypeDiv, null, "select");
	oTypeList.style.fontWeight = "bold";

	switch (this.m_nType)
	{
		case EKGSChallengeWindowType.Regular:
		{
			this.private_AddOptionToSelect(oTypeList, "Ranked");
			this.private_AddOptionToSelect(oTypeList, "Free");
			this.private_AddOptionToSelect(oTypeList, "Teaching");
			break;
		}
		case EKGSChallengeWindowType.Unranked:
		{
			this.private_AddOptionToSelect(oTypeList, "Free");
			this.private_AddOptionToSelect(oTypeList, "Teaching");
			break;
		}
		case EKGSChallengeWindowType.Rengo:
		{
			this.private_AddOptionToSelect(oTypeList, "Rengo");
			break;
		}
		case EKGSChallengeWindowType.Simulation:
		{
			this.private_AddOptionToSelect(oTypeList, "Simulation");
			break;
		}
	}

	var oTypeListControl = CreateControlContainerByElement(oTypeList);
	oTypeListControl.SetParams(5, 5, 5, 0, true, true, true, true, -1, -1);
	oTypeListControl.SetAnchor(true, true, true, true);
	oWrapperTypeControl.AddControl(oTypeListControl);

	this.m_nTop = this.m_nHeaderHeight;

	this.m_oCommentInput   = oInput;
	this.m_oGameTypeSelect = oTypeList;

	var oProposal = this.m_oGameRecord.GetProposal();
	if (oProposal)
	{
		var nType = oProposal.GetGameType();
		this.private_SetSelectedGameType(nType);
	}

	this.private_AddEventsForSelect(this.private_OnChangeGameType, oTypeList);
	this.private_AddEventsForInput(this.private_OnChangeComment, oInput);
};
CKGSChallengeWindow.prototype.private_CreateAnimatedWaiting = function()
{
	var oAnimation          = this.protected_CreateDivElement(this.HtmlElement.Caption, null, "canvas");
	oAnimation.width        = 24;
	oAnimation.height       = 24;
	oAnimation.style.left   = "7px";
	oAnimation.style.top    = "3px";
	oAnimation.style.width  = "24px";
	oAnimation.style.height = "24px";
	this.m_oAnimatedWaiting = new CGoUniverseAnimatedLogo(oAnimation);
};
CKGSChallengeWindow.prototype.private_CreatePlayers = function()
{
	var nTop = this.m_nHeaderHeight;

	nTop += 10;

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	var oPlayersColor        = this.protected_CreateDivElement(oMainDiv, null, "canvas");
	var oPlayersColorControl = CreateControlContainerByElement(oPlayersColor);
	oPlayersColorControl.SetParams(10, nTop, 0, 0, true, true, false, false, 50, 2 * this.m_nPlayersHeight);
	oPlayersColorControl.SetAnchor(true, true, false, false);
	oMainControl.AddControl(oPlayersColorControl);
	this.m_oPlayersColorsCanvas = oPlayersColor;

	oPlayersColor.style.cursor = "pointer";
	oPlayersColor.title = "Switch colors";
	var oThis = this;
	oPlayersColor.addEventListener("click", this.private_OnChangeColors, false);

	var oCreatorPlayer = this.protected_CreateDivElement(oMainDiv);
	var oCreatorControl = CreateControlContainerByElement(oCreatorPlayer);
	oCreatorControl.SetParams(70, nTop, 10, 0, true, true, true, false, -1, this.m_nPlayersHeight);
	oCreatorControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oCreatorControl);
	oCreatorPlayer.style.paddingLeft = "3px";
	oCreatorPlayer.className += "challengePlayer";

	var oChallengeCreator = this.m_oGameRecord.GetChallengeCreator();
	if (oChallengeCreator)
	{

		var oSpan = document.createElement("span");
		oSpan.className = "challengePlayerSpan";
		oSpan.innerHTML = oChallengeCreator.GetName() + "[" + oChallengeCreator.GetStringRank() + "]";
		oSpan.addEventListener("click", function()
		{
			oThis.m_oClient.LoadUserInfo(oChallengeCreator.GetName());
		}, false);
		oSpan.title = "View user info";
		oCreatorPlayer.appendChild(oSpan);
	}

	var oChallengerListElement = this.protected_CreateDivElement(oMainDiv, "", "select");
	var oChallengerListControl = CreateControlContainerByElement(oChallengerListElement);
	oChallengerListControl.SetParams(70, nTop + this.m_nPlayersHeight, 10, 0, true, true, true, false, -1, this.m_nPlayersHeight);
	oChallengerListControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oChallengerListControl);
	this.private_AddOptionToSelect(oChallengerListElement, "");

	var oChallengerPlayer = this.protected_CreateDivElement(oMainDiv);
	var oChallengerControl = CreateControlContainerByElement(oChallengerPlayer);
	oChallengerControl.SetParams(70 + 1, nTop + this.m_nPlayersHeight + 1, 50, 0, true, true, true, false, -1, this.m_nPlayersHeight - 2);
	oChallengerControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oChallengerControl);
	oChallengerPlayer.style.paddingLeft = "3px";
	oChallengerPlayer.className += "challengePlayer";

	var oChallengerSpan            = document.createElement("span");
	oChallengerSpan.style["float"] = "left";
	oChallengerSpan.className      = "challengePlayerSpan";
	oChallengerSpan.innerHTML      = "";
	oChallengerSpan.title          = "";
	oChallengerSpan.onclick        = function ()
	{
		if (oThis.m_oCurrentChallenger)
			oThis.m_oClient.LoadUserInfo(oThis.m_oCurrentChallenger.GetName());
	};
	oChallengerPlayer.appendChild(oChallengerSpan);

	var oChallengerRejectSpan            = document.createElement("span");
	oChallengerRejectSpan.className      = "challengePlayerSpan challengePlayerRejectSpan";
	oChallengerRejectSpan.style["float"] = "right";
	oChallengerRejectSpan.style.display  = "none";
	oChallengerRejectSpan.innerHTML      = "decline";
	oChallengerRejectSpan.title          = "Decline this player";
	oChallengerRejectSpan.onclick = function ()
	{
		oThis.private_RejectChallenge();
	};
	oChallengerPlayer.appendChild(oChallengerRejectSpan);


	this.m_nTop = nTop + 2 * this.m_nPlayersHeight;

	this.m_oChallengerDiv    = oChallengerPlayer;
	this.m_oChallengerSelect = oChallengerListElement;
	this.m_oChallengerSpan   = oChallengerSpan;
	this.m_oChallengerReject = oChallengerRejectSpan;

	this.private_AddEventsForSelect(this.private_OnChangeChallenger, oChallengerListElement);
};
CKGSChallengeWindow.prototype.private_DrawPlayerColor = function(bChanged)
{
	var oCanvas  = this.m_oPlayersColorsCanvas;
	var oContext = oCanvas.getContext("2d");
	var nW = oCanvas.width;
	var nH = oCanvas.height;

	oContext.clearRect(0, 0, nW, nH);

	if (true === bChanged)
	{
		oContext.lineWidth   = 2;
		oContext.strokeStyle = "rgb(199, 40, 40)";
		oContext.beginPath();
		oContext.moveTo(0, 0);
		oContext.lineTo(0, nH);
		oContext.lineTo(nW, nH);
		oContext.lineTo(nW, 0);
		oContext.closePath();
		oContext.stroke();
	}

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
	this.private_AddOptionToSelect(oRulesSelectElement, "Japanese");
	this.private_AddOptionToSelect(oRulesSelectElement, "Chinese");
	this.private_AddOptionToSelect(oRulesSelectElement, "AGA");
	this.private_AddOptionToSelect(oRulesSelectElement, "New Zealand");
	this.m_oRulesSelect = oRulesSelectElement;

	nTop += this.m_nFieldHeight;

	// BoardSize
	var oBoardElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Board size:");
	oBoardElement.value = "19";
	this.m_oSizeInput = oBoardElement;
	nTop += this.m_nFieldHeight;

	// Handicap
	var oHandicapElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Handicap:");
	oHandicapElement.value = "0";
	this.m_oHandicapInput = oHandicapElement;

	nTop += this.m_nFieldHeight;

	// Komi
	var oKomiElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Komi:");
	oKomiElement.value = "6.5";
	this.m_oKomiInput = oKomiElement;
	nTop += this.m_nFieldHeight;

	// TimeSystem
	var oTimeSystemElement = this.private_AddRulesField(nLeftWidth, nTop, "select", "Time system:");
	this.private_AddOptionToSelect(oTimeSystemElement, "Absolute");
	this.private_AddOptionToSelect(oTimeSystemElement, "Byo-Yomi");
	this.private_AddOptionToSelect(oTimeSystemElement, "Canadian");
	this.private_AddOptionToSelect(oTimeSystemElement, "No time limit");
	this.m_oTimeSystemSelect = oTimeSystemElement;
	nTop += this.m_nFieldHeight;

	// MainTime
	var oMainTimeElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Main time:");
	oMainTimeElement.value = "10:00";
	this.m_oMainTimeInput = oMainTimeElement;
	nTop += this.m_nFieldHeight;

	// ByoYomi time
	var oByoTimeElement = this.private_AddRulesField(nLeftWidth, nTop, "input", "Byo-yomi:");
	oByoTimeElement.value = "00:30";
	this.m_oByoYomiTimeInput = oByoTimeElement;
	nTop += this.m_nFieldHeight;

	// ByoYomi count
	var oTemp = this.private_AddRulesField(nLeftWidth, nTop, "input", "Count:", true);
	var oByoCountElement = oTemp.Field;
	oByoCountElement.value = "5";
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
	var oTitleControl = CreateControlContainerByElement(oTitleElement);
	oTitleControl.SetParams(10, nTop, 0, 0, true, true, false, false, nLeftWidth, this.m_nFieldHeight);
	oTitleControl.SetAnchor(true, true, false, false);
	oMainControl.AddControl(oTitleControl);
	oTitleElement.innerHTML = sFieldName;
	oTitleElement.className += " challengeField";

	var oElement = this.protected_CreateDivElement(oMainDiv, "", sTag);
	oElement.style.padding = "";

	var oControl = CreateControlContainerByElement(oElement);
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
	var sMainId      = oMainDiv.id;

	var nButtonW = 70;
	var nButtonH = 25;

	// Всевозможные кнопки добавляем сразу, а вот их реальное присутствие в окне будет зависеть уже от типа окна

	// Close - общая кнопка
	var sCloseButtonId      = sMainId + "Z";
	var oCloseButtonElement = this.protected_CreateDivElement(oMainDiv, sCloseButtonId);
	var oCloseButtonControl = CreateControlContainerByElement(oCloseButtonElement);
	oCloseButtonControl.SetParams(0, 0, 5, 5, false, false, true, true, nButtonW, nButtonH);
	oCloseButtonControl.SetAnchor(false, false, true, true);
	oMainControl.AddControl(oCloseButtonControl);
	var oCloseButton = new CDrawingButtonSimpleText("Close", function()
	{
		oThis.Close();
	}, "Close challenge");
	oCloseButton.Init(sCloseButtonId);
	this.m_oButtons.Close = oCloseButton;

	// Create - кнопка для создания вызова
	var sCreateButtonId      = sMainId + "C";
	var oCreateButtonElement = this.protected_CreateDivElement(oMainDiv, sCreateButtonId);
	var oCreateButtonControl = CreateControlContainerByElement(oCreateButtonElement);
	oCreateButtonControl.SetParams(0, 0, 5 + nButtonW + 5, 5, false, false, true, true, nButtonW, nButtonH);
	oCreateButtonControl.SetAnchor(false, false, true, true);
	oMainControl.AddControl(oCreateButtonControl);
	var oCreateButton = new CDrawingButtonSimpleText("Create", function()
	{
		oThis.private_CreateChallenge();
	}, "Create a new challenge");
	oCreateButton.Init(sCreateButtonId);
	this.m_oButtons.Create = oCreateButton;

	// Ok - кнопка для подтверждения
	var sOkButtonId      = sMainId + "O";
	var oOkButtonElement = this.protected_CreateDivElement(oMainDiv, sOkButtonId);
	var oOkButtonControl = CreateControlContainerByElement(oOkButtonElement);
	oOkButtonControl.SetParams(0, 0, 5 + nButtonW + 5, 5, false, false, true, true, nButtonW, nButtonH);
	oOkButtonControl.SetAnchor(false, false, true, true);
	oMainControl.AddControl(oOkButtonControl);
	var oOkButton = new CDrawingButtonSimpleText("OK", function()
	{
		oThis.private_OkChallenge();
	}, "OK");
	oOkButton.Init(sOkButtonId);
	this.m_oButtons.Ok = oOkButton;

	// Retry - кнопка для отмены предложения
	var sRetryButtonId      = sMainId + "R";
	var oRetryButtonElement = this.protected_CreateDivElement(oMainDiv, sRetryButtonId);
	var oRetryButtonControl = CreateControlContainerByElement(oRetryButtonElement);
	oRetryButtonControl.SetParams(0, 0, 5 + nButtonW + 5, 5, false, false, true, true, nButtonW, nButtonH);
	oRetryButtonControl.SetAnchor(false, false, true, true);
	oMainControl.AddControl(oRetryButtonControl);
	var oRetryButton = new CDrawingButtonSimpleText("Retry", function()
	{
		oThis.private_RetryChallenge();
	}, "Cancel current proposal");
	oRetryButton.Init(sRetryButtonId);
	this.m_oButtons.Retry = oRetryButton;
};
CKGSChallengeWindow.prototype.private_CreateChallenge = function()
{
	var sComment    = this.m_oCommentInput.value;
	var nGameType   = this.private_GetSelectedGameType();
	var nRules      = this.private_GetSelectedRules();
	var nSize       = this.m_oSizeInput.value;
	var oTimeSystem = this.m_oGameRecord.GetProposal().GetTimeSettings();

	this.m_oClient.SendCreateChallenge(this.m_nRoomId, this.m_nChannelId, nGameType, sComment, nRules, nSize, oTimeSystem);

	this.private_SetState(EKGSChallengeWindowState.Waiting);
	this.m_nGameType = nGameType;
};
CKGSChallengeWindow.prototype.private_OkChallenge = function()
{
	var nGameType   = this.private_GetSelectedGameType();
	var nRules      = this.private_GetSelectedRules();
	var nSize       = this.m_oSizeInput.value;
	var oTimeSystem = this.m_oGameRecord.GetProposal().GetTimeSettings();
	var nHandicap   = this.private_GetHandicap();
	var dKomi       = this.private_GetKomi();

	var oRules = {
		"rules"      : KGSCommon.GameRulesToString(nRules),
		"size"       : nSize,
		"handicap"   : nHandicap,
		"komi"       : dKomi,
		"timeSystem" : oTimeSystem.GetTypeInKGSString(),
		"mainTime"   : oTimeSystem.GetMainTime()
	};

	if (oTimeSystem.IsByoYomi())
	{
		oRules["byoYomiTime"]    = oTimeSystem.GetOverTime();
		oRules["byoYomiPeriods"] = oTimeSystem.GetOverCount();
	}
	else if (oTimeSystem.IsCanadian())
	{
		oRules["byoYomiTime"]   = oTimeSystem.GetOverTime();
		oRules["byoYomiStones"] = oTimeSystem.GetOverCount();
	}

	if (EKGSChallengeWindowState.CreatorProposal === this.m_nState)
	{
		// Proposal отправляется только когда заполнены все роли
		if (!this.m_oCurrentChallenger)
			return;

		this.m_oClient.SendChallengeProposal(this.m_nChannelId, nGameType, oRules, this.m_bNigiri, this.m_bCreatorBlack, this.m_oOwner.GetName(), this.m_oCurrentChallenger.GetName());
		this.private_SetState(EKGSChallengeWindowState.CreatorWaiting);
	}
	else if (EKGSChallengeWindowState.ChallengerSubmit === this.m_nState)
	{
		this.m_oClient.SendSubmitChallenge(this.m_nChannelId, nGameType, oRules, this.m_bNigiri, this.m_bCreatorBlack, this.m_oOwner.GetName());
		this.private_SetState(EKGSChallengeWindowState.ChallengerWaiting);
	}
	else if (EKGSChallengeWindowState.ChallengerAccept === this.m_nState)
	{
		this.m_oClient.SendAcceptChallenge(this.m_nChannelId, nGameType, oRules, this.m_bNigiri, this.m_bCreatorBlack, this.m_oOwner.GetName(), this.m_oCurrentChallenger.GetName());
		this.private_SetState(EKGSChallengeWindowState.Waiting);
	}
};
CKGSChallengeWindow.prototype.private_RetryChallenge = function()
{
	this.private_SetState(EKGSChallengeWindowState.CreatorProposal);
	this.m_oClient.RetryChallenge(this.m_nChannelId);
};
CKGSChallengeWindow.prototype.private_GetSelectedGameType = function()
{
	var nSelectedIndex = this.m_oGameTypeSelect.selectedIndex;
	switch (this.m_nType)
	{
		case EKGSChallengeWindowType.Regular:
		{
			if (0 === nSelectedIndex)
				return EKGSGameType.Ranked;
			else if (1 === nSelectedIndex)
				return EKGSGameType.Free;
			else if (2 === nSelectedIndex)
				return EKGSGameType.Teaching;

			break;
		}
		case EKGSChallengeWindowType.Unranked:
		{
			if (0 === nSelectedIndex)
				return EKGSGameType.Free;
			else if (1 === nSelectedIndex)
				return EKGSGameType.Teaching;

			break;
		}
		case EKGSChallengeWindowType.Rengo:
		{
			return EKGSGameType.Rengo;
		}
		case EKGSChallengeWindowType.Simulation:
		{
			return EKGSGameType.Simul;
		}
	}

	return EKGSGameType.Free;
};
CKGSChallengeWindow.prototype.private_SetSelectedGameType = function(nGameType)
{
	var nSelectedIndex = 0;
	switch (this.m_nType)
	{
		case EKGSChallengeWindowType.Regular:
		{
			if (EKGSGameType.Ranked === nGameType)
				nSelectedIndex = 0;
			else if (EKGSGameType.Free === nGameType)
				nSelectedIndex = 1;
			else if (EKGSGameType.Teaching === nGameType)
				nSelectedIndex = 2;

			break;
		}
		case EKGSChallengeWindowType.Unranked:
		{
			if (EKGSGameType.Free === nGameType)
				nSelectedIndex = 0;
			else if (EKGSGameType.Teaching === nGameType)
				nSelectedIndex = 1;

			break;
		}
		case EKGSChallengeWindowType.Rengo:
		case EKGSChallengeWindowType.Simulation:
		{
			nSelectedIndex = 0;
			break;
		}
	}

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
CKGSChallengeWindow.prototype.private_SetSelectedTimeSystem = function(nSystem)
{
	var nSelectedIndex = this.m_oTimeSystemSelect.selectedIndex;
	if (ETimeSettings.Absolute === nSystem)
		nSelectedIndex = 0;
	else if (ETimeSettings.ByoYomi === nSystem)
		nSelectedIndex = 1;
	else if (ETimeSettings.Canadian === nSystem)
		nSelectedIndex = 2;
	else if (ETimeSettings.None === nSystem)
		nSelectedIndex = 3;

	this.m_oTimeSystemSelect.selectedIndex = nSelectedIndex;
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
	var oGlobalSettings = this.private_GetGlobalSettings();

	var nTimeSystem   = this.private_GetSelectedTimeSystem();
	var oGameRecord   = this.m_oGameRecord;
	var oProposal     = oGameRecord.GetProposal();
	var oTimeSettings = oProposal.GetTimeSettings();

	if (ETimeSettings.Absolute === nTimeSystem)
	{
		var nMainTime = StringToSeconds(this.m_oMainTimeInput.value);

		if (nMainTime < 60)
			nMainTime = 60;
		else if (nMainTime > KGS_MAX_TIME)
			nMainTime = KGS_MAX_TIME;

		oTimeSettings.SetAbsolute(nMainTime);

		oGlobalSettings.SetKGSChallengeTimeSystem(ETimeSettings.Absolute);
		oGlobalSettings.SetKGSChallengeMainTime(nMainTime);
	}
	else if (ETimeSettings.ByoYomi === nTimeSystem)
	{
		var nMainTime = StringToSeconds(this.m_oMainTimeInput.value);
		var nByoTime  = StringToSeconds(this.m_oByoYomiTimeInput.value);
		var nByoCount = parseInt(this.m_oByoYomiCountInput.value);

		var _KGS_MAX_TIME = KGS_MAX_TIME / 2;

		if (isNaN(nByoCount) || nByoCount < 1)
			nByoCount = 1;
		else if (nByoCount > KGS_OVER_MAX_COUNT)
			nByoCount = KGS_OVER_MAX_COUNT;

		if (nByoTime < 1)
			nByoTime = 1;

		if (nByoTime > KGS_MAX_BYOYOMI_TIME)
			nByoTime = KGS_MAX_BYOYOMI_TIME;

		if (nByoTime * nByoCount > _KGS_MAX_TIME)
			nByoTime = _KGS_MAX_TIME / (nByoCount + 1);

		if (nMainTime + nByoTime * nByoCount > _KGS_MAX_TIME)
			nMainTime = _KGS_MAX_TIME - nByoTime * nByoCount;

		oTimeSettings.SetByoYomi(nMainTime, nByoTime, nByoCount);

		oGlobalSettings.SetKGSChallengeTimeSystem(ETimeSettings.ByoYomi);
		oGlobalSettings.SetKGSChallengeMainTime(nMainTime);
		oGlobalSettings.SetKGSChallengeOverTime(nByoTime);
		oGlobalSettings.SetKGSChallengeOverCount(nByoCount);
	}
	else if (ETimeSettings.Canadian === nTimeSystem)
	{
		var nMainTime = StringToSeconds(this.m_oMainTimeInput.value);
		var nByoTime  = StringToSeconds(this.m_oByoYomiTimeInput.value);
		var nByoCount = parseInt(this.m_oByoYomiCountInput.value);

		if (nMainTime > KGS_MAX_TIME)
			nMainTime = KGS_MAX_TIME;

		if (nByoTime < 1)
			nByoTime = 1;
		else if (nByoTime > KGS_MAX_TIME)
			nByoTime = KGS_MAX_TIME;

		if (isNaN(nByoCount) || nByoCount < 1)
			nByoCount = 1;
		else if (nByoCount > KGS_OVER_MAX_COUNT)
			nByoCount = KGS_OVER_MAX_COUNT;

		oTimeSettings.SetCanadian(nMainTime, nByoTime, nByoCount);

		oGlobalSettings.SetKGSChallengeTimeSystem(ETimeSettings.Canadian);
		oGlobalSettings.SetKGSChallengeMainTime(nMainTime);
		oGlobalSettings.SetKGSChallengeOverTime(nByoTime);
		oGlobalSettings.SetKGSChallengeOverCount(nByoCount);
	}
	else if (ETimeSettings.None === nTimeSystem)
	{
		oTimeSettings.SetNone();

		oGlobalSettings.SetKGSChallengeTimeSystem(ETimeSettings.None);
	}

	this.private_UpdateTimeSystemFields();
};
CKGSChallengeWindow.prototype.private_UpdateTimeSystemFields = function()
{
	var oGameRecord   = this.m_oGameRecord;
	var oProposal     = oGameRecord.GetProposal();
	var oTimeSettings = oProposal.GetTimeSettings();

	var bCanEdit = this.m_nState === EKGSChallengeWindowState.Creation ? true : false;

	if (oTimeSettings.IsAbsolute())
	{
		this.m_oMainTimeInput.value = oTimeSettings.GetMainTimeString();

		if (bCanEdit)
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

		if (bCanEdit)
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
	var bDefaultNigiri = this.private_GetDefaultNigiri();
	if (true === bDefaultNigiri)
		return 0;

	var oCreator    = this.m_oOwner;
	var oChallenger = this.m_oCurrentChallenger;

	var nChallengerRank = oChallenger.GetRank();
	var nCreatorRank    = oCreator.GetRank();

	var nHandicap = Math.min(Math.abs(nChallengerRank - nCreatorRank), 9);
	if (1 === nHandicap)
		return 0;

	return nHandicap;
};
CKGSChallengeWindow.prototype.private_GetDefaultKomi = function()
{
	var nRules = this.private_GetSelectedRules();

	var bDefaultNigiri = this.private_GetDefaultNigiri();
	if (true === bDefaultNigiri)
	{
		if (EKGSGameRules.Japanese === nRules)
			return 6.5;
		else if (EKGSGameRules.Chinese === nRules || EKGSGameRules.Aga === nRules)
			return 7.5;
		else if (EKGSGameRules.NewZealand === nRules)
			return 7;
	}
	else
	{
		return 0.5;
	}
};
CKGSChallengeWindow.prototype.private_GetDefaultNigiri = function()
{
	var oCreator    = this.m_oOwner;
	var oChallenger = this.m_oCurrentChallenger;

	if (!oChallenger || !oCreator)
		return true;

	var nChallengerRank = oChallenger.GetRank();
	var nCreatorRank    = oCreator.GetRank();

	// [?] или [-]
	if (nChallengerRank < 0 || nCreatorRank < 0)
		return true;

	return nChallengerRank === nCreatorRank ? true : false;
};
CKGSChallengeWindow.prototype.private_GetDefaultIsCreatorBlack = function()
{
	var bDefaultNigiri = this.private_GetDefaultNigiri();
	if (true === bDefaultNigiri)
		return false;

	var oCreator    = this.m_oOwner;
	var oChallenger = this.m_oCurrentChallenger;

	var nChallengerRank = oChallenger.GetRank();
	var nCreatorRank    = oCreator.GetRank();

	return nChallengerRank > nCreatorRank ? true : false;
};
CKGSChallengeWindow.prototype.private_GetDefaultGameType = function()
{
	return this.m_nGameType;
};
CKGSChallengeWindow.prototype.private_GetHandicap = function()
{
	return parseInt(this.m_oHandicapInput.value);
};
CKGSChallengeWindow.prototype.private_GetKomi = function()
{
	return parseFloat(this.m_oKomiInput.value);
};
CKGSChallengeWindow.prototype.private_UpdateButtons = function()
{
	if (EKGSChallengeWindowState.Unknown === this.m_nState || EKGSChallengeWindowState.Waiting === this.m_nState || EKGSChallengeWindowState.ChallengerWaiting === this.m_nState)
	{
		this.m_oButtons.Create.Hide();
		this.m_oButtons.Ok.Hide();
		this.m_oButtons.Retry.Hide();
		this.m_oButtons.Close.Show();
	}
	else if (EKGSChallengeWindowState.Creation === this.m_nState)
	{
		this.m_oButtons.Create.Show();
		this.m_oButtons.Ok.Hide();
		this.m_oButtons.Retry.Hide();
		this.m_oButtons.Close.Show();
	}
	else if (EKGSChallengeWindowState.CreatorProposal === this.m_nState)
	{
		this.m_oButtons.Create.Hide();
		this.m_oButtons.Retry.Hide();
		this.m_oButtons.Close.Show();

		if (null === this.m_oCurrentChallenger)
			this.m_oButtons.Ok.Hide();
		else
			this.m_oButtons.Ok.Show();
	}
	else if (EKGSChallengeWindowState.ChallengerSubmit === this.m_nState || EKGSChallengeWindowState.ChallengerAccept === this.m_nState)
	{
		this.m_oButtons.Create.Hide();
		this.m_oButtons.Ok.Show();
		this.m_oButtons.Retry.Hide();
		this.m_oButtons.Close.Show();
	}
	else if (EKGSChallengeWindowState.CreatorWaiting === this.m_nState)
	{
		this.m_oButtons.Create.Hide();
		this.m_oButtons.Ok.Hide();
		this.m_oButtons.Retry.Show();
		this.m_oButtons.Close.Show();
	}
};
CKGSChallengeWindow.prototype.private_UpdateCaption = function()
{
	var bAnimatedWaiting = false;
	if (EKGSChallengeWindowState.Creation === this.m_nState)
	{
		this.Set_Caption("Create a new challenge");
	}
	else if (EKGSChallengeWindowState.CreatorProposal === this.m_nState)
	{
		this.Set_Caption("Your challenge");
	}
	else if (EKGSChallengeWindowState.ChallengerSubmit === this.m_nState)
	{
		this.Set_Caption(this.m_oOwner ? "New game vs. " + this.m_oOwner.GetName() : "New game");
	}
	else if (EKGSChallengeWindowState.ChallengerAccept === this.m_nState)
	{
		this.Set_Caption("Press OK to start the game");
	}
	else if (EKGSChallengeWindowState.Waiting === this.m_nState)
	{
	}
	else if (EKGSChallengeWindowState.ChallengerWaiting === this.m_nState)
	{
		bAnimatedWaiting = true;
		this.Set_Caption("waiting...");
	}
	else if (EKGSChallengeWindowState.CreatorWaiting === this.m_nState)
	{
		bAnimatedWaiting = true;
		this.Set_Caption("waiting...");
	}
	else// if (EKGSChallengeWindowState.Unknown === this.m_nState)
	{
		this.Set_Caption("New game");
	}

	if (!bAnimatedWaiting)
		this.m_oAnimatedWaiting.Hide();
	else
		this.m_oAnimatedWaiting.Show();
};
CKGSChallengeWindow.prototype.private_UpdateOnStateChange = function()
{
	if (EKGSChallengeWindowState.Unknown === this.m_nState || EKGSChallengeWindowState.Waiting === this.m_nState || EKGSChallengeWindowState.ChallengerAccept === this.m_nState || EKGSChallengeWindowState.CreatorWaiting === this.m_nState || EKGSChallengeWindowState.ChallengerWaiting === this.m_nState)
	{
		this.m_oGameTypeSelect.className   = "challengeSelect challengeSelectDisabled";
		this.m_oGameTypeSelect.disabled    = "disabled";
		this.m_oCommentInput.className     = "challengeInput";
		this.m_oCommentInput.disabled      = "disabled";
		this.m_oRulesSelect.className      = "challengeSelect challengeSelectDisabled";
		this.m_oRulesSelect.disabled       = "disabled";
		this.m_oSizeInput.className        = "challengeInput";
		this.m_oSizeInput.disabled         = "disabled";
		this.m_oKomiInput.className        = "challengeInput";
		this.m_oKomiInput.disabled         = "disabled";
		this.m_oHandicapInput.className    = "challengeInput";
		this.m_oHandicapInput.disabled     = "disabled";
		this.m_oTimeSystemSelect.className = "challengeSelect challengeSelectDisabled";
		this.m_oTimeSystemSelect.disabled  = "disabled";
		this.m_oChallengerSelect.className = "challengeSelect challengeSelectDisabled";
		this.m_oChallengerSelect.disabled  = "disabled";
		this.m_oChallengerDiv.className    = "challengePlayer";
	}
	else if (EKGSChallengeWindowState.Creation === this.m_nState)
	{
		this.m_oGameTypeSelect.className   = "challengeSelect challengeSelectEditable";
		this.m_oGameTypeSelect.disabled    = "";
		this.m_oCommentInput.className     = "challengeInput challengeInputEditable";
		this.m_oCommentInput.disabled      = "";
		this.m_oRulesSelect.className      = "challengeSelect challengeSelectEditable";
		this.m_oRulesSelect.disabled       = "";
		this.m_oSizeInput.className        = "challengeInput challengeInputEditable";
		this.m_oSizeInput.disabled         = "";
		this.m_oKomiInput.className        = "challengeInput";
		this.m_oKomiInput.disabled         = "disabled";
		this.m_oHandicapInput.className    = "challengeInput";
		this.m_oHandicapInput.disabled     = "disabled";
		this.m_oTimeSystemSelect.className = "challengeSelect challengeSelectEditable";
		this.m_oTimeSystemSelect.disabled  = "";
		this.m_oChallengerSelect.className = "challengeSelect challengeSelectDisabled";
		this.m_oChallengerSelect.disabled  = "disabled";
		this.m_oChallengerDiv.className    = "challengePlayer";
	}
	else if (EKGSChallengeWindowState.CreatorProposal === this.m_nState)
	{
		this.m_oGameTypeSelect.className   = "challengeSelect challengeSelectDisabled";
		this.m_oGameTypeSelect.disabled    = "disabled";
		this.m_oCommentInput.className     = "challengeInput";
		this.m_oCommentInput.disabled      = "disabled";
		this.m_oRulesSelect.className      = "challengeSelect challengeSelectDisabled";
		this.m_oRulesSelect.disabled       = "disabled";
		this.m_oSizeInput.className        = "challengeInput";
		this.m_oSizeInput.disabled         = "disabled";
		this.m_oKomiInput.className        = "challengeInput";
		this.m_oKomiInput.disabled         = "disabled";
		this.m_oHandicapInput.className    = "challengeInput";
		this.m_oHandicapInput.disabled     = "disabled";
		this.m_oTimeSystemSelect.className = "challengeSelect challengeSelectDisabled";
		this.m_oTimeSystemSelect.disabled  = "disabled";
		this.m_oChallengerSelect.className = "challengeSelect challengeSelectEditable";
		this.m_oChallengerSelect.disabled  = "";
		this.m_oChallengerDiv.className    = "challengePlayer challengePlayerSelect";
	}
	else if (EKGSChallengeWindowState.ChallengerSubmit === this.m_nState)
	{
		this.m_oGameTypeSelect.className   = "challengeSelect challengeSelectDisabled";
		this.m_oGameTypeSelect.disabled    = "disabled";
		this.m_oCommentInput.className     = "challengeInput";
		this.m_oCommentInput.disabled      = "disabled";
		this.m_oRulesSelect.className      = "challengeSelect challengeSelectDisabled";
		this.m_oRulesSelect.disabled       = "disabled";
		this.m_oSizeInput.className        = "challengeInput";
		this.m_oSizeInput.disabled         = "disabled";
		this.m_oKomiInput.className        = "challengeInput challengeInputEditable";
		this.m_oKomiInput.disabled         = "";
		this.m_oHandicapInput.className    = "challengeInput challengeInputEditable";
		this.m_oHandicapInput.disabled     = "";
		this.m_oTimeSystemSelect.className = "challengeSelect challengeSelectDisabled";
		this.m_oTimeSystemSelect.disabled  = "disabled";
		this.m_oChallengerSelect.className = "challengeSelect challengeSelectDisabled";
		this.m_oChallengerSelect.disabled  = "disabled";
		this.m_oChallengerDiv.className    = "challengePlayer";


		this.m_oCurrentChallenger        = this.m_oClient.GetCurrentUser();
		this.m_oChallengerSpan.innerHTML = this.m_oCurrentChallenger.GetName() + "[" + this.m_oCurrentChallenger.GetStringRank() + "]";
		this.m_oChallengerSpan.title     = "View user info";
	}

	this.private_UpdateCaption();
	this.private_UpdateKomiAndHandicapFields();
	this.private_UpdateTimeSystemFields();
	this.private_UpdateButtons();
	this.Update_Size();
};
CKGSChallengeWindow.prototype.private_SetState = function(nState)
{
	this.m_nState = nState;
	this.private_UpdateOnStateChange();
};
CKGSChallengeWindow.prototype.private_UpdateKomiAndHandicapFields = function()
{
	if (EKGSChallengeWindowState.Waiting === this.m_nState || EKGSChallengeWindowState.CreatorWaiting === this.m_nState || EKGSChallengeWindowState.ChallengerAccept === this.m_nState || EKGSChallengeWindowState.ChallengerWaiting === this.m_nState)
		return;

	if (true !== this.m_bNigiri && (EKGSChallengeWindowState.ChallengerSubmit === this.m_nState || (EKGSChallengeWindowState.CreatorProposal === this.m_nState && null !== this.m_oCurrentChallenger)))
	{
		this.m_oKomiInput.className     = "challengeInput challengeInputEditable";
		this.m_oKomiInput.disabled      = "";
		this.m_oHandicapInput.className = "challengeInput challengeInputEditable";
		this.m_oHandicapInput.disabled  = "";
	}
	else
	{
		this.m_oKomiInput.value         = this.private_GetDefaultKomi();
		this.m_oHandicapInput.value     = this.private_GetDefaultHandicap();
		this.m_oKomiInput.className     = "challengeInput";
		this.m_oKomiInput.disabled      = "disabled";
		this.m_oHandicapInput.className = "challengeInput";
		this.m_oHandicapInput.disabled  = "disabled";
	}
};
CKGSChallengeWindow.prototype.private_RejectChallenge = function()
{
	if (this.m_oCurrentChallenger)
	{
		var oUser = this.m_oCurrentChallenger;
		this.OnUserRemoved(oUser);
		this.m_oClient.DeclineChallenge(this.m_nChannelId, oUser.GetName());
	}
};
CKGSChallengeWindow.prototype.private_FillDefaultCreatorValues = function()
{
	var oGlobalSettings = this.private_GetGlobalSettings();

	var sComment    = oGlobalSettings.GetKGSChallengeComment();
	var nGameType   = oGlobalSettings.GetKGSChallengeGameType();
	var nRules      = oGlobalSettings.GetKGSChallengeRules();
	var nSize       = oGlobalSettings.GetKGSChallengeBoardSize();
	var nTimeSystem = oGlobalSettings.GetKGSChallengeTimeSystem();
	var nMainTime   = oGlobalSettings.GetKGSChallengeMainTime();
	var nOverTime   = oGlobalSettings.GetKGSChallengeOverTime();
	var nOverCount  = oGlobalSettings.GetKGSChallengeOverCount();

	this.private_SetSelectedGameType(nGameType);
	this.m_oCommentInput.value = sComment;
	this.private_SetSelectedRules(nRules);
	this.m_oSizeInput.value = nSize;
	this.private_SetSelectedTimeSystem(nTimeSystem);
	this.m_oMainTimeInput.value     = nMainTime;
	this.m_oByoYomiTimeInput.value  = nOverTime;
	this.m_oByoYomiCountInput.value = nOverCount;

	this.private_OnChangeGameType();
	this.private_OnChangeComment();
	this.private_OnChangeRules();
	this.private_OnChangeBoardSize();
	this.private_UpdateTimeSystem();
};
CKGSChallengeWindow.prototype.private_FillDefaultChallengerValues = function()
{
	this.m_bNigiri              = this.private_GetDefaultNigiri();
	this.m_bCreatorBlack        = this.private_GetDefaultIsCreatorBlack();
	this.m_oKomiInput.value     = this.private_GetDefaultKomi();
	this.m_oHandicapInput.value = this.private_GetDefaultHandicap();
};
CKGSChallengeWindow.prototype.private_GetGlobalSettings = function()
{
	return this.m_oClient.m_oApp.GetGlobalSettings();
};