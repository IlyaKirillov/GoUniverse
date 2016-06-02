"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 17.05.2016
 * Time: 12:48
 */

window.onload         = OnDocumentReady;
window.onbeforeunload = OnDocumentClose;

var oClient     = new CKGSClient();

var oBody = null;
var PlayersListControl = null;
var PlayersListView    = new CListView();
PlayersListView.Set_BGColor(243, 243, 243);

var GamesListControl   = null;
var GamesListView      = new CListView();
GamesListView.Set_BGColor(243, 243, 243);

var PanelTabs = [];
var CurrentTab = null;

var ChatTabs = [];
var CurrentChatTab = null;

function Connect()
{
    var sLogin    = document.getElementById("inputLoginId").value;
    var sPassword = document.getElementById("inputPasswordId").value;
    document.getElementById("inputPasswordId").value = "";
    oClient.Connect(sLogin, sPassword, "en_US");

    var oDiv = document.getElementById("divIdConnection");
    $(oDiv).fadeOut(200);

    var oDiv2 = document.getElementById("divIdConnectionError");
    $(oDiv2).fadeOut(200);
}

function OnConnect()
{
    document.title = "KGS: " + oClient.GetUserName();
    document.getElementById("divIdClientNameText").innerHTML = oClient.GetUserName();

    var oDiv = document.getElementById("divMainId");
    $(oDiv).fadeIn(200);
    window.onresize();
}

function RemoveCreatePanel()
{
    var Panel = document.getElementById("divIdCreatePanel");
    $(Panel).fadeOut(0);
}

function CollapseCreatePanel()
{
    var Panel = document.getElementById("divIdCreatePanel");
    Panel.style.top     = "30px";
    Panel.style.opacity = "0";

    Panel.addEventListener("transitionend", RemoveCreatePanel, false);
}

function OpenCreatePanel()
{
    var Panel = document.getElementById("divIdCreatePanel");
    Panel.removeEventListener("transitionend", RemoveCreatePanel);
    $(Panel).fadeIn(0);
    Panel.style.top     = "50px";
    Panel.style.opacity = "1";
}

