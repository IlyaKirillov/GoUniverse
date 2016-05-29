//-----------------------------------------------
// реальный вариант (разметка реальной доски)
//-----------------------------------------------

//var g_dKoef_Board_H      = 460;
//var g_dKoef_Board_W      = 430;
//
//var g_dKoef_HorOff_2_Cell_W = 17.54 / 21.94;
//var g_dKoef_VerOff_2_Cell_H = 17.51 / 23.61;
//
//var g_dKoef_Board_Cell_W_ = 21.94;
//var g_dKoef_Board_HorOff_ = 17.54; // = ( 430 - 18 * 21.94 ) / 2
//
//var g_dKoef_Board_Cell_H_ = 23.61;
//var g_dKoef_Board_VerOff_ = 17.51; // = ( 460 - 18 * 23.61 ) / 2

//-----------------------------------------------
// квадратный вариант (ширина и высота совпадают)
//-----------------------------------------------
var g_dKoef_Board_H      = 460;
var g_dKoef_Board_W      = g_dKoef_Board_H;

var g_dKoef_VerOff_2_Cell_H = 17.51 / 23.61;
var g_dKoef_HorOff_2_Cell_W = g_dKoef_VerOff_2_Cell_H;

var g_dKoef_Board_Cell_H_ = 23.61;
var g_dKoef_Board_VerOff_ = 17.51; // = ( 460 - 18 * 23.61 ) / 2

var g_dKoef_Board_Cell_W_ = g_dKoef_Board_Cell_H_;
var g_dKoef_Board_HorOff_ = g_dKoef_Board_VerOff_; // = ( 430 - 18 * 21.94 ) / 2

var g_dKoef_Board_W_to_H = g_dKoef_Board_W / g_dKoef_Board_H;       // Отношение ширины доски к высоте
var g_dKoef_Board_VerOff = g_dKoef_Board_VerOff_ / g_dKoef_Board_H; // Вертикальный отступ разлиновки от края доски
var g_dKoef_Board_HorOff = g_dKoef_Board_HorOff_ / g_dKoef_Board_W; // Горизонтальный отступ разлиновки от края доски
var g_dKoef_Board_Cell_W = g_dKoef_Board_Cell_W_ / g_dKoef_Board_W; // Ширина клетки разлиновки доски
var g_dKoef_Board_Cell_H = g_dKoef_Board_Cell_H_ / g_dKoef_Board_H; // Высота клетки разлиновки доски
var g_dKoef_Board_Diam   =                     4 / g_dKoef_Board_W; // Диаметр форовых отметок на доске

function CBounds()
{
    this.L      = 0;    // ����� �������
    this.T      = 0;    // ������� �������
    this.R      = 0;    // ������ ������� (���� ������ ���� isAbsR, �� ��� ���������� ������, � �� R)
    this.B      = 0;    // ������� ������� (���� ������ ���� isAbsB, �� ��� ���������� ������, � �� B)

    this.isAbsL = false;
    this.isAbsT = false;
    this.isAbsR = false;
    this.isAbsB = false;

    this.AbsW   = -1;
    this.AbsH   = -1;

    this.SetParams = function(_l,_t,_r,_b,abs_l,abs_t,abs_r,abs_b,absW,absH)
    {
        this.L = _l;
        this.T = _t;
        this.R = _r;
        this.B = _b;

        this.isAbsL = abs_l;
        this.isAbsT = abs_t;
        this.isAbsR = abs_r;
        this.isAbsB = abs_b;

        this.AbsW   = absW;
        this.AbsH   = absH;
    }
}

function CAbsolutePosition()
{
    this.L  = 0;
    this.T  = 0;
    this.R  = 0;
    this.B  = 0;
}

var g_anchor_left       = 1;
var g_anchor_top        = 2;
var g_anchor_right      = 4;
var g_anchor_bottom     = 8;

