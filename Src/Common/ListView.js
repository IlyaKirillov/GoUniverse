"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 22.09.14
 * Time: 10:59
 */

function CListView()
{
    this.m_nColsCount = 0;  // Количество колонок
    this.m_aList      = []; // Записи CListViewRecordBase

    this.m_aX = [];
    this.m_aY = [];

    this.m_nSelectedIndex = -1;
    this.m_nTrackBorder   = -1;

    this.m_dYOffset = 0;
    this.m_dYLimit  = 0;
    this.m_dXLimit  = 1000;

    this.m_oBGColor = new CColor(255, 255, 255);
    this.m_oFGColor = new CColor(0, 0, 0);

    this.HtmlElement =
    {
        Control         : null,
        MainCanvas      : {Control : null},
        SelectionCanvas : {Control : null},
        VerScroll       : null
    };

    this.m_oListObject    = null;

    this.m_dFontSize      = 14;// * 4 /3;
    this.m_dAscentHeight  = this.m_dFontSize;
    this.m_dRowHeight     = this.m_dAscentHeight * 4 / 3; // чтобы 1/4 ушла в descent
    this.m_dDescentHeight = this.m_dRowHeight - this.m_dAscentHeight;

    this.m_sFontHeader   = "14px bold 'Segoe UI',Helvetica,Tahoma,Geneva,Verdana,sans-serif";
    this.m_sFontRecord   = "14px      'Segoe UI',Helvetica,Tahoma,Geneva,Verdana,sans-serif";

    var oThis = this;

    this.Init = function(sName, oListObject)
    {
        this.HtmlElement.Control = CreateControlContainer(sName);
        var oElement = this.HtmlElement.Control.HtmlElement;

        var oSelectionElement = document.createElement("canvas");
        oSelectionElement.setAttribute("id", sName + "_SelectionCanvas");
        oSelectionElement.setAttribute("class", "block_elem");
        oElement.appendChild(oSelectionElement);

        var oMainElement = document.createElement("canvas");
        oMainElement.setAttribute("id", sName + "_MainCanvas");
        oMainElement.setAttribute("class", "block_elem");
        oElement.appendChild(oMainElement);

        var oVerScrollElement = document.createElement("div");
        oVerScrollElement.setAttribute("id", sName + "_VerScroll");
        oElement.appendChild(oVerScrollElement);

        var oControl = this.HtmlElement.Control;
        this.HtmlElement.MainCanvas.Control = CreateControlContainer(sName + "_MainCanvas");
        var MainCanvas = this.HtmlElement.MainCanvas.Control;
        MainCanvas.Bounds.SetParams(0,0,14,1000,false,false,true,false, -1,-1);
        MainCanvas.Anchor = (g_anchor_top | g_anchor_left | g_anchor_bottom);
        oControl.AddControl(MainCanvas);

        this.HtmlElement.SelectionCanvas.Control = CreateControlContainer(sName + "_SelectionCanvas");
        var SelectionCanvas = this.HtmlElement.SelectionCanvas.Control;
        SelectionCanvas.Bounds.SetParams(0,0,14,1000,false,false,true,false, -1,-1);
        SelectionCanvas.Anchor = (g_anchor_top | g_anchor_left | g_anchor_bottom);
        oControl.AddControl(SelectionCanvas);

        this.HtmlElement.VerScroll = oVerScrollElement;

        oMainElement.onmousemove  = this.private_OnMouseMove;
        oMainElement.onmouseout   = this.private_OnMouseOut;
        oMainElement.onmousedown  = this.private_OnMouseDown;
        oMainElement.onmouseup    = this.private_OnMouseUp;
        oMainElement["onmousewheel"] = this.private_OnMouseWheel;
        if (oMainElement.addEventListener)
            oMainElement.addEventListener("DOMMouseScroll", this.private_OnMouseWheel, false);

        this.m_oListObject = oListObject;
        this.m_nColsCount  = oListObject.Headers.Count;

        for (var nCurCol = 0; nCurCol < this.m_nColsCount; nCurCol++)
            this.m_aX[nCurCol] = oListObject.Headers.Sizes[nCurCol];
        this.m_aX[this.m_nColsCount] = this.m_dXLimit;

        this.m_aY[0] = this.m_dRowHeight;

        return oControl;
    };

    this.private_OnMouseMove = function(e)
    {
        check_MouseMoveEvent(e);
        var oPos = oThis.private_UpdateMousePos(global_mouseEvent.X, global_mouseEvent.Y);

        if (-1 !== oThis.m_nTrackBorder)
        {
            oThis.private_SetColX(oThis.m_nTrackBorder, oPos.X);
            oThis.private_UpdateMainContext();
        }
        else
        {
            oThis.m_nSelectedIndex = oThis.private_GetIndexByXY(oPos.X, oPos.Y);
            oThis.private_UpdateCursorType(oPos.X, oPos.Y);
            oThis.private_UpdateSelectionContext();
        }
    };

    this.private_OnMouseOut = function(e)
    {
        check_MouseMoveEvent(e);
        oThis.m_nSelectedIndex = -1;
        oThis.private_UpdateSelectionContext();

        if (-1 !== oThis.m_nTrackBorder)
            oThis.m_nTrackBorder = -1;
    };

    this.private_OnMouseDown = function(e)
    {
        check_MouseDownEvent(e, true);
        var oPos = oThis.private_UpdateMousePos(global_mouseEvent.X, global_mouseEvent.Y);
        oThis.m_nSelectedIndex = oThis.private_GetIndexByXY(oPos.X, oPos.Y);

        var nCurCol = oThis.private_CheckBorder(oPos.X, oPos.Y);
        if (-1 !== nCurCol)
            oThis.m_nTrackBorder = nCurCol;
        else if (-1 !== (nCurCol = oThis.private_CheckHeader(oPos.X, oPos.Y)))
        {
            oThis.private_Sort(nCurCol);
            oThis.private_UpdateMainContext();
            oThis.private_UpdateSelectionContext();
        }
        else
        {
            if (2 == global_mouseEvent.ClickCount && oThis.m_oListObject && oThis.m_oListObject.Handle_DoubleClick)
                oThis.m_oListObject.Handle_DoubleClick(oThis.m_aList[oThis.m_nSelectedIndex]);
        }

        e.preventDefault();
    };

    this.private_OnMouseUp = function(e)
    {
        check_MouseMoveEvent(e);
        var oPos = oThis.private_UpdateMousePos(global_mouseEvent.X, global_mouseEvent.Y);
        if (-1 !== oThis.m_nTrackBorder)
        {
            oThis.private_SetColX(oThis.m_nTrackBorder, oPos.X);
            oThis.m_nTrackBorder = -1;
            oThis.private_UpdateMainContext();
        }

        e.preventDefault();
    };

    this.private_OnMouseWheel = function(e)
    {
        var delta = 0;
        var deltaX = 0;
        var deltaY = 0;

        if (undefined != e.wheelDelta && e.wheelDelta != 0)
        {
            //delta = (e.wheelDelta > 0) ? -45 : 45;
            delta = -45 * e.wheelDelta / 120;
        }
        else if (undefined != e.detail && e.detail != 0)
        {
            //delta = (e.detail > 0) ? 45 : -45;
            delta = 45 * e.detail / 3;
        }

        // New school multidimensional scroll (touchpads) deltas
        deltaY = delta;

        if (oThis.m_bIsHorScrollVisible)
        {
            if (e.axis !== undefined && e.axis === e.HORIZONTAL_AXIS)
            {
                deltaY = 0;
                deltaX = delta;
            }

            // Webkit
            if (e.wheelDeltaY !== undefined)
            {
                if (e.wheelDelta != 0)
                {
                    //deltaY = (e.wheelDeltaY > 0) ? -45 : 45;
                    deltaY = -45 * e.wheelDeltaY / 120;
                }
            }
            if (e.wheelDeltaX !== undefined)
            {
                if (e.wheelDeltaX != 0)
                {
                    //deltaX = (e.wheelDeltaX > 0) ? -45 : 45;
                    deltaX = -45 * e.wheelDeltaX / 120;
                }
            }
        }

        oThis.private_ScrollByY(-deltaY);
        oThis.private_UpdateMainContext();
        oThis.private_UpdateSelectionContext();

        // Имитируем MouseMove
        var _e = {};
        _e.pageX = global_mouseEvent.X;
        _e.pageY = global_mouseEvent.Y;

        _e.clientX = global_mouseEvent.X;
        _e.clientY = global_mouseEvent.Y;

        _e.altKey   = global_mouseEvent.AltKey;
        _e.shiftKey = global_mouseEvent.ShiftKey;
        _e.ctrlKey  = global_mouseEvent.CtrlKey;
        _e.metaKey  = global_mouseEvent.CtrlKey;

        _e.srcElement = global_mouseEvent.Sender;

        oThis.private_OnMouseMove(_e);
    };

    this.private_OnDragVerScroll = function(X, Y)
    {
        var dOverallH = oThis.m_aY[oThis.m_aY.length - 1];
        var dLogicH   = oThis.m_dYLimit;

        var dScrollH  = Math.max(20, dLogicH * dLogicH / dOverallH );

        if (Math.abs(Y - (dLogicH - dScrollH)) < 2)
            oThis.m_dYOffset = -(dOverallH - dLogicH);
        else
            oThis.m_dYOffset = -Y * (dOverallH - dLogicH) / (dLogicH - dScrollH);

        oThis.private_UpdateMainContext();
        oThis.private_UpdateSelectionContext();
    };
}
CListView.prototype.Clear = function()
{
    this.m_aList = [];
    this.m_aY.length = 1;
};