function OnDocumentReady()
{
    document.title = "KGS: Login";
    document.getElementById("inputLoginId").focus();
    document.getElementById("inputLoginId").onkeypress    = function(e)
    {
        var event    = e || window.event;
        var charCode = event.which || event.keyCode;
        if (13 === charCode)
        {
            document.getElementById("inputPasswordId").focus();
            return false;
        }
    };
    document.getElementById("inputPasswordId").onkeypress = function(e)
    {
        var event    = e || window.event;
        var charCode = event.which || event.keyCode;
        if (13 === charCode)
        {
            Connect();
            return false;
        }
    };
    document.getElementById("connectDivId").onkeypress = function(e)
    {
        var event    = e || window.event;
        var charCode = event.which || event.keyCode;
        if (13 === charCode)
        {
            Connect();
            return false;
        }
    };
    document.getElementById("connectDivId").onmouseup    = Connect;
    document.getElementById("divMainId").onclick         = CollapseCreatePanel;
    document.getElementById("divIdCreateButton").onclick = function(e)
    {
        var Panel = document.getElementById("divIdCreatePanel");
        if (1 == Panel.style.opacity)
            CollapseCreatePanel();
        else
            OpenCreatePanel();

        if (event && event.stopPropagation())
            event.stopPropagation();
    };

    //------------------------------------------------------------------------------------------------------------------
    // Exit button
    //------------------------------------------------------------------------------------------------------------------
    var oDivExtButtton         = document.getElementById("divIdExitButton");
    oDivExtButtton.onmouseover = function()
    {
        oDivExtButtton.style.backgroundColor = "#505050";
    };
    oDivExtButtton.onmouseout  = function()
    {
        oDivExtButtton.style.backgroundColor = "transparent";
    };
    oDivExtButtton.onclick     = function()
    {
        if (oClient)
        {
            oClient.Disconnect();
            document.getElementById("divMainId").style.display       = "none";
            document.getElementById("divIdConnection").style.display = "block";

            GamesListView.Clear();
            PlayersListView.Clear();
        }
    };
    oDivExtButtton.onmousedown = function()
    {
        oDivExtButtton.style.backgroundColor = "#969696";
    };
    //------------------------------------------------------------------------------------------------------------------
    // Расположим начальное окно с коннектом посередине
    //------------------------------------------------------------------------------------------------------------------
    var ConnectionDiv        = document.getElementById("divIdConnection");
    ConnectionDiv.style.left = (document.body.clientWidth - 250) / 2 + "px";
    ConnectionDiv.style.top  = (document.body.clientHeight - 100) / 2 + "px";
    //------------------------------------------------------------------------------------------------------------------
    function AddGreetingMessage()
    {
        var oDiv     = document.getElementById("textareaChatId");
        var oTextDiv = document.createElement("div");

        oTextDiv.style.textAlign   = "center";
        var oTextSpan              = document.createElement("span");
        oTextSpan.style.fontWeight = "bold";
        oTextSpan.textContent      = "Welcome to Kiseido Go Server!";


        oTextDiv.appendChild(oTextSpan);
        oDiv.appendChild(oTextDiv);

        oDiv.scrollTop = oDiv.scrollHeight;
    }

    AddGreetingMessage();

    var MainDiv    = document.getElementById("divIdMainRoom");
    var MainDivTab = document.getElementById("divIdMainRoomTab");

    PanelTabs = [];
    PanelTabs.push({Div : MainDiv, Id : -1, TabDiv : MainDivTab});
    CurrentTab = PanelTabs[0];

    MainDivTab.onmousemove   = function()
    {
        MainDivTab.style.backgroundColor = "#009983";
    };
    MainDivTab.onmousedown   = function()
    {
        MainDivTab.style.backgroundColor = "#008272";
        MainDivTab.style.border          = "1px solid black";
    };
    MainDivTab.onmouseout    = function()
    {
        MainDivTab.style.backgroundColor = "#008272";
        MainDivTab.style.border          = "1px solid transparent";
    };
    MainDivTab.onmouseup     = function()
    {
        MainDivTab.style.border = "1px solid transparent";
        OnPanelTabClick(MainDiv);
    };
    MainDivTab.onselectstart = function()
    {
        return false;
    };

    window.onresize = function()
    {
        if ("none" !== document.getElementById("divIdConnection").style.display)
        {
            // Расположим начальное окно с коннектом посередине
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

        if (oBody)
        {
            var W = oBody.HtmlElement.clientWidth;
            var H = oBody.HtmlElement.clientHeight;
            oBody.Resize(W, H);
            PlayersListView.Update();
            PlayersListView.Update_Size();

            GamesListView.Update();
            GamesListView.Update_Size();

            for (var Pos in PanelTabs)
            {
                var Tab = PanelTabs[Pos];
                if (Tab.Div.style.display === "block" && Tab.GameTree)
                    GoBoardApi.Update_Size(Tab.GameTree);
            }
        }
    };

    document.getElementById("inputChatId").onkeydown = SendChatMessage;


    // Основная Div
    oBody = CreateControlContainer("divMainId");
    oBody.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
    oBody.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);

    // Панель табов
    var oTabPanelControl = CreateControlContainer("divIdTabPanel");
    oTabPanelControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, 50);
    oTabPanelControl.Anchor = (g_anchor_top |g_anchor_left | g_anchor_right);
    oBody.AddControl(oTabPanelControl);

    var TabPanelDiv = oTabPanelControl.HtmlElement;
    TabPanelDiv.style.fontSize        = "12px";
    TabPanelDiv.style.backgroundColor = "#050708";
    TabPanelDiv.style.fontFamily      = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
    TabPanelDiv.style.cursor          = "default";
    TabPanelDiv.style["-webkit-font-smoothing"] = "antialiased";

    // Основная комната
    var oMainRoomControl = CreateControlContainer("divIdMainRoom");
    oMainRoomControl.Bounds.SetParams(0, 50, 1000, 1000, false, true, false, false, -1, -1);
    oMainRoomControl.Anchor = (g_anchor_bottom |g_anchor_left | g_anchor_right);
    oBody.AddControl(oMainRoomControl);

    // Список игроков
    PlayersListControl = PlayersListView.Init("divPlayersListId", g_oPlayersList);
    var oPlayersListDiv = PlayersListControl;
    oPlayersListDiv.Bounds.SetParams(0, 0, 0, 1000, false, false, true, false, 200, -1);
    oPlayersListDiv.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right);
    oPlayersListDiv.HtmlElement.style.background = "#F3F3F3";
    oMainRoomControl.AddControl(oPlayersListDiv);

    // Левая часть
    var oLeftPartControl = CreateControlContainer("divIdL");
    oLeftPartControl.Bounds.SetParams(0, 0, 200, 1000, false, false, true, false, -1, -1);
    oLeftPartControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
    oMainRoomControl.AddControl(oLeftPartControl);

    // Часть под чат
    var oChatControl = CreateControlContainer("divIdLChat");
    oChatControl.Bounds.SetParams(0, 500, 1000, 1000, false, false, false, false, -1, -1);
    oChatControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
    oLeftPartControl.AddControl(oChatControl);

    // Табы чата
    var oChatTabsBack = CreateControlContainer("divIdLChatTabsBack");
    oChatTabsBack.Bounds.SetParams(0, 0, 2, 0, true, true, true, false, -1, 24);
    oChatTabsBack.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
    oChatControl.AddControl(oChatTabsBack);

    var oChatTabs = CreateControlContainer("divIdLChatTabs");
    oChatTabs.Bounds.SetParams(0, 0, 2, 0, true, true, true, false, -1, 25);
    oChatTabs.Anchor = (g_anchor_top | g_anchor_right | g_anchor_left);
    oChatControl.AddControl(oChatTabs);

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

    // Список игровых комнат
    var oGamesListWrapperControl = CreateControlContainer("divIdLGamesWrapper");
    oGamesListWrapperControl.Bounds.SetParams(0, 0, 1000, 500, false, false, false, false, -1, -1);
    oGamesListWrapperControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
    oLeftPartControl.AddControl(oGamesListWrapperControl);

    GamesListControl = GamesListView.Init("divIdLGames", g_oGamesList);
    GamesListControl.Bounds.SetParams(0, 0, 2, 1, true, false, true, true, -1, -1);
    GamesListControl.Anchor = (g_anchor_top |g_anchor_bottom | g_anchor_right | g_anchor_left);
    GamesListControl.HtmlElement.style.background = "#F3F3F3";
    oGamesListWrapperControl.AddControl(GamesListControl);

    document.getElementById("divMainId").style.display            = "none";
    document.getElementById("divIdConnection").style.display      = "block";

    window.onresize();
    document.getElementById("divIdConnectionError").style.display = "none";

    // // TEST
    // OnConnect();
    // OpenRoomList();
    //----------------------
}

