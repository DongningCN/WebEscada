/** 
 * 下行实时数据列表面板
 */
Ext.define('WebEscada.view.device.Window', {
	extend: 'Ext.container.Container',
    xtype:'device',
    requires : [
        'Ext.layout.container.Border'
    ],
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            cls         : 'module-device',
            iconCls     : 'device-icon',
            defaults    : {
                border  : false
            },
			layout: 'border',
			items: []
        });

        me.callParent();
    }
});