CListView.prototype.Handle_Record = function(aLine)
{
    var sKey = this.m_oListObject.Get_Key(aLine);
    var nIndex = this.private_Find(sKey);

    if (0 === (aLine[0] | 0))
    {
        // add
        if (-1 !== nIndex)
            this.m_aList[nIndex].Update(aLine);
        else
        {
            var nLast = this.m_aList.length;
            this.m_aList.push(this.m_oListObject.Get_Record(aLine));
            this.m_aY.push(this.m_aY[nLast] + this.m_dRowHeight);
        }
    }
    else
    {
        // remove
        if (-1 !== nIndex)
        {
            this.m_aList.splice(nIndex, 1);
            this.m_aY.splice(this.m_aY.length - 1, 1);
            this.private_ScrollByY(0);
        }
    }
};

CListView.prototype.Update_Size = function()
{
    if (true !== this.private_IsValid())
        return;

    var W = this.HtmlElement.MainCanvas.Control.HtmlElement.width;
    var H = this.HtmlElement.MainCanvas.Control.HtmlElement.height;

    this.m_dYLimit = H;
    this.m_dXLimit = W;

    this.m_aX[this.m_nColsCount] = this.m_dXLimit;

    this.private_UpdateScrollSize();
};

CListView.prototype.Update = function()
{
    if (true !== this.private_IsValid())
        return;

    var dOverallH = this.m_aY[this.m_aY.length - 1];
    var dLogicH   = this.m_dYLimit;

    if (dLogicH > dOverallH)
        this.m_dYOffset = 0;
    else if (this.m_dYOffset < -(dOverallH - dLogicH))
        this.m_dYOffset = -(dOverallH - dLogicH);

    this.private_Sort();
    this.private_UpdateMainContext();
    this.private_UpdateSelectionContext();
    this.private_UpdateScrollSize();
};

