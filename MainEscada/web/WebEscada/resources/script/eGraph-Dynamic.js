/***************************************全局变量声明——start**************************/
var g_ScriptDebug = true;//设置脚本为调试状态
var g_WldSvg = g_WldSvg || [];
//var g_WldWsServer = location.hostname!=""?("ws:"+location.hostname+":30303"):"ws://47.106.93.198:37777";//实时数据服务器地址和端口默认配置信息
var g_WldWsServer = "ws://47.106.93.198:37777";
var g_WldGraphID = [],g_WldChartID = [];//一般图元id数组和图表id数组，evg内部脚本动态生成，方便获取相应的Dom节点

onload = Load;//自定义执行入口文档加载完成后执行
function Load()
{
	var Dom = document.getElementById("SvgDom");
	eGraph_Dynamicload(Dom);
}
//公用常量定义
function DefConstant()
{
    var constants = {
		SCRIPT_VERSION		: "V2.01.01",//V2版将显示与内容逐渐分离，显示（风格）在svg.css中，增加逻辑、模拟、脉冲计算点的关联处理
		LASTMODIFY_DATE		: "2017-05-26 09:00:00",//脚本最后修改日期
		SOCKET_GROUP_NUM 	: 48,//每个websocket对象负责发送的关联点数，8个一组，每组数据返回耗时约为200毫秒
		XHR_HISDATA_TIME	: 12*300*1000,//单位为毫秒
		CURVEDB_FLUSHTIME	: 500,//历史曲线刷新时间，单位为毫秒
		CHECKSTATU_TIME		: 10000//检查通讯状态时间
    }
	this.getConstants = function(name){return constants[name];}
}
var MyConstant = new DefConstant();

/***************************************全局变量声明——end****************************/

//入口函数——脚本动态加载的起点
function eGraph_Dynamicload(Dom)
{
	console.log("脚本最后修改日期：" + MyConstant.getConstants("LASTMODIFY_DATE"));//调试用
	if(Dom && (Dom.nodeName == "svg"))
	{
		console.log("加载evg文件ID：" + Dom.id);//调试用
		if(g_WldSvg.length < 1)
		{
			g_WldWsServer = (typeof(GLOBAL_USER_PROFILE) != "undefined") ? ("ws:" + GLOBAL_USER_PROFILE.wss.rtdata[0] + ":" + GLOBAL_USER_PROFILE.wss.WS_RTDB) : g_WldWsServer;
			document.body.appendChild(iframe);//加载的时候同时将日历控件添加到页面中
			g_WldSvg.push(CreateSvg(Dom));
			return;
		}
		for(var i=0;i<g_WldSvg.length;i++)
		{
			if(Dom.parentNode.id == g_WldSvg[i].ParentId)//同一个div，加载不同的evg文件
			{
				var str = g_WldSvg[i].IdStr;
				if(str)
				{
					TraverseNodes(Dom,str);
				}
				g_WldSvg[i].Destroy();
				g_WldSvg[i] = CreateSvg(Dom,str);
				break;
			}
		}
		if(i >= g_WldSvg.length)
		{
			str = GetIdStr(i);
			if(str)
			{
				TraverseNodes(Dom,str);
			}
			else
			{
				console.log("加载错误：" + Dom.parentNode.id);
				console.log("Support a maximum of 5 evg files");
				return;
			}
			g_WldSvg.push(CreateSvg(Dom,str));
		}
		if(g_WldSvg.length > 5)
		{
			for(var i=0;i<g_WldSvg.length;i++)
			{
				g_WldSvg[i].Destroy();
			}
			return;
		}
	}
	else
	{
		console.log("全局加载");//调试用
		g_WldWsServer = (typeof(GLOBAL_USER_PROFILE) != "undefined") ? ("ws:" + GLOBAL_USER_PROFILE.wss.rtdata[0] + ":" + GLOBAL_USER_PROFILE.wss.WS_RTDB) : g_WldWsServer;
		if(g_WldWsServer == "undefined")
		{
			alert("加载IP地址和端口号出错！");
		}
//		document.body.appendChild(iframe);//加载的时候同时将日历控件添加到页面中
//		document.childNodes[0].body.appendChild(iframe);
		var a = document.childNodes[0];
		for(var i=0;i<g_WldSvg.length;i++)
		{
			g_WldSvg[i].Destroy();
		}
		g_WldSvg = [];
		var SvgDom = document.getElementsByClassName("class_svg");//先获取SVGDOM(同一页面中支持加载5个及以下的evg文件)
		if(SvgDom.length > 0)
		{
			var str,WldSvg;
			if(SvgDom.length == 1)
			{
				WldSvg = CreateSvg(SvgDom[0]);//图元对象的销毁和创建
				if(WldSvg)
				{
					g_WldSvg.push(WldSvg);
				}			
			}
			else
			{
				for(var i=0;i<SvgDom.length;i++)
				{
					if(i > 0)//加载多个evg文件时，应避免id冲突
					{
						str = GetIdStr(i);
						if(str)
						{
							TraverseNodes(SvgDom[i],str);
						}
						else
						{
							console.log("Support a maximum of 5 evg files");
							return;
						}
					}
					var WldSvg = CreateSvg(SvgDom[i],str);//图元对象的销毁和创建
					if(WldSvg)
					{
						g_WldSvg.push(WldSvg);
					}
				}
			}
		}
	}
}
function TraverseNodes(node,str)
{
	if(node.nodeType == 1)
	{
		if(node.id)
		{
			if(node.id.substr(0,5) == "Graph")//处理一般关联的图元的id
			{
				node.id = str + node.id;
			}
			else if(node.id.substr(0,5) == "Chart")//对图表的id未处理
			{
				node.id = str + node.id;
			}
		}
		if(node.hasChildNodes)
		{
			var SonNodes = node.childNodes;
			for (var i=0; i<SonNodes.length;i++) 
			{
				var SonNode = SonNodes.item(i);
				TraverseNodes(SonNode,str);
			}
		}
	}
}
function CreateSvg(SvgDom,Str)
{
	var Script,Svg,me,text;
	for(var i=0;i<SvgDom.childNodes.length;i++)
	{
		if(SvgDom.childNodes[i].nodeName == "script")//配置evg文件中只有一个script
		{
			Script = SvgDom.childNodes[i];
		}
	}
	if(Script)
	{
		me = Svg = new WldSvg();
		me.Dom 		= SvgDom;
		me.IdStr 	= Str;
		me.ParentId = SvgDom.parentNode.id;//div的id
		text = Script.textContent;
		if(text.substr(0,3) != "<![")
		{
			g_WldGraphID = [],g_WldChartID = [];//清空
			var CreateFun = new Function(text);
			CreateFun();
			var GraphID = g_WldGraphID;
			var ChartID = g_WldChartID;
			if(Str)
			{
				for(var i=0;i<GraphID.length;i++)
				{
					GraphID[i] = Str + GraphID[i];
				}
			}
			me.Init(GraphID,ChartID);
		}
		me.ViewBox = me.Dom.getAttribute("viewBox").split(" ");
		var x=0,y=0;
		for(var e=me.Dom;e;e=e.offsetParent)
		{
			x += e.offsetLeft;
			y += e.offsetTop;
			if (e.scrollLeft) x -= e.scrollLeft;
			if (e.scrollTop) y -= e.scrollTop;
		}
		me.dx = Math.abs(me.Dom.getBoundingClientRect().left - x);
		me.dy = Math.abs(me.Dom.getBoundingClientRect().top - y);
		me.OnSize()
	}
	return me;
}
//创建websocket，外部调用
function eGraph_CreateWebsocket(SvgDom)
{
	if(SvgDom)
	{
		var Svg = GetSvg(SvgDom);
		if(Svg && Svg.AssPoint)
		{
			Svg.AssPoint.CreateWebsocket();
		}
	}
	else
	{
		for(i=0;i<g_WldSvg.length;i++)
		{
			g_WldSvg[i].AssPoint.CreateWebsocket();
		}
	}
}
//销毁websocket，外部调用
function eGraph_DestroyWebsocket(SvgDom)
{
	console.log("销毁Websocket");
	console.log("--------------------------------");
	if(SvgDom)
	{
		var Svg = GetSvg(SvgDom);
		if(Svg && Svg.AssPoint)
		{
			Svg.AssPoint.DestroyWebsocket();
		}		
	}
	else
	{
		for(i=0;i<g_WldSvg.length;i++)
		{
			g_WldSvg[i].AssPoint.DestroyWebsocket();
		}
	}
}
/**********************************配置的万力达SVG图形定义 start*************************/