function CControl()
{
    this.Bounds         = new CBounds();

    this.Anchor         = g_anchor_left | g_anchor_top;

    this.Name           = null;
    this.Parent         = null;
    this.TabIndex       = null;

    this.HtmlElement    = null;

    this.State_Common = null;
    this.State_Active = null;
    this.State_Over   = null;

    this.AbsolutePosition = new CBounds();
    var oThis = this;
	
	this.Resize = function(_width,_height)
	{
		if ((null == this.Parent) || (null == this.HtmlElement))
			return;

        var _x = 0;
        var _y = 0;
        var _r = 0;
        var _b = 0;

        var hor_anchor = (this.Anchor & 0x05);
        var ver_anchor = (this.Anchor & 0x0A);

        if (g_anchor_left == hor_anchor)
        {
            if (this.Bounds.isAbsL)
                _x = this.Bounds.L;
            else
                _x = (this.Bounds.L * _width / 1000);

            if (-1 != this.Bounds.AbsW)
                _r = _x + this.Bounds.AbsW;
            else
            {
                if (this.Bounds.isAbsR)
                    _r = (_width - this.Bounds.R);
                else
                    _r = this.Bounds.R * _width / 1000;
            }
        }
        else if (g_anchor_right == hor_anchor)
        {
            if (this.Bounds.isAbsR)
                _r = (_width - this.Bounds.R);
            else
                _r = (this.Bounds.R * _width / 1000);

            if (-1 != this.Bounds.AbsW)
                _x = _r - this.Bounds.AbsW;
            else
            {
                if (this.Bounds.isAbsL)
                    _x = this.Bounds.L;
                else
                    _x = this.Bounds.L * _width / 1000;
            }
        }
        else if ((g_anchor_left | g_anchor_right) == hor_anchor)
        {
            if (this.Bounds.isAbsL)
                _x = this.Bounds.L;
            else
                _x = (this.Bounds.L * _width / 1000);

            if (this.Bounds.isAbsR)
                _r = (_width - this.Bounds.R);
            else
                _r = (this.Bounds.R * _width / 1000);
        }
        else
        {
            _x = this.Bounds.L;
            _r = this.Bounds.R;
        }

        if (g_anchor_top == ver_anchor)
        {
            if (this.Bounds.isAbsT)
                _y = this.Bounds.T;
            else
                _y = (this.Bounds.T * _height / 1000);

            if (-1 != this.Bounds.AbsH)
                _b = _y + this.Bounds.AbsH;
            else
            {
                if (this.Bounds.isAbsB)
                    _b = (_height - this.Bounds.B);
                else
                    _b = this.Bounds.B * _height / 1000;
            }
        }
        else if (g_anchor_bottom == ver_anchor)
        {
            if (this.Bounds.isAbsB)
                _b = (_height - this.Bounds.B);
            else
                _b = (this.Bounds.B * _height / 1000);

            if (-1 != this.Bounds.AbsH)
                _y = _b - this.Bounds.AbsH;
            else
            {
                if (this.Bounds.isAbsT)
                    _y = this.Bounds.T;
                else
                    _y = this.Bounds.T * _height / 1000;
            }
        }
        else if ((g_anchor_top | g_anchor_bottom) == ver_anchor)
        {
            if (this.Bounds.isAbsT)
                _y = this.Bounds.T;
            else
                _y = (this.Bounds.T * _height / 1000);

            if (this.Bounds.isAbsB)
                _b = (_height - this.Bounds.B);
            else
                _b = (this.Bounds.B * _height / 1000);
        }
        else
        {
            _y = this.Bounds.T;
            _b = this.Bounds.B;
        }

        if (_r < _x)
            _r = _x;
        if (_b < _y)
            _b = _y;

        if ( -2 === this.Bounds.AbsW )
            _r = _x + ( _b - _y ) * g_dKoef_Board_W_to_H;
        else if ( -3 === this.Bounds.AbsW )
            _x = ( _b - _y ) * g_dKoef_Board_W_to_H;

        this.AbsolutePosition.L = _x;
        this.AbsolutePosition.T = _y;
        this.AbsolutePosition.R = _r;
        this.AbsolutePosition.B = _b;

        this.HtmlElement.style.left 	= parseInt(_x + 0.5) + "px";
        this.HtmlElement.style.top 		= parseInt(_y + 0.5) + "px";
        this.HtmlElement.style.width 	= parseInt((_r - _x) + 0.5) + "px";
        this.HtmlElement.style.height 	= parseInt((_b - _y) + 0.5) + "px";

        this.HtmlElement.width 	= parseInt((_r - _x) + 0.5);
        this.HtmlElement.height = parseInt((_b - _y) + 0.5);
	}

    this.Init_Events = function()
    {
        this.HtmlElement.onmouseout  = this.OnMouseOut;
        this.HtmlElement.onmouseover = this.OnMouseOver;
        this.HtmlElement.onmousedown = this.OnMouseDown;
        this.HtmlElement.onmouseup   = this.OnMouseUp;
    };

    this.Set_States = function(Common, Active, Over)
    {
        this.State_Active = Active;
        this.State_Common = Common;
        this.State_Over   = Over;

        this.HtmlElement.style.backgroundImage = "url(\"" + this.State_Common + "\")";
    };

    this.OnMouseOut = function()
    {
        oThis.HtmlElement.style.backgroundImage = "url(\"" + oThis.State_Common + "\")";
    };

    this.OnMouseOver = function()
    {
        oThis.HtmlElement.style.backgroundImage = "url(\"" + oThis.State_Over + "\")";
    };

    this.OnMouseDown = function()
    {
        oThis.HtmlElement.style.backgroundImage = "url(\"" + oThis.State_Active + "\")";
    };

    this.OnMouseUp = function()
    {
        oThis.HtmlElement.style.backgroundImage = "url(\"" + oThis.State_Over + "\")";
    };
}

