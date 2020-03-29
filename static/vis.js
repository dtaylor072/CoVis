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
    const margin = {left: 120, right: 10, top: 100, bottom: 30},
        height = 800 - (margin.top + margin.bottom),
        width = 1100 - (margin.left + margin.right);
    
    // create svg element in DOM
    var svg = d3.select('body').append('div').attr('class', 'container')
        .append('svg')
        .attr('width', width*1.5)
        .attr('height', height*1.5)
        .style('font', '10px sans-serif');
    
    // create group element for heatmap
    var hm = d3.select('svg')
        .append('g')
        .attr('transform', 'translate('+margin.left+','+margin.top+')')
        .attr('id', 'hm');

    // get array of unique state names
    const uniqueStates = [];
    const uniqueDates = [];
    for (var i = 0; i < data.length; i++) {
        if (!uniqueStates.includes(data[i].state)) {
            uniqueStates.push(data[i].state)
        }
        if (!uniqueDates.includes(data[i].date)) {
            uniqueDates.push(data[i].date)
        }
    }

    // create scales for state, date, and color
    const rectWidth = 0.95 * width / uniqueDates.length
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.timestamp))
        .range([0, width]);
    const y = d3.scaleBand()
        .domain(uniqueStates)
        .range([0, height])
        .paddingInner(0.2);
    const color = d3.scaleSequentialSymlog(d3.extent(data, d => d.active_per_100k), d3.interpolateYlOrRd);

    // draw axes 
    const dateFormat = d3.timeFormat('%m/%d')
    const xAxis = d3.axisTop(x)
        .tickFormat(dateFormat)
        .ticks(uniqueDates.length / 2);
    const yAxis = d3.axisLeft(y)
        .tickSize(0);

    hm.append('g')
        .attr('class', 'x-axis')
        .call(xAxis)
        .call(g => g.select('.domain').remove())
        .selectAll('text')
            .style('text-anchor', 'middle')
            .attr('transform', 'translate(' + (rectWidth / 2) + ', 0)')
    hm.select('.x-axis').selectAll('line')
        .attr('transform', 'translate(' + (rectWidth / 2) + ', 0)')
    
    hm.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .call(g => g.select('.domain').remove());
    
    // add title, axis labels, and link to code
    hm.append('text')
        .text('COVID-19 Active Cases in the US')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .attr('transform', 'translate(-80, -60)')
        .attr('text-anchor', 'left')
    hm.append('text')
        .text('Date')
        .style('font-size', '12px')
        .attr('transform', 'translate(' + (width/2) + ',' + (-30) + ')')
        .attr('text-anchor', 'middle')
        .attr('fill', 'gray');
    hm.append('text')
        .text('Source code')
        .style('font-size', '12px')
        .style('fill', 'blue')
        .attr('transform', 'translate(0,' + (height + 25 ) + ')')
    hm.append('a')
        .attr('xlink:href', 'https://github.com/dtaylor072/CoVis')
        .attr('transform', 'translate(0,' + (height + 13 ) + ')')
        .append('rect')
            .attr('width', 75)
            .attr('height', 12)
            .attr('fill-opacity', 0)
 

    // define d3-tip tooltip and mouseover behavior
    const tipFormat = d3.format('0.1f')
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) {
            return '<span style="color:white"> <strong>' + d.state + ' </strong> ' +
                    dateFormat(d.timestamp) + '</span> <br>' +
                    'Active/100k: <span style="color:white">' + tipFormat(d.active_per_100k) + '</span>'
        })
    hm.call(tip)

    // append rectangles
    hm.selectAll('.rects')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'hm-rect')
        .attr('x', d => x(d.timestamp))
        .attr('y', d => y(d.state))
        .attr('width', rectWidth)
        .attr('height', y.bandwidth())
        .attr('fill', d => isNaN(d.active_per_100k) ? '#fff' : color(d.active_per_100k))
        .on('mouseover', tip.show)
    
    // add legend
    var legend = d3.legendColor()
        .scale(color)
        .title('Active Cases per 100,000 People')
        .orient('horizontal')
        .shapeWidth(rectWidth)
        .shapeHeight(y.bandwidth())
        .cells(10)
        .shapePadding(2)
        .labelAlign('start')
        .labelFormat(d3.format('0.0f'))
        .labelOffset(3)
    svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + (width - (7 * rectWidth)) + ',30)')
        .call(legend)
}   
plot();

