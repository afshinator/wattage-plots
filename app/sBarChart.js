// stackedBarChart.js - Stacked Bar Chart object for use with D3 framework, by Afshin Mokhtari
//


var kwh = (function ($, my) {

    my.StackedBarChart = function ( el, w, h, name, forLegend ) {
        my.Chart.call( this, name, el, w, h );
        my.inheritPrototype( my.StackedBarChart, my.Chart );       // 'inherit' all Chart properties & methods

        this.colScheme = forLegend.colScheme;
        this.legendTitles = forLegend.categories;
        this.p = [20, 50, 30, 20];
        this.x = d3.scale.ordinal().rangeRoundBands([0, w - this.p[1] - this.p[3]]); // on-screen scaling
        this.y = d3.scale.linear().range([0, h - this.p[0] - this.p[2]]);
        this.z = d3.scale.ordinal().range(this.colScheme);
        this.parse = d3.time.format("%Y-%m-%d").parse;
        this.format = d3.time.format("%x");                 // date, as "%m/%d/%Y"

        this.svg = d3.select( el ).append( "svg:svg" )
            .attr( "width", w )
            .attr( "height", h )
          .append( "svg:g" )
            .attr( "transform", "translate(" + this.p[3] + "," + (h - this.p[2]) + ")" );


        this.setData = function( processedData ) {
            this.data =  processedData;

            // Compute the x-domain (by date) and y-domain (by top).
            this.x.domain( this.data[0].map(function(d) { return d.x; }) );
            this.y.domain( [0, d3.max( this.data[this.data.length - 1], function(d) { return d.y0 + d.y; } )]);

            return this;
        };


        this.renderData = function () {
            var self = this;
            var legend,
                color;

            color = d3.scale.ordinal().range(self.colScheme);       // for legend
            color.domain(self.legendTitles);


            // Add a group for each column
            var aCol = self.svg.selectAll("g.column")
                .data(self.data)
                .enter().append("svg:g")
                .attr("class", "column")
                .style("fill", function(d, i) { return self.z(i); })
                .style("stroke", function(d, i) { return d3.rgb(self.z(i)).darker(); });

            // Add a rectangle for each date.
            var rect = aCol.selectAll("rect")
                .data(Object)
                .enter().append("svg:rect")
                .attr("x", function(d) { return self.x(d.x); })
                .attr("y", function(d) { return -self.y(d.y0) - self.y(d.y); })
                .attr("title", function(d) { return self.format(d.x); })
                .attr("height", function(d) { return self.y(d.y); })
                .attr("width", self.x.rangeBand());


            // Add axis rule lines
            var rule = self.svg.selectAll("g.rule")
                .data(self.y.ticks(8))
                .enter().append("svg:g")
                .attr("class", "rule")
                .attr("transform", function(d) { return "translate(0," + -self.y(d) + ")"; });

            rule.append("svg:line")
                .attr("x2", self.width - self.p[1] - self.p[3])
                .style("stroke", function(d) { return d ? "#bbb" : "#fff"; })
                .style("stroke-opacity", function(d) { return d ? 0.7 : null; });

            rule.append("svg:text")
                .attr("x", self.width - self.p[1] - self.p[3] + 6)
                .attr("dy", ".35em")
                .text(d3.format("d"));      // d is integer


            // build the legend
            legend = self.svg.selectAll(".legend")
                .data(color.domain())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    return "translate(" + (-( self.width - 100 )) + ', ' + (- ( self.height/1.45 ) + i * -20) + ")";
                });

            legend.append("rect")
                .attr("x", self.width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", self.width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) { return d; });
        };
    };



    return my;
}(jQuery, kwh || {}));