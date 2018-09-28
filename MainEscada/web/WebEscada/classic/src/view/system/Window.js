/** 
 * 下行实时数据列表面板
 */
Ext.define('WebEscada.view.system.Window', {
	extend: 'Ext.container.Container',
    xtype:'system',
    requires : [
        'Ext.layout.container.Border'
    ],
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            cls         : 'module-system',
            iconCls     : 'system-icon',
            defaults    : {
                border  : false
            },
			layout: 'border',
			items: []
        });

        me.callParent();
    }
});