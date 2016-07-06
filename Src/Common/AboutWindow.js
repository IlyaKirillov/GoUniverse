"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     07.07.2016
 * Time     2:05
 */

function CGoUniverseAboutWindow()
{
	CGoUniverseAboutWindow.superclass.constructor.call(this);

	this.m_oApp = null;
}
CommonExtend(CGoUniverseAboutWindow, CDrawingWindow);

CGoUniverseAboutWindow.prototype.Init = function(sDivId, oPr)
{
	CGoUniverseAboutWindow.superclass.Init.call(this, sDivId, true);

	this.Set_Caption("About");

	this.m_oApp = oPr.App;

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	this.private_InitAboutPage(oMainDiv);

	this.private_UpdatePosition();
	this.Update_Size(true);
};
CGoUniverseAboutWindow.prototype.Get_DefaultWindowSize = function()
{
	return {W : 400, H : 220};
};
CGoUniverseAboutWindow.prototype.Close = function()
{
	CGoUniverseAboutWindow.superclass.Close.call(this);
	RemoveWindow(this);
};
CGoUniverseAboutWindow.prototype.private_InitAboutPage = function(oDiv)
{
	var oDivMainPart           = document.createElement("div");
	oDiv.appendChild(oDivMainPart);

	oDiv.style.overflowX  = "hidden";
	oDiv.style.overflowY  = "hidden";

	oDivMainPart.style.margin  = "0";
	oDivMainPart.style.padding = "10px 20px";

	oDivMainPart.style.fontFamily = "Tahoma, Arial, Verdana";
	oDivMainPart.style.fontSize   = "12px";
	oDivMainPart.style.color      = "#666";
	oDivMainPart.style.background = "#fff";

	var oLogo            = document.createElement("img");
	oLogo.src            = "Files/Icon100.png";
	oLogo.width          = 100;
	oLogo.height         = 100;
	oLogo.style['float'] = "left";
	oDivMainPart.appendChild(oLogo);

	var oMargin            = document.createElement("div");
	oMargin.style.width    = "10px";
	oMargin.style.height   = "100px";
	oMargin.style['float'] = "left";
	oDivMainPart.appendChild(oMargin);

	var oHeading = document.createElement("h1");
	oHeading.style.marginLeft = "110px";
	oDivMainPart.appendChild(oHeading);
	Common.Set_InnerTextToElement(oHeading, "Go Universe");

	var oVersion = document.createElement("div");
	oVersion.style.marginLeft = "110px";
	oDivMainPart.appendChild(oVersion);
	Common.Set_InnerTextToElement(oVersion, "Version " + this.m_oApp.GetVersion());

	var oString              = document.createElement("div");
	oString.style.marginLeft = "110px";
	oString.style.paddingTop = "20px";
	oDivMainPart.appendChild(oString);
	Common.Set_InnerTextToElement(oString, "Visit our Github project for feedback and issue reports:");
	oString                  = document.createElement("a");
	oString.style.marginLeft = "110px";
	oString.target           = "_blank";
	oString.href             = "https://github.com/IlyaKirillov/GoUniverse";
	oDivMainPart.appendChild(oString);
	Common.Set_InnerTextToElement(oString, "https://github.com/IlyaKirillov/GoUniverse");

	oString                  = document.createElement("div");
	oString.style.paddingTop = "30px";
	oDivMainPart.appendChild(oString);
	Common.Set_InnerTextToElement(oString, "© Ilya Kirillov, 2016. All rights reserved.");
};
CGoUniverseAboutWindow.prototype.private_UpdatePosition = function()
{
	if (!this.m_oApp)
		return;

	var oWindowDiv = this.HtmlElement.Control.HtmlElement;

	var nWindowW = parseInt(oWindowDiv.style.width);
	var nWindowH = parseInt(oWindowDiv.style.height);

	var nX = Math.max(0, ((this.m_oApp.GetWidth()  - nWindowW) / 2));
	var nY = Math.max(0, ((this.m_oApp.GetHeight() - nWindowH) / 2));

	oWindowDiv.style.left = nX + "px";
	oWindowDiv.style.top  = nY + "px";
};