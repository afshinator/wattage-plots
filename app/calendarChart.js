// calendarChart.js
//
// 


var kwh = (function ($, my) {

    // This module/file global vars
    var width     = 960,
        height    = 136; // 68; // 136,
        cellSize  = 17; // 8; // 17; // cell size

    var day     = d3.time.format("%w"),
        week    = d3.time.format("%U"),
        format  = d3.time.format("%Y-%m-%d");



    // Used to draw svg path - date passed in is converted to path outline of month
    // Taken straight from beautiful D3 example code at : http://bl.ocks.org/mbostock/4063318
    function monthPath(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
          d0 = +day(t0), w0 = +week(t0),
          d1 = +day(t1), w1 = +week(t1);
      return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
          + "H" + w0 * cellSize + "V" + 7 * cellSize
          + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
          + "H" + (w1 + 1) * cellSize + "V" + 0
          + "H" + (w0 + 1) * cellSize + "Z";
    }




    // CalendarChart 
    // Each new instance will have its own domain, range, color fx, ...
    //
    my.CalendarChart = function(title, el, domainMin, domainMax) {
        var desc = title;
        var uiElt = el;
        var data = {};
        // Create a scale with a discrete (rather than continuous) range so we can map input to
        // a relatively small number of color options.  The range is one of 11 possible color values.
        var color = d3.scale.quantize()
            .domain([domainMin, domainMax])
            .range(d3.range(11).map(function(d) {             // map domain to one of 11 possible css color values
               //  my.log.msg('{color} d = ' + d + '::');       // output ranges to html here?
                return "q" + d + "-11";
            }));

        var rect;
        var min = domainMin;
        var max = domainMax;

        var highest = 0;
        var highestDay;         // string; will be what day had the highest total usage


        var svg = d3.select("body")
            .append("div")
            .attr("id", el)
            .append("h3").text(title)
            .selectAll("svg")
            .data(d3.range(my.app.beginYear, my.app.endYear))
            .enter()
            .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "RdYlGn")
            .append("g")
                .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");
        
        // Put year label to the left side of calendar, rotated 90 degress counter-clockwise
        svg.append("text")
            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .text(function(d) { return d; });

        // the grid outline of month & days
        rect = svg.selectAll(".day")
            .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) { return week(d) * cellSize; })
            .attr("y", function(d) { return day(d) * cellSize; })
            .datum(format);

        // Append the mouse-over title for each little box which represents a day
        rect.append("title")
            .text(function(d) { return d; });

        // Add the month outlines
        svg.selectAll(".month")
            .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("path")
            .attr("class", "month")
            .attr("d", monthPath);


        // called by the callback function that is triggered after reading the file
        function parseData( keyFx, rollupFx, csv ) {
            data = d3.nest()
                .key( keyFx )        // key is what is used ex the associative array that is going to be created
                .rollup( rollupFx )  // Summarizes all the leaf nodes in the nest
                .map( csv );
        }


        // call from callback fx after file read is read in & parsed
        function populateChart() {
            rect.filter(function(d) { return d in data; })
                // set the class on the box based on value of rollup function above        
                .attr("class", function(d) {
                  //my.log.msg( d + ' : ' + d3.round(data[d]) + ' --> ' + color(data[d]));
                  return "day " + color(d3.round(data[d]));
                  })
              .select("title")
              .text(function(d) { return d + ": " + d3.round(data[d],2); });   // set the svg title tag which becomes the mouseover text

              return this;
        }

        function outputResults() {
            d3.select('body').append("p").text('------ Max total usage : ' + d3.round(this.highest,2) + ' on ' + this.highestDay);
        }



        return {
            color   : color,            // fx that will return one of 11 classes to be applied to each day box
            desc    : desc,
            dmin    : domainMin,        // used to instantiate each chart, needed for color fx
            dmax    : domainMax,        // same as above
            data    : data,             // will hold the associative array that represents data read in
            el      : uiElt,
            svg     : svg,              // for D3
            rect    : rect,             // for D3
            highest : highest,
            highestDay: highestDay,
            parseData : parseData,
            populateChart : populateChart,
            outputResults : outputResults
        };

    };


    return my;
}(jQuery, kwh || {}));