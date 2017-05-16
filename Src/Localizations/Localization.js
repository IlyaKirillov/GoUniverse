"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     10.05.2017
 * Time     16:36
 */

var g_oDefaultLocalization = g_oLocalization_enUS;
var g_oLocalization        = g_oLocalization_enUS;

var ExtendLocalization = function(original, base, key)
{
	for (key in base)
	{
		if (base.hasOwnProperty(key))
		{
			if (Object.prototype.toString.call(base[key]) === '[object Object]')
				original[key] = ExtendLocalization(original[key] || {}, base[key]);
			else if (!original.hasOwnProperty(key))
				original[key] = base[key];
		}
	}

	return original;
};
