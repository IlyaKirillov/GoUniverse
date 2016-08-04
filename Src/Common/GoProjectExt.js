"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     29.06.2016
 * Time     2:33
 */

var g_oDrawingBoardElements = null;

String.prototype.IsLatinLetter = function(nPos)
{
	var nCharCode = this.charCodeAt(nPos);

	if ((65 <= nCharCode && nCharCode <= 90)
		|| (97 <= nCharCode && nCharCode <= 122))
		return true;

	return false;
};
String.prototype.IsDigit = function(nPos)
{
	var nCharCode = this.charCodeAt(nPos);

	if (48 <= nCharCode && nCharCode <= 57)
		return true;

	return false;
};
String.prototype.IsSpace = function(nPos)
{
	if (32 === this.charCodeAt(nPos))
		return true;

	return false;
};
String.prototype.IsEnd = function(nPos)
{
	if (nPos >= this.length)
		return true;

	return false;
};
String.prototype.IsSpaceOrPunctuation = function(nPos)
{
	var nChar = this.charAt(nPos);
	if (' ' === nChar || '!' === nChar || ',' === nChar || '.' === nChar || '?' === nChar)
		return true;

	return false;
};

//----------------------------------------------------------------------------------------------------------------------
// Дополнение к классу CDrawing
//----------------------------------------------------------------------------------------------------------------------
CDrawing.prototype.private_GoUniverseCreateWrappingMainDiv = function(sDivId)
{
	g_oGlobalSettings.Load_FromLocalStorage();
	//------------------------------------------------------------------------------------------------------------------
	// Создаем оберточную div для всего редактора, которая будет главной для нас.
	//------------------------------------------------------------------------------------------------------------------
	var oParentControl = CreateControlContainer(sDivId);
	this.m_oControl = oParentControl;
	var sMainDivId = sDivId + "GB";
	this.private_CreateDiv(oParentControl.HtmlElement, sMainDivId);
	var oMainControl = CreateControlContainer(sMainDivId);
	oMainControl.Bounds.SetParams(0, 0, 0, 0, true, true, true, true, -1, -1);
	oMainControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oParentControl.AddControl(oMainControl);
	this.private_SetMainDiv(sMainDivId, oMainControl);
};
CDrawing.prototype.Create_GoUniverseViewerTemplate = function(sDivId, oApp, oTab, sWhiteAvatar, sBlackAvatar, oWhiteTime, oBlackTime, oGameHandler)
{
	this.m_oGoUniverseApp = oApp;
	this.m_oVisualTab     = oTab;
	this.m_sBlackAvatar   = sBlackAvatar;
	this.m_sWhiteAvatar   = sWhiteAvatar;
	this.m_oBlackTime     = oBlackTime;
	this.m_oWhiteTime     = oWhiteTime;
	this.m_oGameHandler   = oGameHandler;

	this.private_GoUniverseCreateWrappingMainDiv(sDivId);
	this.private_GoUniverseCreateHorFullTemplate();
	this.Set_TemplateType(EDrawingTemplate.GoUniverseViewerHor);
};
CDrawing.prototype.private_GoUniverseCreateHorFullTemplate = function()
{
	var oGameTree    = this.m_oGameTree;
	var oMainControl = this.m_oMainControl;
	var sMainDivId   = this.m_oMainDiv.id;
	var sDivId       = sMainDivId;

	this.m_nMixedRightSide = 344;

	//------------------------------------------------------------------------------------------------------------------
	// Делим на две части. Правая - панель управления, информация и комменты. Левая - доска.
	//------------------------------------------------------------------------------------------------------------------
	var oDrawingBoard = new CDrawingBoard(this);
	oMainControl.Set_Type(1, oDrawingBoard, {RMin : this.m_nMixedRightSide});

	// if (null === g_oDrawingBoardElements)
	// 	g_oDrawingBoardElements = oDrawingBoard.m_oImageData;
	// else
	// 	oDrawingBoard.m_oImageData = g_oDrawingBoardElements;

	var sBoardDivId = sDivId + "B";
	var sPanelDivId = sDivId + "P";

	this.private_CreateDiv(oMainControl.HtmlElement, sBoardDivId);
	this.private_CreateDiv(oMainControl.HtmlElement, sPanelDivId);

	var oBoardControl = CreateControlContainer(sBoardDivId);
	var oPanelControl = CreateControlContainer(sPanelDivId);
	oMainControl.AddControl(oBoardControl);
	oMainControl.AddControl(oPanelControl);

	oDrawingBoard.Init(sBoardDivId, oGameTree);
	oDrawingBoard.Focus();
	this.m_aElements.push(oDrawingBoard);
	oPanelControl.HtmlElement.style.backgroundColor = "rgb(217, 217, 217)";
	//------------------------------------------------------------------------------------------------------------------
	// Заполняем правую панель. Делим ее на четыре части:
	//  1. Информация о текущем состоянии партии
	//  2. Информация об игроках
	//  3. Навигатор + панель управления
	//  4. Чат + ввод для чата
	//------------------------------------------------------------------------------------------------------------------
	var GameInfoH  = 37;
	var InfoH      = 200;
	var ManagerH   = 200;
	var ChatInputH = 30;

	var sGameInfoDivId = sPanelDivId + "G";
	var sInfoDivId     = sPanelDivId + "I";
	var sManagerDivId  = sPanelDivId + "M";
	var sChatsDivId    = sPanelDivId + "C";


	this.private_CreateDiv(oPanelControl.HtmlElement, sGameInfoDivId);
	this.private_CreateDiv(oPanelControl.HtmlElement, sInfoDivId);
	this.private_CreateDiv(oPanelControl.HtmlElement, sManagerDivId);
	this.private_CreateDiv(oPanelControl.HtmlElement, sChatsDivId);
	//------------------------------------------------------------------------------------------------------------------
	// Информация об партии
	//------------------------------------------------------------------------------------------------------------------
	var oGameInfoControl = CreateControlContainer(sGameInfoDivId);
	oGameInfoControl.Bounds.SetParams(0, 0, 1000, 0, true, false, false, false, -1, GameInfoH - 1);
	oGameInfoControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	oPanelControl.AddControl(oGameInfoControl);
	oGameInfoControl.HtmlElement.style.borderBottom = "1px solid rgb(172, 172, 172)";
	oGameInfoControl.HtmlElement.className = "HorVerAlignCenter";

	var oGameState = new CGoUniverseDrawingGameState();
	oGameState.Init(oGameInfoControl.HtmlElement, this.m_oGameHandler);
	this.m_oGameHandler.StateHandler = oGameState;
	this.Add_StateHandler(oGameState);
	//------------------------------------------------------------------------------------------------------------------
	// Информация об игроках
	//------------------------------------------------------------------------------------------------------------------
	var oInfoControl = CreateControlContainer(sInfoDivId);
	oInfoControl.Bounds.SetParams(0, GameInfoH + 3, 1000, 0, true, true, false, false, -1, InfoH - 3);
	oInfoControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	oPanelControl.AddControl(oInfoControl);

	var sWhiteInfo = sInfoDivId + "_White";
	var sBlackInfo = sInfoDivId + "_Black";
	this.private_CreateDiv(oInfoControl.HtmlElement, sWhiteInfo);
	this.private_CreateDiv(oInfoControl.HtmlElement, sBlackInfo);

	var oInfoWhiteControl = CreateControlContainer(sWhiteInfo);
	oInfoWhiteControl.Bounds.SetParams(0, 0, 500, 1000, false, false, false, false, -1, -1);
	oInfoWhiteControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oInfoControl.AddControl(oInfoWhiteControl);

	var oInfoBlackControl = CreateControlContainer(sBlackInfo);
	oInfoBlackControl.Bounds.SetParams(500, 0, 1000, 1000, false, false, false, false, -1, -1);
	oInfoBlackControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oInfoControl.AddControl(oInfoBlackControl);

	var oDrawingWhiteInfo = new CGoUniverseDrawingPlayerInfo(this);
	oDrawingWhiteInfo.Init(sWhiteInfo, oGameTree, BOARD_WHITE, this.m_sWhiteAvatar, this.m_oWhiteTime);
	var oDrawingBlackInfo = new CGoUniverseDrawingPlayerInfo(this);
	oDrawingBlackInfo.Init(sBlackInfo, oGameTree, BOARD_BLACK, this.m_sBlackAvatar, this.m_oBlackTime);

	this.m_aElements.push(oDrawingBlackInfo);
	this.m_aElements.push(oDrawingWhiteInfo);
	//------------------------------------------------------------------------------------------------------------------
	// Кнопка меню
	//------------------------------------------------------------------------------------------------------------------
	var sMenuButton = sPanelDivId + "D";
	this.private_CreateDiv(oPanelControl.HtmlElement, sMenuButton);
	var oMenuButtonControl = CreateControlContainer(sMenuButton);
	oMenuButtonControl.Bounds.SetParams(7, 0, 1000, 7, true, true, false, true, 36, 36);
	oMenuButtonControl.Anchor = (g_anchor_top | g_anchor_left);
	oPanelControl.AddControl(oMenuButtonControl);

	var oDrawingMenuButton = new CDrawingButtonFileMenu(this, true);
	oDrawingMenuButton.Init(sMenuButton, oGameTree);
	this.Register_MenuButton(oDrawingMenuButton);
	this.m_aElements.push(oDrawingMenuButton);
	//------------------------------------------------------------------------------------------------------------------
	// Навигатор и панель управления
	//------------------------------------------------------------------------------------------------------------------
	var oManagerControl = CreateControlContainer(sManagerDivId);
	oManagerControl.Bounds.SetParams(0, GameInfoH + InfoH, 0, 0, true, true, true, false, -1, ManagerH);
	oManagerControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	oPanelControl.AddControl(oManagerControl);

	var sNavigatorDivId = sMainDivId + "N";
	var sToolsDivId     = sMainDivId + "T";
	this.private_CreateDiv(oManagerControl.HtmlElement, sNavigatorDivId);
	this.private_CreateDiv(oManagerControl.HtmlElement, sToolsDivId);
	//------------------------------------------------------------------------------------------------------------------
	// Навигатор
	//------------------------------------------------------------------------------------------------------------------
	var oNavigatorControl = CreateControlContainer(sNavigatorDivId);
	oNavigatorControl.Bounds.SetParams(0, 0, 1000, 36, false, false, false, true, -1, -1);
	oNavigatorControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oManagerControl.AddControl(oNavigatorControl);

	var oDrawingNavigator = new CDrawingNavigator(this);
	oDrawingNavigator.Init(sNavigatorDivId, oGameTree);
	this.m_aElements.push(oDrawingNavigator);
	//------------------------------------------------------------------------------------------------------------------
	// Многоуровневый тулбар
	//------------------------------------------------------------------------------------------------------------------
	var oDrawingMultilevelToolbar = new CDrawingMultiLevelToolbar(this);
	oDrawingMultilevelToolbar.Init(sToolsDivId);

	var nToolbarHeight = oDrawingMultilevelToolbar.Get_Height();
	var oToolsControl = CreateControlContainer(sToolsDivId);
	oToolsControl.Bounds.SetParams(6, 0, 6, 0, true, false, true, true, -1, nToolbarHeight);
	oToolsControl.Anchor = (g_anchor_left | g_anchor_right | g_anchor_bottom);
	oManagerControl.AddControl(oToolsControl);

	oNavigatorControl.Bounds.SetParams(0, 0, 1000, nToolbarHeight + 1, false, false, false, true, -1, -1);

	var oThis = this;
	oDrawingMultilevelToolbar.Set_OnChangeCallback(function()
	{
		nToolbarHeight = oDrawingMultilevelToolbar.Get_Height();
		oToolsControl.Bounds.SetParams(6, 0, 6, 0, true, false, true, true, -1, nToolbarHeight);
		oNavigatorControl.Bounds.SetParams(0, 0, 1000, nToolbarHeight + 1, false, false, false, true, -1, -1);
		oThis.Update_Size(false);
	});
	this.m_aElements.push(oDrawingMultilevelToolbar);
	//------------------------------------------------------------------------------------------------------------------
	// Чат + ввод для чата + список игроков
	//------------------------------------------------------------------------------------------------------------------
	var oChatsControl = CreateControlContainer(sChatsDivId);
	oChatsControl.Bounds.SetParams(0, GameInfoH + InfoH + ManagerH + 1, 0, 1000, true, true, true, false, -1, -1);
	oChatsControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oPanelControl.AddControl(oChatsControl);

	var PlayerListW = 180;

	var sChatAreaDivId  = sChatsDivId + "A";
	var sChatInputDivId = sChatsDivId + "I";
	var sPlayersListDivId = sChatsDivId + "L";
	this.private_CreateDiv(oChatsControl.HtmlElement, sChatAreaDivId);
	this.private_CreateDiv(oChatsControl.HtmlElement, sChatInputDivId);
	this.private_CreateDiv(oChatsControl.HtmlElement, sPlayersListDivId);
	//------------------------------------------------------------------------------------------------------------------
	// Место под список игроков
	//------------------------------------------------------------------------------------------------------------------
	var oPlayersListControl = this.m_oGameHandler.PlayersList.Init(sPlayersListDivId, new CKGSInGamePlayersList(this.m_oGoUniverseApp));
	oPlayersListControl.Bounds.SetParams(0, 0, 0, 0, true, false, true, true, PlayerListW, -1);
	oPlayersListControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_bottom);
	oChatsControl.AddControl(oPlayersListControl);
	var oPlayerListElement = oPlayersListControl.HtmlElement;
	oPlayerListElement.style.borderTop  = "1px solid rgb(172, 172, 172)";
	oPlayerListElement.style.borderLeft = "1px solid rgb(172, 172, 172)";
	oPlayerListElement.style.background = "rgb(235, 235, 228)";
	this.m_oGameHandler.PlayersList.Set_BGColor(235, 235, 228);
	this.m_aElements.push(this.m_oGameHandler.PlayersList);
	//------------------------------------------------------------------------------------------------------------------
	// Место под чат
	//------------------------------------------------------------------------------------------------------------------
	var oChatAreaControl = CreateControlContainer(sChatAreaDivId);
	oChatAreaControl.Bounds.SetParams(0, 0, PlayerListW, ChatInputH, false, false, true, true, -1, -1);
	oChatAreaControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oChatsControl.AddControl(oChatAreaControl);

	var oDrawingComments = new CGoUniverseDrawingComments(this);
	oDrawingComments.Init(sChatAreaDivId, oGameTree, this.m_oGoUniverseApp);
	this.m_aElements.push(oDrawingComments);
	this.m_oGameHandler.CommentsHandler = oDrawingComments;
	//------------------------------------------------------------------------------------------------------------------
	// Место под ввод в чат
	//------------------------------------------------------------------------------------------------------------------
	var oChatInputControl = CreateControlContainer(sChatInputDivId);
	oChatInputControl.Bounds.SetParams(0, 0, PlayerListW, 0, false, false, true, true, -1, ChatInputH);
	oChatInputControl.Anchor = (g_anchor_left | g_anchor_right | g_anchor_bottom);
	oChatsControl.AddControl(oChatInputControl);

	var oChatInputArea = document.createElement("textarea");
	oChatInputArea.className = "ChatInput";
	oChatInputControl.HtmlElement.appendChild(oChatInputArea);

	var oThis = this;
	oChatInputArea.addEventListener("keydown", function(e)
	{
		if (13 === e.keyCode && true !== e.ctrlKey && true !== e.shiftKey && oThis.m_oGoUniverseApp && oThis.m_oVisualTab)
		{
			if ("" !== oChatInputArea.value)
			{
				var sMessage = oChatInputArea.value;
				sMessage = sMessage.replace(/\u000A/g, String.fromCharCode(0xFF0A));
				oThis.m_oGoUniverseApp.SendChatMessageInGameRoom(oThis.m_oVisualTab.GetId(), sMessage);
			}

			oChatInputArea.value = "";
			e.preventDefault();
		}
	});

	this.Update_Size();
	oGameTree.On_EndLoadDrawing();
};

