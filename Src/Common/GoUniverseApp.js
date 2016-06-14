"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     09.06.2016
 * Time     0:37
 */

function CGoUniverseApplication()
{
	this.m_oMainDiv            = null;
	this.m_oClientControl      = null;
	this.m_oMainRoomControl    = null;

	this.m_oPlayersListView    = new CListView();
	this.m_oPlayersListView.Set_BGColor(243, 243, 243);

	this.m_oGamesListView      = new CListView();
	this.m_oGamesListView.Set_BGColor(243, 243, 243);

	this.m_oClient             = null;

	this.m_oGameRoomTabs       = new CVisualGameRoomTabs();
	this.m_oChatRoomTabs       = new CVisualChatRoomTabs();

	this.m_arrPopups           = [];
}
CGoUniverseApplication.prototype.Init = function()
{
	this.private_InitMainDiv();
	this.private_InitLoginPage();
	this.private_InitClientPage();
	this.private_GotoLoginPage(false);
	this.OnResize();

	// // TEST
	// this.m_oClient = new CKGSClient(this);
	// this.OnConnect();
	//
	// this.AddChatRoom(1, "English");
	// this.AddChatRoom(2, "Русская");
	// this.AddChatRoom(3, "Тест");
	// this.AddChatRoom(4, "Хахахах");
	// this.AddChatRoom(5, "English");
	// this.AddChatRoom(6, "Русская");
	// this.AddChatRoom(7, "Тест");
	// this.AddChatRoom(8, "Хахахах");
	// this.AddChatRoom(9, "English");
	// this.AddChatRoom(10, "Русская");
	// this.AddChatRoom(11, "Тест");
	// this.AddChatRoom(12, "Хахахах");
	// this.AddChatRoom(13, "English");
	// this.AddChatRoom(14, "Русская");
	// this.AddChatRoom(15, "Тест");
	// this.AddChatRoom(16, "Хахахах");
	// this.AddChatRoom(17, "English");
	// this.AddChatRoom(18, "Русская");
	// this.AddChatRoom(19, "Тест");
	// this.AddChatRoom(20, "Хахахах");


	// this.AddGameRoom(1, new CGameTree());
	// this.AddGameRoom(2, new CGameTree());
	// this.AddGameRoom(3, new CGameTree());
	// this.AddGameRoom(4, new CGameTree());



	//_____________
};
CGoUniverseApplication.prototype.Close = function()
{
	if (!this.m_oClient)
		return;

	this.m_oClient.Disconnect();
};
CGoUniverseApplication.prototype.ConnectToKGS = function()
{
	if (!this.m_oClient)
		this.m_oClient = new CKGSClient(this);

	var sLogin    = document.getElementById("inputLoginId").value;
	var sPassword = document.getElementById("inputPasswordId").value;
	document.getElementById("inputPasswordId").value = "";
	this.m_oClient.Connect(sLogin, sPassword, "en_US");

	$(document.getElementById("divIdConnection")).fadeOut(200);
	$(document.getElementById("divIdConnectionError")).fadeOut(200);
};
CGoUniverseApplication.prototype.OnConnect = function()
{
	document.title = "KGS: " + this.m_oClient.GetUserName();
	document.getElementById("divIdClientNameText").innerHTML = this.m_oClient.GetUserName();

	$(document.getElementById("divMainId")).fadeIn(200);
	this.OnResize();
};
CGoUniverseApplication.prototype.OnResize = function()
{
	var ConnectionDiv        = document.getElementById("divIdConnection");
	ConnectionDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
	ConnectionDiv.style.top  = (document.body.clientHeight - 100) / 2 + "px";

	var ErrorDiv        = document.getElementById("divIdConnectionError");
	ErrorDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
	ErrorDiv.style.top  = (document.body.clientHeight - 100) / 2 + 150 + "px";

	if (this.m_oClientControl)
	{
		var W = this.m_oClientControl.HtmlElement.clientWidth;
		var H = this.m_oClientControl.HtmlElement.clientHeight;
		this.m_oClientControl.Resize(W, H);

		this.m_oPlayersListView.Update();
		this.m_oPlayersListView.Update_Size();

		this.m_oGamesListView.Update();
		this.m_oGamesListView.Update_Size();

		this.m_oGameRoomTabs.UpdateSize();
	}

	this.private_CollapsePopups(true);
};
CGoUniverseApplication.prototype.OpenRoomList = function()
{
	CreateKGSWindow(EKGSWindowType.RoomList, {Client : this.m_oClient, App : this});
};
CGoUniverseApplication.prototype.SendChatMessage = function(e)
{
	var oInputArea = document.getElementById("inputChatId");
	if (13 === e.keyCode && true !== e.ctrlKey && true !== e.shiftKey && this.m_oClient)
	{
		this.m_oClient.SendChatMessage(oInputArea.value);
		oInputArea.value = "";
		e.preventDefault();
	}
};
CGoUniverseApplication.prototype.Logout = function(sText)
{
	this.private_ClearClient();

	if (sText)
	{
		document.getElementById("divIdConnectionError").style.display = "block";
		document.getElementById("divIdConnectionErrorText").innerHTML = sText;
	}

	document.getElementById("divMainId").style.display       = "none";
	document.getElementById("divIdConnection").style.display = "block";
	document.getElementById("inputPasswordId").focus();

	document.title = "KGS: Login";
};
CGoUniverseApplication.prototype.GetClient = function()
{
	return this.m_oClient;
};
CGoUniverseApplication.prototype.GetPlayersListView = function()
{
	return this.m_oPlayersListView;
};
CGoUniverseApplication.prototype.GetGamesListView = function()
{
	return this.m_oGamesListView;
};
CGoUniverseApplication.prototype.AddChatRoom = function(nChatRoomId, sRoomName)
{
	var oTab = new CVisualChatRoomTab(this);
	oTab.Init(nChatRoomId, sRoomName);
	this.m_oChatRoomTabs.AddTab(oTab);
};
CGoUniverseApplication.prototype.SetCurrentChatRoom = function(nChatRoomId)
{
	if (this.m_oClient)
		this.m_oClient.SetCurrentChatRoom(nChatRoomId);

	//--------------

	this.private_CollapseChatTabs();

	var oTab = this.m_oChatRoomTabs.GetTab(nChatRoomId);
	var oTabDiv = oTab.m_oTabDiv;
	var nOffsetTop = oTabDiv.offsetTop;

	var nLine = parseInt((nOffsetTop + 1) / 25);

	var oTabs = document.getElementById("divIdLChatTabs");
	oTabs.scrollTop = nLine * 25;

	//--------------

	var oDiv = document.getElementById("textareaChatId");
	for (var nIndex = 0, nCount = oDiv.childNodes.length; nIndex < nCount; ++nIndex)
	{
		var oChild = oDiv.childNodes[nIndex];
		if (oChild.chatRoomId === nChatRoomId)
		{
			oChild.style.display = "block";
		}
		else
		{
			oChild.style.display = "none";
		}
	}

	document.getElementById("textareaChatId").scrollTop = document.getElementById("textareaChatId").scrollHeight;
};
CGoUniverseApplication.prototype.GetCurrentChatRoomTab = function()
{
	return this.m_oChatRoomTabs.GetCurrent();
};
CGoUniverseApplication.prototype.SetCurrentChatRoomTab = function(nChatRoomId)
{
	var oTab = this.m_oChatRoomTabs.GetTab(nChatRoomId);
	if (oTab)
		oTab.OnClick();
	else if (this.m_oClient)
		this.m_oClient.EnterChatRoom(nChatRoomId);
};
CGoUniverseApplication.prototype.AddRoomGreetingMessage = function(nChatRoomId, sGreetingMessage)
{
	var oTextDiv = this.AddConsoleMessage("", sGreetingMessage);
	oTextDiv.chatRoomId = nChatRoomId;
	oTextDiv.className += " Selectable";

	if (nChatRoomId === this.m_oChatRoomTabs.GetCurrent().GetId())
	{
		oTextDiv.style.display = "block";
		document.getElementById("textareaChatId").scrollTop = document.getElementById("textareaChatId").scrollHeight;
	}
	else
	{
		oTextDiv.style.display = "none";
	}
};
CGoUniverseApplication.prototype.AddConsoleMessage = function(sField, sText)
{
	var oDiv     = document.getElementById("textareaChatId");
	var oTextDiv = document.createElement("div");

	var oTextSpan;

	if (sField)
	{
		oTextSpan                 = document.createElement("span");
		oTextSpan.style.fontStyle = "italic";
		oTextSpan.textContent     = sField + ": ";
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
	oDiv.scrollTop = oDiv.scrollHeight;

	return oTextDiv;
};
CGoUniverseApplication.prototype.OnAddChatMessage = function(nChatRoomId, sUserName, sText)
{
	var oThis = this;

	var oDiv     = document.getElementById("textareaChatId");
	var oTextDiv = document.createElement("div");

	oTextDiv.className += " Selectable";
	oTextDiv.chatRoomId = nChatRoomId;

	var bMessageForMe = false;
	var sCurUserName = (this.m_oClient ? this.m_oClient.GetUserName() : "");
	if ("" !== sCurUserName && 0 === sText.indexOf(sCurUserName + ","))
		bMessageForMe = true;

	var oTextSpan              = document.createElement("span");
	oTextSpan.style.fontWeight = "bold";
	oTextSpan.style.cursor     = "pointer";
	oTextSpan.textContent      = sUserName + ": ";
	oTextSpan.className        = "UserChatSpan";
	oTextSpan.addEventListener("click", function()
	{
		var oInputArea = document.getElementById("inputChatId");
		oInputArea.value = sUserName + ", " + oInputArea.value;
		oInputArea.focus();
	});
	oTextSpan.addEventListener("contextmenu", function(e)
	{
		oThis.ShowUserContextMenu(e.pageX - 2, e.pageY + 2, sUserName);
		e.preventDefault();
		return false;
	}, false);
	oTextDiv.appendChild(oTextSpan);



	sText = sText.replace(urlRegEx, "<a href='$1' target='_blank'>$1</a>");

	oTextSpan                  = document.createElement("span");
	oTextSpan.innerHTML        = sText;
	if (true === bMessageForMe)
		oTextSpan.style.fontStyle = "italic";

	oTextDiv.appendChild(oTextSpan);

	oDiv.appendChild(oTextDiv);

	if (nChatRoomId === this.m_oChatRoomTabs.GetCurrentId())
	{
		oTextDiv.style.display = "block";

		if (Math.abs(oDiv.scrollHeight - oDiv.scrollTop - oDiv.clientHeight) < 50 || sUserName === sCurUserName)
			oDiv.scrollTop = oDiv.scrollHeight;
	}
	else
	{
		var oTab = this.m_oChatRoomTabs.GetTab(nChatRoomId);
		if (oTab)
			oTab.IncreaseMessagesCount();

		oTextDiv.style.display = "none";
	}
};
CGoUniverseApplication.prototype.AddGameRoom = function(nGameRoomId, oGameTree)
{
	var oTab = new CVisualGameRoomTab(this);
	var oGameRoomControl = oTab.InitGameRoom(nGameRoomId, oGameTree, "divMainId");
	this.m_oGameRoomTabs.AddTab(oTab, true);

	oGameRoomControl.Bounds.SetParams(0, 50, 1000, 1000, false, true, false, false, -1, -1);
	oGameRoomControl.Anchor = (g_anchor_bottom | g_anchor_left | g_anchor_right);
	this.m_oClientControl.AddControl(oGameRoomControl);

	this.OnResize();
};
CGoUniverseApplication.prototype.SetCurrentGameRoomTab = function(nGameRoomId)
{
	var oTab = this.m_oGameRoomTabs.GetTab(nGameRoomId);
	if (oTab)
		oTab.OnClick();
	else if (this.m_oClient)
		this.m_oClient.EnterToGameRoom(nGameRoomId);
};
CGoUniverseApplication.prototype.GetWidth = function()
{
	if (this.m_oMainDiv)
		return parseInt(this.m_oMainDiv.clientWidth);

	return 0;
};
CGoUniverseApplication.prototype.GetHeight = function()
{
	if (this.m_oMainDiv)
		return parseInt(this.m_oMainDiv.clientHeight);

	return 0;
};
CGoUniverseApplication.prototype.GetMainDiv = function()
{
	return this.m_oMainDiv;
};
CGoUniverseApplication.prototype.RegisterPopup = function(oPopup)
{
	this.m_arrPopups.push(oPopup);
};
CGoUniverseApplication.prototype.UnregisterPopup = function(oPopup)
{
	for (var nIndex = 0, nCount = this.m_arrPopups.length; nIndex < nCount; ++nIndex)
	{
		if (this.m_arrPopups[nIndex] === oPopup)
		{
			this.m_arrPopups.splice(nIndex, 1);
			break;
		}
	}
};
CGoUniverseApplication.prototype.ShowRoomInfo = function(nRoomId)
{
	CreateKGSWindow(EKGSWindowType.RoomInfo, {Client : this.m_oClient, App : this, RoomId : nRoomId});
};
CGoUniverseApplication.prototype.private_InitMainDiv = function()
{
	var oThis = this;
	this.m_oMainDiv = document.getElementById("divIdGoUniverse");
	this.m_oMainDiv.addEventListener("click", function()
	{
		oThis.private_CollapsePopups();
	}, false);

	this.m_oMainDiv.addEventListener("contextmenu", function()
	{
		oThis.private_CollapsePopups();
	}, false);

	this.m_oMainDiv.addEventListener("DOMMouseScroll", function()
	{
		oThis.private_CollapsePopups();
	}, false);

	this.m_oMainDiv.addEventListener("mousewheel", function()
	{
		oThis.private_CollapsePopups();
	}, false);
};
CGoUniverseApplication.prototype.private_InitLoginPage = function()
{
	var oThis = this;

	document.title = "KGS: Login";
	document.getElementById("inputLoginId").focus();
	document.getElementById("inputLoginId").addEventListener("keypress", function(e)
	{
		var event    = e || window.event;
		var charCode = event.which || event.keyCode;
		if (13 === charCode)
		{
			document.getElementById("inputPasswordId").focus();
			return false;
		}
	});
	document.getElementById("inputPasswordId").addEventListener("keypress", function(e)
	{
		var event    = e || window.event;
		var charCode = event.which || event.keyCode;
		if (13 === charCode)
		{
			oThis.ConnectToKGS();
			return false;
		}
	});
	document.getElementById("connectDivId").addEventListener("keypress", function(e)
	{
		var event    = e || window.event;
		var charCode = event.which || event.keyCode;
		if (13 === charCode)
		{
			oThis.ConnectToKGS();
			return false;
		}
	});
	document.getElementById("connectDivId").addEventListener("mouseup", function()
	{
		oThis.ConnectToKGS();
	}, false);
};
CGoUniverseApplication.prototype.private_InitClientPage = function()
{
	// Растягиваем клиент на все окно, все остальные элементы будут лежать внутри данного класса
	this.m_oClientControl = CreateControlContainer("divMainId");
	this.m_oClientControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
	this.m_oClientControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);

	this.private_InitExitButton();
	this.private_InitGameTabs();
	this.private_InitMainRoom();
};
CGoUniverseApplication.prototype.private_InitGameTabs = function()
{
	var oTabsControl = this.m_oGameRoomTabs.Init("divIdTabPanel", "divIdTabPanelRooms");
	oTabsControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, 50);
	oTabsControl.Anchor = (g_anchor_top |g_anchor_left | g_anchor_right);
	this.m_oClientControl.AddControl(oTabsControl);

	// Добавляем таб "MAIN ROOM"
	var oMainRoomTab = new CVisualGameRoomTab(this);
	oMainRoomTab.InitMainRoom(-1, "divIdMainRoom", "divIdMainRoomTab");
	this.m_oGameRoomTabs.AddMainRoomTab(oMainRoomTab, true);
};
CGoUniverseApplication.prototype.private_InitMainRoom = function()
{
	this.m_oMainRoomControl = CreateControlContainer("divIdMainRoom");
	var oMainRoomControl = this.m_oMainRoomControl;
	oMainRoomControl.Bounds.SetParams(0, 50, 1000, 1000, false, true, false, false, -1, -1);
	oMainRoomControl.Anchor = (g_anchor_bottom |g_anchor_left | g_anchor_right);
	this.m_oClientControl.AddControl(oMainRoomControl);

	// Список игроков
	var oPlayersListControl = this.m_oPlayersListView.Init("divPlayersListId", g_oPlayersList);
	oPlayersListControl.Bounds.SetParams(0, 0, 0, 1000, false, false, true, false, 200, -1);
	oPlayersListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right);
	oPlayersListControl.HtmlElement.style.background = "#F3F3F3";
	oMainRoomControl.AddControl(oPlayersListControl);

	// Левая часть
	var oLeftPartControl = CreateControlContainer("divIdL");
	oLeftPartControl.Bounds.SetParams(0, 0, 200, 1000, false, false, true, false, -1, -1);
	oLeftPartControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oMainRoomControl.AddControl(oLeftPartControl);

	// Список игровых комнат
	var oGamesListWrapperControl = CreateControlContainer("divIdLGamesWrapper");
	oGamesListWrapperControl.Bounds.SetParams(0, 0, 1000, 500, false, false, false, false, -1, -1);
	oGamesListWrapperControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oLeftPartControl.AddControl(oGamesListWrapperControl);

	var oGamesListControl = this.m_oGamesListView.Init("divIdLGames", g_oGamesList);
	oGamesListControl.Bounds.SetParams(0, 0, 2, 0, true, false, true, true, -1, -1);
	oGamesListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oGamesListControl.HtmlElement.style.background = "#F3F3F3";
	oGamesListWrapperControl.AddControl(oGamesListControl);

	// Часть под чат
	var oChatControl = CreateControlContainer("divIdLChat");
	oChatControl.Bounds.SetParams(0, 500, 1000, 1000, false, false, false, false, -1, -1);
	oChatControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oLeftPartControl.AddControl(oChatControl);
	this.private_InitChats(oChatControl);
};
CGoUniverseApplication.prototype.private_InitChats = function(oChatControl)
{
	// Табы чата
	var oChatTabsBack = CreateControlContainer("divIdLChatTabsBack");
	oChatTabsBack.Bounds.SetParams(0, 0, 2, 0, true, true, true, false, -1, 24);
	oChatTabsBack.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oChatControl.AddControl(oChatTabsBack);

	var oChatTabs = this.m_oChatRoomTabs.Init("divIdLChatTabs");
	oChatTabs.Bounds.SetParams(0, 1, 31, 0, true, true, true, false, -1, 25);
	oChatTabs.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oChatControl.AddControl(oChatTabs);

	// Кнопка добавления чата
	var oChatAddControl = this.private_InitChannelAddButton("divIdLChatAdd");
	oChatAddControl.Bounds.SetParams(0, 1, 1, 0, false, true, true, false, 30, 24);
	oChatAddControl.Anchor = (g_anchor_top | g_anchor_right);
	oChatControl.AddControl(oChatAddControl);

	// Кнопка добавления чата
	var oChaToggleControl = this.private_InitChannelToggleButton("divIdLChatTabsToggle");
	oChaToggleControl.Bounds.SetParams(0, 1, 32, 0, false, true, true, false, 30, 24);
	oChaToggleControl.Anchor = (g_anchor_top | g_anchor_right);
	oChatControl.AddControl(oChaToggleControl);

	// Все сообщения
	var oChatTextAreaControl = CreateControlContainer("divIdLChatTextArea");
	oChatTextAreaControl.Bounds.SetParams(0, 26, 2, 52, true, true, true, true, -1, -1);
	oChatTextAreaControl.Anchor = (g_anchor_bottom | g_anchor_right | g_anchor_left);
	oChatControl.AddControl(oChatTextAreaControl);

	// Место для набора
	var oChatInputControl = CreateControlContainer("divIdLChatInput");
	oChatInputControl.Bounds.SetParams(0, 0, 2, 1, true, false, true, true, -1, 50);
	oChatInputControl.Anchor = (g_anchor_bottom | g_anchor_right | g_anchor_left);
	oChatControl.AddControl(oChatInputControl);

	var oThis = this;
	document.getElementById("inputChatId").addEventListener("keydown", function(e)
	{
		oThis.SendChatMessage(e);
	});
};
CGoUniverseApplication.prototype.private_InitChannelAddButton = function(sDivId)
{
	var oThis = this;

	var oElement = document.getElementById(sDivId);
	var oControl = CreateControlContainer(sDivId);

	oElement.title           = "Add a channel";
	oElement.style.fontSize  = "24px";
	oElement.style.textAlign = "center";
	oElement.addEventListener("selectstart", function()
	{
		return false;
	}, false);
	oElement.addEventListener("click", function()
	{
		oThis.OpenRoomList();
	});

	return oControl;
};
CGoUniverseApplication.prototype.private_InitChannelToggleButton = function(sDivId)
{
	var oThis = this;

	var oElement = document.getElementById(sDivId);
	var oControl = CreateControlContainer(sDivId);

	oElement.title           = "Open tabs";
	oElement.style.fontSize  = "24px";
	oElement.style.textAlign = "center";
	oElement.addEventListener("selectstart", function()
	{
		return false;
	}, false);
	oElement.addEventListener("click", function()
	{
		var oTabs = document.getElementById("divIdLChatTabs");
		var sHeight = parseFloat(oTabs.style.height);

		if (sHeight < 35)
			oThis.private_OpenChatTabs();
		else
			oThis.private_CollapseChatTabs();
	});

	return oControl;
};
CGoUniverseApplication.prototype.private_InitExitButton = function()
{
	var oThis = this;

	var oDivExtButtton = document.getElementById("divIdExitButton");
	oDivExtButtton.addEventListener("click", function()
	{
		if (oThis.m_oClient)
		{
			oThis.m_oClient.Disconnect();
			oThis.Logout();
		}
	});
};
CGoUniverseApplication.prototype.private_ClearClient = function()
{
	this.m_oClient = null;

	this.m_oGamesListView.Clear();
	this.m_oPlayersListView.Clear();

	this.m_oChatRoomTabs.Clear();
	this.m_oGameRoomTabs.Clear();

	this.private_ClearChat();
	this.private_CloseAllWindows();
	this.private_RemoveAllPopups();
};
CGoUniverseApplication.prototype.private_GotoLoginPage = function(bShowError)
{
	document.getElementById("divMainId").style.display       = "none";
	document.getElementById("divIdConnection").style.display = "block";

	if (true === bShowError)
		document.getElementById("divIdConnectionError").style.display = "block";
	else
		document.getElementById("divIdConnectionError").style.display = "none";
};
CGoUniverseApplication.prototype.private_GotoClientPage = function()
{
	document.getElementById("divMainId").style.display = "block";
	$(document.getElementById("divIdConnection")).fadeOut(200);
	$(document.getElementById("divIdConnectionError")).fadeOut(200);
};
CGoUniverseApplication.prototype.private_ClearChat = function()
{
	var oDiv = document.getElementById("textareaChatId");
	while (oDiv.firstChild)
	{
		oDiv.removeChild(oDiv.firstChild);
	}
};
CGoUniverseApplication.prototype.private_CloseAllWindows = function()
{
	RemoveAllWindows();
};
CGoUniverseApplication.prototype.private_CollapsePopups = function(bFast)
{
	for (var nIndex = 0, nCount = this.m_arrPopups.length; nIndex < nCount; ++nIndex)
	{
		this.m_arrPopups[nIndex].Hide(bFast);
	}
};
CGoUniverseApplication.prototype.private_RemoveAllPopups = function()
{
	while (this.m_arrPopups.length > 0)
	{
		this.m_arrPopups[0].Destroy();
	}
};
CGoUniverseApplication.prototype.ShowUserContextMenu = function(nX, nY, sUserName)
{
	var oClient = this.m_oClient;
	var oContextMenu = new CVisualContextMenu(this, nX, nY);
	oContextMenu.AddCheckBoxItem(false, "Talk to...", function()
	{
		oClient.EnterPrivateChat(sUserName);
	});
	oContextMenu.AddCheckBoxItem(false, "View info", function()
	{
		oClient.LoadUserInfo(sUserName);
	});
	oContextMenu.AddHorizontalLine();
	oContextMenu.AddCheckBoxItem(oClient.IsUserInFriendList(sUserName), "Buddy", function()
	{
		if (oClient.IsUserInFriendList(sUserName))
			oClient.RemoveFromFriendList(sUserName);
		else
			oClient.AddToFriendList(sUserName);
	});
	oContextMenu.AddCheckBoxItem(oClient.IsUserInBlackList(sUserName), "Censored", function()
	{
		if (oClient.IsUserInBlackList(sUserName))
			oClient.RemoveFromBlackList(sUserName);
		else
			oClient.AddToBlackList(sUserName);
	});
	oContextMenu.AddCheckBoxItem(oClient.IsUserInFollowerList(sUserName), "Follow", function()
	{
		if (oClient.IsUserInFollowerList(sUserName))
			oClient.RemoveFromFollowerList(sUserName);
		else
			oClient.AddToFollowerList(sUserName);
	});
	oContextMenu.Show();
};
CGoUniverseApplication.prototype.private_OpenChatTabs = function()
{
	var oTabs     = document.getElementById("divIdLChatTabs");
	var nCount    = oTabs.childElementCount;
	var oLastNode = oTabs.childNodes[nCount - 1];
	var nOffset   = oLastNode.offsetTop;
	var nLines    = (((nOffset + 1) / 25) | 0) + 1;

	var nMaxLines = Math.max(Math.min(5, nLines), 1);
	if (1 === nMaxLines)
		return;

	oTabs.style.height          = (nMaxLines * 25) + "px";
	oTabs.style.backgroundColor = "#F3F3F3";
	oTabs.style.borderBottom    = "1px solid #BEBEBE";
	oTabs.style.borderRight     = "1px solid #BEBEBE";
	oTabs.style.overflowY       = "auto";
	oTabs.style.boxShadow       = "0px 1px 2px rgba(0,0,0,0.2)";

	document.getElementById("divIdLChatTabsToggleInnerSpan").style.transform = "rotate(270deg)";
};
CGoUniverseApplication.prototype.private_CollapseChatTabs = function()
{
	var oTabs = document.getElementById("divIdLChatTabs");
	oTabs.style.height          = "25px";
	oTabs.style.minHeight       = "";
	oTabs.style.maxHeight       = "";
	oTabs.style.backgroundColor = "transparent";
	oTabs.style.borderBottom    = "1px none #BEBEBE";
	oTabs.style.borderRight     = "1px none #BEBEBE";
	oTabs.style.overflowY       = "hidden";
	oTabs.style.boxShadow       = "";

	document.getElementById("divIdLChatTabsToggleInnerSpan").style.transform = "rotate(90deg)";
};