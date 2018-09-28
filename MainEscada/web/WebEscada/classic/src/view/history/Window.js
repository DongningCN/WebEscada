/** 
 * 下行实时数据列表面板
 */
Ext.define('WebEscada.view.history.Window', {
	extend: 'Ext.container.Container',
    xtype:'history',
    requires : [
        'Ext.layout.container.Border'
    ],
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            cls         : 'module-history',
            iconCls     : 'history-icon',
            defaults    : {
                border  : false
            },
			layout: 'border',
			items: []
        });

        me.callParent();
    }
});