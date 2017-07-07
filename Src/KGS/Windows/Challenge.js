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
	Regular       : 0,
	Unranked      : 1,
	Rengo         : 2,
	Simulation    : 3,
	Demonstration : 4
};

function CKGSChallengeWindow()
{
	CKGSChallengeWindow.superclass.constructor.call(this);

	this.m_nState      = EKGSChallengeWindowState.Unknown;
	this.m_nType       = EKGSChallengeWindowType.Regular;
	
	this.m_bEnableRanked = false;

	this.m_nChannelId  = -1;
	this.m_oGameRecord = null;
	this.m_nRoomId     = -1;

	this.m_oOwner    = null;

	this.m_bNigiri       = true;
	this.m_bCreatorBlack = false;
	this.m_nGameType     = EKGSGameType.Free;

	this.m_nHeaderHeight  = 30;
	this.m_nPlayersHeight = 30;
	this.m_nFieldHeight   = 32;

	this.m_nFieldLabelWidth    = 100;
	this.m_nFieldValueMinWidth = 221;
	this.m_nSelectionW         = 110;

	this.m_oPlayersColorsCanvas  = null;
	this.m_oPlayersColorsControl = null;
	this.m_oAnimatedWaiting      = null;

	this.m_oButtons = {
		Close  : null,
		Ok     : null,
		Retry  : null,
		Create : null
	};

	this.m_oSavedPosition = {
		Left   : 0,
		Top    : 0,
		Height : 0,
		Width  : 0,
		Hided  : false
	};

	this.m_nDefW = 360;
	this.m_nDefH = 512;

	this.m_oChallengers = new CKGSChallengeWindowChallengersManager(this);

	this.m_oCurrentChallenger = null;
	this.m_arrChallengers     = [];
	this.m_arrRooms           = [];

	this.m_oRengoChallenger1  = null;
	this.m_oRengoChallenger2  = null;
	this.m_oRengoChallenger3  = null;
	this.m_oRengoChallengerElement = {

	};

	this.m_oChallengerElement      = null;
	this.m_oRengoChallengerElement = null;

	this.m_oCommentInput      = null;
	this.m_oGameTypeSelect    = null;
	this.m_oRoomSelect        = null;
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
	this.m_oPrivateCheckBox   = null;

	var oThis = this;
	this.private_OnChangeRoom = function()
	{
		if (!oThis.m_oRoomSelect)
			return;

		var nRoomId = oThis.private_GetSelectedRoomId();

		var oRoom = oThis.m_oClient.GetRoom(nRoomId);
		if (oRoom)
		{
			if (true === oRoom.Private)
			{
				oThis.m_oPrivateCheckBox.checked  = true;
				oThis.m_oPrivateCheckBox.disabled = "disabled";

				if (EKGSGameType.Ranked === oThis.private_GetSelectedGameType())
					oThis.private_SetSelectedGameType(EKGSGameType.Free);
			}
			else
			{
				if (oThis.m_oPrivateCheckBox.disabled !== "" && false !== oThis.m_oPrivateCheckBox.disabled)
					oThis.m_oPrivateCheckBox.checked  = false;

				oThis.m_oPrivateCheckBox.disabled = "";
			}
		}

		oThis.private_GetGlobalSettings().SetKGSChallengeRoomId(nRoomId);
	};
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
		if (nSelectedIndex <= 0)
		{
			oThis.m_oCurrentChallenger = null;
			oThis.m_oButtons.Ok.Hide();

			oChallengerSpan.innerHTML = "";
			oChallengerSpan.title     = "";

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
			oChallengerSpan.title     = g_oLocalization.KGS.window.challenge.challengerHint;

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
		oThis.Update_Size(); // Нужно вызывать из-за кнопки OK
	};
	this.private_OnChangeRengoChallenger = function()
	{
		// TODO: Реализовать
	};
	this.private_OnChangeColors = function()
	{
		if (EKGSChallengeWindowState.ChallengerSubmit === oThis.m_nState && EKGSGameType.Rengo === oThis.private_GetSelectedGameType())
			return;

		if (EKGSChallengeWindowState.ChallengerSubmit === oThis.m_nState || (EKGSChallengeWindowState.CreatorProposal === oThis.m_nState && oThis.private_IsChallengersReady()))
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
		var nGameType = oThis.private_GetSelectedGameType();
		var nRoomId   = oThis.private_GetSelectedRoomId();
		var oRoom     = oThis.m_oClient.GetRoom(nRoomId);

		if (oRoom && true === oRoom.Private && EKGSGameType.Ranked === nGameType)
		{
			oThis.private_SetSelectedGameType(EKGSGameType.Free);
		}
		else
		{
			oThis.private_GetGlobalSettings().SetKGSChallengeGameType(nGameType);

			if (EKGSGameType.Ranked === nGameType)
			{
				oThis.m_oPrivateCheckBox.disabled = "";
				oThis.m_oPrivateCheckBox.checked  = false;
			}
		}

		oThis.private_UpdateGameType();
	};
	this.private_OnChangeComment = function()
	{
		if (oThis.m_oCommentInput)
			oThis.private_GetGlobalSettings().SetKGSChallengeComment(oThis.m_oCommentInput.value);
	};
	this.private_OnChangePrivate = function()
	{
		if (oThis.m_nType === EKGSChallengeWindowType.Regular && true === oThis.m_bEnableRanked && true === oThis.m_oPrivateCheckBox.checked && EKGSGameType.Ranked === oThis.private_GetSelectedGameType())
		{
			oThis.private_SetSelectedGameType(EKGSGameType.Free);
			oThis.private_OnChangeGameType();
		}
	};
}
CommonExtend(CKGSChallengeWindow, CKGSWindowBase);

CKGSChallengeWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSChallengeWindow.superclass.Init.call(this, sDivId, oPr, false);

	// MinimizeButton
	var oMainDiv     = this.HtmlElement.Control.HtmlElement;
	var oMainControl = this.HtmlElement.Control;

	var sMinimizeButtonId      = sDivId + "_Minimize";
	var oMinimizeButtonElement = this.protected_CreateDivElement(oMainDiv, sMinimizeButtonId);
	var oMinimizeButtonControl = CreateControlContainer(sMinimizeButtonId);
	oMinimizeButtonControl.SetParams(0, 0, 45 + 6, 1000, false, true, true, false, 45, 20);
	oMinimizeButtonControl.SetAnchor(false, true, true, false);
	oMainControl.AddControl(oMinimizeButtonControl);

	var oThis = this;
	var oMinimizeButton = new CGoUniverseButtonMinimize(function()
	{
		oThis.Hide();
	});
	oMinimizeButton.Init(sMinimizeButtonId, this);
	this.HtmlElement.MinimizeButton = oMinimizeButton;
	this.HtmlElement.CaptionTextControl.SetParams(15, 0, 55 + 45 + 6, 1000, true, false, true, false, -1, 30);
	//--------------------------------------------------------------------------------------------
	
	this.HtmlElement.NameWrapperControl    = null;
	this.HtmlElement.PlayersWrapperControl = null;
	this.HtmlElement.RulesWrapperControl   = null;
	this.HtmlElement.RulesWrapperElement   = null;
	this.HtmlElement.ButtonsWrapperControl = null;

	this.m_nChannelId  = oPr.ChannelId;
	this.m_oGameRecord = oPr.GameRecord;
	this.m_nRoomId     = oPr.GameRecord.GetRoomId();

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	oMainDiv.style.background = "rgb(243, 243, 243)";

	var oChallengeCreator = this.m_oGameRecord.GetChallengeCreator();
	this.m_oOwner         = oChallengeCreator;

	if (true === oPr.Demonstration)
	{
		this.m_nState = EKGSChallengeWindowState.Creation;
		this.m_nType  = EKGSChallengeWindowType.Demonstration;
	}
	else if (true === oPr.Create)
	{
		this.m_nState        = EKGSChallengeWindowState.Creation;
		this.m_nType         = EKGSChallengeWindowType.Regular;
		this.m_bEnableRanked = this.m_oClient.GetCurrentUser().CanPlayRanked();
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
		this.m_nGameType     = this.m_oGameRecord.GetProposal().GetGameType();
		this.m_nType         = EKGSChallengeWindowType.Regular;
		this.m_bEnableRanked = this.m_oOwner && this.m_oOwner.CanPlayRanked() && (!this.m_oCurrentChallenger || this.m_oCurrentChallenger.CanPlayRanked()) ? true : false;
	}

	this.private_CreateName();
	this.private_CreatePlayers();
	this.private_CreateRules();
	this.private_CreateButtons();
	this.private_CreateAnimatedWaiting();

	this.private_CalculateWindowSize();
	this.private_UpdateGameType();

	if (true === oPr.Create)
		this.private_FillDefaultCreatorValues();
	else
		this.private_FillDefaultChallengerValues();

	this.private_UpdateOnStateChange();

	this.private_UpdateSize();
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

	if (this.HtmlElement.MinimizeButton)
		this.HtmlElement.MinimizeButton.Update_Size();
};
CKGSChallengeWindow.prototype.Get_DefaultWindowSize = function()
{
	return {W : this.m_nDefW, H : this.m_nDefH};
};
CKGSChallengeWindow.prototype.Close = function()
{
	CKGSChallengeWindow.superclass.Close.call(this);

	if (this.m_nType === EKGSChallengeWindowType.Demonstration)
		RemoveWindow(this);
	else
		this.m_oClient.CloseChallenge(this.m_nChannelId);
};
CKGSChallengeWindow.prototype.OnSubmit = function(oUser, oProposal)
{
	// this.m_arrChallengers.push({
	// 	Proposal : oProposal,
	// 	User     : oUser
	// });
	//
	// this.private_AddOptionToSelect(this.m_oChallengerSelect, oUser.GetName());

	this.m_oChallengers.AddUser(oUser, oProposal);

	if (1 === this.m_arrChallengers.length)
	{
		this.m_oChallengerSelect.selectedIndex = 1;
		this.private_OnChangeChallenger();
		this.Update_Size(); // Для обсчета кнопки Ok
		this.m_oClient.m_oApp.GetSound().PlayChallenger();
	}

	this.m_oClient.SendChallengeNotification(this.m_nChannelId);
};
CKGSChallengeWindow.prototype.OnDecline = function()
{
	var oChallengeCreator = this.m_oOwner;
	this.private_SetState(EKGSChallengeWindowState.ChallengerSubmit);

	CreateKGSWindow(EKGSWindowType.Information, {Client : this.m_oClient, App : this.m_oClient.m_oApp, Caption : g_oLocalization.common.window.captionWarning, Text : g_oLocalization.common.window.messageChallengeDeclined, Image : "WarningSpanWarning", W : 315, H : 145});
};
CKGSChallengeWindow.prototype.OnProposal = function(oProposal)
{
	if (EKGSChallengeWindowState.ChallengerWaiting === this.m_nState || EKGSChallengeWindowState.ChallengerAccept === this.m_nState || EKGSChallengeWindowState.Waiting === this.m_nState)
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

			this.m_oClient.SendChallengeNotification(this.m_nChannelId);
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
	this.m_oChallengers.RemoveUser(oUser);
	//
	// for (var nIndex = 0, nCount = this.m_arrChallengers.length; nIndex < nCount; ++nIndex)
	// {
	// 	if (this.m_arrChallengers[nIndex].User.GetName() === oUser.GetName())
	// 	{
	// 		this.m_arrChallengers.splice(nIndex, 1);
	// 		this.m_oChallengerSelect.remove(nIndex + 1);
	//
	// 		if (this.m_oCurrentChallenger && this.m_oCurrentChallenger.GetName() === oUser.GetName())
	// 		{
	// 			this.m_oChallengerSelect.selectedIndex = 0;
	// 			this.private_OnChangeChallenger();
	// 			this.private_SetState(EKGSChallengeWindowState.CreatorProposal);
	// 		}
	//
	// 		return;
	// 	}
	// }
};
CKGSChallengeWindow.prototype.GetChallengeCreator = function()
{
	return this.m_oOwner;
};
CKGSChallengeWindow.prototype.Hide = function()
{
	var oMainDiv = this.HtmlElement.Control.HtmlElement;

	oMainDiv.style.transitionProperty = "left, top,height";
	oMainDiv.style.transitionDuration = ".5s";

	this.m_oSavedPosition.Left   = oMainDiv.style.left;
	this.m_oSavedPosition.Top    = oMainDiv.style.top;
	this.m_oSavedPosition.Height = oMainDiv.style.height;
	this.m_oSavedPosition.Width  = oMainDiv.style.width;
	this.m_oSavedPosition.Hided  = true;

	var oLocation = oApp.GetButtonPlayLocation();

	oMainDiv.style.left   = oLocation.Left + "px";
	oMainDiv.style.top    = (oLocation.Top + oLocation.Height + 3) + "px";
	oMainDiv.style.height = "0px";
	oMainDiv.style.width  = oLocation.Width + "px";

	g_oFadeEffect.Out(oMainDiv, 500, null);
};
CKGSChallengeWindow.prototype.Show = function()
{
	if (true !== this.m_oSavedPosition.Hided)
	{
		this.Focus();
		return;
	}

	this.m_oSavedPosition.Hided  = false;

	var oMainDiv = this.HtmlElement.Control.HtmlElement;

	g_oFadeEffect.In(oMainDiv, -1, null);

	oMainDiv.style.left   = this.m_oSavedPosition.Left;
	oMainDiv.style.top    = this.m_oSavedPosition.Top;
	oMainDiv.style.height = this.m_oSavedPosition.Height;
	oMainDiv.style.width  = this.m_oSavedPosition.Width;

	oMainDiv.style.transitionProperty = "";
	oMainDiv.style.transitionDuration = "";

	this.Focus();
	this.Update_Size();
};
CKGSChallengeWindow.prototype.IsVisible = function()
{
	var oMainDiv = this.HtmlElement.Control.HtmlElement;
	return (oMainDiv.style.display === "none" ? false : true);
};
CKGSChallengeWindow.prototype.HaveChallengers = function()
{
	return (this.m_arrChallengers.length > 0 ? true : false);
};
CKGSChallengeWindow.prototype.IsWaitingForAccept = function()
{
	return this.m_nState === EKGSChallengeWindowState.ChallengerAccept ? true : false;
};
CKGSChallengeWindow.prototype.private_CreateName = function()
{
	var nLeftWidth = 120;
	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	
	var oNameWrapperDiv = this.protected_CreateDivElement(oMainDiv);
	var oNameWrapperControl = CreateControlContainerByElement(oNameWrapperDiv);

	oNameWrapperControl.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, 2 * this.m_nHeaderHeight);
	oNameWrapperControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oNameWrapperControl);
	
	this.HtmlElement.NameWrapperControl = oNameWrapperControl;
	

	var oWrapperDiv     = this.protected_CreateDivElement(oNameWrapperDiv);
	var oWrapperControl = CreateControlContainerByElement(oWrapperDiv);
	oWrapperControl.SetParams(0, this.m_nHeaderHeight, 1000, 1000, true, true, false, false, -1, this.m_nHeaderHeight);
	oWrapperControl.SetAnchor(false, true, true, false);
	oNameWrapperControl.AddControl(oWrapperControl);

	if (this.m_nType !== EKGSChallengeWindowType.Demonstration)
	{
		var oInput        = this.protected_CreateDivElement(oWrapperDiv, null, "input");
		var oInputControl = CreateControlContainerByElement(oInput);
		oInputControl.SetParams(5, 5, 5, 0, true, true, true, true, -1, -1);
		oInputControl.SetAnchor(true, true, true, true);
		oWrapperControl.AddControl(oInputControl);
		oInput.maxLength         = "80";
		oInput.placeholder       = g_oLocalization.KGS.window.challenge.commentPlaceHolder;
		oInput.style.paddingLeft = "3px";

		var sComment = this.m_oGameRecord.GetComment();
		if (sComment)
			oInput.value = sComment;

		this.m_oCommentInput = oInput;
		this.private_AddEventsForInput(this.private_OnChangeComment, oInput);
	}

	var oWrapperTypeDiv     = this.protected_CreateDivElement(oNameWrapperDiv);
	var oWrapperTypeControl = CreateControlContainerByElement(oWrapperTypeDiv);
	oWrapperTypeControl.SetParams(0, 0, -1, -1, true, true, false, false, 10 + this.m_nSelectionW, this.m_nHeaderHeight);
	oWrapperTypeControl.SetAnchor(true, true, false, false);
	oNameWrapperControl.AddControl(oWrapperTypeControl);

	var oTypeList       = this.protected_CreateDivElement(oWrapperTypeDiv, null, "select");
	oTypeList.style.fontWeight = "bold";
	oTypeList.style.padding = "";

	switch (this.m_nType)
	{
		case EKGSChallengeWindowType.Regular:
		{
			if (this.m_bEnableRanked)
				this.private_AddOptionToSelect(oTypeList, g_oLocalization.KGS.gameType.ranked);
			
			this.private_AddOptionToSelect(oTypeList, g_oLocalization.KGS.gameType.free);
			this.private_AddOptionToSelect(oTypeList, g_oLocalization.KGS.gameType.teaching);
			this.private_AddOptionToSelect(oTypeList, g_oLocalization.KGS.gameType.rengo);
			
			// TODO: Simulations are currently disabled
			//this.private_AddOptionToSelect(oTypeList, g_oLocalization.KGS.gameType.simulation);
			break;
		}
		case EKGSChallengeWindowType.Demonstration:
		{
			this.private_AddOptionToSelect(oTypeList, g_oLocalization.KGS.gameType.demonstration);
			break;
		}
	}

	var oTypeListControl = CreateControlContainerByElement(oTypeList);
	oTypeListControl.SetParams(5, 5, 5, 0, true, true, true, true, -1, -1);
	oTypeListControl.SetAnchor(true, true, true, true);
	oWrapperTypeControl.AddControl(oTypeListControl);

	var nPrivateHeight = this.m_nHeaderHeight - 5;
	var oWrapperPrivateDiv = this.protected_CreateDivElement(oNameWrapperDiv);
	var oWrapperPrivateControl = CreateControlContainerByElement(oWrapperPrivateDiv);
	oWrapperPrivateControl.SetParams(10 + this.m_nSelectionW, 5, 0, -1, true, true, true, false, -1, nPrivateHeight);
	oWrapperPrivateControl.SetAnchor(true, true, true, false);
	oNameWrapperControl.AddControl(oWrapperPrivateControl);

	var oPrivateCheckBox            = document.createElement("input");
	oPrivateCheckBox.style.position = "relative";
	oPrivateCheckBox.style.top      = (nPrivateHeight - 12) / 2 + "px";
	oPrivateCheckBox.style.width    = "12px";
	oPrivateCheckBox.style.height   = "12px";
	oPrivateCheckBox.type           = "checkbox";
	oPrivateCheckBox.checked        = this.m_oGameRecord.IsProposalPrivate();
	oPrivateCheckBox.disabled       = "disabled";
	oWrapperPrivateDiv.appendChild(oPrivateCheckBox);

	var oPrivateLabel              = document.createElement("div");
	oPrivateLabel.style.position   = "absolute";
	oPrivateLabel.style.top        = "0px";
	oPrivateLabel.style.left       = "15px";
	oPrivateLabel.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
	oPrivateLabel.style.fontSize   = "16px";
	oPrivateLabel.style.height     = nPrivateHeight + "px";
	oPrivateLabel.style.lineHeight = nPrivateHeight + "px";
	oPrivateLabel.textContent      = g_oLocalization.KGS.window.challenge.privateFlag;
	oWrapperPrivateDiv.appendChild(oPrivateLabel);

	if (this.m_nState === EKGSChallengeWindowState.Creation)
		oPrivateCheckBox.disabled = "";
	else
		oPrivateCheckBox.disabled = "disabled";

	this.m_oGameTypeSelect  = oTypeList;
	this.m_oPrivateCheckBox = oPrivateCheckBox;

	var oProposal = this.m_oGameRecord.GetProposal();
	if (oProposal)
	{
		var nType = oProposal.GetGameType();
		this.private_SetSelectedGameType(nType);
	}

	oPrivateCheckBox.onclick = this.private_OnChangePrivate;
	this.private_AddEventsForSelect(this.private_OnChangeGameType, oTypeList);
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
	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	
	var oPlayersWrapperElement = this.protected_CreateDivElement(oMainDiv);
	var oPlayersWrapperControl = CreateControlContainerByElement(oPlayersWrapperElement);	
	oPlayersWrapperControl.SetParams(0, this.m_nHeaderHeight * 2 + 10, 1000, 1000, false, true, false, false, -1, 2 * this.m_nPlayersHeight);
	oPlayersWrapperControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oPlayersWrapperControl);	
	this.HtmlElement.PlayersWrapperControl = oPlayersWrapperControl;

	var oPlayersColor        = this.protected_CreateDivElement(oPlayersWrapperElement, null, "canvas");
	var oPlayersColorControl = CreateControlContainerByElement(oPlayersColor);
	oPlayersColorControl.SetParams(10, 0, 0, 0, true, true, false, false, 50, 2 * this.m_nPlayersHeight);
	oPlayersColorControl.SetAnchor(true, true, false, false);
	oPlayersWrapperControl.AddControl(oPlayersColorControl);
	this.m_oPlayersColorsCanvas  = oPlayersColor;
	this.m_oPlayersColorsControl = oPlayersColorControl;

	oPlayersColor.style.cursor = "pointer";
	oPlayersColor.title = g_oLocalization.KGS.window.challenge.switchColorsHint;
	var oThis = this;
	oPlayersColor.addEventListener("click", this.private_OnChangeColors, false);

	var oCreatorPlayer  = this.protected_CreateDivElement(oPlayersWrapperElement);
	var oCreatorControl = CreateControlContainerByElement(oCreatorPlayer);
	oCreatorControl.SetParams(70, 0, 10, 0, true, true, true, false, -1, this.m_nPlayersHeight);
	oCreatorControl.SetAnchor(true, true, true, false);
	oPlayersWrapperControl.AddControl(oCreatorControl);
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
		oSpan.title = g_oLocalization.KGS.window.challenge.challengerHint;
		oCreatorPlayer.appendChild(oSpan);
	}

	var oChallengerElement = this.protected_CreateDivElement(oPlayersWrapperElement);
	var oChallengerControl = CreateControlContainerByElement(oChallengerElement);
	oChallengerControl.SetParams(70, this.m_nPlayersHeight, 10, 0, true, true, true, false, -1, 3 * this.m_nPlayersHeight);
	oChallengerControl.SetAnchor(true, true, true, false);
	oPlayersWrapperControl.AddControl(oChallengerControl);
	this.private_CreateChallengerElement(oChallengerElement, oChallengerControl);
	this.m_oChallengerElement = oChallengerElement;

	var oRengoChallengerElement = this.protected_CreateDivElement(oPlayersWrapperElement);
	var oRengoChallengerControl = CreateControlContainerByElement(oRengoChallengerElement);
	oRengoChallengerControl.SetParams(70, this.m_nPlayersHeight, 10, 0, true, true, true, false, -1, 3 * this.m_nPlayersHeight);
	oRengoChallengerControl.SetAnchor(true, true, true, false);
	oPlayersWrapperControl.AddControl(oRengoChallengerControl);
	this.private_CreateRengoChallengerElement(oRengoChallengerElement, oRengoChallengerControl);
	this.m_oRengoChallengerElement = oRengoChallengerElement;
	
	if (this.m_nType === EKGSChallengeWindowType.Demonstration)
		oPlayersWrapperElement.style.display = "none";
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
	
	function privateDrawNigiri(nX, nY)
	{
		oContext.fillStyle = "rgb(255, 255, 255)";
		oContext.beginPath();
		oContext.arc(nX, nY, nRad, 0, 2 * Math.PI, false);
		oContext.closePath();
		oContext.stroke();
		oContext.fill();

		oContext.fillStyle = "rgb(0, 0, 0)";
		oContext.beginPath();
		oContext.arc(nX, nY, nRad, 1.75 * Math.PI, 0.75 * Math.PI, false);
		oContext.closePath();
		oContext.stroke();
		oContext.fill();
	}
	function privateDrawBlack(nX, nY)
	{
		oContext.fillStyle = "rgb(0, 0, 0)";

		oContext.beginPath();
		oContext.arc(nX, nY, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();
	}
	function privateDrawWhite(nX, nY)
	{
		oContext.fillStyle = "rgb(255, 255, 255)";

		oContext.beginPath();
		oContext.arc(nX, nY, nRad, 0, 2 * Math.PI, false);
		oContext.stroke();
		oContext.fill();
	}
	
	var nGameType = this.private_GetSelectedGameType();
	if (EKGSGameType.Rengo === nGameType)
	{
		var nY3 = nSize * 2.5;
		var nY4 = nSize * 3.5;
		
		if (true === this.m_bNigiri)
		{
			privateDrawNigiri(nX, nY1);
			privateDrawNigiri(nX, nY2);
			privateDrawNigiri(nX, nY3);
			privateDrawNigiri(nX, nY4);
		}
		else if (true === this.m_bCreatorBlack)
		{
			privateDrawBlack(nX, nY1);
			privateDrawBlack(nX, nY2);
			privateDrawWhite(nX, nY3);
			privateDrawWhite(nX, nY4);
		}
		else
		{
			privateDrawWhite(nX, nY1);
			privateDrawWhite(nX, nY2);
			privateDrawBlack(nX, nY3);
			privateDrawBlack(nX, nY4);
		}
	}
	else if (EKGSGameType.Simul === nGameType)
	{
		// TODO: Implement
	}
	else
	{
		if (true === this.m_bNigiri)
		{
			privateDrawNigiri(nX, nY1);
			privateDrawNigiri(nX, nY2);
		}
		else if (true === this.m_bCreatorBlack)
		{
			privateDrawBlack(nX, nY1);
			privateDrawWhite(nX, nY2);
		}
		else
		{
			privateDrawWhite(nX, nY1);
			privateDrawBlack(nX, nY2);
		}
	}
};
CKGSChallengeWindow.prototype.private_CreateRules = function()
{
	var oThis = this;

	var oGameRecord = this.m_oGameRecord;
	var oProposal   = oGameRecord.GetProposal();

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	
	var oRulesWrapperElement = this.protected_CreateDivElement(oMainDiv);
	var oRulesWrapperControl = CreateControlContainerByElement(oRulesWrapperElement);

	if (EKGSChallengeWindowType.Demonstration === this.m_nType)	
		oRulesWrapperControl.SetParams(0, this.m_nHeaderHeight + 10, 1000, 1000, false, true, false, false, -1, 9 * this.m_nFieldHeight);
	else
		oRulesWrapperControl.SetParams(0, this.m_nHeaderHeight * 2 + 10 + this.m_nPlayersHeight * 2 + 10, 1000, 1000, false, true, false, false, -1, 9 * this.m_nFieldHeight);
	
	oRulesWrapperControl.SetAnchor(true, true, true, false);
	oMainControl.AddControl(oRulesWrapperControl);	
	this.HtmlElement.RulesWrapperControl = oRulesWrapperControl;
	this.HtmlElement.RulesWrapperElement = oRulesWrapperElement;

	var nLeftWidth = this.m_nFieldLabelWidth;
	var nTop       = 0;

	// Room
	var oRoomSelectElement = this.private_AddRulesField(nLeftWidth, nTop, "select", g_oLocalization.KGS.window.challenge.fieldRoom + ":");
	if (EKGSChallengeWindowState.Creation === this.m_nState)
	{
		var oClient  = this.m_oClient;
		var arrRooms = oClient.GetRooms();
		for (var nIndex = 0, nCount = arrRooms.length; nIndex < nCount; ++nIndex)
		{
			var oRoom = arrRooms[nIndex];
			this.private_AddOptionToSelect(oRoomSelectElement, oRoom.Name);
			this.m_arrRooms.push({
				Room     : oRoom,
				ChannelId: oRoom.ChannelId
			});
		}
	}
	else
	{
		var nRoomId = this.m_nRoomId;
		var oAllRooms = this.m_oClient.GetAllRooms();
		if (oAllRooms[nRoomId])
			this.private_AddOptionToSelect(oRoomSelectElement, oAllRooms[nRoomId].Name);
		else
			this.private_AddOptionToSelect(oRoomSelectElement, "Unknown");
	}
	this.m_oRoomSelect = oRoomSelectElement;

	nTop += this.m_nFieldHeight;

	// Rules
	var oRulesSelectElement = this.private_AddRulesField(nLeftWidth, nTop, "select", g_oLocalization.KGS.window.challenge.fieldRules + ":");
	this.private_AddOptionToSelect(oRulesSelectElement, g_oLocalization.common.rules.japanese);
	this.private_AddOptionToSelect(oRulesSelectElement, g_oLocalization.common.rules.chinese);
	this.private_AddOptionToSelect(oRulesSelectElement, g_oLocalization.common.rules.aga);
	this.private_AddOptionToSelect(oRulesSelectElement, g_oLocalization.common.rules.newZealand);
	this.m_oRulesSelect = oRulesSelectElement;

	nTop += this.m_nFieldHeight;

	// BoardSize
	var oBoardElement = this.private_AddRulesField(nLeftWidth, nTop, "input", g_oLocalization.KGS.window.challenge.fieldBorderSize + ":");
	oBoardElement.value = "19";
	this.m_oSizeInput = oBoardElement;
	nTop += this.m_nFieldHeight;

	// Handicap
	var oHandicapElement = this.private_AddRulesField(nLeftWidth, nTop, "input", g_oLocalization.KGS.window.challenge.fieldHandicap + ":");
	oHandicapElement.value = "0";
	this.m_oHandicapInput = oHandicapElement;

	nTop += this.m_nFieldHeight;

	// Komi
	var oKomiElement = this.private_AddRulesField(nLeftWidth, nTop, "input", g_oLocalization.KGS.window.challenge.fieldKomi + ":");
	oKomiElement.value = "6.5";
	this.m_oKomiInput = oKomiElement;
	nTop += this.m_nFieldHeight;

	// TimeSystem
	var oTimeSystemElement = this.private_AddRulesField(nLeftWidth, nTop, "select", g_oLocalization.KGS.window.challenge.fieldTimeSystem + ":");
	this.private_AddOptionToSelect(oTimeSystemElement, g_oLocalization.common.timeSystem.absolute);
	this.private_AddOptionToSelect(oTimeSystemElement, g_oLocalization.common.timeSystem.byoYomi);
	this.private_AddOptionToSelect(oTimeSystemElement, g_oLocalization.common.timeSystem.canadian);
	this.private_AddOptionToSelect(oTimeSystemElement, g_oLocalization.common.timeSystem.none);
	this.m_oTimeSystemSelect = oTimeSystemElement;
	nTop += this.m_nFieldHeight;

	// MainTime
	var oMainTimeElement = this.private_AddRulesField(nLeftWidth, nTop, "input", g_oLocalization.KGS.window.challenge.fieldMainTime + ":");
	oMainTimeElement.value = "10:00";
	this.m_oMainTimeInput = oMainTimeElement;
	nTop += this.m_nFieldHeight;

	// ByoYomi time
	var oByoTimeElement = this.private_AddRulesField(nLeftWidth, nTop, "input", g_oLocalization.KGS.window.challenge.fieldByoYomiTime + ":");
	oByoTimeElement.value = "00:30";
	this.m_oByoYomiTimeInput = oByoTimeElement;
	nTop += this.m_nFieldHeight;

	// ByoYomi count
	var oTemp = this.private_AddRulesField(nLeftWidth, nTop, "input", g_oLocalization.KGS.window.challenge.fieldPeriods + ":", true);
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

	this.private_AddEventsForSelect(this.private_OnChangeRoom, oRoomSelectElement);
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
	var oMainDiv     = this.HtmlElement.RulesWrapperElement;
	var oMainControl = this.HtmlElement.RulesWrapperControl;

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
	
	var nButtonH = 25;

	var oButtonsWrapperElement = this.protected_CreateDivElement(oMainDiv);
	var oButtonsWrapperControl = CreateControlContainerByElement(oButtonsWrapperElement);
	oButtonsWrapperControl.SetParams(0, 0, 1000, 5, false, false, false, true, -1, nButtonH);
	oButtonsWrapperControl.SetAnchor(true, false, true, true);
	oMainControl.AddControl(oButtonsWrapperControl);

	g_oTextMeasurer.SetFont("16px 'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif");
	var nButtonW = Math.max(60,
			g_oTextMeasurer.Measure(g_oLocalization.common.button.close),
			g_oTextMeasurer.Measure(g_oLocalization.common.button.create),
			g_oTextMeasurer.Measure(g_oLocalization.common.button.ok),
			g_oTextMeasurer.Measure(g_oLocalization.common.button.buttonRetry)
		) + 10;

	// Всевозможные кнопки добавляем сразу, а вот их реальное присутствие в окне будет зависеть уже от типа окна

	// Close - общая кнопка
	var sCloseButtonId      = sMainId + "Z";
	var oCloseButtonElement = this.protected_CreateDivElement(oButtonsWrapperElement, sCloseButtonId);
	var oCloseButtonControl = CreateControlContainerByElement(oCloseButtonElement);
	oCloseButtonControl.SetParams(0, 0, 5, 0, false, false, true, true, nButtonW, nButtonH);
	oCloseButtonControl.SetAnchor(false, false, true, true);
	oButtonsWrapperControl.AddControl(oCloseButtonControl);
	var oCloseButton = new CDrawingButtonSimpleText(g_oLocalization.common.button.close, function()
	{
		oThis.Close();
	}, "");
	oCloseButton.Init(sCloseButtonId);
	this.m_oButtons.Close = oCloseButton;

	// Create - кнопка для создания вызова
	var sCreateButtonId      = sMainId + "C";
	var oCreateButtonElement = this.protected_CreateDivElement(oButtonsWrapperElement, sCreateButtonId);
	var oCreateButtonControl = CreateControlContainerByElement(oCreateButtonElement);
	oCreateButtonControl.SetParams(0, 0, 5 + nButtonW + 5, 0, false, false, true, true, nButtonW, nButtonH);
	oCreateButtonControl.SetAnchor(false, false, true, true);
	oButtonsWrapperControl.AddControl(oCreateButtonControl);
	var oCreateButton = new CDrawingButtonSimpleText(g_oLocalization.common.button.create, function()
	{
		oThis.private_CreateChallenge();
	}, "");
	oCreateButton.Init(sCreateButtonId);
	this.m_oButtons.Create = oCreateButton;

	// Ok - кнопка для подтверждения
	var sOkButtonId      = sMainId + "O";
	var oOkButtonElement = this.protected_CreateDivElement(oButtonsWrapperElement, sOkButtonId);
	var oOkButtonControl = CreateControlContainerByElement(oOkButtonElement);
	oOkButtonControl.SetParams(0, 0, 5 + nButtonW + 5, 0, false, false, true, true, nButtonW, nButtonH);
	oOkButtonControl.SetAnchor(false, false, true, true);
	oButtonsWrapperControl.AddControl(oOkButtonControl);
	var oOkButton = new CDrawingButtonSimpleText(g_oLocalization.common.button.ok, function()
	{
		oThis.private_OkChallenge();
	}, "");
	oOkButton.Init(sOkButtonId);
	this.m_oButtons.Ok = oOkButton;

	// Retry - кнопка для отмены предложения
	var sRetryButtonId      = sMainId + "R";
	var oRetryButtonElement = this.protected_CreateDivElement(oButtonsWrapperElement, sRetryButtonId);
	var oRetryButtonControl = CreateControlContainerByElement(oRetryButtonElement);
	oRetryButtonControl.SetParams(0, 0, 5 + nButtonW + 5, 0, false, false, true, true, nButtonW, nButtonH);
	oRetryButtonControl.SetAnchor(false, false, true, true);
	oButtonsWrapperControl.AddControl(oRetryButtonControl);
	var oRetryButton = new CDrawingButtonSimpleText(g_oLocalization.KGS.window.challenge.buttonRetry, function()
	{
		oThis.private_RetryChallenge();
	}, g_oLocalization.KGS.window.challenge.buttonRetryHint);
	oRetryButton.Init(sRetryButtonId);
	this.m_oButtons.Retry = oRetryButton;
};
CKGSChallengeWindow.prototype.private_CreateChallenge = function()
{
	var nRules      = this.private_GetSelectedRules();
	var nSize       = this.m_oSizeInput.value;
	var oTimeSystem = this.m_oGameRecord.GetProposal().GetTimeSettings();
	var nRoomId     = this.private_GetSelectedRoomId();
	var bPrivate    = this.private_IsPrivate();

	if (this.m_nType === EKGSChallengeWindowType.Demonstration)
	{
		this.m_oClient.SendCreateDemonstration(nRoomId, this.m_nChannelId, nRules, nSize, oTimeSystem, bPrivate);
		this.Close();
	}
	else
	{
		var sComment  = this.m_oCommentInput.value;
		var nGameType = this.private_GetSelectedGameType();

		this.m_oClient.SendCreateChallenge(nRoomId, this.m_nChannelId, nGameType, sComment, nRules, nSize, oTimeSystem, bPrivate);

		this.private_SetState(EKGSChallengeWindowState.Waiting);
		this.m_nGameType = nGameType;

	}
};
CKGSChallengeWindow.prototype.private_OkChallenge = function()
{
	var nGameType   = this.private_GetSelectedGameType();
	var nRules      = this.private_GetSelectedRules();
	var nSize       = this.m_oSizeInput.value;
	var oTimeSystem = this.m_oGameRecord.GetProposal().GetTimeSettings();
	var nHandicap   = this.private_GetHandicap();
	var dKomi       = this.private_GetKomi();
	var bPrivate    = this.private_IsPrivate();

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

		this.m_oClient.SendChallengeProposal(this.m_nChannelId, nGameType, oRules, this.m_bNigiri, this.m_bCreatorBlack, this.m_oOwner.GetName(), this.m_oCurrentChallenger.GetName(), bPrivate);
		this.private_SetState(EKGSChallengeWindowState.CreatorWaiting);
	}
	else if (EKGSChallengeWindowState.ChallengerSubmit === this.m_nState)
	{
		if (nGameType === EKGSGameType.Simul)
		{
			this.Close();
			CreateKGSWindow(EKGSWindowType.Information, {Client : this, App : this.m_oApp, Caption : g_oLocalization.common.window.captionWarning, Text : "Sorry, simulations are not supported in the current version.", Image : "WarningSpanWarning", W : 347, H : 144});
			return;
		}

		this.m_oClient.SendSubmitChallenge(this.m_nChannelId, nGameType, oRules, this.m_bNigiri, this.m_bCreatorBlack, this.m_oOwner.GetName(), bPrivate);
		this.private_SetState(EKGSChallengeWindowState.ChallengerWaiting);
	}
	else if (EKGSChallengeWindowState.ChallengerAccept === this.m_nState)
	{
		this.m_oClient.SendAcceptChallenge(this.m_nChannelId, nGameType, oRules, this.m_bNigiri, this.m_bCreatorBlack, this.m_oOwner.GetName(), this.m_oCurrentChallenger.GetName(), bPrivate);
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
	if (!this.m_oGameTypeSelect)
		return EKGSGameType.Free;
	
	var nSelectedIndex = this.m_oGameTypeSelect.selectedIndex;
	switch (this.m_nType)
	{
		case EKGSChallengeWindowType.Regular:
		{
			if (this.m_bEnableRanked)
			{
				if (0 === nSelectedIndex)
					return EKGSGameType.Ranked;
				else if (1 === nSelectedIndex)
					return EKGSGameType.Free;
				else if (2 === nSelectedIndex)
					return EKGSGameType.Teaching;
				else if (3 === nSelectedIndex)
					return EKGSGameType.Rengo;
				else if (4 === nSelectedIndex)
					return EKGSGameType.Simul;
			}
			else
			{
				if (0 === nSelectedIndex)
					return EKGSGameType.Free;
				else if (1 === nSelectedIndex)
					return EKGSGameType.Teaching;
				else if (2 === nSelectedIndex)
					return EKGSGameType.Rengo;
				else if (3 === nSelectedIndex)
					return EKGSGameType.Simul;
			}
			break;
		}		
		case EKGSChallengeWindowType.Demonstration:
		{
			return EKGSGameType.Demonstration;
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
			if (this.m_bEnableRanked)
			{
				if (EKGSGameType.Ranked === nGameType)
					nSelectedIndex = 0;
				else if (EKGSGameType.Free === nGameType)
					nSelectedIndex = 1;
				else if (EKGSGameType.Teaching === nGameType)
					nSelectedIndex = 2;
				else if (EKGSGameType.Rengo === nGameType)
					nSelectedIndex = 3;
				else if (EKGSGameType.Simul === nGameType)
					nSelectedIndex = 4;
			}
			else
			{
				if (EKGSGameType.Free === nGameType)
					nSelectedIndex = 0;
				else if (EKGSGameType.Teaching === nGameType)
					nSelectedIndex = 1;
				else if (EKGSGameType.Rengo === nGameType)
					nSelectedIndex = 2;
				else if (EKGSGameType.Simul === nGameType)
					nSelectedIndex = 3;
			}

			break;
		}
		case EKGSChallengeWindowType.Demonstration:
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
CKGSChallengeWindow.prototype.private_GetSelectedRoomId = function()
{
	return this.m_arrRooms[this.m_oRoomSelect.selectedIndex].ChannelId;
};
CKGSChallengeWindow.prototype.private_SetSelectedRoomId = function(nRoomId)
{
	if (this.m_arrRooms.length <= 0)
		return;

	for (var nIndex = 0, nCount = this.m_arrRooms.length; nIndex < nCount; ++nIndex)
	{
		var oRoomRecord = this.m_arrRooms[nIndex];
		if (nRoomId === oRoomRecord.ChannelId)
		{
			this.m_oRoomSelect.selectedIndex = nIndex;
			return;
		}
	}
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
			this.m_oOverCountLabel.innerHTML = g_oLocalization.KGS.window.challenge.fieldPeriods + ":";
		else
			this.m_oOverCountLabel.innerHTML = g_oLocalization.KGS.window.challenge.fieldStones + ":";
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
CKGSChallengeWindow.prototype.private_GetDefaultHandicap = function(bNigiri)
{
	var bDefaultNigiri = this.private_GetDefaultNigiri();
	if (true === bDefaultNigiri || true === bNigiri)
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
CKGSChallengeWindow.prototype.private_GetDefaultKomi = function(bNigiri)
{
	var nRules = this.private_GetSelectedRules();

	var bDefaultNigiri = this.private_GetDefaultNigiri();
	if (true === bDefaultNigiri || true === bNigiri || EKGSGameType.Rengo === this.private_GetSelectedGameType())
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
	if (EKGSGameType.Rengo === this.private_GetSelectedGameType())
		return true;

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
CKGSChallengeWindow.prototype.private_IsPrivate = function()
{
	return this.m_oPrivateCheckBox.checked === true ? true : false;
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
		if (this.m_nType === EKGSChallengeWindowType.Demonstration)
			this.Set_Caption(g_oLocalization.KGS.window.challenge.captionNewDemo);
		else
			this.Set_Caption(g_oLocalization.KGS.window.challenge.captionNewChallenge);
	}
	else if (EKGSChallengeWindowState.CreatorProposal === this.m_nState)
	{
		this.Set_Caption(g_oLocalization.KGS.window.challenge.captionYourChallenge);
	}
	else if (EKGSChallengeWindowState.ChallengerSubmit === this.m_nState)
	{
		this.Set_Caption(this.m_oOwner ? g_oLocalization.KGS.window.challenge.captionNewGameVs + " " + this.m_oOwner.GetName() : g_oLocalization.KGS.window.challenge.captionNewGame);
	}
	else if (EKGSChallengeWindowState.ChallengerAccept === this.m_nState)
	{
		this.Set_Caption(g_oLocalization.KGS.window.challenge.captionPressOkToStart);
	}
	else if (EKGSChallengeWindowState.Waiting === this.m_nState)
	{
	}
	else if (EKGSChallengeWindowState.ChallengerWaiting === this.m_nState)
	{
		bAnimatedWaiting = true;
		this.Set_Caption(g_oLocalization.KGS.window.challenge.captionWaiting);
	}
	else if (EKGSChallengeWindowState.CreatorWaiting === this.m_nState)
	{
		bAnimatedWaiting = true;
		this.Set_Caption(g_oLocalization.KGS.window.challenge.captionWaiting);
	}
	else// if (EKGSChallengeWindowState.Unknown === this.m_nState)
	{
		this.Set_Caption(g_oLocalization.KGS.window.challenge.captionNewGame);
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
		this.m_oRoomSelect.className       = "challengeSelect challengeSelectDisabled";
		this.m_oRoomSelect.disabled        = "disabled";
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
		this.m_oPrivateCheckBox.disabled   = "disabled";

		this.m_oChallengers.Disable();
	}
	else if (EKGSChallengeWindowState.Creation === this.m_nState)
	{
		if (EKGSChallengeWindowType.Demonstration !== this.m_nType)
		{
			this.m_oCommentInput.className     = "challengeInput challengeInputEditable";
			this.m_oCommentInput.disabled      = "";
			this.m_oGameTypeSelect.className   = "challengeSelect challengeSelectEditable";
			this.m_oGameTypeSelect.disabled    = "";

			this.m_oChallengers.Disable();
		}
		else
		{
			this.m_oGameTypeSelect.className = "challengeSelect challengeSelectDisabled";
			this.m_oGameTypeSelect.disabled  = "disabled";
		}
		this.m_oRoomSelect.className       = "challengeSelect challengeSelectEditable";
		this.m_oRoomSelect.disabled        = "";
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
	}
	else if (EKGSChallengeWindowState.CreatorProposal === this.m_nState)
	{
		this.m_oGameTypeSelect.className   = "challengeSelect challengeSelectDisabled";
		this.m_oGameTypeSelect.disabled    = "disabled";
		this.m_oCommentInput.className     = "challengeInput";
		this.m_oCommentInput.disabled      = "disabled";
		this.m_oRoomSelect.className       = "challengeSelect challengeSelectDisabled";
		this.m_oRoomSelect.disabled        = "disabled";
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
		this.m_oPrivateCheckBox.disabled   = "disabled";

		this.m_oChallengers.Enable();
	}
	else if (EKGSChallengeWindowState.ChallengerSubmit === this.m_nState)
	{
		this.m_oGameTypeSelect.className   = "challengeSelect challengeSelectDisabled";
		this.m_oGameTypeSelect.disabled    = "disabled";
		this.m_oCommentInput.className     = "challengeInput";
		this.m_oCommentInput.disabled      = "disabled";
		this.m_oRoomSelect.className      = "challengeSelect challengeSelectDisabled";
		this.m_oRoomSelect.disabled       = "disabled";
		this.m_oRulesSelect.className      = "challengeSelect challengeSelectDisabled";
		this.m_oRulesSelect.disabled       = "disabled";
		this.m_oSizeInput.className        = "challengeInput";
		this.m_oSizeInput.disabled         = "disabled";

		if (this.private_GetSelectedGameType() === EKGSGameType.Rengo)
		{
			this.m_oKomiInput.className     = "challengeInput";
			this.m_oKomiInput.disabled      = "disabled";
			this.m_oHandicapInput.className = "challengeInput";
			this.m_oHandicapInput.disabled  = "disabled";
		}
		else
		{
			this.m_oKomiInput.className     = "challengeInput challengeInputEditable";
			this.m_oKomiInput.disabled      = "";
			this.m_oHandicapInput.className = "challengeInput challengeInputEditable";
			this.m_oHandicapInput.disabled  = "";
		}
		this.m_oTimeSystemSelect.className = "challengeSelect challengeSelectDisabled";
		this.m_oTimeSystemSelect.disabled  = "disabled";
		this.m_oPrivateCheckBox.disabled   = "disabled";

		this.m_oChallengers.Disable();
		this.m_oChallengers.SetChallenger(this.m_oClient.GetCurrentUser(), 0);
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

	if (true !== this.m_bNigiri
		&& (EKGSChallengeWindowState.ChallengerSubmit === this.m_nState
		|| (EKGSChallengeWindowState.CreatorProposal === this.m_nState
		&& null !== this.m_oCurrentChallenger))
		&& EKGSGameType.Rengo !== this.private_GetSelectedGameType())
	{
		this.m_oKomiInput.className     = "challengeInput challengeInputEditable";
		this.m_oKomiInput.disabled      = "";
		this.m_oHandicapInput.className = "challengeInput challengeInputEditable";
		this.m_oHandicapInput.disabled  = "";
	}
	else
	{
		this.m_oKomiInput.value         = this.private_GetDefaultKomi(this.m_bNigiri);
		this.m_oHandicapInput.value     = this.private_GetDefaultHandicap(this.m_bNigiri);
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
	var nRoomId     = oGlobalSettings.GetKGSChallengeRoomId();
	var nRules      = oGlobalSettings.GetKGSChallengeRules();
	var nSize       = oGlobalSettings.GetKGSChallengeBoardSize();
	var nTimeSystem = oGlobalSettings.GetKGSChallengeTimeSystem();
	var nMainTime   = oGlobalSettings.GetKGSChallengeMainTime();
	var nOverTime   = oGlobalSettings.GetKGSChallengeOverTime();
	var nOverCount  = oGlobalSettings.GetKGSChallengeOverCount();

	var nChatChannelId = this.m_oClient.GetCurrentChatId();
	if (true !== this.m_oClient.IsPrivateChat(nChatChannelId))
		nRoomId = nChatChannelId;

	this.private_SetSelectedGameType(nGameType);

	if (this.m_oCommentInput)
		this.m_oCommentInput.value = sComment;

	this.private_SetSelectedRoomId(nRoomId);
	this.private_SetSelectedRules(nRules);
	this.m_oSizeInput.value = nSize;
	this.private_SetSelectedTimeSystem(nTimeSystem);
	this.m_oMainTimeInput.value     = nMainTime;
	this.m_oByoYomiTimeInput.value  = nOverTime;
	this.m_oByoYomiCountInput.value = nOverCount;

	this.private_OnChangeRoom();
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
CKGSChallengeWindow.prototype.private_CalculateWindowSize = function()
{
	g_oTextMeasurer.SetFont("16px 'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif");
	this.m_nFieldLabelWidth = Math.max(
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldRoom),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldRules),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldBorderSize),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldHandicap),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldKomi),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldTimeSystem),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldMainTime),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldByoYomiTime),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldPeriods),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.fieldStones),
		100
	) + g_oTextMeasurer.Measure(":") + 1;

	var nFieldLineW = 7 + 10 + this.m_nFieldLabelWidth + 10 + this.m_nFieldValueMinWidth + 5 + 7;

	g_oTextMeasurer.SetFont("13pt Tahoma, 'Sans serif'");
	var nCaptionW = Math.max(
		220,
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.captionNewChallenge),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.captionNewDemo),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.captionYourChallenge),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.captionNewGameVs),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.captionNewGame),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.captionPressOkToStart),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.challenge.captionWaiting)
	);
	var nCaptionW = 122 + nCaptionW;

	this.m_nDefW = Math.max(nCaptionW, nFieldLineW);

	g_oTextMeasurer.SetFont("16px bold 'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif");

	this.m_nSelectionW = 25;
	switch (this.m_nType)
	{
		case EKGSChallengeWindowType.Regular:
		{
			if (this.m_bEnableRanked)
			{
				this.m_nSelectionW += Math.max(
					g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.free),
					g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.ranked),
					g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.teaching),
					g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.rengo),
					g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.simulation)
				);
			}
			else
			{
				this.m_nSelectionW += Math.max(
					g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.free),
					g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.teaching),
					g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.rengo),
					g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.simulation)
				);
			}
			
			break;
		}
		case EKGSChallengeWindowType.Demonstration:
		{
			this.m_nSelectionW += g_oTextMeasurer.Measure(g_oLocalization.KGS.gameType.demonstration);
			break;
		}
	}

	this.private_UpdateWindowSize();
};
CKGSChallengeWindow.prototype.private_UpdateWindowSize = function()
{
	var nBounds = 35;
	
	var nRulesHeight   = 9 * this.m_nFieldHeight;
	var nButtonsHeight = 25;
	var nGameType      = this.private_GetSelectedGameType();
	
	if (this.m_nType === EKGSChallengeWindowType.Demonstration)
		this.m_nDefH = nBounds + this.m_nHeaderHeight + 10 + nRulesHeight + 5 + nButtonsHeight + 5;
	else if (EKGSGameType.Rengo === nGameType)
		this.m_nDefH = nBounds + this.m_nHeaderHeight * 2 + 10 + this.m_nPlayersHeight * 4 + 10 + nRulesHeight + 5 + nButtonsHeight + 5;
	else
		this.m_nDefH = nBounds + this.m_nHeaderHeight * 2 + 10 + this.m_nPlayersHeight * 2 + 10 + nRulesHeight + 5 + nButtonsHeight + 5;
};
CKGSChallengeWindow.prototype.private_UpdateGameType = function()
{
	var nGameType = this.private_GetSelectedGameType();
	
	if (EKGSChallengeWindowType.Demonstration === this.m_nType)
	{
		this.HtmlElement.RulesWrapperControl.SetParams(0, this.m_nHeaderHeight + 10, 1000, 1000, false, true, false, false, -1, 9 * this.m_nFieldHeight);	
	}
	else if (EKGSGameType.Rengo === nGameType)
	{
		this.HtmlElement.PlayersWrapperControl.SetParams(0, this.m_nHeaderHeight * 2 + 10, 1000, 1000, false, true, false, false, -1, 4 * this.m_nPlayersHeight);		
		this.HtmlElement.RulesWrapperControl.SetParams(0, this.m_nHeaderHeight * 2 + 10 + 4 * this.m_nPlayersHeight + 10, 1000, 1000, false, true, false, false, -1, 9 * this.m_nFieldHeight);	
		this.m_oPlayersColorsControl.SetParams(10, 0, 0, 0, true, true, false, false, 50, 4 * this.m_nPlayersHeight);

		this.m_oChallengerElement.style.display      = "none";
		this.m_oRengoChallengerElement.style.display = "block";
		this.m_oChallengers.SwitchToRengo();
	}
	else if (EKGSGameType.Simul === nGameType)
	{
		// TODO: Implement this case
	}
	else
	{
		this.HtmlElement.PlayersWrapperControl.SetParams(0, this.m_nHeaderHeight * 2 + 10, 1000, 1000, false, true, false, false, -1, 2 * this.m_nPlayersHeight);		
		this.HtmlElement.RulesWrapperControl.SetParams(0, this.m_nHeaderHeight * 2 + 10 + 2 * this.m_nPlayersHeight + 10, 1000, 1000, false, true, false, false, -1, 9 * this.m_nFieldHeight);		
		this.m_oPlayersColorsControl.SetParams(10, 0, 0, 0, true, true, false, false, 50, 4 * this.m_nPlayersHeight);

		this.m_oChallengerElement.style.display      = "block";
		this.m_oRengoChallengerElement.style.display = "none";
		this.m_oChallengers.SwitchToRegular();
	}
	
	
	this.private_CalculateWindowSize();
	this.private_UpdateSize();
	this.Update_Size(true);
};
CKGSChallengeWindow.prototype.private_IsChallengersReady = function()
{
	if ((EKGSGameType.Rengo === this.private_GetSelectedGameType()
		&& null !== this.m_oRengoChallenger1
		&& null !== this.m_oRengoChallenger2
		&& null !== this.m_oRengoChallenger3)
		|| (EKGSGameType.Rengo !== this.private_GetSelectedGameType()
		&& null !== this.m_oCurrentChallenger))
		return true;

	return false;
};
CKGSChallengeWindow.prototype.private_CreateChallengerElement = function(oParentDiv, oParentControl)
{
	this.m_oChallengers.InitRegular(oParentDiv, oParentControl);

	// this.m_oChallengerSelect = oEntry.List;
	// this.m_oChallengerSpan   = oEntry.NameSpan;
	// this.m_oChallengerReject = oEntry.RejectSpan;

	//this.private_AddEventsForSelect(this.private_OnChangeChallenger, oEntry.List);
};
CKGSChallengeWindow.prototype.private_CreateRengoChallengerElement = function(oParentDiv, oParentControl)
{
	this.m_oChallengers.InitRengo(oParentDiv, oParentControl);
};
CKGSChallengeWindow.prototype.private_CreateChallengerEntryElement = function(oParentDiv, oParentControl, nTop, fOnPlayerClick, fOnRejectClick)
{
	var oChallengerListElement = this.protected_CreateDivElement(oParentDiv, "", "select");
	var oChallengerListControl = CreateControlContainerByElement(oChallengerListElement);
	oChallengerListControl.SetParams(0, nTop, 0, 0, true, true, true, false, -1, this.m_nPlayersHeight -1);
	oChallengerListControl.SetAnchor(true, true, true, false);
	oParentControl.AddControl(oChallengerListControl);
	this.private_AddOptionToSelect(oChallengerListElement, "");

	var oChallengerPlayer = this.protected_CreateDivElement(oParentDiv);
	var oChallengerControl = CreateControlContainerByElement(oChallengerPlayer);
	oChallengerControl.SetParams(1, nTop + 1, 40, 0, true, true, true, false, -1, this.m_nPlayersHeight - 3);
	oChallengerControl.SetAnchor(true, true, true, false);
	oParentControl.AddControl(oChallengerControl);
	oChallengerPlayer.style.paddingLeft = "3px";
	oChallengerPlayer.className += "challengePlayer";

	var oChallengerSpan            = document.createElement("span");
	oChallengerSpan.style["float"] = "left";
	oChallengerSpan.style.display  = "block";
	oChallengerSpan.className      = "challengePlayerSpan";
	oChallengerSpan.innerHTML      = "";
	oChallengerSpan.title          = "";
	oChallengerSpan.onclick        = fOnPlayerClick;
	oChallengerPlayer.appendChild(oChallengerSpan);

	var oChallengerRejectSpan            = document.createElement("span");
	oChallengerRejectSpan.className      = "challengePlayerSpan challengePlayerRejectSpan";
	oChallengerRejectSpan.style["float"] = "right";
	oChallengerRejectSpan.style.display  = "none";
	oChallengerRejectSpan.innerHTML      = g_oLocalization.KGS.window.challenge.buttonDecline;
	oChallengerRejectSpan.title          = g_oLocalization.KGS.window.challenge.buttonDeclineHint;
	oChallengerRejectSpan.onclick        = fOnRejectClick;
	oChallengerPlayer.appendChild(oChallengerRejectSpan);

	return {
		List       : oChallengerListElement,
		NameDiv    : oChallengerPlayer,
		NameSpan   : oChallengerSpan,
		RejectSpan : oChallengerRejectSpan
	};
};
CKGSChallengeWindow.prototype.OnChangeChallengers = function()
{

};

