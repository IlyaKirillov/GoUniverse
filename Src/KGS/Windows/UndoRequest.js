"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     01.10.2016
 * Time     15:38
 */

function CKGSUndoRequestWindow()
{
	CKGSUndoRequestWindow.superclass.constructor.call(this);

	this.m_oButtonNeverUndo = null;
}
CommonExtend(CKGSUndoRequestWindow, CKGSWindowConfirmBase);

CKGSUndoRequestWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSUndoRequestWindow.superclass.Init.call(this, sDivId, oPr);

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	var oButtonsDiv  = this.HtmlElement.OkCancelDiv;
	var _sDivId      = oMainDiv.id;

	var sCaption = "Never undo";
	g_oTextMeasurer.SetFont("16px 'Segoe UI', Helvetica, Tahoma, Geneva, Verdana, sans-serif");
	var nCaptionWidth = g_oTextMeasurer.Measure(sCaption);
	var sButtonNerverUndo = _sDivId + "NerverUndo";
	var oButtonNeverUndoElement = this.protected_CreateDivElement(oButtonsDiv, sButtonNerverUndo);
	var oButtonNeverUndoControl = CreateControlContainerByElement(oButtonNeverUndoElement);
	oButtonNeverUndoControl.Bounds.SetParams(0, 9, 159, 1000, false, true, true, false, nCaptionWidth + 10, 21);
	oButtonNeverUndoControl.Anchor = (g_anchor_top | g_anchor_right);
	oMainControl.AddControl(oButtonNeverUndoControl);

	var oGameRoom = oPr.GameRoom;
	var oThis = this;
	var oButttonNeverUndo = new CDrawingButtonSimpleText(sCaption, function()
	{
		oGameRoom.ForbidUndo();
		oThis.Close();
	}, "");
	oButttonNeverUndo.Init(sButtonNerverUndo, this);
	this.m_oButtonNeverUndo = oButttonNeverUndo;

	this.Update_Size();
};
CKGSUndoRequestWindow.prototype.Update_Size = function(bForce)
{
	CKGSUndoRequestWindow.superclass.Update_Size.apply(this, arguments);

	if (this.m_oButtonNeverUndo)
		this.m_oButtonNeverUndo.Update_Size(bForce);
};
