"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     01.06.2016
 * Time     23:30
 */

function CKGSClient()
{
	this.m_bLoggedIn      = false;
	this.m_aGames         = {};
	this.m_aFriends       = [];
	this.m_aRooms         = {};
	this.m_sUserName      = "";
	this.m_nChatChannelId = -1;
	this.m_aAllRooms      = {};
	this.m_oRoomCategory  = {};
	this.m_oPrivateChats  = {};
	this.m_oUserInfo      = {}; // Список открытых окон с информацией пользователя
}
CKGSClient.prototype.GetUserName = function()
{
	return this.m_sUserName;
};
CKGSClient.prototype.Connect = function(sLogin, sPassword, sLocale)
{
	this.private_SendMessage({
		"type"     : "LOGIN",
		"name"     : sLogin,
		"password" : sPassword,
		"locale"   : sLocale ? sLocale : "en-US"
	});
};
CKGSClient.prototype.ConnectAsGuest = function()
{

};
CKGSClient.prototype.Disconnect = function()
{
	this.private_SendMessage({
		"type" : "LOGOUT"
	});
};
CKGSClient.prototype.EnterToGameRoom = function(nGameRoomId)
{
	this.private_SendMessage({
		"type"      : "JOIN_REQUEST",
		"channelId" : nGameRoomId
	});
};
CKGSClient.prototype.LeaveGameRoom = function(nGameRoomId)
{
	this.private_SendMessage({
		"type"      : "UNJOIN_REQUEST",
		"channelId" : nGameRoomId
	});
};
CKGSClient.prototype.EnterChatRoom = function(nChatRoomId)
{
	this.private_SendMessage({
		"type"      : "ROOM_DESC_REQUEST",
		"channelId" : nChatRoomId
	});

	this.private_SendMessage({
		"type"      : "JOIN_REQUEST",
		"channelId" : nChatRoomId
	});
};
CKGSClient.prototype.LeaveChatRoom = function(nChatRoomId)
{
	if (this.m_oPrivateChats[nChatRoomId])
		delete this.m_oPrivateChats[nChatRoomId];

	if (this.m_aRooms[nChatRoomId])
		delete this.m_aRooms[nChatRoomId];

	this.private_SendMessage({
		"type"      : "UNJOIN_REQUEST",
		"channelId" : nChatRoomId
	});
};
CKGSClient.prototype.SendChatMessage = function(sText)
{
	this.private_SendMessage({
		"type"      : "CHAT",
		"channelId" : this.m_nChatChannelId,
		"text"      : sText
	});
};
CKGSClient.prototype.LoadUserInfo = function(sUserName)
{
	// TODO: Сделать обертку для КГС-клиента, и туда пихать все окна, а не в <body>
	this.m_oUserInfo[sUserName] = {
		Window         : CreateKGSWindow(EKGSWindowType.UserInfo, {UserName : sUserName, Client : this}),
		UserName       : sUserName,
		DetailsChannel : -1,
		ArchiveChannel : -1
	};

	this.private_SendMessage({
		"type" : "DETAILS_JOIN_REQUEST",
		"name" : sUserName
	});

	this.private_SendMessage({
		"type" : "JOIN_ARCHIVE_REQUEST",
		"name" : sUserName
	});
};
CKGSClient.prototype.CloseUserInfo = function(sUserName)
{
	if (this.m_oUserInfo[sUserName])
	{

		if (-1 !== this.m_oUserInfo[sUserName].DetailsChannel)
		{
			this.private_SendMessage({
				"type"      : "UNJOIN_REQUEST",
				"channelId" : this.m_oUserInfo[sUserName].DetailsChannel
			});
		}

		if (-1 !== this.m_oUserInfo[sUserName].ArchiveChannel)
		{
			this.private_SendMessage({
				"type"      : "UNJOIN_REQUEST",
				"channelId" : this.m_oUserInfo[sUserName].ArchiveChannel
			});
		}

		if (this.m_oUserInfo[sUserName].Window)
		{
			RemoveWindow(this.m_oUserInfo[sUserName].Window);
		}

		delete this.m_oUserInfo[sUserName];
	}
};
CKGSClient.prototype.SetCurrentChatRoom = function(nChatRoomId)
{
	this.m_nChatChannelId = nChatRoomId;
	this.private_UpdatePlayersList();
};
CKGSClient.prototype.EnterPrivateChat = function(sUserName)
{
	this.private_SendMessage({
		"type"        : "CONVO_REQUEST",
		"callbackKey" : 12345,
		"name"        : sUserName
	});
};
CKGSClient.prototype.GetRoomName = function(nRoomId)
{
	if (this.m_aAllRooms[nRoomId] && "" !== this.m_aAllRooms[nRoomId].Name)
		return this.m_aAllRooms[nRoomId].Name;

	return "Global";
};
CKGSClient.prototype.GetAllRooms = function()
{
	return this.m_aAllRooms;
};
CKGSClient.prototype.GetCategoryName = function(nCategoryId)
{
	return this.m_oRoomCategory[nCategoryId];
};
CKGSClient.prototype.private_SendMessage = function(oMessage)
{
	// console.log("Send:");
	// console.log(oMessage);
	// console.log(new Date().toString());

	var oThis = this;
	var req = new XMLHttpRequest();
	req.onreadystatechange = function()
	{
		if (req.readyState == 4)
		{
			if (req.status == 200)
			{
				console.log("Upload success: type = " + oMessage.type);
				if (oMessage.type == "LOGIN")
				{
					// After our login message has been sent, we kick off the first download operation to see the result.
					// After this first download call, each download will automatically trigger the next,
					// so we won't need to call this again.
					oThis.m_bLoggedIn = true;
					oThis.private_RecieveMessage();
				}
			}
			else
			{
				// Upload failed. We'll just report it to the user. This is to help debugging, in a finished client you would
				// want to hide this.
				// The responseText is a big error page from your JSP system, but all KGS error messages have the format
				// ":KGS: error text :KGS:", which makes it easy to extract that with a regex. If the error is in that format,
				// we extract the error; otherwise we show the whole report.
				var errorText = req.responseText;
				var matcher = /:KGS: (.*?) :KGS:/.exec(errorText);
				if (matcher) {
					errorText = matcher[1];
				}
				console.log("Error : " + errorText);
			}
		}
	};
	req.open("POST", "http://metakgs.org/api/access", true);
	req.setRequestHeader("content-type", "application/json;charset=UTF-8"); // Make sure Unicode is used.
	req.send(this.private_TranslateUnicodeMessage(JSON.stringify(oMessage)));
};
CKGSClient.prototype.private_RecieveMessage = function()
{
	var oThis = this;
	var req = new XMLHttpRequest();
	req.onreadystatechange = function()
	{
		if (req.readyState == 4)
		{
			if (req.status == 200)
			{
				// We have a valid response! Turn it into a javascript object.
				var response = JSON.parse(req.responseText);
				if (response.messages)
				{
					// After 1 minute with no message, we'll time out and get an "empty" response. We only want to do the
					// forEach here if the response has content.
					for (var nIndex = 0, nCount = response.messages.length; nIndex < nCount; ++nIndex)
					{
						oThis.private_HandleMessage(response.messages[nIndex]);
					}
				}

				if (oThis.m_bLoggedIn)
				{
					oThis.private_RecieveMessage();
				}
			}
			else
			{
				console.log("Download failure: Status = " + req.status + ", response text = " + req.responseText);
				oThis.m_bLoggedIn = false;
				OnLogout("Server is unavaliable. Try again later.");
			}
		}
	};
	req.open("GET", "http://metakgs.org/api/access", true);
	req.send();
};
CKGSClient.prototype.private_HandleMessage = function(oMessage)
{
	// console.log("Receive:");
	// console.log(oMessage);
	// console.log(new Date().toString());

	if (oMessage.type == "LOGOUT")
	{
		this.private_HandleLogout(oMessage);
	}
	else if ("HELLO" === oMessage.type)
	{
		this.private_HandleHello(oMessage);
	}
	else if ("LOGIN_SUCCESS" === oMessage.type)
	{
		this.private_HandleLoginSuccess(oMessage);
	}
	else if ("ROOM_NAMES" === oMessage.type)
	{
		this.private_HandleRoomNames(oMessage);
	}
	else if ("ROOM_JOIN" === oMessage.type)
	{
		this.private_HandleRoomJoin(oMessage);
	}
	else if ("GAME_JOIN" === oMessage.type)
	{
		this.private_HandleGameJoin(oMessage);
	}
	else if ("GAME_UPDATE" === oMessage.type)
	{
		this.private_HandleGameUpdate(oMessage);
	}
	else if ("CHAT" === oMessage.type)
	{
		this.private_HandleChat(oMessage);
	}
	else if ("USER_ADDED" === oMessage.type)
	{
		this.private_HandleUserAdded(oMessage);
	}
	else if ("USER_REMOVED" === oMessage.type)
	{
		this.private_HandleUserRemoved(oMessage);
	}
	else if ("GAME_CONTAINER_REMOVE_GAME" === oMessage.type)
	{
		this.private_HandleGameContainerRemoveGame(oMessage);
	}
	else if ("GAME_LIST" === oMessage.type)
	{
		this.private_HandleGameList(oMessage);
	}
	else if ("USER_UPDATE" === oMessage.type)
	{
		this.private_HandleUserUpdate(oMessage);
	}
	else if ("JOIN_COMPLETE" === oMessage.type)
	{
		this.private_HandleJoinComplete(oMessage);
	}
	else if ("DETAILS_JOIN" === oMessage.type)
	{
		this.private_HandleDetailsJoin(oMessage);
	}
	else if ("UNJOIN" === oMessage.type)
	{
		this.private_HandleUnjoin(oMessage);
	}
	else if ("ROOM_DESC" === oMessage.type)
	{
		this.private_HandleRoomDesc(oMessage);
	}
	else if ("GLOBAL_GAMES_JOIN" === oMessage.type)
	{
		this.private_HandleGlobalGamesJoin(oMessage);
	}
	else if ("LOGIN_FAILED_BAD_PASSWORD" === oMessage.type)
	{
		this.private_HandleLoginFailedBadPassword(oMessage);
	}
	else if ("LOGIN_FAILED_NO_SUCH_USER" === oMessage.type)
	{
		this.private_HandleLoginFailedNoSuchUser(oMessage);
	}
	else if ("CONVO_JOIN" === oMessage.type)
	{
		this.private_HandleConvoJoin(oMessage);
	}
	else if ("ARCHIVE_JOIN" === oMessage.type)
	{
		this.private_HandleArchiveJoin(oMessage);
	}
	else
	{
		console.log(oMessage);
	}
};
CKGSClient.prototype.private_HandleLogout = function(oMessage)
{
	this.m_bLoggedIn = false;
	OnLogout(oMessage.text);
};
CKGSClient.prototype.private_HandleHello = function(oMessage)
{
	// Ничего не делаем
};
CKGSClient.prototype.private_HandleRoomNames = function(oMessage)
{
	if (!oMessage.rooms || oMessage.rooms.length <= 0)
		return;

	for (var nIndex = 0, nCount = oMessage.rooms.length; nIndex < nCount; ++nIndex)
	{
		var oRoom = this.m_aAllRooms[oMessage.rooms[nIndex].channelId];
		if (undefined !== oRoom)
		{
			oRoom.Name            = oMessage.rooms[nIndex].name;
			oRoom.Private         = undefined !== oMessage.rooms[nIndex].private ? oMessage.rooms[nIndex].private : false;
			oRoom.TournamentOnly  = undefined !== oMessage.rooms[nIndex].tournOnly ? oMessage.rooms[nIndex].tournOnly : false;
			oRoom.GlobalGamesOnly = undefined !== oMessage.rooms[nIndex].globalGamesOnly ? oMessage.rooms[nIndex].globalGamesOnly : false;
		}
	}

	GamesListView.Update();
};
CKGSClient.prototype.private_HandleRoomJoin = function(oMessage)
{
	this.m_aRooms[oMessage.channelId] = 1;

	EnterChatRoom(oMessage.channelId, this.m_aAllRooms[oMessage.channelId].Name, false);
	if (null === CurrentChatTab)
	{
		this.m_nChatChannelId = oMessage.channelId;
		OnPanelChatTabClick(oMessage.channelId);
	}

	var Games = oMessage.games;
	if (Games && Games.length > 0)
	{
		for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
		{
			var oEntry = Games[Pos];
			this.private_HandleGameRecord(oEntry, true);
		}
		GamesListView.Update_Size();
		GamesListView.Update();
	}

	var oRoom = this.m_aAllRooms[oMessage.channelId];
	if (oRoom)
	{
		oRoom.Users = {};

		var Users = oMessage.users;
		if (Users && Users.length > 0)
		{
			for (var Pos = 0, Count = oMessage.users.length; Pos < Count; ++Pos)
			{
				var oUserRecord = Users[Pos];
				this.private_HandleUserRecord(oUserRecord, oRoom);
			}
		}
	}

	this.private_UpdatePlayersList();
};
CKGSClient.prototype.private_HandleLoginSuccess = function(oMessage)
{
	this.m_sUserName = oMessage.you.name;

	var Friends = oMessage.friends;
	if (Friends)
	{
		for (var Pos = 0, Count = Friends.length; Pos < Count; ++Pos)
		{
			this.m_aFriends[Friends[Pos].user.name] = 1;
		}
	}

	this.private_SendMessage({
		"type" : "GLOBAL_LIST_JOIN_REQUEST",
		"list" : "ACTIVES"
	});

	var oRoomCategoryId = oMessage.roomCategoryChannelIds;
	for (var sCategoryId in oRoomCategoryId)
	{
		this.m_oRoomCategory[oRoomCategoryId[sCategoryId]] = sCategoryId;
	}

	var arrAllRoomChannelIds = [];
	var arrRooms = oMessage.rooms;
	for (var nIndex = 0, nCount = arrRooms.length; nIndex < nCount; ++nIndex)
	{
		var nChannelId  = arrRooms[nIndex].channelId;
		var sCategory   = arrRooms[nIndex].category;
		var nCategoryId = oRoomCategoryId[sCategory] ? oRoomCategoryId[sCategory] : -1;

		this.m_aAllRooms[nChannelId] = {
			ChannelId       : nChannelId,
			Category        : nCategoryId,
			CategoryName    : sCategory,
			Name            : "",
			GreetingMessage : "",
			PrivateChat     : false,
			Private         : false,
			TournamentOnly  : false,
			GlobalGamesOnly : false,
			Users           : [],
			Games           : []
		};

		arrAllRoomChannelIds.push(nChannelId);
	}

	this.private_SendMessage({
		"type"  : "ROOM_NAMES_REQUEST",
		"rooms" : arrAllRoomChannelIds
	});

	OnConnect();
};
CKGSClient.prototype.private_HandleGameRecord = function(oGameRecord, bAdd)
{
	if ("challenge" === oGameRecord.gameType)
		return;

	var nGameId     = oGameRecord.channelId;
	var sGameType   = "";
	var nMoveNumber = oGameRecord.moveNum;
	var nObservers  = undefined !== oGameRecord.observers ? oGameRecord.observers : 0;
	var sComment    = oGameRecord.score ? oGameRecord.score : "";
	var nAdd        = true === bAdd ? 0 : 1;
	var sBlack      = oGameRecord.players.black ? oGameRecord.players.black.name : "";
	var nBlackR     = oGameRecord.players.black ? this.private_GetRank(oGameRecord.players.black.rank) : -3;
	var sWhite      = oGameRecord.players.white ? oGameRecord.players.white.name : "";
	var nWhiteR     = oGameRecord.players.white ? this.private_GetRank(oGameRecord.players.white.rank) : -3;
	var bPrivate    = true === oGameRecord.private ? true : false;
	var nRoomId     = oGameRecord.roomId;
	var bAdjourned  = oGameRecord.adjourned ? oGameRecord.adjourned : false;
	var bEvent      = oGameRecord.event ? oGameRecord.event : false;
	var bDemo       = false;

	if ("demonstration" === oGameRecord.gameType)
	{
		sGameType = "D";
		sComment  = "";
		sWhite    = oGameRecord.players.owner.name;
		nWhiteR   = oGameRecord.players.owner && oGameRecord.players.owner.rank ? this.private_GetRank(oGameRecord.players.owner.rank) : -3;
		bDemo     = true;
	}
	else if ("review" === oGameRecord.gameType || "rengo_review" === oGameRecord.gameType)
	{
		sGameType = "D";
		sComment = "";

		sWhite    = oGameRecord.players.owner.name;

		if (oGameRecord.players.black && oGameRecord.players.black.name && oGameRecord.players.white && oGameRecord.players.white.name)
			sWhite += " review (" + oGameRecord.players.white.name + " vs. " + oGameRecord.players.black.name + ")";

		nWhiteR   = oGameRecord.players.owner && oGameRecord.players.owner.rank ? this.private_GetRank(oGameRecord.players.owner.rank) : -3;
		bDemo     = true;
	}
	else if ("free" === oGameRecord.gameType)
		sGameType = "F";
	else if ("ranked" === oGameRecord.gameType)
		sGameType = "R";
	else if ("teaching" === oGameRecord.gameType)
		sGameType = "T";
	else if ("simul" === oGameRecord.gameType)
		sGameType = "S";
	else if ("rengo" === oGameRecord.gameType)
		sGameType = "2";
	else if ("tournament" === oGameRecord.gameType)
		sGameType = "*";

	if (true === bPrivate)
		sGameType = "P";

	GamesListView.Handle_Record([nAdd, nGameId, sGameType, nObservers, "", sWhite, nWhiteR, "", sBlack, nBlackR, sComment, nMoveNumber, bPrivate, nRoomId, bAdjourned, bEvent, bDemo]);
};
CKGSClient.prototype.private_HandleUserRecord = function(oUserRecord, oRoom)
{
	oRoom.Users[oUserRecord.name] = {
		Name   : oUserRecord.name,
		Rank   : this.private_GetRank(oUserRecord.rank),
		Friend : this.private_IsFriend(oUserRecord.name)
	};
};
CKGSClient.prototype.private_HandleGameJoin = function(oMessage)
{
	var GameRoomId = oMessage.channelId;
	var oGame = {
		GameRoomId : GameRoomId,
		GameTree   : null,
		Nodes      : {},
		CurNode    : null
	};

	this.m_aGames[GameRoomId] = oGame;

	var nSize      = oMessage.gameSummary.size | 0;
	var sBlackName = oMessage.gameSummary.players.black && oMessage.gameSummary.players.black.name ? oMessage.gameSummary.players.black.name : "-";
	var sBlackRank = oMessage.gameSummary.players.black && oMessage.gameSummary.players.black.rank ? oMessage.gameSummary.players.black.rank : "-";
	var sWhiteName = oMessage.gameSummary.players.white && oMessage.gameSummary.players.white.name ? oMessage.gameSummary.players.white.name : "-";
	var sWhiteRank = oMessage.gameSummary.players.white && oMessage.gameSummary.players.white.rank ? oMessage.gameSummary.players.white.rank : "-";

	var sSGF = "(;FF[4]";
	sSGF += "SZ[" + nSize + "]";
	sSGF += "PB[" + sBlackName + "]";
	sSGF += "PW[" + sWhiteName + "]";
	sSGF += "WR[" + sWhiteRank + "]";
	sSGF += "BR[" + sBlackRank + "]";
	sSGF += ")";

	if ("" === sBlackName && "" === sWhiteName && oMessage.gameSummary.players.owner)
		EnterGameRoom2(GameRoomId, sSGF, null, "", "", oMessage.gameSummary.players.owner.name, "");
	else
		EnterGameRoom2(GameRoomId, sSGF, null, sBlackName, sBlackRank, sWhiteName, sWhiteRank);

	var oTab = GetTabByRoomId(GameRoomId);
	if (!oTab)
		return;

	var oGameTree = oTab.GameTree;
	oGame.GameTree = oGameTree;

	var oCurNode = this.private_ReadSgfEvents(oGame, oMessage.sgfEvents);
	if (!oCurNode)
		oCurNode = oGameTree.Get_FirstNode();

	oGameTree.GoTo_Node(oCurNode);
	oGame.CurNode  = oCurNode;
	oGameTree.Set_GameCurNode(oCurNode);

	if (oGameTree.m_oDrawingNavigator)
	{
		oGameTree.m_oDrawingNavigator.Create_FromGameTree();
		oGameTree.m_oDrawingNavigator.Update();
		oGameTree.m_oDrawingNavigator.Update_Current(true);
		oGameTree.m_oDrawingNavigator.Update_GameCurrent();
	}
};
CKGSClient.prototype.private_HandleGameUpdate = function(oMessage)
{
	var GameRoomId = oMessage.channelId;
	var oGame = this.m_aGames[GameRoomId];
	var oGameTree = oGame.GameTree;

	var oCurNode = oGame.CurNode;

	var bGoToNode = oCurNode === oGameTree.Get_CurNode();

	oCurNode = this.private_ReadSgfEvents(oGame, oMessage.sgfEvents);

	if (oCurNode)
	{
		if (bGoToNode)
			oGameTree.GoTo_Node(oCurNode);

		oGame.CurNode = oCurNode;
		oGameTree.Set_GameCurNode(oCurNode);
	}
	else
	{
		if (bGoToNode)
			oGameTree.Execute_CurNodeCommands();
	}

	if (oGameTree.m_oDrawingNavigator)
	{
		oGameTree.m_oDrawingNavigator.Create_FromGameTree();
		oGameTree.m_oDrawingNavigator.Update();
		oGameTree.m_oDrawingNavigator.Update_Current(true);
		oGameTree.m_oDrawingNavigator.Update_GameCurrent();
	}
};
CKGSClient.prototype.private_HandleChat = function(oMessage)
{
	OnAddChatMessage(oMessage.channelId, oMessage.user.name, oMessage.text);
};
CKGSClient.prototype.private_HandleUserAdded = function(oMessage)
{
	var oRoom = this.m_aAllRooms[oMessage.channelId];
	if (oRoom)
		this.private_HandleUserRecord(oMessage.user, oRoom);

	if (oMessage.channelId === this.m_nChatChannelId)
	{
		PlayersListView.Update_Size();
		PlayersListView.Update();
	}
};
CKGSClient.prototype.private_HandleUserRemoved = function(oMessage)
{
	if (!oMessage || !oMessage.user || !oMessage.user.name)
		return;

	var oRoom = this.m_aAllRooms[oMessage.channelId];
	if (oRoom)
		delete oRoom.Users[oMessage.user.name];


	if (oMessage.channelId === this.m_nChatChannelId)
	{
		PlayersListView.Update_Size();
		PlayersListView.Update();
	}
};
CKGSClient.prototype.private_HandleGameList = function(oMessage)
{
	var Games = oMessage.games;
	for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
	{
		var oEntry = Games[Pos];
		this.private_HandleGameRecord(oEntry, true);
	}
	GamesListView.Update_Size();
	GamesListView.Update();
};
CKGSClient.prototype.private_HandleGameContainerRemoveGame = function(oMessage)
{
	GamesListView.Handle_Record([1, oMessage.gameId]);
	GamesListView.Update_Size();
	GamesListView.Update();
};
CKGSClient.prototype.private_HandleUserUpdate = function(oMessage)
{
	// TODO: Реализовать
};
CKGSClient.prototype.private_HandleJoinComplete = function(oMessage)
{
	if (this.m_aRooms[oMessage.channelId])
	{
		var oRoom = this.m_aAllRooms[oMessage.channelId];
		AddRoomGreetingMessage(oMessage.channelId, oRoom.GreetingMessage);
	}
};
CKGSClient.prototype.private_HandleDetailsJoin = function(oMessage)
{
	var sUserName = oMessage.user.name;
	if (this.m_oUserInfo[sUserName])
	{
		this.m_oUserInfo[sUserName].DetailsChannel = oMessage.channelId;
		this.m_oUserInfo[sUserName].Window.OnUserDetails(oMessage);
	}
	else
	{
		if (-1 !== this.m_oUserInfo[sUserName].DetailsChannel)
		{
			this.private_SendMessage({
				"type"      : "UNJOIN_REQUEST",
				"channelId" : oMessage.channelId
			});
		}
	}
};
CKGSClient.prototype.private_HandleUnjoin = function(oMessage)
{
	// Ничего не делаем
};
CKGSClient.prototype.private_HandleRoomDesc = function(oMessage)
{
	if (this.m_aAllRooms[oMessage.channelId])
	{
		var oRoom = this.m_aAllRooms[oMessage.channelId];
		oRoom.GreetingMessage = oMessage.description;
		oRoom.Owners = [];

		for (var nIndex = 0, nCount = oMessage.owners.length; nIndex < nCount; ++nIndex)
		{
			oRoom.Owners.push(oMessage.owners[nIndex].name);
		}

		if (this.m_aRooms[oMessage.channelId])
		{
			var oRoom = this.m_aAllRooms[oMessage.channelId];
			AddRoomGreetingMessage(oMessage.channelId, oRoom.GreetingMessage);
		}
	}
};
CKGSClient.prototype.private_HandleGlobalGamesJoin = function(oMessage)
{
	var Games = oMessage.games;
	for (var Pos = 0, Count = Games.length; Pos < Count; ++Pos)
	{
		var oEntry = Games[Pos];
		this.private_HandleGameRecord(oEntry, true);
	}
	GamesListView.Update_Size();
	GamesListView.Update();
};
CKGSClient.prototype.private_HandleLoginFailedBadPassword = function(oMessage)
{
	this.m_bLoggedIn = false;
	OnLogout("Login or password is incorrect.");
};
CKGSClient.prototype.private_HandleLoginFailedNoSuchUser = function(oMessage)
{
	this.m_bLoggedIn = false;
	OnLogout("Login or password is incorrect.");
};
CKGSClient.prototype.private_HandleConvoJoin = function(oMessage)
{
	var nChannelId = oMessage.channelId;
	var sUserName  = oMessage.user.name;

	this.m_oPrivateChats[nChannelId] = {
		ChannelId       : nChannelId,
		Name            : sUserName,
		Users           : {}
	};

	this.private_HandleUserRecord({name : this.GetUserName(), rank : undefined}, this.m_oPrivateChats[nChannelId]);
	this.private_HandleUserRecord(oMessage.user, this.m_oPrivateChats[nChannelId]);

	EnterChatRoom(nChannelId, sUserName + "(P)", true);
};
CKGSClient.prototype.private_HandleArchiveJoin = function(oMessage)
{
	var sUserName = oMessage.user.name;
	if (this.m_oUserInfo[sUserName])
	{
		this.m_oUserInfo[sUserName].ArchiveChannel = oMessage.channelId;
		this.m_oUserInfo[sUserName].Window.OnUserGameArchive(oMessage);
	}
	else
	{
		if (-1 !== this.m_oUserInfo[sUserName].ArchiveChannel)
		{
			this.private_SendMessage({
				"type"      : "UNJOIN_REQUEST",
				"channelId" : oMessage.channelId
			});
		}
	}
};
CKGSClient.prototype.private_GetRank = function(sRank)
{
	if (!sRank)
		return -1;

	if (-1 !== sRank.indexOf("k"))
	{
		var nValue = Math.max(1, Math.min(30, parseInt(sRank)));
		return 30 - nValue;
	}
	else if (-1 !== sRank.indexOf("d"))
	{
		var nValue = Math.max(1, Math.min(20, parseInt(sRank)));
		return nValue + 29;
	}
	else if (-1 !== sRank.indexOf("p"))
	{
		var nValue = Math.max(1, parseInt(sRank));
		return nValue + 49;
	}
	else if (-1 !== sRank.indexOf("-"))
	{
		return -1;
	}

	return -2;
};
CKGSClient.prototype.private_IsFriend = function(sUserName)
{
	if (1 === this.m_aFriends[sUserName])
		return true;

	return false;
};
CKGSClient.prototype.private_TranslateUnicodeMessage = function(sMessage)
{
	var sUnicode = "";
	for (var nCharIndex = 0, nCount = sMessage.length; nCharIndex < nCount; ++nCharIndex)
	{
		var nCharCode = sMessage.charCodeAt(nCharIndex);
		if (nCharCode < 128)
			sUnicode += sMessage.charAt(nCharIndex);
		else
			sUnicode += escape(sMessage.charAt(nCharIndex)).replace("%", "\\")
	}
	return sUnicode;
};
CKGSClient.prototype.private_ReadSgfEvents = function(oGame, arrSgfEvents)
{
	var oGameTree      = oGame.GameTree;
	var oNode          = null;
	var oActivatedNode = null;
	for (var nIndex = 0, nCount = arrSgfEvents.length; nIndex < nCount; ++nIndex)
	{
		var sgfEvent = arrSgfEvents[nIndex];

		var sNodeId = sgfEvent.nodeId;
		if (!oGame.Nodes[sNodeId])
		{
			// Сюда мы должны попадать ровно 1 раз в самом начале с самой первой нодой
			oGame.Nodes[sNodeId] = oGameTree.Get_FirstNode();
		}

		oNode = oGame.Nodes[sNodeId];
		if (!oNode)
			continue;

		if ("PROP_GROUP_ADDED" === sgfEvent.type)
		{
			var oProps = sgfEvent.props;
			for (var nPropsIndex = 0, nPropsCount = oProps.length; nPropsIndex < nPropsCount; ++nPropsIndex)
			{
				private_ReadProp(oProps[nPropsIndex]);
			}
		}
		else if ("PROP_ADDED" === sgfEvent.type)
		{
			private_ReadProp(sgfEvent.prop);
		}
		else if ("CHILD_ADDED" === sgfEvent.type)
		{
			var oNewNode = new CNode(oGameTree);
			oNode.Add_Next(oNewNode, true);
			oGame.Nodes[sgfEvent.childNodeId] = oNewNode;
		}
		else if ("ACTIVATED" === sgfEvent.type)
		{
			if (oGame.Nodes[sgfEvent.nodeId])
				oActivatedNode = oGame.Nodes[sgfEvent.nodeId];
		}
		else if ("PROP_CHANGED" === sgfEvent.type)
		{
			private_ReadProp(sgfEvent.prop);
		}
		else
		{
			console.log(sgfEvent);
		}
	}

	function private_ReadProp(oProp)
	{
		if ("MOVE" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;

			if ("black" === oProp.color)
				oNode.Add_Move(nX, nY, BOARD_BLACK);
			else if ("white" === oProp.color)
				oNode.Add_Move(nX, nY, BOARD_WHITE);
		}
		else if ("ADDSTONE" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;

			if ("black" === oProp.color)
				oNode.AddOrRemove_Stones(BOARD_BLACK, [Common_XYtoValue(nX, nY)]);
			else if ("white" === oProp.color)
				oNode.AddOrRemove_Stones(BOARD_WHITE, [Common_XYtoValue(nX, nY)]);
			else if ("empty" === oProp.color)
				oNode.AddOrRemove_Stones(BOARD_EMPTY, [Common_XYtoValue(nX, nY)]);
		}
		else if ("COMMENT" === oProp.name)
		{
			oNode.Add_Comment(oProp.text);
		}
		else if ("RULES" === oProp.name)
		{
			if (oProp.size)
				oGameTree.Set_BoardSize(oProp.size, oProp.size);

			if (oProp.komi)
				oGameTree.Set_Komi(oProp.komi);

			if (oProp.rules)
				oGameTree.Set_Rules(oProp.rules);

			if (oProp.handicap)
				oGameTree.Set_Handicap(oProp.handicap);

			// TODO: РЕализовать TimeSystem
		}
		else if ("PLAYERNAME" === oProp.name)
		{
			if ("white" === oProp.color)
				oGameTree.Set_White(oProp.text);
			else if ("black" === oProp.color)
				oGameTree.Set_Black(oProp.text);
		}
		else if ("PLAYERRANK" === oProp.name)
		{
			if ("white" === oProp.color)
				oGameTree.Set_WhiteRating(private_GetRank(oProp.int));
			else if ("black" === oProp.color)
				oGameTree.Set_BlackRating(private_GetRank(oProp.int));
		}
		else if ("DATE" === oProp.name)
		{
			if (oProp.text)
				oGameTree.Set_DateTime(oProp.text);
		}
		else if ("EVENT" === oProp.name)
		{
			if (oProp.text)
				oGameTree.Set_GameEvent(oProp.text);
		}
		else if ("ROUND" === oProp.name)
		{
			if (oProp.text)
				oGameTree.Set_GameRound(oProp.text);
		}
		else if ("PLACE" === oProp.name)
		{
			if (oProp.text)
				oGameTree.Set_GamePlace(oProp.text);
		}
		else if ("TIMELEFT" === oProp.name)
		{
			// TODO: Реализовать TimeSystem
		}
		else if ("TRIANGLE" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;
			oNode.Add_Mark(EDrawingMark.Tr, [Common_XYtoValue(nX, nY)]);
		}
		else if ("SQUARE" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;
			oNode.Add_Mark(EDrawingMark.Sq, [Common_XYtoValue(nX, nY)]);
		}
		else if ("LABEL" === oProp.name)
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;
			oNode.Add_TextMark(oProp.text, Common_XYtoValue(nX, nY));
		}
		else if ("PHANTOMCLEAR" === oProp.name)
		{
			// Нам это не нужно
		}
		else if ("GAMENAME" === oProp.name)
		{
			oGameTree.Set_GameName(oProp.text);
		}
		else if ("TERRITORY" === oProp.name)
		{
			oNode.Set_TerritoryForceUse(true);

			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;

			if ("black" === oProp.color)
				oNode.Add_TerritoryPoint(Common_XYtoValue(nX, nY), BOARD_BLACK);
			else if ("white" === oProp.color)
				oNode.Add_TerritoryPoint(Common_XYtoValue(nX, nY), BOARD_WHITE);
		}
		else if ("DEAD" === oProp.name)
		{
			// Нам это не нужно
		}
		else
		{
			console.log(oProp);
		}
	}

	function private_GetRank(nRank)
	{
		if (undefined === nRank || null === nRank)
			return "?";
		else if (nRank <= 30)
			return (31 - nRank) + "k";
		else if (nRank <= 39)
			return (nRank - 30) + "d";
		else
			return (nRank - 39) + "p";
	}

	return oActivatedNode;
};
CKGSClient.prototype.private_UpdatePlayersList = function()
{
	PlayersListView.Clear();

	var oChatRoom    = this.m_aAllRooms[this.m_nChatChannelId];
	var oPrivateChat = this.m_oPrivateChats[this.m_nChatChannelId];

	var oRoom = null;

	if (oChatRoom)
		oRoom = oChatRoom;
	else if (oPrivateChat)
		oRoom = oPrivateChat;

	if (oRoom)
	{
		for (var sUserName in oRoom.Users)
		{
			var oUser = oRoom.Users[sUserName];
			PlayersListView.Handle_Record([0, oUser.Name, oUser.Rank, oUser.Friend]);
		}
	}

	PlayersListView.Update_Size();
	PlayersListView.Update();
};