function OnDocumentClose()
{
    if (!oClient)
        return;

    oClient.Disconnect();
}

function EnterGameRoom(GameRoomId)
{
    // Проверим, находимся ли мы уже в данной комнате
    for (var TabPos in PanelTabs)
    {
        if (PanelTabs[TabPos].Id === GameRoomId)
        {
            OnPanelTabClick(PanelTabs[TabPos].Div);
            return;
        }
    }

    if (!oClient)
        return;

    oClient.ConnectToGameRoom(GameRoomId);
}

function LeaveGameRoom(GameRoomId)
{
    if (!oClient)
        return;

    oClient.LeaveGameRoom(GameRoomId);
}

function OnAddChatMessage(ChatRoomId, UserName, Text)
{
    var oDiv     = document.getElementById("textareaChatId");
    var oTextDiv = document.createElement("div");

    oTextDiv.chatRoomId = ChatRoomId;

    var oTextSpan              = document.createElement("span");
    oTextSpan.style.fontWeight = "bold";
    oTextSpan.textContent      = UserName + ": ";
    oTextDiv.appendChild(oTextSpan);

    Text = Text.replace(urlRegEx, "<a href='$1' target='_blank'>$1</a>");

    oTextSpan                  = document.createElement("span");
    oTextSpan.innerHTML        = Text;
    oTextDiv.appendChild(oTextSpan);

    oDiv.appendChild(oTextDiv);

    if (ChatRoomId === CurrentChatTab.ChatRoomId)
    {
        oTextDiv.style.display = "block";
        oDiv.scrollTop = oDiv.scrollHeight;
    }
    else
    {
        for (var nIndex = 0, nCount = ChatTabs.length; nIndex < nCount; ++nIndex)
        {
            if (ChatRoomId === ChatTabs[nIndex].ChatRoomId)
            {
                ChatTabs[nIndex].NewMessagesCount++;
                ChatTabs[nIndex].NewMessagesCountDiv.innerHTML = "" +  Math.min(99, ChatTabs[nIndex].NewMessagesCount);
            }
        }

        oTextDiv.style.display = "none";
    }
}

function AddRoomGreetingMessage(ChatRoomId, sGreetingMessage)
{
    var oTextDiv = AddConsoleMessage("", sGreetingMessage);
    oTextDiv.chatRoomId = ChatRoomId;

    if (ChatRoomId === CurrentChatTab.ChatRoomId)
    {
        oTextDiv.style.display = "block";
        document.getElementById("textareaChatId").scrollTop = document.getElementById("textareaChatId").scrollHeight;
    }
    else
    {
        oTextDiv.style.display = "none";
    }
}

