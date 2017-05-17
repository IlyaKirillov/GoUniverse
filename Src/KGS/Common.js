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
	},

	/**
	 * Convert iso language code to a KGS-allowable code
	 * @param sCode
	 * @constructor
	 */
	GetLanguageCode : function(sCode)
	{
		var sLanguage = "en_US";
		switch (sCode)
		{
			case "bg" :
			case "bg-BG" :
				sLanguage = "bg_BG";
				break;
			case "ca" :
			case "ca-ES" :
				sLanguage = "ca_ES";
				break;
			case "cs" :
			case "cs-CZ" :
				sLanguage = "cs_CZ";
				break;
			case "da" :
			case "da-DK" :
				sLanguage = "da_DK";
				break;
			case "de" :
			case "de-AT" :
			case "de-CH" :
			case "de-DE" :
			case "de-LI" :
			case "de-LU" :
				sLanguage = "de_DE";
				break;
			case "en" :
			case "en-AU" :
			case "en-BZ" :
			case "en-CA" :
			case "en-CB" :
			case "en-GB" :
			case "en-IE" :
			case "en-JM" :
			case "en-NZ" :
			case "en-PH" :
			case "en-TT" :
			case "en-US" :
			case "en-ZA" :
			case "en-ZW" :
				sLanguage = "en_US";
				break;
			case "es" :
			case "es-AR" :
			case "es-BO" :
			case "es-CL" :
			case "es-CO" :
			case "es-CR" :
			case "es-DO" :
			case "es-EC" :
			case "es-ES" :
			case "es-GT" :
			case "es-HN" :
			case "es-MX" :
			case "es-NI" :
			case "es-PA" :
			case "es-PE" :
			case "es-PR" :
			case "es-PY" :
			case "es-SV" :
			case "es-UY" :
			case "es-VE" :
				sLanguage = "es_ES";
				break;
			case "eu" :
			case "eu-ES" :
				sLanguage = "eu_ES";
				break;
			case "fi" :
			case "fi-FI" :
				sLanguage = "fi_FI";
				break;
			case "fr" :
			case "fr-BE" :
			case "fr-CA" :
			case "fr-CH" :
			case "fr-FR" :
			case "fr-LU" :
			case "fr-MC" :
				sLanguage = "fr_FR";
				break;
			case "hu" :
			case "hu-HU" :
				sLanguage = "hu_HU";
				break;
			case "it" :
			case "it-CH" :
			case "it-IT" :
				sLanguage = "it_IT";
				break;
			case "ja" :
			case "ja-JP" :
				sLanguage = "ja_JP";
				break;
			case "ko" :
			case "ko-KR" :
				sLanguage = "ko_KR";
				break;
			case "lv" :
			case "lv-LV" :
				sLanguage = "lv_LV";
				break;
			case "pl" :
			case "pl-PL" :
				sLanguage = "pl_PL";
				break;
			case "pt" :
			case "pt-BR" :
			case "pt-PT" :
				sLanguage = "pt_BR";
				break;
			case "ro" :
			case "ro-RO" :
				sLanguage = "ro_RO";
				break;
			case "ru" :
			case "ru-RU" :
				sLanguage = "ru_RU";
				break;
			case "sk" :
			case "sk-SK" :
				sLanguage = "sk_SK";
				break;
			case "tr" :
			case "tr-TR" :
				sLanguage = "tr_TR";
				break;
			case "vi" :
			case "vi-VN" :
				sLanguage = "vi_VN";
				break;
			case "zh" :
			case "zh-CN" :
			case "zh-HK" :
			case "zh-MO" :
			case "zh-SG" :
			case "zh-TW" :
				sLanguage = "zh_CN";
				break;
		}

		return sLanguage;
	}

};
