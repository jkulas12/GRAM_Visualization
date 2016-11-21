/**
 * Created by joshuakulas on 11/8/16.
 */
var tSNEPoints = [];
var all_codes = [];

var color_desc_map = {};
// list of selected codes for lasso
var selectedCodes = [];
var scatterPlotMargin = {top : 20, right : 20, bottom : 30, left : 40},
    width = 600 - scatterPlotMargin.left - scatterPlotMargin.right,
    height = 400 - scatterPlotMargin.top - scatterPlotMargin.bottom;

var SNEx = d3.scale.linear()
    .range([0, width]);

var SNEy = d3.scale.linear()
    .range([height, 0]);

var SNExAxis = d3.svg.axis()
    .scale(SNEx)
    .orient('bottom')
    .ticks(0);

var code_bar_scale = d3.scale.log()
    .base(Math.E)
    .domain([1, 2])
    .range([0, 200])

var svg = d3.select("#chart").append("svg")
    .attr("width", width + scatterPlotMargin.left + scatterPlotMargin.right)
    .attr("height", height + scatterPlotMargin.top +scatterPlotMargin.bottom)
    .append("g")
    .attr("class", "scatterplot")
    .attr("transform", "translate(" + scatterPlotMargin.left + "," + scatterPlotMargin.top + ")");
var SNEyAxis = d3.svg.axis()
    .scale(SNEy)
    .orient('left')
    .ticks(0);
// Create the area where the lasso event can be triggered
var lasso_area = svg.append("rect")
    .attr("width",width)
    .attr("height",height)
    .style("opacity",0)
    .attr("class", "lassoArea");

// add the tooltip area to the webpage
var tooltip = d3.select("#vizBody").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



///////////////////////////////////////
//////// Lasso Functions //////////////
///////////////////////////////////////

// Lasso functions to execute while lassoing
var lasso_start = function() {
    $('#code_attention_container').empty();
    $('#code_attention_container').css('visibility', 'hidden');
    d3.selectAll('.scatterDot')
        .style('stroke-width', "1px")
        .style('opacity', 1)
        .classed("hidden", false);
    lasso.items()
        .attr("r", 2.5)
        .style("fill",null) // clear all of the fills
        .classed({"not_possible":true,"selected":false, "scatterDot":true}); // style as not possible
    selectedCodes = [];
};

var lasso_draw = function() {
    // Style the possible dots
    lasso.items().filter(function(d) {return d.possible===true})
        .classed({"not_possible":false,"possible":true, "scatterDot":true});

    // Style the not possible dot
    lasso.items().filter(function(d) {return d.possible===false})
        .classed({"not_possible":true,"possible":false, "scatterDot":true});
    d3.selectAll('.possible')
        .style('opacity',1)
        .style('fill', function(d) {return d.fill_color;});
    d3.selectAll('.not_possible')
        .style('opacity',.2)
        .style('fill', function(d) {return d.fill_color;});
};


var lasso_end = function() {
    // Reset the color of all dots
    lasso.items()
        .style("fill", function (d) {
            return d.fill_color;
        });

    lasso.items().filter(function (d) {
        return d.selected === true
    })[0]
        .forEach(function (d) {
            selectedCodes.push(d.__data__);
        });
    lasso.items().filter(function (d) {
            return d.selected !== true
        })
        .attr("class", "hidden");


    // Style the selected dots
    lasso.items().filter(function (d) {
            return d.selected === true
        })
        .classed({"not_possible": false, "possible": false, "scatterDot": true})
        .attr("r", 5);

    // Reset the style of the not selected dots
    lasso.items().filter(function (d) {
            return d.selected === false
        })
        .classed({"not_possible": false, "possible": false, "scatterDot": true})
        .attr("r", 2.5);
    console.log("selected codes");
    console.log(selectedCodes)


    var codeDiv = d3.select('#code_attention_container')
        .selectAll('.code_attention_div')
        .data(selectedCodes)
        .enter().append('div')
        .attr('class', 'code_attention_div');


    var codeInfoDiv = codeDiv.append('div')
        .attr('class', 'codeInfoDiv');
    codeInfoDiv.append('h4')
        .text(function(d) {return d.code});
    codeInfoDiv.append('h4')
        .text(function(d) {return d.code_description});

    var ancestorInfoDiv = codeDiv.append('div')
        .attr('class', 'ancestorInfoDiv');

    ancestorInfoDiv.selectAll('.ancestorTextDiv')
        .data(function(d) {return d.ancestors.slice(1, d.ancestors.length)})
        .enter().append('div')
        .attr('class', 'ancestorTextDiv')
        .append('text')
        .text(function(d) {return d.code});

    var treeContainerDiv = codeDiv.append('div')
        .attr('class', 'treeContainerDiv')
        .append('svg')
        .attr('width', 100)
        .attr('height', 250);



    var ancestor_link = treeContainerDiv.append('line')
        .attr('class', 'ancestorLink')
        .attr('x1', 50)
        .attr('x2', 50)
        .attr('y1', 10)
        .attr('y2', function(d) {
            return 10 + 35 * (d.ancestors.length - 2);
        })
        .attr('stroke-width', 2)
        .attr('stroke', 'black');

    var ancestor_nodes = treeContainerDiv.selectAll('.ancestorNode')
        .data(function(d) {return d.ancestors.slice(1, d.ancestors.length)})
        .enter().append('circle')
        .attr('class', 'ancestorNode')
        .attr('r', function(d) {return radiusScale(d.attention)})
        .attr('cx', 50)
        .attr('cy', function(d,i) {
            return 15 + 35 * i})
        .attr('fill', 'gray')
        ;


    var ancestorBarChartDiv = codeDiv.append('div')
        .attr('class', 'ancestorBarChartDiv')
        .append('svg');

    var ancestorBars = ancestorBarChartDiv.selectAll('.ancestorBar')
        .data(function(d) {return d.ancestors.slice(1, d.ancestors.length)})
        .enter().append('rect')
        .attr('class', 'ancestorBar')
        .attr('x', 3)
        .attr('y', function(d, i) {
            return 10 + 35 * i
        })
        .attr('height', 15)
        .attr('width', function(d) {return code_bar_scale(d.attention + 1)})
        .attr('fill', 'gray');

    $('#code_attention_container').css('visibility', 'visible');

};