var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;

function AddConsoleMessage(sField, sText)
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
}

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

function OnLogout(sText)
{
    if (sText)
    {
        document.getElementById("divIdConnectionError").style.display = "block";
        document.getElementById("divIdConnectionErrorText").innerHTML = sText;
    }

    document.getElementById("divMainId").style.display       = "none";
    document.getElementById("divIdConnection").style.display = "block";
    document.getElementById("inputPasswordId").focus();

    GamesListView.Clear();
    PlayersListView.Clear();

    // Очищаем табы

    // for (var Pos in PanelTabs)
    // {
    //     var Tab = PanelTabs[Pos];
    //     try
    //     {
    //         document.getElementById("divMainId").removeChild(Tab.Div);
    //         document.getElementById("divIdTabPanel").removeChild(Tab.TabDiv);
    //     }
    //     catch (e)
    //     {}
    //     PanelTabs.splice(Pos, 1);
    // }
	//
    // for (var Pos in ChatTabs)
    // {
		// var Tab = ChatTabs[Pos];
		// try
		// {
		// 	document.getElementById("divIdLChatTabs").removeChild(Tab.TabDiv);
		// }
		// catch (e)
		// {}
		// ChatTabs.splice(Pos, 1);
    // }


    document.title = "KGS: Login";
}

function SendChatMessage(e)
{
    var oInputArea = document.getElementById("inputChatId");
    if (13 === e.keyCode && true !== e.ctrlKey && true !== e.shiftKey && oClient)
    {
        oClient.SendChatMessage(oInputArea.value);
        oInputArea.value = "";
        e.preventDefault();
    }
}


