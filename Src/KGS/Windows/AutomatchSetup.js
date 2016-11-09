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


}
CommonExtend(CKGSAutomatchSetupWindow, CKGSWindowConfirmBase);

CKGSAutomatchSetupWindow.prototype.Init = function(sDivId, oPr)
{
	if (oPr.H)
		this.m_nDefH = oPr.H;

	if (oPr.W)
		this.m_nDefW = oPr.W;

	if (!oPr)
		oPr = {};

	oPr.Resizeable = false;

	CKGSAutomatchSetupWindow.superclass.Init.call(this, sDivId, oPr);

	this.Set_Caption("Automatch setup");

	var oMainDiv                   = this.HtmlElement.ConfirmInnerDiv;
	oMainDiv.style.paddingTop      = "5px";
	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";

	this.private_AddRankSelect("26k");
	this.private_AddSeparator();
	this.private_AddCheckBox("Human", true);
	this.private_AddCheckBox("Robot", true);
	this.private_AddCheckBox("Unranked opponent", true);
	this.private_AddSeparator();
	this.private_AddTextBox("Max handicap", "6");
	this.private_AddSeparator();
	this.private_AddCheckBox("Ranked game", true);
	this.private_AddCheckBox("Free game", true);
	this.private_AddSeparator();
	this.private_AddCheckBox("Medium", true);
	this.private_AddCheckBox("Fast", true);
	this.private_AddCheckBox("Blitz", true);

	this.Update_Size(true);
	this.Show(oPr);
};
CKGSAutomatchSetupWindow.prototype.Get_DefaultWindowSize = function()
{
	return {W : 206, H : 372};
	return {W : this.m_nDefW, H : this.m_nDefH};
};
CKGSAutomatchSetupWindow.prototype.Close = function()
{
	CKGSAutomatchSetupWindow.superclass.Close.call(this);
	RemoveWindow(this);
};
CKGSAutomatchSetupWindow.prototype.private_AddCheckBox = function(sName, bChecked)
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


	oMainDiv.appendChild(oWrapperDiv);
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

	var oCheckBoxDiv            = document.createElement("div");
	oCheckBoxDiv.style["float"] = "left";
	oCheckBoxDiv.style.paddingTop = "2px";
	var oCheckBox               = document.createElement("input");
	oCheckBox.type              = "text";
	oCheckBox.value             = sValue;
	oCheckBox.class             = "challengeInput";

	oCheckBox.style.width     = "20px";
	oCheckBox.style.height    = "22px";

	oCheckBoxDiv.appendChild(oCheckBox);
	oWrapperDiv.appendChild(oCheckBoxDiv);

	var oLabelDiv               = document.createElement("div");
	oLabelDiv.style.paddingLeft = "5px";
	oLabelDiv.style["float"]    = "left";
	var oSpan                   = document.createElement("span");
	oSpan.innerText             = sName;
	oSpan.style.cursor          = "default";

	oLabelDiv.appendChild(oSpan);
	oWrapperDiv.appendChild(oLabelDiv);


	oMainDiv.appendChild(oWrapperDiv);
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
	oSpan.innerText             = "Rank";
	oSpan.style.cursor          = "default";

	oLabelDiv.appendChild(oSpan);
	oWrapperDiv.appendChild(oLabelDiv);


	oMainDiv.appendChild(oWrapperDiv);
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