function CGoUniverseButtonMinimize(fOnClickHandler)
{
	CGoUniverseButtonMinimize.superclass.constructor.call(this, null);

	this.m_fOnClickHandler = fOnClickHandler ? fOnClickHandler : null;

	this.m_oNormaFColor  = new CColor(217, 217, 217, 217);
	this.m_oHoverFColor  = new CColor(187, 187, 187, 187);
	this.m_oActiveFColor = new CColor(147, 147, 147, 147);
}
CommonExtend(CGoUniverseButtonMinimize, CDrawingButtonBase);

CGoUniverseButtonMinimize.prototype.private_DrawOnCanvas = function(Canvas, Size, X_off, Y_off, bDisabled, W, H, BackColor, FillColor)
{
	var oImageData = Canvas.createImageData(W, H);
	var oBitmap = oImageData.data;

	var X_off = (W - 8) / 2 | 0;
	var Y_off = (H - 8) / 2 | 0;

	for (var Y = 0; Y < H; Y++)
	{
		for (var X = 0; X < W; X++)
		{
			var Index = (X + Y * W) * 4;

			var r = FillColor.r;
			var g = FillColor.g;
			var b = FillColor.b;

			var y = Y - Y_off;
			var x = X - X_off;
			if (4 === y && 0 <= x  && x <= 7)
			{
				r = 0;
				g = 0;
				b = 0;
			}

			oBitmap[Index + 0] = r;
			oBitmap[Index + 1] = g;
			oBitmap[Index + 2] = b;
			oBitmap[Index + 3] = 255;
		}
	}

	Canvas.putImageData(oImageData, 0, 0);
};
CGoUniverseButtonMinimize.prototype.private_HandleMouseDown = function()
{
	if (this.m_fOnClickHandler)
		this.m_fOnClickHandler();
};
CGoUniverseButtonMinimize.prototype.private_GetHint = function()
{
	return g_oLocalization.common.minimizeButtonHint;
};
CGoUniverseButtonMinimize.prototype.private_ClickTransformIn = function()
{
};
CGoUniverseButtonMinimize.prototype.private_ClickTransformOut = function()
{
};
CGoUniverseButtonMinimize.prototype.private_DrawSelectionBounds = function(Canvas, W, H)
{
};


