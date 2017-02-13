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

	this.m_oGlobalSettings     = new CGoUniverseGlobalSettings(this);
	this.m_oPlayersListView    = new CListView();
	this.m_oPlayersListView.Set_BGColor(243, 243, 243);

	this.m_oGamesListView      = new CListView();
	this.m_oGamesListView.Set_BGColor(243, 243, 243);

	this.m_oClient             = null;

	this.m_oGameRoomTabs       = new CVisualGameRoomTabs();
	this.m_oChatRoomTabs       = new CVisualChatRoomTabs();

	this.m_arrPopups           = [];
	
	this.m_oSound              = new CBoardSound();
	this.m_oSound.Init("http://webgoboard.com/Sound");
	//this.m_oSound.Init("Files/Sound");
	this.m_bFocused            = true;

	this.m_oGameTabsScroll = null;
	this.m_oChatTabsScroll = null;
	this.m_oChatScroll     = null;

	this.m_oGamesListWrapperControl = null;
	this.m_oChatWrapperControl      = null;
	this.m_oMainRoomLeftPartControl = null;

	this.m_oAnimatedLogo = null;
	this.m_oPlayMenu     = null;

	this.m_oAutomatchAnimatedLogo = null;

	this.m_oPlayButtonLocation = {
		Left   : 0,
		Top    : 0,
		Width  : 50,
		Height : 50
	};

	var oThis = this;
	this.private_OnKeyPress = function(e)
	{
		var oGameTab = oThis.m_oGameRoomTabs.GetCurrent();
		var oGameTree = oGameTab ? oGameTab.GetGameTree() : null;
		if (oGameTree)
		{
			oGameTree.m_oDrawingBoard.private_OnKeyDown(e);
		}
	};
}
CGoUniverseApplication.prototype.Init = function()
{
	this.m_oAnimatedLogo = new CGoUniverseAnimatedLogo(document.getElementById("animatedLogoId"));

	this.private_InitMainDiv();
	this.private_InitLoginPage();
	this.private_InitClientPage();
	this.private_GotoLoginPage(false);
	this.OnResize();

	//------------------------------------------------------------------------------------------------------------------
	// Пока не попоправится баг с баном выдаем сообщение с предупреждением.

	document.getElementById("divIdConnectionErrorText").innerHTML = "Warning! This program is in Beta. Please note that you may receive a ban from KGS due to other player misconduct while using this client. We are not responsible for bans and you must contact KGS to remove the ban. Until that bug is fixed, please use this interface at your own risk.";
	g_oFadeEffect.In(document.getElementById("divIdConnectionError"), -1);

	//------------------------------------------------------------------------------------------------------------------
	//
	// //TEST
	// this.m_oClient = new CKGSClient(this);
	// this.m_oClient.m_oCurrentUser.Update({
	// 	name : "GoUniverse",
	// 	rank : "4d"
	// });
	//
	// //this.OnConnect();
	// //
	//
	// document.getElementById("divMainId").style.display = "block";
	// this.OnResize();
	//
	// var nRoomId = 0;
	// var oThis   = this;
	//
	// function TEST_AddChatRoom()
	// {
	// 	oThis.AddChatRoom(nRoomId++, "Room " + nRoomId);
	// }
	//
	// for (var nIndex = 0; nIndex < 100; nIndex++)
	// {
	// 	TEST_AddChatRoom();
	// }
	//
	// var oGameRecord = new CKGSGameListRecord(this.m_oClient);
	// oGameRecord.Update({
	// 	gameType  : "ranked",
	// 	gameId    : 1,
	// 	channelId : 2,
	// 	players   : {
	// 		black : {
	// 			name : "KOCMOHABT"
	// 		},
	// 		white : {
	// 			name : "GoUniverse"
	// 		}
	// 	}
	// });
	// var oGameRoom = new CKGSGameRoom(this.m_oClient, 1);
	// oGameRoom.InitGameTree({
	// 	size    : 19,
	// 	players : {
	// 		black : {
	// 			name : "KOCMOHABT"
	// 		},
	// 		white : {
	// 			name : "GoUniverse"
	// 		}
	// 	}
	// });
	// oGameRoom.SetPlayers(oGameRecord);
	//
	//
	// this.AddGameRoom(oGameRoom);
	// // this.AddGameRoom(2, new CGameTree());
	// // this.AddGameRoom(3, new CGameTree());
	// // this.AddGameRoom(4, new CGameTree());
	//
	//  var nGameRoomId = 0;
	//  function TEST_AddGameRoom()
	//  {
	//  	oThis.AddGameRoom(nGameRoomId++, null);
	//  }
	//
	//
	//  // for (var nIndex = 0; nIndex < 100; nIndex++)
	//  // {
	//  // 	TEST_AddGameRoom();
	//  // }
	//
	//  this.SetCurrentChatRoom(0);
	//
	//  function TEST_AddChatMessage(nIndex)
	//  {
	//  	oThis.OnAddChatMessage(0, "Test", "Test message " + nIndex);
	//  }
	//
	//  for (var nIndex = 0; nIndex < 100; nIndex++)
	//  {
	//  	TEST_AddChatMessage(nIndex);
	//  }
	//
	//  function TEST_AddGameRecord(nGameId)
	//  {
	//  	oThis.m_oGamesListView.Handle_Record([0, nGameId, "R", 0, "", "White " + nGameId, 30, "", "Black", 25, "", 15, false, 15, false, false, false, "19x19"]);
	//  }
	//
	//  for (var nIndex = 0; nIndex < 100; nIndex++)
	//  {
	//  	TEST_AddGameRecord(nIndex);
	//  }
	//
	//  this.m_oGamesListView.Update();
	//  this.m_oGamesListView.Update_Size();
	//
	//
	// // this.m_oClient.private_HandleDetailsNonExistant({name : "WWWWWWWW"});
	// // this.m_oClient.private_HandlePrivateKeepOut({channelId : -1});
	// // this.m_oClient.private_HandleIdleWarning({});
	//
	// // this.m_oClient.m_oAllGames["123"] = new CKGSGameListRecord();
	// // this.m_oClient.m_oAllGames["123"].Update({
	// // 	gameType        : "challenge",
	// // 	players         : {
	// // 		challengeCreator : {
	// // 			name : "KOCMOHABT"
	// // 		}
	// // 	},
	// // 	name            : "Challenge comment",
	// // 	initialProposal : {
	// // 		rules : {}
	// // 	}
	// // });
	// // this.m_oClient.private_HandleChallengeJoin({channelId : 123});
	// //this.m_oClient.CreateChallenge();
	//
	// this.m_oClient.LoadUserInfo("GoUniverse");
	// this.m_oClient.private_HandleDetailsJoin({user : {name : "GoUniverse"}, personalInfo : "Test test test set wer wer werwer"});
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

	this.m_oGlobalSettings.SetKGSLogin(sLogin);
	if (this.m_oGlobalSettings.GetKGSSavePassword())
		this.m_oGlobalSettings.SetKGSPassword(sPassword);

	document.getElementById("inputPasswordId").value = "";
	this.m_oClient.Connect(sLogin, sPassword, "en_US");

	g_oFadeEffect.Out(document.getElementById("divIdConnection"), 200);
	g_oFadeEffect.Out(document.getElementById("divIdConnectionError"), 200);
	g_oFadeEffect.Out(document.getElementById("divIdAbout"), 200);

	this.private_ShowAnimatedLogo();
};
CGoUniverseApplication.prototype.OnConnect = function()
{
	document.title = "KGS: " + this.m_oClient.GetUserName();
	document.getElementById("divIdClientNameText").innerHTML = this.m_oClient.GetUserName();

	g_oFadeEffect.In(document.getElementById("divMainId"), 200);
	this.private_HideAnimatedLogo();
	this.OnResize();
	this.m_oGlobalSettings.ParseUserSettings();
};
CGoUniverseApplication.prototype.OnResize = function(bSkipChatHandler)
{
	var ConnectionDiv        = document.getElementById("divIdConnection");
	ConnectionDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
	ConnectionDiv.style.top  = (document.body.clientHeight - 170) / 2 + "px";

	var ErrorDiv        = document.getElementById("divIdConnectionError");
	ErrorDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
	ErrorDiv.style.top  = (document.body.clientHeight - 170) / 2 + 180 + "px";

	var AboutDiv        = document.getElementById("divIdAbout");
	AboutDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
	AboutDiv.style.top  = (document.body.clientHeight - 65 - 20) + "px";

	var Logo = document.getElementById("animatedLogoId");
	Logo.style.left = (document.body.clientWidth - Logo.width) / 2 + "px";
	Logo.style.top  = (document.body.clientHeight - Logo.height) / 2 + "px";

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

	this.private_UpdateChatScroll();
	this.private_CollapsePopups(true);
	this.private_CollapseChatTabs();
	this.private_CollapseGameTabs();
	this.UpdateDropDownChatTabsButton();
	this.UpdateDropDownGameTabsButton();

	if (true !== bSkipChatHandler)
		this.private_InitChatDragHandler();
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
		if ("" !== oInputArea.value)
		{
			var sMessage = oInputArea.value;
			sMessage = sMessage.replace(/\u000A/g, String.fromCharCode(0xFF0A));
			this.m_oClient.SendChatMessage(sMessage);
		}

		oInputArea.value = "";
		e.preventDefault();
	}
};
CGoUniverseApplication.prototype.SendChatMessageInGameRoom = function(nGameRoomId, sText)
{
	this.m_oClient.SendChatMessageInGameRoom(nGameRoomId, sText);
};
CGoUniverseApplication.prototype.Logout = function(sText)
{
	this.private_ClearClient();

	if (sText)
	{
		document.getElementById("divIdConnectionErrorText").innerHTML = sText;
		g_oFadeEffect.In(document.getElementById("divIdConnectionError"), -1);
	}

	g_oFadeEffect.Out(document.getElementById("divMainId"), -1);
	g_oFadeEffect.In(document.getElementById("divIdConnection"), -1);
	g_oFadeEffect.In(document.getElementById("divIdAbout"), -1);
	document.getElementById("inputPasswordId").focus();

	this.private_HideAnimatedLogo();

	document.title = "KGS: Login";
	
	this.SetCurrentGameRoomTab(-1);


	if (this.m_oGlobalSettings.GetKGSSavePassword() && sText !== "Login or password is incorrect.")
		document.getElementById("inputPasswordId").value = this.m_oGlobalSettings.GetKGSPassword();
	else
		document.getElementById("inputPasswordId").value = "";
};
CGoUniverseApplication.prototype.GetClient = function()
{
	return this.m_oClient;
};
CGoUniverseApplication.prototype.GetSound = function()
{
	return this.m_oSound;
};
CGoUniverseApplication.prototype.GetPlayersListView = function()
{
	return this.m_oPlayersListView;
};
CGoUniverseApplication.prototype.GetGamesListView = function()
{
	return this.m_oGamesListView;
};
CGoUniverseApplication.prototype.AddChatRoom = function(nChatRoomId, sRoomName, bPrivate)
{
	var oTab = new CVisualChatRoomTab(this);
	oTab.Init(nChatRoomId, sRoomName, bPrivate);
	this.m_oChatRoomTabs.AddTab(oTab);
	this.UpdateDropDownChatTabsButton();
};
CGoUniverseApplication.prototype.SetCurrentChatRoom = function(nChatRoomId)
{
	if (this.m_oClient)
		this.m_oClient.SetCurrentChatRoom(nChatRoomId);

	this.private_CollapseChatTabs();

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

	oDiv.scrollTop = oDiv.scrollHeight;

	this.private_UpdateChatScroll();
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
		this.private_UpdateChatScroll();
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
CGoUniverseApplication.prototype.OnAddChatMessage = function(nChatRoomId, sUserName, sText, oPr)
{
	var oTime = new Date();
	var sTime = "[" + (oTime.getHours() < 10 ? "0" + oTime.getHours() : oTime.getHours()) + ":" + (oTime.getMinutes() < 10 ? "0" + oTime.getMinutes() : oTime.getMinutes()) + "]";

	var oThis = this;

	var oDiv     = document.getElementById("textareaChatId");
	var oTextDiv = document.createElement("div");

	oTextDiv.className += " Selectable";
	oTextDiv.chatRoomId = nChatRoomId;

	var bMessageForMe = false;
	var sCurUserName  = false;
	var bAnnounce     = false;

	if (oPr && true === oPr.Announce)
		bAnnounce = true;

	var oTextSpan;

	if (null !== sUserName)
	{
		sCurUserName = (this.m_oClient ? this.m_oClient.GetUserName() : "");
		if ("" !== sCurUserName && 0 === sText.indexOf(sCurUserName + ","))
			bMessageForMe = true;

		oTextSpan                  = document.createElement("span");
		oTextSpan.textContent      = sTime;
		oTextSpan.style.fontFamily = "'Courier New', Courier, monospace";
		oTextSpan.style.color      = "black";
		oTextDiv.appendChild(oTextSpan);

		oTextSpan                  = document.createElement("span");
		oTextSpan.textContent      =  " ";
		oTextDiv.appendChild(oTextSpan);

		oTextSpan                  = document.createElement("span");
		oTextSpan.style.fontWeight = "bold";
		oTextSpan.style.cursor     = "pointer";
		oTextSpan.textContent      =  sUserName + ": ";
		oTextSpan.className        = "UserChatSpan";
		oTextSpan.addEventListener("click", function()
		{
			var oInputArea   = document.getElementById("inputChatId");
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
	}


	var aLines = SplitTextToLines(sText);
	for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
	{
		oTextSpan            = document.createElement("span");
		oTextSpan.innerHTML  = aLines[nIndex];

		if (bAnnounce)
			oTextSpan.style.fontWeight = "bold";

		if (true === bMessageForMe)
		{
			oTextSpan.style.fontStyle = "italic";
		}
		else if (null === sUserName)
		{
			oTextSpan.style.fontStyle = "italic";
			oTextSpan.style.color     = "rgb(0, 0, 0)";
		}

		oTextDiv.appendChild(oTextSpan);
		oTextDiv.appendChild(document.createElement("br"));
	}

	oDiv.appendChild(oTextDiv);

	var oTab = this.m_oChatRoomTabs.GetTab(nChatRoomId);
	if (nChatRoomId === this.m_oChatRoomTabs.GetCurrentId())
	{
		oTextDiv.style.display = "block";

		if (Math.abs(oDiv.scrollHeight - oDiv.scrollTop - oDiv.clientHeight) < 50 || sUserName === sCurUserName)
			oDiv.scrollTop = oDiv.scrollHeight;

		this.private_UpdateChatScroll();
	}
	else
	{
		if (null !== sUserName && oTab)
			oTab.IncreaseMessagesCount();

		oTextDiv.style.display = "none";
	}

	if (null !== sUserName && sUserName !== this.m_oClient.GetUserName() && oTab && oTab.IsSoundOn() && (nChatRoomId !== this.m_oChatRoomTabs.GetCurrentId() || -1 !== this.m_oGameRoomTabs.GetCurrentId() || false === this.IsFocused()))
		this.private_AddNotification(sUserName);
};
CGoUniverseApplication.prototype.AddGameRoom = function(oGame)
{
	var oTab = new CVisualGameRoomTab(this);
	var oGameRoomControl = oTab.InitGameRoom("divMainId", oGame);

	if (oGame.IsPlayer())
		this.m_oGameRoomTabs.AddOwnGameTab(oTab);
	else
		this.m_oGameRoomTabs.AddTab(oTab);

	oGameRoomControl.Bounds.SetParams(0, 50, 1000, 1000, false, true, false, false, -1, -1);
	oGameRoomControl.Anchor = (g_anchor_bottom | g_anchor_left | g_anchor_right);
	this.m_oClientControl.AddControl(oGameRoomControl);

	this.OnResize();
};
CGoUniverseApplication.prototype.ModifyGameRoom = function(nGameRoomId, nNewGameRoomId, bDemonstration)
{
	var oTab = this.m_oGameRoomTabs.GetTab(nGameRoomId);
	if (!oTab)
		return;
	
	oTab.ModifyGameRoom(nNewGameRoomId, bDemonstration);

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
	//this.m_oMainDiv.addEventListener("keypress", this.private_OnKeyPress, false);

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

	var oLoginInput = document.getElementById("inputLoginId");
	oLoginInput.focus();
	oLoginInput.addEventListener("keypress", function(e)
	{
		var event    = e || window.event;
		var charCode = event.which || event.keyCode;
		if (13 === charCode)
		{
			document.getElementById("inputPasswordId").focus();
			return false;
		}
	});

	oLoginInput.value = this.m_oGlobalSettings.GetKGSLogin();

	var oPasswordInput = document.getElementById("inputPasswordId");
	oPasswordInput.addEventListener("keypress", function(e)
	{
		var event    = e || window.event;
		var charCode = event.which || event.keyCode;
		if (13 === charCode)
		{
			oThis.ConnectToKGS();
			return false;
		}
	});

	if (true === this.m_oGlobalSettings.GetKGSSavePassword())
		oPasswordInput.value = this.m_oGlobalSettings.GetKGSPassword();

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

	document.getElementById("divIdAboutButton").addEventListener("mouseup", function()
	{
		oThis.ShowAbout();
	}, false);

	document.getElementById("checkboxSavePasswordLabelId").addEventListener("click", function()
	{
		var oCheckBox = document.getElementById("checkboxSavePasswordId");
		if (true === oCheckBox.checked)
			oCheckBox.checked = false;
		else
			oCheckBox.checked = true;

		var bChecked = oCheckBox.checked ? true : false;
		oThis.m_oGlobalSettings.SetKGSSavePassword(bChecked);
	}, false);
	document.getElementById("checkboxSavePasswordId").checked = this.m_oGlobalSettings.GetKGSSavePassword();
	document.getElementById("checkboxSavePasswordId").addEventListener("change", function()
	{
		var bChecked = this.checked ? true : false;
		oThis.m_oGlobalSettings.SetKGSSavePassword(bChecked);
	}, false);

};
CGoUniverseApplication.prototype.private_InitClientPage = function()
{
	// Растягиваем клиент на все окно, все остальные элементы будут лежать внутри данного класса
	this.m_oClientControl = CreateControlContainer("divMainId");
	this.m_oClientControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
	this.m_oClientControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);

	this.private_InitOmnibox();
	this.private_InitExitButton();
	this.private_InitGameTabs();
	this.private_InitMainRoom();
	this.private_InitUserNameLink();
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

	this.private_InitTabPanel(oTabsControl);
};
CGoUniverseApplication.prototype.private_InitTabPanel = function(oTabsControl)
{
	g_oTextMeasurer.SetFont("24px 'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif");

	var sMainRoom = "Rooms";
	var sPlay     = "Play";

	var nHomeW = g_oTextMeasurer.Measure(sMainRoom) + 42;
	var nPlayW = g_oTextMeasurer.Measure(sPlay) + 42;
	var nSpace = 5;

	// Кнопка HOME
	var oHomeControl = CreateControlContainer("divIdHomeButton");
	oHomeControl.Bounds.SetParams(0, 0, 0, 1000, false, false, false, false, nHomeW, -1);
	oHomeControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_bottom);
	oTabsControl.AddControl(oHomeControl);
	document.getElementById("spanIdMainRoom").innerHTML = sMainRoom;

	// Кнопка Play
	var oPlayControl = CreateControlContainer("divIdPlayButtonWrapper");
	oPlayControl.Bounds.SetParams(nHomeW + nSpace, 0, 0, 1000, true, false, false, false, nPlayW, -1);
	oPlayControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_bottom);
	oTabsControl.AddControl(oPlayControl);
	document.getElementById("spanIdPlay").innerHTML = sPlay;

	this.m_oPlayButtonLocation = {
		Left   : nHomeW + nSpace,
		Top    : 0,
		Width  : nPlayW,
		Height : 50
	};

	var oThis = this;
	oPlayControl.HtmlElement.addEventListener("click", function()
	{
		var oClient = oThis.m_oClient;
		if (!oClient)
			return;

		if (oThis.m_oPlayMenu)
		{
			oThis.m_oPlayMenu.Hide();
			oThis.m_oPlayMenu = null;
			return;
		}

		document.getElementById("divIdPlayButton").style.background = "#969696";

		var oContextMenu = new CVisualContextMenu(oThis, nHomeW + nSpace, 53);
		var oOwnChallenge = oClient.GetOwnChallenge();
		if (!oOwnChallenge)
		{
			var bDisabled = oClient.GetRooms().length <= 0 ? true : false;
			var oListEntry = oContextMenu.AddListItem("Create new challenge", function()
			{
				oThis.m_oClient.CreateChallenge();
			}, bDisabled);
		}
		else
		{
			var oListEntry = oContextMenu.AddListItem("Your challenge", function()
			{
				oOwnChallenge.Show();
			}, false);

			if (oOwnChallenge.HaveChallengers())
				oListEntry.className += " blinkPlayMenu";
		}
		oContextMenu.AddHorizontalLine();

		if (oClient.IsOnAutomatch())
		{
			oContextMenu.AddListItem("Cancel automatch", function()
			{
				oClient.CancelAutomatch();
			}, false);
		}
		else
		{
			oContextMenu.AddListItem("Start automatch", function()
			{
				oClient.StartAutomatch();
			}, oClient.IsAlreadyPlaying());
		}
		oContextMenu.AddListItem("Automatch preferences", function()
		{
			CreateKGSWindow(EKGSWindowType.AutomatchPr, {App : oApp, Client : oApp.GetClient()});
		}, false);

		oContextMenu.AddHorizontalLine();

		var arrAllChallenges = oClient.GetAllChallenges();
		for (var nIndex = 0, nCount = arrAllChallenges.length; nIndex < nCount; ++nIndex)
		{
			var oChallengeWindow = arrAllChallenges[nIndex];
			if (oChallengeWindow && oChallengeWindow !== oOwnChallenge)
			{
				var oChallengeCreator = oChallengeWindow.GetChallengeCreator();
				var oListEntry = oContextMenu.AddListItem(oChallengeCreator.GetName() + "[" + oChallengeCreator.GetStringRank() + "]", function(e, _oChallengeWindow)
				{
					_oChallengeWindow.Show();
				}, false, oChallengeWindow);

				if (oChallengeWindow.IsWaitingForAccept())
					oListEntry.className += " blinkPlayMenu";
			}
		}

		oContextMenu.Show();
		oContextMenu.AddOnHideCallback(function()
		{
			oThis.m_oPlayMenu = null;
			document.getElementById("divIdPlayButton").style.background = "";
		});
		oThis.m_oPlayMenu = oContextMenu;

	}, false);

	// Правая панелька с поиском, ником и кнопкой выхода
	var oRightPanel = CreateControlContainer("divIdPanelRight");
	oRightPanel.Bounds.SetParams(0, 0, 0, 1000, false, false, true, false, 300, -1);
	oRightPanel.Anchor = (g_anchor_top | g_anchor_right | g_anchor_bottom);
	oTabsControl.AddControl(oRightPanel);


	// Панель под табы с игровыми комнатами
	var oGameRoomTabs = CreateControlContainer("divIdTabPanelRooms");
	oGameRoomTabs.Bounds.SetParams(nHomeW + nPlayW + 2 * nSpace, 0, 375, 1000, true, false, true, false, -1, -1); // 300(правая часть) + 5(отступ) + 50(кнопка) + 20(скролл)
	oGameRoomTabs.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oTabsControl.AddControl(oGameRoomTabs);

	this.m_oGameTabsScroll = new CVerticalScroll();
	this.m_oGameTabsScroll.Init(oGameRoomTabs.HtmlElement, "VerScrollBlack", "VerScrollBlackActive", false);
	this.m_oGameTabsScroll.SetPaddings(0, 2, 3);

	// Кнопка для раскрытия панели со всеми играми
	var oToggleButton = this.private_InitGameTabsToggleButton("divIdGameTabsToggle");
	oToggleButton.Bounds.SetParams(0, 0, 305, 1000, false, false, true, false, 50, -1);
	oToggleButton.Anchor = (g_anchor_top | g_anchor_bottom | g_anchor_right);
	oTabsControl.AddControl(oToggleButton);
};
CGoUniverseApplication.prototype.private_InitMainRoom = function()
{
	var nPlayersListW = 160;

	this.m_oMainRoomControl = CreateControlContainer("divIdMainRoom");
	var oMainRoomControl = this.m_oMainRoomControl;
	oMainRoomControl.Bounds.SetParams(0, 50, 1000, 1000, false, true, false, false, -1, -1);
	oMainRoomControl.Anchor = (g_anchor_bottom |g_anchor_left | g_anchor_right);
	this.m_oClientControl.AddControl(oMainRoomControl);

	// Список игроков
	var oPlayersListControl = this.m_oPlayersListView.Init("divPlayersListId", new CKGSPlayersList(this));
	oPlayersListControl.Bounds.SetParams(0, 0, 0, 1000, false, false, true, false, nPlayersListW, -1);
	oPlayersListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right);
	oPlayersListControl.HtmlElement.style.background = "#F3F3F3";
	oMainRoomControl.AddControl(oPlayersListControl);

	// Левая часть
	var oLeftPartControl = CreateControlContainer("divIdL");
	oLeftPartControl.Bounds.SetParams(0, 0, nPlayersListW, 1000, false, false, true, false, -1, -1);
	oLeftPartControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oMainRoomControl.AddControl(oLeftPartControl);
	this.m_oMainRoomLeftPartControl = oLeftPartControl;

	var dSplitterPosition = this.m_oGlobalSettings.GetChatSplitterPosition();
	// Список игровых комнат
	var oGamesListWrapperControl = CreateControlContainer("divIdLGamesWrapper");
	oGamesListWrapperControl.Bounds.SetParams(0, 0, 1000, dSplitterPosition, false, false, false, false, -1, -1);
	oGamesListWrapperControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oLeftPartControl.AddControl(oGamesListWrapperControl);
	this.m_oGamesListWrapperControl = oGamesListWrapperControl;

	var oGamesListControl = this.m_oGamesListView.Init("divIdLGames", new CKGSGamesList(this));
	oGamesListControl.Bounds.SetParams(0, 0, 2, 0, true, false, true, true, -1, -1);
	oGamesListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oGamesListControl.HtmlElement.style.background = "#F3F3F3";
	oGamesListWrapperControl.AddControl(oGamesListControl);

	// Часть под чат
	var oChatControl = CreateControlContainer("divIdLChat");
	oChatControl.Bounds.SetParams(0, dSplitterPosition, 1000, 1000, false, false, false, false, -1, -1);
	oChatControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oLeftPartControl.AddControl(oChatControl);
	this.m_oChatWrapperControl = oChatControl;

	// Полоска для переноса
	var oChatDragHandlerControl = CreateControlContainer("divIdLChatDragHandler");
	oChatDragHandlerControl.Bounds.SetParams(0, dSplitterPosition, 1000, 1000, false, false, false, false, -1, 5);
	oChatDragHandlerControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oLeftPartControl.AddControl(oChatDragHandlerControl);
	this.m_oChatDragHandlerControl = oChatDragHandlerControl;

	this.private_InitChats(oChatControl);
};
CGoUniverseApplication.prototype.private_InitUserNameLink = function()
{
	var oThis = this;
	document.getElementById("divIdClientNameText").addEventListener("click", function()
	{
		var oClient = oThis.m_oClient;
		if (oClient)
			oClient.LoadUserInfo(oClient.GetUserName());
	});
};
CGoUniverseApplication.prototype.private_InitChats = function(oChatControl)
{
	// Табы чата
	var oChatTabsBack = CreateControlContainer("divIdLChatTabsBack");
	oChatTabsBack.Bounds.SetParams(0, 0, 2, 0, true, true, true, false, -1, 24);
	oChatTabsBack.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oChatControl.AddControl(oChatTabsBack);

	var oChatTabs = this.m_oChatRoomTabs.Init("divIdLChatTabs");
	oChatTabs.Bounds.SetParams(0, 1, 64, 0, true, true, true, false, -1, 25);
	oChatTabs.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oChatControl.AddControl(oChatTabs);

	this.m_oChatTabsScroll = new CVerticalScroll();
	this.m_oChatTabsScroll.Init(oChatTabs.HtmlElement, "VerScroll", "VerScrollActive", false);
	this.m_oChatTabsScroll.SetPaddings(24, 1, 0);

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

	this.m_oChatScroll = new CVerticalScroll();
	this.m_oChatScroll.Init(document.getElementById("textareaChatId"), "VerScroll", "VerScrollActive", true);
	this.m_oChatScroll.SetPaddings(-1, 1, 0);

	this.m_oChatScroll.Show();

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
CGoUniverseApplication.prototype.private_InitGameTabsToggleButton = function(sDivId)
{
	var oThis = this;

	var oElement = document.getElementById(sDivId);
	var oControl = CreateControlContainer(sDivId);

	oElement.title           = "Open game list";
	// oElement.style.fontSize  = "24px";
	// oElement.style.textAlign = "center";
	oElement.addEventListener("selectstart", function()
	{
		return false;
	}, false);
	oElement.addEventListener("click", function()
	{
		var oTabs = document.getElementById("divIdTabPanelRooms");
		var sHeight = parseFloat(oTabs.style.height);

		if (sHeight < 55)
			oThis.private_OpenGameTabs();
		else
			oThis.private_CollapseGameTabs();
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
			// Logout придет из клиента, нельзя самому это делать, т.к. клиенту еще могут приходить сообщения, до
			// настоящего logout.
			oThis.m_oClient.Disconnect();
		}
		else
		{
			oThis.Logout();
		}
	});
};
CGoUniverseApplication.prototype.private_InitOmnibox = function()
{
	var oThis = this;

	var oInput = document.getElementById("OmniboxInput");
	oInput.addEventListener("keypress", function(e)
	{
		var event    = e || window.event;
		var charCode = event.which || event.keyCode;
		if (13 === charCode && this.value !== "")
		{
			oThis.m_oClient.LoadUserInfo(this.value);
			this.value = "";
			return false;
		}
	});
	oInput.addEventListener("blur", function(e)
	{
		this.value = "";
	}, false);
};
CGoUniverseApplication.prototype.private_ClearClient = function()
{
	if (null !== this.m_oClient)
	{
		this.m_oClient.Clear();
		this.m_oClient = null;
	}

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
	document.getElementById("divIdAbout").style.display      = "block";
	this.private_HideAnimatedLogo();

	if (true === bShowError)
		document.getElementById("divIdConnectionError").style.display = "block";
	else
		document.getElementById("divIdConnectionError").style.display = "none";
};
CGoUniverseApplication.prototype.private_GotoClientPage = function()
{
	document.getElementById("divMainId").style.display = "block";

	g_oFadeEffect.Out(document.getElementById("divIdConnection"), 200);
	g_oFadeEffect.Out(document.getElementById("divIdConnectionError"), 200);
	g_oFadeEffect.Out(document.getElementById("divIdAbout"), 200);
};
CGoUniverseApplication.prototype.private_ClearChat = function()
{
	var oDiv = document.getElementById("textareaChatId");
	while (oDiv.firstChild)
	{
		oDiv.removeChild(oDiv.firstChild);
	}

	var oChatInput = document.getElementById("inputChatId");
	oChatInput.value = "";
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
	return oContextMenu;
};
CGoUniverseApplication.prototype.private_OpenChatTabs = function()
{
	var oTabs     = document.getElementById("divIdLChatTabs");
	var nCount    = oTabs.childElementCount;
	var oLastNode = oTabs.children[nCount - 1];
	var nOffset   = oLastNode.offsetTop;
	var nLines    = (((nOffset + 1) / 25) | 0) + 1;

	var nMaxLines = Math.max(Math.min(5, nLines), 1);
	if (1 === nMaxLines)
		return;

	oTabs.className = "ChatOpenPanel";

	var nClientHeight = (nMaxLines * 25 - 1);
	oTabs.style.height          = nClientHeight + "px";
	oTabs.style.backgroundColor = "#F3F3F3";
	oTabs.style.borderBottom    = "1px solid #BEBEBE";
	oTabs.style.borderRight     = "1px solid #BEBEBE";
	oTabs.style.boxShadow       = "0px 1px 4px rgba(0,0,0,0.2)";

	document.getElementById("divIdLChatTabsToggleInnerSpan").style.transform = "rotate(270deg)";

	if (nLines > nMaxLines)
		this.m_oChatTabsScroll.Show(nClientHeight);
};
CGoUniverseApplication.prototype.private_CollapseChatTabs = function()
{
	var oTabs = document.getElementById("divIdLChatTabs");
	oTabs.className = "";
	oTabs.style.height          = "25px";
	oTabs.style.minHeight       = "";
	oTabs.style.maxHeight       = "";
	oTabs.style.backgroundColor = "transparent";
	oTabs.style.borderBottom    = "1px none #BEBEBE";
	oTabs.style.borderRight     = "1px none #BEBEBE";
	oTabs.style.overflowY       = "hidden";
	oTabs.style.boxShadow       = "";

	document.getElementById("divIdLChatTabsToggleInnerSpan").style.transform = "rotate(90deg)";

	this.m_oChatTabsScroll.Hide();
	this.ScrollChatTabsToCurrent();
};
CGoUniverseApplication.prototype.ScrollChatTabsToCurrent = function()
{
	var nChatRoomId = this.m_oChatRoomTabs.GetCurrentId();
	var oTab = this.m_oChatRoomTabs.GetTab(nChatRoomId);
	if (!oTab)
		return;

	var oTabDiv = oTab.m_oTabDiv;
	var nOffsetTop = oTabDiv.offsetTop;

	var nLine = parseInt((nOffsetTop + 1) / 25);

	var oTabs = document.getElementById("divIdLChatTabs");
	oTabs.scrollTop = nLine * 25;
};
CGoUniverseApplication.prototype.IsTypingChatMessage = function()
{
	var oChatInput = document.getElementById("inputChatId");
	if ("" === oChatInput.value)
		return false;

	return true;
};
CGoUniverseApplication.prototype.private_AddNotification = function(sUserName)
{
	this.m_oSound.Play_NewMessage();
};
CGoUniverseApplication.prototype.IsFocused = function()
{
	if (true === document.hidden || false === this.m_bFocused)
		return false;

	return true;
};
CGoUniverseApplication.prototype.Focus = function()
{
	this.m_bFocused = true;
};
CGoUniverseApplication.prototype.Blur = function()
{
	this.m_bFocused = false;
};
CGoUniverseApplication.prototype.UpdateDropDownChatTabsButton = function()
{
	// Проверяем, нужна ли нам кнопка

	var oTabs     = document.getElementById("divIdLChatTabs");
	var nCount    = oTabs.childElementCount;

	if (nCount <= 0)
	{
		document.getElementById("divIdLChatTabsToggle").style.display = "none";
		return;
	}

	var oLastNode = oTabs.children[nCount - 1];
	var nOffset   = oLastNode.offsetTop;
	var nLines    = (((nOffset + 1) / 25) | 0) + 1;

	if (nLines > 1)
	{
		document.getElementById("divIdLChatTabsToggle").style.display = "block";
	}
	else
	{
		document.getElementById("divIdLChatTabsToggle").style.display = "none";
	}
};
CGoUniverseApplication.prototype.private_OpenGameTabs = function()
{
	var oTabs     = document.getElementById("divIdTabPanelRooms");
	var nCount    = oTabs.childElementCount;
	var oLastNode = oTabs.children[nCount - 1];
	var nOffset   = oLastNode.offsetTop;
	var nLines    = (((nOffset + 1) / 50) | 0) + 1;

	var nMaxLines = Math.max(Math.min(3, nLines), 1);
	if (1 === nMaxLines)
		return;

	oTabs.className = "ChatOpenPanel";

	var nClientHeight = (nMaxLines * 50 - 1);
	document.getElementById("divIdTabPanel").style.height = nClientHeight + 5 + "px";
	oTabs.style.height          = nClientHeight + "px";
	oTabs.style.backgroundColor = "#050708";
	oTabs.style.boxShadow       = "0px 1px 5px rgba(0,0,0,0.8)";

	document.getElementById("divIdGameTabsToggleInner").style.transform = "rotate(270deg)";

	if (nLines > nMaxLines)
		this.m_oGameTabsScroll.Show(nClientHeight);
};
CGoUniverseApplication.prototype.private_CollapseGameTabs = function()
{
	var oTabs = document.getElementById("divIdTabPanelRooms");
	oTabs.className = "";
	oTabs.style.height          = "50px";
	oTabs.style.backgroundColor = "transparent";
	oTabs.style.boxShadow       = "";

	document.getElementById("divIdTabPanel").style.height = "50px";
	document.getElementById("divIdGameTabsToggleInner").style.transform = "rotate(90deg)";

	this.m_oGameTabsScroll.Hide();
	this.ScrollGameTabsToCurrent();
};
CGoUniverseApplication.prototype.ScrollGameTabsToCurrent = function()
{
	var oTabs = document.getElementById("divIdTabPanelRooms");

	var nGameRoomId = this.m_oGameRoomTabs.GetCurrentId();
	var oTab = this.m_oGameRoomTabs.GetTab(nGameRoomId);
	if (!oTab || !oTab.m_oGameTree)
	{
		oTabs.scrollTop = 0;
		return;
	}

	var oTabDiv    = oTab.m_oTabDiv;
	var nOffsetTop = oTabDiv.offsetTop;

	var nLine = parseInt((nOffsetTop + 1) / 50);
	oTabs.scrollTop = nLine * 50;
};
CGoUniverseApplication.prototype.private_UpdateChatScroll = function()
{
	this.m_oChatScroll.CheckVisibility();
};
CGoUniverseApplication.prototype.UpdateChatScroll = function()
{
	this.private_UpdateChatScroll();
};
CGoUniverseApplication.prototype.UpdateDropDownGameTabsButton = function()
{
	// Проверяем, нужна ли нам кнопка

	var oTabs  = document.getElementById("divIdTabPanelRooms");
	var nCount = oTabs.childElementCount;

	if (nCount <= 0)
	{
		document.getElementById("divIdGameTabsToggle").style.display = "none";
		return;
	}

	var oLastNode = oTabs.children[nCount - 1];
	var nOffset   = oLastNode.offsetTop;
	var nLines    = (((nOffset + 1) / 50) | 0) + 1;

	if (nLines > 1)
	{
		document.getElementById("divIdGameTabsToggle").style.display = "block";
	}
	else
	{
		document.getElementById("divIdGameTabsToggle").style.display = "none";
	}
};
CGoUniverseApplication.prototype.ScrollChatAreaToBottom = function()
{
	if (this.m_oChatScroll)
		this.m_oChatScroll.CheckVisibility(true);

	var oDiv = document.getElementById("textareaChatId");
	oDiv.scrollTop = oDiv.scrollHeight;

	this.m_oChatScroll.UpdatePosition();
};
CGoUniverseApplication.prototype.ShowAbout = function()
{
	CreateKGSWindow(EKGSWindowType.GoUniverseAbout, {Client : this.m_oClient, App : this});
};
CGoUniverseApplication.prototype.GetVersion = function()
{
	return g_sGoUniverseVersion;
};
CGoUniverseApplication.prototype.ShowGamesListContextMenu = function(nX, nY, nGameId)
{
	var oThis = this;
	var oClient = this.m_oClient;
	var oContextMenu = new CVisualContextMenu(this, nX, nY);

	if (null !== nGameId)
	{
		var oGameRecord = this.m_oClient.GetGame(nGameId);
		var bChallenge = oGameRecord && oGameRecord.IsChallenge() ? true : false;
		oContextMenu.AddCheckBoxItem(false, bChallenge ? "Join" : "Observe", function ()
		{
			oThis.SetCurrentGameRoomTab(nGameId);
		});
		oContextMenu.AddHorizontalLine();
	}

	var nGamesListType = oClient.GetGamesListType();
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.AllGames === nGamesListType ? true : false, "All games", function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.AllGames);
	});
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.AllChallenges === nGamesListType ? true : false, "All challenges", function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.AllChallenges);
	});
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.AllChallengesNoBots === nGamesListType ? true : false, "All challenges(no robots)", function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.AllChallengesNoBots);
	});
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.Room === nGamesListType ? true : false, "Rooms", function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.Room);
	});
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.Followed === nGamesListType ? true : false, "Followed", function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.Followed);
	});
	oContextMenu.Show();

	return oContextMenu;
};
CGoUniverseApplication.prototype.private_InitChatDragHandler = function ()
{
	var nH = this.m_oMainRoomLeftPartControl.height;
	if (nH <= 100)
		return;

	var nYLimit      = nH - 100;
	var oDragElement = this.m_oChatDragHandlerControl.HtmlElement;
	Common_DragHandler.Init(oDragElement, null, -1, -1, 0, nH - 100);

	var oThis = this;
	function privateOnDrag(nY, isKoef)
	{
		if (true === isKoef)
		{
			var dPosition = 1000 * nY / nH;
			oThis.m_oGamesListWrapperControl.Bounds.SetParams(0, 0, 1000, dPosition, false, false, false, false, -1, -1);
			oThis.m_oChatWrapperControl.Bounds.SetParams(0, dPosition, 1000, 1000, false, false, false, false, -1, -1);
			oThis.m_oChatDragHandlerControl.Bounds.SetParams(0, dPosition, 1000, 1000, false, false, false, false, -1, 5);
			oThis.m_oGlobalSettings.SetChatSplitterPosition(dPosition);
		}
		else
		{
			oThis.m_oGamesListWrapperControl.Bounds.SetParams(0, 0, 1000, 0, false, false, false, false, -1, nY);
			oThis.m_oChatWrapperControl.Bounds.SetParams(0, nY, 1000, 1000, false, true, false, false, -1, -1);
			oThis.m_oChatDragHandlerControl.Bounds.SetParams(0, nY, 1000, 1000, false, true, false, false, -1, 5);
		}
		oThis.OnResize(true);
		oThis.m_oGamesListView.private_ScrollByY(0);
	}

	oDragElement.onDrag = function (nX, nY)
	{
		privateOnDrag(nY, false);
	};
	oDragElement.onDragStart = function(nX, nY)
	{
		global_mouseEvent.LockMouse();
	};
	oDragElement.onDragEnd = function(nX, nY)
	{
		global_mouseEvent.UnLockMouse();
		privateOnDrag(nY, true);
	};

	if (parseInt(oThis.m_oChatDragHandlerControl.HtmlElement.style.top) > nYLimit)
	{
		privateOnDrag(nYLimit, true);
	}
};
CGoUniverseApplication.prototype.GetGlobalSettings = function()
{
	return this.m_oGlobalSettings;
};
CGoUniverseApplication.prototype.private_ShowAnimatedLogo = function()
{
	this.m_oAnimatedLogo.Show();
};
CGoUniverseApplication.prototype.private_HideAnimatedLogo = function()
{
	this.m_oAnimatedLogo.Hide();
};
CGoUniverseApplication.prototype.GetButtonPlayLocation = function()
{
	return this.m_oPlayButtonLocation;
};
CGoUniverseApplication.prototype.SendGameNotification = function(nGameId)
{
	if (this.m_oGameRoomTabs.GetCurrentId() !== nGameId)
	{
		var oTab = this.m_oGameRoomTabs.GetTab(nGameId);
		oTab.ShowNotification();
	}
};
CGoUniverseApplication.prototype.SendChallengeNotification = function(nChallengeId)
{
	document.getElementById("divIdPlayButton").style.background = "rgb(153, 82, 25)";
};
CGoUniverseApplication.prototype.OnStartAutomatch = function()
{
	var oCanvas = document.getElementById("divIdPlayButtonAutomatch");
	var oName   = document.getElementById("divIdPlayButton");

	oName.style.display = "none";
	oCanvas.style.display = "block";

	if (!this.m_oAutomatchAnimatedLogo)
	{
		this.m_oAutomatchAnimatedLogo = new CGoUniverseAnimatedLogo(oCanvas);
		this.m_oAutomatchAnimatedLogo.SetInverted(true);
	}
	else
	{
		this.m_oAutomatchAnimatedLogo.Stop();
	}

	this.m_oAutomatchAnimatedLogo.Start();

	oCanvas.title = "Auto match is turned on";
};
CGoUniverseApplication.prototype.OnCancelAutomatch = function()
{
	var oCanvas = document.getElementById("divIdPlayButtonAutomatch");
	var oName   = document.getElementById("divIdPlayButton");

	oName.style.display = "block";
	oCanvas.style.display = "none";

	if (this.m_oAutomatchAnimatedLogo)
		this.m_oAutomatchAnimatedLogo.Stop();
};