function EnterGameRoom2(GameRoomId, SGF, ManagerId, sBlackName, sBlackRank, sWhiteName, sWhiteRank)
{
    var DivId = "divMainId" + GameRoomId;

    var GameRoom = {};
    GameRoom.Id = GameRoomId;

    var GameRoomDiv = document.createElement("div");
    GameRoomDiv.style.position = "absolute";
    GameRoomDiv.id  = DivId;
    GameRoom.Div = GameRoomDiv;

    var MainDiv = document.getElementById("divMainId");
    MainDiv.appendChild(GameRoomDiv);

    var GameRoomControl = CreateControlContainer(DivId);
    GameRoomControl.Bounds.SetParams(0, 50, 1000, 1000, false, true, false, false, -1, -1);
    GameRoomControl.Anchor = (g_anchor_bottom |g_anchor_left | g_anchor_right);
    oBody.AddControl(GameRoomControl);

    var BoardDiv = document.createElement("div");
    BoardDiv.id = DivId + "B";
    GameRoomDiv.appendChild(BoardDiv);

    var GameRoomBoardControl = CreateControlContainer(DivId + "B");
    GameRoomBoardControl.Bounds.SetParams(0, 0, 1000, 1000, false, false, false, false, -1, -1);
    GameRoomBoardControl.Anchor = (g_anchor_top | g_anchor_bottom |g_anchor_left | g_anchor_right);
    GameRoomControl.AddControl(GameRoomBoardControl);

    var oGameTree = GoBoardApi.Create_GameTree();
    GoBoardApi.Create_BoardCommentsButtonsNavigator(oGameTree, DivId + "B");
    if (SGF)
        GoBoardApi.Load_Sgf(oGameTree, SGF);

    GoBoardApi.Update_Size(oGameTree);
    GameRoom.GameTree = oGameTree;

    GameRoom.ManagerId  = ManagerId;

    window.onresize();

    PanelTabs.push(GameRoom);

    var TabPanel = document.getElementById("divIdTabPanelRooms");

    var DivTab = document.createElement("div");
    DivTab.style.transitionProperty = "width,height,background,margin,border,padding";
    DivTab.style.transitionDuration = ".25s";

    DivTab.style.float              = "left";
    DivTab.style.height             = "100%";
    DivTab.style.margin             = "0px";
    DivTab.style.padding            = "0px";

    var NewTab =  document.createElement("button");
    NewTab.tabIndex = "0";


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

    NewTab.style.fontSize           = "14px";
    NewTab.style.height             = "100%";
    NewTab.style.margin             = "0px";
    NewTab.style.padding            = "0px 0px 0px 14px";
    NewTab.style.color              = "#fff";
    NewTab.style.maxWidth           = "100px";
    NewTab.style.overflow           = "hidden";

    NewTab.style.float              = "left";



    var NewTabDiv = document.createElement("div");
    NewTabDiv.style.textAlign = "left";
    var oDiv = document.createElement("div");
    oDiv.innerHTML = String.fromCharCode(0x2460) + "&nbsp;" + sWhiteName;
    NewTabDiv.appendChild(oDiv);

    oDiv = document.createElement("div");
    oDiv.innerHTML = String.fromCharCode(0x2776) + "&nbsp;" + sBlackName;
    NewTabDiv.appendChild(oDiv);

    NewTabDiv.onselectstart = function(){return false;};
    NewTab.appendChild(NewTabDiv);

    DivTab.onmouseover = function()
    {
        DivTab.style.backgroundColor = "#505050";
    };
    DivTab.onmouseout = function()
    {
        if (CurrentTab.TabDiv !== DivTab)
            DivTab.style.backgroundColor = "transparent";
        else
            DivTab.style.backgroundColor = "#737373";
    };

    NewTab.onclick = function()
    {
        OnPanelTabClick(GameRoomDiv);
    };
    NewTab.onmousedown = function()
    {
        DivTab.style.backgroundColor = "#969696";
    };

    DivTab.appendChild(NewTab)

    var CloseButton = document.createElement("button");
    CloseButton.tabIndex = "0";
    CloseButton["aria-label"] = "Close room " + GameRoomId;
    CloseButton.title         = "Close room " + GameRoomId;

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
    CloseButton.style.color                     = "#fff";

    CloseButton.style.float    = "left";
    CloseButton.style.height   = "100%";
    CloseButton.style.width    = "40px";

    CloseButton.style.transitionProperty = "color";
    CloseButton.style.transitionDuration = ".25s";


    CloseButton.onmousedown = function()
    {
        CloseButton.style.color = "#008272";
    };
    CloseButton.onmouseout = function()
    {
        CloseButton.style.color = "#fff";
    };
    CloseButton.onmouseover = function()
    {
        CloseButton.style.color = "#009983";
    };


    var CBCenter = document.createElement("center");
    var CBCDiv   = document.createElement("div");
    CBCDiv.style.fontSize   = "12px";
    CBCDiv.style.lineHeight = "16px";
    CBCDiv.style.width      = "12px";
    CBCDiv.style.height     = "16px";
    CBCDiv.style.position   = "relative";
    var CBCDSpan = document.createElement("span");

    CBCDSpan.style.position = "absolute";
    CBCDSpan.style.width    = "100%";
    CBCDSpan.style.height   = "100%";
    CBCDSpan.style.left     = "0px";
    CBCDSpan.style.top      = "2px";

    CBCDSpan.className += " " + "closeSpan";

    CBCDiv.appendChild(CBCDSpan);
    CBCenter.appendChild(CBCDiv);
    CloseButton.appendChild(CBCenter);
    DivTab.appendChild(CloseButton);

    CloseButton.onclick = function()
    {
        LeaveGameRoom(GameRoomId);
        OnRemoveTab(GameRoomDiv);
        TabPanel.removeChild(DivTab);
    };

    TabPanel.appendChild(DivTab);
    GameRoom.TabDiv = DivTab;

    OnPanelTabClick(GameRoomDiv);
}

function EnterChatRoom(ChatRoomId, sRoomName, isPrivate)
{
    var ChatRoom = {};
    ChatRoom.ChatRoomId = ChatRoomId;
    ChatRoom.NewMessagesCount = 0;

    var sHeight = "21px";

    ChatTabs.push(ChatRoom);

    var TabPanel = document.getElementById("divIdLChatTabs");

    var DivTab                      = document.createElement("div");
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


    var NewTabDiv = document.createElement("div");
    NewTabDiv.style.textAlign = "left";
    var oCaptionDiv = document.createElement("div");
	//oCaptionDiv.style.fontWeight = "normal";
	//oCaptionDiv.style.color      = "rgb(0, 0, 0)";
	oCaptionDiv.innerHTML = sRoomName;
    NewTabDiv.appendChild(oCaptionDiv);

    NewTabDiv.onselectstart = function(){return false;};
    NewTab.appendChild(NewTabDiv);


    NewTab.onclick = function()
    {
        OnPanelChatTabClick(ChatRoomId);
    };
    NewTab.onmousedown = function()
    {
    };

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

    CloseButton.onclick = function()
    {
        oClient.LeaveChatRoom(ChatRoomId);
        TabPanel.removeChild(DivTab);

        if (CurrentChatTab === ChatRoom)
            CurrentChatTab = null;

        for (var Pos in ChatTabs)
        {
            var Tab = ChatTabs[Pos];
            if (Tab === ChatRoom)
            {
                ChatTabs.splice(Pos, 1);
            }
            else if (null === CurrentChatTab)
            {
                OnPanelChatTabClick(Tab.ChatRoomId);
            }
        }
    };

    DivTab.onmouseover = function()
    {
        CBCDSpan.style.visibility        = "visible";
        NewMessagesSpan.style.visibility = "hidden";
		//oCaptionDiv.style.fontWeight     = "bold";
    };
    DivTab.onmouseout = function()
    {
        CBCDSpan.style.visibility        = "hidden";
        NewMessagesSpan.style.visibility = "visible";
		//oCaptionDiv.style.fontWeight     = "normal";
    };

    TabPanel.appendChild(DivTab);
    ChatRoom.TabDiv     = DivTab;
    ChatRoom.TextDiv    = NewTab;
	ChatRoom.CaptionDiv = oCaptionDiv;
    ChatRoom.NewMessagesCountDiv = NewMessagesSpan;
}

