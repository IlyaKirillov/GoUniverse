"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 17.05.2016
 * Time: 12:48
 */

window.onload         = OnDocumentReady;
window.onbeforeunload = OnDocumentClose;
window.onresize       = OnDocumentResize;

var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;
function SplitTextToLines(sText)
{
	var aLines = [];

	var nBreakPos = -1;
	var nCurPos   = 0;
	while (-1 !== (nBreakPos = sText.indexOf(String.fromCharCode(10), nCurPos)))
	{
		aLines.push(sText.substr(nCurPos, nBreakPos - nCurPos));

		nCurPos = nBreakPos + 1;
		if (nCurPos >= sText.length)
			break;
	}

	if (nCurPos < sText.length)
		aLines.push(sText.substr(nCurPos, sText.length - nCurPos));

	for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
	{
		aLines[nIndex] = aLines[nIndex].replace(urlRegEx, "<a href='$1' target='_blank'>$1</a>");
	}

	return aLines;
}

var oApp = null;
function OnDocumentReady()
{
	oApp = new CGoUniverseApplication();
	oApp.Init();
}

function OnDocumentClose()
{
	if (oApp)
		oApp.Close();
}

function OnDocumentResize()
{
	if (oApp)
		oApp.OnResize();
}

function CGoUniverseApplication()
{
	this.m_oClientControl      = null;

	this.m_oMainRoomControl    = null;

	this.m_oPlayersListView    = new CListView();
	this.m_oPlayersListView.Set_BGColor(243, 243, 243);

	this.m_oGamesListView      = new CListView();
	this.m_oGamesListView.Set_BGColor(243, 243, 243);

	this.m_oClient             = null;

	this.m_oGameRoomTabs       = new CVisualGameRoomTabs();
	this.m_oChatRoomTabs       = new CVisualChatRoomTabs();
}
CGoUniverseApplication.prototype.Init = function()
{
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
	//
	// this.AddGameRoom(1, new CGameTree());
	// this.AddGameRoom(2, new CGameTree());
	// this.AddGameRoom(3, new CGameTree());
	// this.AddGameRoom(4, new CGameTree());
	//
	//
	//
	// //_____________
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
	if ("none" !== document.getElementById("divIdConnection").style.display)
	{
		var ConnectionDiv = document.getElementById("divIdConnection");
		ConnectionDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
		ConnectionDiv.style.top  = (document.body.clientHeight - 100) / 2 + "px";
	}

	if ("none" !== document.getElementById("divIdConnectionError").style.display)
	{
		var ErrorDiv = document.getElementById("divIdConnectionError");
		ErrorDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
		ErrorDiv.style.top  = (document.body.clientHeight - 100) / 2 + 150 + "px";
	}

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

};
CGoUniverseApplication.prototype.OpenRoomList = function()
{
	CreateKGSWindow(EKGSWindowType.RoomList, {Client : this.m_oClient});
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
	var oDiv     = document.getElementById("textareaChatId");
	var oTextDiv = document.createElement("div");

	oTextDiv.chatRoomId = nChatRoomId;

	var oTextSpan              = document.createElement("span");
	oTextSpan.style.fontWeight = "bold";
	oTextSpan.textContent      = sUserName + ": ";
	oTextDiv.appendChild(oTextSpan);

	sText = sText.replace(urlRegEx, "<a href='$1' target='_blank'>$1</a>");

	oTextSpan                  = document.createElement("span");
	oTextSpan.innerHTML        = sText;
	oTextDiv.appendChild(oTextSpan);

	oDiv.appendChild(oTextDiv);

	if (nChatRoomId === this.m_oChatRoomTabs.GetCurrentId())
	{
		oTextDiv.style.display = "block";
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
	document.getElementById("connectDivId").addEventListener("mouseup", this.ConnectToKGS);
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
	oGamesListControl.Bounds.SetParams(0, 0, 2, 1, true, false, true, true, -1, -1);
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
	oChatTabs.Bounds.SetParams(0, 0, 31, 0, true, true, true, false, -1, 25);
	oChatTabs.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oChatControl.AddControl(oChatTabs);

	// Кнопка добавления чата
	var oChatAddControl = this.private_InitChannelAddButton("divIdLChatAdd");
	oChatAddControl.Bounds.SetParams(0, 0, 1, 0, false, true, true, false, 30, 24);
	oChatAddControl.Anchor = (g_anchor_top | g_anchor_right);
	oChatControl.AddControl(oChatAddControl);

	// Все сообщения
	var oChatTextAreaControl = CreateControlContainer("divIdLChatTextArea");
	oChatTextAreaControl.Bounds.SetParams(0, 25, 2, 52, true, true, true, true, -1, -1);
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
	oButton.style.maxWidth                  = "100px";
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

	if (this.m_oContainerDiv)
		this.m_oContainerDiv.removeChild(this.m_oMainDiv);

	this.m_oParent.OnClickClose(this);
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
	this.m_oTextDiv          = null;
	this.m_oCaptionDiv       = null;
	this.m_oMessagesDiv      = null;
}
CVisualChatRoomTab.prototype.Init = function(nId, sRoomName)
{
	var oThis = this;

	this.m_nId               = nId;
	this.m_nNewMessagesCount = 0;
	this.m_oTabDiv           = document.createElement("div");

	var sHeight = "21px";

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

	var CloseButton = document.createElement("button");
	CloseButton.tabIndex = "0";
	CloseButton["aria-label"] = "Close " + sRoomName;
	CloseButton.title         = "Close " + sRoomName;

	CloseButton.style.fontFamily                = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
	CloseButton.style["-webkit-font-smoothing"] = "antialiased";
	CloseButton.style.padding                   = "0px";
	CloseButton.style.border                    = "1px solid transparent";
	CloseButton.style.boxSizing                 = "border-box";
	CloseButton.style["-moz-box-sizing"]        = "border-box";
	CloseButton.style.background                = "none";
	CloseButton.style.outline                   = "none";
	CloseButton.style.cursor                    = "pointer";
	CloseButton.style["-webkit-appearance"]     = "none";
	CloseButton.style["-webkit-border-radius"]  = "0";
	CloseButton.style.overflow                  = "visible";
	CloseButton.style.color                     = "#000";
	CloseButton.style.lineHeight                = "20px";
	CloseButton.style.float                     = "left";
	CloseButton.style.height                    = "100%";
	CloseButton.style.width                     = "26px";
	CloseButton.style.transitionProperty        = "color";
	CloseButton.style.transitionDuration        = ".25s";


	CloseButton.onmousedown = function()
	{
		CloseButton.style.color = "#008272";
	};
	CloseButton.onmouseout = function()
	{
		CloseButton.style.color = "#111";
	};
	CloseButton.onmouseover = function()
	{
		CloseButton.style.color = "#009983";
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
	CloseButton.appendChild(CBCenter);
	DivTab.appendChild(CloseButton);

	CloseButton.addEventListener("click", function()
	{
		oThis.OnClickClose();
	});

	DivTab.onmouseover = function()
	{
		CBCDSpan.style.visibility        = "visible";
		NewMessagesSpan.style.visibility = "hidden";
	};
	DivTab.onmouseout = function()
	{
		CBCDSpan.style.visibility        = "hidden";
		NewMessagesSpan.style.visibility = "visible";
	};

	this.m_oTabDiv     = DivTab;
	this.m_oTextDiv    = NewTab;
	this.m_oCaptionDiv = oCaptionDiv;
	this.m_oMessagesDiv = NewMessagesSpan;
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
	}

	this.m_oTabDiv.style.borderBottom = "1px solid #F3F3F3";
	this.m_oTabDiv.style.borderTop    = "3px solid rgb(0, 130, 114)";
	this.m_nNewMessagesCount          = 0;
	this.m_oMessagesDiv.innerHTML     = "";

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




