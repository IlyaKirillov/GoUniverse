"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     29.06.2016
 * Time     2:33
 */

//----------------------------------------------------------------------------------------------------------------------
// Дополнение к классу CDrawing
//----------------------------------------------------------------------------------------------------------------------
CDrawing.prototype.Create_GoUniverseViewerTemplate = function(sDivId, oApp, oTab, sWhiteAvatar, sBlackAvatar)
{
	this.m_oGoUniverseApp = oApp;
	this.m_oVisualTab     = oTab;
	this.m_sBlackAvatar   = sBlackAvatar;
	this.m_sWhiteAvatar   = sWhiteAvatar;

	this.private_CreateWrappingMainDiv(sDivId);
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
	// Заполняем правую панель. Делим ее на три части:
	//  1. Информация об игроках
	//  2. Навигатор + панель управления
	//  3. Чат + ввод для чата
	//------------------------------------------------------------------------------------------------------------------
	var InfoH      = 200;
	var ManagerH   = 200;
	var ChatInputH = 30;

	var sInfoDivId    = sPanelDivId + "I";
	var sManagerDivId = sPanelDivId + "M";
	var sChatsDivId   = sPanelDivId + "C";


	this.private_CreateDiv(oPanelControl.HtmlElement, sInfoDivId);
	this.private_CreateDiv(oPanelControl.HtmlElement, sManagerDivId);
	this.private_CreateDiv(oPanelControl.HtmlElement, sChatsDivId);
	//------------------------------------------------------------------------------------------------------------------
	// Информация об игроках
	//------------------------------------------------------------------------------------------------------------------
	var oInfoControl = CreateControlContainer(sInfoDivId);
	oInfoControl.Bounds.SetParams(7 + 36, 0, 1000, 0, true, false, false, false, -1, InfoH);
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
	oDrawingWhiteInfo.Init(sWhiteInfo, oGameTree, BOARD_WHITE, this.m_sWhiteAvatar);
	var oDrawingBlackInfo = new CGoUniverseDrawingPlayerInfo(this);
	oDrawingBlackInfo.Init(sBlackInfo, oGameTree, BOARD_BLACK, this.m_sBlackAvatar);

	this.m_aElements.push(oDrawingBlackInfo);
	this.m_aElements.push(oDrawingWhiteInfo);
	//------------------------------------------------------------------------------------------------------------------
	// Кнопка меню
	//------------------------------------------------------------------------------------------------------------------
	var sMenuButton = sPanelDivId + "D";
	this.private_CreateDiv(oPanelControl.HtmlElement, sMenuButton);
	var oMenuButtonControl = CreateControlContainer(sMenuButton);
	oMenuButtonControl.Bounds.SetParams(7, 7, 1000, 7, true, true, false, true, 36, 36);
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
	oManagerControl.Bounds.SetParams(0, InfoH, 0, 0, true, true, true, false, -1, ManagerH);
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
	// Чат + ввод для чата
	//------------------------------------------------------------------------------------------------------------------
	var oChatsControl = CreateControlContainer(sChatsDivId);
	oChatsControl.Bounds.SetParams(0, InfoH + ManagerH, 0, 1000, true, true, true, false, -1, -1);
	oChatsControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oPanelControl.AddControl(oChatsControl);

	var sChatAreaDivId  = sChatsDivId + "A";
	var sChatInputDivId = sChatsDivId + "I";
	this.private_CreateDiv(oChatsControl.HtmlElement, sChatAreaDivId);
	this.private_CreateDiv(oChatsControl.HtmlElement, sChatInputDivId);
	//------------------------------------------------------------------------------------------------------------------
	// Место под чат
	//------------------------------------------------------------------------------------------------------------------
	var oChatAreaControl = CreateControlContainer(sChatAreaDivId);
	oChatAreaControl.Bounds.SetParams(0, 0, 1000, ChatInputH, false, false, false, true, -1, -1);
	oChatAreaControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_right | g_anchor_bottom);
	oChatsControl.AddControl(oChatAreaControl);

	var oDrawingComments = new CGoUniverseDrawingComments(this);
	oDrawingComments.Init(sChatAreaDivId, oGameTree);
	this.m_aElements.push(oDrawingComments);
	//------------------------------------------------------------------------------------------------------------------
	// Место под ввод в чат
	//------------------------------------------------------------------------------------------------------------------
	var oChatInputControl = CreateControlContainer(sChatInputDivId);
	oChatInputControl.Bounds.SetParams(0, 0, 1000, 0, false, false, false, true, -1, ChatInputH);
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
	this.m_oGameTree = null;
	this.HtmlElement =
	{
		Control  : null,
		TextArea : {Control : null}
	};

	var oThis = this;

	this.private_OnValueChange = function()
	{
		oThis.private_OnChangeComment();
	};
}