//----------------------------------------------------------------------------------------------------------------------
// Специальный класс с комментариями
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseDrawingComments(oDrawing)
{
	this.m_oDrawing  = oDrawing;

	this.m_oTextArea   = null;
	this.m_oGameTree   = null;
	this.m_oLastNode   = null;
	this.m_oChatScroll = null;
	this.m_oClient     = null;
	this.m_oApp        = null;
}

CGoUniverseDrawingComments.prototype.Init = function(sDivId, oGameTree, oApp)
{
	this.m_oGameTree = oGameTree;
	this.m_oClient   = oApp.GetClient();
	this.m_oApp      = oApp;

	var oDivElement = document.getElementById(sDivId);
	oDivElement.style.background = new CColor(235, 235, 228, 255).ToString();
	oDivElement.className = "Selectable";

	var oAreaElement = document.createElement("div");
	oAreaElement.setAttribute("style", "position:absolute;padding:0;margin:0;top:0px;left:0px;right:0px;bottom:0px;font-family: 'Segoe UI',Helvetica,Tahoma,Geneva,Verdana,sans-serif;");
	oDivElement.appendChild(oAreaElement);
	oAreaElement.style.borderTop    = "1px solid rgb(172,172,172)";
	oAreaElement.style.borderBottom = "1px solid rgb(172,172,172)";
	oAreaElement.style.color        = "rgb(0, 0, 0)";
	oAreaElement.style.fontSize     = "12pt";
	oAreaElement.style.paddingLeft  = "5px";
	oAreaElement.style.whiteSpace   = "pre-wrap";
	oAreaElement.style.wordWrap     = "break-word";


	this.m_oTextArea = oAreaElement;

	this.m_oChatScroll = new CVerticalScroll();
	this.m_oChatScroll.Init(oAreaElement, "VerScroll", "VerScrollActive", true);
	this.m_oChatScroll.SetPaddings(0, 0, 2);

	this.Update_Size();
};
CGoUniverseDrawingComments.prototype.Update_Comments = function(sComments)
{
};
CGoUniverseDrawingComments.prototype.AddComment = function(sComment, oNode)
{
	if (this.m_oLastNode !== oNode)
	{
		this.private_AddMoveReference(oNode);
		this.m_oLastNode = oNode;
	}

	var aLines = SplitTextToLines(sComment);
	for (var nIndex = 0, nCount = aLines.length; nIndex < nCount; ++nIndex)
	{
		this.private_AddUserTextMessage(aLines[nIndex]);
	}

	this.private_CheckScrollTop();

	if (this.m_oChatScroll)
		this.m_oChatScroll.CheckVisibility();
};
CGoUniverseDrawingComments.prototype.private_AddMoveReference = function(oNode, sGameOverResult)
{
	var nMoveNumber = oNode.Get_MoveNumber();

	var sText = "";
	if (undefined !== sGameOverResult && "" !== sGameOverResult)
		sText = sGameOverResult;
	else if (0 === nMoveNumber)
		sText += "Game Start\n";
	else
		sText += "Move " + nMoveNumber + "\n";

	var oDiv = this.m_oTextArea;

	var oTextDiv = document.createElement("div");

	oTextDiv.className += " Selectable";


	var oTextSpan;
	oTextSpan                  = document.createElement("span");
	oTextSpan.style.fontWeight = "bold";
	oTextSpan.style.cursor     = "pointer";
	oTextSpan.textContent      = sText;
	oTextSpan.className        = "UserChatSpan";
	var oThis                  = this;
	oTextSpan.addEventListener("click", function()
	{
		oThis.m_oGameTree.GoTo_Node(oNode);
	});
	oTextDiv.appendChild(oTextSpan);

	oDiv.appendChild(oTextDiv);
};
CGoUniverseDrawingComments.prototype.AddGameOver = function(oNode, sResult)
{
	this.private_AddMoveReference(oNode, "Game Over: " + sResult);
	this.m_oLastNode = oNode;
	this.private_CheckScrollTop();
};
CGoUniverseDrawingComments.prototype.ScrollChatAreaToBottom = function()
{
	if (this.m_oChatScroll)
		this.m_oChatScroll.CheckVisibility(true);

	var oDiv = this.m_oTextArea;
	oDiv.scrollTop = oDiv.scrollHeight;
	
	this.m_oChatScroll.UpdatePosition();
};
CGoUniverseDrawingComments.prototype.private_AddUserTextMessage = function(sText)
{
	var oDiv = this.m_oTextArea;

	var oTextDiv = document.createElement("div");

	oTextDiv.className += " Selectable";


	var nPos = sText.indexOf(":");
	if (-1 === nPos || nPos > 18)
	{

		return;
	}

	var sUserNameWithRank = sText.substr(0, nPos);
	var sUserName = sUserNameWithRank;
	if (-1 !== sUserName.indexOf(" "))
		sUserName = sUserName.substr(0, sUserName.indexOf(" "));

	var sMessageText = sText.substr(nPos + 1);




	var oTextSpan;

	var bMessageForMe = false;
	var sCurUserName = (this.m_oClient ? this.m_oClient.GetUserName() : "");
	if ("" !== sCurUserName && 0 === sMessageText.indexOf(sCurUserName + ","))
		bMessageForMe = true;

	oTextSpan                  = document.createElement("span");
	oTextSpan.style.cursor     = "pointer";
	oTextSpan.textContent      = sUserNameWithRank + ":";
	oTextSpan.className        = "UserChatSpan";
	var oThis                  = this;
	oTextSpan.addEventListener("click", function()
	{
		// var oInputArea   = document.getElementById("inputChatId");
		// oInputArea.value = sUserName + ", " + oInputArea.value;
		// oInputArea.focus();
	});
	oTextSpan.addEventListener("contextmenu", function(e)
	{
		oThis.m_oApp.ShowUserContextMenu(e.pageX - 2, e.pageY + 2, sUserName);
		e.preventDefault();
		return false;
	}, false);
	oTextDiv.appendChild(oTextSpan);
	this.private_ParseMessage(oTextDiv, sMessageText);
	oTextDiv.appendChild(document.createElement("br"));

	oDiv.appendChild(oTextDiv);

	if (sUserName === sCurUserName)
		this.private_CheckScrollTop(true);
};
CGoUniverseDrawingComments.prototype.private_ParseMessage = function(oTextDiv, sMessage)
{
	var oGameTree     = this.m_oDrawing.Get_GameTree();
	var oDrawingBoard = oGameTree ? oGameTree.Get_DrawingBoard() : null;
	var oLogicBoard   = oGameTree ? oGameTree.Get_Board() : null;
	var oSize         = oLogicBoard ? oLogicBoard.Get_Size() : {X : 1, Y : 1};

	function private_AddSimpleText(sText)
	{
		var oTextSpan = document.createElement("span");
		oTextSpan.innerHTML = sText;
		oTextDiv.appendChild(oTextSpan);
	}
	
	function private_AddMoveReference(sRef)
	{
		var oTextSpan = document.createElement("span");
		oTextSpan.className = "InGameChatMoveRef";
		oTextSpan.innerHTML = sRef;
		oTextDiv.appendChild(oTextSpan);

		var oPos = Common_StringToXY(sRef, oSize.X, oSize.Y);

		oTextSpan.addEventListener("mouseover", function()
		{
			if (oDrawingBoard)
			{
				oDrawingBoard.Show_Hint(oPos.X + 1, oPos.Y + 1);
			}
		}, false);
		oTextSpan.addEventListener("mouseout", function()
		{
			if (oDrawingBoard)
			{
				oDrawingBoard.Hide_Hint();
			}
		}, false);
	}
	
	var sBuffer = "";
	for (var nPos = 0, nLen = sMessage.length; nPos < nLen; ++nPos)
	{
		if ((0 === nPos || sMessage.IsSpace(nPos - 1)) && sMessage.IsLatinLetter(nPos) && sMessage.IsDigit(nPos + 1))
		{
			var sRef = "";
			if (sMessage.IsSpaceOrPunctuation(nPos + 2) || sMessage.IsEnd(nPos + 2))
			{
				sRef = sMessage.substr(nPos, 2);
				nPos += 2;
			}
			else if (sMessage.IsDigit(nPos + 2) && (sMessage.IsSpaceOrPunctuation(nPos + 3) || sMessage.IsEnd(nPos + 3)))
			{
				sRef = sMessage.substr(nPos, 3);
				nPos += 3;
			}

			if ("" !== sRef)
			{
				if (null !== Common_StringToXY(sRef, oSize.X, oSize.Y))
				{
					if ("" !== sBuffer)
					{
						private_AddSimpleText(sBuffer);
						sBuffer = "";
					}

					private_AddMoveReference(sRef);
					sBuffer += sMessage.charAt(nPos);
				}
				else
				{
					sBuffer += sRef;
				}
			}
			else
			{
				sBuffer += sMessage.charAt(nPos);
			}
		}
		else
		{
			sBuffer += sMessage.charAt(nPos);
		}
	}

	if ("" !== sBuffer)
	{
		private_AddSimpleText(sBuffer);
		sBuffer = "";
	}
};
CGoUniverseDrawingComments.prototype.Update_Size = function()
{
	if (this.m_oChatScroll)
		this.m_oChatScroll.CheckVisibility();
};
CGoUniverseDrawingComments.prototype.private_CheckScrollTop = function(bForce)
{
	if (this.m_oChatScroll)
		this.m_oChatScroll.CheckVisibility();

	var oDiv = this.m_oTextArea;
	if (true === bForce || Math.abs(oDiv.scrollHeight - oDiv.scrollTop - oDiv.clientHeight) < 50)
		oDiv.scrollTop = oDiv.scrollHeight;
};

