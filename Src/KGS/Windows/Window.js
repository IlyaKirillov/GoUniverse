"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     03.06.2016
 * Time     22:54
 */

var EKGSWindowType = {

	GoUniverseAbout : -1,

	RoomList    : 0,
	UserInfo    : 1,
	RoomInfo    : 2,
	Information : 3,
	Idle        : 4,
	SgfViewer   : 5
};

var g_aKGSWindows      = {};
var g_nKGSWindowsCount = 0;
var g_sParentDivId     = "divIdGoUniverse";

function CreateKGSWindow(nWindowType, oPr)
{
	var sParentId = g_sParentDivId;

	if (!g_aKGSWindows[sParentId])
		g_aKGSWindows[sParentId] = {};

	var oWindows = g_aKGSWindows[sParentId];

	var sApp = "unknownwindow";
	switch (nWindowType)
	{
	case EKGSWindowType.GoUniverseAbout : sApp = "GoUniverseAbout"; break;
	case EKGSWindowType.RoomList        : sApp = "RoomList"; break;
	case EKGSWindowType.UserInfo        : sApp = "UserInfo_" + oPr.UserName; break;
	case EKGSWindowType.RoomInfo        : sApp = "RoomInfo_" + oPr.RoomId; break;
	case EKGSWindowType.Information     : sApp = "Information" + (new Date()).getTime(); break;
	case EKGSWindowType.Idle            : sApp = "Idle"; break;
	case EKGSWindowType.SgfViewer       : sApp = "SgfViewer_" + oPr.Url; break;
	}
	var sId = sParentId + sApp;

	if (oWindows[sId])
	{
		var oWindow = oWindows[sId];
		oWindow.Show(oPr);
		return oWindow;
	}
	else
	{
		var oDiv = document.createElement("div");
		oDiv.setAttribute("id", sId);
		oDiv.setAttribute("style", "position:absolute;padding:0;margin:0;width:500px;height:500px;left:300px;top:300px;");
		oDiv.setAttribute("oncontextmenu", "return false;");

		var oContainerDiv = document.getElementById(sParentId);
		oContainerDiv.appendChild(oDiv);

		var oWindow = null;

		switch (nWindowType)
		{
		case EKGSWindowType.GoUniverseAbout : oWindow = new CGoUniverseAboutWindow(); break;
		case EKGSWindowType.RoomList        : oWindow = new CKGSRoomListWindow(); break;
		case EKGSWindowType.UserInfo        : oWindow = new CKGSUserInfoWindow(); break;
		case EKGSWindowType.RoomInfo        : oWindow = new CKGSRoomInfoWindow(); break;
		case EKGSWindowType.Information     : oWindow = new CKGSInformationWindow(); break;
		case EKGSWindowType.Idle            : oWindow = new CKGSInformationIdleWindow(); break;
		case EKGSWindowType.SgfViewer       : oWindow = new CKGSSgfViewerWindow(); break;
		}

		oWindows[sId] = oWindow;

		if (null !== oWindow)
		{
			g_nKGSWindowsCount++;
			oWindow.Init(sId, oPr);
			oWindow.Update_Size(true);
		}

		return oWindow;
	}

	return null;
}

function RemoveWindow(oWindow)
{
	var sParentId = g_sParentDivId;

	var sDivId = oWindow.Get_Id();
	var oDiv = document.getElementById(sDivId);
	if (oDiv)
	{
		var oContainerDiv = document.getElementById(sParentId);
		oContainerDiv.removeChild(oDiv);
	}

	for (var sId in g_aKGSWindows[sParentId])
	{
		if (oWindow === g_aKGSWindows[sParentId][sId])
		{
			delete g_aKGSWindows[sParentId][sId];
			g_nKGSWindowsCount--;
			break;
		}
	}
}

function RemoveAllWindows()
{
	var sParentId = g_sParentDivId;

	for (var sId in g_aKGSWindows[sParentId])
	{
		var oWindow = g_aKGSWindows[sParentId][sId];
		var sDivId = oWindow.Get_Id();
		var oDiv = document.getElementById(sDivId);
		if (oDiv)
		{
			var oContainerDiv = document.getElementById(sParentId);
			oContainerDiv.removeChild(oDiv);
		}

		delete g_aKGSWindows[sParentId][sId];
		g_nKGSWindowsCount--;
	}

	g_aKGSWindows      = {};
	g_nKGSWindowsCount = 0;
}


