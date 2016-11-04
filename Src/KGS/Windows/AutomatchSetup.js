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

	CKGSInformationWindow.superclass.Init.call(this, sDivId, oPr, false);

	this.Set_Caption(oPr.Caption);

	var oMainDiv     = this.HtmlElement.ConfirmInnerDiv;
	var oMainControl = this.HtmlElement.ConfirmInnerControl;

	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";
	this.HtmlElement.OkCancelDiv.style.borderTop = "";
	this.HtmlElement.OkCancelDiv.style.backgroundColor = "rgb(243, 243, 243)";

	if (undefined !== oPr.Image)
	{
		var oImageElement = this.protected_CreateDivElement(oMainDiv, oMainDiv.id + "I");
		var oTextElement  = this.protected_CreateDivElement(oMainDiv, oMainDiv.id + "T");

		var oImageControl = CreateControlContainer(oMainDiv.id + "I");
		oImageControl.Bounds.SetParams(0, 0, 1000, 0, true, true, false, true, 70, -1);
		oImageControl.Anchor = (g_anchor_left | g_anchor_top | g_anchor_bottom);
		oMainControl.AddControl(oImageControl);

		oImageElement.style.display = "table";
		var oInnerImage = document.createElement("div");
		oInnerImage.className = "WarningText";
		oImageElement.appendChild(oInnerImage);

		var oSpan            = document.createElement("span");
		oSpan.className      = oPr.Image;
		oInnerImage.appendChild(oSpan);

		var oTextControl = CreateControlContainer(oMainDiv.id + "T");
		oTextControl.Bounds.SetParams(70, 0, 5, 0, true, true, true, true, -1, -1);
		oTextControl.Anchor = (g_anchor_left | g_anchor_top | g_anchor_bottom  | g_anchor_right);
		oMainControl.AddControl(oTextControl);

		oTextElement.style.display = "table";
		var oInnerText = document.createElement("div");
		oInnerText.className = "WarningText";
		oTextElement.appendChild(oInnerText);
		Common.Set_InnerTextToElement(oInnerText, oPr.Text);
	}
	else
	{
		var oTextElement  = oMainDiv;
		oTextElement.style.display = "table";
		var oInnerText = document.createElement("div");
		oInnerText.className = "WarningText";
		oTextElement.appendChild(oInnerText);
		Common.Set_InnerTextToElement(oInnerText, oPr.Text);
	}

	if (oPr && oPr.Client)
		this.m_oClient = oPr.Client;

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