CListView.prototype.private_UpdateScrollSize = function()
{
    var oVerScroll = this.HtmlElement.VerScroll;

    var dOverallH = this.m_aY[this.m_aY.length - 1];
    var dLogicH   = this.m_dYLimit;

    if (dOverallH < dLogicH)
    {
        oVerScroll.style.display = "none";
        return;
    }

    var dScrollH  = Math.min(dLogicH, Math.max(20, dLogicH * dLogicH / dOverallH ));

    oVerScroll.style.display    = "block";
    oVerScroll.style.height     = dScrollH;
    oVerScroll.style.position   = "absolute";
    if (Math.abs(this.m_dYOffset + (dOverallH - dLogicH)) < 2)
        oVerScroll.style.top = (dLogicH - dScrollH) + "px";
    else
        oVerScroll.style.top        = -this.m_dYOffset * (dLogicH - dScrollH) / (dOverallH - dLogicH) + "px";
    oVerScroll.style.left       = this.m_dXLimit;
    oVerScroll.style.width      = 14;
    oVerScroll.style.background = "rgb(255,255,255)";
    oVerScroll.style.border     = "1px solid rgb(190, 193, 196)";

    Common_DragHandler.Init(oVerScroll, null, this.m_dXLimit, this.m_dXLimit, 0, dLogicH - dScrollH);

    oVerScroll.onDrag = this.private_OnDragVerScroll;
};