function CKGSChallengeWindowChallengersManager(oWindow)
{
	this.m_oWindow  = oWindow;
	this.m_oRegular = new CKGSChallengeWindowChallengersObject(oWindow, this);
	this.m_oRengo   = new CKGSChallengeWindowChallengersObject(oWindow, this);

	this.m_oCurrent = this.m_oRegular;

	this.m_arrUsers = [];
}
CKGSChallengeWindowChallengersManager.prototype.Disable = function()
{
	this.m_oRegular.Disable();
	this.m_oRengo.Disable();
};
CKGSChallengeWindowChallengersManager.prototype.Enable = function()
{
	this.m_oRegular.Enable();
	this.m_oRengo.Enable();
};
CKGSChallengeWindowChallengersManager.prototype.InitRegular = function(oParentDiv, oParentControl)
{
	this.m_oRegular.Reset(oParentDiv, oParentControl);
	this.m_oRegular.AddChallenger();
};
CKGSChallengeWindowChallengersManager.prototype.InitRengo = function(oParentDiv, oParentControl)
{
	this.m_oRengo.Reset(oParentDiv, oParentControl);
	this.m_oRengo.AddChallenger();
	this.m_oRengo.AddChallenger();
	this.m_oRengo.AddChallenger();
};
CKGSChallengeWindowChallengersManager.prototype.SetChallenger = function(oUser, nIndex)
{
	this.m_oRegular.SetChallenger(oUser, nIndex);
	this.m_oRengo.SetChallenger(oUser, nIndex);
};
CKGSChallengeWindowChallengersManager.prototype.SwitchToRegular = function()
{
	this.m_oCurrent = this.m_oRegular;
};
CKGSChallengeWindowChallengersManager.prototype.SwitchToRengo = function()
{
	this.m_oCurrent = this.m_oRengo;
};
CKGSChallengeWindowChallengersManager.prototype.AddUser = function(oUser, oProposal)
{
	this.m_arrUsers.push({
		User     : oUser,
		Proposal : oProposal
	});

	this.m_oCurrent.AddUser(oUser);
};
CKGSChallengeWindowChallengersManager.prototype.GetUser = function(nIndex)
{
	if (this.m_arrUsers[nIndex])
		return this.m_arrUsers[nIndex].User;

	return null;
};
CKGSChallengeWindowChallengersManager.prototype.GetUsersCount = function()
{
	return this.m_arrUsers.length;
};
CKGSChallengeWindowChallengersManager.prototype.GetIndexByUser = function(oUser)
{
	for (var nIndex = 0, nCount = this.m_arrUsers.length; nIndex < nCount; ++nIndex)
	{
		if (oUser === this.m_arrUsers[nIndex].User)
			return nIndex;
	}

	return -1;
};
CKGSChallengeWindowChallengersManager.prototype.GetWindow = function()
{
	return this.m_oWindow;
};
CKGSChallengeWindowChallengersManager.prototype.RemoveUser = function(oUser)
{
	for (var nIndex = 0; nIndex < this.m_arrUsers.length; ++nIndex)
	{
		if (oUser.GetName().toLowerCase() === this.m_arrUsers[nIndex].User.GetName().toLowerCase())
		{
			this.m_arrUsers.splice(nIndex, 1);
			this.m_oCurrent.RemoveUser(nIndex);
			nIndex--;
		}
	}
};

