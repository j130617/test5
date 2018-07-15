var myApp = angular.module('myApp', []);

myApp.controller('MyCtrl', function($scope) {

  $scope.selectData = "data2";

  $scope.chartData = {
    data1: [{
      id: 1,
      name: "LY",
      value: 2000000
    }, {
      id: 2,
      name: "P",
      value: 100000
    }, {
      id: 3,
      name: "I",
      value: -200000
    }, {
      id: 4,
      name: "D",
      value: -500000
    }],
    data2: [{
      id: 1,
      name: "LY",
      value: 3000000
    }, {
      id: 2,
      name: "P",
      value: -1000000
    }, {
      id: 3,
      name: "I",
      value: 500000
    }, {
      id: 4,
      name: "D",
      value: -300000
    }],
    data3: [{
      id: 1,
      name: "LY",
      value: 1000000
    }, {
      id: 2,
      name: "P",
      value: 2000000
    }, {
      id: 3,
      name: "I",
      value: 500000
    }, {
      id: 4,
      name: "D",
      value: 2000000
    }]
  };

});

myApp.directive('waterfall', function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      chartData: '=',
      selectData: '='
    },
    template: "<svg class='waterfall-chart'></svg>",
    link: function(scope, element, attrs, fn) {

      var rawSvg = element;

      var data = scope.chartData.data1;

      scope.$watch('selectData', function(newValue, oldValue) {
        console.log(newValue);
        if (newValue === "data1") {
          data = scope.chartData.data1;
        } else if (newValue === "data2") {
          data = scope.chartData.data2;
        } else {
          data = scope.chartData.data3;
        }

        paintChart();
      });

      var margin = {
          top: 100,
          right: 0,
          bottom: 0,
          left: -70
        },
        width = 500 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom,
        padding = 0.80;

      var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], padding);

      var y = d3.scale.linear()
        .range([height, 0]);

      /*            var xAxis = d3.svg.axis()
                      .scale(x)
                      .orient("bottom");*/

      /*
                  var yAxis = d3.svg.axis()
                      .scale(y)
                      .orient("left")
                      .tickFormat(function (d) {
                          return dollarFormatter(d);
                      });
      */


      function paintChart() {

        var svg = d3.select("svg");
        svg.selectAll("*").remove();

        var chart = d3.select(rawSvg[0])
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Transform data (i.e., finding cumulative values and total) for easier charting
        var cumulative = 0;
        for (var i = 0; i < data.length; i++) {
          data[i].start = cumulative;
          cumulative += data[i].value;
          data[i].end = cumulative;

          if (i === 0) {
            data[i].class = "bar-first"
          } else {
            data[i].class = "bar-middle"
          }

          //data[i].class = (data[i].value >= 0) ? 'positive' : 'negative'
        }
        data.push({
          name: 'Total',
          end: cumulative,
          start: 0,
          class: 'total'
        });

        x.domain(data.map(function(d) {
          return d.name;
        }));
        y.domain([0, d3.max(data, function(d) {
          return d.end;
        })]);

        /*            chart.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    chart.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);*/

        var bar = chart.selectAll(".bar")
          .data(data)
          .enter().append("g")
          .attr("class", function(d) {
            return "bar " + d.class
          })
          .attr("transform", function(d) {
            return "translate(" + x(d.name) + ",0)";
          });

        bar.append("rect")
          .attr("y", function(d) {
            return y(Math.max(d.start, d.end));
          })
          .attr("height", function(d) {
            return Math.abs(y(d.start) - y(d.end));
          })
          .attr("width", x.rangeBand());

        var txt = bar.append("text")
          .attr("x", x.rangeBand())
          .attr("y", function(d) {
            if (d.class === "total" || d.class === "bar-first") {
              return y(d.end) - 30;
            } else {
              if (d.value > 0) {
                return y(d.start) - 30;
              } else {
                return y(d.end);
              }
            }
          })
          .attr("dy", function(d) {
            return ((d.class == 'negative') ? '-' : '') + ".75em"
          })
          .text(function(d, i) {
            return dollarFormatter(d.end - d.start);
          })
          .style("fill", function(d) {
            if (d.class === "bar-first" || d.class === "total") {
              return "rgb(0,172,234)"
            } else {
              return "rgb(170,170,170)"
            }
          })
          .style("font", "bold 18px Calibri");

        bar.filter(function(d) {
            return d.class != "total"
          }).append("line")
          .attr("class", "connector")
          .attr("x1", x.rangeBand() + 5)
          .attr("y1", function(d) {
            return y(d.end)
          })
          .attr("x2", x.rangeBand() / (1 - padding) - 5)
          .attr("y2", function(d) {
            return y(d.end)
          })

        function type(d) {
          d.value = +d.value;
          return d;
        }

        function dollarFormatter(n) {
          n = Math.round(n);
          var result = n;
          if (Math.abs(n) > 1000) {
            result = (n / 1000000).toFixed(1) + ' M';
          }
          return result;
        }

      }
    }
  };
});
