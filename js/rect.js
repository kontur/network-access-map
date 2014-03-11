/**
 * Basic geometry helper class
 *
 */

function Rect (x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

Rect.prototype.contains = function (point) {
	return (point.x > 0 && point.x < this.width && point.y > 0 && point.y < this.height);
}