CListView.prototype.private_UpdateScroll = function()
{
    var oVerScroll = this.HtmlElement.VerScroll;

    var dOverallH = this.m_aY[this.m_aY.length - 1] - this.m_aY[0];
    var dLogicH   = this.m_dYLimit;

    var dScrollH  = Math.max(20, dLogicH * dLogicH / dOverallH );

    if (Math.abs(this.m_dYOffset + (dOverallH - dLogicH)) < 2)
        oVerScroll.style.top = (dLogicH - dScrollH) + "px";
    else
        oVerScroll.style.top = -this.m_dYOffset * (dLogicH - dScrollH) / (dOverallH - dLogicH) + "px";
};

CListView.prototype.private_IsValid = function()
{
    if (null === this.HtmlElement.Control)
        return false;

    return true;
};

CListView.prototype.private_Sort = function(nColNum)
{
    if (undefined === nColNum)
    {
        this.m_aList.sort(this.m_oListObject.SortFunction);
        return;
    }

    if (this.m_oListObject.Is_Sortable(Math.abs(nColNum)))
    {
        var OldSortType = this.m_oListObject.SortType;
        this.m_oListObject.Set_SortType(nColNum, 1);

        if (OldSortType === this.m_oListObject.SortType)
            this.m_oListObject.Set_SortType(nColNum, -1);

        this.m_aList.sort(this.m_oListObject.SortFunction);
    }
};

CListView.prototype.private_UpdateMainContext = function()
{
    var oContext = this.HtmlElement.MainCanvas.Control.HtmlElement.getContext("2d");
    oContext.clearRect(0, 0, this.m_dXLimit, this.m_dYLimit);
    //oContext.fillStyle = this.m_oBGColor.ToString();
    //oContext.fillRect(0, 0, this.m_dXLimit, this.m_dYLimit);
    this.private_Draw(oContext, 0, this.m_dXLimit, this.m_dYLimit);
};

CListView.prototype.private_UpdateSelectionContext = function()
{
    var oContext = this.HtmlElement.SelectionCanvas.Control.HtmlElement.getContext("2d");
    oContext.fillStyle = this.m_oBGColor.ToString();//"#FFFFFF";
    oContext.beginPath();
    oContext.moveTo(0, 0);
    oContext.lineTo(this.m_dXLimit, 0);
    oContext.lineTo(this.m_dXLimit, this.m_dYLimit);
    oContext.lineTo(0, this.m_dYLimit);
    oContext.lineTo(0, 0);
    oContext.fill();

    if (-1 !== this.m_nSelectedIndex)
    {
        var dX0 = this.m_aX[0];
        var dX1 = this.m_aX[this.m_aX.length - 1];

        var dY0 = this.m_aY[this.m_nSelectedIndex] + this.m_dYOffset;
        var dY1 = dY0 + this.m_dRowHeight;

        oContext.save();
        oContext.beginPath();
        oContext.rect(this.m_aX[0], this.m_aY[0], this.m_aX[this.m_aX.length - 1] - this.m_aX[0], this.m_dYLimit - this.m_aY[0]);
        oContext.clip();

        oContext.fillStyle = "rgb(204, 230, 227)";
        //oContext.fillStyle = "rgb(219,229,241)";
        oContext.beginPath();
        oContext.moveTo(dX0, dY0);
        oContext.lineTo(dX1, dY0);
        oContext.lineTo(dX1, dY1);
        oContext.lineTo(dX0, dY1);
        oContext.lineTo(dX0, dY0);
        oContext.fill();

        oContext.restore();
    }
};

