"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     03.06.2016
 * Time     22:53
 */

function CKGSRoomListWindow()
{
	CKGSRoomListWindow.superclass.constructor.call(this);

	this.m_oClient          = null;
	this.m_oRoomListView    = new CListView();
	this.m_oRoomListControl = null;

	this.m_nInnerH = -1;
	this.m_nInnerW = -1;

	this.m_oFindInputElement = null;
}
CommonExtend(CKGSRoomListWindow, CKGSWindowBase);

CKGSRoomListWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSRoomListWindow.superclass.Init.apply(this, arguments);

	this.Set_Caption(g_oLocalization.KGS.window.roomsList.caption);

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";

	var sListId       = sDivId + "L";
	var oListElement = this.protected_CreateDivElement(oMainDiv, sListId);
	this.m_oRoomListView.Set_BGColor(243, 243, 243);
	var oListControl = this.m_oRoomListView.Init(sListId, new CKGSRoomList(this.m_oApp));
	oListControl.Bounds.SetParams(0, 41, 0, 0, true, true, true, true, -1, -1);
	oListControl.Anchor = (g_anchor_left | g_anchor_top | g_anchor_bottom  | g_anchor_right);
	oMainControl.AddControl(oListControl);
	this.m_oRoomListControl = oListControl;

	this.private_CreateFindInput(sDivId + "F", oMainDiv, oMainControl);

	if (oPr && oPr.Client)
		this.m_oClient = oPr.Client;

	this.Update_Size(true);
	this.Show(oPr);

	if (oPr.Text)
	{
		this.m_oFindInputElement.value = oPr.Text;
		this.private_OnInputChange();
	}
};
CKGSRoomListWindow.prototype.Show = function(oPr)
{
	CKGSRoomListWindow.superclass.Show.call(this);

	if (this.m_oFindInputElement)
	{
		this.m_oFindInputElement.value = "";
		this.m_oFindInputElement.focus();
	}

	this.m_oRoomListView.Clear();

	if (this.m_oClient)
	{
		var oRooms    = this.m_oClient.GetAllRooms();
		for (var nRoomId in oRooms)
		{
			var oRoom = oRooms[nRoomId];
			if (oRoom.Name && "" !== oRoom.Name)
				this.m_oRoomListView.Handle_Record([0, oRoom.ChannelId, oRoom.Name, this.m_oClient.GetCategoryName(oRoom.Category), oRoom.Private]);
		}

	}

	this.m_oRoomListView.Update();
	this.m_oRoomListView.Update_Size();

	if (oPr.Text)
	{
		this.m_oFindInputElement.value = oPr.Text;
		this.private_OnInputChange();
	}
};
CKGSRoomListWindow.prototype.Update_Size = function(bForce)
{
	CKGSRoomListWindow.superclass.Update_Size.call(this, bForce);

	var W = this.HtmlElement.InnerDiv.clientWidth;
	var H = this.HtmlElement.InnerDiv.clientHeight;

	if (true === bForce || Math.abs(W - this.m_nInnerW) > 0.001 || Math.abs(H - this.m_nInnerH) > 0.001)
	{
		this.m_nInnerW = W;
		this.m_nInnerH = H;
		this.m_oRoomListView.Update();
		this.m_oRoomListView.Update_Size();
	}
};
CKGSRoomListWindow.prototype.Get_DefaultWindowSize = function()
{
	return {W : 410, H : 670};
};
CKGSRoomListWindow.prototype.private_CreateFindInput = function(sInputId, oParentDiv, oParentControl)
{
	var oFindInput = document.createElement("input");
	oFindInput.setAttribute("id", sInputId);
	oFindInput.setAttribute("style", "position:absolute;padding:0;margin:0;");
	oFindInput.setAttribute("oncontextmenu", "return false;");

	oFindInput.type           = "text";
	oFindInput.maxLength      = "256";
	oFindInput["aria-label"]  = g_oLocalization.KGS.window.roomsList.searchPlaceholder;
	oFindInput["placeholder"] = g_oLocalization.KGS.window.roomsList.searchPlaceholder;

	oFindInput.className += " inputKGSWindow";
	oFindInput.style.padding = "0px 6px 0px 6px";

	oParentDiv.appendChild(oFindInput);

	var oFindControl = CreateControlContainer(sInputId);
	oFindControl.Bounds.SetParams(5, 2, 5, -1, true, true, true, false, -1, 37);
	oFindControl.Anchor = (g_anchor_left | g_anchor_top | g_anchor_right);
	oParentControl.AddControl(oFindControl);

	var oThis = this;

	oFindInput.addEventListener("input", function()
	{
		oThis.private_OnInputChange();
	});

	this.m_oFindInputElement = oFindInput;
};
CKGSRoomListWindow.prototype.private_OnInputChange = function()
{
	var oClient       = this.m_oClient;
	var oRoomListView = this.m_oRoomListView;

	if (!oClient || !oRoomListView)
		return;

	var sValue = this.m_oFindInputElement.value;
	var oRooms = oClient.GetAllRooms();
	oRoomListView.Clear();
	if ("" === sValue)
	{
		for (var nRoomId in oRooms)
		{
			var oRoom = oRooms[nRoomId];
			if (oRoom.Name && "" !== oRoom.Name)
				oRoomListView.Handle_Record([0, oRoom.ChannelId, oRoom.Name, oRoom.CategoryName, oRoom.Private]);
		}
	}
	else
	{
		for (var nRoomId in oRooms)
		{
			var oRoom = oRooms[nRoomId];
			if (oRoom.Name && "" !== oRoom.Name && -1 !== oRoom.Name.toLowerCase().indexOf(sValue.toLowerCase()))
				oRoomListView.Handle_Record([0, oRoom.ChannelId, oRoom.Name, oRoom.CategoryName, oRoom.Private]);
		}
	}

	oRoomListView.Update();
	oRoomListView.Update_Size();
};