function OnPanelChatTabClick(ChatRoomId)
{
    var CurTab = CurrentChatTab;
    var NewTab = null;

    for (var Pos in ChatTabs)
    {
        var Tab = ChatTabs[Pos];
        if (ChatRoomId === Tab.ChatRoomId)
        {
            NewTab = Tab;
            break;
        }
    }

    if (!NewTab || NewTab === CurTab)
        return;

    if (CurTab)
    {
        CurTab.TabDiv.style.borderBottom    = "1px solid #BEBEBE";
        CurTab.TabDiv.style.borderTop       = "3px solid #F3F3F3";
		//CurTab.CaptionDiv.style.color       = "rgb(0, 0, 0)";
    }

    if (NewTab)
    {
        NewTab.TabDiv.style.borderBottom     = "1px solid #F3F3F3";
        NewTab.TabDiv.style.borderTop        = "3px solid rgb(0, 130, 114)";
		//NewTab.CaptionDiv.style.color        = "rgb(0, 130, 114)";
        NewTab.NewMessagesCount              = 0;
        NewTab.NewMessagesCountDiv.innerHTML = "";
    }

    CurrentChatTab = NewTab;

    oClient.SetCurrentChatRoom(ChatRoomId);
    UpdateChatMessages();
}

function UpdateChatMessages()
{
    var oDiv = document.getElementById("textareaChatId");
    for (var nIndex = 0, nCount = oDiv.childNodes.length; nIndex < nCount; ++nIndex)
    {
        var oChild = oDiv.childNodes[nIndex];
        if (oChild.chatRoomId === CurrentChatTab.ChatRoomId)
        {
            oChild.style.display = "block";
        }
        else
        {
            oChild.style.display = "none";
        }
    }

    document.getElementById("textareaChatId").scrollTop = document.getElementById("textareaChatId").scrollHeight;
}

function OnPanelTabClick(Div)
{
    var CurTab = CurrentTab;
    var NewTab = null;

    for (var Pos in PanelTabs)
    {
        var Tab = PanelTabs[Pos];
        if (Div !== Tab.Div)
        {
        }
        else
        {
            NewTab = Tab;
            break;
        }
    }

    if (!NewTab || NewTab === CurTab)
        return;

    $(CurTab.Div).fadeOut(500);
    $(NewTab.Div).fadeIn(500);

    if (CurTab.GameTree)
    {
        CurTab.TabDiv.style.backgroundColor = "transparent";
    }

    if (NewTab.GameTree)
    {
        NewTab.TabDiv.style.backgroundColor = "#737373";
    }
    CurrentTab = NewTab;

    if (NewTab.GameTree)
        GoBoardApi.Update_Size(NewTab.GameTree);
}

function OnRemoveTab(Div)
{
    for (var Pos in PanelTabs)
    {
        var Tab = PanelTabs[Pos];
        if (Div === Tab.Div)
        {
            try
            {
                document.getElementById("divMainId").removeChild(Tab.Div);
                document.getElementById("divIdTabPanel").removeChild(Tab.TabDiv);
            }
            catch (e)
            {}
            PanelTabs.splice(Pos, 1);
            OnPanelTabClick(PanelTabs[0].Div);
            break;
        }
    }
}

function GetTabByRoomId(RoomId)
{
    for (var Pos = 0, Count = PanelTabs.length; Pos < Count; ++Pos)
    {
        if (PanelTabs[Pos].Id === RoomId)
            return PanelTabs[Pos];
    }

    return null;
}

