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
	CKGSRoomListWindow.superclass.Init.call(this, sDivId);

	this.Set_Caption("Room list");

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";

	var sListId       = sDivId + "L";
	var oListElement = this.protected_CreateDivElement(oMainDiv, sListId);
	this.m_oRoomListView.Set_BGColor(243, 243, 243);
	var oListControl = this.m_oRoomListView.Init(sListId, g_oKGSRoomList);
	oListControl.Bounds.SetParams(0, 41, 0, 0, true, true, true, true, -1, -1);
	oListControl.Anchor = (g_anchor_left | g_anchor_top | g_anchor_bottom  | g_anchor_right);
	oMainControl.AddControl(oListControl);
	this.m_oRoomListControl = oListControl;

	this.private_CreateFindInput(sDivId + "F", oMainDiv, oMainControl);

	if (oPr && oPr.Client)
		this.m_oClient = oPr.Client;

	this.Update_Size(true);
	this.Show(oPr);
};
CKGSRoomListWindow.prototype.Show = function()
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
				this.m_oRoomListView.Handle_Record([0, oRoom.ChannelId, oRoom.Name, this.m_oClient.GetCategoryName(oRoom.Category)]);
		}

	}

	this.m_oRoomListView.Update();
	this.m_oRoomListView.Update_Size();
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
	return {W : 385, H : 670};
};
CKGSRoomListWindow.prototype.private_CreateFindInput = function(sInputId, oParentDiv, oParentControl)
{
	var oFindInput = document.createElement("input");
	oFindInput.setAttribute("id", sInputId);
	oFindInput.setAttribute("style", "position:absolute;padding:0;margin:0;");
	oFindInput.setAttribute("oncontextmenu", "return false;");

	oFindInput.type           = "text";
	oFindInput.maxLength      = "256";
	oFindInput["aria-label"]  = "Enter room name here";
	oFindInput["placeholder"] = "Enter room name here";

	oFindInput.style.color           = "#505050";
	oFindInput.style.backgroundColor = "#fff";
	oFindInput.style.border          = "1px solid #969696";
	oFindInput.style.fontFamily      = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
	oFindInput.style.height          = "37px";
	oFindInput.style.fontSize        = "13px";
	oFindInput.style.padding         = "0px 47px 0px 6px";
	oFindInput.style.outline         = "none";

	oParentDiv.appendChild(oFindInput);

	var oFindControl = CreateControlContainer(sInputId);
	oFindControl.Bounds.SetParams(5, 2, 5, -1, true, true, true, false, -1, 37);
	oFindControl.Anchor = (g_anchor_left | g_anchor_top | g_anchor_right);
	oParentControl.AddControl(oFindControl);

	var oThis = this;

	oFindInput.addEventListener("input", function()
	{
		var oClient       = oThis.m_oClient;
		var oRoomListView = oThis.m_oRoomListView;

		if (!oClient || !oRoomListView)
			return;

		var sValue = this.value;
		var oRooms = oClient.GetAllRooms();
		oRoomListView.Clear();
		if ("" === sValue)
		{
			for (var nRoomId in oRooms)
			{
				var oRoom = oRooms[nRoomId];
				if (oRoom.Name && "" !== oRoom.Name)
					oRoomListView.Handle_Record([0, oRoom.ChannelId, oRoom.Name, oRoom.CategoryName]);
			}
		}
		else
		{
			for (var nRoomId in oRooms)
			{
				var oRoom = oRooms[nRoomId];
				if (oRoom.Name && "" !== oRoom.Name && -1 !== oRoom.Name.toLowerCase().indexOf(sValue.toLowerCase()))
					oRoomListView.Handle_Record([0, oRoom.ChannelId, oRoom.Name, oRoom.CategoryName]);
			}
		}

		oRoomListView.Update();
		oRoomListView.Update_Size();
	});

	this.m_oFindInputElement = oFindInput;
};