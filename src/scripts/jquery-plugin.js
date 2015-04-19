var pluginName = 'stickyHeaders';

function Plugin(element, options) {
    this.element = element;
    this.options = options;
    this.init();
}

Plugin.prototype.init = function() {
    this.widget = new StickyHeaders(this.element, this.options);
};

Plugin.prototype.destroy = function() {
    this.widget.destroy();
    $.removeData(this.element, 'plugin_' + pluginName);
    this.element = null;
};

$.fn[pluginName] = function(options) {
    var args = arguments;
    var dataKey = 'plugin_' + pluginName;
    if (options === undefined || typeof options === 'object') {
        return this.each(function() {
            if (!$.data(this, dataKey)) {
                $.data(this, dataKey, new Plugin(this, options));
            }
        });
    } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
        return this.each(function() {
            var instance = $.data(this, dataKey);
            if (instance instanceof Plugin) {
                // call with the widget instance if not on the plugin
                if(!$.isFunction(instance[options]) && $.isFunction(instance.widget[options])) {
                    instance = instance.widget;
                }
                instance[options].apply(instance, Array.prototype.slice.call(args, 1));
            }
        });
    }
};
