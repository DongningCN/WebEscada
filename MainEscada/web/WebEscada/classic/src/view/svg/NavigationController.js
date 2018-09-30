Ext.define('WebEscada.view.svg.NavigationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.navigation',
    
    requires: [
    	'WebEscada.view.svg.Svg',
    	'WebEscada.view.svg.Navigation'
    ],
    
	/*
	 * 树节点点击事件响应函数
	 * 该函数根据所选节点的text,自动加载图形文件。
	 */
    onItemSelect: function(tree, record, index, eOpts){
		if (record.data.leaf){
			if(record.data.id && record.data.text) {
				this.Navigation(record.data.id,record.data.text);
			}
		}
    },
    //只展开当前选中项
    onItemexpand: function(node, eOpts){
    	var pre = node.previousSibling;
    	var next = node.nextSibling;
    	while(pre) {
    		pre.collapse();//上一节点收起
    		pre = pre.previousSibling;
    	}
    	while(next) {
    		next.collapse();//下一节点收起
    		next = next.nextSibling;
    	}
    },
    
	Navigation:function(filename){
		var me = this;
		//销毁websocket
		var diagram = {};
		var svgdom = document.getElementById('SvgMain');
		if(svgdom)
		{
			eGraph_DestroyWebsocket(svgdom);//销毁前svg节点的websocket
		}
    	var navigation = this.getView();
    	navigation.setTitle(filename?filename:navigation.title);
    	var strpath = URI.getEvg() + (filename ? filename : EscadaConfig.getDefaultNavigation("svg_diagram"));
		Ext.Ajax.request({
			method: 'POST',
		     url: strpath,
		     success: function(response, opts) {
		    	 var xmlDoc = response.responseXML;
			   		if(xmlDoc!=null)
		   			{
			   			var svg = Ext.getCmp('svg_diagram');
			   			svg.svgRoot = svgdom = xmlDoc.getElementsByTagName("svg")[0];
			   			svgdom.id = "SvgMain";
			   			if(svgdom != null && svgdom.childNodes && svgdom.childNodes.length > 0) 
		   				{
			   				diagram = document.getElementById("diagram");
			   				for(var i=0;i<diagram.children.length;i++){
			   					diagram.removeChild(diagram.children[i]);
			   				}
			   				diagram.appendChild(svgdom);
			   				svg.getController().rootInit(svgdom);
			   				eGraph_Dynamicload(svgdom);
		   				}
		   			}
		     },
		     failure: function(response, opts) {
		         console.log('server-side failure with status code ' + response.status);
		     }
		 });
	},
	onBeforerender: function(Component, eOpts){
		var dir = Ext.clone(EscadaConfig.getEvgFileNavigation());
		this.getView().getRootNode().appendChild(dir);
		this.Navigation();
	}
	
});