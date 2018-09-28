/** 
 * 下行实时数据列表面板
 */
Ext.define('WebEscada.view.report.Window', {
	extend: 'Ext.container.Container',
    xtype:'report',
    requires : [
        'Ext.layout.container.Border'
    ],
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            cls         : 'module-report',
            iconCls     : 'report-icon',
            defaults    : {
                border  : false
            },
			layout: 'border',
			items: []
        });

        me.callParent();
    }
});