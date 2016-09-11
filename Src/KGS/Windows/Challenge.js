"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     08.09.2016
 * Time     23:29
 */

function CKGSChallengeWindow()
{
	CKGSChallengeWindow.superclass.constructor.call(this);

	this.m_nChannelId = -1;
	this.m_oGameRecord = null;

	this.m_bCanEdit = false;
}
CommonExtend(CKGSChallengeWindow, CKGSWindowBase);

CKGSChallengeWindow.prototype.Init = function(sDivId, oPr)
{
	CKGSChallengeWindow.superclass.Init.apply(this, arguments);

	this.m_nChannelId = oPr.ChannelId;
	this.m_oGameRecord = oPr.GameRecord;

	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;
	oMainDiv.style.background = "rgb(243, 243, 243)";

	var oProposal = this.m_oGameRecord.GetProposal();
	var oChallengeCreator = this.m_oGameRecord.GetChallengeCreator();

	this.Set_Caption(oChallengeCreator ? "New game vs. " + oChallengeCreator.GetName() : "New game");


	this.private_CreateName(this.m_oGameRecord.GetComment());

	this.Update_Size();
};
CKGSChallengeWindow.prototype.Update_Size = function(bForce)
{
	CKGSChallengeWindow.superclass.Update_Size.call(this, bForce);

};
CKGSChallengeWindow.prototype.Get_DefaultWindowSize = function()
{
	return {W : 700, H : 450};
};
CKGSChallengeWindow.prototype.Close = function()
{
	CKGSChallengeWindow.superclass.Close.call(this);
	this.m_oClient.CloseChallenge(this.m_nChannelId);
};
CKGSChallengeWindow.prototype.private_CreateName = function()
{
	var oMainDiv     = this.HtmlElement.InnerDiv;
	var oMainControl = this.HtmlElement.InnerControl;

	var oWrapperDiv     = this.protected_CreateDivElement(oMainDiv);
	var oWrapperControl = CreateControlContainterByElement(oWrapperDiv);
	oWrapperControl.SetParams(100, 0, 1000, 1000, true, false, false, false, -1, 30);
	oWrapperControl.SetAnchor(false, true, true, false);
	oMainControl.AddControl(oWrapperControl);

	var oInput = this.protected_CreateDivElement(oWrapperDiv, null, "input");
	oInput.className += "challengeInput";
	var oInputControl = CreateControlContainterByElement(oInput);
	oInputControl.SetParams(5, 5, 5, 0, true, true, true, true, -1, -1);
	oInputControl.SetAnchor(true, true, true, true);
	oWrapperControl.AddControl(oInputControl);

	var sComment = this.m_oGameRecord.GetComment();
	if (sComment)
		oInput.value = sComment;

	if (true !== this.m_bCanEdit)
		oInput.disabled = "disabled";


	var oWrapperTypeDiv     = this.protected_CreateDivElement(oMainDiv);
	var oWrapperTypeControl = CreateControlContainterByElement(oWrapperTypeDiv);
	oWrapperTypeControl.SetParams(0, 0, -1, -1, true, true, false, false, 100, 30);
	oWrapperTypeControl.SetAnchor(true, true, false, false);
	oMainControl.AddControl(oWrapperTypeControl);

	var oTypeList       = this.protected_CreateDivElement(oWrapperTypeDiv, null, "select");
	oTypeList.className += "challengeSelect";
	oTypeList.style.fontWeight = "bold";
	var oOption         = document.createElement("option");
	oOption.value       = "Ranked";
	oOption.textContent = "Ranked";
	oTypeList.appendChild(oOption);
	oOption             = document.createElement("option");
	oOption.value       = "Free";
	oOption.textContent = "Free";
	oTypeList.appendChild(oOption);
	oOption             = document.createElement("option");
	oOption.value       = "Rengo";
	oOption.textContent = "Rengo";
	oTypeList.appendChild(oOption);
	oOption             = document.createElement("option");
	oOption.value       = "Simulation";
	oOption.textContent = "Simulation";
	oTypeList.appendChild(oOption);

	var oProposal = this.m_oGameRecord.GetProposal();
	if (oProposal)
	{
		var nType = oProposal.GetGameType();
		if (EKGSGameType.Ranked === nType)
			oTypeList.selectedIndex = 0;
		else if (EKGSGameType.Free === nType)
			oTypeList.selectedIndex = 1;
		else if (EKGSGameType.Rengo === nType)
			oTypeList.selectedIndex = 2;
		else if (EKGSGameType.Simul === nType)
			oTypeList.selectedIndex = 3;
	}

	var oTypeListControl = CreateControlContainterByElement(oTypeList);
	oTypeListControl.SetParams(5, 5, 5, 0, true, true, true, true, -1, -1);
	oTypeListControl.SetAnchor(true, true, true, true);
	oWrapperTypeControl.AddControl(oTypeListControl);


	if (true !== this.m_bCanEdit)
		oTypeList.disabled = "disabled";


};
CKGSChallengeWindow.prototype.private_CreatePlayers = function()
{

};