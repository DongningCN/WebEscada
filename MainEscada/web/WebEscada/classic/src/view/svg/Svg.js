
Ext.define('WebEscada.view.svg.Svg',{
    extend: 'Ext.view.View',
    xtype:'svg-diagram',
    viewModel: {
        type: 'main'
    },

    svgRoot: {},
    controller: 'svg',
    bufferedRenderer: false,
    listeners: {
    	refresh  : 'onViewRefresh',
        click: {
            element: this, //bind to the underlying el property on the panel
            fn: 'onclick'
        }
    },
    keyMap: {
    	LEFT: 'onLeftKey',
    	RIGHT: 'onRightKey',
    	UP: 'onUpKey',
    	DOWN: 'onDownKey'
    },
	mapNav :[
	'<div id="svgtoolbar">',
		'<div id="svgnavigationtool">',
			'<div class="svg-toolbar-head">',
				'<div style="position: absolute; width: 50px; height: 50px; overflow: hidden;">',
					'<img class="svg-toolbar-background" dn="2" src=' + URI.getSvgToolbarImg() + '>',
				'</div>',
				'<div class="svg-toolbar-offset">',
					'<img src=' + URI.getSvgToolbarImg() + ' nofixpng="1" usemap="#runtimemap">',
					'<map name="runtimemap">',
						'<area href="javascript:void(0)" shape="poly" coords="25,-1,15,0,9,3,22,22,39,6,32,2" '
								+ 'onclick="Ext.getCmp(\'svg_diagram\').getController().OnCtrl(this,1);" title="向上平移">',
						'<area href="javascript:void(0)" shape="poly" coords="23,45,31,44,39,37,22,24,7,40,14,43" '
								+ 'onclick="Ext.getCmp(\'svg_diagram\').getController().OnCtrl(this,2);" title="向下平移">',
						'<area href="javascript:void(0)" shape="poly" coords="0,21,0,29,7,40,22,23,8,4,1,12" '
								+ 'onclick="Ext.getCmp(\'svg_diagram\').getController().OnCtrl(this,3);" title="向左平移">',
						'<area href="javascript:void(0)" shape="poly" coords="45,23,44,13,39,6,22,23,39,38,43,31" '
								+ 'onclick="Ext.getCmp(\'svg_diagram\').getController().OnCtrl(this,4);" title="向右平移">',
					'</map>',
				'</div>',
			'</div>',
			'<div class="svg-toolbar-restore" onclick="Ext.getCmp(\'svg_diagram\').getController().OnCtrl(this,0);" title="还原">',
				'<img src=' + URI.getSvgToolbarImg() + '>',
			'</div>',
			'<div class="svg-toolbar-magnify" onclick="Ext.getCmp(\'svg_diagram\').getController().OnCtrl(this,5);" title="放大">',
				'<img dn="2" src=' + URI.getSvgToolbarImg() + '>',
			'</div>',
			'<div class="svg-toolbar-reduce" onclick="Ext.getCmp(\'svg_diagram\').getController().OnCtrl(this,6);" title="缩小">',
				'<img dn="2" src=' + URI.getSvgToolbarImg() + '>',
			'</div>',
			'<div class="svg-toolbar-print" onclick="Ext.getCmp(\'svg_diagram\').getController().OnCtrl(this,7);" title="打印">',
				'<img src=' + URI.getSvgToolbarImg() + '>',
			'</div>',
			'<div class="svg-toolbar-main" onclick="Ext.getCmp(\'svg_diagram\').getController().OnCtrl(this,8);" title="主页">',
				'<img src=' + URI.getSvgToolbarImg() + '>',
			'</div>',
		'</div>',
		'<div id="diagram" class="svg-select" style="z-index: 1;" onmousedown="Ext.getCmp(\'svg_diagram\').getController().onDiagramMouseDown(event)" ' 
						+ 'onmouseup="Ext.getCmp(\'svg_diagram\').getController().onDiagramMouseUp(event)" '
						+ 'onmousemove="Ext.getCmp(\'svg_diagram\').getController().onDiagramMouseMove(event)">',
		'</div>',
	'</div>'
	],
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
			style        : {
				border          : '0px solid #e1e1e1',
				cursor          : 'crosshair'
//				overflow		: 'hidden'
			},
			tpl : [me.mapNav],
	        itemSelector : 'div.svg-select'
		});
        me.callParent();
    }
});
