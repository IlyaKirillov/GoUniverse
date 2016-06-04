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
	RoomList : 0,
	UserInfo : 1
};

var g_aKGSWindows = {};

function CreateKGSWindow(nWindowType, oPr)
{
	var sParentId = "bodyId";

	if (!g_aKGSWindows[sParentId])
		g_aKGSWindows[sParentId] = {};

	var oWindows = g_aKGSWindows[sParentId];

	var sApp = "unknownwindow";
	switch (nWindowType)
	{
	case EKGSWindowType.RoomList : sApp = "RoomList"; break;
	case EKGSWindowType.UserInfo : sApp = "UserInfo_" + oPr.UserName; break;
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
		case EKGSWindowType.RoomList : oWindow = new CKGSRoomListWindow(); break;
		case EKGSWindowType.UserInfo : oWindow = new CKGSUserInfoWindow(); break;
		}

		oWindows[sId] = oWindow;

		if (null !== oWindow)
		{
			oWindow.Init(sId, oPr);
			oWindow.Update_Size(true);
		}

		return oWindow;
	}

	return null;
}

function RemoveWindow(oWindow)
{
	var sParentId = "bodyId";

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
			break;
		}
	}
}


function CKGSWindowBase()
{
	CKGSWindowBase.superclass.constructor.call(this);
}
CommonExtend(CKGSWindowBase, CDrawingWindow);