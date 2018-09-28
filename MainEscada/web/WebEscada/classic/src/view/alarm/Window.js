/** 
 * 下行实时数据列表面板
 */
Ext.define('WebEscada.view.alarm.Window', {
	extend: 'Ext.container.Container',
    xtype:'alarm',
    requires : [
        'Ext.layout.container.Border'
    ],
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            cls         : 'module-alarm',
            iconCls     : 'alarm-icon',
            defaults    : {
                border  : false
            },
			layout: 'border',
			items: []
        });

        me.callParent();
    }
});