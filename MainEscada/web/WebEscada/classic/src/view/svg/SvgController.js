Ext.define('WebEscada.view.svg.SvgController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.svg',

    rootInit: function(svgdom){
    	var me = this;
    	var root = me.getView().svgRoot;
    		root.setAttribute("width", "100%");
    		root.setAttribute("height", "100%");
    		root.setAttribute("transformx","0");
    		root.setAttribute("transformy","0");
    		root.setAttribute("scalek","1");
			me.initSvg(null,svgdom,"evg");
    },
    /***********图形控制工具操作项**********/
	OnCtrl:function( t,flag ){
		var me = this;
		switch(flag){
			case 0:{ // 还原
				me.Ctrl_Restore();
				break;
			}
			case 1:{ // 向上
				me.SvgOffset("up");
				break;
			}
			case 2:{ // 向下
				me.SvgOffset("down");
				break;
			}
			case 3:{ // 向左
				me.SvgOffset("left");
				break;
			}
			case 4:{ // 向右
				me.SvgOffset("right");
				break;
			}
			case 5:{ // 放大 
				me.Ctrl_Magnify();
				break;
			}
			case 6:{ // 缩小 
				me.Ctrl_Reduce();
				break;
			}
			case 7:{ // 打印 
				me.Ctrl_Print();
				break;
			}
			case 8:{ // 主页 
				me.Ctrl_Main();
				break;
			}
		}
	},
    makeTransform: function(svgRoot){	
		var cx = 0-parseFloat(svgRoot.getAttribute("transformx"));
		var cy = 0-parseFloat(svgRoot.getAttribute("transformy"));
		var k = svgRoot.getAttribute("scalek");
		var matrix = "matrix("+k+",0,0,"+k+","+cx+","+cy+")";
		if (Ext.isChrome){
			$(svgRoot).css('-webkit-transform',matrix);
		}else{
			$(svgRoot).css('transform',matrix);
		}
    },
    //SVG接线图在水平或者垂直方向偏移，micro：是否是微调
    SvgOffset: function(direction,micro){
		var me = this,height = 0,width = 0,ofsetX = 0,ofsetY = 0;
		var svgRoot = me.getView().svgRoot;
    	if(direction == "left" || direction == "right"){
    		if(direction == "left"){
    			width = svgRoot.viewBox.animVal.width;
    		}else{
    			width = - svgRoot.viewBox.animVal.width;
    		}
    		ofsetX = parseFloat(svgRoot.getAttribute("transformx")) + (micro ? width/100 : width/10);
    		svgRoot.setAttribute("transformx",ofsetX);
    	}else{
    		if(direction == "up"){
    			height = svgRoot.viewBox.animVal.height;
    		}else{
    			height = - svgRoot.viewBox.animVal.height;
    		}
    		ofsetY = parseFloat(svgRoot.getAttribute("transformy")) + (micro ? height/100 : height/10);
    		svgRoot.setAttribute("transformy",ofsetY);
    	}
    	me.makeTransform(svgRoot);
    },
	Ctrl_Restore:function(){
		var me = this;
		var view = me.getView();
		var svgRoot = view.svgRoot;
		svgRoot.setAttribute("transformx","0");
		svgRoot.setAttribute("transformy","0");
		svgRoot.setAttribute("scalek","1");
		me.makeTransform(svgRoot);
	},
	Ctrl_Magnify:function(){
		var me = this;
		var view = me.getView();
		var svgRoot = view.svgRoot;
		if(parseFloat(svgRoot.getAttribute("scalek")) > 5) return;
		var Scale =  0.2; 
		var k = parseFloat(svgRoot.getAttribute("scalek"))*(1 + Scale);
		svgRoot.setAttribute("scalek",k);
		me.makeTransform(svgRoot);
	},
	Ctrl_Reduce:function(){
		var me = this;
		var view = me.getView();
		var svgRoot = view.svgRoot;
		if(parseFloat(svgRoot.getAttribute("scalek")) <= 0.5) return;
		var Scale =  -0.2; 
		var k = parseFloat(svgRoot.getAttribute("scalek"))*(1 + Scale);
		svgRoot.setAttribute("scalek",k);
		me.makeTransform(svgRoot);
	},
	Ctrl_Print:function(){
		var me = this;
		var win = me.getView();
//		$(win.getEl().dom).jqprint({debug: true});
	},
	Ctrl_Main:function(){
		var me = this;
   		me.Navigation('main');
	},
	Navigation:function(filename){
		this.getView().findParentByType('app-main').getController().Navigation(filename);
	},
	/***********图形控制鼠标拖动图形事件项**********/
	onDiagramMouseUp:function( evt ){
		var me = this;
		var view = me.getView();
		if (view.isMoveing){
			view.isMoveing = false;
			view.isScaling = false;
		    view.el.setStyle('cursor','crosshair');
		}
	},
	onDiagramMouseDown:function( evt ){
		var me = this;
		var view = me.getView();
		view.isMoveing = true;
		view.isScaling = false;
		view.prePoint = [evt.pageX,evt.pageY];
	    view.el.setStyle('cursor','move');
	},
	onDiagramMouseMove:function( evt ){
		var me = this;
		var view = me.getView();
		var svgRoot = view.svgRoot;
		if (view.isMoveing){
			// 获取客户大小
			var width = svgRoot.viewBox.animVal.width;
			var height = svgRoot.viewBox.animVal.height;
			var detXY = [view.prePoint[0] - evt.pageX,view.prePoint[1] - evt.pageY];
			var x = parseFloat(svgRoot.getAttribute("transformx")) + detXY[0];
			var y = parseFloat(svgRoot.getAttribute("transformy")) + detXY[1];
			view.prePoint = [evt.pageX,evt.pageY];
			svgRoot.setAttribute("transformx",x);
			svgRoot.setAttribute("transformy",y);
			me.makeTransform(svgRoot);
		}
	},
	/***********图形控制鼠标点击图形事件项**********/
	/**
	 * 初始化图元点击事件
	 * @param htmlelement svgRoot - svg标签节点
	 * @param string type - 图形文件类型
     * @param object opt  - 回调对象
	 */
    initClick:function(svgRoot,type,opt){
    	var me = this;
    	if (type == "evg"){
   			me.initClick_evg(svgRoot,opt);
    	}else{
    		
    	}
    },
    /**
     * 初始化图元单击事件
     * @param {} svgRoot
     * @param {} opt
     */
    initClick_evg:function(svgRoot,opt){
    	var me = this;
    	var clickevent = Ext.Object.merge({
    		click:null,
    		scope:me
    	}, opt);
    	$(svgRoot).find('[click]').each(function(){
    		var contrlMap = $(this).attr('contrlMap') || $(this).attr('contrlmap');
    		contrlMap = Ext.JSON.decode(contrlMap);
    		$(this).click(function(evt){
    			Ext.callback(clickevent.click,
    				clickevent.scope,
    				[evt,$(this).attr('click'),$(this).attr('class'),
    					(contrlMap && contrlMap.RemoteCtrl && contrlMap.RemoteCtrl.point)? 

contrlMap.RemoteCtrl.point : null,
    					(contrlMap && contrlMap.RemoteCtrl && contrlMap.RemoteCtrl.ykSrc)? 

contrlMap.RemoteCtrl.ykSrc : null]);
    		});
		});
    },
    onSvgClick:function(evt,func,cls,evtpoint,subdiagram){
    	var me = this;
		switch (func){
			case 'func-toolbar':{
//    			me.showMenu(evt,'Webdesktop.view.rtcontrol.FunctionmenuAll',cls,evtpoint,subdiagram);
				break;
			}
			//弹出遥控条
			case 'func-yktoolbar':{
				console.log('func-yktoolbar');
//    			me.showMenu(evt,'Webdesktop.view.rtcontrol.FunctionmenuYK',cls,evtpoint,subdiagram);
				break;
			}
			//弹出遥控合窗口
			case 'func-yk-on':{
//    			me.showMenu(evt,'Webdesktop.view.rtcontrol.FunctionmenuYKON',cls,evtpoint,subdiagram);
				break;
			}
			//弹出遥控分窗口
			case 'func-yk-off':{
//    			me.showMenu(evt,'Webdesktop.view.rtcontrol.FunctionmenuYKOFF',cls,evtpoint,subdiagram);
				break;
			}
			default:{
				//弹出关联的evg图
				me.Navigation(func);
				break;	
			}
		}
    },
	onViewRefresh : function(view, eOpts) {
		//未用
	},
    initSvg:function(e,target,type){
    	var me = this;
		var view = me.getView();
    	if (!target) return;
    	// 初始化视口大小
    	var svgRoot = target || e.target ;
    	view.svgRoot = svgRoot;
    	view.svgType = type;
    	// 加载click
    	me.initClick(svgRoot,type,{
    		click     : me.onSvgClick,
    		scope     : me
    	});
    },
    
	onclick:function(me, record, item, index, e, eOpts){
		alert("onItemclick");
	},
	onLeftKey:function(){
		this.SvgOffset("left",true);
	},
	onRightKey:function(){
		this.SvgOffset("right",true);
	},
	onUpKey:function(){
		this.SvgOffset("up",true);
	},
	onDownKey:function(){
		this.SvgOffset("down",true);
	}
    	
});