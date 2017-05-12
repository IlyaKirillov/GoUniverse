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
	this.m_oGamesListTabs      = new CVisualTabs();

	this.m_arrPopups           = [];
	
	this.m_oSound              = new CBoardSound();
	this.m_oSound.Init("http://webgoboard.com/Sound");
	//this.m_oSound.Init("Files/Sound");
	this.m_bFocused            = true;

	this.m_oGameTabsScroll = null;
	this.m_oChatScroll     = null;

	this.m_oChatTabsPanel      = new CVisualChatTabsPanel(this);
	this.m_bChatTabsFullHeight = false;

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
	this.private_ParseLocale();

	this.m_oAnimatedLogo = new CGoUniverseAnimatedLogo(document.getElementById("animatedLogoId"));

	this.private_InitMainDiv();
	this.private_InitLoginPage();
	this.private_InitClientPage();
	this.UpdateTranslation();
	this.private_GotoLoginPage(false);
	this.OnResize();

	// //------------------------------------------------------------------------------------------------------------------
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
	ConnectionDiv.style.top  = (document.body.clientHeight - 200) / 2 + "px";

	var ErrorDiv        = document.getElementById("divIdConnectionError");
	ErrorDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
	ErrorDiv.style.top  = (document.body.clientHeight - 200) / 2 + 180 + "px";

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
	this.private_CollapseGameTabs();
	this.UpdateDropDownGameTabsButton();

	this.m_oChatTabsPanel.OnResize();

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

			if (0 === sMessage.indexOf("\\admin"))
			{
				var nCurrentRoomId = this.m_oChatRoomTabs.GetCurrent().GetId();
				var arrAdmins      = this.m_oClient.GetAdminsInRoom(nCurrentRoomId);

				var sAdmins = arrAdmins.length ? "Admins currently online:\n" : "There is no admins in this room online.";
				for (var nIndex = 0, nCount = arrAdmins.length; nIndex < nCount; ++nIndex)
				{
					sAdmins += "\\user=" + arrAdmins[nIndex] + "; ";
				}

				this.AddRoomGreetingMessage(nCurrentRoomId, sAdmins);
			}
			else
			{
				sMessage = sMessage.replace(/\u000A/g, String.fromCharCode(0xFF0A));
				this.m_oClient.SendChatMessage(sMessage);
			}
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
	this.m_oChatTabsPanel.OnAddChatRoom();
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

	this.m_oChatTabsPanel.ScrollChatTabsToCurrentTab();
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
	ProcessUserLinks(oTextDiv, this.m_oClient);
	ProcessGameLinks(oTextDiv, this.m_oClient);
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

	ProcessUserLinks(oTextDiv, this.m_oClient);
	ProcessGameLinks(oTextDiv, this.m_oClient);
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

	document.getElementById("localizationSelectId").addEventListener("change", function()
	{
		var sLocale = "enEN";
		switch (this.selectedIndex)
		{
			case 0 : sLocale = "enEN"; break;
			case 1 : sLocale = "ruRU"; break;
		}

		oThis.m_oGlobalSettings.SetLocale(sLocale);

		location.reload();
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

	var sMainRoom = g_oLocalization.mainRoom.roomsButton;
	var sPlay     = g_oLocalization.mainRoom.playButton;

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
			var oListEntry = oContextMenu.AddListItem(g_oLocalization.mainRoom.playMenu.createChallenge, function()
			{
				oThis.m_oClient.CreateChallenge();
			}, bDisabled);
		}
		else
		{
			var oListEntry = oContextMenu.AddListItem(g_oLocalization.mainRoom.playMenu.yourChallenge, function()
			{
				oOwnChallenge.Show();
			}, false);

			if (oOwnChallenge.HaveChallengers())
				oListEntry.className += " blinkPlayMenu";
		}
		oContextMenu.AddHorizontalLine();

		if (oClient.IsOnAutomatch())
		{
			oContextMenu.AddListItem(g_oLocalization.mainRoom.playMenu.cancelAutomatch, function()
			{
				oClient.CancelAutomatch();
			}, false);
		}
		else
		{
			oContextMenu.AddListItem(g_oLocalization.mainRoom.playMenu.startAutomatch, function()
			{
				oClient.StartAutomatch();
			}, oClient.IsAlreadyPlaying());
		}
		oContextMenu.AddListItem(g_oLocalization.mainRoom.playMenu.automatchPreferences, function()
		{
			CreateKGSWindow(EKGSWindowType.AutomatchPr, {App : oApp, Client : oApp.GetClient()});
		}, false);

		oContextMenu.AddHorizontalLine();

		oContextMenu.AddListItem(g_oLocalization.mainRoom.playMenu.startDemonstration, function()
		{
			oThis.m_oClient.CreateDemonstration();
		}, false);

		oContextMenu.AddListItem(g_oLocalization.mainRoom.playMenu.loadFile, function()
		{
			var oGameTree = new CGameTree(null);
			Common.OpenFileDialog(oGameTree, function()
			{
				oThis.m_oClient.LoadFile(oGameTree);
			});
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


	g_oTextMeasurer.SetFont("14px 'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif");
	var nExitW = g_oTextMeasurer.Measure(g_oLocalization.mainRoom.exitButton);
	var nRightPanelW = 120 + 100 + 35 + nExitW;

	// Правая панелька с поиском, ником и кнопкой выхода
	var oRightPanel = CreateControlContainer("divIdPanelRight");
	oRightPanel.Bounds.SetParams(0, 0, 0, 1000, false, false, true, false, nRightPanelW, -1);
	oRightPanel.Anchor = (g_anchor_top | g_anchor_right | g_anchor_bottom);
	oTabsControl.AddControl(oRightPanel);


	// Панель под табы с игровыми комнатами
	var oGameRoomTabs = CreateControlContainer("divIdTabPanelRooms");
	oGameRoomTabs.Bounds.SetParams(nHomeW + nPlayW + 2 * nSpace, 0, nRightPanelW + 75, 1000, true, false, true, false, -1, -1); // nRightPanelW(правая часть) + 5(отступ) + 50(кнопка) + 20(скролл)
	oGameRoomTabs.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oTabsControl.AddControl(oGameRoomTabs);

	this.m_oGameTabsScroll = new CVerticalScroll();
	this.m_oGameTabsScroll.Init(oGameRoomTabs.HtmlElement, "VerScrollBlack", "VerScrollBlackActive", false);
	this.m_oGameTabsScroll.SetPaddings(0, 2, 3);

	// Кнопка для раскрытия панели со всеми играми
	var oToggleButton = this.private_InitGameTabsToggleButton("divIdGameTabsToggle");
	oToggleButton.Bounds.SetParams(0, 0, nRightPanelW + 5, 1000, false, false, true, false, 50, -1);
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
	oGamesListControl.Bounds.SetParams(0, 0, 2, 25, true, false, true, true, -1, -1);
	oGamesListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oGamesListControl.HtmlElement.style.background = "#F3F3F3";
	oGamesListWrapperControl.AddControl(oGamesListControl);

	this.m_nChatTabsWidth = 200;
	this.m_bChatTabsFullHeight = this.m_oGlobalSettings.GetChatTabsFullHeight();

	// Табы для чата
	var oChatTabsControl = CreateControlContainer("divIdLChatTabsWrapper");
	oChatTabsControl.SetParams(0, dSplitterPosition, 1000, 1000, false, false, false, false, this.m_nChatTabsWidth, -1);
	oChatTabsControl.SetAnchor(true, true, false, true);
	oChatTabsControl.HtmlElement.style.background = "#F3F3F3";
	oLeftPartControl.AddControl(oChatTabsControl);
	this.m_oChatTabsControl = oChatTabsControl;

	// Часть под чат
	var oChatControl = CreateControlContainer("divIdLChat");
	oChatControl.Bounds.SetParams(this.m_nChatTabsWidth, dSplitterPosition, 1000, 1000, true, false, false, false, -1, -1);
	oChatControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
	oLeftPartControl.AddControl(oChatControl);
	this.m_oChatWrapperControl = oChatControl;

	// Полоска для переноса
	var oChatDragHandlerControl = CreateControlContainer("divIdLChatDragHandler");
	oChatDragHandlerControl.Bounds.SetParams(0, dSplitterPosition, 1000, 1000, false, false, false, false, -1, 5);
	oChatDragHandlerControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
	oLeftPartControl.AddControl(oChatDragHandlerControl);
	this.m_oChatDragHandlerControl = oChatDragHandlerControl;

	this.private_OnChangeChatTabsFullHeight();
	this.private_InitChats(oChatControl);
	this.private_InitChatsTabs(oChatTabsControl);
	this.private_InitGamesListTabs(oGamesListWrapperControl);
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
	// Все сообщения
	var oChatTextAreaControl = CreateControlContainer("divIdLChatTextArea");
	oChatTextAreaControl.Bounds.SetParams(0, 0, 2, 52, true, true, true, true, -1, -1);
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
CGoUniverseApplication.prototype.private_InitChatsTabs = function(oWrapperControl)
{
	this.m_oChatTabsPanel.Init(this.m_oChatRoomTabs, oWrapperControl, this.m_bChatTabsFullHeight);

	var oThis = this;
	this.m_oChatTabsPanel.SetOnChangeHeightCallback(function(bFullHeight)
	{
		oThis.m_bChatTabsFullHeight = bFullHeight;
		oThis.private_OnChangeChatTabsFullHeight();
		oThis.m_oGlobalSettings.SetChatTabsFullHeight(bFullHeight);
		oThis.OnResize(true);
	});
};
CGoUniverseApplication.prototype.private_OnChangeChatTabsFullHeight = function()
{
	var dPosition = this.m_oGlobalSettings.GetChatSplitterPosition();
	if (this.m_bChatTabsFullHeight)
	{
		this.m_oGamesListWrapperControl.Bounds.SetParams(this.m_nChatTabsWidth, 0, 1000, dPosition, true, false, false, false, -1, -1);
		this.m_oChatDragHandlerControl.Bounds.SetParams(this.m_nChatTabsWidth, dPosition, 1000, 1000, true, false, false, false, -1, 5);
		this.m_oChatWrapperControl.Bounds.SetParams(this.m_nChatTabsWidth, dPosition, 1000, 1000, true, false, false, false, -1, -1);
		this.m_oChatTabsControl.SetParams(0, 0, 1000, 1000, false, false, false, false, this.m_nChatTabsWidth, -1);
	}
	else
	{
		this.m_oGamesListWrapperControl.Bounds.SetParams(0, 0, 1000, dPosition, false, false, false, false, -1, -1);
		this.m_oChatDragHandlerControl.Bounds.SetParams(0, dPosition, 1000, 1000, false, false, false, false, -1, 5);
		this.m_oChatWrapperControl.Bounds.SetParams(this.m_nChatTabsWidth, dPosition, 1000, 1000, true, false, false, false, -1, -1);
		this.m_oChatTabsControl.SetParams(0, dPosition, 1000, 1000, false, false, false, false, this.m_nChatTabsWidth, -1);
	}
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
CGoUniverseApplication.prototype.private_InitGamesListTabs = function(oParentControl)
{
	var oTabsControl = this.m_oGamesListTabs.Init("divIdLGamesListTabs");
	oTabsControl.SetParams(1, 0, 1, 0, true, false, true, true, -1, 26);
	oTabsControl.SetAnchor(true, false, true, true);
	oParentControl.AddControl(oTabsControl);

	oTabsControl.HtmlElement.style.backgroundColor = "#F3F3F3";
	oTabsControl.HtmlElement.style.borderRight     = "1px solid rgb(190, 190, 190)";

	var oTab = new CVisualGamesListTab(this);
	oTab.Init(EKGSGamesListType.AllGames, g_oLocalization.mainRoom.gamesTabs.games);
	this.m_oGamesListTabs.AddTab(oTab);

	oTab = new CVisualGamesListTab(this);
	oTab.Init(EKGSGamesListType.AllChallenges, g_oLocalization.mainRoom.gamesTabs.challenges);
	this.m_oGamesListTabs.AddTab(oTab);

	oTab = new CVisualGamesListTab(this);
	oTab.Init(EKGSGamesListType.AllChallengesNoBots, g_oLocalization.mainRoom.gamesTabs.challengesNoBots);
	this.m_oGamesListTabs.AddTab(oTab);

	oTab = new CVisualGamesListTab(this);
	oTab.Init(EKGSGamesListType.Room, g_oLocalization.mainRoom.gamesTabs.room);
	this.m_oGamesListTabs.AddTab(oTab);

	oTab = new CVisualGamesListTab(this);
	oTab.Init(EKGSGamesListType.Followed, g_oLocalization.mainRoom.gamesTabs.followed);
	this.m_oGamesListTabs.AddTab(oTab);
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
	var oThis   = this;
	var oClient = this.m_oClient;
	var oContextMenu = new CVisualContextMenu(this, nX, nY);
	oContextMenu.AddCheckBoxItem(false, g_oLocalization.mainRoom.playersList.contextMenuTalkTo, function()
	{
		oClient.EnterPrivateChat(sUserName);
	});
	oContextMenu.AddCheckBoxItem(false, g_oLocalization.mainRoom.playersList.contextMenuViewInfo, function()
	{
		oClient.LoadUserInfo(sUserName);
	});
	oContextMenu.AddHorizontalLine();
	oContextMenu.AddCheckBoxItem(oClient.IsUserInFriendList(sUserName), g_oLocalization.mainRoom.playersList.contextMenuFriend, function()
	{
		if (oClient.IsUserInFriendList(sUserName))
			oClient.RemoveFromFriendList(sUserName);
		else
			oClient.AddToFriendList(sUserName);
	});
	oContextMenu.AddCheckBoxItem(oClient.IsUserInBlackList(sUserName), g_oLocalization.mainRoom.playersList.contextMenuCensored, function()
	{
		if (oClient.IsUserInBlackList(sUserName))
			oClient.RemoveFromBlackList(sUserName);
		else
			oClient.AddToBlackList(sUserName);
	});
	oContextMenu.AddCheckBoxItem(oClient.IsUserInFollowerList(sUserName), g_oLocalization.mainRoom.playersList.contextMenuFollow, function()
	{
		if (oClient.IsUserInFollowerList(sUserName))
			oClient.RemoveFromFollowerList(sUserName);
		else
			oClient.AddToFollowerList(sUserName);
	});
	oContextMenu.AddHorizontalLine();
	oContextMenu.AddCheckBoxItem(false, g_oLocalization.mainRoom.playersList.contextMenuCopyLink, function()
	{
		var sMessage   = "\\user=" + sUserName + ";";

		var oCurrentTab = oThis.m_oGameRoomTabs.GetCurrent();
		if (oCurrentTab)
		{
			var oInputArea = oCurrentTab.GetChatInputElement();
			if (oInputArea)
			{
				if ("" !== oInputArea.value && ' ' !== oInputArea.value.charAt(oInputArea.value.length - 1))
					oInputArea.value += " ";

				oInputArea.value += sMessage + " ";
				oInputArea.focus();
			}
		}
	});

	oContextMenu.Show();
	return oContextMenu;
};
CGoUniverseApplication.prototype.ScrollChatTabsToCurrent = function()
{
	this.m_oChatTabsPanel.ScrollChatTabsToCurrentTab();
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
CGoUniverseApplication.prototype.OnRemoveChatRoom = function()
{
	this.m_oChatTabsPanel.OnRemoveChatRoom();
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

	var oGameRecord = null;
	if (null !== nGameId)
	{
		oGameRecord = this.m_oClient.GetGame(nGameId);
		var bChallenge = oGameRecord && oGameRecord.IsChallenge() ? true : false;
		oContextMenu.AddCheckBoxItem(false, bChallenge ? g_oLocalization.mainRoom.gamesList.contextMenuJoin : g_oLocalization.mainRoom.gamesList.contextMenuObserve, function ()
		{
			oThis.SetCurrentGameRoomTab(nGameId);
		});
		oContextMenu.AddHorizontalLine();
	}

	var nGamesListType = oClient.GetGamesListType();
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.AllGames === nGamesListType ? true : false, g_oLocalization.mainRoom.gamesTabs.games, function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.AllGames);
	});
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.AllChallenges === nGamesListType ? true : false, g_oLocalization.mainRoom.gamesTabs.challenges, function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.AllChallenges);
	});
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.AllChallengesNoBots === nGamesListType ? true : false, g_oLocalization.mainRoom.gamesTabs.challengesNoBots, function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.AllChallengesNoBots);
	});
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.Room === nGamesListType ? true : false, g_oLocalization.mainRoom.gamesTabs.room, function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.Room);
	});
	oContextMenu.AddCheckBoxItem(EKGSGamesListType.Followed === nGamesListType ? true : false, g_oLocalization.mainRoom.gamesTabs.followed, function ()
	{
		oClient.SetGamesListType(EKGSGamesListType.Followed);
	});
	if (null !== oGameRecord)
	{
		oContextMenu.AddHorizontalLine();
		oContextMenu.AddCheckBoxItem(false, g_oLocalization.mainRoom.gamesList.contextMenuCopyLink, function()
		{
			var sMessage = "\\game=" + nGameId + ";" + oGameRecord.GetGameTitle() + ";";
			var oInputArea   = document.getElementById("inputChatId");

			if ("" !== oInputArea.value && ' ' !== oInputArea.value.charAt(oInputArea.value.length - 1))
				oInputArea.value += " ";

			oInputArea.value += sMessage + " ";
			oInputArea.focus();
		});
	}
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
		if (oThis.m_bChatTabsFullHeight)
		{
			if (true === isKoef)
			{
				var dPosition = 1000 * nY / nH;
				oThis.m_oGamesListWrapperControl.Bounds.SetParams(oThis.m_nChatTabsWidth, 0, 1000, dPosition, true, false, false, false, -1, -1);
				oThis.m_oChatDragHandlerControl.Bounds.SetParams(oThis.m_nChatTabsWidth, dPosition, 1000, 1000, true, false, false, false, -1, 5);
				oThis.m_oChatWrapperControl.Bounds.SetParams(oThis.m_nChatTabsWidth, dPosition, 1000, 1000, true, false, false, false, -1, -1);
				oThis.m_oChatTabsControl.SetParams(0, 0, 1000, 1000, false, false, false, false, oThis.m_nChatTabsWidth, -1);
				oThis.m_oGlobalSettings.SetChatSplitterPosition(dPosition);
			}
			else
			{
				oThis.m_oGamesListWrapperControl.Bounds.SetParams(oThis.m_nChatTabsWidth, 0, 1000, 0, true, false, false, false, -1, nY);
				oThis.m_oChatDragHandlerControl.Bounds.SetParams(oThis.m_nChatTabsWidth, nY, 1000, 1000, true, true, false, false, -1, 5);
				oThis.m_oChatWrapperControl.Bounds.SetParams(oThis.m_nChatTabsWidth, nY, 1000, 1000, true, true, false, false, -1, -1);
				oThis.m_oChatTabsControl.SetParams(0, 0, 1000, 1000, false, false, false, false, oThis.m_nChatTabsWidth, -1);
			}
		}
		else
		{
			if (true === isKoef)
			{
				var dPosition = 1000 * nY / nH;
				oThis.m_oGamesListWrapperControl.Bounds.SetParams(0, 0, 1000, dPosition, false, false, false, false, -1, -1);
				oThis.m_oChatDragHandlerControl.Bounds.SetParams(0, dPosition, 1000, 1000, false, false, false, false, -1, 5);
				oThis.m_oChatWrapperControl.Bounds.SetParams(oThis.m_nChatTabsWidth, dPosition, 1000, 1000, true, false, false, false, -1, -1);
				oThis.m_oChatTabsControl.SetParams(0, dPosition, 1000, 1000, false, false, false, false, oThis.m_nChatTabsWidth, -1);
				oThis.m_oGlobalSettings.SetChatSplitterPosition(dPosition);
			}
			else
			{
				oThis.m_oGamesListWrapperControl.Bounds.SetParams(0, 0, 1000, 0, false, false, false, false, -1, nY);
				oThis.m_oChatDragHandlerControl.Bounds.SetParams(0, nY, 1000, 1000, false, true, false, false, -1, 5);
				oThis.m_oChatWrapperControl.Bounds.SetParams(oThis.m_nChatTabsWidth, nY, 1000, 1000, true, true, false, false, -1, -1);
				oThis.m_oChatTabsControl.SetParams(0, nY, 1000, 1000, false, true, false, false, oThis.m_nChatTabsWidth, -1);
			}
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
CGoUniverseApplication.prototype.OnChangeGamesListType = function(eType)
{
	var oTab = this.m_oGamesListTabs.GetTab(eType);
	if (oTab)
		oTab.OnClick(false);
};
CGoUniverseApplication.prototype.OnRoomStatsChanged = function(nUsersCount, nGamesCount, nChallengesCount)
{
	this.m_oChatTabsPanel.UpdateStats(nUsersCount, nGamesCount, nChallengesCount ,0);
};
CGoUniverseApplication.prototype.UpdateTranslation = function()
{
	// LoginScreen
	document.getElementById("inputLoginId")["placeholder"] = g_oLocalization.loginScreen.login;
	document.getElementById("inputPasswordId")["placeholder"] = g_oLocalization.loginScreen.password;
	document.getElementById("checkboxSavePasswordLabelId").innerHTML = g_oLocalization.loginScreen.remember;
	document.getElementById("connectDivId").innerHTML = g_oLocalization.loginScreen.connect;

	document.getElementById("divIdAboutButton").innerHTML = g_oLocalization.loginScreen.about;

	// MainRoom
	document.getElementById("OmniboxInput")["placeholder"] = g_oLocalization.mainRoom.findPlayer;
	document.getElementById("divIdExitButtonLabel").innerHTML = g_oLocalization.mainRoom.exitButton;



};
CGoUniverseApplication.prototype.private_ParseLocale = function()
{
	var sLocale = this.GetGlobalSettings().GetLocale();

	var oSelection = document.getElementById("localizationSelectId");
	switch (sLocale)
	{
		case "ruRU" :
		{
			oSelection.selectedIndex = 1;
			g_oLocalization = g_oLocalization_ruRU;
			break;
		}

		case "enEN":
		default:
		{
			oSelection.selectedIndex = 0;
			g_oLocalization = g_oLocalization_enEN;
			break;
		}
	}
};


/**
 * Спецаильный класс для работы с табами чата
 * @constructor
 */
function CVisualChatTabsPanel(oApp)
{
	this.m_oApp            = oApp;
	this.m_oChatTabs       = null;
	this.m_oChatTabsScroll = null;

	this.m_nTopPanelH = 30;
	this.m_nBotPanelH = 85;

	this.m_bFullHeight     = false;
	this.m_fOnChangeHeight = null;

	this.m_oSearchInput = null;
	this.m_oCancelIcon  = null;

	this.m_oElementUsers      = null;
	this.m_oElementGames      = null;
	this.m_oElementChallenges = null;

	this.m_oElementTabs       = null;
}
CVisualChatTabsPanel.prototype.Init = function(oChatTabs, oParentControl, bFullHeight)
{
	this.m_oChatTabs   = oChatTabs;
	this.m_bFullHeight = bFullHeight ? true : false;

	var oParentElement = oParentControl.HtmlElement;

	// Табы
	var oTabsElement = this.private_CreateDiv(oParentElement);
	var oTabsControl = oChatTabs.InitByElement(oTabsElement);
	oTabsControl.SetParams(0, this.m_nTopPanelH, 1000, this.m_nBotPanelH - 1, true, true, false, true, -1, -1);
	oTabsControl.SetAnchor(true, true, true, true);
	oParentControl.AddControl(oTabsControl);
	this.m_oElementTabs = oTabsElement;

	// Скролл для табов
	this.m_oChatTabsScroll = new CVerticalScroll();
	this.m_oChatTabsScroll.Init(oTabsControl.HtmlElement, "VerScroll", "VerScrollActive", false);
	this.m_oChatTabsScroll.SetPaddings(0, 2, 0);

	// Верхняя панелька с поиском
	var oTopElement = this.private_CreateDiv(oParentElement);
	var oTopControl = CreateControlContainerByElement(oTopElement);
	oTopControl.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, this.m_nTopPanelH);
	oTopControl.SetAnchor(true, true, true, false);
	oParentControl.AddControl(oTopControl);

	// Нижняя панелька
	var oBottomElement = this.private_CreateDiv(oParentElement);
	var oBottomControl = CreateControlContainerByElement(oBottomElement);
	oBottomControl.SetParams(0, 0, 1000, 0, false, false, false, true, -1, this.m_nBotPanelH);
	oBottomControl.SetAnchor(true, false, true, true);
	oParentControl.AddControl(oBottomControl);

	// Кнопка для добавления новой комнаты
	var oAddRoomElementWrapper       = document.createElement("div");
	oAddRoomElementWrapper.className = "chatTabsAdditionalSearchButtonsWrapper";

	var oAddRoomElement           = document.createElement("div");
	oAddRoomElement.innerHTML     = g_oLocalization.mainRoom.searchRoom;
	oAddRoomElement["aria-label"] = "Search in the list of all rooms";
	oAddRoomElement.title         = "Search in the list of all rooms";
	oAddRoomElement.className     = "ButtonGreen chatTabsAdditionalSearchButtons";
	this.m_oAddRoomElement        = oAddRoomElementWrapper;
	oAddRoomElementWrapper.appendChild(oAddRoomElement);

	// Кнопка для добавления разговора
	var oAddPrivateChatElementWrappper       = document.createElement("div");
	oAddPrivateChatElementWrappper.className = "chatTabsAdditionalSearchButtonsWrapper";

	var oAddPrivateChatElement           = document.createElement("div");
	oAddPrivateChatElement.innerHTML     = g_oLocalization.mainRoom.searchPlayer;
	oAddPrivateChatElement["aria-label"] = "Start private chat with that user";
	oAddPrivateChatElement.title         = "Start private chat with that user";
	oAddPrivateChatElement.className     = "ButtonGreen chatTabsAdditionalSearchButtons";
	this.m_oAddPrivateChatElement        = oAddPrivateChatElementWrappper;
	oAddPrivateChatElementWrappper.appendChild(oAddPrivateChatElement);

	this.private_InitTopPanel(oTopElement);
	this.private_InitBottomPanel(oBottomElement, oBottomControl);
};
CVisualChatTabsPanel.prototype.private_CreateDiv = function(oParent)
{
	var oDiv = document.createElement("div");
	oDiv.style.position = "absolute";
	oDiv.style.left     = "0px";
	oDiv.style.top      = "0px";
	oParent.appendChild(oDiv);
	return oDiv;
};
CVisualChatTabsPanel.prototype.private_InitTopPanel = function(oParent)
{
	oParent.style.borderBottom = "1px solid rgb(190, 190, 190)";

	var oSearchIcon              = document.createElement("div");
	oSearchIcon.style.position   = "absolute";
	oSearchIcon.style.left       = "25px";
	oSearchIcon.style.top        = "5px";
	oSearchIcon.style.fontSize   = "12px";
	oSearchIcon.style.fontFamily = "NotoEmoji";
	oSearchIcon.innerHTML        = "🔍";
	oParent.appendChild(oSearchIcon);

	var oCancelIcon = document.createElement("div");
	oCancelIcon.style.position   = "absolute";
	oCancelIcon.style.right      = "24px";
	oCancelIcon.style.top        = "5px";
	oCancelIcon.style.fontSize   = "14px";
	oCancelIcon.style.width      = "24px";
	oCancelIcon.style.textAlign  = "center";
	oCancelIcon.style.fontFamily = "NotoEmoji";
	oCancelIcon.innerHTML        = "\u2715";
	oCancelIcon.style.display    = "none";
	oCancelIcon.style.cursor     = "pointer";
	oParent.appendChild(oCancelIcon);

	var oAddButton = document.createElement("div");
	oAddButton.style.position   = "absolute";
	oAddButton.style.right      = "0px";
	oAddButton.style.top        = "5px";
	oAddButton.style.fontSize   = "20px";
	oAddButton.style.lineHeight = "20px";
	oAddButton.style.width      = "24px";
	oAddButton.style.textAlign  = "center";
	oAddButton.style.fontFamily = "NotoEmoji";
	oAddButton.innerHTML        = "\u002B";
	oAddButton.style.cursor     = "pointer";
	oParent.appendChild(oAddButton);

	var oInput = document.createElement("input");
	oInput.type = "text";
	oInput.className += "chatTabsSearch";

	oInput["aria-label"]  = g_oLocalization.mainRoom.search;
	oInput["placeholder"] = g_oLocalization.mainRoom.search;

	oParent.appendChild(oInput);

	// Кнопка для изменения расположения всей панели с табами
	var oMenuButton      = document.createElement("button");
	oMenuButton.tabIndex = "0";
	oMenuButton.className += " ChatMenuButton";
	oMenuButton.style.position = "absolute";
	oMenuButton.style.left     = "0px";
	oMenuButton.style.top      = "0px";
	oMenuButton.style.color    = "rgb(0, 0, 0)";

	var oCenter    = document.createElement("center");
	var oCenterDiv = document.createElement("div");
	var oMenuSpan  = document.createElement("span");

	oMenuSpan.className += " ChatMenuSpan";
	oMenuSpan.style.color = "black";
	oCenterDiv.appendChild(oMenuSpan);

	oMenuSpan.style.transition = "all 0.3s ease";

	if (this.m_bFullHeight)
		oMenuSpan.style.transform = "rotate(90deg)";
	else
		oMenuSpan.style.transform = "rotate(270deg)";

	oCenter.appendChild(oCenterDiv);
	oMenuButton.appendChild(oCenter);
	oParent.appendChild(oMenuButton);

	this.m_oSearchInput = oInput;
	this.m_oCancelIcon  = oCancelIcon;

	var oThis = this;

	oInput.addEventListener("input", function()
	{
		oThis.OnInputChange();
	});

	oCancelIcon.addEventListener("click", function()
	{
		oInput.value = "";
		oThis.OnInputChange();

		if (oInput.focus)
			oInput.focus();
	}, false);

	oMenuButton.addEventListener("click", function()
	{
		oThis.m_bFullHeight = !oThis.m_bFullHeight;

		if (oThis.m_bFullHeight)
			oMenuSpan.style.transform = "rotate(90deg)";
		else
			oMenuSpan.style.transform = "rotate(270deg)";

		oThis.private_OnChangeHeight();
	}, false);


	this.m_oAddPrivateChatElement.addEventListener("click", function()
	{
		var oClient = oThis.m_oApp.GetClient();
		if (oClient)
		{
			oClient.EnterPrivateChat(oInput.value);
		}

		oInput.value = "";
		oThis.OnInputChange();
	}, false);

	this.m_oAddRoomElement.addEventListener("click", function()
	{
		CreateKGSWindow(EKGSWindowType.RoomList, {Client : oThis.m_oApp.GetClient(), App : oThis.m_oApp, Text : oInput.value});
		oInput.value = "";
		oThis.OnInputChange();
	}, false);

	oAddButton.addEventListener("click", function()
	{
		CreateKGSWindow(EKGSWindowType.RoomList, {Client : oThis.m_oApp.GetClient(), App : oThis.m_oApp});
	}, false);
};
CVisualChatTabsPanel.prototype.SetOnChangeHeightCallback = function(fCallback)
{
	this.m_fOnChangeHeight = fCallback;
};
CVisualChatTabsPanel.prototype.private_OnChangeHeight = function()
{
	if (this.m_fOnChangeHeight)
		this.m_fOnChangeHeight(this.m_bFullHeight);
};
CVisualChatTabsPanel.prototype.OnInputChange = function()
{
	var oInput      = this.m_oSearchInput;
	var oCancelIcon = this.m_oCancelIcon;

	var oTabs   = this.m_oChatTabs;
	var sValue  = (oInput.value).toLowerCase();

	for (var nIndex = 0, nCount = oTabs.GetCount(); nIndex < nCount; ++nIndex)
	{
		var oTab      = oTabs.GetTabByIndex(nIndex);
		var sRoomName = (oTab.GetRoomName()).toLowerCase();

		if (!sValue || "" === sValue || -1 !== sRoomName.indexOf(sValue))
		{
			oTab.ShowTab();
		}
		else
		{
			oTab.HideTab();
		}
	}

	var oTabsDiv = this.m_oChatTabs.GetMainElement();
	if (!sValue || "" === sValue)
	{
		if (this.m_oAddRoomElement.parentNode === oTabsDiv)
			oTabsDiv.removeChild(this.m_oAddRoomElement);

		if (this.m_oAddPrivateChatElement.parentNode === oTabsDiv)
			oTabsDiv.removeChild(this.m_oAddPrivateChatElement);

		oCancelIcon.style.display = "none";
	}
	else
	{
		oTabsDiv.appendChild(this.m_oAddRoomElement);
		oTabsDiv.appendChild(this.m_oAddPrivateChatElement);
		oCancelIcon.style.display = "block";
	}

	this.private_CheckScrollVisibility();
};
CVisualChatTabsPanel.prototype.OnAddChatRoom = function()
{
	this.OnInputChange();
};
CVisualChatTabsPanel.prototype.OnRemoveChatRoom = function()
{
	this.OnInputChange();
};
CVisualChatTabsPanel.prototype.private_InitBottomPanel = function(oParent, oParentControl)
{
	oParent.style.borderTop  = "1px solid rgb(190, 190, 190)";
	oParent.style.background = "rgb(243, 243, 243)";

	var sUsers      = g_oLocalization.mainRoom.statistics.users;
	var sGames      = g_oLocalization.mainRoom.statistics.games;
	var sChallenges = g_oLocalization.mainRoom.statistics.challenges;
	var sStatistics = g_oLocalization.mainRoom.statistics.label;

	g_oTextMeasurer.SetFont("14px 'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif");

	var nLeftWidth = Math.max(g_oTextMeasurer.Measure(sUsers), g_oTextMeasurer.Measure(sGames), g_oTextMeasurer.Measure(sChallenges));
	nLeftWidth += 20 + 5;
	var nHeaderHeight = 20;

	var oElement, oControl, oDiv;

	oElement = this.private_CreateDiv(oParent);
	oControl = CreateControlContainerByElement(oElement);
	oControl.SetParams(nLeftWidth, nHeaderHeight, 1000, 1000, true, true, false, false, -1, -1);
	oControl.SetAnchor(true, true, true, true);
	oParentControl.AddControl(oControl);

	oDiv = document.createElement("div");
	oDiv.className = "roomStats";
	oDiv.innerHTML = "0";
	oElement.appendChild(oDiv);
	this.m_oElementUsers = oDiv;

	oDiv = document.createElement("div");
	oDiv.className = "roomStats";
	oDiv.innerHTML = "0";
	oElement.appendChild(oDiv);
	this.m_oElementGames = oDiv;

	oDiv = document.createElement("div");
	oDiv.className = "roomStats";
	oDiv.innerHTML = "0";
	oElement.appendChild(oDiv);
	this.m_oElementChallenges = oDiv;

	oElement = this.private_CreateDiv(oParent);
	oControl = CreateControlContainerByElement(oElement);
	oControl.SetParams(20, nHeaderHeight, 1000, 1000, true, true, false, false, nLeftWidth - 20, -1);
	oControl.SetAnchor(true, true, false, true);
	oParentControl.AddControl(oControl);

	oDiv = document.createElement("div");
	oDiv.className = "roomStats";
	oDiv.innerHTML = sUsers;
	oElement.appendChild(oDiv);

	oDiv = document.createElement("div");
	oDiv.className = "roomStats";
	oDiv.innerHTML = sGames;
	oElement.appendChild(oDiv);

	oDiv = document.createElement("div");
	oDiv.className = "roomStats";
	oDiv.innerHTML = sChallenges;
	oElement.appendChild(oDiv);

	oElement = this.private_CreateDiv(oParent);
	oControl = CreateControlContainerByElement(oElement);
	oControl.SetParams(10, 0, 1000, 1000, true, false, false, false, -1, nHeaderHeight);
	oControl.SetAnchor(true, true, true, true);
	oParentControl.AddControl(oControl);

	oDiv = document.createElement("div");
	oDiv.className = "roomStats";
	oDiv.style.fontWeight = "bold";
	oDiv.innerHTML = sStatistics;
	oElement.appendChild(oDiv);
};
CVisualChatTabsPanel.prototype.UpdateStats = function(nUsers, nGames, nChallenges)
{
	this.m_oElementUsers.innerHTML      = "" + nUsers;
	this.m_oElementGames.innerHTML      = "" + nGames;
	this.m_oElementChallenges.innerHTML = "" + nChallenges;
};
CVisualChatTabsPanel.prototype.OnResize = function()
{
	this.private_CheckScrollVisibility();
};
CVisualChatTabsPanel.prototype.ScrollChatTabsToCurrentTab = function()
{
	var nChatRoomId = this.m_oChatTabs.GetCurrentId();
	var oTab        = this.m_oChatTabs.GetTab(nChatRoomId);
	if (!oTab)
		return;

	var oTabDiv = oTab.m_oTabDiv;
	var nOffsetTop = oTabDiv.offsetTop;

	var nLine = parseInt((nOffsetTop + 1) / 25);

	this.m_oElementTabs.scrollTop = nLine * 25;

	this.m_oChatTabsScroll.UpdatePosition();
};
CVisualChatTabsPanel.prototype.private_CheckScrollVisibility = function()
{
	var isHidden = this.m_oChatTabsScroll.IsHidden();

	this.m_oChatTabsScroll.CheckVisibility();

	if (isHidden !== this.m_oChatTabsScroll.IsHidden())
	{
		this.m_oChatTabs.OnScrollShowHide(!this.m_oChatTabsScroll.IsHidden());
	}
};