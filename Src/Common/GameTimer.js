"use strict";

/**
 * Copyright 2016 the GoUniverse project authors.
 * All rights reserved.
 * Project  GoUniverse
 * Author   Ilya Kirillov
 * Date     30.06.2016
 * Time     0:27
 */

function CGoUniverseTime()
{
	this.m_nSeconds    = 0;
	this.m_nCurSeconds = 0;

	this.m_nStartTime = 0;
	this.m_nTimerId   = null;

	this.m_fOnTick    = null;
	this.m_fOnEnd     = null;
}
CGoUniverseTime.prototype.SetHandler = function(fOnTick, fOnEnd)
{
	this.m_fOnTick = fOnTick;
	this.m_fOnEnd  = fOnEnd;
};
CGoUniverseTime.prototype.Start = function(s)
{
	this.m_nSeconds = s;

	if (null !== this.m_nTimerId)
		clearTimeout(this.m_nTimerId);

	this.m_nStartTime = new Date().getTime();

	var oThis = this;
	this.m_nTimerId = setTimeout(function(){oThis.private_Tick();}, 50);
};
CGoUniverseTime.prototype.private_Tick = function()
{
	if (null === this.m_nTimerId)
		return;

	var oThis = this;
	this.m_nTimerId = setTimeout(function(){oThis.private_Tick();}, 50);

	var nCurTime = new Date().getTime();

	var nDiffTime = (nCurTime - this.m_nStartTime) / 1000;

	this.m_nCurSeconds = (((this.m_nSeconds - nDiffTime) * 10) | 0) / 10;

	if (this.m_nCurSeconds < 0.1)
	{
		this.Stop();
		this.m_fOnEnd();
	}

	if (this.m_fOnTick)
		this.m_fOnTick(this.m_nCurSeconds);
};
CGoUniverseTime.prototype.Stop = function()
{
	if (null !== this.m_nTimerId)
		clearTimeout(this.m_nTimerId);

	this.m_nTimerId = null;
};


var ETimeSettings = {
	None     : 0,
	Absolute : 1,
	ByoYomi  : 2,
	Canadian : 3
};
function CTimeSettings()
{
	this.m_nType         = ETimeSettings.None;
	this.m_nMainTime     = 0;
	this.m_nOverTime     = 0;
	this.m_nOverTimeCur  = 0;
	this.m_nOverCount    = 1;
	this.m_nOverCountCur = 1;
	this.m_oTimer        = new CGoUniverseTimer();

	this.m_fOnTick = null;

	var oThis = this;
	this.m_oTimer.SetHandler(function(s)
	{
		oThis.private_OnTickTimer(s);
	}, function()
	{
		oThis.private_OnStopTimer();
	});
}
CTimeSettings.prototype.SetNone = function()
{
	this.m_nType      = ETimeSettings.None;
	this.m_nMainTime  = 0;
	this.m_nOverTime  = 0;
	this.m_nOverCount = 1;
};
CTimeSettings.prototype.SetAbsolute = function(nTime)
{
	this.m_nType     = ETimeSettings.Absolute;
	this.m_nMainTime = nTime;
};
CTimeSettings.prototype.SetByoYomi = function(nMainTime, nByoyomiTime, nByoyomiCount)
{
	this.m_nType         = ETimeSettings.ByoYomi;
	this.m_nMainTime     = nMainTime;
	this.m_nOverTime     = nByoyomiTime;
	this.m_nOverCount    = nByoyomiCount;
	this.m_nOverCountCur = m_nOverCount;
};
CTimeSettings.prototype.SetCanadian = function(nMainTime, nOverTime, nMovesCount)
{
	this.m_nType        = ETimeSettings.Canadian;
	this.m_nMainTime    = nMainTime;
	this.m_nOverTime    = nOverTime;
	this.m_nOverCount   = nMovesCount;
	this.m_nOverTimeCur = this.m_nOverTime;
};
CTimeSettings.prototype.CorrectMainTime = function(nTime)
{
	this.m_nMainTime = nTime;
};
CTimeSettings.prototype.CorrectOverTime = function(nOverTime, nOverCount)
{
	this.m_nOverTimeCur  = nOverTime;
	this.m_nOverCountCur = nOverCount;
};
CTimeSettings.Start = function()
{
	switch (this.m_nType)
	{
	case ETimeSettings.None:
	{
		break;
	}
	case ETimeSettings.Absolute:
	{
		this.m_oTimer.Start(this.m_nMainTime);
		break;
	}
	case ETimeSettings.ByoYomi:
	case ETimeSettings.Canadian:
	{
		if (this.m_nMainTime > 0)
			this.m_oTimer.Start(this.m_nMainTime);
		else
			this.m_oTimer.Start(this.m_nOverTimeCur);

	}
	}
};
CTimeSettings.prototype.Stop = function()
{
	this.m_oTimer.Stop();
};
CTimeSettings.private_OnTimerTick = function(nSecondsLeft)
{
	switch (this.m_nType)
	{
	case ETimeSettings.Absolute:
	{
		this.m_nMainTime = Math.max(0, nSecondsLeft);

		if (this.m_fOnTick)
			this.m_fOnTick(this.m_nMainTime);

		break;
	}
	case ETimeSettings.ByoYomi:
	{

		if (this.m_nMainTime > 0)
		{
			this.m_nMainTime = Math.max(0, nSecondsLeft);
			if (this.m_fOnTick)
				this.m_fOnTick(this.m_nMainTime);
		}
		else
		{
			if (this.m_fOnTick)
				this.m_fOnTick(nSecondsLeft + " (" + this.m_nOverCount + ")");
		}

		break;
	}
	case ETimeSettings.Canadian:
	{
		if (this.m_nMainTime > 0)
		{
			this.m_nMainTime = Math.max(0, nSecondsLeft);
			if (this.m_fOnTick)
				this.m_fOnTick(this.m_nMainTime);
		}
		else
		{
			if (this.m_fOnTick)
				this.m_fOnTick(nSecondsLeft + "/" + this.m_nOverCount);
		}
		break;
	}
	}
};
CTimeSettings.prototype.private_OnStopTimer = function()
{
	switch (this.m_nType)
	{
	case ETimeSettings.Absolute:
	{
		this.m_nMainTime = 0;

		if (this.m_fOnStop)
			this.m_fOnStop();

		break;
	}
	case ETimeSettings.ByoYomi:
	{
		if (this.m_nMainTime > 0)
		{
			this.m_nMainTime = 0;
			this.m_oTimer.Stop();
			this.m_oTimer.Start(this.m_nOverTime);
		}
		else
		{
			if (this.m_nOverCountCur > 1)
			{
				this.m_nOverCountCur--;
				this.m_oTimer.Stop();
				this.m_oTimer.Start(this.m_nOverTime);
			}
			else
			{
				if (this.m_fOnStop)
					this.m_fOnStop();
			}
		}

		break;
	}
	case ETimeSettings.Canadian:
	{
		if (this.m_nMainTime > 0)
		{
			this.m_nMainTime = 0;
			this.m_nOverTimeCur = this.m_nOverTime;
			this.m_oTimer.Stop();
			this.m_oTimer.Start(this.m_nOverTimeCur);
		}
		else
		{
			if (this.m_fOnStop)
				this.m_fOnStop();
		}
		break;
	}
	}
};