CListView.prototype.private_Draw = function(oContext, dYOffset, dXLimit, dYLimit)
{
    var dLeftPadding = 5;

    this.m_dYLimit = dYLimit;
    this.private_DrawGrid(oContext);

    for (var nIndex = 0; nIndex < this.m_nColsCount; nIndex++)
    {
        var dX = this.m_aX[nIndex];
        var dY = this.m_aY[0];

        oContext.save();
        oContext.beginPath();
        oContext.rect(dX, 0, this.m_aX[nIndex + 1] - dX, dYLimit);
        oContext.clip();

        oContext.font      = this.m_sFontHeader;

        this.m_oListObject.Draw_Header(dX + dLeftPadding, dY - this.m_dDescentHeight, oContext, nIndex);

        oContext.font      = this.m_sFontRecord;
        var nRecordsCount = this.m_aList.length;

        oContext.beginPath();
        oContext.rect(dX, this.m_aY[0], this.m_aX[nIndex + 1] - dX, dYLimit - this.m_aY[0]);
        oContext.clip();

        // Чтобы не рисовать лишнее контролируем вехнюю границу через nStartIndex и нижнюю границу через
        // сравнение dY > dYLimit.
        var nStartIndex = 0;
        if (this.m_dYOffset < 0)
            nStartIndex = (-this.m_dYOffset / this.m_dRowHeight) | 0;

        for (var nRecordIndex = nStartIndex; nRecordIndex < nRecordsCount; nRecordIndex++)
        {
            var dY = this.m_aY[nRecordIndex + 1] + this.m_dYOffset;
            if (dY - this.m_dRowHeight > dYLimit)
                break;

            this.m_oListObject.Draw_Record(dX + dLeftPadding, dY - this.m_dDescentHeight, oContext, this.m_aList[nRecordIndex], nIndex);
        }
        oContext.restore();
    }
};

CListView.prototype.private_DrawGrid = function(oContext)
{
    if (this.m_aY.length <= 0 || this.m_nColsCount <= 0)
        return;

    var nH  = this.m_aY[0] / 3;
    var nW  = this.m_aX[this.m_nColsCount] - this.m_aX[0];
    var nH2 = this.m_dYLimit;

    if (nH <= 0 || nW <= 0 || nH2 <= 0)
        return;

    var VerLine2 = oContext.createImageData(3, nH);
    var HorLine  = oContext.createImageData(nW, 1);
    var VerLine  = oContext.createImageData(1, nH2);

    var LineColor  = new CColor(187, 187, 187, 255);
    var LineColor2 = new CColor(223, 223, 223, 255);

    for (var y = 0; y < nH; y++)
    {
        for (var x = 0; x < 3; x++)
        {
            var Index = (y * 3 + x) * 4;

            if (0 == x || 2 == x)
            {
                VerLine2.data[Index + 0] = LineColor2.r;
                VerLine2.data[Index + 1] = LineColor2.g;
                VerLine2.data[Index + 2] = LineColor2.b;
                VerLine2.data[Index + 3] = LineColor2.a;
            }
            else
            {
                VerLine2.data[Index + 0] = 255;
                VerLine2.data[Index + 1] = 255;
                VerLine2.data[Index + 2] = 255;
                VerLine2.data[Index + 3] = 0;
            }
        }
    }

    for ( var i = 0; i < nW; i++ )
    {
        var Index = i * 4;
        HorLine.data[Index + 0] = LineColor.r;
        HorLine.data[Index + 1] = LineColor.g;
        HorLine.data[Index + 2] = LineColor.b;
        HorLine.data[Index + 3] = LineColor.a;
    }

    for ( var i = 0; i < nH2; i++ )
    {
        var Index = i * 4;
        VerLine.data[Index + 0] = LineColor.r;
        VerLine.data[Index + 1] = LineColor.g;
        VerLine.data[Index + 2] = LineColor.b;
        VerLine.data[Index + 3] = LineColor.a;
    }

    for (var nCurCol = 1; nCurCol < this.m_nColsCount - 1; nCurCol++)
    {
        oContext.putImageData(VerLine2, this.m_aX[nCurCol + 1] - 1, this.m_aY[0] / 3);
    }

    oContext.putImageData(HorLine, this.m_aX[0], this.m_aY[0]);
    oContext.putImageData(VerLine, this.m_aX[1], 0);
};

