"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     09.06.2016
 * Time     0:38
 */

function CVisualTabs()
{
	this.m_arrTabs       = [];
	this.m_oCurrentTab   = null;
	this.m_oPanelElement = null; // Div, которая будет содержать все наши табы
	this.m_oPanelControl = null;
}
CVisualTabs.prototype.Init = function(sDivId)
{
	this.m_oPanelElement = document.getElementById(sDivId);
	this.m_oPanelControl = CreateControlContainer(sDivId);
	return this.m_oPanelControl;
};
CVisualTabs.prototype.Clear = function()
{
	while (this.m_arrTabs.length > 0)
	{
		var oTab = this.m_arrTabs[0];
		this.RemoveTab(oTab);
		oTab.OnCloseTab();
	}
};
CVisualTabs.prototype.AddTab = function(oTab, bMakeCurrent)
{
	this.m_arrTabs.push(oTab);
	oTab.SetParent(this);

	var oTabDiv = oTab.GetDiv();
	this.m_oPanelElement.appendChild(oTabDiv);

	if (true === bMakeCurrent)
		this.m_oCurrentTab = oTab;
};
CVisualTabs.prototype.RemoveTab = function(oTab)
{
	var nFindIndex = -1;
	for (var nIndex = 0, nCount = this.m_arrTabs.length; nIndex < nCount; ++nIndex)
	{
		if (oTab === this.m_arrTabs[nIndex])
		{
			nFindIndex = nIndex;
			break;
		}
	}

	if (-1 === nFindIndex)
		return;

	this.m_arrTabs.splice(nFindIndex, 1);
	this.m_oPanelElement.removeChild(oTab.GetDiv());

	if (this.m_oCurrentTab === oTab)
	{
		if (nFindIndex >= 0 && nFindIndex <= this.m_arrTabs.length - 1)
			this.m_oCurrentTab = this.m_arrTabs[nFindIndex];
		else if (nFindIndex >= 1)
			this.m_oCurrentTab = this.m_arrTabs[nFindIndex - 1];
		else
			this.m_oCurrentTab = null;
	}
};
CVisualTabs.prototype.OnClick = function(oTab)
{
	var oCurTab = this.m_oCurrentTab;
	var oNewTab = null;

	for (var nIndex = 0, nCount = this.m_arrTabs.length; nIndex < nCount; ++nIndex)
	{
		if (this.m_arrTabs[nIndex] === oTab)
		{
			oNewTab = oTab;
			break;
		}
	}

	if (!oNewTab || oNewTab === oCurTab)
		return null;

	this.m_oCurrentTab = oNewTab;
	return oCurTab;
};
CVisualTabs.prototype.OnClickClose = function(oTab)
{
	this.RemoveTab(oTab);

	if (this.m_oCurrentTab)
	{
		this.m_oCurrentTab.OnClick();
		return true;
	}

	return false;
};
CVisualTabs.prototype.UpdateSize = function()
{
	if (this.m_oCurrentTab)
		this.m_oCurrentTab.UpdateSize();
};
CVisualTabs.prototype.GetCurrent = function()
{
	return this.m_oCurrentTab;
};
CVisualTabs.prototype.GetTab = function(nId)
{
	for (var nIndex = 0, nCount = this.m_arrTabs.length; nIndex < nCount; ++nIndex)
	{
		if (nId === this.m_arrTabs[nIndex].GetId())
			return this.m_arrTabs[nIndex];
	}

	return null;
};
CVisualTabs.prototype.GetCurrentId = function()
{
	if (this.m_oCurrentTab)
		return this.m_oCurrentTab.GetId();

	return -1;
};
CVisualTabs.prototype.GetCount = function()
{
	return this.m_arrTabs.length;
};
CVisualTabs.prototype.GetTabByIndex = function(nIndex)
{
	if (nIndex < 0 || nIndex > this.m_arrTabs.length - 1)
		return null;

	return this.m_arrTabs[nIndex];
};

