"use strict";
/**
 * User: Ilja.Kirillov
 * Date: 24.05.2017
 * Time: 16:29
 */

window.onload = OnDocumentReady;

var oGame1 = null;
var oGame2 = null;
var oGame3 = null;
var oGame4 = null;
var oGame5 = null;

function OnDocumentReady()
{
	$('#booklet').turn({gradients: true, height : 582, width : 920});
	$('#booklet').turn("resize");

	$("#booklet").bind("turned", function(event, page, view)
	{
		if (!oGame1 && (6 === page || 7 === page))
		{
			oGame1 = GoBoardApi.Embed("bookGame1", {
				boardMode  : "viewer",
				width      : 440,
				boardTheme : "BookStyle",
				sgfData    : "(;GM[1]FF[4]CA[UTF-8]AP[WebGoBoard:0.10.6]RU[Japanese]SZ[19]KM[6.5]HA[0]TM[2h]RE[W+0.5]DT[2017-05-23]PB[Ke Jie]BR[9p]PW[AlphaGo]EV[Future of Go Summit, Ke Jie9p VS AlphaGo, 1st game]PC[China];B[qd];W[pp];B[cc];W[cp];B[nc];W[fp];B[qq];W[pq];B[qp];W[qn];B[qo];W[po];B[rn];W[qr];B[rr];W[rm];B[pr];W[or];B[pn];W[qm];B[qs];W[on];B[dj];W[nk];B[ph];W[ch];B[cf];W[eh];B[ci];W[de];B[df];W[dc];B[cd];W[dd];B[ef];W[di];B[ei];W[dh];B[cj];W[ce];B[be];W[bf];B[bg];W[bd];B[af];W[bc];B[fi];W[cm];B[hq];W[ek];B[fh];W[gq];B[hp];W[ej];B[eq];W[gr];B[cq];W[dp];B[dq];W[ep];B[bp];W[bh];B[ah];W[bo];B[bq];W[fg];B[gg];W[kp];B[ko];W[jo];B[jn];W[in];B[jp];W[io];B[lp];W[kq];B[lq];W[kr];B[lr];W[ir];B[kn];W[il];B[oq];W[pf];B[nh];W[rf];B[od];W[qi];B[qg];W[rd];B[qf];W[qe];B[pe];W[re];B[qc];W[rg];B[kh];W[ic];B[gc];W[kc];B[jd];W[id];B[ge];W[hb];B[gb];W[jf];B[je];W[ie];B[ld];W[hg];B[eg];W[lc];B[le];W[hf];B[qh];W[rh];B[pi];W[qj];B[gk];W[fd];B[gd];W[lf];B[mf];W[lg];B[gm];W[gn];B[fn];W[go];B[dl];W[mo];B[oo];W[pm];B[op];W[mg];B[nf];W[lo];B[nn];W[lm];B[pn];W[dk];B[ck];W[cl];B[el];W[bk];B[bi];W[li];B[ii];W[ds];B[dr];W[hi];B[ik];W[jk];B[ij];W[md];B[mc];W[ke];B[me];W[kd];B[om];W[ls];B[ms];W[ks];B[nr];W[ng];B[og];W[es];B[cs];W[fr];B[er];W[fs];B[bs];W[hl];B[pl];W[ql];B[rc];W[ro];B[rp];W[sn];B[hm];W[im];B[kk];W[kj];B[lk];W[jl];B[mj];W[mi];B[nj];W[pk];B[fm];W[cn];B[ol];W[ok];B[ni];W[ih];B[ji];W[mb];B[nb];W[lb];B[fe];W[cb];B[mp];W[mm];B[eb];W[na];B[oa];W[ma];B[qb];W[bj];B[ai];W[aj];B[ag];W[gl];B[fk];W[bl];B[kg];W[kf];B[ib];W[jb];B[ga];W[ha];B[ed];W[ec];B[fc];W[gf];B[ff];W[gj];B[hk];W[hh];B[fj];W[no];B[fq];W[hr];B[kl];W[km];B[mn];W[ln];B[nl];W[db];B[da];W[ca];B[ea];W[np];B[nq];W[oj];B[oi];W[en];B[em];W[eo];B[dm];W[dn];B[sp];W[so];B[hn];W[ho];B[hc];W[ia];B[ao];W[an];B[ap];W[sc];B[sb];W[sd];B[jg];W[ad];B[gh];W[ae];B[ee];W[ml];B[mk];W[pj];B[bf];W[nm];B[on];W[he];B[ig];W[ki];B[jh];W[fl];B[jj];W[fo];B[hj];W[gi];B[ll];W[jm];B[lh];W[mh];B[lj];W[if];B[hd])",
				booklet    : true
			});
			GoBoardApi.Set_ShowTarget(oGame1, false);
			GoBoardApi.Update_Size(oGame1);
		}
	});

	document.getElementById("contentsAboutId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 4);
	}, false);
	document.getElementById("contentsMatchesId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 4);
	}, false);
	document.getElementById("contentsGame1Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 6);
	}, false);
	document.getElementById("contentsGame2Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 8);
	}, false);
	document.getElementById("contentsGame3Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 10);
	}, false);
	document.getElementById("contentsGame4Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 12);
	}, false);
	document.getElementById("contentsGame5Id").addEventListener("click", function()
	{
		$("#booklet").turn("page", 14);
	}, false);
	document.getElementById("contentsParticipantsId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 16);
	}, false);
	document.getElementById("contentsAlphaGoId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 18);
	}, false);
	document.getElementById("contentsKeJieId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 18);
	}, false);
	document.getElementById("contentsGuLiId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 20);
	}, false);
	document.getElementById("contentsLianXiaoId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 20);
	}, false);
	document.getElementById("contentsChenYaoyeId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 22);
	}, false);
	document.getElementById("contentsZhouRuiyangId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 22);
	}, false);
	document.getElementById("contentsMiYutingId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 24);
	}, false);
	document.getElementById("contentsShiYueId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 24);
	}, false);
	document.getElementById("contentsTangWeixingId").addEventListener("click", function()
	{
		$("#booklet").turn("page", 26);
	}, false);
}