function CKGSChallengeWindowChallengersObject(oWindow, oManager)
{
	this.m_arrChallengers = [];
	this.m_oWindow        = oWindow;
	this.m_oManager       = oManager;
	this.m_oParentDiv     = null;
	this.m_oParentControl = null;
}
CKGSChallengeWindowChallengersObject.prototype.Reset = function(oParentDiv, oParentControl)
{
	this.m_arrChallengers = [];
	this.m_oParentDiv     = oParentDiv;
	this.m_oParentControl = oParentControl;
};
CKGSChallengeWindowChallengersObject.prototype.AddChallenger = function()
{
	var nChallengerIndex = this.m_arrChallengers.length;

	var oChallenger = new CKGSChallengeWindowChallengerObject(this.m_oManager, this);
	var oEntry      = this.m_oWindow.private_CreateChallengerEntryElement(
		this.m_oParentDiv,
		this.m_oParentControl,
		nChallengerIndex * this.m_oWindow.m_nPlayersHeight,
		function()
		{
			oChallenger.LoadInfo();
		},
		function()
		{
			oChallenger.RejectUser();
		}
	);

	oChallenger.Init(oEntry);
	this.m_arrChallengers.push(oChallenger);
};
CKGSChallengeWindowChallengersObject.prototype.Disable = function()
{
	for (var nIndex = 0, nCount = this.m_arrChallengers.length; nIndex < nCount; ++nIndex)
	{
		this.m_arrChallengers[nIndex].Disable();
	}
};
CKGSChallengeWindowChallengersObject.prototype.Enable = function()
{
	for (var nIndex = 0, nCount = this.m_arrChallengers.length; nIndex < nCount; ++nIndex)
	{
		this.m_arrChallengers[nIndex].Enable();
	}
};
CKGSChallengeWindowChallengersObject.prototype.SetChallenger = function(oUser, nIndex)
{
	if (this.m_arrChallengers[nIndex])
		this.m_arrChallengers[nIndex].SetChallenger(oUser);
};
CKGSChallengeWindowChallengersObject.prototype.AddUser = function(oUser)
{
	for (var nIndex = 0, nCount = this.m_arrChallengers.length; nIndex < nCount; ++nIndex)
	{
		this.m_arrChallengers[nIndex].AddUser(oUser);
	}

	var nUsersCount = this.m_oManager.GetUsersCount();
	if (nUsersCount <= this.m_arrChallengers.length)
	{
		for (var nIndex = 0, nCount = this.m_arrChallengers.length; nIndex < nCount; ++nIndex)
		{
			if (!this.m_arrChallengers[nIndex].GetSelectedUser())
			{
				this.m_arrChallengers[nIndex].SetSelectedUser(oUser);
				break;
			}
		}

	}
};
CKGSChallengeWindowChallengersObject.prototype.OnChangeChallengers = function(oChallengerObject, oUser)
{
	var oPrevUser = oChallengerObject.GetSelectedUser();
	oChallengerObject.SetSelectedUser(oUser);

	if (oUser)
	{
		var bSwitched = false;
		for (var nIndex = 0, nCount = this.m_arrChallengers.length; nIndex < nCount; ++nIndex)
		{
			if (this.m_arrChallengers[nIndex] !== oChallengerObject && this.m_arrChallengers[nIndex].GetSelectedUser() === oUser)
			{
				if (!bSwitched)
				{
					this.m_arrChallengers[nIndex].SetSelectedUser(oPrevUser);
					bSwitched = true;
				}
				else
				{
					this.m_arrChallengers[nIndex].SetSelectedUser(null);
				}
			}
		}
	}
};
CKGSChallengeWindowChallengersObject.prototype.RemoveUser = function(nRemoveIndex)
{
	for (var nIndex = 0, nCount = this.m_arrChallengers.length; nIndex < nCount; ++nIndex)
	{
		this.m_arrChallengers[nIndex].RemoveUser(nRemoveIndex);
	}
};

