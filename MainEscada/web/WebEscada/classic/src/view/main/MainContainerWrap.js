Ext.define('WebEscada.view.main.MainContainerWrap', {
    extend: 'Ext.container.Container',
    xtype: 'maincontainerwrap',

    requires : [
        'Ext.layout.container.HBox'
    ],

    scrollable: 'y',

    layout: 'border',

    beforeLayout : function() {
        var me = this,
            height = Ext.Element.getViewportHeight() - 64,
            navTree = me.getComponent('left_navigation');

        me.minHeight = height;

//        navTree.setStyle({
//            'min-height': height + 'px'
 //       });

        me.callParent(arguments);
    }
    
});
