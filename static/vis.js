async function plot() {
    const data = await d3.json('/data');
    
    const margin = {left: 40, right: 10, top: 50, bottom: 30},
          height = 400 - (margin.left + margin.right),
          width = 800 - (margin.top + margin.bottom);
    
    var svg = d3.select('body').append('div').attr('class', 'container')
        .append('svg')
        .attr('width', width*1.4)
        .attr('height', height*1.4);

    console.log(data)
    // continue here...
}
plot();