CGoUniverseDrawingComments.prototype.Init = function(sDivId, oGameTree)
{
	this.m_oGameTree = oGameTree;

	this.HtmlElement.Control = CreateControlContainer(sDivId);
	var oDivElement = this.HtmlElement.Control.HtmlElement;

	oDivElement.style.background = new CColor(217, 217, 217, 255).ToString();
	oDivElement.style.boxSizing = "content-box";

	var sAreaName = sDivId + "_TextArea";

	// Создаем TextArea
	var oAreaElement = document.createElement("textarea");
	oAreaElement.setAttribute("id", sAreaName);
	oAreaElement.setAttribute("style", "position:absolute;padding:0;margin:0;resize:none;outline: none;-moz-appearance: none;padding:2px;");
	oDivElement.appendChild(oAreaElement);

	oAreaElement['onchange']      = this.private_OnValueChange;
	oAreaElement['onblur']        = this.private_OnValueChange;
	oAreaElement.style.outline    = "none";
	oAreaElement.style.margin     = "0px";
	oAreaElement.style.border     = "1px solid rgb(172,172,172)";
	oAreaElement.style.fontFamily = "'Segoe UI',Helvetica,Tahoma,Geneva,Verdana,sans-serif";
	oAreaElement.disabled         = "disabled";
	oAreaElement.style.color      = "rgb(0, 0, 0)";

	var oDivControl = this.HtmlElement.Control;
	this.HtmlElement.TextArea.Control = CreateControlContainer(sAreaName);
	var oTextAreaControl = this.HtmlElement.TextArea.Control;
	oTextAreaControl.Bounds.SetParams(0, 0, 0, 0, true, true, true, true, -1,-1);
	oTextAreaControl.Anchor = (g_anchor_top | g_anchor_left | g_anchor_bottom | g_anchor_right);
	oDivControl.AddControl(oTextAreaControl);

	oAreaElement.value = "Test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test testtest test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test test";

	if (this.m_oDrawing)
		this.m_oDrawing.Register_Comments(this);

	this.Update_Size();
};
CGoUniverseDrawingComments.prototype.Update_Comments = function(sComments)
{
	this.HtmlElement.TextArea.Control.HtmlElement.value = sComments;
};
CGoUniverseDrawingComments.prototype.Update_Size = function()
{
	var W = this.HtmlElement.Control.HtmlElement.clientWidth;
	var H = this.HtmlElement.Control.HtmlElement.clientHeight;

	this.HtmlElement.Control.Resize(W, H);
};
CGoUniverseDrawingComments.prototype.private_OnChangeComment = function()
{
	this.m_oGameTree.Set_Comment(this.HtmlElement.TextArea.Control.HtmlElement.value);
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
CGoUniverseDrawingPlayerInfo.prototype.Init = function(sDivId, oGameTree, nPlayer, sAvatarSrc)
{
	this.m_nPlayer   = nPlayer;
	this.m_oGameTree = oGameTree;

	this.HtmlElement.Control          = CreateControlContainer(sDivId);
	var oDivElement                   = this.HtmlElement.Control.HtmlElement;
	oDivElement.style.backgroundColor = new CColor(217, 217, 217, 255).ToString();

	var nAvatarH = 110;
	var nAvatarW = (nAvatarH * 141 / 200);
	var nNameH   = 30;
	var nScoresH = 30;
	var nTimeH   = 30;

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

	var oCenterDiv          = document.createElement("div");
	oCenterDiv.style.margin = "0 auto";
	oNameWrapperDiv.appendChild(oCenterDiv);

	// Цвет
	var oColorDiv = document.createElement("canvas");
	oCenterDiv.appendChild(oColorDiv);

	oColorDiv.setAttribute("id", sDivId + "_Image");
	oColorDiv.style["float"] = "left";
	oColorDiv.style.width    = 25 + "px";
	oColorDiv.style.height   = 25 + "px";
	oColorDiv.width          = 25;
	oColorDiv.height         = 25;

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
	var oNameDiv = document.createElement("div");
	oCenterDiv.appendChild(oNameDiv);

	oNameDiv.style["float"] = "left";
	oNameDiv.style.fontSize = "14pt";

	// Захваченные
	var oScoresWrapperDiv = document.createElement("div");
	oDivElement.appendChild(oScoresWrapperDiv);
	oScoresWrapperDiv.style.width  = "100%";
	oScoresWrapperDiv.style.height = nScoresH;
	oScoresWrapperDiv.className    = "HorAlignCenter";

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
	oTimeWrapperDiv.style.width  = "100%";
	oTimeWrapperDiv.style.height = nTimeH;
	oTimeWrapperDiv.className    = "HorAlignCenter";

	var oCenterDiv          = document.createElement("div");
	oCenterDiv.style.margin = "0 auto";
	oTimeWrapperDiv.appendChild(oCenterDiv);

	var oTimeDiv = document.createElement("div");
	oCenterDiv.appendChild(oTimeDiv);

	oTimeDiv.style["float"] = "left";
	oTimeDiv.style.fontSize = "12pt";
	oTimeDiv.innerHTML      = "00:15:00";

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