// calHeatChart.js - Calendar Heat Chart object for use with D3 framework, by Afshin Mokhtari
//
// Inspired by: http://bl.ocks.org/mbostock/4063318


var kwh = (function ($, my) {

    // The base Chart object - 
    // All the things every type of chart will need
    my.Chart = function( name, el, w, h ) {
        this.name = name;       // string
        this.el = el;           // DOM element to attach it to
        this.width = w;
        this.height = h;

        this.color = undefined;
        this.svg = undefined;
        this.data = undefined;
    };



    // Calendar Heat Chart is a type of Chart
    // These are all the things each Cal. Heat Chart will need
    // 
    my.CalHeatChart = function ( el, w, h, c, name ) {
        my.Chart.call(this, name, el, w, h);     // or more generically apply( this, Array.prototype.slice.call( arguments ) );
        my.inheritPrototype( my.CalHeatChart, my.Chart );       // 'inherit' all Chart properties & methods

        this.cellsize = c;
        this.rect = undefined;                  // for D3

        this.day = d3.time.format("%w");        // for monthPath()
        this.week = d3.time.format("%U");
        this.format = d3.time.format("%Y-%m-%d");

        this.extents = undefined;       // min,max values of data, (kwh & year) set in setData() method
        this.color = undefined;         // will be a method to map kwh data to a css class for color


        // Assumes data is key-val pairs where keys are dates, vals are kwh totals
        // Returns object holding min and max vals for kwh and year
        this.setData = function( processedData ) {
            function findExtents( data ) {
                var min = 99999,
                    max = 0,
                    minDay,
                    maxDay;

                var minYear = 9999,
                    maxYear = 0,
                    currentYear;

                if ( typeof data === 'object' ) {
                    for (var key in data) {
                        if (data[key] < min) { min = data[key]; minDay = key; }
                        if (data[key] > max) { max = data[key]; maxDay = key; }

                        currentYear = +key.slice( 0, 4 );
                        if ( currentYear < minYear ) { minYear = currentYear; }
                        if ( currentYear > maxYear ) { maxYear = currentYear; }
                    }
                }

                return { kwh : [min, max], year : [minYear, maxYear], day: [minDay, maxDay] };
            }

            this.data = processedData;
            this.extents = findExtents( this.data );          // Get min,max values of the data
            this.color = d3.scale.quantize()                // Use min,max vals to divide range & map to css color classes
                .domain(this.extents.kwh)
                .range(d3.range(11).map(function(d) {
                    return "q" + d + "-11";
                }));

            return this;
        };


        // Call after file data is read in and processed
        this.renderChart = function() {
            var self = this;

            // Used to draw svg path - Date passed in is converted to path outline of month
            // Taken straight from beautiful D3 example code at : http://bl.ocks.org/mbostock/4063318
            function monthPath( t0 ) {
              var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                  d0 = +self.day(t0), w0 = +self.week(t0),
                  d1 = +self.day(t1), w1 = +self.week(t1);
              return "M" + (w0 + 1) * self.cellsize + "," + d0 * self.cellsize
                  + "H" + w0 * self.cellsize + "V" + 7 * self.cellsize
                  + "H" + w1 * self.cellsize + "V" + (d1 + 1) * self.cellsize
                  + "H" + (w1 + 1) * self.cellsize + "V" + 0
                  + "H" + (w0 + 1) * self.cellsize + "Z";
            }


            function buildCalendar() {
                self.svg = d3.select(self.el)
                    .append('h3').text(self.name)
                    .attr("class", "ctr");


                self.svg= d3.select(self.el)
                    .append("p")
                    .text(  Math.round(self.extents.kwh[0] * 100 )/100
                            + " (" + self.extents.day[0]
                            + ") - "
                            + Math.round( self.extents.kwh[1] * 100)/100
                            + " kw"
                            + " (" + self.extents.day[1] + ")" )
                    .attr("class", "text-center");

                self.svg = d3.select(self.el)
                    .append("div")
                    .attr("id", self.name.slice(0,7)) //
                    .attr("class", "CHChart")
                    .selectAll("svg")
                    .data(d3.range(self.extents.year[0], self.extents.year[1] + 1 ))
                    .enter()
                    .append("svg")
                        .attr("width", self.width)
                        .attr("height", self.height)
                        .attr("class", "RdYlGn")
                    .append("g")
                        .attr("transform", "translate(" + ( ( self.width - self.cellsize * 53 ) / 2 ) + "," + ( self.height - self.cellsize * 7 - 1 ) + ")");
            
                // Put year label to the left side of calendar, rotated 90 degress counter-clockwise
                self.svg.append("text")
                    .attr("transform", "translate(-6," + self.cellsize * 3.5 + ")rotate(-90)")
                    .style("text-anchor", "middle")
                    .text(function(d) { return d; });
            }


            function buildGrids() {
                self.rect = self.svg.selectAll(".day")
                    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
                  .enter().append("rect")
                    .attr("class", "day")
                    .attr("width", self.cellsize)
                    .attr("height", self.cellsize)
                    .attr("x", function(d) { return self.week(d) * self.cellsize; })
                    .attr("y", function(d) { return self.day(d) * self.cellsize; })
                    .datum(self.format);

                // Append the mouse-over title for each little box which represents a day
                self.rect.append("title")
                    .text(function(d) { return d; });
            }


            function buildOutlines() {
                // Add the month outlines
                self.svg.selectAll(".month")
                    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
                  .enter().append("path")
                    .attr("class", "month")
                    .attr("d", monthPath);
            }


            // call from callback fx after file read is read in & parsed
            function populateChart() {
                self.rect.filter(function(d) { return d in self.data; })
                    // set the class on the box based on value of rollup function above        
                    .attr("class", function(d) {
                      //my.log.msg( d + ' : ' + d3.round(data[d]) + ' --> ' + color(data[d]));
                      return "day " + self.color(d3.round(self.data[d]));
                      })
                  .select("title")
                  .text(function(d) { return d + ": " + d3.round(self.data[d],2); });   // set the svg title tag which becomes the mouseover text

                  return this;
            }


            buildCalendar();
            buildGrids();
            buildOutlines();
            populateChart();
        };
    };


    return my;
}(jQuery, kwh || {}));