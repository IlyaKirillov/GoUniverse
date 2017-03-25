"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     11.06.2016
 * Time     14:59
 */

function CKGSRoomInfoWindow()
{
	CKGSRoomListWindow.superclass.constructor.call(this);

	this.m_oClient           = null;
	this.m_oOwnerListView    = new CListView();
	this.m_nRoomId           = -1;

	this.m_nInnerH = -1;
	this.m_nInnerW = -1;

	this.m_oFindInputElement = null;

	this.m_oInfoScroll = null;
}
CommonExtend(CKGSRoomInfoWindow, CKGSWindowBase);

CKGSRoomInfoWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSRoomListWindow.superclass.Init.apply(this, arguments);

	this.m_nRoomId = oPr.RoomId;
	this.Set_Caption("Room info: " + this.m_oClient.GetRoomName(oPr.RoomId));

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";

	var oListControl = this.private_CreateOwnerList(oMainDiv);
	oListControl.Bounds.SetParams(0, 0, 0, 1000, false, false, true, false, 200, -1);
	oListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right);
	oListControl.HtmlElement.style.background = "#F3F3F3";
	oMainControl.AddControl(oListControl);

	var oInfoControl = this.private_CreateInfoArea(oMainDiv);
	oInfoControl.Bounds.SetParams(5, 5, 205, 5, true, true, true, true, -1, -1);
	oInfoControl.Anchor = (g_anchor_top | g_anchor_bottom | g_anchor_right | g_anchor_left);
	oMainControl.AddControl(oInfoControl);

	this.Update_Size(true);
	this.Show(oPr);
};
CKGSRoomInfoWindow.prototype.Update_Size = function(bForce)
{
	CKGSRoomListWindow.superclass.Update_Size.call(this, bForce);

	var W = this.HtmlElement.InnerDiv.clientWidth;
	var H = this.HtmlElement.InnerDiv.clientHeight;

	if (true === bForce || Math.abs(W - this.m_nInnerW) > 0.001 || Math.abs(H - this.m_nInnerH) > 0.001)
	{
		this.m_nInnerW = W;
		this.m_nInnerH = H;
		this.m_oOwnerListView.Update();
		this.m_oOwnerListView.Update_Size();
	}

	if (this.m_oInfoScroll)
		this.m_oInfoScroll.CheckVisibility();
};
CKGSRoomInfoWindow.prototype.Get_DefaultWindowSize = function()
{
	return {W : 700, H : 450};
};
CKGSRoomInfoWindow.prototype.private_CreateInfoArea = function(oParentDiv)
{
	var oElement = document.createElement("div");
	oElement.id             = oParentDiv.id + "I";
	oElement.style.position = "absolute";
	oElement.style.border   = "1px solid #BEBEBE";
	oElement.style.background = "#F3F3F3";
	oElement.className += " Selectable";

	var oInfoArea              = document.createElement("div");
	oInfoArea.id               = oElement.id + "I";
	oInfoArea.style.position   = "absolute";
	oInfoArea.style.fontFamily = "'Segoe UI',Helvetica,Tahoma,Geneva,Verdana,sans-serif";
	oElement.appendChild(oInfoArea);
	oParentDiv.appendChild(oElement);

	var oControl = CreateControlContainer(oElement.id);

	var oAreaControl = CreateControlContainer(oInfoArea.id);
	oAreaControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
	oAreaControl.Anchor = (g_anchor_top | g_anchor_bottom | g_anchor_right | g_anchor_left);
	oControl.AddControl(oAreaControl);

	if (this.m_oClient)
	{
		var sRoomMessage = this.m_oClient.GetRoomGreetingMessage(this.m_nRoomId);

		var oDiv     = oInfoArea;
		var oTextDiv = document.createElement("div");
		oTextDiv.style.height = "100%";
		var oTextSpan;

		var aLines = SplitTextToLines(sRoomMessage);
		for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
		{
			oTextSpan            = document.createElement("span");
			oTextSpan.innerHTML  = aLines[nIndex];

			oTextDiv.appendChild(oTextSpan);
			oTextDiv.appendChild(document.createElement("br"));
		}

		ProcessUserGameLinks(oTextDiv, this.m_oClient);
		oDiv.appendChild(oTextDiv);

		this.m_oInfoScroll = new CVerticalScroll();
		this.m_oInfoScroll.Init(oTextDiv, "VerScroll", "VerScrollActive", true);
		this.m_oInfoScroll.SetPaddings(-1, 0, 0);
	}

	return oControl;
};
CKGSRoomInfoWindow.prototype.private_CreateOwnerList = function(oParentDiv)
{
	var sListId      = oParentDiv.id + "L";
	var oListElement = this.protected_CreateDivElement(oParentDiv, sListId);
	this.m_oOwnerListView.Set_BGColor(243, 243, 243);
	var oListControl = this.m_oOwnerListView.Init(sListId, new CKGSPlayersList(this.m_oApp));
	
	if (this.m_oClient)
	{
		var arrOwners = this.m_oClient.GetRoomOwners(this.m_nRoomId);

		for (var nIndex = 0, nCount = arrOwners.length; nIndex < nCount; ++nIndex)
		{
			var oUser = arrOwners[nIndex];
			this.m_oOwnerListView.Handle_Record([0, oUser.GetName(), oUser.GetRank(), oUser.IsFriend(), oUser]);
		}
	}

	return oListControl;
};
CKGSRoomInfoWindow.prototype.Close = function()
{
	CKGSRoomInfoWindow.superclass.Close.call(this);
	RemoveWindow(this);
};