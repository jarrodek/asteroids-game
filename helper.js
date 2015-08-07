/* global HTMLElement */

Object.prototype.bind = function(context){
    var slice = Array.prototype.slice;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    };
};

HTMLElement.prototype.detach = function(){
    if( this.parentNode === null ) return this;
    this.parentNode.removeChild(this);
    return this;
};


/**
 * Array Remove - By John Resig
 * Remove array elements
 *
 * If to param is not specified all alements till end will be removed
 *
 * @param from (int) start remove position
 * @param to (int) end remove position
 * @license (MIT Licensed)
 */
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

// Helper method for extending one object with another
function extend(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);

        if ( g || s ) {
            if ( g )
                a.__defineGetter__(i, g);
            if ( s )
                a.__defineSetter__(i, s);
         } else
             a[i] = b[i];
    }
    return a;
}
Math.rand = function(min,max){
    var rand = min+(Math.random()*(max-min));
    return Math.round(rand);
};
Math.toRadians = function(degrees){
    return degrees*Math.PI/180;
};
Math.toDegrees = function(radians){
    return radians*180/Math.PI;
};
/**
 * Zamienia radiany na stopnie przy czym
 * jest to wartość zawsze dodatnia z przedziału od 0 do 360.
 */
Math.toAbsDegrees = function(radians){
    return Math.abs( Math.toDegrees(radians) % 360 );
};