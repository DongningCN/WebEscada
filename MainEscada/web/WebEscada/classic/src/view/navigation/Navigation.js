/*
 * 此类动态加载数据
 */

Ext.define('WebEscada.view.navigation.Navigation', {
    extend: 'Ext.tree.Panel',
    xtype: 'left-navigation',
   
    viewModel: 'main',
    rootVisible: false,//设置为不可见
    width: 250,
    minWidth: 25,
    split: true,
    collapsible: true,
    cls: 'main-left-navigation',
    bind: {
    	title: '主接线图'
    },
    listeners: {
    	itemexpand : 'onItemexpand',
    	select: 'onItemSelect'
    },
    activeModule: ''

});