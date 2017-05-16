"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     14.09.2016
 * Time     01:30
 */

var EKGSGameType = {
	Challenge     : 0,
	Demonstration : 1,
	Review        : 2,
	RengoReview   : 3,
	Teaching      : 4,
	Simul         : 5,
	Rengo         : 6,
	Free          : 7,
	Ranked        : 8,
	Tournament    : 9
};

var EKGSGameRules = {
	Japanese   : 0,
	Chinese    : 1,
	Aga        : 2,
	NewZealand : 3
};

var KGSCommon = {

	/**
	 * Parse a gameType string from KGS message.
	 * @param {string} sGameType
	 * @returns {EKGSGameType}
	 */
	GetGameType : function(sGameType)
	{
		if ("challenge" === sGameType)
			return EKGSGameType.Challenge;
		else if ("demonstration" === sGameType)
			return EKGSGameType.Demonstration;
		else if ("review" === sGameType)
			return EKGSGameType.Review;
		else if ("rengo_review" === sGameType)
			return EKGSGameType.RengoReview;
		else if ("teaching" === sGameType)
			return EKGSGameType.Teaching;
		else if ("simul" === sGameType)
			return EKGSGameType.Simul;
		else if ("rengo" === sGameType)
			return EKGSGameType.Rengo;
		else if ("free" === sGameType)
			return EKGSGameType.Free;
		else if ("ranked" === sGameType)
			return EKGSGameType.Ranked;
		else if ("tournament" === sGameType)
			return EKGSGameType.Tournament;

		return EKGSGameType.Free;
	},
	/**
	 * Convert a game type to KGS gameType string.
	 * @param {EKGSGameType} nGameType
	 * @returns {string}
	 */
	GameTypeToString : function(nGameType)
	{
		if (EKGSGameType.Challenge === nGameType)
			return "challenge";
		else if (EKGSGameType.Demonstration === nGameType)
			return "demonstration";
		else if (EKGSGameType.Review === nGameType)
			return "review";
		else if (EKGSGameType.RengoReview === nGameType)
			return "rengo_review";
		else if (EKGSGameType.Teaching === nGameType)
			return "teaching";
		else if (EKGSGameType.Simul === nGameType)
			return "simul";
		else if (EKGSGameType.Rengo === nGameType)
			return "rengo";
		else if (EKGSGameType.Free === nGameType)
			return "free";
		else if (EKGSGameType.Ranked === nGameType)
			return "ranked";
		else if (EKGSGameType.Tournament === nGameType)
			return "tournament";

		return "free";
	},
	/**
	 * Parse rules string from KGS message.
	 * @param {string} sRules
	 * @returns {EKGSGameRules}
	 */
	GetGameRules : function(sRules)
	{
		if ("japanese" === sRules)
			return EKGSGameRules.Japanese;
		else if ("chinese" === sRules)
			return EKGSGameRules.Chinese;
		else if ("aga" === sRules)
			return EKGSGameRules.Aga;
		else if ("new_zealand" === sRules)
			return EKGSGameRules.NewZealand;

		return EKGSGameRules.Japanese;
	},
	/**
	 * Convert a rules type to KGS rules string.
	 * @param {EKGSGameRules} nRules
	 * @returns {string}
	 */
	GameRulesToString : function(nRules)
	{
		if (EKGSGameRules.Japanese === nRules)
			return "japanese";
		else if (EKGSGameRules.Chinese === nRules)
			return "chinese";
		else if (EKGSGameRules.Aga === nRules)
			return "aga";
		else if (EKGSGameRules.NewZealand === nRules)
			return "new_zealand";

		return "japanese";
	},

	/**
	 * Convert a rules type to a readable string.
	 * @param {EKGSGameRules} nRules
	 * @returns {string}
	 */
	GameRulesToReadableString : function(nRules)
	{
		if (EKGSGameRules.Japanese === nRules)
			return g_oLocalization.common.rules.japanese;
		else if (EKGSGameRules.Chinese === nRules)
			return g_oLocalization.common.rules.chinese;
		else if (EKGSGameRules.Aga === nRules)
			return g_oLocalization.common.rules.aga;
		else if (EKGSGameRules.NewZealand === nRules)
			return g_oLocalization.common.rules.newZealand;

		return g_oLocalization.common.rules.japanese;
	},

	/**
	 * Convert a time system to KGS string.
	 * @param {CTimeSettings} oTime
	 * @returns {string}
	 */
	TimeSystemToString : function(oTime)
	{
		if (oTime.IsAbsolute())
			return "absolute";
		else if (oTime.IsByoYomi())
			return "byo_yomi";
		else if (oTime.IsCanadian())
			return "canadian";
		else if (oTime.IsNone())
			return "none";

		return "none";
	}

};