// Define the lasso
var lasso = d3.lasso()
    .closePathDistance(75) // max distance for the lasso loop to be closed
    .closePathSelect(true) // can items be selected by closing the path?
    .hoverSelect(true) // can items by selected by hovering over them?
    .area(lasso_area) // area where the lasso can be started
    .on("start",lasso_start) // lasso start function
    .on("draw",lasso_draw) // lasso draw function
    .on("end",lasso_end); // lasso end function


svg.call(lasso);

loadData();





function loadData() {
    d3.json('data/codeMap.json', function(d) {
        all_codes = d;
        for (var item in d) {
            if (d[item].hasOwnProperty('code_description')) {
                tSNEPoints.push(d[item]);
            }
        }
        d3.csv('data/colorDescriptionMap.csv', function(c) {
            for (var i in c) {
                console.log(c[i]);
                color_desc_map[c[i].color] = c[i]['description'];
            }
            console.log(color_desc_map);
            makeViz()
        });

    })
}

function makeViz() {
    svg.append('g')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'tSNEPlot')
        .attr('transform', 'translate(' + scatterPlotMargin.left + ',' + scatterPlotMargin.top + ')')
    SNEx.domain(d3.extent(tSNEPoints, function(d) {return d.tsne_x}));
    SNEy.domain(d3.extent(tSNEPoints, function(d) {return d.tsne_y}));

    svg.selectAll('.tSNEPoint')
        .data(tSNEPoints)
        .enter().append('circle')
        .attr('id', function(d, i) {return 'dot_' + i;})
        .attr('class', 'scatterDot')
        .attr('r', 2.5)
        .attr('cx', function(d) {return SNEx(d.tsne_x)})
        .attr('cy', function(d) {return SNEy(d.tsne_y)})
        .attr('fill', function(d) {return d.fill_color})
        .on('mouseover.tooltip', function(d) {
            tooltip.transition()
                .duration(200)
                .style('opacity',.9);
            tooltip.html(d.code + ": " + d.code_description + " <br/> ")
                .style('left', (d3.event.pageX + 5) + 'px')
                .style('top', (d3.event.pageY - 28) + 'px');
        })
        .on('mouseout.tooltip', function(d) {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    // add border
    var borderPath = svg.append('rect')
        .attr('x', -10)
        .attr('y', -10)
        .attr('height', height + 20)
        .attr('width', width + 20)
        .attr('stroke', 'lightgray')
        .style('fill', 'none')
        .style('stroke-width', 2);

    var legend = d3.select('#vizBody').append('svg')
        .attr('class', 'legend');

    var legened_values = legend.selectAll('.legend')
        .data(Object.keys(color_desc_map))
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d,i) {return 'translate(0,' + i * 20 + ")"; });

    legened_values.append('circle')
        .attr('cx', 500)
        .attr('cy', 14)
        .attr('r', 5)
        .style('fill', function(d) {return d});

    legened_values.append('text')
        .attr('x', 480)
        .attr('y', 10)
        .attr('dy', '.3em')
        .style('text-anchor', 'end')
        .text(function(d) {return color_desc_map[d];})

    lasso.items(d3.selectAll('.scatterDot'));
}


function radiusScale(i) {
    return 5 + 10 * Math.log(i + 1)
}

function showHelpText() {
    $('#vizBody').css('opacity', '.05');
    $('#helpWindow').css('visibility', 'visible');
}

function showVisualization() {
    console.log('test');
    $('#vizBody').css('opacity', '1');
    $('#helpWindow').css('visibility', 'hidden');
}


