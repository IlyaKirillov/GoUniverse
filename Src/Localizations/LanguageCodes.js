"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     16.05.2017
 * Time     13:51
 */

function GetLanguage(sCode)
{
	sCode = sCode.replace("_", "-");

	var sLanguage = "English";
	switch (sCode)
	{
		case "af" :
			sLanguage = "Afrikaans";
			break;
		case "af-ZA" :
			sLanguage = "Afrikaans (South Africa)";
			break;
		case "ar" :
			sLanguage = "Arabic";
			break;
		case "ar-AE" :
			sLanguage = "Arabic (U.A.E.)";
			break;
		case "ar-BH" :
			sLanguage = "Arabic (Bahrain)";
			break;
		case "ar-DZ" :
			sLanguage = "Arabic (Algeria)";
			break;
		case "ar-EG" :
			sLanguage = "Arabic (Egypt)";
			break;
		case "ar-IQ" :
			sLanguage = "Arabic (Iraq)";
			break;
		case "ar-JO" :
			sLanguage = "Arabic (Jordan)";
			break;
		case "ar-KW" :
			sLanguage = "Arabic (Kuwait)";
			break;
		case "ar-LB" :
			sLanguage = "Arabic (Lebanon)";
			break;
		case "ar-LY" :
			sLanguage = "Arabic (Libya)";
			break;
		case "ar-MA" :
			sLanguage = "Arabic (Morocco)";
			break;
		case "ar-OM" :
			sLanguage = "Arabic (Oman)";
			break;
		case "ar-QA" :
			sLanguage = "Arabic (Qatar)";
			break;
		case "ar-SA" :
			sLanguage = "Arabic (Saudi Arabia)";
			break;
		case "ar-SY" :
			sLanguage = "Arabic (Syria)";
			break;
		case "ar-TN" :
			sLanguage = "Arabic (Tunisia)";
			break;
		case "ar-YE" :
			sLanguage = "Arabic (Yemen)";
			break;
		case "az" :
			sLanguage = "Azeri";
			break;
		case "az-AZ" :
			sLanguage = "Azeri (Azerbaijan)";
			break;
		case "be" :
			sLanguage = "Belarusian";
			break;
		case "be-BY" :
			sLanguage = "Belarusian (Belarus)";
			break;
		case "bg" :
			sLanguage = "Bulgarian";
			break;
		case "bg-BG" :
			sLanguage = "Bulgarian (Bulgaria)";
			break;
		case "bs-BA" :
			sLanguage = "Bosnian (Bosnia and Herzegovina)";
			break;
		case "ca" :
			sLanguage = "Catalan";
			break;
		case "ca-ES" :
			sLanguage = "Catalan (Spain)";
			break;
		case "cs" :
			sLanguage = "Czech";
			break;
		case "cs-CZ" :
			sLanguage = "Czech (Czech Republic)";
			break;
		case "cy" :
			sLanguage = "Welsh";
			break;
		case "cy-GB" :
			sLanguage = "Welsh (United Kingdom)";
			break;
		case "da" :
			sLanguage = "Danish";
			break;
		case "da-DK" :
			sLanguage = "Danish (Denmark)";
			break;
		case "de" :
			sLanguage = "German";
			break;
		case "de-AT" :
			sLanguage = "German (Austria)";
			break;
		case "de-CH" :
			sLanguage = "German (Switzerland)";
			break;
		case "de-DE" :
			sLanguage = "German (Germany)";
			break;
		case "de-LI" :
			sLanguage = "German (Liechtenstein)";
			break;
		case "de-LU" :
			sLanguage = "German (Luxembourg)";
			break;
		case "dv" :
			sLanguage = "Divehi";
			break;
		case "dv-MV" :
			sLanguage = "Divehi (Maldives)";
			break;
		case "el" :
			sLanguage = "Greek";
			break;
		case "el-GR" :
			sLanguage = "Greek (Greece)";
			break;
		case "en" :
			sLanguage = "English";
			break;
		case "en-AU" :
			sLanguage = "English (Australia)";
			break;
		case "en-BZ" :
			sLanguage = "English (Belize)";
			break;
		case "en-CA" :
			sLanguage = "English (Canada)";
			break;
		case "en-CB" :
			sLanguage = "English (Caribbean)";
			break;
		case "en-GB" :
			sLanguage = "English (United Kingdom)";
			break;
		case "en-IE" :
			sLanguage = "English (Ireland)";
			break;
		case "en-JM" :
			sLanguage = "English (Jamaica)";
			break;
		case "en-NZ" :
			sLanguage = "English (New Zealand)";
			break;
		case "en-PH" :
			sLanguage = "English (Republic of the Philippines)";
			break;
		case "en-TT" :
			sLanguage = "English (Trinidad and Tobago)";
			break;
		case "en-US" :
			sLanguage = "English (United States)";
			break;
		case "en-ZA" :
			sLanguage = "English (South Africa)";
			break;
		case "en-ZW" :
			sLanguage = "English (Zimbabwe)";
			break;
		case "eo" :
			sLanguage = "Esperanto";
			break;
		case "es" :
			sLanguage = "Spanish";
			break;
		case "es-AR" :
			sLanguage = "Spanish (Argentina)";
			break;
		case "es-BO" :
			sLanguage = "Spanish (Bolivia)";
			break;
		case "es-CL" :
			sLanguage = "Spanish (Chile)";
			break;
		case "es-CO" :
			sLanguage = "Spanish (Colombia)";
			break;
		case "es-CR" :
			sLanguage = "Spanish (Costa Rica)";
			break;
		case "es-DO" :
			sLanguage = "Spanish (Dominican Republic)";
			break;
		case "es-EC" :
			sLanguage = "Spanish (Ecuador)";
			break;
		case "es-ES" :
			sLanguage = "Spanish (Spain)";
			break;
		case "es-GT" :
			sLanguage = "Spanish (Guatemala)";
			break;
		case "es-HN" :
			sLanguage = "Spanish (Honduras)";
			break;
		case "es-MX" :
			sLanguage = "Spanish (Mexico)";
			break;
		case "es-NI" :
			sLanguage = "Spanish (Nicaragua)";
			break;
		case "es-PA" :
			sLanguage = "Spanish (Panama)";
			break;
		case "es-PE" :
			sLanguage = "Spanish (Peru)";
			break;
		case "es-PR" :
			sLanguage = "Spanish (Puerto Rico)";
			break;
		case "es-PY" :
			sLanguage = "Spanish (Paraguay)";
			break;
		case "es-SV" :
			sLanguage = "Spanish (El Salvador)";
			break;
		case "es-UY" :
			sLanguage = "Spanish (Uruguay)";
			break;
		case "es-VE" :
			sLanguage = "Spanish (Venezuela)";
			break;
		case "et" :
			sLanguage = "Estonian";
			break;
		case "et-EE" :
			sLanguage = "Estonian (Estonia)";
			break;
		case "eu" :
			sLanguage = "Basque";
			break;
		case "eu-ES" :
			sLanguage = "Basque (Spain)";
			break;
		case "fa" :
			sLanguage = "Farsi";
			break;
		case "fa-IR" :
			sLanguage = "Farsi (Iran)";
			break;
		case "fi" :
			sLanguage = "Finnish";
			break;
		case "fi-FI" :
			sLanguage = "Finnish (Finland)";
			break;
		case "fo" :
			sLanguage = "Faroese";
			break;
		case "fo-FO" :
			sLanguage = "Faroese (Faroe Islands)";
			break;
		case "fr" :
			sLanguage = "French";
			break;
		case "fr-BE" :
			sLanguage = "French (Belgium)";
			break;
		case "fr-CA" :
			sLanguage = "French (Canada)";
			break;
		case "fr-CH" :
			sLanguage = "French (Switzerland)";
			break;
		case "fr-FR" :
			sLanguage = "French (France)";
			break;
		case "fr-LU" :
			sLanguage = "French (Luxembourg)";
			break;
		case "fr-MC" :
			sLanguage = "French (Principality of Monaco)";
			break;
		case "gl" :
			sLanguage = "Galician";
			break;
		case "gl-ES" :
			sLanguage = "Galician (Spain)";
			break;
		case "gu" :
			sLanguage = "Gujarati";
			break;
		case "gu-IN" :
			sLanguage = "Gujarati (India)";
			break;
		case "he" :
			sLanguage = "Hebrew";
			break;
		case "he-IL" :
			sLanguage = "Hebrew (Israel)";
			break;
		case "hi" :
			sLanguage = "Hindi";
			break;
		case "hi-IN" :
			sLanguage = "Hindi (India)";
			break;
		case "hr" :
			sLanguage = "Croatian";
			break;
		case "hr-BA" :
			sLanguage = "Croatian (Bosnia and Herzegovina)";
			break;
		case "hr-HR" :
			sLanguage = "Croatian (Croatia)";
			break;
		case "hu" :
			sLanguage = "Hungarian";
			break;
		case "hu-HU" :
			sLanguage = "Hungarian (Hungary)";
			break;
		case "hy" :
			sLanguage = "Armenian";
			break;
		case "hy-AM" :
			sLanguage = "Armenian (Armenia)";
			break;
		case "id" :
			sLanguage = "Indonesian";
			break;
		case "id-ID" :
			sLanguage = "Indonesian (Indonesia)";
			break;
		case "is" :
			sLanguage = "Icelandic";
			break;
		case "is-IS" :
			sLanguage = "Icelandic (Iceland)";
			break;
		case "it" :
			sLanguage = "Italian";
			break;
		case "it-CH" :
			sLanguage = "Italian (Switzerland)";
			break;
		case "it-IT" :
			sLanguage = "Italian (Italy)";
			break;
		case "ja" :
			sLanguage = "Japanese";
			break;
		case "ja-JP" :
			sLanguage = "Japanese (Japan)";
			break;
		case "ka" :
			sLanguage = "Georgian";
			break;
		case "ka-GE" :
			sLanguage = "Georgian (Georgia)";
			break;
		case "kk" :
			sLanguage = "Kazakh";
			break;
		case "kk-KZ" :
			sLanguage = "Kazakh (Kazakhstan)";
			break;
		case "kn" :
			sLanguage = "Kannada";
			break;
		case "kn-IN" :
			sLanguage = "Kannada (India)";
			break;
		case "ko" :
			sLanguage = "Korean";
			break;
		case "ko-KR" :
			sLanguage = "Korean (Korea)";
			break;
		case "kok" :
			sLanguage = "Konkani";
			break;
		case "kok-IN" :
			sLanguage = "Konkani (India)";
			break;
		case "ky" :
			sLanguage = "Kyrgyz";
			break;
		case "ky-KG" :
			sLanguage = "Kyrgyz (Kyrgyzstan)";
			break;
		case "lt" :
			sLanguage = "Lithuanian";
			break;
		case "lt-LT" :
			sLanguage = "Lithuanian (Lithuania)";
			break;
		case "lv" :
			sLanguage = "Latvian";
			break;
		case "lv-LV" :
			sLanguage = "Latvian (Latvia)";
			break;
		case "mi" :
			sLanguage = "Maori";
			break;
		case "mi-NZ" :
			sLanguage = "Maori (New Zealand)";
			break;
		case "mk" :
			sLanguage = "FYRO Macedonian";
			break;
		case "mk-MK" :
			sLanguage = "FYRO Macedonian (Former Yugoslav Republic of Macedonia)";
			break;
		case "mn" :
			sLanguage = "Mongolian";
			break;
		case "mn-MN" :
			sLanguage = "Mongolian (Mongolia)";
			break;
		case "mr" :
			sLanguage = "Marathi";
			break;
		case "mr-IN" :
			sLanguage = "Marathi (India)";
			break;
		case "ms" :
			sLanguage = "Malay";
			break;
		case "ms-BN" :
			sLanguage = "Malay (Brunei Darussalam)";
			break;
		case "ms-MY" :
			sLanguage = "Malay (Malaysia)";
			break;
		case "mt" :
			sLanguage = "Maltese";
			break;
		case "mt-MT" :
			sLanguage = "Maltese (Malta)";
			break;
		case "nb" :
			sLanguage = "Norwegian (Bokm?l)";
			break;
		case "nb-NO" :
			sLanguage = "Norwegian (Bokm?l) (Norway)";
			break;
		case "nl" :
			sLanguage = "Dutch";
			break;
		case "nl-BE" :
			sLanguage = "Dutch (Belgium)";
			break;
		case "nl-NL" :
			sLanguage = "Dutch (Netherlands)";
			break;
		case "nn-NO" :
			sLanguage = "Norwegian (Nynorsk) (Norway)";
			break;
		case "ns" :
			sLanguage = "Northern Sotho";
			break;
		case "ns-ZA" :
			sLanguage = "Northern Sotho (South Africa)";
			break;
		case "pa" :
			sLanguage = "Punjabi";
			break;
		case "pa-IN" :
			sLanguage = "Punjabi (India)";
			break;
		case "pl" :
			sLanguage = "Polish";
			break;
		case "pl-PL" :
			sLanguage = "Polish (Poland)";
			break;
		case "ps" :
			sLanguage = "Pashto";
			break;
		case "ps-AR" :
			sLanguage = "Pashto (Afghanistan)";
			break;
		case "pt" :
			sLanguage = "Portuguese";
			break;
		case "pt-BR" :
			sLanguage = "Portuguese (Brazil)";
			break;
		case "pt-PT" :
			sLanguage = "Portuguese (Portugal)";
			break;
		case "qu" :
			sLanguage = "Quechua";
			break;
		case "qu-BO" :
			sLanguage = "Quechua (Bolivia)";
			break;
		case "qu-EC" :
			sLanguage = "Quechua (Ecuador)";
			break;
		case "qu-PE" :
			sLanguage = "Quechua (Peru)";
			break;
		case "ro" :
			sLanguage = "Romanian";
			break;
		case "ro-RO" :
			sLanguage = "Romanian (Romania)";
			break;
		case "ru" :
			sLanguage = "Russian";
			break;
		case "ru-RU" :
			sLanguage = "Russian (Russia)";
			break;
		case "sa" :
			sLanguage = "Sanskrit";
			break;
		case "sa-IN" :
			sLanguage = "Sanskrit (India)";
			break;
		case "se" :
			sLanguage = "Sami (Northern)";
			break;
		case "se-FI" :
			sLanguage = "Sami (Finland)";
			break;
		case "se-NO" :
			sLanguage = "Sami (Norway)";
			break;
		case "se-SE" :
			sLanguage = "Sami (Sweden)";
			break;
		case "sk" :
			sLanguage = "Slovak";
			break;
		case "sk-SK" :
			sLanguage = "Slovak (Slovakia)";
			break;
		case "sl" :
			sLanguage = "Slovenian";
			break;
		case "sl-SI" :
			sLanguage = "Slovenian (Slovenia)";
			break;
		case "sq" :
			sLanguage = "Albanian";
			break;
		case "sq-AL" :
			sLanguage = "Albanian (Albania)";
			break;
		case "sr-BA" :
			sLanguage = "Serbian (Bosnia and Herzegovina)";
			break;
		case "sr-SP" :
			sLanguage = "Serbian (Serbia and Montenegro)";
			break;
		case "sv" :
			sLanguage = "Swedish";
			break;
		case "sv-FI" :
			sLanguage = "Swedish (Finland)";
			break;
		case "sv-SE" :
			sLanguage = "Swedish (Sweden)";
			break;
		case "sw" :
			sLanguage = "Swahili";
			break;
		case "sw-KE" :
			sLanguage = "Swahili (Kenya)";
			break;
		case "syr" :
			sLanguage = "Syriac";
			break;
		case "syr-SY" :
			sLanguage = "Syriac (Syria)";
			break;
		case "ta" :
			sLanguage = "Tamil";
			break;
		case "ta-IN" :
			sLanguage = "Tamil (India)";
			break;
		case "te" :
			sLanguage = "Telugu";
			break;
		case "te-IN" :
			sLanguage = "Telugu (India)";
			break;
		case "th" :
			sLanguage = "Thai";
			break;
		case "th-TH" :
			sLanguage = "Thai (Thailand)";
			break;
		case "tl" :
			sLanguage = "Tagalog";
			break;
		case "tl-PH" :
			sLanguage = "Tagalog (Philippines)";
			break;
		case "tn" :
			sLanguage = "Tswana";
			break;
		case "tn-ZA" :
			sLanguage = "Tswana (South Africa)";
			break;
		case "tr" :
			sLanguage = "Turkish";
			break;
		case "tr-TR" :
			sLanguage = "Turkish (Turkey)";
			break;
		case "tt" :
			sLanguage = "Tatar";
			break;
		case "tt-RU" :
			sLanguage = "Tatar (Russia)";
			break;
		case "ts" :
			sLanguage = "Tsonga";
			break;
		case "uk" :
			sLanguage = "Ukrainian";
			break;
		case "uk-UA" :
			sLanguage = "Ukrainian (Ukraine)";
			break;
		case "ur" :
			sLanguage = "Urdu";
			break;
		case "ur-PK" :
			sLanguage = "Urdu (Islamic Republic of Pakistan)";
			break;
		case "uz" :
			sLanguage = "Uzbek (Latin)";
			break;
		case "uz-UZ" :
			sLanguage = "Uzbek (Uzbekistan)";
			break;
		case "vi" :
			sLanguage = "Vietnamese";
			break;
		case "vi-VN" :
			sLanguage = "Vietnamese (Viet Nam)";
			break;
		case "xh" :
			sLanguage = "Xhosa";
			break;
		case "xh-ZA" :
			sLanguage = "Xhosa (South Africa)";
			break;
		case "zh" :
			sLanguage = "Chinese";
			break;
		case "zh-CN" :
			sLanguage = "Chinese (S)";
			break;
		case "zh-HK" :
			sLanguage = "Chinese (Hong Kong)";
			break;
		case "zh-MO" :
			sLanguage = "Chinese (Macau)";
			break;
		case "zh-SG" :
			sLanguage = "Chinese (Singapore)";
			break;
		case "zh-TW" :
			sLanguage = "Chinese (T)";
			break;
		case "zu" :
			sLanguage = "Zulu";
			break;
		case "zu-ZA" :
			sLanguage = "Zulu (South Africa)";
			break;
	}

	return sLanguage;
}