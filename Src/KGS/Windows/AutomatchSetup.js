"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     04.11.2016
 * Time     1:59
 */

function CKGSAutomatchSetupWindow()
{
	CKGSAutomatchSetupWindow.superclass.constructor.call(this);

	this.m_oRankSelect       = null;
	this.m_oHumanCheckBox    = null;
	this.m_oRobotCheckBox    = null;
	this.m_oUnrankedCheckBox = null;
	this.m_oMaxHandicapInput = null;
	this.m_oRankedCheckBox   = null;
	this.m_oFreeCheckBox     = null;
	this.m_oMediumCheckBox   = null;
	this.m_oFastCheckBox     = null;
	this.m_oBlitzCheckBox    = null;
}
CommonExtend(CKGSAutomatchSetupWindow, CKGSWindowConfirmBase);

CKGSAutomatchSetupWindow.prototype.Init = function(sDivId, oPr)
{
	this.private_CalculateWindowSize();

	oPr.Resizeable = false;
	var oClient = oPr.Client;

	var oPreferences = oClient.GetAutomatchPreferences();
	var oUser = oClient.GetCurrentUser();

	if (oUser.GetRank() >= 0)
		this.m_nDefH -= 30;

	CKGSAutomatchSetupWindow.superclass.Init.call(this, sDivId, oPr);

	this.Set_Caption(g_oLocalization.KGS.window.automatchSetup.caption);

	var oMainDiv                   = this.HtmlElement.ConfirmInnerDiv;
	oMainDiv.style.paddingTop      = "5px";
	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";


	if (oUser.GetRank() < 0)
	{
		this.m_oRankSelect = this.private_AddRankSelect(oPreferences.GetEstimatedRank());
		this.private_AddSeparator();
	}

	var oThis = this;
	this.m_oHumanCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.human, oPreferences.CanPlayWithHuman(), true, function()
	{
		var oHuman = oThis.m_oHumanCheckBox;
		var oRobot = oThis.m_oRobotCheckBox;
		if (!oHuman || !oRobot)
			return;

		if (false === oHuman.checked && false === oRobot.checked)
			oRobot.checked = true;
	});
	this.m_oRobotCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.robot, oPreferences.CanPlayWithRobot(), true, function()
	{
		var oHuman = oThis.m_oHumanCheckBox;
		var oRobot = oThis.m_oRobotCheckBox;
		if (!oHuman || !oRobot)
			return;

		if (false === oRobot.checked && false === oHuman.checked)
			oHuman.checked = true;
	});
	this.m_oUnrankedCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.unranked, oPreferences.CanPlayWithUnranked());
	this.private_AddSeparator();
	this.m_oMaxHandicapInput = this.private_AddTextBox(g_oLocalization.KGS.window.automatchSetup.maxHandicap, oPreferences.GetMaxHandicap());
	this.private_AddSeparator();

	if (oUser.CanPlayRanked())
	{
		this.m_oRankedCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.ranked, oPreferences.CanPlayRankedGames(), true, function()
		{
			var oRanked = oThis.m_oRankedCheckBox;
			var oFree   = oThis.m_oFreeCheckBox;
			if (!oRanked || !oFree)
				return;

			if (false === oFree.checked && false === oRanked.checked)
				oFree.checked = true;
		});
		this.m_oFreeCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.free, oPreferences.CanPlayFreeGames(), true, function()
		{
			var oRanked = oThis.m_oRankedCheckBox;
			var oFree   = oThis.m_oFreeCheckBox;
			if (!oRanked || !oFree)
				return;

			if (false === oFree.checked && false === oRanked.checked)
				oRanked.checked = true;
		});
	}
	else
	{
		this.m_oRankedCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.ranked, false, false, null);
		this.m_oFreeCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.free, true, false, null);
	}

	this.private_AddSeparator();

	this.m_oMediumCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.medium, oPreferences.CanPlayMedium(), true, function()
	{
		var oMedium = oThis.m_oMediumCheckBox;
		var oFast   = oThis.m_oFastCheckBox;
		var oBlitz  = oThis.m_oBlitzCheckBox;

		if (!oMedium || !oFast || !oBlitz)
			return;

		if (false === oMedium.checked && false === oFast.checked && false === oBlitz.checked)
			oFast.checked = true;
	});
	this.m_oFastCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.fast, oPreferences.CanPlayFast(), true, function()
	{
		var oMedium = oThis.m_oMediumCheckBox;
		var oFast   = oThis.m_oFastCheckBox;
		var oBlitz  = oThis.m_oBlitzCheckBox;

		if (!oMedium || !oFast || !oBlitz)
			return;

		if (false === oMedium.checked && false === oFast.checked && false === oBlitz.checked)
			oMedium.checked = true;
	});
	this.m_oBlitzCheckBox = this.private_AddCheckBox(g_oLocalization.KGS.window.automatchSetup.blitz, oPreferences.CanPlayBlitz(), true, function()
	{
		var oMedium = oThis.m_oMediumCheckBox;
		var oFast   = oThis.m_oFastCheckBox;
		var oBlitz  = oThis.m_oBlitzCheckBox;

		if (!oMedium || !oFast || !oBlitz)
			return;

		if (false === oMedium.checked && false === oFast.checked && false === oBlitz.checked)
			oFast.checked = true;
	});

	this.Update_Size(true);
	this.Show(oPr);
};
CKGSAutomatchSetupWindow.prototype.Get_DefaultWindowSize = function()
{
	return {W : this.m_nDefW, H : this.m_nDefH};
};
CKGSAutomatchSetupWindow.prototype.Close = function()
{
	CKGSAutomatchSetupWindow.superclass.Close.call(this);
	RemoveWindow(this);
};
CKGSAutomatchSetupWindow.prototype.private_AddCheckBox = function(sName, bChecked, bEnabled, fOnChange)
{
	var oMainDiv = this.HtmlElement.ConfirmInnerDiv;

	var oWrapperDiv = document.createElement("div");

	oWrapperDiv.style.paddingLeft  = "15px";
	oWrapperDiv.style.paddingRight = "10px";
	oWrapperDiv.style.lineHeight   = "25px";
	oWrapperDiv.style.height       = "25px";
	oWrapperDiv.style.fontSize     = "14px";
	oWrapperDiv.style.fontFamily   = "'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif";

	var oCheckBoxDiv            = document.createElement("div");
	oCheckBoxDiv.style["float"] = "left";
	var oCheckBox               = document.createElement("input");
	oCheckBox.type              = "checkbox";
	oCheckBox.checked           = bChecked;
	oCheckBox.style.marginTop = "6px";
	oCheckBox.style.width     = "13px";
	oCheckBox.style.height    = "13px";


	oCheckBoxDiv.appendChild(oCheckBox);
	oWrapperDiv.appendChild(oCheckBoxDiv);

	var oLabelDiv               = document.createElement("div");
	oLabelDiv.style.paddingLeft = "7px";
	oLabelDiv.style["float"]    = "left";
	var oSpan                   = document.createElement("span");
	oSpan.innerText             = sName;
	oSpan.style.cursor          = "default";

	oLabelDiv.appendChild(oSpan);
	oWrapperDiv.appendChild(oLabelDiv);

	if (false === bEnabled)
	{
		oCheckBox.disabled      = "disabled";
		oWrapperDiv.style.color = "silver";
	}
	else
	{
		oCheckBox.addEventListener("change", function()
		{
			if (fOnChange)
				fOnChange();
		}, false);
		oLabelDiv.addEventListener("click", function()
		{
			oCheckBox.checked = !oCheckBox.checked;
			if (fOnChange)
				fOnChange();
		}, false);
	}


	oMainDiv.appendChild(oWrapperDiv);
	return oCheckBox;
};
CKGSAutomatchSetupWindow.prototype.private_AddTextBox = function(sName, sValue)
{
	var oMainDiv = this.HtmlElement.ConfirmInnerDiv;

	var oWrapperDiv = document.createElement("div");

	oWrapperDiv.style.paddingLeft  = "10px";
	oWrapperDiv.style.paddingRight = "10px";
	oWrapperDiv.style.lineHeight   = "25px";
	oWrapperDiv.style.height       = "25px";
	oWrapperDiv.style.fontSize     = "14px";
	oWrapperDiv.style.fontFamily   = "'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif";

	var oInputDiv              = document.createElement("div");
	oInputDiv.style["float"]   = "left";
	oInputDiv.style.paddingTop = "2px";
	var oInput                 = document.createElement("input");
	oInput.type                = "text";
	oInput.value               = sValue;
	oInput.class               = "challengeInput";
	oInput.style.width         = "20px";
	oInput.style.height        = "22px";
	oInput.style.outline       = "none";

	oInputDiv.appendChild(oInput);
	oWrapperDiv.appendChild(oInputDiv);

	var oLabelDiv               = document.createElement("div");
	oLabelDiv.style.paddingLeft = "5px";
	oLabelDiv.style["float"]    = "left";
	var oSpan                   = document.createElement("span");
	oSpan.innerText             = sName;
	oSpan.style.cursor          = "default";

	oLabelDiv.addEventListener("click", function()
	{
		if (oInput.focus)
			oInput.focus();
	}, false);

	function private_OnChange()
	{
		var sValue = oInput.value;
		var nValue = parseInt(sValue);

		if (isNaN(nValue))
			nValue = 6;
		else if (nValue > 9)
			nValue = 9;
		else if (nValue < 0)
			nValue = 0;

		oInput.value = "" + nValue;
	}

	oInput.addEventListener("keyup", function(e)
	{
		if (13 === e.keyCode)
			private_OnChange(e);
	}, false);
	oInput.addEventListener("blur", function(e)
	{
		private_OnChange();
	}, false);

	oLabelDiv.appendChild(oSpan);
	oWrapperDiv.appendChild(oLabelDiv);

	oMainDiv.appendChild(oWrapperDiv);

	return oInput;
};
CKGSAutomatchSetupWindow.prototype.private_AddRankSelect = function(sRank)
{
	var oMainDiv = this.HtmlElement.ConfirmInnerDiv;

	var oWrapperDiv = document.createElement("div");

	oWrapperDiv.style.paddingLeft  = "10px";
	oWrapperDiv.style.paddingRight = "10px";
	oWrapperDiv.style.lineHeight   = "25px";
	oWrapperDiv.style.height       = "25px";
	oWrapperDiv.style.fontSize     = "14px";
	oWrapperDiv.style.fontFamily   = "'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif";

	var oSelectDiv            = document.createElement("div");
	oSelectDiv.style["float"] = "left";
	oSelectDiv.style.paddingTop = "2px";
	var oSelect               = document.createElement("select");

	function private_AddOption(sName)
	{
		var oOption         = document.createElement("option");
		oOption.value       = sName;
		oOption.textContent = sName;
		oSelect.appendChild(oOption);
	}

	for (var nIndex = 30; nIndex >= 1; --nIndex)
	{
		var sText = nIndex + "k";
		private_AddOption(nIndex + "k");

		if (sRank === sText)
			oSelect.selectedIndex = 30 - nIndex;
	}

	oSelect.style.width     = "50px";
	oSelect.style.height    = "22px";

	oSelectDiv.appendChild(oSelect);
	oWrapperDiv.appendChild(oSelectDiv);

	var oLabelDiv               = document.createElement("div");
	oLabelDiv.style.paddingLeft = "5px";
	oLabelDiv.style["float"]    = "left";
	var oSpan                   = document.createElement("span");
	oSpan.innerText             = g_oLocalization.KGS.window.automatchSetup.estimatedRank;
	oSpan.style.cursor          = "default";

	oLabelDiv.appendChild(oSpan);
	oWrapperDiv.appendChild(oLabelDiv);


	oMainDiv.appendChild(oWrapperDiv);

	return oSelect;
};
CKGSAutomatchSetupWindow.prototype.private_AddSeparator = function(sRank)
{
	var oMainDiv = this.HtmlElement.ConfirmInnerDiv;

	var oWrapperDiv = document.createElement("div");

	oWrapperDiv.style.height       = "4px";
	oWrapperDiv.style.paddingLeft = "10px";
	oWrapperDiv.style.paddingBottom  = "2px";
	oWrapperDiv.style.paddingTop = "2px";
	oWrapperDiv.style.paddingRight = "10px";

	var oDiv = document.createElement("div");

	oDiv.style.marginTop = "2px";
	oDiv.style.height    = "1px";
	oDiv.style.borderTop = "1px solid #969696";

	oWrapperDiv.appendChild(oDiv);
	oMainDiv.appendChild(oWrapperDiv);
};
CKGSAutomatchSetupWindow.prototype.Handle_OK = function()
{
	var oPreferences = this.m_oClient.GetAutomatchPreferences();

	if (this.m_oRankSelect)
		oPreferences.SetEstimatedRank((30 - this.m_oRankSelect.selectedIndex) + "k");

	if (this.m_oHumanCheckBox)
		oPreferences.SetHuman(this.m_oHumanCheckBox.checked);

	if (this.m_oRobotCheckBox)
		oPreferences.SetRobot(this.m_oRobotCheckBox.checked);

	if (this.m_oUnrankedCheckBox)
		oPreferences.SetUnranked(this.m_oUnrankedCheckBox.checked);

	if (this.m_oMaxHandicapInput)
		oPreferences.SetMaxHandicap(parseInt(this.m_oMaxHandicapInput.value));

	if (this.m_oRankedCheckBox)
		oPreferences.SetRanked(this.m_oRankedCheckBox.checked);

	if (this.m_oFreeCheckBox)
		oPreferences.SetFree(this.m_oFreeCheckBox.checked);

	if (this.m_oMediumCheckBox)
		oPreferences.SetMedium(this.m_oMediumCheckBox.checked);

	if (this.m_oFastCheckBox)
		oPreferences.SetFast(this.m_oFastCheckBox.checked);

	if (this.m_oBlitzCheckBox)
		oPreferences.SetBlitz(this.m_oBlitzCheckBox.checked);

	this.m_oClient.UpdateAutomatchPreferences();

	this.Close();
};
CKGSAutomatchSetupWindow.prototype.private_CalculateWindowSize = function()
{
	this.m_nDefH = 372;
	this.m_nDefW = 206;

	this.m_nDefW = 14 + 25 + 13 + 7 + 10 + 2;
	// 14px левая и правая границы
	// 25px отступ слева
	// 13px размер чекбокса
	// 7px отступ от чекбокса
	// 10px отступ справа
	// 2px для погршности

	g_oTextMeasurer.SetFont("14px 'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif");
	this.m_nDefW += Math.max(
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.human),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.robot),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.unranked),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.maxHandicap),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.ranked),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.free),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.medium),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.fast),
		g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.blitz)
	);

	var nEstimatedRank = 14 + 10 + 50 + 5 + g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.estimatedRank) + 10 + 2;

	g_oTextMeasurer.SetFont("13pt Tahoma, 'Sans serif'");
	var nCaptionW = 74 + g_oTextMeasurer.Measure(g_oLocalization.KGS.window.automatchSetup.caption);

	this.m_nDefW = Math.max(this.m_nDefW, nCaptionW, nEstimatedRank);
};