function CControlContainer()
{
    this.Bounds         = new CBounds();
    this.Anchor         = g_anchor_left | g_anchor_top;

    this.Name           = null;
    this.Parent         = null;
    this.TabIndex       = null;

    this.HtmlElement    = null;

    this.AbsolutePosition = new CBounds();
	
    this.Controls       = new Array();

    this.AddControl = function(ctrl)
    {
        ctrl.Parent = this;
        this.Controls[this.Controls.length] = ctrl;
    }
	
	this.Resize = function(_width,_height)
	{
		if (null == this.Parent)
        {
            this.AbsolutePosition.L = 0;
            this.AbsolutePosition.T = 0;
            this.AbsolutePosition.R = _width;
            this.AbsolutePosition.B = _height;

            if (null != this.HtmlElement)
            {
                var lCount = this.Controls.length;
                for (var i = 0; i < lCount; i++)
                {
                    this.Controls[i].Resize(_width,_height);
                }
            }
            return;
        }

        var _x = 0;
        var _y = 0;
        var _r = 0;
        var _b = 0;

        var hor_anchor = (this.Anchor & 0x05);
		var ver_anchor = (this.Anchor & 0x0A);

        if (g_anchor_left == hor_anchor)
        {
            if (this.Bounds.isAbsL)
                _x = this.Bounds.L;
            else
                _x = (this.Bounds.L * _width / 1000);

            if (-1 != this.Bounds.AbsW)
                _r = _x + this.Bounds.AbsW;
            else
            {
                if (this.Bounds.isAbsR)
                    _r = (_width - this.Bounds.R);
                else
                    _r = this.Bounds.R * _width / 1000;
            }
        }
        else if (g_anchor_right == hor_anchor)
        {
            if (this.Bounds.isAbsR)
                _r = (_width - this.Bounds.R);
            else
                _r = (this.Bounds.R * _width / 1000);

            if (-1 != this.Bounds.AbsW)
                _x = _r - this.Bounds.AbsW;
            else
            {
                if (this.Bounds.isAbsL)
                    _x = this.Bounds.L;
                else
                    _x = this.Bounds.L * _width / 1000;
            }
        }
        else if ((g_anchor_left | g_anchor_right) == hor_anchor)
        {
            if (this.Bounds.isAbsL)
                _x = this.Bounds.L;
            else
                _x = (this.Bounds.L * _width / 1000);

            if (this.Bounds.isAbsR)
                _r = (_width - this.Bounds.R);
            else
                _r = (this.Bounds.R * _width / 1000);
        }
        else
        {
            _x = this.Bounds.L;
            _r = this.Bounds.R;
        }

        if (g_anchor_top == ver_anchor)
        {
            if (this.Bounds.isAbsT)
                _y = this.Bounds.T;
            else
                _y = (this.Bounds.T * _height / 1000);

            if (-1 != this.Bounds.AbsH)
                _b = _y + this.Bounds.AbsH;
            else
            {
                if (this.Bounds.isAbsB)
                    _b = (_height - this.Bounds.B);
                else
                    _b = this.Bounds.B * _height / 1000;
            }
        }
        else if (g_anchor_bottom == ver_anchor)
        {
            if (this.Bounds.isAbsB)
                _b = (_height - this.Bounds.B);
            else
                _b = (this.Bounds.B * _height / 1000);

            if (-1 != this.Bounds.AbsH)
                _y = _b - this.Bounds.AbsH;
            else
            {
                if (this.Bounds.isAbsT)
                    _y = this.Bounds.T;
                else
                    _y = this.Bounds.T * _height / 1000;
            }
        }
        else if ((g_anchor_top | g_anchor_bottom) == ver_anchor)
        {
            if (this.Bounds.isAbsT)
                _y = this.Bounds.T;
            else
                _y = (this.Bounds.T * _height / 1000);

            if (this.Bounds.isAbsB)
                _b = (_height - this.Bounds.B);
            else
                _b = (this.Bounds.B * _height / 1000);
        }
        else
        {
            _y = this.Bounds.T;
            _b = this.Bounds.B;
        }

        if (_r < _x)
            _r = _x;
        if (_b < _y)
            _b = _y;

        if ( -2 === this.Bounds.AbsW )
            _r = _x + ( _b - _y ) * g_dKoef_Board_W_to_H;
        else if ( -3 === this.Bounds.AbsW )
            _x = ( _b - _y ) * g_dKoef_Board_W_to_H;

        this.AbsolutePosition.L = _x;
        this.AbsolutePosition.T = _y;
        this.AbsolutePosition.R = _r;
        this.AbsolutePosition.B = _b;

        this.HtmlElement.style.left 	= parseInt(_x + 0.5) + "px";
        this.HtmlElement.style.top 		= parseInt(_y + 0.5) + "px";
        this.HtmlElement.style.width 	= parseInt((_r - _x) + 0.5) + "px";
        this.HtmlElement.style.height 	= parseInt((_b - _y) + 0.5) + "px";

        this.HtmlElement.width 	= parseInt((_r - _x) + 0.5);
        this.HtmlElement.height = parseInt((_b - _y) + 0.5);
		
		var lCount = this.Controls.length;
		for (var i = 0; i < lCount; i++)
		{
			this.Controls[i].Resize(_r - _x,_b - _y);
		}
	}
}

function CreateControlContainer(name)
{
    var ctrl = new CControlContainer();
    ctrl.Name = name;
    ctrl.HtmlElement = document.getElementById(name);
    return ctrl;
}

function CreateControl(name)
{
    var ctrl = new CControl();
    ctrl.Name = name;
    ctrl.HtmlElement = document.getElementById(name);
    return ctrl;
}