function CVisualGameRoomTabs()
{
	CVisualGameRoomTabs.superclass.constructor.call(this);
}
CommonExtend(CVisualGameRoomTabs, CVisualTabs);
CVisualGameRoomTabs.prototype.Init = function(sDivId, sPanelDivId)
{
	var oControl = CVisualGameRoomTabs.superclass.Init.call(this, sDivId);

	var oPanelElement = document.getElementById(sDivId);

	oPanelElement.style.fontSize                  = "12px";
	oPanelElement.style.backgroundColor           = "#050708";
	oPanelElement.style.fontFamily                = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
	oPanelElement.style.cursor                    = "default";
	oPanelElement.style["-webkit-font-smoothing"] = "antialiased";

	this.m_oPanelElement = document.getElementById(sPanelDivId);

	return oControl;
};
CVisualGameRoomTabs.prototype.AddMainRoomTab = function(oTab, bMakeCurrent)
{
	this.m_arrTabs.push(oTab);
	oTab.SetParent(this);

	if (true === bMakeCurrent)
		this.m_oCurrentTab = oTab;
};
CVisualGameRoomTabs.prototype.Clear = function()
{
	// Удаление здесь особенное, потому что таб Main мы не должны удалять

	var oMainTab = null;
	for (var nIndex = 0, nCount = this.m_arrTabs.length; nIndex < nCount; ++nIndex)
	{
		if (-1 === this.m_arrTabs[nIndex].GetId())
		{
			oMainTab = this.m_arrTabs[nIndex];
			this.m_arrTabs.splice(nIndex, 1);
			break;
		}
	}

	if (!oMainTab)
	{
		console.log("GoUniverse Error: No main room tab on delete.");
		return;
	}

	CVisualGameRoomTabs.superclass.Clear.call(this);

	this.m_arrTabs.push(oMainTab);
};


