async function plot() {

    /* define sequential color map */
    const colorMap = d3.interpolateYlOrRd;

    /* grab data from /data enpoint in flask app */
    const data = await d3.json('/data');

    /* convert date strings to JS dates */
    const parseTime = d3.timeParse('%Y-%m-%d');
    data.forEach(function(d) {
        d.timestamp = parseTime(d.date);
    });

    /* define plot dimensions and margins */
    const margin = {left: 100, right: 10, top: 100, bottom: 30},
        height = 800 - (margin.top + margin.bottom),
        width = 1100 - (margin.left + margin.right);
    
    /* create svg element in DOM */
    var svg = d3.select('body').append('div').attr('class', 'container')
        .append('svg')
        .attr('width', width*1.7)
        .attr('height', height*1.5)
        .style('font', '10px sans-serif');
    
    /* create group element for heatmap */
    var hm = d3.select('svg')
        .append('g')
        .attr('transform', 'translate('+margin.left+','+margin.top+')')
        .attr('id', 'hm');

    /* get array of unique state names */
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

    /* create scales for state, date, and color */
    const rectWidth = 0.95 * width / uniqueDates.length
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.timestamp))
        .range([0, width]);
    const y = d3.scaleBand()
        .domain(uniqueStates)
        .range([0, height])
        .paddingInner(0.2);
    const color = d3.scaleSequentialSymlog(d3.extent(data, d => d.new_cases_per_100k), colorMap);
    
    /* draw axes */
    const dateFormat = d3.timeFormat('%m/%d');
    const xAxis = d3.axisTop(x)
        .tickFormat(dateFormat)
        .ticks(uniqueDates.length / 2);
    const yAxis = d3.axisLeft(y)
        .tickSize(0);
    const yAxis2 = d3.axisRight(y)
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
    hm.append('g')
        .attr('class', 'y-axis2')
        .attr('transform', 'translate(' + (width + rectWidth) + ',0)')
        .call(yAxis2)
        .call(g => g.select('.domain').remove());
    
    /* bolden US Total row text */
    d3.selectAll('text')
        .filter(function() { 
            return d3.select(this).text() == 'US Total'
        })
        .attr('font-weight', 'bold')
    /* add title, links to code and data */
    const recentData = data.filter(d => d.date == d3.max(uniqueDates))
    const totalCases = recentData.filter(d => d.state == 'US Total')[0].cases,
        newCases = recentData.filter(d => d.state == 'US Total')[0].new_cases;

    const formatLatestDate = d3.timeFormat('%B %d, %Y'),
        caseFormat = d3.format(',.0f');

    hm.append('text') // title
        .text('COVID-19 Daily Confirmed New Cases in the US')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .attr('transform', 'translate(-80, -60)')
        .attr('text-anchor', 'left');
    hm.append('text') // subtitle with latest date
        .text('As of ' + formatLatestDate(parseTime(d3.max(uniqueDates))))
        .style('font-size', '12px')
        .attr('transform', 'translate(-80, -40)')
        .attr('text-anchor', 'left');
    hm.append('text') // subtitle with total new cases
        .text('New Cases: ' + caseFormat(newCases))
        .style('font-size', '12px')
        .attr('transform', 'translate(75, -40)')
        .attr('text-anchor', 'left');
    hm.append('text') // subtitle with total cases to date
        .text('Total Confirmed Cases: ' + caseFormat(totalCases))
        .style('font-size', '12px')
        .attr('transform', 'translate(215, -40)')
        .attr('text-anchor', 'left');
    hm.append('text') // author
        .text('Author: David Taylor')
        .style('font-size', '10px')
        .attr('transform', 'translate(0,' + (height + 23 ) + ')');
    hm.append('text') // link to repo
        .text('Source')
        .style('font-size', '10px')
        .style('fill', 'blue')
        .attr('transform', 'translate(0,' + (height + 35 ) + ')');
    hm.append('a')
        .attr('xlink:href', 'https://github.com/dtaylor072/CoVis')
        .attr('transform', 'translate(0,' + (height + 25 ) + ')')
        .append('rect')
            .attr('width', 40)
            .attr('height', 10)
            .attr('fill-opacity', 0);
    hm.append('text') // link to data source
        .text('Data provided by The New York Times')
        .style('font-size', '10px')
        .style('fill', 'blue')
        .attr('transform', 'translate(0,' + (height + 47 ) + ')');
    hm.append('a')
        .attr('xlink:href', 'https://www.nytimes.com/interactive/2020/us/coronavirus-us-cases.html')
        .attr('transform', 'translate(0,' + (height + 37 ) + ')')
        .append('rect')
            .attr('width', 175)
            .attr('height', 10)
            .attr('fill-opacity', 0);
 
    /* define d3-tip tooltip and mouseover behavior */
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) {
            return '<span style="color:white"> <strong>' + d.state + ' </strong> ' +
                    dateFormat(d.timestamp) + '</span> <br>' +
                    'New Cases: <span style="color:white">' + caseFormat(d.new_cases) + '</span> <br>' +
                    'New Cases/100k: <span style="color:white">' + d3.format('0.2f')(d.new_cases_per_100k) + '</span> <br>' +
                    'Total Cases: <span style="color:white">' + caseFormat(d.cases) + '</span>'
        })
    hm.call(tip)

    /* append rectangles */
    var hm_selection = hm.selectAll('.hm-rect').data(data)
    hm_selection.enter()
        .append('rect')
        .attr('class', 'hm-rect')
        .attr('x', d => x(d.timestamp))
        .attr('y', d => y(d.state))
        .attr('width', rectWidth)
        .attr('height', y.bandwidth())
        .attr('fill', d => isNaN(d.new_cases_per_100k) ? '#fff' : color(d.new_cases_per_100k))
        
    hm.selectAll('.hm-rect')
        .on('mouseover', function(d, i) {
            tip.show(d, this);
            d3.select(this)
                .attr('stroke', '#0c2c84').attr('stroke-width', '2')
        })
        .on('mouseout', function() {
            tip.hide();
            d3.select(this)
                .attr('stroke', 'none').attr('stroke-width', 'none')
        })
    
    /* add legend */
    var legend = d3.legendColor()
        .scale(color)
        .title('New Confirmed Cases per 100,000 People')
        .orient('horizontal')
        .shapeWidth(rectWidth)
        .shapeHeight(y.bandwidth())
        .cells(8)
        .shapePadding(2)
        .labelAlign('start')
        .labelFormat(d3.format('0.0f'))
        .labelOffset(3)
    svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(' + (margin.left + width - (8 * rectWidth)) + ',30)')
        .call(legend)
}
plot();

