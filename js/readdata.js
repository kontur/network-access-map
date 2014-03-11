
var pixelReader = (function () {

    var context;

    var init = function (ctx) {
        context = ctx;
    }

    var readPixels = function (width, height) {

        var imageData = context.getImageData(0, 0, width, height);
        var data = imageData.data;
        var pixels = [];

        for (var i = 1; i < width * height * 4; i += 4) {
            var row = Math.ceil(i / width / 4);
            var col = (Math.ceil(i / 4) + 1) % width + 1;


            var pixel = [
                data[i - 1], // r 
                data[i - 1 + 1], // g
                data[i - 1 + 2], // b
                data[i - 1 + 3], // a
            ];
            
            if (!pixels[row]) {
                pixels[row] = [];
            }
            if (!pixels[row][col]) {
                pixels[row][col] = [];
            }
            // console.log("pixel ", i, pixel, "col", col, "row", row);
            pixels[row][col] = pixel;

            // var level = getAlphaForPixel(col, row, width, height, data);
        }

        return pixels;
    }

    return {
        init: init,
        readPixels: readPixels
    }
})();



