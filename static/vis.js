async function plot() {
    const numStates = 56;
    
    // grab data from /data enpoint in flask app
    const data = await d3.json('/data');

    // convert date strings to JS dates
    const parseTime = d3.timeParse('%Y-%m-%d');
    data.forEach(function(d) {
        d.timestamp = parseTime(d.date);
    });
    
    // define plot dimensions and margins
    const margin = {left: 120, right: 10, top: 60, bottom: 30},
          height = 800 - (margin.left + margin.right),
          width = 1100 - (margin.top + margin.bottom);
    
    // create svg element in DOM
    var svg = d3.select('body').append('div').attr('class', 'container')
        .append('svg')
        .attr('width', width*1.2)
        .attr('height', height*1.2)
        .style("font", "10px sans-serif");
    
    // create group element for heatmap
    var hm = d3.select('svg')
            .append('g')
            .attr('transform', 'translate('+margin.left+','+margin.top+')')
            .attr('id', 'hm');

    // get array of unique state names
    const uniqueStates = [];
    for (var i = 0; i < data.length; i++) {
        if (!uniqueStates.includes(data[i].state)) {
            uniqueStates.push(data[i].state)
        }
    }

    // create scales for state, date, and color
    const x = d3.scaleTime()
                .domain(d3.extent(data, d => d.timestamp))
                .range([0, width]);
    const y = d3.scaleBand()
                .domain(uniqueStates)
                .range([0, height])
                .paddingInner(0.2);
    const color = d3.scaleSequentialSqrt(d3.extent(data, d => d.active), d3.interpolateYlOrRd);

    console.log()
    // draw axes 
    const xAxis = d3.axisTop(x)
                    .tickFormat(d3.timeFormat('%m/%d'));
    const yAxis = d3.axisLeft(y).tickSize(0);
    hm.append('g')
        .attr('class', 'x-axis')
        .call(xAxis)
        .call(g => g.select(".domain").remove());
    hm.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .call(g => g.select(".domain").remove());
    
    // add title and axis labels
    hm.append('text')
        .text('COVID-19 Active Cases in the US')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .attr('transform', 'translate(-30,' + (-30) + ')')
        .attr('text-anchor', 'left')
    hm.append('text')
        .text('Date')
        .style('font-size', '12px')
        .attr('transform', 'translate(' + (width/2) + ',' + (-30) + ')')
        .attr('text-anchor', 'middle')
        .attr('fill', 'gray');

    // append rectangles
    hm.selectAll('.rects')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.timestamp))
        .attr('y', d => y(d.state))
        .attr('width', 30)
        .attr('height', y.bandwidth())
        .attr('fill', d => isNaN(d.active) ? '#fff' : color(d.active))
    /**
     * TO-DO:
     * - Adjust color scale to show more info
     * - Change date range
     * - Add hover tool tip
     */

}   
plot();

