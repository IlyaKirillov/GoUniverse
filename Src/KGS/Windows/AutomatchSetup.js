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
CommonExtend(CKGSAutomatchSetupWindow, CKGSWindowBase);

CKGSAutomatchSetupWindow.prototype.Init = function(sDivId, oPr)
{
	if (oPr.H)
		this.m_nDefH = oPr.H;

	if (oPr.W)
		this.m_nDefW = oPr.W;

	CKGSAutomatchSetupWindow.superclass.Init.call(this, sDivId, oPr, false);

	this.Set_Caption("Automatch setup");

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";

	this.private_AddCheckBox("Human", true);
	this.private_AddCheckBox("Robot", true);
	this.private_AddCheckBox("Unranked opponent", true);

	this.private_AddCheckBox("Ranked game", true);
	this.private_AddCheckBox("Free game", true);

	this.private_AddCheckBox("Medium", true);
	this.private_AddCheckBox("Fast", true);
	this.private_AddCheckBox("Blitz", true);
	// Human OK
	// Robot OK
	// Unranked Opponent OK

	// Max Rank Difference

	// Ranked OK
	// Free OK

	// Medium 25:00 + 0:30 (5)
	// Fast   10:00 + 0:20 (5)
	// Blitz  01:00 + 0:10 (3)


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
CKGSAutomatchSetupWindow.prototype.private_AddCheckBox = function(sName, bChecked)
{
	var oMainDiv = this.HtmlElement.InnerDiv;

	var oWrapperDiv = document.createElement("div");

	var oCheckBox  = document.createElement("input");
	oCheckBox.type = "checkbox";
	oCheckBox.checked = bChecked;

	oWrapperDiv.appendChild(oCheckBox);

	var oSpan = document.createElement("span");
	oSpan.innerText = sName;
	oWrapperDiv.appendChild(oSpan);


	oMainDiv.appendChild(oWrapperDiv);
};