function WldSvg()
{
	var me = this;
	me.Dom 			= null;//加载的配置图形文件的Dom
	me.AssPoint		= null;//evg文件中所有非重复关联点对象
	me.Graphs		= [];//evg文档中所有的关联了数据的图元数组
	me.Charts		= [];//图表
	me.Rect 	 	= {};//图形的矩形盒子
	me.OffParentH 	= 0;//Svg图偏移父窗口的offsetHeight
	me.OffParentW 	= 0;//Svg图偏移父窗口的offsetWidth
}
WldSvg.prototype.Init = function(GraphID,ChartID)
{
	var i,me = this;
	me.AssPoint = new AssPoint();
	var bGraph = true;
	var Points = [],Type;
	for(i=0;i<GraphID.length;i++)//一个id就是一个图元
	{
		var Dom = document.getElementById(GraphID[i]);//获取Dom
		if(!Dom)
		{
			return;
		}
		Dom.OldStyle = (Dom.style) ? Dom.style.cssText : "";
		var attrs = Dom.attributes;
		var ContrlMap = "";
		//ContrlMap = Dom.getAttribute("contrlmap");//得到关联条目字符串,contrlmap属性非DOM原生属性，测试时在特殊性况下得到为undifinded
		for(var j=0;j<attrs.length;j++)
		{
			if(attrs[j].name == "contrlMap")
			{
				ContrlMap = attrs[j].nodeValue;
				break;
			}
		}
		var str = ContrlMap.replace(/'/g, '"');
		var Ass = JSON.parse(str);//将字符串转换为关联条目对象
		Points = me.DealWithAss(Dom,GraphID[i],Ass);//返回Dom关联的不同的点的集合
		me.Graphs[i] = new SvgGraph(Dom,GraphID[i],Ass,Points);
		me.DealWithPoint(me.Graphs[i],Points,bGraph);//筛选，一个evg文件中相同的点只要一个，保存在me.Points中
	}
	bGraph = false;
	for(i=0;i<ChartID.length;i++)
	{
		var id = ChartID[i];
		var Dom = document.getElementById(id);//获取图表外层g标签
		if(Dom.classList.contains("CurveDB"))
		{
			me.Charts[i] = new ChartCurveDB(Dom,ChartID[i]);
		}
		else if(Dom.classList.contains("Curve"))//实时曲线
		{
			me.Charts[i] = new ChartCurve(Dom,ChartID[i]);
		}
		else if(Dom.classList.contains("Stick"))//棒图
		{
			me.Charts[i] = new ChartStick(Dom,ChartID[i]);
		}
		else if(Dom.classList.contains("Pie"))//饼图
		{
			me.Charts[i] = new ChartPie(Dom,ChartID[i]);
		}
		me.Charts[i].Init();
		Points = [];
		for(var j=0;j<me.Charts[i].Series.length;j++)
		{
			var Serie = me.Charts[i].Series[j].Serie;
			if(Serie && Serie.AssPoint)
			{
				Points.push(me.Charts[i].Series[j].Serie.AssPoint);
			}
		}
		
		if(Dom.classList.contains("CurveDB"))
		{
			me.Charts[i].Points = Points;//该历史图表关联的点集合
		}
		else
		{
			me.DealWithPoint(me.Charts[i],Points,bGraph);
			me.Charts[i].Dynamic();
		}
	}
	me.AssPoint.Init();//对历史曲线无用
}
WldSvg.prototype.SvgResize = function()
{
	var me = this;
	me.ReSize();
}
WldSvg.prototype.OnSize = function()
{
	var me = this;
	me.ReSize();
	var x=0,y=0;
	for(var e=me.Dom;e;e=e.offsetParent)
	{
		x += e.offsetLeft;
		y += e.offsetTop;
		if (e.scrollLeft) x -= e.scrollLeft;
		if (e.scrollTop) y -= e.scrollTop;
	}
	me.sumLeft = x + me.dx;
	me.sumTop = y + me.dy;			
}
WldSvg.prototype.ReSize = function()
{
	var me = this;
	var node = ((me.Dom.parentNode==document.body)&&(document.body==me.Dom.offsetParent))?me.Dom:me.Dom.parentNode;
	if(node)
	{
		var rect = node.getBoundingClientRect();
		me.Rect.Width = rect.width;
		me.Rect.Height = rect.height;
		me.Rect.WidthRatio = me.Rect.Width/me.ViewBox[2];
		me.Rect.HightRatio = me.Rect.Height/me.ViewBox[3];
		me.Rect.Ratio = me.Rect.WidthRatio > me.Rect.HightRatio ? me.Rect.HightRatio : me.Rect.WidthRatio;//谁的比例小就要谁的
		me.Rect.Ratio = +me.Rect.Ratio.toFixed(4);
	}	
}
WldSvg.prototype.Move = function()
{
	var me = this;
	me.tx = +me.Dom.attributes.transformx.value;//左右移动的偏移量
	me.ty = +me.Dom.attributes.transformy.value;//上下移动的偏移量
}
WldSvg.prototype.Scale = function()//注意：缩放的时候是以按原图比例做为参照的，不能调用Svg_OnSize函数
{
	var me = this;
	me.Scalek = +me.Dom.attributes.scalek.value;
	me.Ratio = me.Rect.Ratio * me.Scalek;
}
//处理图元关联点
WldSvg.prototype.DealWithAss = function(Dom,GraphID,Ass)//
{
	var me = this;
	var arr=[];
	if(Ass.LineColor && Ass.LineColor.point)
	{
		Ass.LineDom = Dom;//默认对象
		if(Dom.classList.contains("svgtext"))//拥有文本属性
		{
			Ass.LineDom = DealWithText(Dom).rect;
		}
		arr.push(Ass.LineColor.point);
	}
	if(Ass.FillColor && Ass.FillColor.point)//配置填充色，初始化填充对象
	{
		Ass.FillDom = Dom;//默认填充对象
		if(Dom.classList.contains("svgtext"))//拥有文本属性
		{
			Ass.FillDom = DealWithText(Dom).rect;//矩形节点
		}
		arr.push(Ass.FillColor.point);
	}
	if(Ass.FontColor && Ass.FontColor.point)
	{
		Ass.FontDom = Dom;//默认填充对象
		if(Dom.classList.contains("svgtext"))//拥有文本属性
		{
			Ass.FontDom = DealWithText(Dom).text;//文本节点
		}
		arr.push(Ass.FontColor.point);
	}
	if(Ass.FillPercent && Ass.FillPercent.point)
	{
		arr.push(Ass.FillPercent.point);
	}
	if(Ass.Size && Ass.Size.point)
	{
		arr.push(Ass.Size.point);
	}
	if(Ass.Position && Ass.Position.point)
	{
		arr.push(Ass.Position.point);
	}
	if(Ass.Display && Ass.Display.point)
	{
		arr.push(Ass.Display.point);
	}
	if(Ass.Format && Ass.Format.point)
	{
		arr.push(Ass.Format.point);
	}
	if(Ass.SwitchGraph && Ass.SwitchGraph.point)
	{
		Ass.SwitchGraph.SwitchDom = document.getElementById(GraphID+"_switch");//在这里添加了一个切换对象
		arr.push(Ass.SwitchGraph.point);
	}
	if(Ass.SwitchText && Ass.SwitchText.point)
	{
		var Text = DealWithText(Dom);//文本节点
		Dom.POldStyle = Text.rect.style.cssText;//保存父元素矩形初始风格
		for(var j=0;j<Text.text.childNodes.length;j++)
		{
			if(Text.text.childNodes[j].nodeName == "tspan")
			{
				Ass.SwitchText.TspanDom = Text.text.childNodes[j];
				if(Ass.SwitchText.TspanDom.textContent != Ass.SwitchText.Value)//切换文本值和当前文本值必须不同
				{
					Ass.SwitchText.OldText = Ass.SwitchText.TspanDom.textContent;
				}
			}
		}
		arr.push(Ass.SwitchText.point);
	}
	if(Ass.Flash && Ass.Flash.point)
	{
		arr.push(Ass.Flash.point);
	}
	if(Ass.Swing && Ass.Swing.point)
	{
		arr.push(Ass.Swing.point);
	}
	if(Ass.Tanslate &&　Ass.Tanslate.point)
	{
		arr.push(Ass.Tanslate.point);
	}
	if(Ass.Rotate && Ass.Rotate.point)
	{
		arr.push(Ass.Rotate.point);
	}
	if(Ass.Flow && Ass.Flow.point)
	{
		arr.push(Ass.Flow.point);
	}
	var temp = "",Points = [];
	for(var i=0;i<arr.length;i++)
	{
		var b = true;
		temp = arr[i];
		for(var j=0;j<Points.length;j++)
		{
			if(temp == Points[j].Point)//筛选，同一个图元中相同的点只要一个
			{
				b = false;
			}
		}
		if(b)
		{
			var DDPoint;
			if(temp.substr(0,3) == "rtu")
			{
				DDPoint = new RtuPoint(temp);
			}
			else if(temp.substr(0,2) == "cl" || temp.substr(0,2) == "ca" || temp.substr(0,2) == "cm")
			{
				DDPoint = new CalculatePoint(temp);
			}
			else
			{
				DDPoint = new CommonPoint(temp);
			}
			Points.push(DDPoint);
		}
	}
	return Points;
}
WldSvg.prototype.DealWithPoint = function(Element,Points,bGraph)
{
	var b = true,me = this;
	for(var i=0;i<Points.length;i++)//一般来说，一个图元只关联一个相同的点
	{
		var TempPoint = [];
		if(Points[i].Type == "yx")
		{
			TempPoint = me.AssPoint.YxPoint.Points;
		}
		else if(Points[i].Type == "yc")
		{
			TempPoint = me.AssPoint.YcPoint.Points;
		}
		else if(Points[i].Type == "mc")
		{
			TempPoint = me.AssPoint.McPoint.Points;
		}
		else if(Points[i].Type == "rtu")
		{
			TempPoint = me.AssPoint.RtuPoint.Points;
		}
		else if(Points[i].Type == "cl")
		{
			TempPoint = me.AssPoint.ClPoint.Points;
		}
		else if(Points[i].Type == "ca")
		{
			TempPoint = me.AssPoint.CaPoint.Points;
		}
		else if(Points[i].Type == "cm")
		{
			TempPoint = me.AssPoint.CmPoint.Points;
		}
		for(var j=0;j<TempPoint.length;j++)//筛选，一个evg文件中相同的点只要一个
		{
			if(Points[i].Point == TempPoint[j].Point)//一个点关联不同的图元，每找到相同的关联点，该点控制相应的图元应增加
			{
				if(bGraph)
				{
					TempPoint[j].Graphs.push(Element);
				}
				else
				{
					TempPoint[j].Charts.push(Element);
				}
				b = false;
			}
		}
		if(b)//如果没有找到相同的点，每个点一定关联了至少一个图元
		{
			if(bGraph)
			{
				Points[i].Graphs.push(Element);
			}
			else
			{
				Points[i].Charts.push(Element);
			}
			TempPoint.push(Points[i]);
		}
	}
}
WldSvg.prototype.Destroy = function()
{
	var me = this;
	if(me.AssPoint)
	{
		me.AssPoint.Destroy();
		me.AssPoint = null;
	}
	for(i=0;i<me.Graphs.length;i++)
	{
		me.Graphs[i].Destroy();
	}
	me.Graphs 	= [];
	for(i=0;i<me.Charts.length;i++)
	{
		me.Charts[i].Destroy();
	}
	me.Charts 	= [];
	me.Dom 		= null;
	me.Rect 	= null;
}

//图元基类定义
function SvgGraph(Dom,GraphID,Ass,Points)
{
	var me = this;
	me.Dom		= Dom;
	me.GraphID 	= GraphID;
	me.Ass		= Ass;//关联点对象
	me.Points	= Points;//每个图元关联的点集合
}
SvgGraph.prototype.Destroy = function()
{
	var me = this;
	for(var key in me.Ass)//清除定时器
	{
		if(key == "Flash")
		{
			if(me.Ass[key].FlashTimeId)	clearInterval(me.Ass[key].FlashTimeId);//清除定时器
		}
		else if(key == "Tanslate")
		{
			if(me.Ass[key].TanslateTimeId)	clearInterval(me.Ass[key].TanslateTimeId);//清除定时器
		}
		else if(key == "Flow")
		{
			if(me.Ass[key].TimeId)	clearInterval(me.Ass[key].TimeId);//清除定时器
		}
	}
}
SvgGraph.prototype.Dynamic = function(Msg)
{
	var me = this;
	for(var i=0;i<me.Points.length;i++)
	{
		if(Msg.iid != me.Points[i].Point) continue;
		for(var key in me.Ass)
		{
			var Asi = me.Ass[key];
			if(typeof(me.Ass[key].point) != "undefined" && Asi.point == me.Points[i].Point)//找到图元关联的具体条目
			{
				if(+Msg.biIV == 1)//数据无效，文本背景置灰invalid
				{
					me.Dom.setAttribute("invalid",1);
				}
				if(me.Points[0].Type == "rtu")
				{
					Msg.value = +Msg.biCommOK;
				}
				if(key == "LineColor")
				{
					me.LineColor(Msg,Asi);
				}
				else if(key == "FillColor")
				{
					me.FillColor(Msg,Asi);
				}
				else if(key == "FontColor")
				{
					me.FontColor(Msg,Asi);
				}
				else if(key == "FillPercent")
				{
					me.FillPercent(Msg,Asi);
				}
				else if(key == "Size")
				{
					me.Size(Msg,Asi);
				}
				else if(key == "Position")
				{
					me.Position(Msg,Asi);
				}
				else if(key == "Display")
				{
					me.Display(Msg,Asi);
				}
				else if(key == "Format")
				{
					me.Format(Msg,Asi);
				}
				else if(key == "SwitchGraph")
				{
					me.SwitchGraph(Msg,Asi);
				}
				else if(key == "SwitchText")
				{
					me.SwitchText(Msg,Asi);
				}
					else if(key == "Flash")
				{
					me.Flash(Msg,Asi);
				}
				else if(key == "Swing")
				{
					me.Swing(Msg,Asi);
				}
				else if(key == "Tanslate")
				{
					me.Tanslate(Msg,Asi);
				}
				else if(key == "Rotate")
				{
					me.Rotate(Msg,Asi);
				}
				else if(key == "Flow")
				{
					me.Flow(Msg,Asi);
				}
			}
			me.Ass[key].OldValue = Msg.value;
		}
	}
}
SvgGraph.prototype.LineColor = function(Msg,Asi)//颜色关联——线颜色
{
	var style;
	var value = DealWithPolar(Asi.Polar,+Msg.value);
	if(+Msg.biIV == 0)//biIV(品质)：0--有效；1--无效
	{
		if(typeof(Msg.biLimitStatus) != "undefined")
		{
			style = DealWithLimitStatus(+Msg.biLimitStatus,Asi);
		}
		else
		{
			style = DealWithOnOff(value,Asi);			
		}
	}
	else
	{
		style = "rgb(120,120,120)";
	}
	this.Ass.LineDom.style.stroke = style;
}
SvgGraph.prototype.FillColor = function(Msg,Asi)//颜色关联——填充色
{
	var style;
	var value = DealWithPolar(Asi.Polar,+Msg.value);
	if(+Msg.biIV == 0)
	{
		if(typeof(Msg.biLimitStatus) != "undefined")
		{
			style = DealWithLimitStatus(+Msg.biLimitStatus,Asi);
		}
		else
		{
			style = DealWithOnOff(value,Asi);			
		}
	}
	else
	{
		style = "rgb(120,120,120)";
	}
	this.Ass.FillDom.style.fill = style;
}
SvgGraph.prototype.FontColor = function(Msg,Asi)//颜色关联——文本色
{
	var style;
	if(+Msg.biIV == 1)
	{
		return;
	}
	var value = DealWithPolar(Asi.Polar,+Msg.value);
	if(typeof(Msg.biLimitStatus) != "undefined")
	{
		style = DealWithLimitStatus(+Msg.biLimitStatus,Asi);
	}
	else
	{
		style = DealWithOnOff(value,Asi);			
	}
	this.Ass.FontDom.style.fill = style;
}
SvgGraph.prototype.FillPercent = function(Msg,Asi)//空间关联——填充度
{
	console.log("空间关联——填充度 功能暂未实现！");
}
SvgGraph.prototype.Size = function(Msg,Asi)		//空间关联——尺寸
{
	console.log("空间关联——尺寸 功能暂未实现！");
}
SvgGraph.prototype.Position = function(Msg,Asi)	//空间关联——位置
{
	console.log("空间关联——位置 功能暂未实现！");
}
SvgGraph.prototype.Display = function(Msg,Asi)	//输出关联——可见性
{
	var value = +Msg.value;
	if(typeof(Msg.biCurWarn) != "undefined")//数字量
	{
		value = DealWithPolar(Asi.Polar,value);
		if(value == 1)
		{
			this.Dom.style.display = "none";
		}
		else
		{
			this.Dom.style.display = "";
		}
	}
}
SvgGraph.prototype.Format = function(Msg,Asi)		//输出关联——显示格式
{
	var value = +Msg.value;
	var Text = DealWithText(this.Dom);//文本标签的第一个是矩形，第二个才是文本
	if(+Msg.biIV == 1)//数据无效，文本背景置灰invalid
	{
		Asi.OldStroke = Text.rect.style.stroke;
		Asi.OldFill = Text.rect.style.fill;
		style = "rgb(120,120,120)";
		Text.rect.style.stroke = style;
		Text.rect.style.fill = style;
	}
	else
	{
		if(Asi.OldStroke != Text.rect.style.stroke)
		{
			Text.rect.style.stroke = Asi.OldStroke;
		}
		if(Asi.OldFill != Text.rect.style.fill)
		{
			Text.rect.style.fill = Asi.OldFill
		}
	}
	var format = +Asi.FormatStr;
	if(format == 0)
	{
		value = value.toFixed(0);
	}
	else if(format == 1)
	{
		value = value.toFixed(1);
	}
	else if(format == 2)
	{
		value = value.toFixed(2);
	}
	else if(format == 3)
	{
		value = value.toFixed(3);
	}
	else if(format == 4)
	{
		value = value.toFixed(4);
	}
	else if(format == 5)//最多一位小数
	{
		value = Math.round(parseFloat(value)*10)/10;
	}
	else if(format == 6)//最多两位小数
	{
		value = Math.round(parseFloat(value)*100)/100;
	}
	else if(format == 7)
	{
		value = Math.round(parseFloat(value)*1000)/1000;
	}
	else if(format == 8)
	{
		value = Math.round(parseFloat(value)*10000)/10000;
	}
	else if(format == 15)
	{
		var date = new Date();
		value = (date.getFullYear() + "年") + (date.getMonth()+1) + "月" + date.getDate() + "日 " 
				+ CheckTime(date.getHours()) + ":" + CheckTime(date.getMinutes()) + ":" + CheckTime(date.getSeconds());
	}
	else if(format == 16)
	{
		var date = new Date();
		value = (date.getFullYear() + "-") + (date.getMonth()+1) + "-" + date.getDate() + " " 
				+ date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	}
	var dom = Text.text.childNodes[0].nodeName == "tspan" ? Text.text.childNodes[0] : Text.text.childNodes[1];
	dom.textContent = (Asi.Prefix ? Asi.Prefix : "") + value + (Asi.Suffix ? Asi.Suffix : "");
}
SvgGraph.prototype.SwitchGraph = function(Msg,Asi)	//输出关联——图元切换
{
	var me = this;
	var value = DealWithPolar(Asi.Polar,+Msg.value);
	if(+Msg.biIV == 1)//数据无效，文本背景置灰
	{
		return;
	}
	if(value == 1)
	{
		me.Dom.setAttribute("display","none");
		if(Asi.SwitchDom)
		{
			Asi.SwitchDom.setAttribute("display","true");
		}
		else
			console.log("未找到" + me.GraphID + "的切换图元，请检查配置文件！");
	}
	else
	{
		me.Dom.setAttribute("display","true");
		if(Asi.SwitchDom)
		{
			Asi.SwitchDom.setAttribute("display","none");
		}
		else
			console.log("未找到" + me.GraphID + "的切换图元，请检查配置文件！");
	}
}
SvgGraph.prototype.SwitchText = function(Msg,Asi)	//输出关联——文本切换
{
	if(+Msg.biIV == 1)//数据无效
	{
		return;
	}
	if(typeof(Msg.biCurWarn) != "undefined")//数字量
	{
		var value = DealWithPolar(Asi.Polar,+Msg.value);
		if(value == 1)
		{
			Asi.TspanDom.textContent = Asi.Value ? Asi.Value : "";
			this.Dom.style.fill = Asi.StrokeTo;
		}
		else
		{
			Asi.TspanDom.textContent = Asi.OldText;
			this.Dom.style.cssText = this.Dom.OldStyle;
		}
	}
}
SvgGraph.prototype.Flash = function(Msg,Asi)	//动画关联——闪烁（只能数字量）
{
	var me = this;
	var value = DealWithPolar(Asi.Polar,+Msg.value);
	if(+Msg.biIV == 1)//数据无效
	{
		return;
	}
	if(Msg.biConfirmed)//确认报警
	{
		if(Asi.FlashTimeId)	clearInterval(Asi.FlashTimeId);//清除定时器
		if(me.Ass.SwitchGraph && me.Ass.SwitchGraph.SwitchDom)//图元切换
		{
			if(value == 0)
			{
				me.Dom.setAttribute("display","true");
				me.Ass.SwitchGraph.SwitchDom.setAttribute("display","none");
			}
			else
			{
				me.Dom.setAttribute("display","none");
				me.Ass.SwitchGraph.SwitchDom.setAttribute("display","true");
			}
		}
		else
			me.Dom.setAttribute("display","true");//恢复显示
	}
	else//未确认报警
	{
		//报警状态 0：正常、1：事故总信号启警、2：1→0非命令变位、3：0→1非命令变位、4：1→0命令变位、	5：0→1命令变位
		if(+Msg.biCurWarn || me.Points[0].Type == "rtu")//处于报警状态或者关联的是Rtu
		{
			Asi.nCount = 0;
			var Fre = DealWithFrequency(Asi);
			if(Asi.FlashTimeId)	clearInterval(Asi.FlashTimeId);//清除定时器
			Asi.FlashTimeId = setInterval(function(){me.FlashDynamic(Asi,value);},Fre);
		}
	}
}
SvgGraph.prototype.FlashDynamic = function(Asi,value)
{
	var me = this;
	if(Asi.nCount%2 == 0)
	{
		if(me.Ass.SwitchGraph && me.Ass.SwitchGraph.SwitchDom)
		{
			if(value == 1)
			{
				me.Ass.SwitchGraph.SwitchDom.setAttribute("display","true");
			}
				else
			{
				me.Dom.setAttribute("display","true");
			}
		}
		else 
			me.Dom.setAttribute("display","true");
	}
	else
	{
		if(me.Ass.SwitchGraph && me.Ass.SwitchGraph.SwitchDom)
		{
			if(value == 1)
			{
				me.Ass.SwitchGraph.SwitchDom.setAttribute("display","none");
			}
			else
			{
				me.Dom.setAttribute("display","none");
			}
		}
		else 
			me.Dom.setAttribute("display","none");
	}
	Asi.nCount++;
}
SvgGraph.prototype.Swing = function(Msg,Asi)	//动画关联——摆动
{
	alert("Swing功能暂未实现！");
}
SvgGraph.prototype.Tanslate = function(Msg,Asi)//动画关联——平动
{
	var value = +Msg.value;
	var me = this;
	if(+Msg.biIV == 1)//数据无效
	{
		return;
	}
	if(Asi.arrIID[Asi.index].OldValue != value)//值改变了
	{
		value = DealWithPolar(Asi.Polar,value);
		if(value == 1)
		{
			Asi.nCount = 0;
			var Fre = DealWithFrequency(Asi);
			if(Asi.TanslateTimeId)	clearInterval(Asi.TanslateTimeId);//清除定时器
			Asi.TanslateTimeId = setInterval(function(){me.Move(Asi);},Fre);
		}
		else
		{
			var translate = 'translate(0,0)';
			me.MoveBegin(translate);
			if(Asi.TanslateTimeId)	clearInterval(Asi.TanslateTimeId);//清除定时器
		}
	}
}
SvgGraph.prototype.Move = function(Asi)
{
	this.Dom.setAttribute("transform",this.MoveBase(Asi));
}
SvgGraph.prototype.MoveBegin = function(translate)
{
	this.Dom.setAttribute("transform",translate);
}
SvgGraph.prototype.MoveBase = function(Asi)
{
	var offsetX=0,offsetY=0;
	if(+Asi.Dir == 0)//从左到右
	{
		offsetX = (+Asi.Offset)/5 * ((this.nCount)%5);
	}
	else if(+Asi.Dir == 1)//从右到左
	{
		offsetX = (+Asi.Offset)/5 * (5-(this.nCount)%5);
	}
	else if(+Asi.Dir == 2)//从上到下
	{
		offsetY = (+Asi.Offset)/5 * ((this.nCount)%5);
	}
	else//从下到上
	{
		offsetY = (+Asi.Offset)/5 * (5-(this.nCount)%5);
	}
	this.nCount++;
	return 'translate(' + offsetX + ',' + offsetY +')';
}
SvgGraph.prototype.Rotate = function(Msg,Asi)	//动画关联——转动
{
	alert("Rotate功能暂未实现！");
}
SvgGraph.prototype.Flow = function(Msg,Asi)	//动画关联——流动
{
	var fill = this.Dom.style.fill;
	var str = fill.slice(6,-2);
	var dom = document.getElementById(str).childNodes[1];
	if(+Msg.biIV == 1)//数据无效
	{
		return;
	}
	this.nCount = 0;
	this.FlushTime = 200;
	var self = this;
	if(Asi.TimeId)	clearInterval(Asi.TimeId);//清除定时器
	Asi.TimeId = setInterval(function(){self.DynamicFlow(dom);},this.FlushTime);
}
SvgGraph.prototype.DynamicFlow = function(dom)
{
	var value;
	if(this.nCount < 90)
	{
		value = 5 + this.nCount + "%";
	}
	else
	{
		this.nCount = 0;
		value = 0;
	}
	this.nCount += 5;
	
	dom.setAttribute("offset",value);
}
//点对象定义
function AssPoint()
{
	var me = this;
	me.YxPoint		= new PointTypeBase("yx");
	me.YcPoint		= new PointTypeBase("yc");
	me.McPoint		= new PointTypeBase("mc");
	me.RtuPoint		= new RtuPointObj("rtu");
	me.ClPoint		= new CalculatePointObj("cl");
	me.CaPoint		= new CalculatePointObj("ca");
	me.CmPoint		= new CalculatePointObj("cm");
}
AssPoint.prototype.Destroy = function()
{
	var me = this;
	me.YxPoint.Destroy();
	me.YxPoint = null;
	me.YcPoint.Destroy();
	me.YcPoint = null;
	me.McPoint.Destroy();
	me.McPoint = null;
	me.RtuPoint.Destroy();
	me.RtuPoint = null;
	me.ClPoint.Destroy();
	me.ClPoint = null;
	me.CaPoint.Destroy();
	me.CaPoint = null;
	me.CmPoint.Destroy();
	me.CmPoint = null;
}
AssPoint.prototype.Init = function()
{
	var me = this;
	me.YxPoint.Init();
	me.YcPoint.Init();
	me.McPoint.Init();
	me.RtuPoint.Init();
	me.ClPoint.Init();
	me.CaPoint.Init();
	me.CmPoint.Init();
}
AssPoint.prototype.CreateWebsocket = function()
{
	var me = this;
	me.YxPoint.CreateWebsocket();
	me.YcPoint.CreateWebsocket();
	me.McPoint.CreateWebsocket();
	me.RtuPoint.CreateWebsocket();
	me.ClPoint.CreateWebsocket();
	me.CaPoint.CreateWebsocket();
	me.CmPoint.CreateWebsocket();
}
AssPoint.prototype.DestroyWebsocket = function()
{
	var me = this;
	me.YxPoint.DestroyWebsocket();
	me.YcPoint.DestroyWebsocket();
	me.McPoint.DestroyWebsocket();
	me.RtuPoint.DestroyWebsocket();
	me.ClPoint.DestroyWebsocket();
	me.CaPoint.DestroyWebsocket();
	me.CmPoint.DestroyWebsocket();
}
function PointTypeBase(str)
{
	var me = this;
	me.Points 		= [];//关联了相应类型的点的数组
	me.PointGroup 	= [];//相应点类型分割成的数组，一般为8的倍数
	me.StrStart		= '{"B":4,"request":{"' + str + '":[';
	me.StrEnd 		= ']}}';
}
PointTypeBase.prototype.Destroy = function()
{
	this.DestroyWebsocket();
	this.PointGroup = [];
}
PointTypeBase.prototype.Init = function()
{
	var me = this,Group,SendStr="",PointGroups=[];
	var num = MyConstant.getConstants("SOCKET_GROUP_NUM");
	var i;
	for(i=0;i<me.Points.length;i++)
	{
		PointGroups.push(me.Points[i]);
		if(i == me.Points.length-1)//最后一个
		{
				SendStr += me.Points[i].SendStr;
				Group = new PointGroup(PointGroups,me.StrStart + SendStr+me.StrEnd);
				me.PointGroup.push(Group);
		}
		else
		{
			if((i+1)%num == 0)
			{
				SendStr += me.Points[i].SendStr;
				Group = new PointGroup(PointGroups,me.StrStart + SendStr + me.StrEnd);
				me.PointGroup.push(Group);
				Group = null;
				PointGroups = [];
				SendStr = "";
			}
			else
				SendStr += me.Points[i].SendStr + ",";
		}
	}
	me.CreateWebsocket();
}
PointTypeBase.prototype.CreateWebsocket = function()
{
	for(i=0;i<this.PointGroup.length;i++)
	{
		this.PointGroup[i].CreateWebsocket();
	}
}
PointTypeBase.prototype.DestroyWebsocket = function()
{
	for(var i=0;i<this.PointGroup.length;i++)
	{
		this.PointGroup[i].DestroyWebsocket();
	}
}
function RtuPointObj(str)
{
	var me = this;
	PointTypeBase.call(me,str);
}
RtuPointObj.prototype = new PointTypeBase();//继承基类所有的方法
function CalculatePointObj(str)
{
	var me = this;
	PointTypeBase.call(me,str);
}
CalculatePointObj.prototype = new PointTypeBase();//继承基类所有的方法

function PointBase(Point)
{
	var me = this;
	me.Point 	= Point;//关联点字符串
	me.Graphs	= [];//每个点控制的图元数组
	me.Charts	= [];
}
//关联数据点声明——适用于遥信、遥测、脉冲点
function CommonPoint(Point)
{
	var me = this;
	PointBase.call(me,Point);
	var arr = me.Point.split(/[:,]/i);//"yx:station:1,no:1,channel:1,rtu:1,address:1"
	me.Type 	= arr[0];//点类型
	me.Station 	= arr[2];//点所属厂站
	me.No		= arr[4];//点编号
	me.Channel 	= arr[6];//点所属通道
	me.Rtu 		= arr[8];//点所属Rtu
	me.Address	= arr[10];//点地址
	me.SendStr 	= '{' + '"station":' + me.Station + ',"no":' + me.No + ',"channel":' + me.Channel 
					+ ',"rtu":' + me.Rtu + ',"address":' + me.Address + '}';
	me.SendHis	= '{' + '"station":' + me.Station + ',"no":' + me.No + '}';
}
function RtuPoint(Point)
{
	var me = this;
	PointBase.call(me,Point);
	var arr = this.Point.split(/[:,]/i);//"rtu:channel:1,no:1"
	me.Type 	= arr[0];//点类型
	me.Channel 	= arr[2];//点所属通道
	me.No 		= arr[4];//点所属Rtu
	me.SendStr 	= '{' + '"channel":' + me.Channel + ',"no":' + me.No + '}';
}
function CalculatePoint(Point)//（逻辑、模拟、脉冲）计算点
{
	var me = this;
	PointBase.call(me,Point);
	var arr = this.Point.split(/[:,]/i);//"cl:station:1,no:1"
	me.Type 	= arr[0];//点类型
	me.Station 	= arr[2];//点所属通道
	me.No 		= arr[4];//点所属Rtu
	me.SendStr 	= '{' + '"station":' + me.Station + ',"no":' + me.No + '}';
}
//点组基类定义——点组应该设置为一个数组对象，每组数据发送后也应该由该组的点来判断接收
function PointGroup(Points,SendStr)
{
	var me = this;
	me.Points		= Points;//该组申请的遥信数据点的集合——一般为8的倍数
	me.WebSocket	= null;//该组请求数据的网络通信对象
	me.SendStr 		= SendStr;//该组向服务器发送请求的字符串
	me.MsgCount		= 1;
	me.MsgLastCount = 0;
	me.CheckTimeID	= 0;
}
PointGroup.prototype.Init = function()
{
	var me = this;
	me.CreateWebsocket();
}
PointGroup.prototype.Destroy = function()
{
	var me = this;
	me.DestroyWebsocket();
}
PointGroup.prototype.CreateWebsocket = function()
{
	var me = this;
	if(me.WebSocket)
	{
		if(me.CheckTimeID && me.WebSocket.readyState == 1)
		{
			return;
		}
		else
		{
			me.WebSocket.close()
			me.WebSocket = null;
		}
	}
	me.WebSocket = new WebSocket(g_WldWsServer);
	me.WebSocket.onopen = function(event){me.Send();}
	me.WebSocket.onmessage = function(event){me.OnMessage(JSON.parse(event.data));}
	if(me.CheckTimeID) clearInterval(me.CheckTimeID);
	me.CheckTimeID = setInterval(function(){me.CheckStatus();},MyConstant.getConstants("CHECKSTATU_TIME"));//定期检查通讯状态
}
PointGroup.prototype.DestroyWebsocket = function()
{
//	console.log("销毁websocket！");
	var me = this;
	if(me.CheckTimeID) clearInterval(me.CheckTimeID);
	if(me.WebSocket)
	{
		me.WebSocket.close();
		me.WebSocket = null;
	}
}
PointGroup.prototype.Send = function()
{
//	console.log("websocket发送请求！");
	var me = this;
	me.WebSocket.send(me.SendStr);
}
PointGroup.prototype.OnMessage = function(obj)
{
//	console.log("数据接收！");
	var me = this;
	me.MsgCount++;
	if(me.MsgCount > 1000000)
	{
		me.MsgCount = 0;
	}
	for(var i=0;i<obj.values.length;i++)
	{
		for(var j=0;j<me.Points.length;j++)
		{
			//找到相应的点，其实，按照设计，应该是一一对应，但后台会有对于申请n个点返回的数据少于n的情况——比如第一次回复申请之后的主动上传变化数据
			if(me.Points[j].Point == obj.values[i].iid)
			{
				for(var k=0;k<me.Points[j].Graphs.length;k++)//一个点可能控制多个图元
				{
					me.Points[j].Graphs[k].Dynamic(obj.values[i]);//刷新图元
				}
				for(var k=0;k<me.Points[j].Charts.length;k++)//一个点可能控制多个图表
				{
					me.Points[j].Charts[k].UpdateValue(obj.values[i]);//更新实时值
				}
			}
		}
	}
}
PointGroup.prototype.CheckStatus = function()
{
//	console.log("websocket状态检查！");
	var me = this;
	if(me.MsgCount == me.MsgLastCount)//相应的时间内(定时器时间)没有接收到信息
	{
		if(me.WebSocket.readyState == 1)
		{
			me.Send();
		}
		else
		{
			me.DestroyWebsocket();
			me.CreateWebsocket();
		}
	}
	me.MsgLastCount = me.MsgCount;
}

//图表相关对象定义
//坐标纸
function PoltPaper(Dom)
{
	var me = this;
	me.Dom 		= Dom;
	me.Rect 	= {};
	me.XAxis	= null;
	me.YAxis	= null;
	me.Limit	= null;
	me.RatioX 		= 0;//X轴比例系数
	me.RatioY 		= 0;//Y轴比例系数
	me.PerGridX		= 0;//X轴每刻度像素
	me.OriginX 		= 0;
	me.OriginY 		= 0;
	me.EndX 		= 0;
	me.EndY 		= 0;
}
PoltPaper.prototype.Init = function()
{
	var me = this;
	me.RatioY = +me.Dom.getAttribute("ratio_y");
	me.OriginX = +me.Dom.getAttribute("origin_x");
	me.OriginY = +me.Dom.getAttribute("origin_y");
	me.EndX = +me.Dom.getAttribute("end_x");
	me.EndY = +me.Dom.getAttribute("end_y");
//	me.YMin = +me.Dom.getAttribute("y_min");
	me.PerGridX = +me.Dom.getAttribute("per_gridx");
	for(var j=0;j<me.Dom.childNodes.length;j++)
	{
		var node = me.Dom.childNodes[j];
		if(node.nodeName == "rect" )
		{
			me.Rect = node;
		}
		else
		{
			if(node.classList.contains("XAxis"))
			{
				me.XAxis =  new PoltAxis(node);
				me.XAxis.Init(me);
			}
			else if(node.classList.contains("YAxis"))
			{
				me.YAxis =  new PoltAxis(node);
				me.YAxis.Init(me);
			}
			else if(node.classList.contains("Limit"))
			{
				me.Limit = node;
				me.Limit.Value = +node.getAttribute("limitvalue");
			}
		}
	}
}
PoltPaper.prototype.UpdateXAxisTime = function(StartTime)
{
	var me = this;
	if(me.XAxis)
	{
		me.XAxis.UpdateTime(StartTime);
	}
}
PoltPaper.prototype.UpdateYAxis = function()
{
	var me = this;
	if(me.YAxis)
	{
		me.YAxis.UpdateGraduationValue(me);
	}
}
//坐标轴
function PoltAxis(Dom)
{
	var me = this;
	me.Dom			= Dom;	//g标签节点
	me.Axis			= null;	//轴线
	me.Calibrate	= null;	//刻度
	me.Text			= null;	//刻度描述文本
	me.Lable		= null;	//标注文本
	me.Min			= 0;	//刻度最小值
	me.Max			= 0;
}
PoltAxis.prototype.Init = function(PoltPaper)
{
	var me = this;
	for(var i=0;i<me.Dom.childNodes.length;i++)
	{
		var node = me.Dom.childNodes[i];
		if(node.nodeName == "text")
		{
			me.Lable = node;//X轴
		}
		else if(node.nodeName == "line")
		{
			me.Axis = node;//X轴
		}
		else
		{
			if(node.classList.contains("Calibrate"))//刻度
			{
				var Calibrates = [];
				me.Calibrate = node;
				for(var j=0;j<node.childNodes.length;j++)
				{
					var node1 = node.childNodes[j];
					Calibrates.push(node1);
				}
				me.Calibrate.DeCalibrates = Calibrates;
			}
			else if(node.classList.contains("Text"))//刻度文本
			{
				var Texts = [];
				me.Text = node;
				me.Text.DeFormat = node.getAttribute("index");//数据显示格式
				me.Min = +node.childNodes[0].textContent;//最小刻度值
				me.Max = +node.childNodes[node.childNodes.length-1].textContent;
			}
		}
	}
}
PoltAxis.prototype.UpdateTime = function(StartTime)//StartTime为时间Date对象
{
	var me = this;
	if(me.Text)
	{
		var Text = me.Text;	
		for(var i=0;i<Text.childNodes.length;i++)
		{
			var milliseconds = StartTime.getTime()-(Text.childNodes.length-(i+1))*1000;
			var date = new Date(milliseconds);
			Text.childNodes[i].textContent = me.Format(date);//更新值
		}
	}
}
PoltAxis.prototype.UpdateTimeEx = function(date)//Time为返回数据点的历史记录时间 Date对象
{
	var me = this;
	if(me.Text)
	{
		var Text = me.Text;	
		var time = "";
		for(var i=0;i<Text.childNodes.length;i++)
		{
			if(i == Text.childNodes.length-1)//最后一个
			{
				time = me.Format(date);
			}
			else
			{
				time = Text.childNodes[i+1].textContent;//前一个替换后一个的值
			}
			Text.childNodes[i].textContent = time;//更新值
		}
	}
}
PoltAxis.prototype.UpdateGraduationValue = function(PoltPaper)//更新Y轴的刻度值
{
	var me = this;
	if(me.Text)
	{
		var Text = me.Text;
		var remain = me.Max - me.Min;
		var per = +(remain/(Text.childNodes.length-1)).toFixed(6);
		var value = 0;
		var y = +Text.childNodes[Text.childNodes.length-1].getAttribute("y");
		PoltPaper.RatioY = +((PoltPaper.OriginY - y)/remain).toFixed(6);
		for(var i=0;i<Text.childNodes.length;i++)
		{
			value = me.Min + per * i;
			Text.childNodes[i].textContent = me.Format(value);//更新值
		}
		if(PoltPaper.Limit)
		{
			value = (PoltPaper.Limit.Value - me.Min).toFixed(2);
			value = value>0 ? value : 0;
			y = (PoltPaper.OriginY - value*PoltPaper.RatioY).toFixed(2);
			PoltPaper.Limit.setAttribute("y1",y);
			PoltPaper.Limit.setAttribute("y2",y);
		}
	}
}
PoltAxis.prototype.Format = function(date)
{
	var me = this;
	var value = "";
	if(me.Text.DeFormat == 0)
	{
		value = (date.getFullYear() + "-").substr(2) + (date.getMonth()+1) + "-" + date.getDate() + " " 
				+ CheckTime(date.getHours()) + ":" + CheckTime(date.getMinutes()) + ":" + CheckTime(date.getSeconds());
	}
	else if(me.Text.DeFormat == 1)
	{
		value = (date.getFullYear() + "-").substr(2) + (date.getMonth()+1) + "-" + date.getDate();
	}
	else if(me.Text.DeFormat == 2)
	{
		value = CheckTime(date.getHours()) + ":" + CheckTime(date.getMinutes()) + ":" + CheckTime(date.getSeconds());
	}
	else if(me.Text.DeFormat == 3)
	{
		value = CheckTime(date.getMinutes()) + ":" + CheckTime(date.getSeconds());
	}
	else if(me.Text.DeFormat == 7)
	{
		value = CheckTime(date.getSeconds());
	}
	else if(me.Text.DeFormat == 8)
	{
		value = date.toFixed();
	}
	else if(me.Text.DeFormat == 9)
	{
		value = date.toFixed(1);
	}
	else if(me.Text.DeFormat == 10)
	{
		value = date.toFixed(2);
	}
	else if(me.Text.DeFormat == 11)
	{
		value = date.toFixed(3);
	}
	else if(me.Text.DeFormat == 12)
	{
		value = date.toFixed(4);
	}
	return value;
}
//坐标系列
function PoltSeri(Dom)
{
	var me = this;
	me.Dom			= Dom;
	me.Serie		= null;
	me.Value		= null;
	me.bStop		= false;
}
PoltSeri.prototype.Init = function()
{
	var me = this;
	for(var i=0;i<me.Dom.childNodes.length;i++)
	{
		var node = me.Dom.childNodes[i];
		if(node.nodeName == "path" || node.nodeName == "rect")//找到图表系列
		{
			me.Serie = node;
			var Point = node.getAttribute("point");//得到关联点
			if(Point)
			{
				if(Point.substr(0,3) == "rtu")
				{
					me.Serie.AssPoint = new RtuPoint(Point);
				}
				else
				{
					me.Serie.AssPoint = new CommonPoint(Point);
				}
			}
			else
			{
				alert("图表未完成关联点的配置！");//弹出提醒
				return;
			}
			if(node.nodeName == "rect")
			{
				
			}
			else//曲线
			{
				var AttrD = node.getAttribute("d");
				if(+me.Dom.getAttribute("slick"))
				{
					var arr = AttrD.split(",");
					var tarr = AttrD.split(",");
					me.Serie.Points = arr;
					me.Serie.TempPoints = tarr;
					for(var j=0;j<arr.length;j++)
					{
						me.Serie.Points[j] = arr[j].split(" ");
						me.Serie.TempPoints[j] = tarr[j].split(" ");//数组间的赋值只是传递指针，结果还是对一个数组进行操作
					}
					var Smooth = smooth(me.Serie.Points,3);//初始化为平滑曲线
					me.Serie.setAttribute("d",Smooth);
				}
				else
				{
					me.Serie.Points = AttrD.split(/[ ,]/g);//遇到空格或者逗号就截断
					me.Serie.TempPoints = AttrD.split(/[ ,]/g);//遇到空格或者逗号就截断
				}
			}
		}
		else if(node.classList.contains("Value"))
		{
			var Values = [];
			me.Value = node;
			if(me instanceof PoltSeriStick)//棒图
			{
				node.Value = +node.textContent;
				Values.push(node);
			}
			else//曲线
			{
				for(var j=0;j<node.childNodes.length;j++)
				{
					var node1 = node.childNodes[j];
					node1.Value = +node1.textContent;
					Values.push(node1);
				}
			}
			me.Value.DeValues = Values;//Y值点阵
		}
	}
}
PoltSeri.prototype.UpdateValue = function(chart,value)
{
	var me = this;
//	me.Value.DeValues[me.Value.DeValues.length-1].Value = GetTestAnalog();//测试用生成的随机数据
	var temp = +(value).toFixed(2);
	me.Value.DeValues[me.Value.DeValues.length-1].Value = temp;//更新最后一个值
	if(temp < chart.PoltPaper.YAxis.Min)//小于最小值
	{
		chart.PoltPaper.YAxis.Min = temp;
		chart.PoltPaper.UpdateYAxis();
	}
	else if(temp > chart.PoltPaper.YAxis.Max)//大于最大值
	{
		chart.PoltPaper.YAxis.Max = temp;
		chart.PoltPaper.UpdateYAxis();
	}
}
PoltSeri.prototype.Draw = function(PoltPaper,MoveCount,bflag)
{
	var me = this;
	var len = me.Value.childNodes.length;
	var Value = (+me.Value.DeValues[len-1].Value).toFixed(1);
	var ypoint = +(PoltPaper.OriginY - (Value-PoltPaper.YAxis.Min)*PoltPaper.RatioY).toFixed(1);
	var Path = me.Serie;
	if(+me.Dom.getAttribute("slick"))//如果是光滑显示
	{
		if(bflag)
		{
			var n = len-(MoveCount-1);
			var index = n - 1;
			for(var j=0;j<n;j++)
			{
				if(MoveCount == 1)//第一次移动的时候坐标全部在最后一个点上
				{
					me.Value.childNodes[j].textContent = Value;
					Path.Points[j][1] = +Path.TempPoints[index][5];//替换X坐标;
					Path.Points[j][2] = ypoint;//替换Y坐标;
					if(j != 0)
					{
						Path.Points[j][3] = +Path.TempPoints[index][5];//替换X坐标;
						Path.Points[j][4] = ypoint;
						Path.Points[j][5] = +Path.TempPoints[index][5];//替换X坐标;
						Path.Points[j][6] = ypoint;
					}
				}
				else
				{
					if(index == 0)//此时n的值为1，MoveCount的值为21
					{
						Path.Points[j][1] = +Path.TempPoints[index][1];//替换X坐标;
					}
					else
					{
						if(j == 0)
						{
							Path.Points[j][1] = +Path.TempPoints[index][5];//替换X坐标;
						}
						else
						{
							Path.Points[j][3] = +Path.TempPoints[index][5];//替换X坐标;
							Path.Points[j][5] = +Path.TempPoints[index][5];//替换X坐标;								
						}
					}
				}
			}
		}
		for(var j=0;j<len;j++)//点数目
		{
			var TextNode = me.Value.childNodes[j];
			if(MoveCount != 1)
			{	
				if(j == len-1)
				{
					TextNode.textContent = Value;
				}
				else
				{
					TextNode.textContent = me.Value.childNodes[j+1].textContent;
				}
				var TempValue = (PoltPaper.OriginY - (+TextNode.textContent-PoltPaper.YAxis.Min)*PoltPaper.RatioY).toFixed(1);
				if(j == 0)
				{
					Path.Points[j][2] = TempValue;
				}
				else
				{
					Path.Points[j][2] = TempValue;
					Path.Points[j][4] = TempValue;
					Path.Points[j][6] = TempValue;
				}						
			}
			if(j == 0)
				TextNode.setAttribute("y",Path.Points[j][2]);//更新Y坐标
			else
				TextNode.setAttribute("y",Path.Points[j][6]);
		}
		var Smooth = smooth(Path.Points,3);
		Path.setAttribute("d",Smooth);
	}
	else
	{
		if(bflag)
		{
			var n = len-(MoveCount-1);
			var index = (n - 1)*2;
			for(var j=0;j<n;j++)
			{
				if(MoveCount == 1)	me.Value.childNodes[j].textContent = Value;
				if(j==0)
				{
					Path.Points[j*2] = "M" + Path.TempPoints[index].substr(1);//替换X坐标
				}
				else
				{
					Path.Points[j*2] = "L" + Path.TempPoints[index].substr(1);//替换X坐标						
				}
				Path.Points[j*2+1] = ypoint;
			}
		}
		for(var j=0;j<len;j++)//改变Y轴的值
		{
			var TextNode = me.Value.childNodes[j];
			if(MoveCount != 1)
			{
				if(j == len-1)
				{
					TextNode.textContent = Value;
				}
				else
				{
					TextNode.textContent = me.Value.childNodes[j+1].textContent;
				}						
			}
			Path.Points[j*2+1] = (PoltPaper.OriginY - (+TextNode.textContent-PoltPaper.YAxis.Min)*PoltPaper.RatioY).toFixed(1);
			TextNode.setAttribute("y",Path.Points[j*2+1]);
		}
		Path.setAttribute("d",Path.Points);
	}
}
function PoltSeriCurveDB(Dom)
{
	var me = this;
	PoltSeri.call(me,Dom);
}
PoltSeriCurveDB.prototype = new PoltSeri();

//棒图系列
function PoltSeriStick(Dom)
{
	var me = this;
	PoltSeri.call(me,Dom);
}
PoltSeriStick.prototype = new PoltSeri();
PoltSeriStick.prototype.Draw = function(PoltPaper)
{
	var me = this;
	var len = me.Value.childNodes.length;
	var Value = (+me.Value.DeValues[len-1].Value).toFixed(1);
	var ypoint = +(PoltPaper.OriginY - (Value-PoltPaper.YAxis.Min)*PoltPaper.RatioY).toFixed(1);
	var h = PoltPaper.OriginY - ypoint;
	h = (h>0 ? h : -h).toFixed(1);
	if(PoltPaper.OriginY - ypoint >= 0)
	{
		me.Serie.setAttribute("y",ypoint);//更新Y坐标
		me.Serie.setAttribute("height",h);
		me.Value.setAttribute("y",ypoint-5);//更新Y坐标
		me.Value.textContent = Value;
	}
	else
	{
		me.Serie.setAttribute("y",PoltPaper.OriginY);//更新Y坐标
		me.Serie.setAttribute("height",h);
		me.Value.setAttribute("y",PoltPaper.OriginY-5);//更新Y坐标
		me.Value.textContent = Value;
	}
}
//饼图系列
function PoltSeriPie(Dom)
{
	var me = this;
	PoltSeri.call(me,Dom);
}
PoltSeriPie.prototype = new PoltSeri();

//图表基类定义
function SvgChart(Dom,ChartID)
{
	var me = this;
	me.Dom			= Dom;
	me.ChartID 		= ChartID;
	me.Points		= [];
	me.PoltPaper	= null;
	me.Series		= [];
	me.Prompt		= {};	//提示框
	me.TimeId		= 0;
}
SvgChart.prototype.Destroy = function()
{
	var me = this;
	if(me.TimeId)	clearInterval(me.TimeId);//清除定时器
}
SvgChart.prototype.BaseInit = function()
{
	var me = this;
	for(var i=0;i<me.Dom.childNodes.length;i++)
	{
		var node = me.Dom.childNodes[i];
		if(node.classList.contains("time"))//是否可以用node.hasClass("time")代替
		{
			me.Time = new SelectTime(node);
			me.Time.Init();
		}
		else if(node.classList.contains("PoltPaper"))
		{
			//坐标纸对象
			me.PoltPaper = new PoltPaper(node);
			me.PoltPaper.Init();
			if(this instanceof ChartCurveDB)
			{
				var date = new Date(me.Time.StartTime.text.textContent);
				me.PoltPaper.UpdateXAxisTime(date);
			}
		}
		else if(node.classList.contains("Serie"))
		{
			if(this instanceof ChartCurve)
			{
				var Serie = new PoltSeri(node);
			}
			else if(this instanceof ChartCurveDB)
			{
				var Serie = new PoltSeriCurveDB(node);
			}
			else if(this instanceof ChartStick)
			{
				var Serie = new PoltSeriStick(node);
			}
			else if(this instanceof ChartPie)
			{
				var Serie = new PoltSeriPie(node);
			}
			Serie.Init();
			me.Series.push(Serie);
		}
		else if(node.classList.contains("Prompt"))
		{
			me.Prompt = node;
			for(var j=0;j<node.childNodes.length;j++)
			{
				var node1 = node.childNodes[j];
				if(node1.classList.contains("Horizontal"))
				{
					me.Prompt.Horizontal = node1;
				}
				else if(node1.classList.contains("Vertical"))
				{
					me.Prompt.Vertical = node1;
				}
				if(node1.nodeName == "use")
				{
					me.Prompt.Prompt = node1;
				}
			}
		}
	}
}
SvgChart.prototype.UpdateValue = function(Msg)
{
	var me = this;
	for(var i=0;i<me.Series.length;i++)
	{
		if(me.Series[i].Serie.AssPoint.Point == Msg.iid)
		{
			me.Series[i].UpdateValue(me,+Msg.value);
		}
	}
}
SvgChart.prototype.DynamicBase = function()
{
		var me = this;
		if(me.TimeId)	clearInterval(me.TimeId);//清除定时器
		me.TimeId = setInterval(function(){me.DrawChart();},1000);//实时数据固定为1秒
}
function ChartCurve(Dom,ChartID)
{
	var me = this;
	SvgChart.call(me,Dom,ChartID);
	me.MoveCount = 0;//未移动，所有坐标点在图表右边
}
ChartCurve.prototype = new SvgChart();
ChartCurve.prototype.Init = function()
{
	this.BaseInit();
}
ChartCurve.prototype.Dynamic = function()
{
	this.DynamicBase();
}
//实时曲线画法
ChartCurve.prototype.DrawChart = function()
{
	//更新时间
	var me = this;
	var Text = me.PoltPaper.XAxis.Text;
	var date1 = new Date();
	me.PoltPaper.XAxis.UpdateTime(date1);
	//更新曲线坐标
	var bflag = false;
	if(me.MoveCount < Text.childNodes.length)
	{
		bflag = true;
		me.MoveCount++;
	}
	for(var i=0;i<me.Series.length;i++)
	{
		me.Series[i].Draw(me.PoltPaper,me.MoveCount,bflag);
	}
}

//历史曲线相关
function SelectTime(node)
{
	var me = this;
	me.Dom = node;
	me.StartTime 	= {};
	me.EndTime		= {};
	me.Query		= {};	
}
SelectTime.prototype.Init = function()
{
	var me = this;
	for(var i=0;i<me.Dom.childNodes.length;i++)
	{
		var node = me.Dom.childNodes[i];
		if(node.classList.contains("SelectTime1"))//选择起始时间
		{
			for(var j=0;j<node.childNodes.length;j++)
			{
				var node1 = node.childNodes[j];
				if(node1.nodeName == "text")
				{
					me.StartTime.text = node1;
				}
				else if(node1.nodeName == "rect")
				{
					me.StartTime.rect = node1;
				}
			}
		}
		else if(node.classList.contains("SelectTime2"))//选择结束时间
		{
			for(var j=0;j<node.childNodes.length;j++)
			{
				var node1 = node.childNodes[j];
				if(node1.nodeName == "text")
				{
					me.EndTime.text = node1;
				}
				else if(node1.nodeName == "rect")
				{
					me.EndTime.rect = node1;
				}
			}
		}
		else if(node.classList.contains("Query"))//查询
		{
			for(var j=0;j<node.childNodes.length;j++)
			{
				var node1 = node.childNodes[j];
				if(node1.nodeName == "text")
				{
					me.Query.text = node1;
				}
				else if(node1.nodeName == "rect")
				{
					me.Query.rect = node1;
				}
			}
		}
	}
}
function ChartCurveDB(Dom,ChartID)
{
	var me = this;
	SvgChart.call(me,Dom,ChartID);
	me.MoveCount= 0;//未移动，所有坐标点在图表右边
	me.Time		= null;
	me.XHR		= null;
	me.bStop	= false;//查询停止
	me.bMsg		= false;//正在存入数据
	me.ReturnData 	= [];
	me.RemainData 	= [];
	me.data 		= [];
}
ChartCurveDB.prototype = new SvgChart();
ChartCurveDB.prototype.Init = function()
{
	var me = this;
	me.BaseInit();
	var Points = "";
	var Type;
	for(var i=0;i<me.Series.length;i++)
	{
		if(i == 0)
		{
			Points = me.Series[i].Serie.AssPoint.SendHis + ",";
			Type = me.Series[i].Serie.AssPoint.Type;
			me.Table = Type + "his";
		}
		else
		{
			if(i == me.Series.length-1)
			{
				Points += me.Series[i].Serie.AssPoint.SendHis;
			}
			else
			{
				Points += me.Series[i].Serie.AssPoint.SendHis + ",";
			}
			if(Type != me.Series[i].Serie.AssPoint.Type)
			{
				me.Destroy();
				alert("暂时不允许关联不同类型的点！");
				return;
			}
		}	
	}
	me.StrPoints = '{"' + me.Table + '":[' + Points + ']}';
	me.XMLHttpRequestInit();
}
//历史曲线画法
ChartCurveDB.prototype.DrawChart = function()
{
	var me = this;
	if(me.bStop)
	{
		me.bStop = false;
		me.QueryDom.setAttribute("fill","black");
		if(me.TimeId)	clearInterval(me.TimeId);//清除定时器
		return;//查询终止
	}
	var bflag = false;
	var Text = me.PoltPaper.XAxis.Text;
	if(me.MoveCount < Text.childNodes.length)
	{
		bflag = true;
		me.MoveCount++;
	}
	if(me.bMsg)//正在存入数据
	{
		return;
	}
	//更新曲线坐标
	for(var i=0;i<me.Series.length;i++)
	{
		if(me.Series[i].Value.ReturnValue.length > 0)
		{
			var Value = me.Series[i].Value.ReturnValue.shift();
			if(i == 0)
			{
				//更新时间
				var date = new Date(Value.Time);
				me.PoltPaper.XAxis.UpdateTimeEx(date);
			}
//			me.Series[i].Value.DeValues[me.Series[i].Value.DeValues.length-1].Value = +Value.Value;//更新最后一个值
			me.Series[i].UpdateValue(me,+Value.Value);
			me.Series[i].Draw(me.PoltPaper,me.MoveCount,bflag);
		}
		else
		{
			me.bStop = true;
		}
	}
}
ChartCurveDB.prototype.XMLHttpRequestInit = function()
{
	var me = this;
	if(me.XHR) me.XHR = null;
	var xhr;
	if (window.XMLHttpRequest)
	{// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr=new XMLHttpRequest();
	}
	else if (window.ActiveXObject)
	{// code for IE6, IE5
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.timeout = 8000;
	me.XhrUrl = "http://" + location.host + "/Api/request/_module/Hisdatalist/_action/loadMeasureResults";
	xhr.onreadystatechange = function()
	{
		if(this.readyState==4 && this.status==200)
		{
			if(!this.response.data) return;
			me.ReturnData = this.response.data;
			if(me.ReturnData < 1)	return;
			if(me.RemainData.length < 1)
			{
				me.RemainData = me.ReturnData;
			}	
			else
			{
				me.RemainData.concat(me.ReturnData);
			}
			if(me.RemainData.length < 1 && me.Count == 1)
			{
				alert("无数据记录！");
				return;
			}
			me.data = me.RemainData;
			me.RemainData = [];
			var LSeris = me.Series.length;		//曲线数目
			var LData = me.data.length;	//查询到的数据的数组长度
			var L = LData%LSeris;
			for(var i=0;i<L;i++)
			{
				me.RemainData[i] = me.data.pop();//多余的保存下来
			}
			if(me.data.length > 0)			//更新坐标轴点X轴的值和Y值
			{
				me.bMsg = true;
				var len2 = me.Series[0].Value.ReturnValue.length;
				for(var i=0;i<LSeris;i++)//将查询到的数据整理
				{
					for(var j=0;j<Math.floor(LData/LSeris);j++)//把时间和值保存下来
					{
						var obj = {};
						obj.Value = +me.data[j*LSeris+i].value;
						obj.Time = me.data[j*LSeris+i].rectime;
						me.Series[i].Value.ReturnValue[j+len2] = obj;
					}
				}
				if(me.Count == 1)
				{
					//点击后字体变色，停止后变回原色
					me.bStop	= false;
					me.QueryDom = me.evt.target;//.childNodes[1];
					me.QueryDom.setAttribute("fill","red");									
					me.FlushTime = MyConstant.getConstants("CURVEDB_FLUSHTIME");
					if(me.TimeId) clearInterval(me.TimeId);//清除定时器
					me.TimeId = setInterval(function(){me.DrawChart();},me.FlushTime);//启动定时器
				}
				me.bMsg = false;
			}
			if(me.Times.length > 0)
			{
				var temp = me.Times.shift();//获取并删除数组第一个元素
				var StrTime = "stime=" + temp.StartTime + "&etime=" + temp.StopTime;
				me.StrSend = StrTime + me.StrOthers;
				this.open("POST",me.XhrUrl,true,"admin","SMmanager");
				this.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
				this.responseType = 'json';
				this.send(me.StrSend);
			}
			me.Count++;
		}
	}
	me.XHR = xhr;
}

//历史曲线点击查询处理
//该函数的作用是从数据库获取历史数据，更新坐标轴的值，并设置的定时器显示曲线变化过程
function Chart_OnClickQueryDB(evt,TimeID)
{
	var arr = TimeID.split(/[_]/i);
	var STimeDom = document.getElementById(arr[0]);
	var ETimeDom = document.getElementById(arr[1]);
	var GraphID = arr[0].split(/[H]/i);
	var TempDom = document.getElementById("Chart"+GraphID[0]);//获取Dom
	var chart = GetSvgChart(TempDom);
	chart.MoveCount = 0;
	chart.evt = evt;
	for(var i=0;i<chart.Series.length;i++)
	{
		chart.Series[i].Value.ReturnValue = [];
	}
	if(chart.TimeId)	clearInterval(chart.TimeId);//清除定时器
	
	var StartTime = new Date(STimeDom.textContent);
	var StopTime = new Date(ETimeDom.textContent);
	var Span = Math.floor((StopTime.getTime() - StartTime.getTime())/MyConstant.getConstants("XHR_HISDATA_TIME"));
//	chart.PoltPaper.UpdateXAxisTime(StartTime);
	if(StartTime.getTime() > StopTime.getTime())//起始时间大于或等于结束时间
	{
		alert("查询的开始时间大于结束时间，请重新选择");
		return;
	}
	chart.Times = [];//将查询的时间划分为若干个时间段，避免等待耗时过长
	var start = STimeDom.textContent;
	for(var i=0;i<Span+1;i++)
	{
		var obj = {};
		obj.StartTime = start;
		if(i == Span)
		{
			obj.StopTime = ETimeDom.textContent;
		}
		else
		{
			obj.StopTime = AddTime(start,MyConstant.getConstants("XHR_HISDATA_TIME"));
			start = obj.StopTime;
		}
		chart.Times[i] = obj;
	}
	var table = '["' + chart.Table	+ '_' + ETimeDom.textContent.substr(0,4) + '_' + ETimeDom.textContent.substr(5,2) + '"]',
		point = chart.StrPoints,nStart = 0,nEnd = 3000;
	var	temp = chart.Times.shift();
	var StrTime = "stime=" + temp.StartTime + "&etime=" + temp.StopTime;
	chart.StrOthers = "&tables=" + table + "&points=" + point + "&start=" + nStart + "&limit=" + nEnd;
	chart.StrSend = StrTime + chart.StrOthers;
	chart.ReturnData = [],chart.RemainData = [],chart.data = [];
	chart.Count = 1;
	chart.XHR.open("POST",chart.XhrUrl,true,"admin","SMmanager");
	//xhr.open("POST","http://192.168.2.196/Api/request/_module/hisdatalist/_action/loadMeasureResults",true,"admin","SMmanager");
	chart.XHR.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");
	chart.XHR.responseType = 'json';
	chart.XHR.send(chart.StrSend);
	
}

//棒图
function ChartStick(Dom,ChartID)
{
	var me = this;
	SvgChart.call(me,Dom,ChartID);
}
ChartStick.prototype = new SvgChart();
ChartStick.prototype.Init = function()
{
	this.BaseInit();
}
ChartStick.prototype.Dynamic = function()
{
		var me = this;
//		var dom = me.PoltPaper.XAxis.Text;
		me.DynamicBase();
}
//棒图画法
ChartStick.prototype.DrawChart = function()
{
	var me = this;
	for(var i=0;i<me.Series.length;i++)
	{
		me.Series[i].Draw(me.PoltPaper);
	}
}
//饼图
function ChartPie(Dom,ChartID)
{
	var me = this;
	SvgChart.call(me,Dom,ChartID);
}
ChartPie.prototype = new SvgChart();
ChartPie.prototype.Init = function()
{
	this.BaseInit();
}
ChartPie.prototype.Dynamic = function()
{
		var me = this;
		me.DynamicBase();
}
//饼图画法
ChartPie.prototype.DrawChart = function()
{
	var me = this;
	var total = 0;
	var a = +me.Series[0].Serie.Points[2].substr(1),//椭圆X轴半径
		b = +me.Series[0].Serie.Points[3],
		x0 = +me.Series[0].Serie.Points[9].substr(1),//椭圆中心点
		y0 = +me.Series[0].Serie.Points[10],
		StartAngle = 0,
		SweepAngle,Angle,x,y,px,py,pAngle;
	for(var i=0;i<me.Series.length;i++)
	{
		var len = me.Series[i].Value.childNodes.length;
		var Value = +(me.Series[i].Value.DeValues[len-1].Value.toFixed(1));
		total += Value;
	}
	for(var i=0;i<me.Series.length;i++)
	{
		var value = +me.Series[i].Value.DeValues[len-1].Value;
		var percent = value/total.toFixed(4);
		SweepAngle = percent * 360;
		Angle = (StartAngle + SweepAngle)*Math.PI / 180;
		pAngle = (StartAngle + SweepAngle/2)*Math.PI / 180;
		if(percent >= 0.5)//弧度大于180度
		{
			me.Series[i].Serie.Points[5] = 1;
		}
		else
		{
			me.Series[i].Serie.Points[5] = 0;
		}
		if(i > 0)
		{
			me.Series[i].Serie.Points[0] = "M" + me.Series[i-1].Serie.Points[7];//起点坐标为前一个的终点坐标
			me.Series[i].Serie.Points[1] = me.Series[i-1].Serie.Points[8];
		}
		x = a*b*Math.cos(Angle) / Math.sqrt(a*a * Math.sin(Angle)*Math.sin(Angle) + b*b * Math.cos(Angle)*Math.cos(Angle));
		y = a*b*Math.sin(Angle) / Math.sqrt(a*a * Math.sin(Angle)*Math.sin(Angle) + b*b * Math.cos(Angle)*Math.cos(Angle));
		if(i != me.Series.length-1)//最后一个的终点坐标不变
		{
			me.Series[i].Serie.Points[7] = x + x0;
			me.Series[i].Serie.Points[8] = y + y0;
		}
		me.Series[i].Serie.setAttribute("d",me.Series[i].Serie.Points);
		px = a*b*Math.cos(pAngle) / Math.sqrt(a*a * Math.sin(pAngle)*Math.sin(pAngle) + b*b * Math.cos(pAngle)*Math.cos(pAngle));
		py = a*b*Math.sin(pAngle) / Math.sqrt(a*a * Math.sin(pAngle)*Math.sin(pAngle) + b*b * Math.cos(pAngle)*Math.cos(pAngle));
		if(percent > 0.08)
		{
			me.Series[i].Value.childNodes[0].setAttribute("x",px/2 + x0);
			me.Series[i].Value.childNodes[0].setAttribute("y",py/2 + y0);
			me.Series[i].Value.childNodes[1].setAttribute("x",px/2 + x0);
			me.Series[i].Value.childNodes[1].setAttribute("y",py/2 + y0 + 16);
		}
		else
		{
			me.Series[i].Value.childNodes[0].setAttribute("x",px + x0);
			me.Series[i].Value.childNodes[0].setAttribute("y",py + y0);
			me.Series[i].Value.childNodes[1].setAttribute("x",px + x0);
			me.Series[i].Value.childNodes[1].setAttribute("y",py + y0 + 16);
		}
		me.Series[i].Value.childNodes[0].textContent = value;//值
		me.Series[i].Value.childNodes[1].textContent = (percent*100).toFixed(2) + "%";//百分比
		
		StartAngle += SweepAngle;
	}
}





/**********************************配置的万力达SVG图形定义 end***************************/


/***************************************事件相应函数——start**************************/
//1.鼠标移动事件
//2.鼠标点击事件（左键单击和双击）
//
//图表日期图标
function Date_MouseOver(me)
{
	me.style.cursor = "auto";
}
//图表查询图标
function Query_MouseOver(me)
{
	me.style.cursor = "hand";
}
//图例图标
function Legend_MouseOver(me)
{
	me.style.cursor = "auto";
}
//图例系列图标
function LegendSymbol_MouseOver(me)
{
	me.style.cursor = "hand";
}
//图例名称图标
function LegendText_MouseOver(me)
{
	me.style.cursor = "hand";
}

//单击图例图符事件处理
function LegendSymbol_Click(id,SerisIndex)
{
	var TempDom = document.getElementById(id);
	var chart = GetSvgChart(TempDom);
	if(chart.Series[+SerisIndex].Serie.getAttribute("display") != "none")//曲线必须处于显示状态才能显示数值
	{
		if(chart.Series[+SerisIndex].Value.getAttribute("display") == "none")
		{
			chart.Series[+SerisIndex].Value.setAttribute("display","true");	
		}
		else
		{
			chart.Series[+SerisIndex].Value.setAttribute("display","none");	
		}
	}
}
//双击图例图符事件处理
function LegendSymbol_DbClick(id,SerisIndex)
{
	var me = this;
	//未处理
}
//单击图例文本事件处理
function LegendText_Click(id,SerisIndex)
{
	var TempDom = document.getElementById(id);
	var chart = GetSvgChart(TempDom);
	var bHide = true;
	if(chart.Series[+SerisIndex].Serie.getAttribute("display") == "none")
	{
		chart.Series[+SerisIndex].Serie.setAttribute("display","true");
		if(id.substr(5,3) != "Cur")//棒图或饼图
		{
			bHide = false;
			LegendSymbol_Click(id,SerisIndex);
		}
	}
	else
	{
		chart.Series[+SerisIndex].Serie.setAttribute("display","none");
	}
	if(bHide)
	{
		chart.Series[+SerisIndex].Value.setAttribute("display","none");			
	}
}
//双击图例文本事件处理
function LegendText_DbClick(id,SerisIndex)
{
	var me = this;
	//未处理
}
//曲线提示框——鼠标移动到曲线显示区域事件
function Chart_OnMousemove(evt,id)
{
	var i=0,me,MapX,MapY,xp,yp;//将屏幕上鼠标的坐标X转换为SVG中的坐标
	var TempDom = document.getElementById(id);
	var chart = GetSvgChart(TempDom);
	for(i=0;i<g_WldSvg.length;i++)
	{
		if(evt.target.ownerSVGElement == g_WldSvg[i].Dom)
		{
			me = g_WldSvg[i];
			break;
		}
	}
	if(i >= g_WldSvg.length) return;
	
	if((me.OffParentH != me.Dom.offsetParent.offsetHeight) || (me.OffParentW != me.Dom.offsetParent.offsetWidth))
	{
		me.OffParentH = me.Dom.offsetParent.offsetHeight;
		me.OffParentW = me.Dom.offsetParent.offsetWidth;
		me.OnSize();
	}
	if(typeof(me.Dom.attributes.transformx) != "undefined")
	{
		if(me.tx != +me.Dom.attributes.transformx.value || me.ty!= +me.Dom.attributes.transformy.value)
		{
			me.Move();
		}			
	}
	else
	{
		me.tx = me.ty = 0;
	}
	if(typeof(me.Dom.attributes.scalek) != "undefined")
	{
		if(me.Scalek != me.Dom.attributes.scalek.value)
		{
			me.Scale();
		}			
	}
	me.left = me.sumLeft - me.tx;
	me.top = me.sumTop - me.ty;
	me.Ratio = typeof(me.Ratio)!="undefined" ? me.Ratio : me.Rect.Ratio;
	
	MapX = (evt.clientX - me.left - (me.Rect.Width - me.ViewBox[2]*me.Ratio)/2)/me.Ratio;
	MapY = (evt.clientY - me.top - (me.Rect.Height - me.ViewBox[3]*me.Ratio)/2)/me.Ratio;
	
	if(MapX > chart.PoltPaper.OriginX && MapX < chart.PoltPaper.EndX && MapY > chart.PoltPaper.EndY && MapY < chart.PoltPaper.OriginY)//映射点在坐标轴上
	{
		//获取提示框
		if(chart.Prompt.Prompt)
		{
			var fir = evt.target.ownerDocument.getElementById(id + "Prompt").firstChild;
			var w = fir.width.animVal.value;
			var h = fir.height.animVal.value;
			xp = MapX;
			yp = MapY;
			if(MapX + w > evt.target.x.animVal.value + evt.target.width.animVal.value)
			{
				xp = MapX - w;
			}
			if(MapY + h > evt.target.y.animVal.value + evt.target.height.animVal.value)
			{
				yp = MapY - h;
			}
			chart.Prompt.Prompt.setAttribute("x",xp);
			chart.Prompt.Prompt.setAttribute("y",yp);
			chart.Prompt.Prompt.setAttribute("display","true");
			var tempDom = evt.target.ownerDocument.getElementById(id + "Prompt");
			var x1,x2;
			for(var k=0;k<chart.PoltPaper.XAxis.Text.childNodes.length;k++)
			{
				x1 = chart.PoltPaper.OriginX + k*chart.PoltPaper.PerGridX - chart.PoltPaper.PerGridX/2;
				x2 = x1 + chart.PoltPaper.PerGridX;
				if(MapX >= x1 && MapX < x2)//查找到鼠标所在的映射位置x
				{
					break;
				}
			}
			if(k >= chart.PoltPaper.XAxis.Text.length) return;
			var arr = new Array();
			if(tempDom.childNodes.length-1 == chart.Series.length+1)//如果显示X轴文本
			{
				for(var j=0;j< tempDom.childNodes.length-1;j++)
				{
					arr[j] = tempDom.childNodes[j+1].textContent.split(/[:]/i)[0];//第一个矩形元素不要
					if(j == tempDom.childNodes.length-2)
					{
						tempDom.childNodes[j+1].textContent = arr[j] + ": " + chart.PoltPaper.XAxis.Text.childNodes[k].textContent;//X轴文本
					}
					else
					{
						tempDom.childNodes[j+1].textContent = arr[j] + ": " + chart.Series[j].Value.childNodes[k].textContent;
					}
				}
			}
			else
			{
				for(var j=0;j< tempDom.childNodes.length-1;j++)
				{
					arr[j] = tempDom.childNodes[j+1].textContent.split(/[:]/i)[0];//第一个矩形元素不要
					tempDom.childNodes[j+1].textContent = arr[j] + ": " + chart.Series[j].Value.childNodes[k].textContent;
				}
			}
			if(chart.Prompt.Horizontal)
			{
				chart.Prompt.Horizontal.setAttribute("display","true");
				chart.Prompt.Horizontal.setAttribute("y1",MapY);
				chart.Prompt.Horizontal.setAttribute("y2",MapY);
			}
			if(chart.Prompt.Vertical)
			{
				chart.Prompt.Vertical.setAttribute("display","true");
				chart.Prompt.Vertical.setAttribute("x1",MapX);
				chart.Prompt.Vertical.setAttribute("x2",MapX);
			}
		}
	}
	else
	{
		if(chart.Prompt.Prompt) chart.Prompt.Prompt.setAttribute("display","none");
		if(chart.Prompt.Horizontal) chart.Prompt.Horizontal.setAttribute("display","none");
		if(chart.Prompt.Vertical) chart.Prompt.Vertical.setAttribute("display","none");
	}
}
//历史曲线刷新速度处理——点击图例事件
function Rect_Click(id)
{
	var flushTime = MyConstant.getConstants("CURVEDB_FLUSHTIME");
	FlushSpeed(id,flushTime);
}
function Rect_DbClick(id)
{
	var flushTime = MyConstant.getConstants("CURVEDB_FLUSHTIME")/2;
	FlushSpeed(id,flushTime);
}
function FlushSpeed(id,flushTime)
{
//	console.log(flushTime);
	var TempDom = document.getElementById(id);
	var chart = GetSvgChart(TempDom);
	if(chart.FlushTime == flushTime)//增加判断，避免多次重复点击的冗余
	{
		return;
	}
	chart.FlushTime = flushTime;
	if(chart.TimeId)
	{
		clearInterval(chart.TimeId);//清除定时器
		chart.TimeId = setInterval(function(){chart.DrawChart();},chart.FlushTime);//启动定时器
	}					
}
//鼠标移动变色
function Graph_MouseOver(me)
{
	var ContrlMap = me.getAttribute("contrlmap");//得到关联条目字符串
	if(ContrlMap)
	{
		var str = ContrlMap.replace(/'/g, '"');
		var Ass = JSON.parse(str);//将字符串转换为关联条目对象
		SetStyle(me,Ass.MouseOverColor);
	}
}
function Graph_MouseOut(me)
{
	if(me.classList.contains("svgtext"))
	{
		for(var i=0;i<me.childNodes.length;i++)
		{
			me.childNodes[i].setAttribute("mover",0);
		}
	}
	else
	{
		me.setAttribute("mover",0);
	}
}
function SetStyle(me,color)
{
	if(me.classList.contains("svgtext"))
	{
		for(var i=0;i<me.childNodes.length;i++)
		{
			me.childNodes[i].setAttribute("mover",1);
		}
	}
	else
	{
		me.setAttribute("mover",1);
	}
}

//窗口大小改变时触发事件函数
window.onresize = OnResize;
function OnResize()
{
	for(var i=0;i<g_WldSvg.length;i++)
	{
		g_WldSvg[i].SvgResize();
	}
}

/***************************************事件相应函数——end****************************/

/***************************************公用函数声明——start**************************/
function GetIdStr(index)
{
	var str;
	if(index == 1)
	{
		str = "Fir";
	}
	else if(index == 2)
	{
		str = "Sec";
	}
	else if(index == 3)
	{
		str = "Thi";
	}
	else if(index == 4)
	{
		str = "Fou";
	}

	return str;
}
//检查时间格式，自动添“0”；
function CheckTime(t){if(t<10){t="0"+t;}return t;}
//获取Svg对象
function GetSvg(dom)//dom为SVG节点
{
	for(i=0;i<g_WldSvg.length;i++)
	{
		if(g_WldSvg[i].Dom == dom)
		{
			return g_WldSvg[i];
		}
	}
}
//点击图元时传递当前点击的控制Dom对象的图元给函数
function GetSvgGraph(dom)
{
	for(i=0;i<g_WldSvg.length;i++)
	{
		if(g_WldSvg[i].Dom == dom.ownerSVGElement)
		{
			for(var j=0;j<g_WldSvg[i].Graphs.length;j++)
			{
				if(dom.id == g_WldSvg[i].Graphs[j].GraphID)
				{
					return g_WldSvg[i].Graphs[j];
				}
			}
		}
	}
}
function GetSvgChart(dom)
{
	for(i=0;i<g_WldSvg.length;i++)
	{
		if(g_WldSvg[i].Dom == dom.ownerSVGElement)
		{
			for(var j=0;j<g_WldSvg[i].Charts.length;j++)
			{
				if(dom.id == g_WldSvg[i].Charts[j].ChartID)
				{
					return g_WldSvg[i].Charts[j];
				}
			}
		}
	}
}

//在原来的时间上增加一定的时间，返回新的时间字符串，如：2017-03-17 14：00：00
function AddTime(time,increase)
{
	var seconds = Date.parse(time) + increase;
	var d = new Date(seconds);
	return d.getFullYear() + "-" + CheckTime(+d.getMonth()+1) + "-" + CheckTime(d.getDate()) + " " 
		+ CheckTime(d.getHours())+":" + CheckTime(d.getMinutes())+":" + CheckTime(d.getSeconds());
}
//曲线平滑处理函数（一）
function smooth(path,value)
{
    var path = path,
		newp = [path[0]],
		x = path[0][1],
		y = path[0][2],
		j,
		points,
		i = 1,
		ii = path.length,
		beg = 1,
		mx = x,
		my = y,
		pathi,
		pathil,
		pathim,
		pathiml,
		pathip,
		pathipl,
		begl,
		arrSmooth;
        
	for (; i < ii; i++)
	{
		pathi = path[i];
		pathil = pathi.length;
		pathim = path[i - 1];
		pathiml = pathim.length;
		pathip = path[i + 1];
		pathipl = pathip && pathip.length;
		if (pathi[0] == "M")
		{
			mx = pathi[1];
			my = pathi[2];
			j = i + 1;
			while (path[j][0] != "C"){j++;}
			newp.push(["M", mx, my]);
			beg = newp.length;
			x = mx;
			y = my;
			continue;
		}
		if (pathi[pathil - 2] == mx && pathi[pathil - 1] == my && (!pathip || pathip[0] == "M"))
		{
			begl = newp[beg].length;
			points = getAnchors(pathim[pathiml - 2], pathim[pathiml - 1], mx, my, newp[beg][begl - 2], newp[beg][begl - 1], value);
			newp[beg][1] = points.x2;
			newp[beg][2] = points.y2;
		}
		else if (!pathip || pathip[0] == "M")
		{
			points = 
			{
				x1: pathi[pathil - 2],
				y1: pathi[pathil - 1]
			};
		} else {
			points = getAnchors(pathim[pathiml - 2], pathim[pathiml - 1], pathi[pathil - 2], pathi[pathil - 1], pathip[pathipl - 2], pathip[pathipl - 1], value);
		}
		newp.push(["C", x, y, points.x1, points.y1, pathi[pathil - 2], pathi[pathil - 1]]);
		x = points.x2;
		y = points.y2;
	}
	
	var arr = newp;
	for(var m=0;m<arr.length;m++)
	{
		arr[m] = newp[m].join(" ");
	}
	arrSmooth = arr.join(",");
	
	return arrSmooth;
}
//曲线平滑处理函数（二）
function getAnchors(prevX, prevY, curX, curY, nextX, nextY, value)
{
	value = value || 4;
	var M = Math,
		PI = M.PI,
		halfPI = PI / 2,
		abs = M.abs,
		sin = M.sin,
		cos = M.cos,
		atan = M.atan,
		control1Length, control2Length, control1Angle, control2Angle,
		control1X, control1Y, control2X, control2Y, alpha;

	// Find the length of each control anchor line, by dividing the horizontal distance
	// between points by the value parameter.
	control1Length = Math.abs(curX - prevX) / value;
	control2Length = Math.abs(nextX - curX) / value;
	// Determine the angle of each control anchor line. If the middle point is a vertical
	// turnaround then we force it to a flat horizontal angle to prevent the curve from
	// dipping above or below the middle point. Otherwise we use an angle that points
	// toward the previous/next target point.
	if ((curY >= prevY && curY >= nextY) || (curY <= prevY && curY <= nextY)) {
		control1Angle = control2Angle = halfPI;
	} else {
		control1Angle = atan(Math.abs(curX - prevX) / abs(curY - prevY));
		if (prevY < curY) {
			control1Angle = PI - control1Angle;
		}
		control2Angle = atan(Math.abs(nextX - curX) / abs(curY - nextY));
		if (nextY < curY) {
			control2Angle = PI - control2Angle;
		}
	}

	// Adjust the calculated angles so they point away from each other on the same line
	alpha = halfPI - ((control1Angle + control2Angle) % (PI * 2)) / 2;
	if (alpha > halfPI) {
		alpha -= PI;
	}
	control1Angle += alpha;
	control2Angle += alpha;

	// Find the control anchor points from the angles and length
	curX = +curX;
	curY = +curY;
	if(curX > prevX)//正向
	{
		control1X = curX - control1Length * sin(control1Angle);
		control1Y = curY + (control1Length * cos(control1Angle));
		control2X = curX + control2Length * sin(control2Angle);
		control2Y = curY + control2Length * cos(control2Angle);	
	}
	else//反向
	{
		control1X = curX + control1Length * sin(control1Angle);
		control1Y = curY + (control1Length * cos(control1Angle));
		control2X = curX - control2Length * sin(control2Angle);
		control2Y = curY + control2Length * cos(control2Angle);	
	}

	// One last adjustment, make sure that no control anchor point extends vertically past
	// its target prev/next point, as that results in curves dipping above or below and
	// bending back strangely. If we find this happening we keep the control angle but
	// reduce the length of the control line so it stays within bounds.
	if ((curY > prevY && control1Y < prevY) || (curY < prevY && control1Y > prevY)) {
		control1X += abs(prevY - control1Y) * (control1X - curX) / (control1Y - curY);
		control1Y = +prevY;
	}
	if ((curY > nextY && control2Y < nextY) || (curY < nextY && control2Y > nextY)) {
		control2X -= abs(nextY - control2Y) * (control2X - curX) / (control2Y - curY);
		control2Y = +nextY;
	}
		control1X = +control1X.toFixed(1);
		control1Y = +control1Y.toFixed(1);
		control2X = +control2X.toFixed(1);
		control2Y = +control2Y.toFixed(1);
	return {
		x1: control1X,
		y1: control1Y,
		x2: control2X,
		y2: control2Y
	};
};
//测试用生成的随机数据
function GetTestDigital()
{
	return Math.random() > 0.5 ? 1 : 0;
}
//测试用生成的0--1000随机数
function GetTestAnalog()
{
	return Math.random() * 1000;
}
//文本类处理，返回文本对象
function DealWithText(Dom)
{
	var Text = {};
	for(var i=0;i<Dom.childNodes.length;i++)
	{
		if(Dom.childNodes[i].nodeName == "text")
		{
			Text.text = Dom.childNodes[i];
		}
		else if(Dom.childNodes[i].nodeName == "rect")
		{
			Text.rect = Dom.childNodes[i];
		}
		else if(Dom.childNodes[i].nodeName == "title")
		{
			Text.title = Dom.childNodes[i];
		}
	}
	return Text;
}
//极性处理
function DealWithPolar(Polar,value)
{
	if(Polar == 2)//负极性
	{
		if(value == 1)
		{
			value = 0;
		}
		else
		{
			value = 1;
		}
	}
	return value;
}
//处理关联条目越线报警状态通用
function DealWithLimitStatus(Status,Asi)
{
	var style;
	if(Status == 1)//一级越低限
	{
		style = Asi.DX;
	}
	else if(Status == 2)//一级越高限
	{
		style = Asi.GX;
	}
	else if(Status == 3)//二级越低限
	{
		style = Asi.DDX;
	}
	else if(Status == 4)//二级越高限
	{
		style = Asi.GGX;
	}
	else
	{
		style = Asi.Normal;
	}
	return style;
}
//处理关联条目开关量通用
function DealWithOnOff(value,Asi)
{
	var style;
	if(value == 1)
	{
		style = Asi.On;
	}
	else
	{
		style = Asi.Off;
	}
	return style;
}
//频率处理
function DealWithFrequency(Asi)
{
	var Fre = 0;
	if(+Asi.Fre == 0)//慢速
	{
		Fre = 600;
	}
	else if(+Asi.Fre == 1)//中速
	{
		Fre = 400;
	}
	else
	{
		Fre = 200;
	}
	return Fre;
}
/***************************************公用函数声明——end****************************/

/**********************************************************************
*下面是一个日历控件，用于历史曲线图表中开始时间和结束时间的选择
*选择的时候需注意：最后点击某日后日期才会更新，其他不会更新选择的时间
*
*最后修改日期：20160928
***********************************************************************/
//复杂的html日期选择控件
function L_calendar(){}  
L_calendar.prototype={  
    Moveable:true,  
    NewName:"",  
    insertId:"",  
    ClickObject:null,  
    InputObject:null,  
    InputDate:null,  
    IsOpen:false,  
    MouseX:0,  
    MouseY:0,  
    GetDateLayer:function(){
		var datelayer = document.getElementById('L_DateLayer').contentWindow;
		return datelayer;
    },  
    L_TheYear:new Date().getFullYear(), //定义年的变量的初始值  
    L_TheMonth:new Date().getMonth()+1,//定义月的变量的初始值  
    L_WDay:new Array(39),//定义写日期的数组  
    MonHead:new Array(31,28,31,30,31,30,31,31,30,31,30,31),            //定义阳历中每个月的最大天数 
	L_TheHour:new Date().getHours(),
	L_TheMin:new Date().getMinutes,
	L_TheSec:new Date().getSeconds,
    GetY:function(){  
        var el;  
        if (arguments.length > 0){  
            el==arguments[0];  
        }  
        else{  
            el=this.ClickObject;  
        }  
        if(el!=null){
    		return event.clientY + 12;
		}  
        else{return 0;}
        },  
    GetX:function(){  
        var el;  
        if (arguments.length > 0){
            el==arguments[0];
        }  
        else{  
            el=this.ClickObject;  
        }  
        if(el!=null){
			return event.clientX - 40;
		}  
        else{return 0;}  
        },  
    CreateHTML:function(){
        var htmlstr="";  
        htmlstr+="<div id=\"L_calendar\">\r\n";  
        htmlstr+="<span id=\"SelectYearLayer\" style=\"z-index: 19999;position: absolute;top: 3; left: 19;display: none\"></span>\r\n";  
        htmlstr+="<span id=\"SelectMonthLayer\" style=\"z-index: 19999;position: absolute;top: 3; left: 78;display: none\"></span>\r\n";
		htmlstr+="<span id=\"SelectHourLayer\" style=\"z-index: 19999;position: absolute;top: 24; left: 0;display: none\"></span>\r\n";
		htmlstr+="<span id=\"SelectMinLayer\" style=\"z-index: 19999;position: absolute;top: 24; left: 50;display: none\"></span>\r\n";
		htmlstr+="<span id=\"SelectSecLayer\" style=\"z-index: 19999;position: absolute;top: 24; left: 100;display: none\"></span>\r\n";
        htmlstr+="<div id=\"L_calendar-year-month\"><div id=\"L_calendar-PrevM\" onclick=\"parent."+this.NewName+".PrevM()\" title=\"前一月\"><b><</b></div>" + 
			"<div id=\"L_calendar-year\" onmouseover=\"style.backgroundColor='#FFD700'\" onmouseout=\"style.backgroundColor='white'\" onclick=\"parent."+this.NewName+".SelectYearInnerHTML('"+this.L_TheYear+"')\"></div>" + 
			"<div id=\"L_calendar-month\"  onmouseover=\"style.backgroundColor='#FFD700'\" onmouseout=\"style.backgroundColor='white'\" onclick=\"parent."+this.NewName+".SelectMonthInnerHTML('"+this.L_TheMonth+"')\"></div>" + 
			"<div id=\"L_calendar-NextM\" onclick=\"parent."+this.NewName+".NextM()\" title=\"后一月\"><b>></b></div></div>\r\n";  
        htmlstr+="<div id=\"L_calendar-hour-min-sec\"><div id=\"L_calendar-hour\" onmouseover=\"style.backgroundColor='#FFD700'\" onmouseout=\"style.backgroundColor='white'\" onclick=\"parent."+this.NewName+".SelectHourInnerHTML('"+this.L_TheHour+"')\"></div>" + 
			"<div id=\"L_calendar-min\"  onmouseover=\"style.backgroundColor='#FFD700'\" onmouseout=\"style.backgroundColor='white'\" onclick=\"parent."+this.NewName+".SelectMinInnerHTML('"+this.L_TheMin+"')\"></div>" + 
			"<div id=\"L_calendar-sec\"  onmouseover=\"style.backgroundColor='#FFD700'\" onmouseout=\"style.backgroundColor='white'\" onclick=\"parent."+this.NewName+".SelectSecInnerHTML('"+this.L_TheSec+"')\"></div>" + 
			"</div>\r\n"; 		
		htmlstr+="<div id=\"L_calendar-week\"><ul  onmouseup=\"StopMove()\"><li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li></ul></div>\r\n";  
        htmlstr+="<div id=\"L_calendar-day\">\r\n";  
        htmlstr+="<ul>\r\n";  
        for(var i=0;i<this.L_WDay.length;i++){  
            htmlstr+="<li id=\"L_calendar-day_"+i+"\" style=\"background:#e0e0e0\" onmouseover=\"this.style.background='#FFD700'\"  onmouseout=\"this.style.background='#e0e0e0'\"></li>\r\n";  
            }  
        htmlstr+="</ul>\r\n";  
        htmlstr+="<span id=\"L_calendar-today\" onclick=\"parent."+this.NewName+".Today()\"><b>Today</b></span>\r\n";  
        htmlstr+="</div>\r\n";  
//		htmlstr+="<div id=\"L_calendar-control\"></div>\r\n";  
        htmlstr+="</div>\r\n";  
        htmlstr+="<scr" + "ipt type=\"text/javas" + "cript\">\r\n";  
        htmlstr+="var MouseX,MouseY;";  
        htmlstr+="var Moveable="+this.Moveable+";\r\n";  
        htmlstr+="var MoveaStart=false;\r\n";  
        htmlstr+="document.onmousemove=function(e)\r\n";  
        htmlstr+="{\r\n";  
        htmlstr+="var DateLayer=parent.document.getElementById(\"L_DateLayer\");\r\n";  
        htmlstr+="  e = window.event || e;\r\n";  
        htmlstr+="var DateLayerLeft=DateLayer.style.posLeft || parseInt(DateLayer.style.left.replace(\"px\",\"\"));\r\n";  
        htmlstr+="var DateLayerTop=DateLayer.style.posTop || parseInt(DateLayer.style.top.replace(\"px\",\"\"));\r\n";  
        htmlstr+="if(MoveaStart){DateLayer.style.left=(DateLayerLeft+e.clientX-MouseX)+\"px\";DateLayer.style.top=(DateLayerTop+e.clientY-MouseY)+\"px\"}\r\n";  
        htmlstr+=";\r\n";  
        htmlstr+="}\r\n";  
          
        htmlstr+="document.getElementById(\"L_calendar-week\").onmousedown=function(e){\r\n";  
        htmlstr+="if(Moveable){MoveaStart=true;}\r\n";  
        htmlstr+="  e = window.event || e;\r\n";  
        htmlstr+="  MouseX = e.clientX;\r\n";  
        htmlstr+="  MouseY = e.clientY;\r\n";  
        htmlstr+="  }\r\n";  
          
        htmlstr+="function StopMove(){\r\n";  
        htmlstr+="MoveaStart=false;\r\n";  
        htmlstr+="  }\r\n";  
        htmlstr+="</scr"+"ipt>\r\n";  
        var stylestr="";  
        stylestr+="<style type=\"text/css\">";  
        stylestr+="body{background:#fff;font-size:12px;margin:0px;padding:0px;text-align:left}\r\n";  
        stylestr+="#L_calendar{border:1px solid blue;width:160px;padding:1px;height:200px;z-index:19998;text-align:center}\r\n";  
        stylestr+="#L_calendar-year-month{height:23px;line-height:23px;z-index:19998;}\r\n";  
        stylestr+="#L_calendar-year{line-height:23px;width:60px;float:left;z-index:19998;position: absolute;top: 3; left: 19;cursor:default}\r\n";  
        stylestr+="#L_calendar-month{line-height:23px;width:48px;float:left;z-index:19998;position: absolute;top: 3; left: 78;cursor:default}\r\n";  
        stylestr+="#L_calendar-PrevM{position: absolute;top: 3; left: 5;cursor:pointer}";
        stylestr+="#L_calendar-NextM{position: absolute;top: 3; left: 145;cursor:pointer}";
		//
		stylestr+="#L_calendar-hour-min-sec{height:23px;line-height:23px;z-index:19998;}\r\n";
		stylestr+="#L_calendar-hour{line-height:23px;width:48px;float:left;z-index:19998;position: absolute;top: 24; left: 5;cursor:default}\r\n";
		stylestr+="#L_calendar-min{line-height:23px;width:48px;float:left;z-index:19998;position: absolute;top: 24; left: 55;cursor:default}\r\n";
		stylestr+="#L_calendar-sec{line-height:23px;width:48px;float:left;z-index:19998;position: absolute;top: 24; left: 105;cursor:default}\r\n";
		//
        stylestr+="#L_calendar-week{height:23px;line-height:23px;z-index:19998;}\r\n";  
        stylestr+="#L_calendar-day{height:136px;z-index:19998;}\r\n";  
        stylestr+="#L_calendar-week ul{cursor:move;list-style:none;margin:0px;padding:0px;}\r\n";  
        stylestr+="#L_calendar-week li{width:20px;height:20px;float:left;;margin:1px;padding:0px;text-align:center;}\r\n";  
        stylestr+="#L_calendar-day ul{list-style:none;margin:0px;padding:0px;}\r\n";  
        stylestr+="#L_calendar-day li{cursor:pointer;width:20px;height:20px;float:left;;margin:1px;padding:0px;}\r\n";  
//		stylestr+="#L_calendar-control{height:25px;z-index:19998;}\r\n";  
        stylestr+="#L_calendar-today{cursor:pointer;float:left;width:63px;height:20px;line-height:20px;margin:1px;text-align:center;background:red}"  
        stylestr+="</style>";  
        var TempLateContent="<html>\r\n";  
        TempLateContent+="<head>\r\n";  
        TempLateContent+="<title></title>\r\n";  
        TempLateContent+=stylestr;  
        TempLateContent+="</head>\r\n";  
        TempLateContent+="<body>\r\n";  
        TempLateContent+=htmlstr;  
        TempLateContent+="</body>\r\n";  
        TempLateContent+="</html>\r\n";  
		
		var ifrdoc = document.getElementById('L_DateLayer').contentWindow.document;
		var s = TempLateContent;   		//进入可编辑模式前存好
		ifrdoc.designMode = "on";     	//文档进入可编辑模式
		ifrdoc.open();                	//打开流
		ifrdoc.write(s); 
		ifrdoc.close();              	//关闭流
		ifrdoc.designMode ="off";		//文档进入非可编辑模式
        },  
    InsertHTML:function(id,htmlstr){  
        var L_DateLayer=this.GetDateLayer();  
        if(L_DateLayer){L_DateLayer.document.getElementById(id).innerHTML=htmlstr;}  
		var str = L_DateLayer.document.getElementById(id).innerHTML;
        },  
    WriteHead:function (yy,mm,HH,MM,SS)  //往 head 中写入当前的年与月  
    {  
        this.InsertHTML("L_calendar-year",yy + " 年");  
        this.InsertHTML("L_calendar-month",mm + " 月");  
        this.InsertHTML("L_calendar-hour",HH + " 时"); 
        this.InsertHTML("L_calendar-min",MM + " 分");  
        this.InsertHTML("L_calendar-sec",SS + " 秒"); 
    },  
    IsPinYear:function(year)            //判断是否闰平年  
    {  
        if (0==year%4&&((year%100!=0)||(year%400==0))) return true;else return false;  
    },  
    GetMonthCount:function(year,month)  //闰年二月为29天  
    {  
        var c=this.MonHead[month-1];if((month==2)&&this.IsPinYear(year)) c++;return c;  
    },  
    GetDOW:function(day,month,year)     //求某天的星期几  
    {  
        var dt=new Date(year,month-1,day).getDay()/7; return dt;  
    },  
    GetText:function(obj){  
        if(obj.innerText){return obj.innerText}  
        else{return obj.textContent}  
        },  
    PrevM:function()  //往前翻月份  
    {  
        if(this.L_TheMonth>1){this.L_TheMonth--}else{this.L_TheYear--;this.L_TheMonth=12;}  
        this.SetDay(this.L_TheYear,this.L_TheMonth,this.L_TheHour,this.L_TheMin,this.L_TheSec);  
    },  
    NextM:function()  //往后翻月份  
    {  
        if(this.L_TheMonth==12){this.L_TheYear++;this.L_TheMonth=1}else{this.L_TheMonth++}  
        this.SetDay(this.L_TheYear,this.L_TheMonth,this.L_TheHour,this.L_TheMin,this.L_TheSec);  
    },  
    Today:function()  //Today Button  
    {  
        var today;  
        this.L_TheYear 	= new Date().getFullYear();  
        this.L_TheMonth = new Date().getMonth()+1;  
        today = new Date();  
        if(this.InputObject){  
			this.InputObject.textContent = CheckTime(this.L_TheYear) + "-" + CheckTime(this.L_TheMonth) + "-" + CheckTime(today.getDate()) + " " 
				+ CheckTime(today.getHours()) + ":" + CheckTime(today.getMinutes()) + ":" + CheckTime(today.getSeconds());  
        }  
        this.CloseLayer();  
    },  
    SetDay:function (yy,mm,HH,MM,SS)   //主要的写程序**********  
    {
		yy = +yy;
		mm = +mm;
		if(isNaN(HH)) HH = 0;
		if(isNaN(MM)) MM = 0;
		if(isNaN(SS)) SS = 0;
		HH = +HH;
		MM = +MM;
		SS = +SS;
        this.WriteHead(yy,mm,HH,MM,SS);  
        //设置当前年月的公共变量为传入值  
        this.L_TheYear	= yy;  
        this.L_TheMonth	= mm;
		this.L_TheHour	= HH;
		this.L_TheMin	= MM;
		this.L_TheSec	= SS;
        //当页面本身位于框架中时 IE会返回错误的parent
        if(window.top.location.href!=window.location.href){  
            for(var i_f=0;i_f<window.top.frames.length;i_f++){  
                if(window.top.frames[i_f].location.href==window.location.href){L_DateLayer_Parent=window.top.frames[i_f];}  
            }  
        }  
        else{
            L_DateLayer_Parent=window.parent;  
        }  
        for (var i = 0; i < 39; i++)
		{
			this.L_WDay[i] = "";//将显示框的内容全部清空  
		}
        var day1 = 1,day2=1,firstday = new Date(yy,mm-1,1).getDay();  //某月第一天的星期几
        for (i=0;i<firstday;i++)
		{
			this.L_WDay[i]=this.GetMonthCount(mm==1?yy-1:yy,mm==1?12:mm-1)-firstday+i+1  //上个月的最后几天 
		}
        for (i = firstday; day1 < this.GetMonthCount(yy,mm)+1; i++)
		{
			this.L_WDay[i] = day1;
			day1++;
		}  
        for (i=firstday+this.GetMonthCount(yy,mm);i<39;i++)
		{
			this.L_WDay[i]=day2;
			day2++
		}
        for (i = 0; i < 39; i++)  
        {  
			var bInMonth = false;
            var da = this.GetDateLayer().document.getElementById("L_calendar-day_"+i+"");  
            var month,day,hour,min,sec;  
            if (this.L_WDay[i]!="")  
            {
                if(i<firstday){  
                    da.innerHTML="<b style=\"color:gray\">" + this.L_WDay[i] + "</b>";  
                    month	= mm;
                    day		= this.L_WDay[i];
					hour	= HH;
					min		= MM;
					sec		= SS;
                }  
                else if(i>=firstday+this.GetMonthCount(yy,mm)){  
                    da.innerHTML="<b style=\"color:gray\">" + this.L_WDay[i] + "</b>";  
                    month	= mm;
                    day=this.L_WDay[i];
					hour	= HH;
					min		= MM;
					sec		= SS;
                }  
                else{
					bInMonth = true;
                    da.innerHTML="<b style=\"color:#000\">" + this.L_WDay[i] + "</b>";  
                    month	= mm;
                    day		= this.L_WDay[i];
					hour	= HH;
					min		= MM;
					sec		= SS;					
                    if(document.all){  
                        da.onclick=Function("L_DateLayer_Parent."+this.NewName+".DayClick("+month+","+day+","+hour+","+min+","+sec+")");  
                    }  
                    else{  
                        da.setAttribute("onclick","parent."+this.NewName+".DayClick("+month+","+day+","+hour+","+min+","+sec+")");  
                    }  
                }  
                da.title=month+" 月"+day+" 日";  
                da.style.background=(yy == new Date().getUTCFullYear()&&month==new Date().getUTCMonth()+1&&day==new Date().getUTCDate())? "#FFD700":"#e0e0e0";  
                if(this.InputDate!=null && bInMonth){ 
                    if(yy==this.InputDate.getUTCFullYear() && month==this.InputDate.getUTCMonth()+1 && day==this.InputDate.getUTCDate()){  
                        da.style.background="#0650D2";  
                    }  
                }  
            }  
        }  
    },  
    SelectYearInnerHTML:function (strYear) //年份的下拉框  
    {  
        if (strYear.match(/\D/)!=null){alert("年份输入参数不是数字！");return;}  
        var m = (strYear) ? strYear : new Date().getFullYear();  
        if (m < 1000 || m > 9999) {alert("年份值不在 1000 到 9999 之间！");return;}  
        var n = m - 10;  
        if (n < 1000) n = 1000;  
        if (n + 26 > 9999) n = 9974;  
        var s = "<select name=\"L_SelectYear\" id=\"L_SelectYear\" style='font-size: 12px' "  
            s += "onblur='document.getElementById(\"SelectYearLayer\").style.display=\"none\"' "  
            s += "onchange='document.getElementById(\"SelectYearLayer\").style.display=\"none\";"  
            s += "parent."+this.NewName+".L_TheYear = this.value; parent."+this.NewName+".SetDay(parent."+this.NewName+".L_TheYear,parent."+this.NewName+".L_TheMonth,parent."+this.NewName+".L_TheHour,parent."+this.NewName+".L_TheMin,parent."+this.NewName+".L_TheSec)'>\r\n";  
        var selectInnerHTML = s;  
        for (var i = n; i < n + 26; i++)
        {  
            if (i == m)  
            {selectInnerHTML += "<option value='" + i + "' selected>" + i + " 年" + "</option>\r\n";}  
            else {selectInnerHTML += "<option value='" + i + "'>" + i + " 年" + "</option>\r\n";}  
        }  
        selectInnerHTML += "</select>";  
        var DateLayer = this.GetDateLayer();  
        DateLayer.document.getElementById("SelectYearLayer").style.display="";  
        DateLayer.document.getElementById("SelectYearLayer").innerHTML = selectInnerHTML;  
        DateLayer.document.getElementById("L_SelectYear").focus();  
        },  
    SelectMonthInnerHTML:function (strMonth) //月份的下拉框  
    {  
        if (strMonth.match(/\D/)!=null){alert("月份输入参数不是数字！");return;}  
        var m = (strMonth) ? strMonth : new Date().getMonth() + 1;  
        var s = "<select name=\"L_SelectYear\" id=\"L_SelectMonth\" style='font-size: 12px' "  
            s += "onblur='document.getElementById(\"SelectMonthLayer\").style.display=\"none\"' "  
            s += "onchange='document.getElementById(\"SelectMonthLayer\").style.display=\"none\";"  
            s += "parent."+this.NewName+".L_TheMonth = this.value; parent."+this.NewName+".SetDay(parent."+this.NewName+".L_TheYear,parent."+this.NewName+".L_TheMonth,parent."+this.NewName+".L_TheHour,parent."+this.NewName+".L_TheMin,parent."+this.NewName+".L_TheSec)'>\r\n";  
        var selectInnerHTML = s;  
        for (var i = 1; i < 13; i++)
        {  
            if (i == m)  
            {selectInnerHTML += "<option value='"+i+"' selected>"+i+" 月"+"</option>\r\n";}  
            else {selectInnerHTML += "<option value='"+i+"'>"+i+" 月"+"</option>\r\n";}  
        }  
        selectInnerHTML += "</select>";  
        var DateLayer=this.GetDateLayer();  
        DateLayer.document.getElementById("SelectMonthLayer").style.display="";  
        DateLayer.document.getElementById("SelectMonthLayer").innerHTML = selectInnerHTML;  
        DateLayer.document.getElementById("L_SelectMonth").focus();  
    }, 
    SelectHourInnerHTML:function (strHour) //小时的下拉框  
    {  
        if (strHour.match(/\D/)!=null){alert("输入参数不是数字！");return;}  
        var h = (strHour) ? strHour : new Date().getHours();  
        var s = "<select name=\"L_SelectHour\" id=\"L_SelectHour\" style='font-size: 12px' "  
            s += "onblur='document.getElementById(\"SelectHourLayer\").style.display=\"none\"' "  
            s += "onchange='document.getElementById(\"SelectHourLayer\").style.display=\"none\";"  
            s += "parent."+this.NewName+".L_TheHour = this.value; parent."+this.NewName+".SetDay(parent."+this.NewName+".L_TheYear,parent."+this.NewName+".L_TheMonth,parent."+this.NewName+".L_TheHour,parent."+this.NewName+".L_TheMin,parent."+this.NewName+".L_TheSec)'>\r\n";  
        var selectInnerHTML = s;  
        for (var i = 0; i < 24; i++)  
        {  
            if (i == h)  
            {selectInnerHTML += "<option value='"+i+"' selected>"+i+" 时"+"</option>\r\n";}  
            else {selectInnerHTML += "<option value='"+i+"'>"+i+" 时"+"</option>\r\n";}  
        }  
        selectInnerHTML += "</select>";  
        var DateLayer=this.GetDateLayer();  
        DateLayer.document.getElementById("SelectHourLayer").style.display = "";  
        DateLayer.document.getElementById("SelectHourLayer").innerHTML = selectInnerHTML;
        DateLayer.document.getElementById("L_SelectHour").focus();  
    },
    SelectMinInnerHTML:function (strMin) //分的下拉框  
    {  
        if (strMin.match(/\D/)!=null){alert("输入参数不是数字！");return;}  
        var min = (strMin) ? strMin : new Date().getMinutes();  
        var s = "<select name=\"L_SelectHour\" id=\"L_SelectMin\" style='font-size: 12px' "  
            s += "onblur='document.getElementById(\"SelectMinLayer\").style.display=\"none\"' "  
            s += "onchange='document.getElementById(\"SelectMinLayer\").style.display=\"none\";"  
            s += "parent."+this.NewName+".L_TheMin = this.value; parent."+this.NewName+".SetDay(parent."+this.NewName+".L_TheYear,parent."+this.NewName+".L_TheMonth,parent."+this.NewName+".L_TheHour,parent."+this.NewName+".L_TheMin,parent."+this.NewName+".L_TheSec)'>\r\n";  
        var selectInnerHTML = s;  
        for (var i = 0; i < 60; i++)  
        {  
            if (i == min)  
            {selectInnerHTML += "<option value='"+i+"' selected>"+i+" 分"+"</option>\r\n";}  
            else {selectInnerHTML += "<option value='"+i+"'>"+i+" 分"+"</option>\r\n";}  
        }  
        selectInnerHTML += "</select>";  
        var DateLayer=this.GetDateLayer();  
        DateLayer.document.getElementById("SelectMinLayer").style.display = "";  
        DateLayer.document.getElementById("SelectMinLayer").innerHTML = selectInnerHTML;
        DateLayer.document.getElementById("L_SelectMin").focus();  
    },
	SelectSecInnerHTML:function (strSec) //秒的下拉框  
    {  
        if (strSec.match(/\D/)!=null){alert("输入参数不是数字！");return;}  
        var sec = (strSec) ? strSec : new Date().getMinutes();  
        var s = "<select name=\"L_SelectHour\" id=\"L_SelectSec\" style='font-size: 12px' "  
            s += "onblur='document.getElementById(\"SelectSecLayer\").style.display=\"none\"' "  
            s += "onchange='document.getElementById(\"SelectSecLayer\").style.display=\"none\";"  
            s += "parent."+this.NewName+".L_TheSec = this.value; parent."+this.NewName+".SetDay(parent."+this.NewName+".L_TheYear,parent."+this.NewName+".L_TheMonth,parent."+this.NewName+".L_TheHour,parent."+this.NewName+".L_TheMin,parent."+this.NewName+".L_TheSec)'>\r\n";  
        var selectInnerHTML = s;  
        for (var i = 0; i < 60; i++)  
        {  
            if (i == sec)  
            {selectInnerHTML += "<option value='"+i+"' selected>"+i+" 秒"+"</option>\r\n";}  
            else {selectInnerHTML += "<option value='"+i+"'>"+i+" 秒"+"</option>\r\n";}  
        }  
        selectInnerHTML += "</select>";  
        var DateLayer=this.GetDateLayer();  
        DateLayer.document.getElementById("SelectSecLayer").style.display = "";  
        DateLayer.document.getElementById("SelectSecLayer").innerHTML = selectInnerHTML;
        DateLayer.document.getElementById("L_SelectSec").focus();  
    },
    DayClick:function(mm,dd,hour,min,sec)  //点击显示框选取日期，主输入函数*************  
    {  
        var yy = this.L_TheYear;  
        //判断月份，并进行对应的处理  
        if(mm<1){yy--;mm=12+mm;}  
        else if(mm>12){yy++;mm=mm-12;}
        if(this.ClickObject)
        {
			if (!dd) {return;}
			this.InputObject.textContent = yy + "-" + CheckTime(mm) + "-" + CheckTime(dd) + " " + CheckTime(hour) + ":" + CheckTime(min) + ":" + CheckTime(sec); //注：在这里你可以输出改成你想要的格式  
			this.CloseLayer();  
        }  
        else {this.CloseLayer(); alert("您所要输出的控件对象并不存在！");}  
    },  
    SetDate:function(){  
        if (arguments.length <  1){alert("对不起！传入参数太少！");return;}  
        else if (arguments.length >  2){alert("对不起！传入参数太多！");return;}  
        this.InputObject = ((arguments.length==1) ? arguments[0] : arguments[1]).childNodes[1];
        this.ClickObject=arguments[0];  
        var reg = /^(\d+)-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/; 
		var r = this.InputObject.textContent.match(reg);
        if(r!=null){  
			var date = r[1] + "/" + r[2]+ "/" + r[3]+ " " + r[4]+ ":" + r[5]+ ":" + r[6];
			var d = new Date(date);
            if(d.getFullYear()==+r[1] && d.getMonth()==r[2]-1 && d.getDate()==+r[3]){  
                this.InputDate = d;       //保存外部传入的日期  
            }  
            else this.InputDate= "";  
            this.L_TheYear	= r[1];  
            this.L_TheMonth	= r[2];
			this.L_TheHour	= r[4]; 
			this.L_TheMin	= r[5]; 
			this.L_TheSec	= r[6]; 
        }  
        else{  
            this.L_TheYear	= new Date().getFullYear();  
            this.L_TheMonth	= new Date().getMonth() + 1;
			this.L_TheHour	= new Date().getHours();
			this.L_TheMin	= new Date().getMinutes;
			this.L_TheSec	= new Date().getSeconds;
        }  
        this.CreateHTML();
        var top		= this.GetY();  
        var left	= this.GetX();  
        var DateLayer=document.getElementById("L_DateLayer");
		var temp1 = DateLayer.style.top;
        DateLayer.style.top		= top + "px";// + this.ClickObject.clientHeight + 5 
        DateLayer.style.left	= left + "px";  
        DateLayer.style.display="block"; 
		var temp2 = DateLayer.style.top;
        if(document.all){  
            this.GetDateLayer().document.getElementById("L_calendar").style.width="160px";  
            this.GetDateLayer().document.getElementById("L_calendar").style.height="200px"  
            }  
        else{
			var calendar = this.GetDateLayer().document.getElementById("L_calendar");
            this.GetDateLayer().document.getElementById("L_calendar").style.width="156px";  
            this.GetDateLayer().document.getElementById("L_calendar").style.height="195px"  
            DateLayer.style.width="160px";  
            DateLayer.style.height="210px";  
            }  
        this.SetDay(this.L_TheYear,this.L_TheMonth,this.L_TheHour,this.L_TheMin,this.L_TheSec);  
    },  
    CloseLayer:function(){  
        try{  
            var DateLayer=document.getElementById("L_DateLayer");  
            if((DateLayer.style.display=="" || DateLayer.style.display=="block") && arguments[0]!=this.ClickObject && arguments[0]!=this.InputObject){  
                DateLayer.style.display="none";  
            }  
        }  
        catch(e){}  
    }  
}  
    
var L_DateLayer_Parent = null;  
var iframe = document.createElement('iframe');
iframe.id = "L_DateLayer"
iframe.name = "L_DateLayer";
iframe.setAttribute("frameborder","0");
var str = "display:none;position:absolute;width:160px;height:200px;z-index:19998;";
iframe.setAttribute("style",str);
var MyCalendar = new L_calendar();  
MyCalendar.NewName = "MyCalendar"; 

document.onclick = function(e)  
{
    e = window.event || e;  
    var srcElement = e.srcElement || e.target;  
    MyCalendar.CloseLayer(srcElement);  
}

function Chart_OnDateClick(evt,id)
{
	MyCalendar.SetDate(evt.target,id);
};

/***************************日历控件——End********************************/


