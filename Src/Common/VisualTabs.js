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
CVisualTabs.prototype.AddTab = function(oTab)
{
	this.m_arrTabs.push(oTab);
	oTab.SetParent(this);

	var oTabDiv = oTab.GetDiv();
	this.m_oPanelElement.appendChild(oTabDiv);
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
CVisualTabs.prototype.MoveTabToStart = function(oTab)
{
	var oTabDiv = oTab.GetDiv();

	if (oTabDiv.parentNode === this.m_oPanelElement && oTabDiv !== this.m_oPanelElement.children[0])
	{
		this.m_oPanelElement.removeChild(oTabDiv);
		this.m_oPanelElement.insertBefore(oTabDiv, this.m_oPanelElement.children[0]);
	}
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
	this.m_oGameHandler  = null;

	this.m_oCaptionDiv   = null;
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
CVisualGameRoomTab.prototype.InitGameRoom = function(sDivIdContainer, oGame)
{
	var oThis = this;
	var nId   = oGame.GetRoomId();

	// Создаем дивку под комнату с доской
	var sGameRoomDivId          = sDivIdContainer + nId;
	var oGameRoomDiv            = document.createElement("div");
	oGameRoomDiv.id             = sGameRoomDivId;
	oGameRoomDiv.style.position = "absolute";

	this.m_oContainerDiv = document.getElementById(sDivIdContainer);
	this.m_oContainerDiv.insertBefore(oGameRoomDiv, this.m_oContainerDiv.children[0] ? this.m_oContainerDiv.children[0] : null);

	var oBoardDiv = document.createElement("div");
	oBoardDiv.id = sGameRoomDivId + "B";
	oGameRoomDiv.appendChild(oBoardDiv);

	var oGameRoomControl      = CreateControlContainer(sGameRoomDivId);
	var oGameRoomBoardControl = CreateControlContainer(sGameRoomDivId + "B");
	oGameRoomBoardControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
	oGameRoomBoardControl.Anchor = (g_anchor_top | g_anchor_bottom |g_anchor_left | g_anchor_right);
	oGameRoomControl.AddControl(oGameRoomBoardControl);

	var oGameTree = oGame.GetGameTree();
	if (null !== oGameTree)
	{
		var oDrawing = new CDrawing(oGameTree);

		if (!oGame.IsPlayer())
			oDrawing.Create_GoUniverseViewerTemplate(sGameRoomDivId + "B", this.m_oApp, this, oGame);
		else
			oDrawing.Create_GoUniverseMatchTemplate(sGameRoomDivId + "B", this.m_oApp, this, oGame);

		oDrawing.Update_Size(true);
		oGameTree.Set_EditingFlags({LoadFile : false, GameInfo : false, RemoveNodes : false});
	}

	// Создаем дивку под таб
	var oDivTab                      = document.createElement("div");
	oDivTab.style.transitionProperty = "width,height,background,margin,border,padding";
	oDivTab.style.transitionDuration = ".25s";
	oDivTab.style.float              = "left";
	oDivTab.style.height             = "50px";
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
	var oCaptionDiv = document.createElement("div");
	oCaptionDiv.style.textAlign = "left";
	this.m_oCaptionDiv = oCaptionDiv;
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

	this.m_nId          = nId;
	this.m_oGameTree    = oGameTree;
	this.m_oMainDiv     = oGameRoomDiv;
	this.m_oTabDiv      = oDivTab;
	this.m_oCaptionDiv  = oCaptionDiv;
	this.m_oGameHandler = oGame;

	this.private_FillCaption(oGame.IsDemonstration());

	return oGameRoomControl;
};
CVisualGameRoomTab.prototype.ModifyGameRoom = function(nNewId, bDemonstration)
{
	this.m_nId = nNewId;
	this.private_FillCaption(bDemonstration);
};
CVisualGameRoomTab.prototype.private_FillCaption = function(bDemonstration)
{
	var oGameTree         = this.m_oGameTree;
	var oCaptionDiv       = this.m_oCaptionDiv;
	oCaptionDiv.innerHTML = "";

	if (true !== bDemonstration)
	{
		var sWhiteName = oGameTree ? oGameTree.Get_WhiteName() : "White";
		var sBlackName = oGameTree ? oGameTree.Get_BlackName() : "Black";
		var oCaptionStringDiv       = document.createElement("div");
		oCaptionStringDiv.innerHTML = String.fromCharCode(0x2691) + "&nbsp;" + sWhiteName + "[" + (oGameTree ? oGameTree.Get_WhiteRating() : "-") + "]";
		oCaptionDiv.appendChild(oCaptionStringDiv);
		oCaptionStringDiv           = document.createElement("div");
		oCaptionStringDiv.innerHTML = String.fromCharCode(0x2690) + "&nbsp;" + sBlackName + "[" + (oGameTree ? oGameTree.Get_BlackRating() : "-") + "]";
		oCaptionDiv.appendChild(oCaptionStringDiv);
	}
	else
	{
		var oCaptionStringDiv       = document.createElement("div");
		oCaptionStringDiv.innerHTML = String.fromCharCode(0x2615) + "&nbsp;" + (oGameTree ? oGameTree.Get_GameTranscriber() : "");
		oCaptionDiv.appendChild(oCaptionStringDiv);
	}
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
		g_oFadeEffect.Out(oOldTab.m_oMainDiv, 500);
		if (oOldTab.m_oGameTree)
			oOldTab.m_oTabDiv.style.backgroundColor = "transparent";
	}

	var oThis = this;
	g_oFadeEffect.In(this.m_oMainDiv, 500, function()
	{
		if (oThis.m_oGameTree && null !== oThis.m_oGameHandler)
		{
			oThis.m_oGameHandler.GetCommentsHandler().ScrollChatAreaToBottom();
		}
		else if (null === oThis.m_oGameTree)
		{
			oThis.m_oApp.ScrollChatAreaToBottom();
		}
	});


	if (this.m_oGameTree)
	{
		this.m_oTabDiv.style.backgroundColor = "#737373";
		this.m_oGameTree.Update_Size();
		this.m_oGameTree.Focus();
	}
	else if (null === this.m_oGameTree)
	{
		this.m_oApp.UpdateDropDownChatTabsButton();
		this.m_oApp.ScrollChatTabsToCurrent();
	}

	this.m_oApp.private_CollapseGameTabs();
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

	this.m_oApp.UpdateDropDownGameTabsButton();
};

function CVisualChatRoomTabs()
{
	CVisualChatRoomTabs.superclass.constructor.call(this);
}
CommonExtend(CVisualChatRoomTabs, CVisualTabs);
CVisualChatRoomTabs.prototype.AddTab = function(oTab)
{
	this.m_arrTabs.push(oTab);
	oTab.SetParent(this);

	var sName   = oTab.GetRoomName();
	var oTabDiv = oTab.GetDiv();

	if (oTab.IsPrivate())
	{
		this.m_oPanelElement.appendChild(oTabDiv);
	}
	else
	{
		for (var nIndex = 0, nCount = this.m_oPanelElement.children.length; nIndex < nCount; ++nIndex)
		{
			var oTempTabDiv = this.m_oPanelElement.children[nIndex];
			if (oTempTabDiv.visualTab)
			{
				var sRoomName = oTempTabDiv.visualTab.GetRoomName();
				if (Common.Compare_Strings(sName, sRoomName) < 0)
				{
					this.m_oPanelElement.insertBefore(oTabDiv, oTempTabDiv);
					return;
				}
			}
		}

		this.m_oPanelElement.appendChild(oTabDiv);
	}
};

function CVisualChatRoomTab(oApp)
{
	this.m_oApp    = oApp;
	this.m_oParent = null;
	this.m_nId     = -1;
	this.m_oTabDiv = null;

	this.m_bPrivateChat      = false;
	this.m_bSound            = false;
	this.m_sRoomName         = "";
	this.m_oTabBackgroundDiv = null;
	this.m_oTabForegroundDiv = null;
	this.m_oMenuSoundButton  = null;

	this.m_nNewMessagesCount = 0;
	this.m_oMessagesDiv      = null;
	this.m_oPopup            = null;

	this.m_nMinWidth         = 4 * 26 + 2;
}
CVisualChatRoomTab.prototype.Init = function(nId, sRoomName, bPrivate)
{
	this.m_nId               = nId;
	this.m_nNewMessagesCount = 0;
	this.m_bPrivateChat      = bPrivate;
	this.m_sRoomName         = sRoomName;
	this.m_bSound            = (true === bPrivate ? true : false);

	this.private_InitTab(sRoomName);
	this.private_InitMenuButton(sRoomName);
};
CVisualChatRoomTab.prototype.GetRoomName = function()
{
	return this.m_sRoomName;
};
CVisualChatRoomTab.prototype.IsPrivate = function()
{
	return this.m_bPrivateChat;
};
CVisualChatRoomTab.prototype.IsSoundOn = function()
{
	return this.m_bSound;
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
		oOldTab.m_oBackDiv.style.borderTop          = "1px solid #BEBEBE";
		oOldTab.m_oBackDiv.style.borderRight        = "1px solid #BEBEBE";
		oOldTab.m_oBackDiv.style.borderLeft         = "1px solid transparent";

		oOldTab.m_oTabDiv.style.borderBottom = "1px solid #BEBEBE";
		oOldTab.m_oTabDiv.style.borderTop    = "3px solid #F3F3F3";
		oOldTab.m_oMenuSpan.style.visibility = "hidden";
	}

	this.m_oBackDiv.style.borderTop          = "1px solid rgb(0, 130, 114)";
	this.m_oBackDiv.style.borderRight        = "1px solid rgb(0, 130, 114)";
	this.m_oBackDiv.style.borderLeft         = "1px solid rgb(0, 130, 114)";


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

	this.m_oApp.UpdateDropDownChatTabsButton();
};
CVisualChatRoomTab.prototype.IncreaseMessagesCount = function()
{
	this.m_nNewMessagesCount++;
	this.m_oMessagesDiv.innerHTML = "" +  Math.min(99, this.m_nNewMessagesCount);
};
CVisualChatRoomTab.prototype.OnCloseTab = function()
{
	this.m_oApp.UpdateDropDownChatTabsButton();
};
CVisualChatRoomTab.prototype.private_CreatePopup = function()
{
	this.m_oPopup = new CVisualPopup(this.m_oApp, this);
	this.m_oPopup.Create(true);

	var oHtmlElement = this.m_oPopup.GetHtmlElement();
	oHtmlElement.style.background         = "rgb(243, 243, 243)";
	oHtmlElement.style.borderRight        = "1px solid rgb(190, 190, 190)";
	oHtmlElement.style.borderLeft         = "1px solid rgb(190, 190, 190)";
	oHtmlElement.style.borderBottom       = "1px solid rgb(190, 190, 190)";
	oHtmlElement.style.boxShadow          = "0px 1px 2px rgba(0,0,0,0.2)";
	oHtmlElement.style.transitionProperty = "height";
	oHtmlElement.style.transitionDuration = "0.2s";
	oHtmlElement.style.transitionDelay    = "0s";
	this.private_InitMenu();
};
CVisualChatRoomTab.prototype.OnHidePopup = function(oPopup)
{
	var oHtmlElement = oPopup.GetHtmlElement();
	oHtmlElement.style.height = "0px";

	this.m_oPopup = null;

	this.m_oMenuSpan.style.transform  = "rotate(90deg)";
};
CVisualChatRoomTab.prototype.OnPreShowPopup = function(oPopup)
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
	var nScrollOffset = this.m_oTabDiv.parentNode.scrollTop;
	var oPos = Common_FindPosition(this.m_oTabDiv);
	var oHtmlElement = oPopup.GetHtmlElement();
	oHtmlElement.style.left = (oPos.X - 1) + "px";
	oHtmlElement.style.top = (oPos.Y + 24 - nScrollOffset) + "px";
	oHtmlElement.style.width = this.m_oTabDiv.clientWidth;
};
CVisualChatRoomTab.prototype.private_InitTab = function(sRoomName)
{
	var oThis      = this;
	this.m_oTabDiv = document.createElement("div");
	var sHeight    = "21px";


	var oBackDiv               = document.createElement("div");
	oBackDiv.style.position    = "absolute";
	oBackDiv.style.top         = "-4px";
	oBackDiv.style.left        = "-1px";
	oBackDiv.style.right       = "-1px";
	oBackDiv.style.height      = "3px";
	oBackDiv.style.borderTop   = "1px solid #BEBEBE";
	oBackDiv.style.borderRight = "1px solid #BEBEBE";
	oBackDiv.style.borderLeft  = "1px solid transparent";

	this.m_oBackDiv = oBackDiv;

	this.m_oTabDiv.appendChild(oBackDiv);


	var DivTab                      = this.m_oTabDiv;
	DivTab.style.overflow           = "visible";
	DivTab.style.position           = "relative";
	DivTab["aria-label"]            = sRoomName;
	DivTab.title                    = sRoomName;
	DivTab.style.transitionProperty = "width,height,background,margin,border,padding";
	DivTab.style.transitionDuration = ".25s";
	DivTab.style.float              = "left";
	DivTab.style.height             = sHeight;
	DivTab.style.minWidth           = this.m_nMinWidth + "px";
	DivTab.style.margin             = "0px";
	DivTab.style.padding            = "0px";
	DivTab.style.color              = "#000";
	DivTab.style.whiteSpace         = "nowrap";
	DivTab.style.textOverflow       = "ellipsis";
	DivTab.style.borderTop          = "3px solid transparent";
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
	if (true === this.m_bPrivateChat)
	{
		oCaptionDiv.style.fontWeight = "bold";
		oCaptionDiv.style.color      = "#008272";
	}
	oCaptionDiv.innerHTML = sRoomName;
	NewTabDiv.appendChild(oCaptionDiv);
	NewTabDiv.addEventListener("selectstart", function()
	{
		return false;
	}, false);
	NewTab.appendChild(NewTabDiv);
	DivTab.appendChild(NewTab);

	DivTab.visualTab = this;
	this.m_oTabDiv = DivTab;
};
CVisualChatRoomTab.prototype.private_InitMenuButton = function()
{
	var oThis            = this;
	var oMenuButton      = document.createElement("button");
	oMenuButton.tabIndex = "0";
	oMenuButton.className += " ChatMenuButton";
	oMenuButton.style["float"] = "right";

	var oCenter    = document.createElement("center");
	var oCenterDiv = document.createElement("div");
	var oMenuSpan  = document.createElement("span");

	oMenuSpan.style.visibility = "hidden";
	oMenuSpan.className += " ChatMenuSpan";
	oCenterDiv.appendChild(oMenuSpan);

	var oMessagesSpan              = document.createElement("span");
	oMessagesSpan.style.fontSize   = "12px";
	oMessagesSpan.style.lineHeight = "18px";
	oMessagesSpan.style.color      = "#008272";
	oMessagesSpan.innerHTML        = "";
	oCenterDiv.appendChild(oMessagesSpan);
	oCenter.appendChild(oCenterDiv);
	oMenuButton.appendChild(oCenter);
	this.m_oTabDiv.appendChild(oMenuButton);

	oMenuButton.addEventListener("click", function()
	{
		if (oThis.m_oParent.GetCurrent() === oThis)
		{
			if (oThis.m_oPopup)
			{
				oThis.m_oPopup.Hide();
			}
			else
			{
				oThis.private_CreatePopup();
				oThis.m_oPopup.Toggle();
			}
		}
		else
		{
			oThis.OnClick();
		}
	});

	this.m_oMessagesDiv = oMessagesSpan;
	this.m_oMenuSpan    = oMenuSpan;

	this.m_oMenuSpan.style.transform  = "rotate(90deg)";
	this.m_oMenuSpan.style.transition = "all 0.3s ease";
};
CVisualChatRoomTab.prototype.private_InitMenu = function()
{
	var oThis = this;

	var oHtmlElement = this.m_oPopup.GetHtmlElement();
	this.private_AddMenuButton(oHtmlElement, "right", "ChatMenuSpanClose",  function()
	{
		oThis.OnClickClose();
	}, "Close Room");
	this.private_AddMenuButton(oHtmlElement, "left", "ChatMenuSpanLeftArrow",  function()
	{
		oThis.MoveTabToStart();
	}, "Move this tab to the start of the list");
	this.private_AddMenuButton(oHtmlElement, "left", "ChatMenuSpanInfo",  function()
	{
		oThis.ShowRoomInfo();
	}, oThis.IsPrivate() ? "User Info" : "Room Info");

	this.m_oMenuSoundButton = this.private_AddMenuButton(oHtmlElement, "left", this.IsSoundOn() ? "ChatMenuSpanSoundOn" : "ChatMenuSpanSoundOff" ,  function()
	{
		oThis.OnToggleSound();
	}, this.IsSoundOn() ? "Sound is on" : "Sound is off");
};
CVisualChatRoomTab.prototype.private_AddMenuButton = function(oParentElement, sFloat, sSpanClass, fOnClickHandler, sHint)
{
	var oButton      = document.createElement("button");
	oButton.tabIndex = "0";
	oButton.className = "ChatMenuButton";
	oButton.style["float"] = sFloat;

	if (sHint)
	{
		oButton["aria-label"] = sHint;
		oButton.title         = sHint;
	}

	var oCenter    = document.createElement("center");
	var oCenterDiv = document.createElement("div");
	var oSpan  = document.createElement("span");
	oSpan.className = sSpanClass;
	oCenterDiv.appendChild(oSpan);
	oCenter.appendChild(oCenterDiv);
	oButton.appendChild(oCenter);
	oParentElement.appendChild(oButton);

	oButton.addEventListener("click", fOnClickHandler, false);

	return {Button : oButton, Span : oSpan};
};
CVisualChatRoomTab.prototype.ShowRoomInfo = function()
{
	if (this.m_oApp && this.m_oApp.GetClient())
	{
		var oClient = this.m_oApp.GetClient();
		var nRoomId = this.GetId();

		if (oClient.IsPrivateChat(nRoomId))
		{
			var oPrivateChat = oClient.GetPrivateChat(nRoomId);
			oClient.LoadUserInfo(oPrivateChat.Name);
		}
		else if (oClient.IsChatRoom(nRoomId))
		{
			this.m_oApp.ShowRoomInfo(this.GetId());
		}
	}
};
CVisualChatRoomTab.prototype.MoveTabToStart = function()
{
	this.m_oParent.MoveTabToStart(this);
	this.m_oApp.ScrollChatTabsToCurrent();
};
CVisualChatRoomTab.prototype.OnToggleSound = function()
{
	if (!this.m_oMenuSoundButton)
		return;

	var sHint, sSpanClass;
	if (true === this.m_bSound)
	{
		this.m_bSound = false;

		sHint      = "Sound is off";
		sSpanClass = "ChatMenuSpanSoundOff";
	}
	else
	{
		this.m_bSound = true;

		sHint      = "Sound is on";
		sSpanClass = "ChatMenuSpanSoundOn";
	}

	this.m_oMenuSoundButton.Button["aria-label"] = sHint;
	this.m_oMenuSoundButton.Button.title         = sHint;

	this.m_oMenuSoundButton.Span.className = sSpanClass;
};