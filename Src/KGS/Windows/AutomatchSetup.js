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
CKGSAutomatchSetupWindow.prototype.private_AddCheckBox = function(sName)
{
	
};