function OpenRoomList()
{
    CreateKGSWindow("divMainId", EKGSWindowType.RoomList, {Client : oClient});
}

function CKGSRoomListWindow()
{
    CKGSRoomListWindow.superclass.constructor.call(this);

	this.m_oClient          = null;
	this.m_oRoomListView    = new CListView();
	this.m_oRoomListControl = null;

	this.m_nInnerH = -1;
	this.m_nInnerW = -1;
}
CommonExtend(CKGSRoomListWindow, CDrawingWindow);

CKGSRoomListWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSRoomListWindow.superclass.Init.call(this, sDivId);

	this.Set_Caption("Room list");

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";

	var sListId       = sDivId + "L";
	var oListElement = this.protected_CreateDivElement(oMainDiv, sListId);
	this.m_oRoomListView.Set_BGColor(243, 243, 243);
	var oListControl = this.m_oRoomListView.Init(sListId, g_oKGSRoomList);
	oListControl.Bounds.SetParams(0, 41, 0, 0, true, true, true, true, -1, -1);
	oListControl.Anchor = (g_anchor_left | g_anchor_top | g_anchor_bottom  | g_anchor_right);
	oMainControl.AddControl(oListControl);
	this.m_oRoomListControl = oListControl;

	this.private_CreateFindInput(sDivId + "F", oMainDiv, oMainControl);

	if (oPr && oPr.Client)
		this.m_oClient = oPr.Client;

	this.Update_Size(true);
	this.Show(oPr);
};
CKGSRoomListWindow.prototype.Show = function()
{
	CKGSRoomListWindow.superclass.Show.call(this);

	this.m_oRoomListView.Clear();

	if (this.m_oClient)
	{
		var oRooms    = this.m_oClient.GetAllRooms();
		for (var nRoomId in oRooms)
		{
			var oRoom = oRooms[nRoomId];
            if (oRoom.Name && "" !== oRoom.Name)
				this.m_oRoomListView.Handle_Record([0, oRoom.ChannelId, oRoom.Name, this.m_oClient.GetCategoryName(oRoom.Category)]);
		}

	}

	this.m_oRoomListView.Update();
	this.m_oRoomListView.Update_Size();
};
CKGSRoomListWindow.prototype.Update_Size = function(bForce)
{
	CKGSRoomListWindow.superclass.Update_Size.call(this, bForce);

	var W = this.HtmlElement.InnerDiv.clientWidth;
	var H = this.HtmlElement.InnerDiv.clientHeight;

	if (true === bForce || Math.abs(W - this.m_nInnerW) > 0.001 || Math.abs(H - this.m_nInnerH) > 0.001)
	{
		this.m_nInnerW = W;
		this.m_nInnerH = H;
		this.m_oRoomListView.Update();
		this.m_oRoomListView.Update_Size();
	}
};
CKGSRoomListWindow.prototype.Get_DefaultWindowSize = function()
{
	return {W : 385, H : 670};
};
CKGSRoomListWindow.prototype.private_CreateFindInput = function(sInputId, oParentDiv, oParentControl)
{
	var oFindInput = document.createElement("input");
	oFindInput.setAttribute("id", sInputId);
	oFindInput.setAttribute("style", "position:absolute;padding:0;margin:0;");
	oFindInput.setAttribute("oncontextmenu", "return false;");

	oFindInput.type           = "text";
	oFindInput.maxLength      = "256";
	oFindInput["aria-label"]  = "Enter room name here";
	oFindInput["placeholder"] = "Enter room name here";

	oFindInput.style.color           = "#505050";
	oFindInput.style.backgroundColor = "#fff";
	oFindInput.style.border          = "1px solid #969696";
	oFindInput.style.fontFamily      = '"Segoe UI",Helvetica,Tahoma,Geneva,Verdana,sans-serif';
	oFindInput.style.height          = "37px";
	oFindInput.style.fontSize        = "13px";
	oFindInput.style.padding         = "0px 47px 0px 6px";
	oFindInput.style.outline         = "none";

	oParentDiv.appendChild(oFindInput);

	var oFindControl = CreateControlContainer(sInputId);
	oFindControl.Bounds.SetParams(5, 2, 5, -1, true, true, true, false, -1, 37);
	oFindControl.Anchor = (g_anchor_left | g_anchor_top | g_anchor_right);
	oParentControl.AddControl(oFindControl);

	var oThis = this;

	oFindInput.addEventListener("input", function()
	{
		var oClient       = oThis.m_oClient;
		var oRoomListView = oThis.m_oRoomListView;

		if (!oClient || !oRoomListView)
			return;

		var sValue = this.value;
		var oRooms = oClient.GetAllRooms();
		oRoomListView.Clear();
		if ("" === sValue)
		{
			for (var nRoomId in oRooms)
			{
				var oRoom = oRooms[nRoomId];
				if (oRoom.Name && "" !== oRoom.Name)
					oRoomListView.Handle_Record([0, oRoom.ChannelId, oRoom.Name, oRoom.CategoryName]);
			}
		}
		else
		{
			for (var nRoomId in oRooms)
			{
				var oRoom = oRooms[nRoomId];
				if (oRoom.Name && "" !== oRoom.Name && -1 !== oRoom.Name.toLowerCase().indexOf(sValue.toLowerCase()))
					oRoomListView.Handle_Record([0, oRoom.ChannelId, oRoom.Name, oRoom.CategoryName]);
			}
		}

		oRoomListView.Update();
		oRoomListView.Update_Size();
	});
};

