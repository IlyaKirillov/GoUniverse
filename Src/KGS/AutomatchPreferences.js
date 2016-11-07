"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     07.11.2016
 * Time     22:52
 */

function CKGSAutomatchPreferences()
{
	this.m_nMaxHandicap   = 6;
	this.m_sEstimadedRank = "27k";
	this.m_bFree          = true;
	this.m_bRanked        = true;
	this.m_bRobot         = true;
	this.m_bHuman         = true;
	this.m_bUnranked      = true;
	this.m_bBlitz         = true;
	this.m_bMedium        = true;
	this.m_bFast          = true;
}
CKGSAutomatchPreferences.prototype.Parse = function(oMessage)
{
	if (!oMessage)
		return;

	if (undefined !== oMessage["maxHandicap"])
		this.m_nMaxHandicap = parseInt(oMessage["maxHandicap"]);

	if (undefined !== oMessage["estimatedRank"])
		this.m_sEstimadedRank = oMessage["estimatedRank"];

	if (undefined !== oMessage["freeOk"])
		this.m_bFree = oMessage["freeOk"];

	if (undefined !== oMessage["rankedOk"])
		this.m_bRanked = oMessage["rankedOk"];

	if (undefined !== oMessage["robotOk"])
		this.m_bRobot = oMessage["robotOk"];

	if (undefined !== oMessage["humanOk"])
		this.m_bHuman = oMessage["humanOk"];

	if (undefined !== oMessage["unrankedOk"])
		this.m_bUnranked = oMessage["unrankedOk"];

	if (undefined !== oMessage["blitzOk"])
		this.m_bBlitz = oMessage["blitzOk"];

	if (undefined !== oMessage["fastOk"])
		this.m_bFast = oMessage["fastOk"];

	if (undefined !== oMessage["mediumOk"])
		this.m_bMedium = oMessage["mediumOk"];
};
CKGSAutomatchPreferences.prototype.CreateKGSMessage = function()
{
	var oMessage = {};

	oMessage["maxHandicap"]   = this.m_nMaxHandicap;
	oMessage["estimatedRank"] = this.m_sEstimadedRank;
	oMessage["freeOk"]        = this.m_bFree;
	oMessage["rankedOk"]      = this.m_bRanked;
	oMessage["robotOk"]       = this.m_bRobot;
	oMessage["humanOk"]       = this.m_bHuman;
	oMessage["unrankedOk"]    = this.m_bUnranked;
	oMessage["blitzOk"]       = this.m_bBlitz;
	oMessage["fastOk"]        = this.m_bFast;
	oMessage["mediumOk"]      = this.m_bMedium;

	return oMessage;
};