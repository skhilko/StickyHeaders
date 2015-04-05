/* global WheelEvent */
'use strict';

var SCROLL_WIDTH = (function() {
    var scrollDiv = document.createElement('div');
    scrollDiv.className = 'js-scrollbar-measure';
    document.body.appendChild(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
})();

var SCROLL_STEP_DEFAULT = 50;
var LINE_HEIGHT = 16;

/**
 * This plugin enables sticky section headings on a list element.
 *
 * Supported browsers: Chrome, FF, Safari, IE11+
 *
 * @param el - list dom element
 * @param options - an option object. Supports:
 *   - headerSelector - a selector string matching header elements
 */
function StickyHeaders(el, options) {
    this.element = el;
    this.options = options;
    this.stuckHeadersHeight = 0;
    this._updating = false;

    var listOffset = el.getBoundingClientRect().top;

    // this.headers contains clone elements references and cached dimensions for faster scroll handling
    this.headers = Array.prototype.map.call(el.querySelectorAll(this.options.headerSelector), (function(header, i) {
        var clientRect = header.getBoundingClientRect();
        var clone = header.cloneNode(true);
        clone.classList.add('sticky-header', 'is-stuck');
        // explicitly define the height for the clone, just in case it was applied on the original element
        // via a selector which is no longer affecting the clone
        //
        clone.style.height = clientRect.height + 'px';
        // TODO all clones must be of equal height
        this.headerContainerHeight = clientRect.height;

        clone.dataset.index = i;
        return {
            top: clientRect.top - listOffset,
            bottom: clientRect.bottom - listOffset,
            height: clientRect.height,
            el: clone
        };
    }).bind(this));

    this._createHeaderContainer();

    el.addEventListener('scroll', this.onScroll.bind(this));
}

StickyHeaders.prototype._createHeaderContainer = function() {
    var header = document.createElement('div');
    header.className = 'sticky-container';

    var headerWrap = document.createElement('div');
    headerWrap.className = 'sticky-container-inner';
    headerWrap.style.right = SCROLL_WIDTH + 'px';
    headerWrap.style.height = this.headerContainerHeight + 'px';
    header.appendChild(headerWrap);

    var headerContainer = this.headerContainer = document.createElement('div');
    headerWrap.appendChild(headerContainer);

    header.addEventListener('click', this.onHeaderActivate.bind(this));
    header.addEventListener('wheel', this.onHeaderScroll.bind(this));

    this.element.parentNode.insertBefore(header, this.element);
};

StickyHeaders.prototype.onHeaderActivate = function(ev) {
    if (ev.target.classList.contains('is-stuck')) {
        var index = parseInt(ev.target.dataset.index, 10);
        var targetHeader = this.headers[index];
        var scrollOffset = 0;
        for (var i = 0; i <= index; i++) {
            scrollOffset += this.headers[i].height;
        }

        // Scrollable area is reduces by the height of stuck headers.
        // Need to account for that when jumping to the new position.
        this.element.scrollTop = targetHeader.bottom - scrollOffset;
    }
};

StickyHeaders.prototype.onScroll = function() {
    this._latestKnownScrollTop =  this.element.scrollTop;
    this._requestUpdate();
};

StickyHeaders.prototype._requestUpdate = function() {
    if(!this._updating) {
        setTimeout(this.updateHeaders.bind(this), 0);
        this._updating = true;
    }
};

StickyHeaders.prototype.updateHeaders = function() {
    var scrollTop = this._latestKnownScrollTop;
    var shiftAmount = 0;

    this.headers.forEach(function(header) {
        if (!header.el.parentNode) {
            if (header.top <= scrollTop) {
                this.headerContainer.appendChild(header.el);
                this.stuckHeadersHeight -= header.height;
            }
        } else if (header.el.parentNode) {
            if (header.top >= scrollTop) {
                this.headerContainer.removeChild(header.el);
                this.stuckHeadersHeight += header.height;
            }
        }

        if (this.isWithinHeaderContainer(header, scrollTop)) {
            // the distance between the top of the scrollable area and the header top
            // minus the height of the header container gives the shift amount
            // for the stuck headers on in order to have an effect of a 'replacement'
            // of the old header with a new one
            shiftAmount = (header.top - scrollTop) - this.headerContainerHeight;
        }
    }, this);

    shiftAmount += this.stuckHeadersHeight + this.headerContainerHeight;

    requestAnimationFrame(function(containerOffset) {
        this.headerContainer.style.transform = 'translateY(' + containerOffset + 'px)';
        this._updating = false;
    }.bind(this, shiftAmount));
};

StickyHeaders.prototype.onHeaderScroll = function(ev) {
    var scrollDelta = 0;
    switch (ev.deltaMode) {
        case WheelEvent.DOM_DELTA_PIXEL:
            scrollDelta = ev.deltaY;
            break;
        case WheelEvent.DOM_DELTA_LINE:
            scrollDelta = LINE_HEIGHT * ev.deltaY;
            break;
        default:
            scrollDelta = SCROLL_STEP_DEFAULT;
    }
    this.element.scrollTop += scrollDelta;
    // prevent the viewport from scrolling
    ev.preventDefault();
};

StickyHeaders.prototype.isWithinHeaderContainer = function(header, scrollTop) {
    return header.top > scrollTop && header.top <= this.headerContainerHeight + scrollTop;
};
