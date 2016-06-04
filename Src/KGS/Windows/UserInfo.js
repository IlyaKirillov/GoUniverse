"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     03.06.2016
 * Time     22:54
 */

function CKGSUserInfoWindow()
{
	CKGSUserInfoWindow.superclass.constructor.call(this);

	this.m_sUserName = "";
	this.m_oClient   = null;

	this.m_oContainerDiv = null;
}
CommonExtend(CKGSUserInfoWindow, CKGSWindowBase);

CKGSUserInfoWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSUserInfoWindow.superclass.Init.call(this, sDivId);

	if (oPr)
	{
		this.m_sUserName = oPr.UserName;
		this.m_oClient   = oPr.Client;
	}

	this.Set_Caption(this.m_sUserName);

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	oMainDiv.style.fontSize = "16px";

	this.m_oContainerDiv = this.protected_CreateDivElement(oMainDiv, sDivId + "C");
	var oContainerControl = CreateControlContainer(sDivId + "C");
	oContainerControl.Bounds.SetParams(5, 5, 5, 5, true, true, true, true, -1, -1);
	oContainerControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oMainControl.AddControl(oContainerControl);


	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";
};
CKGSUserInfoWindow.prototype.Get_DefaultWindowSize = function(bForce)
{
	return {W : 500, H : 600};
};
CKGSUserInfoWindow.prototype.Close = function()
{
	CKGSUserInfoWindow.superclass.Close.call(this);
	if (this.m_oClient)
		this.m_oClient.CloseUserInfo(this.m_sUserName);
};
CKGSUserInfoWindow.prototype.OnUserDetails = function(oDetails)
{
	if (oDetails)
	{
		if (-1 !== oDetails.user.flags.indexOf("a"))
			this.OnUserAvatar();

		this.private_AddConsoleMessage("UserName", oDetails.user.name);
		this.private_AddConsoleMessage("Rank", oDetails.user.rank ? oDetails.user.rank : "-");
		this.private_AddConsoleMessage("Last on", oDetails.lastOn);
		this.private_AddConsoleMessage("Locale", oDetails.locale);
		this.private_AddConsoleMessage("Name", oDetails.personalName);
		this.private_AddInfo(oDetails.personalInfo);
	}
};
CKGSUserInfoWindow.prototype.OnUserAvatar = function(oMessage)
{
	var oDiv = this.m_oContainerDiv;
	var oImg = document.createElement("img");

	oImg.align        = "right";
	oImg.style.width  = "141px";
	oImg.style.height = "200px";
	oImg.src          = "http://goserver.gokgs.com/avatars/" + this.m_sUserName + ".jpg";

	oDiv.appendChild(oImg);

};
CKGSUserInfoWindow.prototype.OnUserGameArchive = function(oMessage)
{

};
CKGSUserInfoWindow.prototype.private_AddConsoleMessage = function(sField, sText)
{
	var oDiv     = this.m_oContainerDiv;
	var oTextDiv = document.createElement("div");

	var oTextSpan;

	if (sField)
	{
		oTextSpan                  = document.createElement("span");
		oTextSpan.style.fontWeight = "bold";
		oTextSpan.style.fontStyle  = "italic";
		oTextSpan.textContent      = sField + ": ";
		oTextDiv.appendChild(oTextSpan);
	}

	var aLines = SplitTextToLines(sText);
	for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
	{
		oTextSpan            = document.createElement("span");
		oTextSpan.innerHTML  = aLines[nIndex];

		oTextDiv.appendChild(oTextSpan);
		oTextDiv.appendChild(document.createElement("br"));
	}

	oDiv.appendChild(oTextDiv);
	return oTextDiv;
};
CKGSUserInfoWindow.prototype.private_AddInfo = function(sText)
{
	var oDiv     = this.m_oContainerDiv;
	var oTextDiv = document.createElement("div");

	var oTextSpan;

	oTextSpan                  = document.createElement("div");
	oTextSpan.style.fontWeight = "bold";
	oTextSpan.style.fontStyle  = "italic";
	oTextSpan.textContent      = "Info: ";
	oTextDiv.appendChild(oTextSpan);

	var oInfoDiv = document.createElement("div");
	oInfoDiv.style.width  = "100%";
	oInfoDiv.style.bottom = "0px";
	oInfoDiv.style.overflowY = "scroll";

	var aLines = SplitTextToLines(sText);
	for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
	{
		var oTextSpan        = document.createElement("span");
		oTextSpan.innerHTML  = aLines[nIndex];

		oInfoDiv.appendChild(oTextSpan);
		oInfoDiv.appendChild(document.createElement("br"));
	}

	oTextDiv.appendChild(oInfoDiv);
	oDiv.appendChild(oTextDiv);
	return oTextDiv;
};