CListView.prototype.private_UpdateCursorType = function(dX, dY)
{
    if (-1 !== this.private_CheckBorder(dX, dY))
        this.HtmlElement.MainCanvas.Control.HtmlElement.style.cursor = 'col-resize';
    else
        this.HtmlElement.MainCanvas.Control.HtmlElement.style.cursor = "default";
};

CListView.prototype.private_GetIndexByXY = function(dX, _dY)
{
    var dY = _dY - this.m_dYOffset;
    var nRecordNum = -1;
    var nRecordsCount = this.m_aList.length;
    for (var nRecordIndex = 0; nRecordIndex < nRecordsCount; nRecordIndex++)
    {
        var dCurY = this.m_aY[nRecordIndex];
        if (dCurY + this.m_dRowHeight >= dY && dY > dCurY)
        {
            nRecordNum = nRecordIndex;
            break;
        }
    }

    return nRecordNum;
};

CListView.prototype.private_CheckBorder = function(dX, dY)
{
    if (dY > this.m_aY[0])
        return -1;

    var nColsCount = this.m_aX.length;
    for (var nCurCol = 1; nCurCol < nColsCount; nCurCol++)
    {
        var dCurX = this.m_aX[nCurCol];
        if (dX < dCurX + 3 && dX > dCurX - 3)
            return nCurCol;
    }

    return -1;
};

CListView.prototype.private_CheckHeader = function(dX, dY)
{
    if (dY >= 0 && dY <= this.m_aY[0])
    {
        var nColsCount = this.m_aX.length;
        for (var nCurCol = 0; nCurCol < nColsCount; nCurCol++)
        {
            if (dX >= this.m_aX[nCurCol] && dX < this.m_aX[nCurCol + 1])
                return nCurCol;
        }
    }

    return -1;
};

CListView.prototype.private_ScrollByY = function(dDeltaY)
{
    this.m_dYOffset += dDeltaY;
    this.m_dYOffset = Math.min(0, this.m_dYOffset);

    var dHeight = this.m_aList.length * this.m_dRowHeight;
    if (dHeight < this.m_dYLimit - this.m_dRowHeight)
        this.m_dYOffset = 0;
    else if (dHeight + this.m_dYOffset < this.m_dYLimit - this.m_dRowHeight)
        this.m_dYOffset = this.m_dYLimit - this.m_dRowHeight - dHeight;

    this.private_UpdateScroll();
};

CListView.prototype.private_SetColX = function(nColNum, dX)
{
    if (nColNum <= 0 || nColNum > this.m_nColsCount - 1)
        return;

    // Контролируем, чтобы колонка не ушла в 0
    var nOldColX = this.m_aX[nColNum];
    var nNewColX = Math.min(this.m_aX[nColNum + 1] - 10, Math.max(this.m_aX[nColNum - 1] + 10, dX));

    var nDiff = nNewColX - nOldColX;
    for (var nCurColNum = nColNum, nColsCount = this.m_nColsCount; nCurColNum < nColsCount; ++nCurColNum)
        this.m_aX[nCurColNum] += nDiff;

    //this.m_aX[nColNum] = Math.min(this.m_aX[nColNum + 1] - 10, Math.max(this.m_aX[nColNum - 1] + 10, dX));
};

CListView.prototype.private_UpdateMousePos = function(X, Y)
{
    var oPos = Common_FindPosition(this.HtmlElement.MainCanvas.Control.HtmlElement);
    return { X: X - oPos.X, Y : Y - oPos.Y };
};

CListView.prototype.private_Find = function(sKey)
{
    for (var nIndex = 0, nCount = this.m_aList.length; nIndex < nCount; nIndex++)
    {
        if (true === this.m_aList[nIndex].Compare(sKey))
            return nIndex;
    }

    return -1;
};

CListView.prototype.Set_BGColor = function(r, g, b)
{
    this.m_oBGColor.Set(r, g, b);
};