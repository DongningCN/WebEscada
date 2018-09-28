/** 
 * 下行实时数据列表面板
 */
Ext.define('WebEscada.view.svg.Window', {
	extend: 'Ext.container.Container',
    xtype:'svg',
    requires : [
    	'WebEscada.view.svg.Svg',
        'Ext.layout.container.Border'
    ],
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            cls         : 'module-rtdblist',
            iconCls     : 'rtdblist-icon',
            defaults    : {
                border  : false
            },
			layout: 'border',
			items: [{
				xtype		: 'left-navigation',
	            itemId		: 'navigationPanel',
	            ui			: 'navigation',
	            id			: 'left_navigation',
	            cls			: 'esacada-navigation',
	            width		: 250,
	            region		: 'west'
            },{
				xtype		: 'svg-diagram',
				id			: 'svg_diagram',
                supportfullscreen : true,
	        	region		: 'center'
			}]
        });

        me.callParent();
    }
});