/** 
 * 下行实时数据列表面板
 */
Ext.define('WebEscada.view.runtime.Window', {
	extend: 'Ext.container.Container',
    xtype:'runtime',
    requires : [
    	'WebEscada.view.runtime.Navigation',
    	'WebEscada.view.runtime.Runtime',
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
				xtype		: 'runtime-navigation',
	            itemId		: 'navigationPanel',
	            ui			: 'navigation',
	            id			: 'nav',
	            cls			: 'runtime-navigation',
	            width		: 250,
	            region		: 'west'
            },{
				xtype		: 'runtime-data',
				id			: 'runtime_data',
                supportfullscreen : true,
	        	region		: 'center'
			}]
        });

        me.callParent();
    }
});