//----------------------------------------------------------------------------------------------------------------------
// Специальный класс с информацией об игроках
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseDrawingPlayerInfo(oDrawing)
{
	this.m_oDrawing  = oDrawing;
	this.m_nPlayer   = BOARD_EMPTY;
	this.m_oGameTree = null;

	this.HtmlElement =
	{
		Control   : null,

		NameDiv   : null,
		ScoresDiv : null,
		Image     : null
	};

	this.m_oImage  = null;
	this.m_sName   = "";
	this.m_sRank   = "";
	this.m_dScores = 0;
	this.m_bScores = false;
}
CGoUniverseDrawingPlayerInfo.prototype.Init = function(sDivId, oGameTree, nPlayer, sAvatarSrc, oTimeSettings)
{
	this.m_nPlayer   = nPlayer;
	this.m_oGameTree = oGameTree;

	if (oGameTree)
	{
		if (BOARD_BLACK === nPlayer)
		{
			this.m_sName = oGameTree.Get_BlackName();
			this.m_sRank = oGameTree.Get_BlackRating();
		}
		else if (BOARD_WHITE === nPlayer)
		{
			this.m_sName = oGameTree.Get_WhiteName();
			this.m_sRank = oGameTree.Get_WhiteRating();
		}
	}

	this.HtmlElement.Control          = CreateControlContainer(sDivId);
	var oDivElement                   = this.HtmlElement.Control.HtmlElement;
	oDivElement.style.backgroundColor = new CColor(217, 217, 217, 255).ToString();

	var nAvatarH = 110;
	var nAvatarW = (nAvatarH * 141 / 200);
	var nNameH   = 30;
	var nScoresH = 25;
	var nTimeH   = 25;

	// Аватарка
	var oAvatarDiv = document.createElement("div");
	oDivElement.appendChild(oAvatarDiv);
	oAvatarDiv.style.width  = "100%";
	oAvatarDiv.style.height = nAvatarH;
	oAvatarDiv.className    = "HorAlignCenter";

	var oAvatarImg = document.createElement("img");
	oAvatarDiv.appendChild(oAvatarImg);
	oAvatarImg.src    = sAvatarSrc;
	oAvatarImg.width  = nAvatarW;
	oAvatarImg.height = nAvatarH;

	// Имя и цвет
	var oNameWrapperDiv = document.createElement("div");
	oDivElement.appendChild(oNameWrapperDiv);
	oNameWrapperDiv.style.width  = "100%";
	oNameWrapperDiv.style.height = nNameH;
	oNameWrapperDiv.className    = "HorAlignCenter";

	var oCenterDiv                = document.createElement("div");
	oCenterDiv.style.margin       = "0 auto";
	oCenterDiv.style.whiteSpace   = "nowrap";
	oCenterDiv.style.maxWidth     = "100%";
	oCenterDiv.style.textOverflow = "ellipsis";
	oCenterDiv.style.height       = nNameH + "px";
	oCenterDiv.style.lineHeight   = nNameH + "px";
	oNameWrapperDiv.appendChild(oCenterDiv);

	// Цвет
	var oColorDiv = document.createElement("canvas");
	oCenterDiv.appendChild(oColorDiv);

	oColorDiv.setAttribute("id", sDivId + "_Image");
	oColorDiv.style.width     = 25 + "px";
	oColorDiv.style.height    = 25 + "px";
	oColorDiv.style["float"]  = "left";
	oColorDiv.width           = 25;
	oColorDiv.height          = 25;
	oColorDiv.style.marginTop = 2 + "px"; // (30 - 25) / 2

	var Canvas = oColorDiv.getContext("2d");
	var Size   = 25;
	Canvas.clearRect(0, 0, 25, 25);
	var X = Math.ceil(0.5 * Size + 0.5);
	var Y = Math.ceil(0.5 * Size + 0.5);
	var R = Math.ceil(0.25 * Size + 0.5);
	if (BOARD_WHITE === nPlayer)
	{
		Canvas.fillStyle   = (new CColor(255, 255, 255)).ToString();
		Canvas.strokeStyle = (new CColor(0, 0, 0)).ToString();
	}
	else if (BOARD_BLACK === nPlayer)
	{
		Canvas.fillStyle   = (new CColor(0, 0, 0)).ToString();
		Canvas.strokeStyle = (new CColor(0, 0, 0)).ToString();
	}
	Canvas.beginPath();
	Canvas.arc(X, Y, R, 0, 2 * Math.PI, false);
	Canvas.fill();
	Canvas.stroke();

	// Имя
	var oNameDiv = document.createElement("span");
	oCenterDiv.appendChild(oNameDiv);

	oNameDiv.style.fontSize = "14pt";

	// Захваченные
	var oScoresWrapperDiv = document.createElement("div");
	oDivElement.appendChild(oScoresWrapperDiv);
	oScoresWrapperDiv.style.width      = "100%";
	oScoresWrapperDiv.style.height     = nScoresH + "px";
	oScoresWrapperDiv.style.lineHeight = nScoresH + "px";
	oScoresWrapperDiv.className        = "HorAlignCenter";

	var oCenterDiv          = document.createElement("div");
	oCenterDiv.style.margin = "0 auto";
	oScoresWrapperDiv.appendChild(oCenterDiv);

	var oScoresDiv = document.createElement("div");
	oCenterDiv.appendChild(oScoresDiv);

	oScoresDiv.style["float"] = "left";
	oScoresDiv.style.fontSize = "12pt";

	// Время
	var oTimeWrapperDiv = document.createElement("div");
	oDivElement.appendChild(oTimeWrapperDiv);
	oTimeWrapperDiv.style.width      = "100%";
	oTimeWrapperDiv.style.height     = nTimeH + "px";
	oTimeWrapperDiv.style.lineHeight = nTimeH + "px";
	oTimeWrapperDiv.className        = "HorAlignCenter";

	var oCenterDiv          = document.createElement("div");
	oCenterDiv.style.margin = "0 auto";
	oTimeWrapperDiv.appendChild(oCenterDiv);

	var oTimeDiv = document.createElement("div");
	oCenterDiv.appendChild(oTimeDiv);

	oTimeDiv.style["float"] = "left";
	oTimeDiv.style.fontSize = "12pt";
	oTimeDiv.innerHTML      = "--:--";

	if (oTimeSettings)
	{
		Common.Set_InnerTextToElement(oTimeDiv, oTimeSettings.ToString());

		oTimeSettings.SetOnTick(function(sTime)
		{
			Common.Set_InnerTextToElement(oTimeDiv, sTime);
		});
	}

	if (this.m_oDrawing)
	{
		if (BOARD_BLACK === nPlayer)
			this.m_oDrawing.Register_BlackInfo(this);
		else if (BOARD_WHITE === nPlayer)
			this.m_oDrawing.Register_WhiteInfo(this);
	}

	this.m_oNameDiv   = oNameDiv;
	this.m_oScoresDiv = oScoresDiv;

	this.private_Update();
};
CGoUniverseDrawingPlayerInfo.prototype.Update_Size = function()
{
	this.private_Update();
};
CGoUniverseDrawingPlayerInfo.prototype.Update_Name = function(sName)
{
	this.m_sName = sName;
	this.private_Update();
};
CGoUniverseDrawingPlayerInfo.prototype.Update_Rank = function(sRank)
{
	this.m_sRank = sRank;
	this.private_Update();
};
CGoUniverseDrawingPlayerInfo.prototype.Update_Captured = function(dCaptured)
{
	this.m_bScores = false;
	this.m_dScores = dCaptured;
	this.private_Update();
};
CGoUniverseDrawingPlayerInfo.prototype.Update_Scores = function(dScores)
{
	this.m_bScores = true;
	this.m_dScores = dScores;
	this.private_Update();
};
CGoUniverseDrawingPlayerInfo.prototype.private_Update = function()
{
	var oNameDiv   = this.m_oNameDiv;
	var oScoresDiv = this.m_oScoresDiv;

	var sNameText   = ("" === this.m_sName ? (BOARD_BLACK === this.m_nPlayer ? "Black " : "White ") : this.m_sName) + ("" === this.m_sRank ? "" : "[" + this.m_sRank +  "]");
	var sScoresText = this.m_dScores + (true === this.m_bScores ? " points" : " captures");

	Common.Set_InnerTextToElement(oNameDiv, sNameText);
	Common.Set_InnerTextToElement(oScoresDiv, sScoresText);
};
//----------------------------------------------------------------------------------------------------------------------
// Специальный класс с информацией о текущем состоянии партии
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseDrawingGameState()
{
	this.m_oDiv        = null;
	this.m_oGame       = null;
	this.m_oCurNode    = null;
}
CGoUniverseDrawingGameState.prototype.Init = function(oParent, oGame)
{
	var oDiv = document.createElement("div");
	oParent.appendChild(oDiv);
	oDiv.style.whiteSpace = "no wrap";
	oDiv.style.fontSize   = "14pt";
	oDiv.style.fontFamily = '"Segoe UI", Helvetica, Tahoma, Geneva, Verdana, sans-serif';
	oDiv.innerHTML        = "Game Start: Black to play";

	var oThis = this;
	oDiv.addEventListener("click", function()
	{
		var oGame = oThis.m_oGame;
		if (!oGame || !oGame.GameTree || !oThis.m_oCurNode)
			return;

		oGame.GameTree.GoTo_Node(oThis.m_oCurNode);
	}, false);

	this.m_oDiv  = oDiv;
	this.m_oGame = oGame;

	this.private_UpdateCaptionStyle();
};
CGoUniverseDrawingGameState.prototype.Update = function()
{
	if (!this.m_oGame)
		return;

	this.m_oCurNode = this.m_oGame.CurNode;

	var oGameTree = this.m_oGame.GameTree;
	var bDemo     = this.m_oGame.Demo;
	var sResult   = this.m_oGame.Result;

	var oNode = this.m_oCurNode;
	var sText = "";

	if (null !== sResult && true !== bDemo)
	{
		sText += "Game Over: " + this.m_oGame.Result;
	}
	else
	{
		var nNext = oGameTree.Get_NextMove();

		while (true !== oNode.Have_Move())
		{
			var oPrevNode = oNode.Get_Prev();
			if (null === oPrevNode)
				break;

			oNode = oPrevNode;
		}

		if (oNode === oGameTree.Get_StartNode())
		{
			sText += "Game Start: ";
			nNext = BOARD_BLACK;
		}
		else
		{
			var nMoveNumber = oNode.Get_MoveNumber();
			var oMove       = oNode.Get_Move();
			var oSize       = oGameTree.Get_Board().Get_Size();
			var nMoveValue  = oMove.Get_Value();

			var sMove = 0 === nMoveValue ? "Pass" : Common_PosValueToString(nMoveValue, oSize.X, oSize.Y).toLowerCase();

			sText += "Move " + nMoveNumber + " (" + (BOARD_BLACK ===  oMove.Get_Type() ? "B " : "W ") + sMove + "): ";
			nNext = BOARD_BLACK ===  oMove.Get_Type() ? BOARD_WHITE : BOARD_BLACK;
		}

		sText += (BOARD_BLACK ===  nNext ? "Black to play" : "White to play");
	}

	Common.Set_InnerTextToElement(this.m_oDiv, sText);
	this.private_UpdateCaptionStyle();
};
CGoUniverseDrawingGameState.prototype.OnGameTreeStateChange = function(oGameTree, oIState)
{
	this.private_UpdateCaptionStyle();
};
CGoUniverseDrawingGameState.prototype.private_UpdateCaptionStyle = function()
{
	if (!this.m_oGame || !this.m_oGame.GameTree)
		return;

	var oDiv = this.m_oDiv;
	var oCurNode = this.m_oGame.GameTree.Get_CurNode();
	if (this.m_oCurNode !== oCurNode)
	{
		oDiv.style.color          = "#2a75f3";
		oDiv.style.textDecoration = "underline";
		oDiv.style.cursor         = "pointer";
		oDiv.title                = "Back to Game";
	}
	else
	{
		oDiv.style.color          = "rgb(0, 0, 0)";
		oDiv.style.textDecoration = "none";
		oDiv.style.cursor         = "default";
		oDiv.title                = "";
	}
};
