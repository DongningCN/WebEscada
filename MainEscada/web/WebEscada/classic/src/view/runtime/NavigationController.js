Ext.define('WebEscada.view.runtime.NavigationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.runtime-navigation',
    
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
				this.Navigation(record);
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

	Navigation:function(record){
		var me = this;
		//销毁websocket

    	var navigation = this.getView();
    	var title = record.data.text;
    	var node = record.parentNode;
    	while(node){
    		if(node.data.text != "Root"){
    			title = node.data.text + "/" + title;
    		}
    		node = node.parentNode;
    	}
    	navigation.setTitle(record.data.text ? title : navigation.title);
//    	var strpath = URI.get(runtime,'read') + (type ? type : EscadaConfig.getDefaultNavigation("svg_diagram"));

	},
	
	onBeforerender: function(Component, eOpts){
		var dir = Ext.clone(EscadaConfig.getRuntimeDataNavigation());
		this.getView().getRootNode().appendChild(dir);
		//this.Navigation();
	}
	
});