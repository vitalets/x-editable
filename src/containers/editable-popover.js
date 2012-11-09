/**
* Editable Popover 
* ---------------------
* requires bootstrap-popover.js
*/
(function ($) {

    //extend methods
    $.extend($.fn.editableContainer.Constructor.prototype, {
        containerName: 'popover',
        innerCss: '.popover-content p',

        option: function(key, value) {
            this.options[key] = value;
            this.container().options[key] = value; 
        },               

        /**
        * move popover to new position. This function mainly copied from bootstrap-popover.
        */
        setPosition: function () {     
            var popover = this.container(),
            $tip = popover.tip(), 
            inside = false, 
            placement, pos, actualWidth, actualHeight, tp;

            placement = typeof popover.options.placement === 'function' ? popover.options.placement.call(popover, $tip[0], popover.$element[0]) : popover.options.placement;

            pos = popover.getPosition(inside);

            actualWidth = $tip[0].offsetWidth;
            actualHeight = $tip[0].offsetHeight;

            switch (inside ? placement.split(' ')[1] : placement) {
                case 'bottom':
                    tp = {top:pos.top + pos.height, left:pos.left + pos.width / 2 - actualWidth / 2};
                    break;
                case 'top':
                    /* For Bootstrap 2.1.0 - 2.1.1: 10 pixels needed to correct popover position. See https://github.com/twitter/bootstrap/issues/4665 */
                    //if($tip.find('.arrow').get(0).offsetHeight === 10) {actualHeight += 10;}
                    tp = {top:pos.top - actualHeight, left:pos.left + pos.width / 2 - actualWidth / 2};
                    break;
                case 'left':
                    /* For Bootstrap 2.1.0 - 2.1.1: 10 pixels needed to correct popover position. See https://github.com/twitter/bootstrap/issues/4665 */
                    //if($tip.find('.arrow').get(0).offsetWidth === 10) {actualWidth  += 10;}
                    tp = {top:pos.top + pos.height / 2 - actualHeight / 2, left:pos.left - actualWidth};
                    break;
                case 'right':
                    tp = {top:pos.top + pos.height / 2 - actualHeight / 2, left:pos.left + pos.width};
                    break;
            }

            $tip.css(tp).addClass(placement).addClass('in');
        }  
    });

    //defaults
    $.fn.editableContainer.defaults = $.extend({}, $.fn.popover.defaults, $.fn.editableContainer.defaults, {
        content: ' '
    });    

}(window.jQuery));