"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     29.06.2016
 * Time     2:33
 */

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
	if (' ' === nChar
		|| '!' === nChar
		|| ',' === nChar
		|| '.' === nChar
		|| '?' === nChar
		|| '-' === nChar
		|| ';' === nChar)
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
CDrawing.prototype.Create_GoUniverseViewerTemplate = function(sDivId, oApp, oTab, oGameRoom)
{
	this.m_oGoUniverseApp = oApp;
	this.m_oVisualTab     = oTab;
	this.m_sBlackAvatar   = oGameRoom.GetBlackAvatarUrl();
	this.m_sWhiteAvatar   = oGameRoom.GetWhiteAvatarUrl();
	this.m_oBlackTime     = oGameRoom.GetBlackTime();
	this.m_oWhiteTime     = oGameRoom.GetWhiteTime();
	this.m_oGameRoom      = oGameRoom;

	this.m_oCountDown       = new CGoUniverseDrawingCountDown();
	this.m_oCountingScores  = new CGoUniverseDrawingCountingScores(this, oGameRoom);

	this.m_oGoUniversePr = {
		GameInfoH: 37,
		InfoH    : 200,
		ManagerH : 200,
		ToolbarH : 36 + 2, // 36 - buttons + 1 space + 1px top border
		CountingH: this.m_oCountingScores.GetHeight(),

		CountingControl    : null,
		MatchToolbarControl: null,
		ChatsContol        : null,
		MenuButtonControl  : null,
		EditButtonControl  : null,
		ManagerControl     : null
	};

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
	// Заполняем правую панель. Делим на части (некоторые используются только во время игры):
	//  1. Информация о текущем состоянии партии
	//  2. Информация об игроках
	//  3. Навигатор + панель управления
	//  4. Панель с кнопками во время игры
	//  5. Панель подсчета очков
	//  6. Чат + ввод для чата
	//------------------------------------------------------------------------------------------------------------------
	var GameInfoH  = this.m_oGoUniversePr.GameInfoH;
	var InfoH      = this.m_oGoUniversePr.InfoH;
	var ManagerH   = this.m_oGoUniversePr.ManagerH;
	var ToolbarH   = this.m_oGoUniversePr.ToolbarH;
	var CountingH  = this.m_oGoUniversePr.CountingH;
	//------------------------------------------------------------------------------------------------------------------
	// Информация об партии
	//------------------------------------------------------------------------------------------------------------------
	this.private_GoUniverseCreateInfoHeader(oPanelControl, oPanelControl.HtmlElement, sPanelDivId + "G", 0, GameInfoH);
	//------------------------------------------------------------------------------------------------------------------
	// Информация об игроках
	//------------------------------------------------------------------------------------------------------------------
	this.private_GoUniverseCreatePlayersInfo(oPanelControl, oPanelControl.HtmlElement, sPanelDivId + "I", GameInfoH + 3, InfoH - 3);
	//------------------------------------------------------------------------------------------------------------------
	// Кнопка меню
	//------------------------------------------------------------------------------------------------------------------
	this.private_GoUniverseCreateMenuButton(oPanelControl, oPanelControl.HtmlElement, sPanelDivId + "D");
	//------------------------------------------------------------------------------------------------------------------
	// Кнопка редактирования
	//------------------------------------------------------------------------------------------------------------------
	this.private_GoUniverseCreateEditButton(oPanelControl, oPanelControl.HtmlElement, sPanelDivId + "E");
	//------------------------------------------------------------------------------------------------------------------
	// Навигатор и панель управления
	//------------------------------------------------------------------------------------------------------------------
	this.private_GoUniverseCreateAnalyzeManager(oPanelControl, oPanelControl.HtmlElement, sPanelDivId + "M", GameInfoH + InfoH, ManagerH);
	//------------------------------------------------------------------------------------------------------------------
	// Панель для управления во время игры
	//------------------------------------------------------------------------------------------------------------------
	this.private_GoUniverseCreateMatchToolbar(oPanelControl, oPanelControl.HtmlElement, sPanelDivId + "T", GameInfoH + InfoH, ToolbarH - 1);
	//------------------------------------------------------------------------------------------------------------------
	// Панель подсчета очков
	//------------------------------------------------------------------------------------------------------------------
	this.private_GoUniverseCreateCountingScoresPanel(oPanelControl, oPanelControl.HtmlElement, sPanelDivId + "S", GameInfoH + InfoH, CountingH - 1);
	//------------------------------------------------------------------------------------------------------------------
	// Чат + ввод для чата + список игроков
	//------------------------------------------------------------------------------------------------------------------
	this.private_GoUniverseCreateChatPanel(oPanelControl, oPanelControl.HtmlElement, sPanelDivId + "C", GameInfoH + InfoH + ManagerH + 1);

	this.Update_Size();
	oGameTree.On_EndLoadDrawing();
};
CDrawing.prototype.private_GoUniverseCreateInfoHeader = function(oParentControl, oParentDiv, sDivId, nTop, nGameInfoH)
{
	var sGameInfoDivId = sDivId;
	this.private_CreateDiv(oParentDiv, sGameInfoDivId);

	var oGameInfoControl = CreateControlContainer(sGameInfoDivId);
	oGameInfoControl.Bounds.SetParams(0, nTop, 1000, 0, true, true, false, false, -1, nGameInfoH - 1);
	oGameInfoControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	oParentControl.AddControl(oGameInfoControl);
	oGameInfoControl.HtmlElement.style.borderBottom = "1px solid rgb(172, 172, 172)";
	oGameInfoControl.HtmlElement.className = "HorVerAlignCenter";

	var oGameState = new CGoUniverseDrawingGameState();
	oGameState.Init(oGameInfoControl.HtmlElement, this.m_oGameRoom);
	this.m_oGameRoom.SetStateHandler(oGameState);
	this.Add_StateHandler(oGameState);
};
CDrawing.prototype.private_GoUniverseCreatePlayersInfo = function(oParentControl, oParentDiv, sDivId, nTop, nInfoH)
{
	var sInfoDivId = sDivId;
	this.private_CreateDiv(oParentDiv, sInfoDivId);

	var oInfoControl = CreateControlContainer(sInfoDivId);
	oInfoControl.Bounds.SetParams(0, nTop, 1000, 0, true, true, false, false, -1, nInfoH);
	oInfoControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	oParentControl.AddControl(oInfoControl);

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
	oDrawingWhiteInfo.Init(sWhiteInfo, this.m_oGameTree, BOARD_WHITE, this.m_sWhiteAvatar, this.m_oWhiteTime);
	var oDrawingBlackInfo = new CGoUniverseDrawingPlayerInfo(this);
	oDrawingBlackInfo.Init(sBlackInfo, this.m_oGameTree, BOARD_BLACK, this.m_sBlackAvatar, this.m_oBlackTime);

	this.m_aElements.push(oDrawingBlackInfo);
	this.m_aElements.push(oDrawingWhiteInfo);

	var sCountDown = sInfoDivId + "CountDown";
	this.private_CreateDiv(oInfoControl.HtmlElement, sCountDown);

	var oCountDownControl = CreateControlContainer(sCountDown);
	oCountDownControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
	oCountDownControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oInfoControl.AddControl(oCountDownControl);

	this.m_oCountDown.Init(oCountDownControl.HtmlElement);

	this.m_oGameRoom.SetWhiteInfoHandler(oDrawingWhiteInfo);
	this.m_oGameRoom.SetBlackInfoHandler(oDrawingBlackInfo);
};
CDrawing.prototype.private_GoUniverseCreateMenuButton = function(oParentControl, oParentDiv, sDivId)
{
	var sMenuButton = sDivId;
	this.private_CreateDiv(oParentDiv, sMenuButton);
	var oMenuButtonControl = CreateControlContainer(sMenuButton);
	oMenuButtonControl.Bounds.SetParams(7, 0, 1000, 7, true, true, false, true, 36, 36);
	oMenuButtonControl.Anchor = (g_anchor_top | g_anchor_left);
	oParentControl.AddControl(oMenuButtonControl);

	var oDrawingMenuButton = new CDrawingButtonFileMenu(this, true);
	oDrawingMenuButton.Init(sMenuButton, this.m_oGameTree);
	this.Register_MenuButton(oDrawingMenuButton);
	this.m_aElements.push(oDrawingMenuButton);

	this.m_oGoUniversePr.MenuButtonControl = oMenuButtonControl;
};
CDrawing.prototype.private_GoUniverseCreateEditButton = function(oParentControl, oParentDiv, sDivId)
{
	var sEditButton = sDivId;
	this.private_CreateDiv(oParentDiv, sEditButton);
	var oEditButtonControl = CreateControlContainer(sEditButton);
	oEditButtonControl.Bounds.SetParams(0, 0, 7, 7, false, true, true, true, 36, 36);
	oEditButtonControl.Anchor = (g_anchor_top | g_anchor_right);
	oParentControl.AddControl(oEditButtonControl);

	var oEditButton = new CGoUniverseButtonEditorControl(this);
	oEditButton.Init(sEditButton, this.m_oGameTree);
	this.Register_EditorControlButton(oEditButton);
	this.m_aElements.push(oEditButton);

	this.m_oGoUniversePr.EditButtonControl = oEditButtonControl;
};
CDrawing.prototype.private_GoUniverseCreateAnalyzeManager = function(oParentControl, oParentDiv, sDivId, nTop, nH)
{
	var sManagerDivId = sDivId;
	this.private_CreateDiv(oParentDiv, sManagerDivId);

	var oManagerControl = CreateControlContainer(sManagerDivId);
	oManagerControl.Bounds.SetParams(0, nTop, 0, 0, true, true, true, false, -1, nH);
	oManagerControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	oParentControl.AddControl(oManagerControl);

	this.m_oGoUniversePr.ManagerControl = oManagerControl;

	var sNavigatorDivId = sManagerDivId + "N";
	var sToolsDivId     = sManagerDivId + "T";
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
	oDrawingNavigator.Init(sNavigatorDivId, this.m_oGameTree);
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
};
CDrawing.prototype.private_GoUniverseCreateChatPanel = function(oParentControl, oParentDiv, sDivId, nTop)
{
	var ChatInputH = 30;

	var sChatsDivId = sDivId;
	this.private_CreateDiv(oParentDiv, sChatsDivId);

	var oChatsControl = CreateControlContainer(sChatsDivId);
	oChatsControl.Bounds.SetParams(0, nTop, 0, 1000, true, true, true, false, -1, -1);
	oChatsControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oParentControl.AddControl(oChatsControl);

	this.m_oGoUniversePr.ChatsContol = oChatsControl;

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
	var oPlayersListView = this.m_oGameRoom.GetPlayersListView();
	var oPlayersListControl = oPlayersListView.Init(sPlayersListDivId, new CKGSInGamePlayersList(this.m_oGoUniverseApp, this.m_oGameRoom.GetRoomId()));
	oPlayersListControl.Bounds.SetParams(0, 0, 0, 0, true, false, true, true, PlayerListW, -1);
	oPlayersListControl.Anchor = (g_anchor_top | g_anchor_right | g_anchor_bottom);
	oChatsControl.AddControl(oPlayersListControl);
	var oPlayerListElement = oPlayersListControl.HtmlElement;
	oPlayerListElement.style.borderTop  = "1px solid rgb(172, 172, 172)";
	oPlayerListElement.style.borderLeft = "1px solid rgb(172, 172, 172)";
	oPlayerListElement.style.background = "rgb(235, 235, 228)";
	oPlayersListView.Set_BGColor(235, 235, 228);
	this.m_aElements.push(oPlayersListView);
	//------------------------------------------------------------------------------------------------------------------
	// Место под чат
	//------------------------------------------------------------------------------------------------------------------
	var oChatAreaControl = CreateControlContainer(sChatAreaDivId);
	oChatAreaControl.Bounds.SetParams(0, 0, PlayerListW, ChatInputH, false, false, true, true, -1, -1);
	oChatAreaControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oChatsControl.AddControl(oChatAreaControl);

	var oDrawingComments = new CGoUniverseDrawingComments(this);
	oDrawingComments.Init(sChatAreaDivId, this.m_oGameTree, this.m_oGoUniverseApp);
	this.m_aElements.push(oDrawingComments);
	this.m_oGameRoom.SetCommentsHandler(oDrawingComments);
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

	this.m_oChatInput = oChatInputArea;

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
};
CDrawing.prototype.private_GoUniverseCreateMatchToolbar = function(oParentControl, oParentDiv, sDivId, nTop, nH)
{
	var sToolbarDivId = sDivId;
	this.private_CreateDiv(oParentDiv, sToolbarDivId);

	var oToolBarControlWrapper = CreateControlContainer(sToolbarDivId);
	oToolBarControlWrapper.Bounds.SetParams(0, nTop, 0, 0, true, true, true, false, -1, nH);
	oToolBarControlWrapper.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	oParentControl.AddControl(oToolBarControlWrapper);
	oToolBarControlWrapper.HtmlElement.style.borderTop  = "1px solid rgb(172, 172, 172)";

	this.m_oGoUniversePr.MatchToolbarControl = oToolBarControlWrapper;

	var sToolbarInnerDivId = sToolbarDivId + "I";
	this.private_CreateDiv(oToolBarControlWrapper.HtmlElement, sToolbarInnerDivId);
	var oToolBarControl = CreateControlContainer(sToolbarInnerDivId);
	oToolBarControl.Bounds.SetParams(3, 1, 3, 0, true, true, true, true, -1, -1);
	oToolBarControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oToolBarControlWrapper.AddControl(oToolBarControl);

	var oDrawingToolbar = new CDrawingToolbar(this);
	oDrawingToolbar.Add_Control(new CGoUniverseButtonUndo(this, this.m_oGameRoom), 72, 1, EToolbarFloat.Left);
	oDrawingToolbar.Add_Control(new CGoUniverseButtonPass(this, this.m_oGameRoom), 72, 1, EToolbarFloat.Left);
	oDrawingToolbar.Add_Control(new CGoUniverseButtonResign(this, this.m_oGameRoom), 72, 1, EToolbarFloat.Left);
	oDrawingToolbar.Add_Control(new CDrawingButtonAbout(this), 36, 1, EToolbarFloat.Right);
	oDrawingToolbar.Add_Control(new CDrawingButtonGameInfo(this), 36, 1, EToolbarFloat.Right);
	oDrawingToolbar.Init(sToolbarInnerDivId, this.m_oGameTree);

	this.m_aElements.push(oDrawingToolbar);
};
CDrawing.prototype.private_GoUniverseCreateCountingScoresPanel = function(oParentControl, oParentDiv, sDivId, nTop, nH)
{
	var sCountingDivId = sDivId;
	this.private_CreateDiv(oParentDiv, sCountingDivId);
	var oCountingControlWrapper = CreateControlContainer(sCountingDivId);
	oCountingControlWrapper.Bounds.SetParams(0, nTop, 0, 0, true, true, true, false, -1, nH);
	oCountingControlWrapper.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	oParentControl.AddControl(oCountingControlWrapper);
	oCountingControlWrapper.HtmlElement.style.borderTop  = "1px solid rgb(172, 172, 172)";
	this.m_oCountingScores.Init(sCountingDivId);
	oCountingControlWrapper.HtmlElement.style.display = "none";
	this.m_aElements.push(this.m_oCountingScores);

	this.m_oGoUniversePr.CountingControl = oCountingControlWrapper;
};
CDrawing.prototype.Add_CommentWithCoordinates = function(sComment)
{
	if (this.m_oChatInput)
	{
		if ("" !== this.m_oChatInput.value && ' ' !== this.m_oChatInput.value.charAt(this.m_oChatInput.value.length - 1))
			this.m_oChatInput.value += " " + sComment + " ";
		else
			this.m_oChatInput.value += sComment + " ";
	}
};
CDrawing.prototype.GoUniverseOnCounting = function()
{
	var oPr = this.m_oGoUniversePr;

	oPr.CountingControl.HtmlElement.style.display     = "block";
	oPr.ManagerControl.HtmlElement.style.display      = "none";
	oPr.MatchToolbarControl.HtmlElement.style.display = "none";
	oPr.EditButtonControl.HtmlElement.style.display   = "none";
	oPr.MenuButtonControl.HtmlElement.style.display   = "none";

	oPr.ChatsContol.SetParams(0, oPr.GameInfoH + oPr.InfoH + oPr.CountingH + 1, 0, 1000, true, true, true, false, -1, -1);
	this.Update_Size();
};
CDrawing.prototype.GoUniverseOnMatch = function()
{
	var oPr = this.m_oGoUniversePr;

	oPr.CountingControl.HtmlElement.style.display     = "none";
	oPr.ManagerControl.HtmlElement.style.display      = "none";
	oPr.MatchToolbarControl.HtmlElement.style.display = "block";
	oPr.EditButtonControl.HtmlElement.style.display   = "none";
	oPr.MenuButtonControl.HtmlElement.style.display   = "none";

	oPr.MatchToolbarControl.SetParams(0, oPr.GameInfoH + oPr.InfoH, 0, 1000, true, true, true, false, -1, oPr.ToolbarH - 1);
	oPr.ChatsContol.SetParams(0, oPr.GameInfoH + oPr.InfoH + oPr.ToolbarH + 1, 0, 1000, true, true, true, false, -1, -1);
	this.Update_Size();
};
CDrawing.prototype.GoUniverseOnView = function()
{
	var oPr = this.m_oGoUniversePr;

	oPr.CountingControl.HtmlElement.style.display     = "none";
	oPr.ManagerControl.HtmlElement.style.display      = "block";
	oPr.MatchToolbarControl.HtmlElement.style.display = "none";
	oPr.EditButtonControl.HtmlElement.style.display   = "block";
	oPr.MenuButtonControl.HtmlElement.style.display   = "block";

	oPr.ChatsContol.SetParams(0, oPr.GameInfoH + oPr.InfoH + oPr.ManagerH + 1, 0, 1000, true, true, true, false, -1, -1);
	this.Update_Size();
};
CDrawing.prototype.GoUniverseOnMatchAnalyze = function()
{
	var oPr = this.m_oGoUniversePr;

	oPr.CountingControl.HtmlElement.style.display     = "none";
	oPr.ManagerControl.HtmlElement.style.display      = "block";
	oPr.MatchToolbarControl.HtmlElement.style.display = "block";
	oPr.EditButtonControl.HtmlElement.style.display   = "none";
	oPr.MenuButtonControl.HtmlElement.style.display   = "block";

	oPr.MatchToolbarControl.SetParams(0, oPr.GameInfoH + oPr.InfoH + oPr.ManagerH + 1, 0, 1000, true, true, true, false, -1, oPr.ToolbarH - 1);
	oPr.ChatsContol.SetParams(0, oPr.GameInfoH + oPr.InfoH + oPr.ToolbarH + 1 + oPr.ManagerH + 1, 0, 1000, true, true, true, false, -1, -1);

	this.Update_Size();
};
CDrawing.prototype.GoUniverseUpdateScoresDone = function(bWhiteDone, bBlackDone)
{
	this.m_oCountingScores.UpdateDoneState(bWhiteDone, bBlackDone);
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
		if ((0 === nPos || sMessage.IsSpaceOrPunctuation(nPos - 1)) && sMessage.IsLatinLetter(nPos) && sMessage.IsDigit(nPos + 1))
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
		Image     : null,
		TimeDiv   : null
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

	oTimeDiv.style["float"]  = "left";
	oTimeDiv.style.fontSize  = "12pt";
	oTimeDiv.innerHTML       = "--:--";
	oTimeDiv.style.border    = "1px solid transparent";
	oTimeDiv.style.width     = "100px";
	oTimeDiv.style.textAlign = "center";

	this.HtmlElement.TimeDiv = oTimeDiv;

	if (oTimeSettings)
	{
		Common.Set_InnerTextToElement(oTimeDiv, oTimeSettings.ToString());

		var oGameRoom  = this.m_oDrawing.m_oGameRoom;
		var oSound     = oApp.GetSound();
		oTimeSettings.SetOnTick(function(sTime)
		{
			if (oGameRoom.IsPlayer() && oGameRoom.IsOurMove() && this.IsCountDown())
			{
				var nCurTime = this.GetCountDownTime();
				var nLimit   = this.GetCountDownLimit();

				oSound.PlayCountDown(nCurTime, nLimit);
			}

			if (this.IsCountDown() && oTimeDiv.className !== "blinkCountDownTime")
				oTimeDiv.className = "blinkCountDownTime";
			else if (!this.IsCountDown() && oTimeDiv.className === "blinkCountDownTime")
				oTimeDiv.className = "";

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
CGoUniverseDrawingPlayerInfo.prototype.StopCountDown = function()
{
	this.HtmlElement.TimeDiv.className = "";
};
//----------------------------------------------------------------------------------------------------------------------
// Специальный класс с информацией о текущем состоянии партии
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseDrawingGameState()
{
	this.m_oDiv      = null;
	this.m_oGameRoom = null;
	this.m_oCurNode  = null;
}
CGoUniverseDrawingGameState.prototype.Init = function(oParent, oGameRoom)
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
		var oGameRoom = oThis.m_oGameRoom;
		if (!oGameRoom)
			return;

		oGameRoom.BackToGame();
	}, false);

	this.m_oDiv      = oDiv;
	this.m_oGameRoom = oGameRoom;

	this.private_UpdateCaptionStyle();
};
CGoUniverseDrawingGameState.prototype.Update = function()
{
	if (!this.m_oGameRoom)
		return;

	this.m_oCurNode = this.m_oGameRoom.GetCurNode();

	var oGameTree = this.m_oGameRoom.GetGameTree();
	var bDemo     = this.m_oGameRoom.IsDemonstration();
	var sResult   = this.m_oGameRoom.GetResult();

	var oNode = this.m_oCurNode;
	var sText = "";

	if (null !== sResult && true !== bDemo)
	{
		sText += "Game Over: " + sResult;
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
	if (!this.m_oGameRoom)
		return;

	var oDiv = this.m_oDiv;
	var oCurNode = this.m_oGameRoom.GetGameTree().Get_CurNode();
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
//----------------------------------------------------------------------------------------------------------------------
// Кнопка меню
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseButtonEditorControl(oDrawing)
{
	CGoUniverseButtonEditorControl.superclass.constructor.call(this, oDrawing);

	var oMainDiv  = oDrawing.Get_MainDiv();
	var oGameTree = oDrawing.Get_GameTree();

	var oMenuElementWrapper                   = document.createElement("div");
	oMenuElementWrapper.style.position        = "absolute";
	oMenuElementWrapper.style.top             = "40px";
	oMenuElementWrapper.style.width           = "200px";
	oMenuElementWrapper.style.backgroundColor = "white";
	oMenuElementWrapper.style.borderWidth     = "1px";
	oMenuElementWrapper.style.borderColor     = "#b3b3b3";
	oMenuElementWrapper.style.borderStyle     = "solid";
	oMenuElementWrapper.style.padding         = "0px";
	oMenuElementWrapper.style.boxShadow       = "0px 0px 2px 0px rgba(0,0,0,0.3)";
	oMenuElementWrapper.style.opacity         = "1";
	oMenuElementWrapper.style.zIndex          = "10";
	oMenuElementWrapper.style.overflowX       = "hidden";
	oMenuElementWrapper.style.overflowY       = "hidden";
	oMenuElementWrapper.style.maxHeight       = "calc(100vh - 90px)";

	oMenuElementWrapper.style.transitionProperty = "height";
	oMenuElementWrapper.style.transitionDuration = "0.2s";
	oMenuElementWrapper.style.transitionDelay    = "0s";


	oMainDiv.appendChild(oMenuElementWrapper);

	var oThis = this;
	this.private_CreateMenuItem(oMenuElementWrapper, "Back to game", function()
	{
		var oGameRoom = oDrawing.m_oGameRoom;
		if (!oGameRoom)
			return;

		oGameRoom.BackToGame();
	});
	this.private_CreateMenuItem(oMenuElementWrapper, "Remove own changes", function()
	{
		var oGameRoom = oDrawing.m_oGameRoom;
		if (!oGameRoom)
			return;
		
		oGameRoom.RemoveOwnChanges();
	});
	this.private_CreateMenuItem(oMenuElementWrapper, "Return control", function()
	{
		var oGameRoom = oDrawing.m_oGameRoom;
		if (!oGameRoom)
			return;

		oGameRoom.ReturnControlToOwner();
	});

	this.m_oMenuElement  = oMenuElementWrapper;
	this.m_nHeight       = oMenuElementWrapper.clientHeight;
	this.m_nWidth        = oMenuElementWrapper.clientWidth;
	this.m_nTransitionId = null;
	this.m_nShowId       = null;

	oMenuElementWrapper.style.display = "none";
}
CommonExtend(CGoUniverseButtonEditorControl, CDrawingButtonBase);

CGoUniverseButtonEditorControl.prototype.private_DrawOnCanvas = function(Canvas, Size, X_off, Y_off, bDisabled, W, H, BackColor, FillColor)
{
	var Text       = String.fromCharCode(0x270E);
	var FontSize   = Size * 0.8;
	var FontFamily = "Arial";
	var sFont      = FontSize + "px " + FontFamily;

	Canvas.fillStyle = (true === this.m_oActiveBColor.Compare(BackColor) ? "rgb(167, 167, 167)" : "rgb(217, 217, 217)");
	Canvas.fillRect(0, 0, Size + 2 * X_off, Size + 2 * X_off);

	Canvas.fillStyle = "rgb(0, 0, 0)";
	Canvas.font = sFont;

	var Y = Y_off + Size / 2 + FontSize / 3;
	var X = X_off + (Size - Canvas.measureText(Text).width) / 2;

	Canvas.fillText(Text, X, Y);
};
CGoUniverseButtonEditorControl.prototype.private_CreateMenuItem = function(oMenuElement, sText, pOnClickHandler)
{
	var oItemWrapper           = document.createElement("div");
	oItemWrapper.style.padding = "0px";
	oItemWrapper.style.maring  = "0px";
	oMenuElement.appendChild(oItemWrapper);

	var oItemElement                   = document.createElement("div");
	oItemElement.style.display         = "flex";
	oItemElement.style.alignItems      = "center";
	oItemElement.style.padding         = "0px";
	oItemElement.style.position        = "relative";
	oItemElement.style.cursor          = "pointer";
	oItemElement.style.transition      = "background-color 0.25s ease";
	oItemElement.style.backgroundColor = "#fff";
	oItemElement.style.color           = "#424242";
	oItemElement.style.border          = "1px solid transparent";
	oItemElement.style.outline         = "none";
	oItemWrapper.appendChild(oItemElement);


	var oInnerDiv                = document.createElement("div");
	oInnerDiv.style.padding      = "10px 20px";
	oInnerDiv.style.position     = "relative";
	oInnerDiv.style.cursor       = "pointer";
	oInnerDiv.style.borderBottom = "1px solid #e6e7e8";
	oInnerDiv.style.transition   = "background-color 0.25s ease";
	oInnerDiv.style.outline      = "none";
	oInnerDiv.style.width        = "100%";
	oItemElement.appendChild(oInnerDiv);

	var TextSpan = document.createElement("span");

	TextSpan.style.color         = "#4d4d4d";
	TextSpan.style.fontFamily    = '"Segoe UI Light","Segoe UI Semilight","Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
	TextSpan.style.fontWeight    = 'lighter';
	TextSpan.style.fontSize      = "15px";
	TextSpan.style.userSelect    = "none";
	TextSpan.style.verticalAlign = "middle";
	TextSpan.style.cursor        = "pointer";

	Common.Set_InnerTextToElement(TextSpan, sText);
	oInnerDiv.appendChild(TextSpan);

	oItemElement.onmouseover = function()
	{
		oItemElement.style.backgroundColor = "#e6e6e6";
		oItemElement.style.color           = "#424242";
	};

	oItemElement.onmouseout = function()
	{
		oItemElement.style.background = "transparent";
		oItemElement.style.color      = "#424242";
		oItemElement.style.border     = "1px solid transparent";
	};

	oItemElement.onmousedown = function()
	{
		oItemElement.style.backgroundColor = "#969696";
		oItemElement.style.border          = "1px solid #737373";
		oItemElement.style.color           = "#424242";
	};

	oItemElement.onmouseup = function()
	{
		oItemElement.style.backgroundColor = "#e6e6e6";
		oItemElement.style.color           = "#424242";
		oItemElement.style.border          = "1px solid transparent";
	};

	var oThis = this;
	oItemElement.onclick = function()
	{
		if (pOnClickHandler)
			pOnClickHandler();

		oThis.Hide_Menu(true);
	};

	return oItemWrapper;
};
CGoUniverseButtonEditorControl.prototype.private_HandleMouseDown = function()
{
	this.Show_Menu();
};
CGoUniverseButtonEditorControl.prototype.private_GetHint = function()
{
	return "Editor control";
};
CGoUniverseButtonEditorControl.prototype.Show_Menu = function()
{
	if ("none" === this.m_oMenuElement.style.display)
	{
		if (null === this.m_nShowId)
		{
			var oThis = this;
			this.m_nShowId = setTimeout(function ()
			{
				if (null !== oThis.m_nTransitionId)
				{
					clearTimeout(oThis.m_nTransitionId);
					oThis.m_nTransitionId = null;
				}

				oThis.m_oMenuElement.style.display = "block";
				oThis.m_oMenuElement.style.height  = "0px";

				oThis.m_nTransitionId = setTimeout(function ()
				{
					oThis.m_oMenuElement.style.height = oThis.m_nHeight + "px";
					oThis.m_nTransitionId = null;
					oThis.m_nShowId       = null;
					oThis.Set_Selected(true);
				}, 20);
			}, 20);
		}
	}
	else
	{
		this.Hide_Menu();
	}
};
CGoUniverseButtonEditorControl.prototype.Hide_Menu = function(bFast)
{
	if ("none" !== this.m_oMenuElement.style.display)
	{
		if (true === bFast)
		{
			this.m_oMenuElement.style.height  = "0px";
			this.m_oMenuElement.style.display = "none";
			this.Set_Selected(false);
		}
		else
		{

			if (null !== this.m_nTransitionId)
			{
				clearTimeout(this.m_nTransitionId);
				this.m_nTransitionId = null;
			}

			this.m_oMenuElement.style.height = "0px";
			var oThis                               = this;
			this.m_nTransitionId                    = setTimeout(function()
			{
				oThis.m_oMenuElement.style.display = "none";
				oThis.m_nTransitionId                     = null;
				oThis.Set_Selected(false);
			}, 200);
		}
	}
};
CGoUniverseButtonEditorControl.prototype.Update_Size = function()
{
	CDrawingButtonFileMenu.superclass.Update_Size.apply(this, arguments);
	var oOffset = this.m_oDrawing.Get_ElementOffset(this.HtmlElement.Control.HtmlElement);

	var nLeft = oOffset.X;
	var nTop  = oOffset.Y + 36 + 5;

	var nOverallW = this.m_oDrawing.Get_Width();
	var nOverallH = this.m_oDrawing.Get_Height();

	var nMinOffset = 5;

	if (nLeft + this.m_nWidth  > nOverallW - nMinOffset)
		nLeft = nOverallW - nMinOffset - this.m_nWidth;

	if (nLeft < nMinOffset)
		nLeft = nMinOffset;

	if (nTop + this.m_nHeight > nOverallH - nMinOffset)
		nTop = nOverallH - nMinOffset - this.m_nHeight;

	if (nTop < nMinOffset)
		nTop = nMinOffset;

	this.m_nTop = nTop;

	this.m_oMenuElement.style.left = nLeft + "px";
	this.m_oMenuElement.style.top  = nTop + "px";
};
CGoUniverseButtonEditorControl.prototype.private_ClickTransformIn = function()
{
};
CGoUniverseButtonEditorControl.prototype.private_ClickTransformOut = function()
{
};
//----------------------------------------------------------------------------------------------------------------------
// Кнопка Undo
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseButtonUndo(oDrawing, oGameRoom)
{
	CGoUniverseButtonUndo.superclass.constructor.call(this, oDrawing);

	this.m_oGameRoom = oGameRoom;
}
CommonExtend(CGoUniverseButtonUndo, CDrawingButtonBase);

CGoUniverseButtonUndo.prototype.private_DrawOnCanvas = function(Canvas, Size, X_off, Y_off, bDisabled, W, H, BackColor, FillColor)
{
	var Text       = "Undo";
	var FontSize   = 20;
	var FontFamily = "Times New Roman, Sans serif";
	var sFont      = FontSize + "px " + FontFamily;

	Canvas.font = sFont;

	var Y = Y_off + Size / 2 + FontSize / 3;
	var X = X_off + (Size - Canvas.measureText(Text).width) / 2;

	Canvas.fillText(Text, X, Y);
};
CGoUniverseButtonUndo.prototype.private_HandleMouseDown = function()
{
	this.m_oGameRoom.RequestUndo();
};
CGoUniverseButtonUndo.prototype.private_GetHint = function()
{
	return "Request an undo";
};
//----------------------------------------------------------------------------------------------------------------------
// Кнопка Pass
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseButtonPass(oDrawing, oGameRoom)
{
	CGoUniverseButtonPass.superclass.constructor.call(this, oDrawing);

	this.m_oGameRoom = oGameRoom;
}
CommonExtend(CGoUniverseButtonPass, CDrawingButtonBase);

CGoUniverseButtonPass.prototype.private_DrawOnCanvas = function(Canvas, Size, X_off, Y_off, bDisabled, W, H, BackColor, FillColor)
{
	var Text       = "Pass";
	var FontSize   = 20;
	var FontFamily = "Times New Roman, Sans serif";
	var sFont      = FontSize + "px " + FontFamily;

	Canvas.font = sFont;

	var Y = Y_off + Size / 2 + FontSize / 3;
	var X = X_off + (Size - Canvas.measureText(Text).width) / 2;

	Canvas.fillText(Text, X, Y);
};
CGoUniverseButtonPass.prototype.private_HandleMouseDown = function()
{
	this.m_oGameTree.Pass();
};
CGoUniverseButtonPass.prototype.private_GetHint = function()
{
	return "Pass";
};
//----------------------------------------------------------------------------------------------------------------------
// Кнопка Resign
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseButtonResign(oDrawing, oGameRoom)
{
	CGoUniverseButtonResign.superclass.constructor.call(this, oDrawing);

	this.m_oGameRoom = oGameRoom;
}
CommonExtend(CGoUniverseButtonResign, CDrawingButtonBase);

CGoUniverseButtonResign.prototype.private_DrawOnCanvas = function(Canvas, Size, X_off, Y_off, bDisabled, W, H, BackColor, FillColor)
{
	var Text       = "Resign";
	var FontSize   = 20;
	var FontFamily = "Times New Roman, Sans serif";
	var sFont      = FontSize + "px " + FontFamily;

	Canvas.font = sFont;

	var Y = Y_off + Size / 2 + FontSize / 3;
	var X = X_off + (Size - Canvas.measureText(Text).width) / 2;

	Canvas.fillText(Text, X, Y);
};
CGoUniverseButtonResign.prototype.private_HandleMouseDown = function()
{
	var oApp  = this.m_oDrawing.m_oGoUniverseApp;
	var oThis = this;
	CreateKGSWindow(EKGSWindowType.ConfirmBase, {
		App        : oApp,
		Client     : oApp.GetClient(),
		Text       : "Are you sure do you want to resign?",
		WindowId   : "GameResign",
		W          : 300,
		H          : 140,
		Resizeable : false,
		OkHandler  : function()
		{
			oThis.m_oGameRoom.Resign();
		}
	});
};
CGoUniverseButtonResign.prototype.private_GetHint = function()
{
	return "Resignation";
};
//----------------------------------------------------------------------------------------------------------------------
// Кнопка Analyze
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseButtonAnalyze(oDrawing, oGameRoom)
{
	CGoUniverseButtonResign.superclass.constructor.call(this, oDrawing);

	this.m_oGameRoom = oGameRoom;
}
CommonExtend(CGoUniverseButtonAnalyze, CDrawingButtonBase);

CGoUniverseButtonAnalyze.prototype.private_DrawOnCanvas = function(Canvas, Size, X_off, Y_off, bDisabled, W, H, BackColor, FillColor)
{
	var Text       = "Analyze";
	var FontSize   = 20;
	var FontFamily = "Times New Roman, Sans serif";
	var sFont      = FontSize + "px " + FontFamily;

	Canvas.font = sFont;

	var Y = Y_off + Size / 2 + FontSize / 3;
	var X = X_off + (Size - Canvas.measureText(Text).width) / 2;

	Canvas.fillText(Text, X, Y);
};
CGoUniverseButtonAnalyze.prototype.private_HandleMouseDown = function()
{
	this.m_oGameRoom.ToggleAnalyze();
};
CGoUniverseButtonAnalyze.prototype.private_GetHint = function()
{
	return "Analyze the game";
};
//----------------------------------------------------------------------------------------------------------------------
// Панелька с подсчетом очков
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseDrawingCountingScores(oDrawing, oGameRoom)
{
	this.m_oDrawing  = oDrawing;
	this.m_oGameRoom = oGameRoom;

	this.m_oMainControl = null;
	this.m_oMainDiv     = null;

	this.nHeaderH = 40;
	this.nInfoH   = 70;
	this.nPlayerH = 25;
	this.nButtonH = 30;

	this.m_sWhiteName = oGameRoom.GetWhiteName();
	this.m_sBlackName = oGameRoom.GetBlackName();

	this.m_oWhiteDone = null;
	this.m_oBlackDone = null;
}
CGoUniverseDrawingCountingScores.prototype.Init = function(sDivId)
{
	this.m_oMainControl = CreateControlContainer(sDivId);
	this.m_oMainDiv     = this.m_oMainControl.HtmlElement;

	var nHeaderH = this.nHeaderH;
	var nInfoH   = this.nInfoH;
	var nPlayerH = this.nPlayerH;
	var nButtonH = this.nButtonH;

	var oHeaderDiv = this.private_CreateDiv(this.m_oMainDiv);
	var oInfoDiv   = this.private_CreateDiv(this.m_oMainDiv);
	var oWhiteDiv  = this.private_CreateDiv(this.m_oMainDiv);
	var oBlackDiv  = this.private_CreateDiv(this.m_oMainDiv);
	var oAcceptDiv = this.private_CreateDiv(this.m_oMainDiv);
	var oResumeDiv = this.private_CreateDiv(this.m_oMainDiv);

	this.private_CreateHeader(0, nHeaderH, oHeaderDiv);
	this.private_CreateInfo(nHeaderH, nInfoH, oInfoDiv);
	this.m_oWhiteDone = this.private_CreatePlayer(nHeaderH + nInfoH, nPlayerH, oWhiteDiv, this.m_sWhiteName);
	this.m_oBlackDone = this.private_CreatePlayer(nHeaderH + nInfoH + nPlayerH, nPlayerH, oBlackDiv, this.m_sBlackName);
	this.private_CreateAcceptButton(nHeaderH + nInfoH + 2 * nPlayerH, nButtonH, oAcceptDiv);
	this.private_CreateResumeButton(nHeaderH + nInfoH + 2 * nPlayerH + nButtonH, nButtonH, oResumeDiv);
};
CGoUniverseDrawingCountingScores.prototype.private_CreateDiv = function(oParent)
{
	var oElement = document.createElement("div");
	oElement.setAttribute("style", "position:absolute;padding:0;margin:0;");
	oElement.setAttribute("oncontextmenu", "return false;");
	oParent.appendChild(oElement);
	return oElement;
};
CGoUniverseDrawingCountingScores.prototype.Update_Size = function()
{
	this.m_oMainControl.Resize(this.m_oMainDiv.width, this.m_oMainDiv.height);
};
CGoUniverseDrawingCountingScores.prototype.private_CreatePlayer = function(nTop, nPlayerH, oPlayerDiv, sName)
{
	var oPlayerControl = CreateControlContainerByElement(oPlayerDiv);
	oPlayerControl.Bounds.SetParams(0, nTop, 0, 0, true, true, true, false, -1, nPlayerH);
	oPlayerControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	this.m_oMainControl.AddControl(oPlayerControl);

	var oInnerDiv = document.createElement("div");
	oInnerDiv.style.width       = "150px";
	oInnerDiv.style.display     = "block";
	oInnerDiv.style.marginLeft  = "auto";
	oInnerDiv.style.marginRight = "auto";
	oPlayerDiv.appendChild(oInnerDiv);

	var oBoolDiv = document.createElement("div");
	oBoolDiv.style["float"]  = "left";
	oBoolDiv.style.color     = "rgb(199,40,40)";
	oBoolDiv.innerHTML       = String.fromCharCode(0x2716);
	oBoolDiv.style.width     = "30px";
	oBoolDiv.style.textAlign = "center";
	oBoolDiv.style.fontSize    = "14px";
	oBoolDiv.style.fontFamily  = "'Segoe UI', Tahoma, sans-serif";
	oInnerDiv.appendChild(oBoolDiv);

	var oNameDiv = document.createElement("div");
	oNameDiv.style["float"]  = "left";
	oNameDiv.innerHTML       = sName;
	oNameDiv.style.textAlign = "left";
	oNameDiv.style.fontSize    = "14px";
	oNameDiv.style.fontFamily  = "'Segoe UI', Tahoma, sans-serif";
	oInnerDiv.appendChild(oNameDiv);

	return oBoolDiv;
};
CGoUniverseDrawingCountingScores.prototype.private_CreateHeader = function(nTop, nH, oDiv)
{
	var oHeaderControl = CreateControlContainerByElement(oDiv);
	oHeaderControl.Bounds.SetParams(0, nTop, 0, 0, true, true, true, false, -1, nH);
	oHeaderControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	this.m_oMainControl.AddControl(oHeaderControl);
	oHeaderControl.HtmlElement.style.borderBottom  = "1px solid rgb(172, 172, 172)";
	oDiv.innerHTML        = "Score counting phase";
	oDiv.style.textAlign  = "center";
	oDiv.style.fontSize   = "25px";
	oDiv.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
};
CGoUniverseDrawingCountingScores.prototype.private_CreateInfo = function(nTop, nH, oDiv)
{
	var oInfoControl = CreateControlContainerByElement(oDiv);
	oInfoControl.Bounds.SetParams(0, nTop, 0, 0, true, true, true, false, -1, nH);
	oInfoControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	this.m_oMainControl.AddControl(oInfoControl);
	var oInfoInnerDiv = document.createElement("div");
	oInfoInnerDiv.innerHTML         = "Both players now select and agree upon which groups should be considered 'dead' for the purpose of scoring.";
	oInfoInnerDiv.style.width       = "300px";
	oInfoInnerDiv.style.display     = "block";
	oInfoInnerDiv.style.marginLeft  = "auto";
	oInfoInnerDiv.style.marginRight = "auto";
	oInfoInnerDiv.style.fontSize    = "14px";
	oInfoInnerDiv.style.textAlign   = "center";
	oInfoInnerDiv.style.fontFamily  = "'Segoe UI', Tahoma, sans-serif";
	oDiv.appendChild(oInfoInnerDiv);
};
CGoUniverseDrawingCountingScores.prototype.private_CreateAcceptButton = function(nTop, nH, oButtonDiv)
{
	var oButtonControl = CreateControlContainerByElement(oButtonDiv);
	oButtonControl.Bounds.SetParams(0, nTop, 0, 0, true, true, true, true, -1, nH);
	oButtonControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	this.m_oMainControl.AddControl(oButtonControl);

	var oButton = document.createElement("div");
	oButtonDiv.appendChild(oButton);
	oButton.innerHTML = "Accept";
	oButton.className = "ButtonGreen";
	oButton.style.textAlign   = "center";
	oButton.style.width       = "200px";
	oButton.style.height      = (nH - 5) + "px";
	oButton.style.display     = "block";
	oButton.style.marginLeft  = "auto";
	oButton.style.marginRight = "auto";
	oButton.style.lineHeight  = (nH - 5 - 2) + "px";
	oButton.style.fontSize    = "14px";
	oButton.style.fontFamily  = "'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif";

	var oThis = this;
	oButton.addEventListener("click", function()
	{
		oThis.m_oGameRoom.SendDone();
	}, false);
};
CGoUniverseDrawingCountingScores.prototype.private_CreateResumeButton = function(nTop, nH, oButtonDiv)
{
	var oButtonControl = CreateControlContainerByElement(oButtonDiv);
	oButtonControl.Bounds.SetParams(0, nTop, 0, 0, true, true, true, true, -1, nH);
	oButtonControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right);
	this.m_oMainControl.AddControl(oButtonControl);

	var oButton = document.createElement("div");
	oButtonDiv.appendChild(oButton);
	oButton.innerHTML = "Cancel and resume game";
	oButton.className = "ButtonCommon";
	oButton.style.textAlign   = "center";
	oButton.style.width       = "200px";
	oButton.style.height      = (nH - 5) + "px";
	oButton.style.display     = "block";
	oButton.style.marginLeft  = "auto";
	oButton.style.marginRight = "auto";
	oButton.style.lineHeight  = (nH - 5 - 2) + "px";
	oButton.style.fontSize    = "14px";
	oButton.style.fontFamily  = "'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif";

	var oThis = this;
	oButton.addEventListener("click", function()
	{
		oThis.m_oGameRoom.RequestUndo();
	}, false);
};
CGoUniverseDrawingCountingScores.prototype.GetHeight = function()
{
	return this.nHeaderH + this.nInfoH + 2 * this.nPlayerH + 2 * this.nButtonH + 3;
};
CGoUniverseDrawingCountingScores.prototype.UpdateDoneState = function(bWhiteDone, bBlackDone)
{
	function privateSet(bDone, oBoolDiv)
	{
		if (true !== bDone)
		{
			oBoolDiv.style.color = "rgb(199,40,40)";
			oBoolDiv.innerHTML   = String.fromCharCode(0x2716);
		}
		else
		{
			oBoolDiv.style.color = "rgb(0,130,57)";
			oBoolDiv.innerHTML   = String.fromCharCode(0x2714);
		}
	}

	privateSet(bWhiteDone, this.m_oWhiteDone);
	privateSet(bBlackDone, this.m_oBlackDone);
};
//----------------------------------------------------------------------------------------------------------------------
// Таймер обратного отсчета
//----------------------------------------------------------------------------------------------------------------------
function CGoUniverseDrawingCountDown()
{
	this.m_oMainDiv = null;
}
CGoUniverseDrawingCountDown.prototype.Init = function(oDiv)
{
	this.m_oMainDiv = oDiv;

	oDiv.style.color      = "#000000";
	oDiv.style.fontSize   = "36pt";
	oDiv.style.fontFamily = '"Segoe UI", Helvetica, Tahoma, Geneva, Verdana, sans-serif';
	oDiv.style.textAlign  = "center";
	oDiv.style.paddingTop = "40px";
};
CGoUniverseDrawingCountDown.prototype.Update = function(nTime)
{
	var _nTime = nTime | 0;
	var sTime = "" + _nTime;
	this.m_oMainDiv.innerHTML = sTime;
};
CGoUniverseDrawingCountDown.prototype.Show = function()
{
	this.m_oMainDiv.style.display = "block";
};
CGoUniverseDrawingCountDown.prototype.Hide = function()
{
	this.m_oMainDiv.style.display = "none";
};