function CKGSChallengeWindowChallengerObject(oManager, oParent)
{
	this.m_oManager       = oManager;
	this.m_oParent        = oParent;
	this.m_oSelectedUser  = null;
	this.m_oDiv           = null;
	this.m_oListElement   = null;
	this.m_oNameElement   = null;
	this.m_oRejectElement = null;
}
CKGSChallengeWindowChallengerObject.prototype.Init = function(oEntry)
{
	this.m_oSelectedUser  = null;
	this.m_oDiv           = oEntry.NameDiv;
	this.m_oListElement   = oEntry.List;
	this.m_oNameElement   = oEntry.NameSpan;
	this.m_oRejectElement = oEntry.RejectSpan;

	var oThis = this;
	this.private_AddEventsForSelect(function(){oThis.private_OnSelectUser();}, this.m_oListElement);
};
CKGSChallengeWindowChallengerObject.prototype.LoadInfo = function()
{
	if (this.m_oSelectedUser)
	{
		oApp.m_oClient.LoadUserInfo(this.m_oSelectedUser.GetName());
	}
};
CKGSChallengeWindowChallengerObject.prototype.RejectUser = function()
{

};
CKGSChallengeWindowChallengerObject.prototype.Disable = function()
{
	this.m_oListElement.className = "challengeSelect challengeSelectDisabled";
	this.m_oListElement.disabled  = "disabled";
	this.m_oDiv.className         = "challengePlayer";
};
CKGSChallengeWindowChallengerObject.prototype.Enable = function()
{
	this.m_oListElement.className = "challengeSelect challengeSelectEditable";
	this.m_oListElement.disabled  = "";
	this.m_oDiv.className         = "challengePlayer challengePlayerSelect";
};
CKGSChallengeWindowChallengerObject.prototype.SetChallenger = function(oUser)
{
	this.m_oSelectedUser          = oUser;
	this.m_oNameElement.innerHTML = this.m_oSelectedUser.GetName() + "[" + this.m_oSelectedUser.GetStringRank() + "]";
	this.m_oNameElement.title     = g_oLocalization.KGS.window.challenge.challengerHint;
};
CKGSChallengeWindowChallengerObject.prototype.SetSelectedUser = function(oUser)
{
	if (!oUser)
	{
		this.m_oSelectedUser = null;

		this.m_oNameElement.innerHTML = "";
		this.m_oNameElement.title     = "";

		this.m_oRejectElement.style.display = "none";

		this.m_oListElement.selectedIndex = 0;
	}
	else
	{
		this.m_oSelectedUser = oUser;

		this.m_oNameElement.innerHTML = oUser.GetName() + "[" + oUser.GetStringRank() + "]";
		this.m_oNameElement.title     = g_oLocalization.KGS.window.challenge.challengerHint;

		this.m_oRejectElement.style.display = "block";

		this.m_oListElement.selectedIndex = this.m_oManager.GetIndexByUser(oUser) + 1;
	}
};
CKGSChallengeWindowChallengerObject.prototype.AddUser = function(oUser)
{
	this.private_AddOptionToSelect(this.m_oListElement, oUser.GetName());
};
CKGSChallengeWindowChallengerObject.prototype.RemoveUser = function(nRemoveIndex)
{
	if (this.m_oListElement.selectedIndex === nRemoveIndex + 1)
		this.SetSelectedUser(null);

	this.m_oListElement.remove(nRemoveIndex + 1);
};
CKGSChallengeWindowChallengerObject.prototype.GetSelectedUser = function()
{
	return this.m_oSelectedUser;
};
CKGSChallengeWindowChallengerObject.prototype.private_AddOptionToSelect = function(oSelect, sName)
{
	var oOption         = document.createElement("option");
	oOption.value       = sName;
	oOption.textContent = sName;
	oSelect.appendChild(oOption);
};
CKGSChallengeWindowChallengerObject.prototype.private_OnSelectUser = function()
{
	var oUser = this.m_oListElement.selectedIndex <= 0 ? null : this.m_oManager.GetUser(this.m_oListElement.selectedIndex - 1);
	this.m_oParent.OnChangeChallengers(this, oUser);
	this.m_oManager.GetWindow().OnChangeChallengers();
};
CKGSChallengeWindowChallengerObject.prototype.private_AddEventsForSelect = function(fOnChange, oSelect)
{
	oSelect.addEventListener("change", function(e)
	{
		if (fOnChange)
			fOnChange(e);
	}, false);
};