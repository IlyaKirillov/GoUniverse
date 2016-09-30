"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     30.08.2016
 * Time     1:54
 */

function CKGSGameRoom(oClient, nGameRoomId)
{
	this.m_oClient             = oClient;
	this.m_nGameRoomId         = nGameRoomId;
	this.m_oGameTree           = null;
	this.m_oNodes              = {};
	this.m_oNodesOrigin        = {};
	this.m_oCurNode            = null;
	this.m_oBlackTime          = new CTimeSettings();
	this.m_oWhiteTime          = new CTimeSettings();
	this.m_bDemo               = false;
	this.m_sResult             = null;
	this.m_oCommentsHandler    = null;
	this.m_oStateHandler       = null;
	this.m_oPlayersList        = new CListView();
	this.m_bEditor             = false;
	this.m_oBlack              = null;
	this.m_oWhite              = null;
	this.m_oOwner              = null;
	this.m_sWhiteAvatar        = "Files/DefaultUserWhite.png";
	this.m_sBlackAvatar        = "Files/DefaultUserBlack.png";
	this.m_bOurMove            = false;
	this.m_bCountScores        = false;
	this.m_bCommandInProgress  = false;
	this.m_nBlackScores        = 0;
	this.m_nWhiteScores        = 0;
	this.m_bBlackDone          = false;
	this.m_bWhiteDone          = false;
	this.m_nScoresDoneId       = -1;
}
CKGSGameRoom.prototype.GetRoomId = function()
{
	return this.m_nGameRoomId;
};
CKGSGameRoom.prototype.GetCurNode = function()
{
	return this.m_oCurNode;
};
CKGSGameRoom.prototype.GetGameTree = function()
{
	return this.m_oGameTree;
};
CKGSGameRoom.prototype.IsDemonstration = function()
{
	return this.m_bDemo;
};
CKGSGameRoom.prototype.GetBlackTime = function()
{
	return this.m_oBlackTime;
};
CKGSGameRoom.prototype.GetWhiteTime = function()
{
	return this.m_oWhiteTime;
};
CKGSGameRoom.prototype.GetBlackAvatarUrl = function()
{
	return this.m_sBlackAvatar;
};
CKGSGameRoom.prototype.GetWhiteAvatarUrl = function()
{
	return this.m_sWhiteAvatar;
};
CKGSGameRoom.prototype.GetPlayersListView = function()
{
	return this.m_oPlayersList;
};
CKGSGameRoom.prototype.GetResult = function()
{
	return this.m_sResult;
};
CKGSGameRoom.prototype.GetCommentsHandler = function()
{
	return this.m_oCommentsHandler;
};
CKGSGameRoom.prototype.SetStateHandler = function(oHandler)
{
	this.m_oStateHandler = oHandler;
};
CKGSGameRoom.prototype.SetCommentsHandler = function(oHandler)
{
	this.m_oCommentsHandler = oHandler;
};
CKGSGameRoom.prototype.InitGameTree = function(oGameSummary)
{
	var nSize      = oGameSummary.size | 0;
	var sBlackName = oGameSummary.players.black && oGameSummary.players.black.name ? oGameSummary.players.black.name : "-";
	var sBlackRank = oGameSummary.players.black && oGameSummary.players.black.rank ? oGameSummary.players.black.rank : "-";
	var sWhiteName = oGameSummary.players.white && oGameSummary.players.white.name ? oGameSummary.players.white.name : "-";
	var sWhiteRank = oGameSummary.players.white && oGameSummary.players.white.rank ? oGameSummary.players.white.rank : "-";

	var sSGF = "(;FF[4]";
	sSGF += "SZ[" + nSize + "]";
	sSGF += "PB[" + sBlackName + "]";
	sSGF += "PW[" + sWhiteName + "]";
	sSGF += "WR[" + sWhiteRank + "]";
	sSGF += "BR[" + sBlackRank + "]";
	sSGF += ")";

	var oGameTree = new CGameTree();
	oGameTree.Set_SoundClass(null);
	oGameTree.Load_Sgf(sSGF);
	oGameTree.Set_Black(sBlackName);
	oGameTree.Set_White(sWhiteName);
	oGameTree.Set_BlackRating(sBlackRank);
	oGameTree.Set_WhiteRating(sWhiteRank);

	if (oGameSummary.players.owner)
	{
		this.m_bDemo = true;
		oGameTree.Set_GameTranscriber(oGameSummary.players.owner.name + (oGameSummary.players.owner.rank ? "[" + oGameSummary.players.owner.rank + "]" : ""));
	}
	else
	{
		this.m_bDemo = false;
	}

	this.m_oGameTree = oGameTree;
};
CKGSGameRoom.prototype.SetPlayers = function(oGameRecord)
{
	if (oGameRecord)
	{
		this.m_oBlack = oGameRecord.GetBlack();
		this.m_oWhite = oGameRecord.GetWhite();
		this.m_oOwner = oGameRecord.GetOwner();

		var oBlackUser = this.m_oBlack;
		if (oBlackUser)
		{
			if (oBlackUser.HasAvatar())
				this.m_sBlackAvatar = "http://goserver.gokgs.com/avatars/" + oBlackUser.GetName() + ".jpg";
			else if (oBlackUser.IsRobot())
				this.m_sBlackAvatar = "Files/Robot.png";
			else
				this.m_sBlackAvatar = "Files/DefaultUserBlack.png";
		}

		var oWhiteUser = this.m_oWhite;
		if (oWhiteUser)
		{
			if (oWhiteUser.HasAvatar())
				this.m_sWhiteAvatar = "http://goserver.gokgs.com/avatars/" + oWhiteUser.GetName() + ".jpg";
			else if (oWhiteUser.IsRobot())
				this.m_sWhiteAvatar = "Files/Robot.png";
			else
				this.m_sWhiteAvatar = "Files/DefaultUserWhite.png";
		}


		if (true === this.IsPlayer())
		{
			this.private_OpponentMove();
			var oHandler = new CKGSMatchHandler(this.m_oClient, this);
			this.m_oGameTree.Set_Handler(oHandler);
		}
	}
};
CKGSGameRoom.prototype.UpdateClocks = function(oClocks, isStopUndfined)
{
	if (oClocks)
	{
		this.private_HandleGameClocks(oClocks);
	}
	else if (true === isStopUndfined)
	{
		this.m_oBlackTime.Stop();
		this.m_oWhiteTime.Stop();
	}
};
CKGSGameRoom.prototype.UpdateScores = function(oMessage)
{
	if (undefined === oMessage.whiteScore || undefined === oMessage.blackScore)
	{
		this.m_nBlackScores  = 0;
		this.m_nWhiteScores  = 0;
		this.m_bBlackDone    = false;
		this.m_bWhiteDone    = false;
		this.m_nScoresDoneId = -1;
	}
	else
	{
		this.m_nBlackScores  = oMessage.blackScore;
		this.m_nWhiteScores  = oMessage.whiteScore;
		this.m_bBlackDone    = true === oMessage.blackDoneSent ? true : false;
		this.m_bWhiteDone    = true === oMessage.whiteDoneSent ? true : false;
		this.m_nScoresDoneId = oMessage.doneId;

		if (this.m_bCountScores)
		{
			this.m_oGameTree.Get_Drawing().Update_Scores(this.m_nBlackScores, this.m_nWhiteScores);
			this.m_oGameTree.Get_Drawing().GoUniverseUpdateScoresDone(this.m_bWhiteDone, this.m_bBlackDone);
		}
	}
};
CKGSGameRoom.prototype.StopClocks = function()
{
	this.m_oBlackTime.Stop(true);
	this.m_oWhiteTime.Stop(true);
};
CKGSGameRoom.prototype.private_HandleGameClocks = function(oClocks)
{
	if (oClocks.black)
	{
		var oClock = oClocks.black;
		if (undefined !== oClock.periodsLeft)
		{
			if (0 === oClock.periodsLeft)
			{
				this.m_oBlackTime.CorrectMainTime(oClock.time);
			}
			else
			{
				this.m_oBlackTime.CorrectMainTime(0);
				this.m_oBlackTime.CorrectOverTime(oClock.time, oClock.periodsLeft);
			}
		}
		else if (undefined !== oClock.stonesLeft)
		{
			if (0 === oClock.stonesLeft)
			{
				this.m_oBlackTime.CorrectMainTime(oClock.time);
			}
			else
			{
				this.m_oBlackTime.CorrectMainTime(0);
				this.m_oBlackTime.CorrectOverTime(oClock.time, oClock.stonesLeft);
			}
		}
		else
		{
			this.m_oBlackTime.CorrectMainTime(oClock.time);
		}

		if (true === oClock.running && true !== oClock.paused)
		{
			this.m_oBlackTime.Start();
		}
		else
		{
			this.m_oBlackTime.Stop();
		}
	}

	if (oClocks.white)
	{
		var oClock = oClocks.white;
		if (undefined !== oClock.periodsLeft)
		{
			if (0 === oClock.periodsLeft)
			{
				this.m_oWhiteTime.CorrectMainTime(oClock.time);
			}
			else
			{
				this.m_oWhiteTime.CorrectMainTime(0);
				this.m_oWhiteTime.CorrectOverTime(oClock.time, oClock.periodsLeft);
			}
		}
		else if (undefined !== oClock.stonesLeft)
		{
			if (0 === oClock.stonesLeft)
			{
				this.m_oWhiteTime.CorrectMainTime(oClock.time);
			}
			else
			{
				this.m_oWhiteTime.CorrectMainTime(0);
				this.m_oWhiteTime.CorrectOverTime(oClock.time, oClock.stonesLeft);
			}
		}
		else
		{
			this.m_oWhiteTime.CorrectMainTime(oClock.time);
		}

		if (true === oClock.running && true !== oClock.paused)
		{
			this.m_oWhiteTime.Start();
		}
		else
		{
			this.m_oWhiteTime.Stop();
		}
	}
};
CKGSGameRoom.prototype.HandleGameActions = function(arrActions)
{
	if (!arrActions)
		return;

	for (var nIndex = 0, nCount = arrActions.length; nIndex < nCount; ++nIndex)
	{
		var oAction = arrActions[nIndex];
		var sAction = oAction["action"];
		if ("EDIT" === sAction)
		{
			this.EndCountScores();

			var oListObject = this.m_oPlayersList.GetListObject();

			var oEditor = GetKGSUser(oAction["user"]);
			oListObject.SetEditor(oEditor);
			this.m_oPlayersList.Update_Size();

			if (oEditor.GetName() === this.m_oClient.GetUserName())
			{
				if (false === this.m_bEditor)
				{
					this.RemoveOwnChanges();
					this.BackToGame();
					this.m_bEditor = true;
					var oHandler = new CKGSEditorHandler(this.m_oClient, this);
					this.m_oGameTree.Set_Handler(oHandler);
				}
			}
			else if (true === this.m_bEditor)
			{
				this.m_bEditor = false;
				this.m_oGameTree.Set_Handler(null);
			}
		}
		else if ("MOVE" === sAction)
		{
			this.EndCountScores();

			var oUser = GetKGSUser(oAction.user);
			if (this.IsPlayer() && this.m_oGameTree)
			{
				if (oUser.GetName() === this.m_oClient.GetUserName())
					this.private_OurMove();
				else
					this.private_OpponentMove();
			}
		}
		else if ("SCORE" === sAction)
		{
			this.StartCountScores();
		}
	}
};
CKGSGameRoom.prototype.HandleScore = function(sScore)
{
	if (null !== sScore)
	{
		this.m_sResult = sScore;

		if (this.m_oCommentsHandler)
			this.m_oCommentsHandler.AddGameOver(this.m_oCurNode, sScore);

		if (this.m_oStateHandler)
			this.m_oStateHandler.Update();

		if (this.IsPlayer())
		{
			this.EndCountScores();
			this.m_oGameTree.Set_Handler(null);
			this.m_oGameTree.Set_ShowTarget(true, true);
			this.m_oGameTree.Set_EditingFlags({Move : true, NewNode : true, ChangeBoardMode : true, ViewPort : true});
		}
	}

	if (this.m_oCommentsHandler)
		this.m_oCommentsHandler.ScrollChatAreaToBottom();
};
CKGSGameRoom.prototype.ReadSgfEvents = function(arrSgfEvents, isOnLoad)
{
	var oGameTree = this.m_oGameTree;
	var oHandler  = oGameTree.Get_Handler();
	oGameTree.Set_Handler(null);

	var oCurNode  = this.m_oCurNode;
	var bGoToNode = oCurNode === oGameTree.Get_CurNode() || true === isOnLoad;

	oCurNode = this.private_ReadSgfEvents(arrSgfEvents);

	if (true === isOnLoad && !oCurNode)
		oCurNode = oGameTree.Get_FirstNode();

	if (oCurNode)
	{
		if (bGoToNode)
			oGameTree.GoTo_Node(oCurNode);

		this.m_oCurNode = oCurNode;
		oGameTree.Set_GameCurNode(oCurNode);

		if (this.m_oStateHandler)
			this.m_oStateHandler.Update();
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

	oGameTree.Set_Handler(oHandler);
};
CKGSGameRoom.prototype.UpdatePlayersList = function(arrUsers)
{
	var oListObject = this.m_oPlayersList.GetListObject();
	oListObject.SetBlack(this.m_oBlack);
	oListObject.SetWhite(this.m_oWhite);
	oListObject.SetOwner(this.m_oOwner);

	if (arrUsers)
	{
		for (var nIndex = 0, nCount = arrUsers.length; nIndex < nCount; ++nIndex)
		{
			var oUser = GetKGSUser(arrUsers[nIndex]);
			this.m_oPlayersList.Handle_Record([0, oUser.GetName(), oUser]);
		}
	}

	this.m_oPlayersList.Update_Size();
};
CKGSGameRoom.prototype.HandleUserAdded = function(oUser)
{
	this.m_oPlayersList.Handle_Record([0, oUser.GetName(), oUser]);
	this.m_oPlayersList.Update_Size();
};
CKGSGameRoom.prototype.HandleUserRemoved = function(oUser)
{
	this.m_oPlayersList.Handle_Record([1, oUser.GetName(), oUser]);
	this.m_oPlayersList.Update_Size();
};
CKGSGameRoom.prototype.OnStartReview = function(nNewChannelId, oOwner)
{
	this.m_nGameRoomId = nNewChannelId;
	this.m_bDemo       = true;

	this.m_oBlackTime.Stop();
	this.m_oWhiteTime.Stop();
	this.m_oStateHandler.Update();

	if (oOwner)
	{
		this.m_oOwner = oOwner;

		var oListObject = this.m_oPlayersList.GetListObject();
		oListObject.SetOwner(oOwner);

		var sRank = oOwner.GetStringRank();
		this.m_oGameTree.Set_GameTranscriber(oOwner.GetName() + ("?" !== sRank && "-" !== sRank ? "[" + sRank + "]" : ""));
	}
	else
	{
		// Такого не должно быть
		this.m_oGameTree.Set_GameTranscriber("unknown");
	}
};
CKGSGameRoom.prototype.private_ReadSgfEvents = function(arrSgfEvents)
{
	var oGameTree      = this.m_oGameTree;
	var oNode          = null;
	var oNodeOrigin    = null;
	var oActivatedNode = null;

	for (var nIndex = 0, nCount = arrSgfEvents.length; nIndex < nCount; ++nIndex)
	{
		var sgfEvent = arrSgfEvents[nIndex];

		var sNodeId = sgfEvent.nodeId;
		if (!this.m_oNodes[sNodeId])
		{
			// Сюда мы должны попадать ровно 1 раз в самом начале с самой первой нодой
			this.m_oNodes[sNodeId]       = oGameTree.Get_FirstNode();
			this.m_oNodesOrigin[sNodeId] = new CNode(oGameTree);

			this.m_oNodes[sNodeId].Set_Origin(true);
			this.m_oNodesOrigin[sNodeId].Set_Origin(true);
		}

		oNode       = this.m_oNodes[sNodeId];
		oNodeOrigin = this.m_oNodesOrigin[sNodeId];
		if (!oNode || !oNodeOrigin)
			continue;

		if ("PROP_GROUP_ADDED" === sgfEvent.type)
		{
			var oProps = sgfEvent.props;
			for (var nPropsIndex = 0, nPropsCount = oProps.length; nPropsIndex < nPropsCount; ++nPropsIndex)
			{
				this.private_ReadProp(oProps[nPropsIndex], oNode, oGameTree);

				if ("COMMENT" !== oProps[nPropsIndex].name)
					this.private_ReadProp(oProps[nPropsIndex], oNodeOrigin, oGameTree);
			}
		}
		else if ("PROP_ADDED" === sgfEvent.type)
		{
			this.private_ReadProp(sgfEvent.prop, oNode, oGameTree);

			if ("COMMENT" !== sgfEvent.prop.name)
				this.private_ReadProp(sgfEvent.prop, oNodeOrigin, oGameTree);
		}
		else if ("CHILD_ADDED" === sgfEvent.type)
		{
			var oNewNode = new CNode(oGameTree);
			oNewNode.Set_Origin(true);
			oNode.Add_Next(oNewNode, false);
			this.m_oNodes[sgfEvent.childNodeId] = oNewNode;

			var oNewNodeOrigin = new CNode(oGameTree);
			oNewNodeOrigin.Set_Origin(true);
			oNodeOrigin.Add_Next(oNewNodeOrigin, false);
			this.m_oNodesOrigin[sgfEvent.childNodeId] = oNewNodeOrigin;
		}
		else if ("ACTIVATED" === sgfEvent.type)
		{
			if (this.m_oNodes[sgfEvent.nodeId])
				oActivatedNode = this.m_oNodes[sgfEvent.nodeId];
		}
		else if ("PROP_CHANGED" === sgfEvent.type)
		{
			this.private_ReadProp(sgfEvent.prop, oNode, oGameTree);

			if ("COMMENT" !== sgfEvent.prop.name)
				this.private_ReadProp(sgfEvent.prop, oNodeOrigin, oGameTree);
		}
		else if ("PROP_REMOVED" === sgfEvent.type)
		{
			this.private_ReadPropRemove(sgfEvent.prop, oNode, oGameTree);
			this.private_ReadPropRemove(sgfEvent.prop, oNodeOrigin, oGameTree);
		}
		else if ("PROP_GROUP_REMOVED" === sgfEvent.type)
		{
			var oProps = sgfEvent.props;
			for (var nPropsIndex = 0, nPropsCount = oProps.length; nPropsIndex < nPropsCount; ++nPropsIndex)
			{
				this.private_ReadPropRemove(oProps[nPropsIndex], oNode, oGameTree);
				this.private_ReadPropRemove(oProps[nPropsIndex], oNodeOrigin, oGameTree);
			}
		}
		else
		{
			console.log(sgfEvent);
		}
	}

	return oActivatedNode;
};
CKGSGameRoom.prototype.private_ReadProp = function(oProp, oNode, oGameTree)
{
	if ("MOVE" === oProp.name)
	{
		if ("PASS" === oProp.loc)
		{
			if ("black" === oProp.color)
				oNode.Add_Move(0, 0, BOARD_BLACK);
			else if ("white" === oProp.color)
				oNode.Add_Move(0, 0, BOARD_WHITE);
		}
		else
		{
			var nX = oProp.loc.x + 1;
			var nY = oProp.loc.y + 1;

			if ("black" === oProp.color)
				oNode.Add_Move(nX, nY, BOARD_BLACK);
			else if ("white" === oProp.color)
				oNode.Add_Move(nX, nY, BOARD_WHITE);
		}
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
		if (this.m_oCommentsHandler)
		{
			oGameTree.Get_MovesCount();

			if (true === this.m_bDemo)
				this.m_oCommentsHandler.AddComment(oProp.text, oNode, "" !== oGameTree.Get_Result());
			else
				this.m_oCommentsHandler.AddComment(oProp.text, oNode, false);
		}
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

		if (oProp.timeSystem)
		{
			var sTimeType = oProp.timeSystem;
			if ("absolute" === sTimeType)
			{
				this.m_oBlackTime.SetAbsolute(oProp.mainTime);
				this.m_oWhiteTime.SetAbsolute(oProp.mainTime);
			}
			else if ("byo_yomi" === sTimeType)
			{
				this.m_oBlackTime.SetByoYomi(oProp.mainTime, oProp.byoYomiTime, oProp.byoYomiPeriods);
				this.m_oWhiteTime.SetByoYomi(oProp.mainTime, oProp.byoYomiTime, oProp.byoYomiPeriods);
			}
			else if ("canadian" === sTimeType)
			{
				this.m_oBlackTime.SetCanadian(oProp.mainTime, oProp.byoYomiTime, oProp.byoYomiStones);
				this.m_oWhiteTime.SetCanadian(oProp.mainTime, oProp.byoYomiTime, oProp.byoYomiStones);
			}
		}
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
			oGameTree.Set_WhiteRating(this.private_GetRank(oProp.int));
		else if ("black" === oProp.color)
			oGameTree.Set_BlackRating(this.private_GetRank(oProp.int));
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
		// В GameTree информацию не пишем.
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
	else if ("CIRCLE" === oProp.name)
	{
		var nX = oProp.loc.x + 1;
		var nY = oProp.loc.y + 1;
		oNode.Add_Mark(EDrawingMark.Cr, [Common_XYtoValue(nX, nY)]);
	}
	else if ("CROSS" === oProp.name)
	{
		var nX = oProp.loc.x + 1;
		var nY = oProp.loc.y + 1;
		oNode.Add_Mark(EDrawingMark.X, [Common_XYtoValue(nX, nY)]);
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
		console.log("Add " + oProp);
		oNode.Set_TerritoryForceUse(true);

		var nX = oProp.loc.x + 1;
		var nY = oProp.loc.y + 1;

		var nValue = oGameTree.Get_Board().Get(nX, nY);
		if (BOARD_EMPTY === nValue)
		{
			if ("black" === oProp.color)
				oNode.Add_TerritoryPoint(Common_XYtoValue(nX, nY), BOARD_BLACK);
			else if ("white" === oProp.color)
				oNode.Add_TerritoryPoint(Common_XYtoValue(nX, nY), BOARD_WHITE);
		}
	}
	else if ("DEAD" === oProp.name)
	{
		console.log("Add " + oProp);
		oNode.Set_TerritoryForceUse(true);

		var nX = oProp.loc.x + 1;
		var nY = oProp.loc.y + 1;

		var nValue = oGameTree.Get_Board().Get(nX, nY);

		if (BOARD_WHITE === nValue)
			oNode.Add_TerritoryPoint(Common_XYtoValue(nX, nY), BOARD_BLACK);
		else if (BOARD_BLACK === nValue)
			oNode.Add_TerritoryPoint(Common_XYtoValue(nX, nY), BOARD_WHITE);
	}
	else if ("SETWHOSEMOVE" === oProp.name)
	{
		if ("black" === oProp.color)
			oNode.Set_NextMove(BOARD_BLACK);
		else if ("white" === oProp.color)
			oNode.Set_NextMove(BOARD_WHITE);
	}
	else if ("ARROW" === oProp.name || "LINE" === oProp.name)
	{
		// Ничего не делаем
	}
	else if ("RESULT" === oProp.name)
	{
		oGameTree.Set_Result(oProp.text);
	}
	else if ("TRANSCRIBER" === oProp.name)
	{
		oGameTree.Set_GameTranscriber(oProp.text);
	}
	else if ("SOURCE" === oProp.name)
	{
		oGameTree.Set_GameSource(oProp.text);
	}
	else
	{
		console.log("PROP_ADD/PROP_CHANGE");
		console.log(oProp);
	}
};
CKGSGameRoom.prototype.private_ReadPropRemove = function(oProp, oNode, oGameTree)
{
	if ("ADDSTONE" === oProp.name)
	{
		// Пропускаем, т.к. добавление/удаление камней полностью регулируется в PROP_ADDED/PROP_CHANGED
	}
	if ("TRIANGLE" === oProp.name || "SQUARE" === oProp.name || "LABEL" === oProp.name || "CIRCLE" === oProp.name || "CROSS" === oProp.name)
	{
		var nX = oProp.loc.x + 1;
		var nY = oProp.loc.y + 1;
		oNode.Add_Mark(ECommand.RM, [Common_XYtoValue(nX, nY)]);
	}
	else if ("TERRITORY" === oProp.name)
	{
		console.log("Remove " + oProp);
		oNode.Set_TerritoryForceUse(true);

		var nX = oProp.loc.x + 1;
		var nY = oProp.loc.y + 1;

		var nValue = oGameTree.Get_Board().Get(nX, nY);
		if (BOARD_EMPTY === nValue)
		{
			if ("black" === oProp.color || "white" === oProp.color)
				oNode.Remove_TerritoryPoint(Common_XYtoValue(nX, nY));
		}
	}
	else if ("DEAD" === oProp.name)
	{
		console.log("Remove " + oProp);
		oNode.Set_TerritoryForceUse(true);

		var nX = oProp.loc.x + 1;
		var nY = oProp.loc.y + 1;

		var nValue = oGameTree.Get_Board().Get(nX, nY);

		if (BOARD_BLACK === nValue || BOARD_WHITE === nValue)
			oNode.Remove_TerritoryPoint(Common_XYtoValue(nX, nY));
	}
	else if ("ARROW" === oProp.name || "LINE" === oProp.name)
	{
		// Ничего не делаем
	}
	else if ("TRANSCRIBER" === oProp.name)
	{
		oGameTree.Set_GameTranscriber("");
	}
	else if ("SOURCE" === oProp.name)
	{
		oGameTree.Set_GameSource("");
	}
	else
	{
		console.log("PROP_REMOVE");
		console.log(oProp);
	}
};
CKGSGameRoom.prototype.private_GetRank = function(nRank)
{
	if (undefined === nRank || null === nRank)
		return "?";
	else if (nRank <= 30)
		return (31 - nRank) + "k";
	else if (nRank <= 39)
		return (nRank - 30) + "d";
	else
		return (nRank - 39) + "p";
};
CKGSGameRoom.prototype.Sync = function()
{
	if (this.IsCommandInProgress())
		return;

	this.m_oClient.SendSync(this);
	this.m_bCommandInProgress = true;
};
CKGSGameRoom.prototype.OnSync = function()
{
	console.log("OnSync");
	this.m_bCommandInProgress = false;
};
CKGSGameRoom.prototype.IsCommandInProgress = function()
{
	return this.m_bCommandInProgress;
};
CKGSGameRoom.prototype.GetNodeId = function(oNode)
{
	if (!oNode)
		oNode = this.m_oCurNode;

	for (var sNodeId in this.m_oNodes)
	{
		if (this.m_oNodes[sNodeId] === oNode)
		{
			return sNodeId;
		}
	}

	return null;
};
CKGSGameRoom.prototype.GetNewNodeId = function()
{
	var nId = 1;
	while (this.m_oNodes[nId])
	{
		nId++;
	}

	return nId;
};
CKGSGameRoom.prototype.SendSgfEventChangeCurrentNode = function(nGameRoomId, nNodeId, nPrevNodeId)
{
	this.private_SendCommand({
		"type"      : "KGS_SGF_CHANGE",
		"channelId" : nGameRoomId,
		"sgfEvents" : [{
			"type"       : "ACTIVATED",
			"nodeId"     : nNodeId,
			"prevNodeId" : nPrevNodeId
		}]
	});
};
CKGSGameRoom.prototype.SendSgfEventNewNodeWithMove = function(nGameRoomId, nNodeId, nNewNodeId, X, Y, Value)
{
	this.private_SendCommand({
		"type"      : "KGS_SGF_CHANGE",
		"channelId" : nGameRoomId,
		"sgfEvents" : [{
			"type"        : "CHILD_ADDED",
			"nodeId"      : nNodeId,
			"childNodeId" : nNewNodeId
		}, {
			"type"       : "ACTIVATED",
			"nodeId"     : nNewNodeId,
			"prevNodeId" : nNodeId
		}, {
			"type"   : "PROP_ADDED",
			"nodeId" : nNewNodeId,
			"prop"   : {
				"name"  : "MOVE",
				"color" : BOARD_BLACK === Value ? "black" : "white",
				"loc"   : {
					"x" : X - 1,
					"y" : Y - 1
				}
			}
		}]
	});
};
CKGSGameRoom.prototype.SendSgfEventNewNodeWithAddOrRemoveStone = function(nGameRoomId, nNodeId, nNewNodeId, X, Y, Value)
{
	this.private_SendCommand({
		"type"      : "KGS_SGF_CHANGE",
		"channelId" : nGameRoomId,
		"sgfEvents" : [{
			"type"        : "CHILD_ADDED",
			"nodeId"      : nNodeId,
			"childNodeId" : nNewNodeId
		}, {
			"type"       : "ACTIVATED",
			"nodeId"     : nNewNodeId,
			"prevNodeId" : nNodeId
		}, {
			"type"   : "PROP_ADDED",
			"nodeId" : nNewNodeId,
			"prop"   : {
				"name"  : "ADDSTONE",
				"color" : (BOARD_BLACK === Value ? "black" : (BOARD_WHITE === Value ? "white" : "empty")),
				"loc"   : {
					"x" : X - 1,
					"y" : Y - 1
				}
			}
		}]
	});
};
CKGSGameRoom.prototype.SendSgfEventAddOrRemoveStone = function(nGameRoomId, nNodeId, X, Y, Value)
{
	this.private_SendCommand({
		"type"      : "KGS_SGF_CHANGE",
		"channelId" : nGameRoomId,
		"sgfEvents" : [{
			"type"   : "PROP_ADDED",
			"nodeId" : nNodeId,
			"prop"   : {
				"name"  : "ADDSTONE",
				"color" : (BOARD_BLACK === Value ? "black" : (BOARD_WHITE === Value ? "white" : "empty")),
				"loc"   : {
					"x" : X - 1,
					"y" : Y - 1
				}
			}
		}]
	});
};
CKGSGameRoom.prototype.SendSgfEventAddOrRemoveMark = function(nGameRoomId, nNodeId, isAdd, X, Y, Type, Text)
{
	var sType = null;

	switch(Type)
	{
		case EDrawingMark.Tr:
			sType = "TRIANGLE";
			break;
		case EDrawingMark.Sq:
			sType = "SQUARE";
			break;
		case EDrawingMark.Cr:
			sType = "CIRCLE";
			break;
		case EDrawingMark.X:
			sType = "CROSS";
			break;
		case EDrawingMark.Tx:
			sType = "LABEL";
			break;
	}

	if (null === sType)
		return;

	if (EDrawingMark.Tx === Type)
	{
		this.private_SendCommand({
			"type"      : "KGS_SGF_CHANGE",
			"channelId" : nGameRoomId,
			"sgfEvents" : [{
				"type"   : true == isAdd ? "PROP_ADDED" : "PROP_REMOVED",
				"nodeId" : nNodeId,
				"prop"   : {
					"name" : sType,
					"loc"  : {
						"x" : X - 1,
						"y" : Y - 1
					},
					"text" : Text
				}
			}]
		});
	}
	else
	{
		this.private_SendCommand({
			"type"      : "KGS_SGF_CHANGE",
			"channelId" : nGameRoomId,
			"sgfEvents" : [{
				"type"   : true == isAdd ? "PROP_ADDED" : "PROP_REMOVED",
				"nodeId" : nNodeId,
				"prop"   : {
					"name" : sType,
					"loc"  : {
						"x" : X - 1,
						"y" : Y - 1
					}
				}
			}]
		});
	}
};
CKGSGameRoom.prototype.BackToGame = function()
{
	this.m_oGameTree.GoTo_Node(this.m_oCurNode);
};
CKGSGameRoom.prototype.RemoveOwnChanges = function()
{
	for (var sNodeId in this.m_oNodes)
	{
		var oNode = this.m_oNodes[sNodeId];
		oNode.Reset_ToOrigin(this.m_oNodesOrigin[sNodeId]);
	}

	var oCurNode = this.m_oGameTree.Get_CurNode();
	while (oCurNode && true !== oCurNode.Is_Origin())
		oCurNode = oCurNode.Get_Prev();

	if (!oCurNode)
		oCurNode = this.m_oCurNode;

	this.m_oGameTree.GoTo_Node(oCurNode);

	var oDrawingNavigator = this.m_oGameTree.m_oDrawingNavigator;
	if (oDrawingNavigator)
	{
		oDrawingNavigator.Create_FromGameTree();
		oDrawingNavigator.Update();
		oDrawingNavigator.Update_Current(true);
		oDrawingNavigator.Update_GameCurrent();
	}
};
CKGSGameRoom.prototype.ReturnControlToOwner = function()
{
	if (true === this.m_bEditor && this.m_oOwner)
		this.m_oClient.GiveGameControl(this.m_nGameRoomId, this.m_oOwner.GetName());
};
CKGSGameRoom.prototype.IsPlayer = function()
{
	return this.IsBlackPlayer() || this.IsWhitePlayer() ? true : false;
};
CKGSGameRoom.prototype.IsBlackPlayer = function()
{
	return (this.m_oBlack && this.m_oBlack.GetName() === this.m_oClient.GetUserName() ? true : false);
};
CKGSGameRoom.prototype.IsWhitePlayer = function()
{
	return (this.m_oWhite && this.m_oWhite.GetName() === this.m_oClient.GetUserName() ? true : false);
};
CKGSGameRoom.prototype.IsOurMove = function()
{
	return this.m_bOurMove;
};
CKGSGameRoom.prototype.SendMove = function(nGameRoomId, X, Y)
{
	if (!this.IsOurMove() || !this.IsPlayer())
		return;

	if (!this.private_SendCommand({
			"type"     : "GAME_MOVE",
			"channelId": nGameRoomId,
			"loc"      : {
				"x": X - 1,
				"y": Y - 1
			}
		}))
		return;


	this.private_OpponentMove();
};
CKGSGameRoom.prototype.SendPass = function(nGameRoomId)
{
	if (!this.IsOurMove() || !this.IsPlayer())
		return;

	if (!this.private_SendCommand({
			"type"     : "GAME_MOVE",
			"channelId": nGameRoomId,
			"loc"      : "PASS"
		}))
		return;

	this.private_OpponentMove();
};
CKGSGameRoom.prototype.SendMarkLife = function(nGameRoomId, X, Y, bAlive)
{
	if (!this.IsCountingScores() || !this.IsPlayer())
		return;

	this.private_SendCommand({
		"type"      : "GAME_MARK_LIFE",
		"channelId" : nGameRoomId,
		"x"         : X - 1,
		"y"         : Y - 1,
		"alive"     : bAlive
	});
};
CKGSGameRoom.prototype.RequestUndo = function()
{
	if (!this.IsPlayer())
		return;

	this.m_oClient.private_SendMessage({
		"type"     : "GAME_UNDO_REQUEST",
		"channelId": this.GetRoomId()
	});
};
CKGSGameRoom.prototype.AcceptUndo = function()
{
	if (!this.IsPlayer())
		return;

	this.m_oClient.private_SendMessage({
		"type"      : "GAME_UNDO_ACCEPT",
		"channelId" : this.GetRoomId()
	});
};
CKGSGameRoom.prototype.Resign = function()
{
	if (!this.IsPlayer())
		return;

	this.m_oClient.private_SendMessage({
		"type"     : "GAME_RESIGN",
		"channelId": this.GetRoomId()
	});
};
CKGSGameRoom.prototype.SendDone = function()
{
	if (!this.IsPlayer())
		return;

	this.m_oClient.private_SendMessage({
		"type"     : "GAME_SCORING_DONE",
		"channelId": this.GetRoomId(),
		"doneId"   : this.m_nScoresDoneId
	});
};
CKGSGameRoom.prototype.private_OurMove = function()
{
	if (true === this.IsBlackPlayer() && BOARD_BLACK !== this.m_oGameTree.Get_NextMove())
		this.m_oGameTree.Set_NextMove(BOARD_BLACK);
	else if (true === this.IsWhitePlayer() && BOARD_WHITE !== this.m_oGameTree.Get_NextMove())
		this.m_oGameTree.Set_NextMove(BOARD_WHITE);


	this.m_oGameTree.Set_ShowTarget(true, true);
	this.m_oGameTree.Set_EditingFlags({NewNode : true, Move : true});

	this.m_bOurMove = true;
};
CKGSGameRoom.prototype.private_OpponentMove = function()
{
	this.m_bOurMove = false;

	this.m_oGameTree.Set_ShowTarget(false, true);
	this.m_oGameTree.Forbid_All();
	this.m_oGameTree.Set_EditingFlags({Move : true});
};
CKGSGameRoom.prototype.IsCountingScores = function()
{
	return this.m_bCountScores;
};
CKGSGameRoom.prototype.StartCountScores = function()
{
	if (this.IsPlayer())
	{
		this.m_bCountScores = true;
		this.m_oGameTree.Get_DrawingBoard().Start_CountScoresInMatch();
		this.m_oGameTree.Set_ShowTarget(true, true);
		this.m_oGameTree.Get_Drawing().GoUniverseOnStartCounting();
	}
};
CKGSGameRoom.prototype.EndCountScores = function()
{
	if (this.m_bCountScores && this.IsPlayer())
	{
		this.m_bCountScores = false;
		this.m_oGameTree.Get_DrawingBoard().End_CountScoresInMatch();
		this.m_oGameTree.Set_ShowTarget(false, true);
		this.m_oGameTree.Get_Drawing().GoUniverseOnEndCounting();
	}
};
CKGSGameRoom.prototype.private_SendCommand = function(oCommand)
{
	if (this.IsCommandInProgress())
		return false;

	this.m_oClient.private_SendMessage(oCommand);

	this.Sync();

	return true;
};
CKGSGameRoom.prototype.GetBlackScores = function()
{
	return this.m_nBlackScores;
};
CKGSGameRoom.prototype.GetWhiteScores = function()
{
	return this.m_nWhiteScores;
};
CKGSGameRoom.prototype.IsGameInProgress = function()
{
	if (null === this.m_sResult)
		return true;

	return false;
};
CKGSGameRoom.prototype.ToggleAnalyze = function()
{
	if (this.IsPlayer())
	{
		var oHandler = this.m_oGameTree.Get_Handler();
		if (oHandler && oHandler instanceof CKGSMatchHandler)
		{
			this.m_oGameTree.Set_Handler(null);
			this.m_oGameTree.Set_ShowTarget(true, true);
			this.m_oGameTree.Set_EditingFlags({NewNode : true, Move : true, ChangeBoardMode : true});
		}
		else
		{
			this.BackToGame();
			this.m_oGameTree.Set_Handler(new CKGSMatchHandler(this.m_oClient, this));

			if (true === this.IsOurMove())
				this.private_OurMove();
			else
				this.private_OpponentMove();
		}
	}
};
CKGSGameRoom.prototype.GetBlackName = function()
{
	if (this.m_oBlack)
		return this.m_oBlack.GetName();

	return "";
};
CKGSGameRoom.prototype.GetWhiteName = function()
{
	if (this.m_oWhite)
		return this.m_oWhite.GetName();

	return "";
};

function CKGSEditorHandler(oClient, oGame)
{
	this.m_oClient = oClient;
	this.m_oGame   = oGame;
	this.m_nGameId = oGame.GetRoomId();
}
CKGSEditorHandler.prototype.GoToNode = function(oNode)
{
	var sPrevNodeId = this.m_oGame.GetNodeId();
	var sNodeId     = this.m_oGame.GetNodeId(oNode);
	if (null === sPrevNodeId || null === sNodeId || sPrevNodeId == sNodeId)
		return;

	this.m_oGame.SendSgfEventChangeCurrentNode(this.m_nGameId, sNodeId, sPrevNodeId);
};
CKGSEditorHandler.prototype.AddNewNodeWithMove = function(oNode, X, Y, Value)
{
	var sNodeId = this.m_oGame.GetNodeId(oNode);
	if (null === sNodeId)
		return;

	this.m_oGame.SendSgfEventNewNodeWithMove(this.m_nGameId, sNodeId, this.m_oGame.GetNewNodeId(), X, Y, Value);
};
CKGSEditorHandler.prototype.RemoveNode = function(oNode)
{
};
CKGSEditorHandler.prototype.AddOrRemoveStone = function(isAddNewNode, X, Y, Value)
{
	var sNodeId = this.m_oGame.GetNodeId();
	if (null === sNodeId)
		return;

	if (true === isAddNewNode)
		this.m_oGame.SendSgfEventNewNodeWithAddOrRemoveStone(this.m_nGameId, sNodeId, this.m_oGame.GetNewNodeId(), X, Y, Value);
	else
		this.m_oGame.SendSgfEventAddOrRemoveStone(this.m_nGameId, sNodeId, X, Y, Value);
};
CKGSEditorHandler.prototype.AddOrRemoveMark = function(isAdd, X, Y, Type, Text)
{
	var sNodeId = this.m_oGame.GetNodeId();
	if (null === sNodeId)
		return;

	this.m_oGame.SendSgfEventAddOrRemoveMark(this.m_nGameId, sNodeId, isAdd, X, Y, Type, Text);
};
CKGSEditorHandler.prototype.Pass = function(Value)
{
	// TODO: Реализовать пас
};
CKGSEditorHandler.prototype.CheckExistNodeOnMove = function()
{
	return true;
};
CKGSEditorHandler.prototype.MarkLife = function(X, Y, bAlive)
{
	// TODO: Реализовать
};

function CKGSMatchHandler(oClient, oGame)
{
	this.m_oClient = oClient;
	this.m_oGame   = oGame;
	this.m_nGameId = oGame.GetRoomId();
}
CKGSMatchHandler.prototype.GoToNode = function(oNode)
{
	// Ничего не делаем
};
CKGSMatchHandler.prototype.AddNewNodeWithMove = function(oNode, X, Y, Value)
{
	this.m_oGame.SendMove(this.m_nGameId, X, Y);
};
CKGSMatchHandler.prototype.RemoveNode = function(oNode)
{
	// Ничего не делаем
};
CKGSMatchHandler.prototype.AddOrRemoveStone = function(isAddNewNode, X, Y, Value)
{
	// Ничего не делаем
};
CKGSMatchHandler.prototype.AddOrRemoveMark = function(isAdd, X, Y, Type, Text)
{
	// Ничего не делаем
};
CKGSMatchHandler.prototype.Pass = function(Value)
{
	this.m_oGame.SendPass(this.m_nGameId);
};
CKGSMatchHandler.prototype.CheckExistNodeOnMove = function()
{
	return false;
};
CKGSMatchHandler.prototype.MarkLife = function(X, Y, bAlive)
{
	this.m_oGame.SendMarkLife(this.m_nGameId, X, Y, bAlive);
};
CKGSMatchHandler.prototype.GetBlackScores = function()
{
	return this.m_oGame.GetBlackScores();
};
CKGSMatchHandler.prototype.GetWhiteScores = function()
{
	return this.m_oGame.GetWhiteScores();
};
