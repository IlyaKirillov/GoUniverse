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

	this.HtmlElement.NameDiv   = document.createElement("div");
	this.HtmlElement.ScoresDiv = document.createElement("div");
	this.HtmlElement.Image     = document.createElement("canvas");
	this.HtmlElement.Avatar    = document.createElement("img");

	var oImage     = this.HtmlElement.Image;
	var oNameDiv   = this.HtmlElement.NameDiv;
	var oScoresDiv = this.HtmlElement.ScoresDiv;
	var oAvatar    = this.HtmlElement.Avatar;

	oDivElement.appendChild(oImage);
	oDivElement.appendChild(oNameDiv);
	oDivElement.appendChild(oScoresDiv);
	oDivElement.appendChild(oAvatar);

	oNameDiv.style.paddingLeft   = "25px";
	oScoresDiv.style.paddingLeft = "25px";
	oNameDiv.style.fontSize      = "14pt";
	oScoresDiv.style.fontSize    = "10pt";

	oImage.setAttribute("id", sDivId + "_Image");
	oImage.setAttribute("style", "position:absolute;padding:0;margin:0;");
	oImage.setAttribute("oncontextmenu", "return false;");
	oImage.style.left            = "0px";
	oImage.style.top             = "0px";
	oImage.style.width           = 25 + "px";
	oImage.style.height          = 25 + "px";
	oImage.width                 = 25;
	oImage.height                = 25;

	oAvatar.width  = 141;
	oAvatar.height = 200;
	oAvatar.src    = sAvatarSrc;

	var Canvas = oImage.getContext("2d");

	var Size = 25;

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

	if (this.m_oDrawing)
	{
		if (BOARD_BLACK === nPlayer)
			this.m_oDrawing.Register_BlackInfo(this);
		else if (BOARD_WHITE === nPlayer)
			this.m_oDrawing.Register_WhiteInfo(this);
	}

	this.private_Update();
};
CGoUniverseDrawingPlayerInfo.prototype.Update_Size = function()
{
	this.private_Update();

	var TextWidth = this.m_dTextWidth;
	var RealWidth = this.HtmlElement.Control.HtmlElement.clientWidth - 25;

	var nOffset = 0;
	if (RealWidth < TextWidth)
		nOffset = 0;
	else
		nOffset = (RealWidth - TextWidth) / 2;

	this.HtmlElement.Image.style.left            = nOffset + "px";
	nOffset += 25;
	this.HtmlElement.NameDiv.style.paddingLeft   = nOffset + "px";
	this.HtmlElement.ScoresDiv.style.paddingLeft = nOffset + "px";

	this.HtmlElement.NameDiv.style.overflow            = "hidden";
	this.HtmlElement.NameDiv.style.textOverflow        = "ellipsis";
	this.HtmlElement.NameDiv.style['-o-text-overflow'] = "ellipsis";
	this.HtmlElement.NameDiv.style.height              = 25 + "px";
	this.HtmlElement.NameDiv.style.lineHeight          = 25 + "px";
	this.HtmlElement.NameDiv.style.fontFamily          = '"Times New Roman", Times, serif';

	this.HtmlElement.ScoresDiv.style.overflow            = "hidden";
	this.HtmlElement.ScoresDiv.style.textOverflow        = "ellipsis";
	this.HtmlElement.ScoresDiv.style['-o-text-overflow'] = "ellipsis";
	this.HtmlElement.ScoresDiv.style.height              = 25 + "px";
	this.HtmlElement.ScoresDiv.style.lineHeight          = 25 + "px";
	this.HtmlElement.ScoresDiv.style.fontFamily          = '"Times New Roman", Times, serif';
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
	var oNameDiv   = this.HtmlElement.NameDiv;
	var oScoresDiv = this.HtmlElement.ScoresDiv;

	var sNameText   = ("" === this.m_sName ? (BOARD_BLACK === this.m_nPlayer ? "Black " : "White ") : this.m_sName) + ("" === this.m_sRank ? "" : "[" + this.m_sRank +  "]");
	var sScoresText = (true === this.m_bScores ? "Scores " : "Captured ") + this.m_dScores;

	Common.Set_InnerTextToElement(oNameDiv, sNameText);
	Common.Set_InnerTextToElement(oScoresDiv, sScoresText);

	var Canvas = document.createElement("canvas").getContext("2d");
	Canvas.font = "14pt Times New Roman";
	this.m_dTextWidth = Canvas.measureText(sNameText).width;
};