function CKGSUserInfoWindow()
{
	CKGSUserInfoWindow.superclass.constructor.call(this);

	this.m_sUserName = "";
	this.m_oClient   = null;
}
CommonExtend(CKGSUserInfoWindow, CDrawingWindow);

CKGSUserInfoWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSUserInfoWindow.superclass.Init.call(this, sDivId);

	if (oPr)
	{
		this.m_sUserName = oPr.UserName;
		this.m_oClient   = oPr.Client;
	}

	this.Set_Caption(this.m_sUserName + " info");

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	oMainDiv.style.backgroundColor = "rgb(243, 243, 243)";
};
CKGSUserInfoWindow.prototype.Get_DefaultWindowSize = function(bForce)
{
	return {W : 500, H : 600};
};
CKGSUserInfoWindow.prototype.Close = function()
{
	CKGSUserInfoWindow.superclass.Close.call(this);
	if (this.m_oClient)
		this.m_oClient.CloseUserInfo(this.m_sUserName);
};
CKGSUserInfoWindow.prototype.OnUserDetails = function(oDetails)
{
	if (oDetails)
	{
		this.private_AddConsoleMessage("UserName", oDetails.user.name);
		this.private_AddConsoleMessage("Rank", oDetails.user.rank ? oDetails.user.rank : "-");
		this.private_AddConsoleMessage("Last on", oDetails.lastOn);
		this.private_AddConsoleMessage("Locale", oDetails.locale);
		this.private_AddConsoleMessage("Name", oDetails.personalName);
		this.private_AddConsoleMessage("Info", oDetails.personalInfo);
	}
};
CKGSUserInfoWindow.prototype.OnUserGameArchive = function(oMessage)
{

};
CKGSUserInfoWindow.prototype.private_AddConsoleMessage = function(sField, sText)
{
	var oDiv     = this.HtmlElement.InnerDiv;
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


var EKGSWindowType = {
    RoomList : 0,
	UserInfo : 1
};

var g_aKGSWindows = {};
function CreateKGSWindow(sParentId, nWindowType, oPr)
{
    if (!g_aKGSWindows[sParentId])
        g_aKGSWindows[sParentId] = {};

    var oWindows = g_aKGSWindows[sParentId];

	var sApp = "unknownwindow";
	switch (nWindowType)
	{
		case EKGSWindowType.RoomList : sApp = "RoomList"; break;
		case EKGSWindowType.UserInfo : sApp = "UserInfo_" + oPr.UserName; break;
	}
	var sId = sParentId + sApp;

    if (oWindows[sId])
    {
        var oWindow = oWindows[sId];
        oWindow.Show(oPr);
        return oWindow;
    }
    else
    {
        var oDiv = document.createElement("div");
        oDiv.setAttribute("id", sId);
        oDiv.setAttribute("style", "position:absolute;padding:0;margin:0;width:500px;height:500px;left:300px;top:300px;");
        oDiv.setAttribute("oncontextmenu", "return false;");

        var oContainerDiv = document.getElementById(sParentId);
        oContainerDiv.appendChild(oDiv);

        var oWindow = null;

        switch (nWindowType)
        {
        	case EKGSWindowType.RoomList : oWindow = new CKGSRoomListWindow(); break;
			case EKGSWindowType.UserInfo : oWindow = new CKGSUserInfoWindow(); break;
        }

        oWindows[sId] = oWindow;

        if (null !== oWindow)
        {
            oWindow.Init(sId, oPr);
            oWindow.Update_Size(true);
        }

        return oWindow;
    }

    return null;
}