function CKGSWindowBase()
{
	CKGSWindowBase.superclass.constructor.call(this);

	this.m_oApp = null;
}
CommonExtend(CKGSWindowBase, CDrawingWindow);
CKGSWindowBase.prototype.Init = function(sDivId, oPr)
{
	CKGSWindowBase.superclass.Init.apply(this, arguments);
	this.m_oApp    = oPr.App;
	this.m_oClient = oPr.Client;
	this.private_UpdatePosition();
	this.HtmlElement.Control.HtmlElement.style.zIndex = g_nKGSWindowsCount;
};
CKGSWindowBase.prototype.private_UpdatePosition = function()
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
CKGSWindowBase.prototype.Update_Size = function(bForce)
{
	CKGSWindowBase.superclass.Update_Size.call(this, bForce);

	// Проверяем, чтобы окно не вышло за пределы родительского окна
	if (this.m_oApp)
	{
		var nWidth  = this.m_oApp.GetWidth();
		var nHeight = this.m_oApp.GetHeight();

		var nLeft = parseInt(this.HtmlElement.Control.HtmlElement.style.left);
		var nTop  = parseInt(this.HtmlElement.Control.HtmlElement.style.top);

		if (nLeft <= 0)
			this.HtmlElement.Control.HtmlElement.style.left = "0px";
		else if (nLeft >= nWidth - 20)
			this.HtmlElement.Control.HtmlElement.style.left = (nLeft - 20) + "px";

		if (nTop <= 0)
			this.HtmlElement.Control.HtmlElement.style.top = "0px";
		else if (nTop >= nHeight - 20)
			this.HtmlElement.Control.HtmlElement.style.top = (nHeight - 20) + "px";
	}
};
CKGSWindowBase.prototype.private_OnFocus = function()
{
	// Вообще говоря, данную функцию надо бы перенести в самый базовый класс, и все окна собирать вместе в объект g_aWindows

	// Делаем данное окно верхним среди всех окон КГС
	if (this.m_oApp)
	{
		var nCurZIndex = parseInt(this.HtmlElement.Control.HtmlElement.style.zIndex);

		var sParentId = g_sParentDivId;
		for (var sId in g_aKGSWindows[sParentId])
		{
			var oWindow = g_aKGSWindows[sParentId][sId];
			var nZIndex = parseInt(oWindow.HtmlElement.Control.HtmlElement.style.zIndex);

			if (nZIndex >= nCurZIndex)
				oWindow.HtmlElement.Control.HtmlElement.style.zIndex = (nZIndex - 1);
		}
		this.HtmlElement.Control.HtmlElement.style.zIndex = g_nKGSWindowsCount;
	}
};

function CKGSWindowOKBase()
{
	CKGSWindowBase.superclass.constructor.call(this);

	this.m_oApp = null;
}
CommonExtend(CKGSWindowOKBase, CDrawingConfirmWindow);
CKGSWindowOKBase.prototype.Init = function(sDivId, oPr)
{
	CKGSWindowOKBase.superclass.Init.call(this, sDivId, true);
	this.m_oApp    = oPr.App;
	this.m_oClient = oPr.Client;
	this.private_UpdatePosition();
	this.HtmlElement.Control.HtmlElement.style.zIndex = g_nKGSWindowsCount;

	this.HtmlElement.CancelButton.HtmlElement.Control.HtmlElement.style.display = "none";
	this.HtmlElement.OkButtonControl.Bounds.SetParams(0, 9, 11, 1000, false, true, true, false, 66, 21);
};
CKGSWindowOKBase.prototype.Update_Size = function(bForce)
{
	CKGSWindowOKBase.superclass.Update_Size.call(this, bForce);

	// Проверяем, чтобы окно не вышло за пределы родительского окна
	if (this.m_oApp)
	{
		var nWidth  = this.m_oApp.GetWidth();
		var nHeight = this.m_oApp.GetHeight();

		var nLeft = parseInt(this.HtmlElement.Control.HtmlElement.style.left);
		var nTop  = parseInt(this.HtmlElement.Control.HtmlElement.style.top);

		if (nLeft <= 0)
			this.HtmlElement.Control.HtmlElement.style.left = "0px";
		else if (nLeft >= nWidth - 20)
			this.HtmlElement.Control.HtmlElement.style.left = (nLeft - 20) + "px";

		if (nTop <= 0)
			this.HtmlElement.Control.HtmlElement.style.top = "0px";
		else if (nTop >= nHeight - 20)
			this.HtmlElement.Control.HtmlElement.style.top = (nHeight - 20) + "px";
	}
};
CKGSWindowOKBase.prototype.private_UpdatePosition = CKGSWindowBase.prototype.private_UpdatePosition;
CKGSWindowOKBase.prototype.private_OnFocus        = CKGSWindowBase.prototype.private_OnFocus;