function CVisualGameRoomTab(oApp)
{
	this.m_oApp     = oApp;
	this.m_oParent  = null;
	this.m_nId      = -1;
	this.m_oTabDiv  = null; // Дивка самого таба

	this.m_oMainDiv      = null; // Дивка того, что мы показываем по нажатию на таб
	this.m_oGameTree     = null;
	this.m_oContainerDiv = null;
}
CVisualGameRoomTab.prototype.InitMainRoom = function(nId, sMainDivId, sTabDivId)
{
	var oThis = this;

	this.m_nId       = nId;
	this.m_oTabDiv   = document.getElementById(sTabDivId);
	this.m_oMainDiv  = document.getElementById(sMainDivId);
	this.m_oGameTree = null;

	this.m_oTabDiv.addEventListener("selectstart", function()
	{
		return false;
	}, false);
	this.m_oTabDiv.addEventListener("click", function()
	{
		oThis.OnClick();
	});
};
CVisualGameRoomTab.prototype.InitGameRoom = function(nId, oGameTree, sDivIdContainer)
{
	var oThis = this;

	// Создаем дивку под комнату с доской
	var sGameRoomDivId          = sDivIdContainer + nId;
	var oGameRoomDiv            = document.createElement("div");
	oGameRoomDiv.id             = sGameRoomDivId;
	oGameRoomDiv.style.position = "absolute";

	this.m_oContainerDiv = document.getElementById(sDivIdContainer);
	this.m_oContainerDiv.appendChild(oGameRoomDiv);

	var oBoardDiv = document.createElement("div");
	oBoardDiv.id = sGameRoomDivId + "B";
	oGameRoomDiv.appendChild(oBoardDiv);

	var oGameRoomControl      = CreateControlContainer(sGameRoomDivId);
	var oGameRoomBoardControl = CreateControlContainer(sGameRoomDivId + "B");
	oGameRoomBoardControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
	oGameRoomBoardControl.Anchor = (g_anchor_top | g_anchor_bottom |g_anchor_left | g_anchor_right);
	oGameRoomControl.AddControl(oGameRoomBoardControl);

	var oDrawing = new CDrawing(oGameTree);
	oDrawing.Create_MixedFullTemplate(sGameRoomDivId + "B");
	oDrawing.Update_Size(true);

	// Создаем дивку под таб
	var oDivTab                      = document.createElement("div");
	oDivTab.style.transitionProperty = "width,height,background,margin,border,padding";
	oDivTab.style.transitionDuration = ".25s";
	oDivTab.style.float              = "left";
	oDivTab.style.height             = "100%";
	oDivTab.style.margin             = "0px";
	oDivTab.style.padding            = "0px";

	oDivTab.addEventListener("selectstart", function()
	{
		return false;
	}, false);
	oDivTab.addEventListener("mouseover", function()
	{
		oDivTab.style.backgroundColor = "#505050";
	});
	oDivTab.addEventListener("mouseout", function()
	{
		if (oThis.m_oParent && oThis.m_oParent.GetCurrent() !== oThis)
			oDivTab.style.backgroundColor = "transparent";
		else
			oDivTab.style.backgroundColor = "#737373";
	});

	var oButton                             = document.createElement("button");
	oButton.tabIndex                        = "0";
	oButton.style.background                = "none";
	oButton.style.outline                   = "none";
	oButton.style.cursor                    = "pointer";
	oButton.style["-webkit-appearance"]     = "none";
	oButton.style["-webkit-border-radius"]  = "0";
	oButton.style.overflow                  = "visible";
	oButton.style.fontFamily                = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
	oButton.style["-webkit-font-smoothing"] = "antialiased";
	oButton.style.padding                   = "0px";
	oButton.style.border                    = "1px solid transparent";
	oButton.style.boxSizing                 = "border-box";
	oButton.style.fontSize                  = "14px";
	oButton.style.height                    = "100%";
	oButton.style.margin                    = "0px";
	oButton.style.padding                   = "0px 0px 0px 14px";
	oButton.style.color                     = "#fff";
	oButton.style.maxWidth                  = "170px";
	oButton.style.overflow                  = "hidden";
	oButton.style.float                     = "left";
	oButton.onclick = function()
	{
		oThis.OnClick();
	};
	oButton.onmousedown = function()
	{
		oDivTab.style.backgroundColor = "#969696";
	};
	oDivTab.appendChild(oButton);

	// Заголовок в табе
	var sWhiteName = oGameTree.Get_WhiteName();
	var sBlackName = oGameTree.Get_BlackName();
	var oCaptionDiv = document.createElement("div");
	oCaptionDiv.style.textAlign = "left";
	var oCaptionStringDiv = document.createElement("div");
	oCaptionStringDiv.innerHTML = String.fromCharCode(0x2691) + "&nbsp;" + sWhiteName;
	oCaptionDiv.appendChild(oCaptionStringDiv);
	oCaptionStringDiv = document.createElement("div");
	oCaptionStringDiv.innerHTML = String.fromCharCode(0x2690) + "&nbsp;" + sBlackName;
	oCaptionDiv.appendChild(oCaptionStringDiv);
	oButton.appendChild(oCaptionDiv);

	// Кнопка для закрытия таба
	var oCloseButton           = document.createElement("button");
	oCloseButton.tabIndex      = "0";
	oCloseButton["aria-label"] = "Close room";
	oCloseButton.title         = "Close room";
	oCloseButton.className += " " + "ButtonCloseGameRoom";
	oCloseButton.addEventListener("click", function()
	{
		oThis.OnClickClose();
	});
	oDivTab.appendChild(oCloseButton);

	// Добавим крестик к кнопке
	var oCenter        = document.createElement("center");
	var oCenterDiv     = document.createElement("div");
	var oCenterDivSpan = document.createElement("span");
	oCenterDivSpan.className += " " + "GameRoomCloseSpan";
	oCenterDiv.appendChild(oCenterDivSpan);
	oCenter.appendChild(oCenterDiv);
	oCloseButton.appendChild(oCenter);

	this.m_nId       = nId;
	this.m_oGameTree = oGameTree;
	this.m_oMainDiv  = oGameRoomDiv;
	this.m_oTabDiv   = oDivTab;

	return oGameRoomControl;
};
CVisualGameRoomTab.prototype.GetId = function()
{
	return this.m_nId;
};
CVisualGameRoomTab.prototype.GetDiv = function()
{
	return this.m_oTabDiv;
};
CVisualGameRoomTab.prototype.SetParent = function(oParent)
{
	this.m_oParent = oParent;
};
CVisualGameRoomTab.prototype.UpdateSize = function()
{
	if (this.m_oGameTree)
		this.m_oGameTree.Update_Size();
};
CVisualGameRoomTab.prototype.OnClick = function()
{
	if (!this.m_oParent)
		return;

	var oOldTab = this.m_oParent.OnClick(this);
	if (oOldTab)
	{
		$(oOldTab.m_oMainDiv).fadeOut(500);
		if (oOldTab.m_oGameTree)
			oOldTab.m_oTabDiv.style.backgroundColor = "transparent";
	}

	$(this.m_oMainDiv).fadeIn(500);
	if (this.m_oGameTree)
	{
		this.m_oTabDiv.style.backgroundColor = "#737373";
		this.m_oGameTree.Update_Size();
	}
};
CVisualGameRoomTab.prototype.OnClickClose = function()
{
	var oClient = this.m_oApp.GetClient();
	if (this.m_oGameTree && oClient)
		oClient.LeaveGameRoom(this.GetId());

	this.m_oParent.OnClickClose(this);

	this.OnCloseTab();
};
CVisualGameRoomTab.prototype.OnCloseTab = function()
{
	if (this.m_oContainerDiv)
		this.m_oContainerDiv.removeChild(this.m_oMainDiv);
};

