
Ext.define('WebEscada.view.runtime.Runtime',{
    extend: 'Ext.grid.Panel',
    xtype:'runtime-data',
    
    requires: [
        'Ext.grid.Panel',
        'WebEscada.view.runtime.RuntimeModel',
        'WebEscada.view.runtime.RuntimeController'
    ],
    controller: 'runtime',
    viewModel: 'runtime',
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
			autoScroll : true,  
			store: null,
			columns: [],
			viewConfig: {
				getRowClass : function(record, rowIndex,rowParams, store) {
					if (rowIndex % 2 == 0) {
						return 'two-row';
					} else {
						return 'one-row';
					}
				}
			},
			invalidateScrollerOnRefresh: false,
			layout:'fit',
			tbar: {
			    xtype: 'toolbar',
				ui:'normal',
			    items: [{
					xtype     : 'textfield',
					fieldLabel: "名称/描述",
					labelWidth : 80,
					emptyText : '使用|进行多项分隔',
					flex	  : 1
				},{
					text	  : '查询',
					tooltip   : '查询名称或描述中包含关键字的信息',
					iconCls   : 'ux-icon-search'
				},'-',{
					tooltip   : '打印',
					action    :　'print',
					iconCls   : 'ux-icon-print'
				}]
			},	
			bbar:{
				xtype:'pagingtoolbar',
				ui:'normal',
    			store: null,
    			displayInfo: true,
    			displayMsg: '当前显示记录: {0} - {1} 共计: {2}',
    			emptyMsg: "没有记录可以显示"
			}
        });
        
        me.callParent();
    }
});