function CVisualChatRoomTabs()
{
	CVisualChatRoomTabs.superclass.constructor.call(this);
}
CommonExtend(CVisualChatRoomTabs, CVisualTabs);

function CVisualChatRoomTab(oApp)
{
	this.m_oApp    = oApp;
	this.m_oParent = null;
	this.m_nId     = -1;
	this.m_oTabDiv = null;

	this.m_nNewMessagesCount = 0;
	this.m_oMessagesDiv      = null;
	this.m_oPopup            = null;
}
CVisualChatRoomTab.prototype.Init = function(nId, sRoomName)
{
	var oThis = this;

	this.m_nId               = nId;
	this.m_nNewMessagesCount = 0;

	this.private_InitTab(sRoomName);
	this.private_InitMenuButton(sRoomName);
};
CVisualChatRoomTab.prototype.GetId = function()
{
	return this.m_nId;
};
CVisualChatRoomTab.prototype.GetDiv = function()
{
	return this.m_oTabDiv;
};
CVisualChatRoomTab.prototype.SetParent = function(oParent)
{
	this.m_oParent = oParent;
};
CVisualChatRoomTab.prototype.UpdateSize = function()
{
};
CVisualChatRoomTab.prototype.OnClick = function()
{
	if (!this.m_oParent)
		return;

	var oOldTab = this.m_oParent.OnClick(this);
	if (oOldTab)
	{
		oOldTab.m_oTabDiv.style.borderBottom = "1px solid #BEBEBE";
		oOldTab.m_oTabDiv.style.borderTop    = "3px solid #F3F3F3";
		oOldTab.m_oMenuSpan.style.visibility = "hidden";
	}

	this.m_oTabDiv.style.borderBottom = "1px solid #F3F3F3";
	this.m_oTabDiv.style.borderTop    = "3px solid rgb(0, 130, 114)";
	this.m_nNewMessagesCount          = 0;
	this.m_oMessagesDiv.innerHTML     = "";
	this.m_oMenuSpan.style.visibility = "visible";

	this.m_oApp.SetCurrentChatRoom(this.m_nId);
};
CVisualChatRoomTab.prototype.OnClickClose = function()
{
	var oClient = this.m_oApp.GetClient();
	if (oClient)
		oClient.LeaveChatRoom(this.m_nId);

	if (false === this.m_oParent.OnClickClose(this))
		this.m_oApp.SetCurrentChatRoom(-1);
};
CVisualChatRoomTab.prototype.IncreaseMessagesCount = function()
{
	this.m_nNewMessagesCount++;
	this.m_oMessagesDiv.innerHTML = "" +  Math.min(99, this.m_nNewMessagesCount);
};
CVisualChatRoomTab.prototype.OnCloseTab = function()
{
};
CVisualChatRoomTab.prototype.private_CreatePopup = function()
{
	this.m_oPopup = new CVisualPopup(this.m_oApp, this);
	this.m_oPopup.Create();

	var oHtmlElement = this.m_oPopup.GetHtmlElement();
	oHtmlElement.style.background         = "rgb(243, 243, 243)";
	oHtmlElement.style.borderRight        = "1px solid rgb(190, 190, 190)";
	oHtmlElement.style.borderLeft         = "1px solid rgb(190, 190, 190)";
	oHtmlElement.style.borderBottom       = "1px solid rgb(190, 190, 190)";
	oHtmlElement.style.boxShadow          = "0px 1px 2px rgba(0,0,0,0.2)";
	oHtmlElement.style.transitionProperty = "height";
	oHtmlElement.style.transitionDuration = "0.2s";
	oHtmlElement.style.transitionDelay    = "0s";
};
CVisualChatRoomTab.prototype.OnHidePopup = function(oPopup)
{
	var oHtmlElement = oPopup.GetHtmlElement();
	oHtmlElement.style.height = "0px";

	this.m_oMenuSpan.style.transform  = "rotate(90deg)";
};
CVisualChatRoomTab.prototype.OnShowPopup = function(oPopup)
{
	var oHtmlElement = oPopup.GetHtmlElement();
	oHtmlElement.style.height = "30px";
	this.m_oMenuSpan.style.transform = "rotate(270deg)";
};
CVisualChatRoomTab.prototype.UpdatePopupPosition = function(oPopup)
{
	var oPos = Common_FindPosition(this.m_oTabDiv);
	var oHtmlElement = oPopup.GetHtmlElement();
	oHtmlElement.style.left = (oPos.X - 1) + "px";
	oHtmlElement.style.top = (oPos.Y + 24) + "px";
	oHtmlElement.style.width = this.m_oTabDiv.clientWidth;
};
CVisualChatRoomTab.prototype.private_InitTab = function(sRoomName)
{
	var oThis      = this;
	this.m_oTabDiv = document.createElement("div");
	var sHeight    = "21px";

	var DivTab = this.m_oTabDiv;
	DivTab["aria-label"]            = sRoomName;
	DivTab.title                    = sRoomName;
	DivTab.style.transitionProperty = "width,height,background,margin,border,padding";
	DivTab.style.transitionDuration = ".25s";
	DivTab.style.float              = "left";
	DivTab.style.height             = sHeight;
	DivTab.style.margin             = "0px";
	DivTab.style.padding            = "0px";
	DivTab.style.color              = "#000";
	DivTab.style.whiteSpace         = "nowrap";
	DivTab.style.textOverflow       = "ellipsis";
	DivTab.style.borderTop          = "3px solid #F3F3F3";
	DivTab.style.borderRight        = "1px solid #BEBEBE";
	DivTab.style.borderBottom       = "1px solid #BEBEBE";
	DivTab.addEventListener("selectstart", function()
	{
		return false;
	}, false);


	var NewTab                             = document.createElement("button");
	NewTab.tabIndex                        = "0";
	NewTab.style.transitionProperty        = "all";
	NewTab.style.transitionDuration        = ".25s";
	NewTab.style.background                = "none";
	NewTab.style.outline                   = "none";
	NewTab.style.cursor                    = "pointer";
	NewTab.style["-webkit-appearance"]     = "none";
	NewTab.style["-webkit-border-radius"]  = "0";
	NewTab.style.overflow                  = "visible";
	NewTab.style.fontFamily                = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
	NewTab.style["-webkit-font-smoothing"] = "antialiased";
	NewTab.style.padding                   = "0px";
	NewTab.style.border                    = "1px solid transparent";
	NewTab.style.boxSizing                 = "border-box";
	NewTab.style.fontSize                  = "14px";
	NewTab.style.lineHeight                = "20px";
	NewTab.style.height                    = "100%";
	NewTab.style.margin                    = "0px";
	NewTab.style.padding                   = "0px 0px 0px 14px";
	NewTab.style.maxWidth                  = "200px";
	NewTab.style.overflow                  = "hidden";
	NewTab.style.float                     = "left";
	NewTab.addEventListener("click", function()
	{
		oThis.OnClick();
	});

	var NewTabDiv = document.createElement("div");
	NewTabDiv.style.textAlign = "left";
	var oCaptionDiv = document.createElement("div");
	oCaptionDiv.innerHTML = sRoomName;
	NewTabDiv.appendChild(oCaptionDiv);
	NewTabDiv.addEventListener("selectstart", function()
	{
		return false;
	}, false);
	NewTab.appendChild(NewTabDiv);
	DivTab.appendChild(NewTab);

	this.m_oTabDiv     = DivTab;
};
CVisualChatRoomTab.prototype.private_InitMenuButton = function(sRoomName)
{
	var oThis      = this;
	var oMenuButton = document.createElement("button");
	oMenuButton.tabIndex = "0";
	oMenuButton["aria-label"] = "Close " + sRoomName;
	oMenuButton.title         = "Close " + sRoomName;

	oMenuButton.style.fontFamily                = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
	oMenuButton.style["-webkit-font-smoothing"] = "antialiased";
	oMenuButton.style.padding                   = "0px";
	oMenuButton.style.border                    = "1px solid transparent";
	oMenuButton.style.boxSizing                 = "border-box";
	oMenuButton.style["-moz-box-sizing"]        = "border-box";
	oMenuButton.style.background                = "none";
	oMenuButton.style.outline                   = "none";
	oMenuButton.style.cursor                    = "pointer";
	oMenuButton.style["-webkit-appearance"]     = "none";
	oMenuButton.style["-webkit-border-radius"]  = "0";
	oMenuButton.style.overflow                  = "visible";
	oMenuButton.style.color                     = "#000";
	oMenuButton.style.lineHeight                = "20px";
	oMenuButton.style.float                     = "left";
	oMenuButton.style.height                    = "100%";
	oMenuButton.style.width                     = "26px";
	oMenuButton.style.transitionProperty        = "color";
	oMenuButton.style.transitionDuration        = ".25s";


	oMenuButton.onmousedown = function()
	{
		oMenuButton.style.color = "#008272";
	};
	oMenuButton.onmouseout = function()
	{
		oMenuButton.style.color = "#111";
	};
	oMenuButton.onmouseover = function()
	{
		oMenuButton.style.color = "#009983";
	};


	var CBCenter = document.createElement("center");
	var CBCDiv   = document.createElement("div");
	CBCDiv.style.fontSize   = "14px";
	CBCDiv.style.lineHeight = "20px";
	CBCDiv.style.width      = "14px";
	CBCDiv.style.height     = "20px";
	CBCDiv.style.position   = "relative";
	var CBCDSpan = document.createElement("span");

	CBCDSpan.style.position   = "absolute";
	CBCDSpan.style.width      = "100%";
	CBCDSpan.style.height     = "100%";
	CBCDSpan.style.left       = "0px";
	CBCDSpan.style.top        = "1px";
	CBCDSpan.style.visibility = "hidden";

	CBCDSpan.className += " " + "closeSpan";
	CBCDiv.appendChild(CBCDSpan);

	var NewMessagesSpan = document.createElement("span");

	NewMessagesSpan.style.position   = "absolute";
	NewMessagesSpan.style.width      = "100%";
	NewMessagesSpan.style.height     = "100%";
	NewMessagesSpan.style.left       = "0px";
	NewMessagesSpan.style.top        = "1px";
	NewMessagesSpan.style.fontSize   = "12px";
	NewMessagesSpan.style.lineHeight = "18px";
	NewMessagesSpan.style.color      = "#008272";
	NewMessagesSpan.innerHTML        = "";
	CBCDiv.appendChild(NewMessagesSpan);


	CBCenter.appendChild(CBCDiv);
	oMenuButton.appendChild(CBCenter);
	this.m_oTabDiv.appendChild(oMenuButton);

	this.private_CreatePopup();

	oMenuButton.addEventListener("click", function()
	{
		if (oThis.m_oParent.GetCurrent() === oThis)
			oThis.m_oPopup.Toggle();
		else
			oThis.OnClick();
	});

	this.m_oMessagesDiv = NewMessagesSpan;
	this.m_oMenuSpan    = CBCDSpan;

	this.m_oMenuSpan.style.transform  = "rotate(90deg)";
	this.m_oMenuSpan.style.transition = "all 0.3s ease";
};