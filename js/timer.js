/*
Program       timer.js
Author        Gordon Moore
Date          23 January 2021
Description   The JavaScript code for timer (electron)
Licence       GNU General Public Licence Version 3, 29 June 2007
*/

// #region Version history
/*
0.0.1   Initial version
1.0.0   25 January 2021 Version 1
1.0.1   27 January 2021 Make resizable

1.1.0   31 January 2021 Add a clock.
1.1.1   4  February 2021 Add date to clock and make clock first
1.1.2   13 February 2021 Do some more work on resizing.

*/
//#endregion 

let version = '1.1.2';

window.$ = window.jQuery = require('jquery');
let d3 = require('d3');

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure 

  //#region for variable definitions (just allows code folding)
  let svgT;
  let svgS;
  let svgC;
  let period;
  let periodset;
  let margin;
  let rwidth;
  let rheight;
  let w;
  let h;
  let widthT;
  let heightT;
  let time;
  let timer;
  let startA;
  let upcounter;
  let upcount;
  let timeS;
  let hrs;
  let min;
  let sec;
  let uc;
  let periodstr;
  let index;
  let flashend;
  let flashon = true;
  let currentdate;
  let x1;
  let y1;
  let x2;
  let y2;
  let rot;
  let day;
  let mon;

  //#endregion


  initialise();

  function initialise() {
    
    //disable scroll bars
    $("body").css("overflow", "hidden");

    period = 300;
    periodset = 300;
    upcount = 0;
    flashon = true;
    //initial period
    $('#p05').css('background-color', 'palegreen');

    redraw();
    clock = setInterval(displayClock, 1000);

    $('#timer').hide();
    $('#stopwatch').hide();
    $('#clock').show();
    $('#periods').hide();
    $('#start').hide();
    $('#reset').hide();
    $('#mode').css('background-color', '#dcd0ff'); 

    displayClock();
  }

  function redraw() {  //don't want anything to happen to selections or operations
    d3.selectAll('svg > *').remove();  //remove all elements under svg
    $('svg').remove(); 
    
    //get initial dimensions of #timer div
    margin = {top: 0, right: 0, bottom: 0, left: 0};

    w = ($('#main').outerWidth(true) - margin.left - margin.right); 
    h = w + 30;
    $('#main').css('height', h);
    

    $('#displaysection').css('height', w );
    $('#timer').css('height', w );
    $('#stopwatch').css('height', w );
    $('#clock').css('height', w );
    
    //just make w and h a tad smaller than window for UI look
    w = 0.98 * w;
    h= w;

    //timer
    svgT = d3.select('#timer').append('svg').attr('height', '100%').attr('width', '100%');
    //stopwatch
    svgS = d3.select('#stopwatch').append('svg').attr('height', '100%').attr('width', '100%');
    //clock
    svgC = d3.select('#clock').append('svg').attr('height', '100%').attr('width', '100%');

    $('#timer').css('height', h);
    $('#stopwatch').css('height', h);

    //h = ($('#timer').outerHeight(false) - margin.top - margin.bottom);
    //for use with clock really
    x = d3.scaleLinear().domain([-1, 1]).range([0, w]);
    y = d3.scaleLinear().domain([-1, 1]).range([h, 0]);
    // r = d3.scaleLinear().domain([0,1]).range([0, widthT]);

    //add a circle
    svgT.append('circle').attr('class', 'start').attr('cx', w/2).attr('cy', h/2).attr('r', 0.95 * w / 2).attr('stroke', 'black').attr('stroke-width', '2').attr('fill', 'none');
    
    displayClock();
    displayTime();
    displayCountup();

  }

  //start/pause button
  $('#start').on('click', function() {
    //just clear any flashing disc
    clearInterval(flashend);

    if ($('#start').css('backgroundColor') === 'rgb(152, 251, 152)') {
      //$('#start').text('P');
      $('#starticon').removeClass('fas fa-play');
      $('#starticon').addClass('fas fa-pause');      
      $('#start').css('background-color', 'orange');
    }
    else {
      // $('#start').text('S');
      $('#starticon').removeClass('fas fa-pause');
      $('#starticon').addClass('fas fa-play');     
      $('#start').css('background-color', 'palegreen');
    }
    if  ($('#timer').is(':visible')) {
      //svgT.selectAll('.start').remove(); //clear any background red circle used to show end of timer

      if ($('#start').css('backgroundColor') === 'rgb(255, 165, 0)') {  //changed label above
        timer = setInterval(countdown, 1000);
      }
      else {
        clearInterval(timer);
      }
    }
    else {  //on stopwatch
      if ($('#start').css('backgroundColor') === 'rgb(255, 165, 0)') {  //changed label above
        upcounter = setInterval(countup, 1000);
      }
      else {
        clearInterval(upcounter);
      }

    }
  })

  function countdown() {
    period -= 1;
    displayTime();
  }

  function countup() {
    upcount += 1;
    displayCountup();
  }

  //display the timer
  function displayTime() {

    //if timer finished
    if (parseInt(period) < 0) {
      //$('#start').text('S');
      $('#starticon').removeClass('fas fa-play');
      $('#starticon').removeClass('fas fa-pause');
      $('#starticon').addClass('fas fa-play');
      $('#start').css('background-color', 'palegreen');
      clearInterval(timer);

      //flash a red disc to indicate finished
      flashend = setInterval(flash, 500);
      return;
    }

    hrs = parseInt(period / 3600);
    uc = period - (hrs * 3600);
    min = parseInt(uc / 60);
    sec = parseInt(uc - (min * 60));
    
    if (sec < 10) sec = '0' + sec;
    if (min < 10) min = '0' + min;
    hrs = hrs + ':';
    if (parseInt(hrs) === 0) hrs = '';
 
    time = `${hrs}${min}:${sec} `
    
    //sweep a moving hand
    svgT.selectAll('.sector').remove();
    
    //calculate the start angle 6.28 (2PI) = start, 0 = end
    startA = ( parseFloat(period)/parseFloat(periodset) * 2 * Math.PI );
    
    sweepcolor = 'green';
    if (periodset <= 300) {                          //<=5min
      if (period < 60) sweepcolor = 'orange';        //1 minute warning
      if (period < 15) sweepcolor = 'red';           //15 second warning
    }
    else if (periodset > 300 && periodset <= 600) {  //>5min <=10min
      if (period < 180) sweepcolor = 'orange';       //3 minute warning
      if (period < 60)  sweepcolor = 'red';          //1 minute warning
    }
    else if (periodset > 600 && periodset <= 900) {  //>10min <=15min
      if (period < 180) sweepcolor = 'orange';       //3 minute warning
      if (period < 60)  sweepcolor = 'red';          //1 minute warning
    }
    else if (periodset > 900 && periodset <= 3600) {  //> 15min && <=60min
      if (period < 300) sweepcolor = 'orange';        //5 minute warning
      if (period < 120)  sweepcolor = 'red';          //2 minute warning
    }
    else {  //custom                                  //anything greater than 1 hour
      if (period < 300) sweepcolor = 'orange';        //5 minute warning
      if (period < 120)  sweepcolor = 'red';          //2 minute warning
    }

    svgT.append("path").attr('class', 'sector')
    .attr('transform', `translate(${w/2},${h/2})`)
    .attr("d", d3.arc()
      .innerRadius( 50 )
      .outerRadius( 0.45 * w )
      .startAngle( startA )     // It's in radians, 
      .endAngle( 0 )       
      )
    .attr('stroke', 'black')
    .attr('fill', sweepcolor);

    //text
    svgT.selectAll('.time').remove();

    if      (period >= 36000) svgT.append('text').text(time).attr('class', 'time').attr('x', 0.5*w - 45).attr('y', 0.50*h + 10).attr('text-anchor', 'start').attr('fill', 'blue').style('font-size', '1.4rem').style('font-weight', 'bold');
    else if (period >= 3600)  svgT.append('text').text(time).attr('class', 'time').attr('x', 0.5*w - 45).attr('y', 0.50*h + 10).attr('text-anchor', 'start').attr('fill', 'blue').style('font-size', '1.6rem').style('font-weight', 'bold');
    else                      svgT.append('text').text(time).attr('class', 'time').attr('x', 0.5*w - 40).attr('y', 0.50*h + 10).attr('text-anchor', 'start').attr('fill', 'blue').style('font-size', '2.0rem').style('font-weight', 'bold');
  }

  //display a flashing disc to indicate that time has run out
  function flash() {
    if (flashon) {
      svgT.append('circle').attr('class', 'start').attr('cx', w/2).attr('cy', h/2).attr('r', 0.95 * w /2).attr('stroke', 'black').attr('stroke-width', '2').attr('fill', 'red');
      flashon = false;
    }
    else {
      svgT.append('circle').attr('class', 'start').attr('cx', w/2).attr('cy', h/2).attr('r', 0.95 * w /2).attr('stroke', 'black').attr('stroke-width', '2').attr('fill', 'lightyellow');
      flashon = true;
    }
  }

  //the stopwatch
  function displayCountup() {
    //convert upcount to a time
    hrs = parseInt(upcount / 3600);
    uc = upcount - (hrs * 3600);
    min = parseInt(uc / 60);
    sec = uc - (min * 60);
    
    if (sec < 10) sec = '0' + sec;
    if (min < 10) min = '0' + min;
    if (hrs < 10) hrs = '0' + hrs;
             
    timeS = `${hrs}:${min}:${sec}`;
    svgS.selectAll('.stopw').remove();
    svgS.append('text').text(timeS).attr('class', 'stopw').attr('x', w/2 -58).attr('y', 0.55 * h).attr('text-anchor', 'start').attr('fill', 'blue').style('font-size', '1.75rem').style('font-weight', 'bold');
  }


  //reset button
  $('#reset').on('click', function() {
    reset();
  })

  function reset() {
    //$('#start').text('S');
    $('#starticon').removeClass('fas fa-play');
    $('#starticon').removeClass('fas fa-pause');
    $('#starticon').addClass('fas fa-play');
    $('#start').css('background-color', 'palegreen');

    if ($('#timer').is(':visible')) {
      svgT.selectAll('.start').remove(); //clear any background red circle used to show end of timer
      clearInterval(timer);
      period = periodset;
      displayTime();
    }
    else { //stopwatch
      clearInterval(upcounter);

      upcount = 0;
      displayCountup();
    }

    //stop any flashing disc
    clearInterval(flashend);
    flashon = true;
  }

  //periodbuttons change (act like radio buttons)
  $('.periodbuttons').on('click', function() {
    $('.periodbuttons').css('background-color', 'lightgrey');
    $(this).css('background-color', 'palegreen');

    //if custom time
    if ($(this).text() === 'C') {
      if ($('#customtime').is(':visible')) {
        $('#customtime').hide();
        //should set default to 5
        $('#pc').css('background-color', 'lightgrey');
        $('#p05').css('background-color', 'palegreen');
        periodset = 300;
        period = 300;
        //should I reset the entered time??
      }
      else {
        $('#customtime').css('left', 0.5*w -55);
        $('#customtime').css('top', 0.5*w - 10);
        $('#customtime').show();
      }
    }
    else {
      periodset = parseInt($(this).text()) * 60;
      period = periodset;
    }

    displayTime();
  })

  //custom time set
  $('#customtime').on('keypress', function(e) {
    if(e.which == 13) {
      $('#customtime').hide();
      //convert to a number
      periodstr = $('#customtime').val().trim();

      index = periodstr.indexOf(':');
      hrs = periodstr.substring(0, index).replace(' ', '').trim(); //trim probably redundant
      periodstr = periodstr.substring(index+1);
      index = periodstr.indexOf(':');
      min = periodstr.substring(0, index).replace(' ', '').trim();
      periodstr = periodstr.substring(index+1);
      sec = periodstr.replace(' ', '').trim();

      periodset = (parseInt(hrs) * 3600) + (parseInt(min) * 60) + parseInt(sec);
      period = periodset;

      displayTime();
    }
  })

  //change mode from timer to stopwatch to clock to timer ...
  $('#mode').on('click', function() {

    //if timer
    if ( $('#mode').css('background-color') === 'rgb(255, 228, 181)' )  {  //moccasin watch spaces and format!!!
      $('#mode').css('background-color', 'lightskyblue'); //light sky blue
      $('#modeicon').removeClass('fa-stopwatch');
      $('#modeicon').removeClass('fa-hourglass-half');
      $('#modeicon').addClass('fa-clock');
      //hide all timer stuff enable all stopwatch
      $('#timer').hide();
      $('#stopwatch').show();
      $('#clock').hide();
    }
    //if stopwatch
    else if ($('#mode').css('background-color') === 'rgb(135, 206, 250)' )  {  //light sky blue
      $('#mode').css('background-color', '#dcd0ff');  
      $('#modeicon').removeClass('fa-hourglass-half');
      $('#modeicon').removeClass('fa-clock');
      $('#modeicon').addClass('fa-hourglass-half');
      //hide stopwatch enable timer
      $('#timer').hide();
      $('#stopwatch').hide();
      $('#clock').show();

      $('#periods').hide();
      $('#start').hide();
      $('#reset').hide();

      clock = setInterval(displayClock, 1000);
      clockface();
    }
    //if clock
    else {
      clearInterval(clock)
      $('#mode').css('background-color', 'moccasin');
      $('#modeicon').removeClass('fa-clock-half');
      $('#modeicon').removeClass('fa-hourglass-half');
      $('#modeicon').addClass('fa-stopwatch');
      //hide stopwatch enable timer
      $('#timer').show();
      $('#stopwatch').hide();
      $('#clock').hide();
      $('#periods').show();
      $('#start').show();
      $('#reset').show();
    }

    reset();
  })

  function displayClock() {
    clockface();

    d3.selectAll('.hands').remove();

    //get current time and get hrs min sec
    currentDate = new Date();
    hrs = currentDate.getHours();
    min = currentDate.getMinutes(); 
    sec = currentDate.getSeconds();

    day = currentDate.getDate();
    mon = currentDate.getMonth() + 1;

    //hour hand
    if (hrs >= 12) hrs -= 12;
    rot = Math.PI/2 - (hrs/12 * 2*Math.PI) - (min/60 * 2*Math.PI/12);
    x1 = x(0);
    y1 = y(0);
    x2 = x(Math.cos(rot) * 0.6);
    y2 = y(Math.sin(rot) * 0.6);
    svgC.append('line').attr('class', 'hands').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', 'darkgreen').attr('stroke-width', 2);

    //minute hand
    rot = Math.PI/2 - (min/60 * 2*Math.PI) - (sec/60 * 2*Math.PI/60);
    x1 = x(0);
    y1 = y(0);
    x2 = x(Math.cos(rot) * 0.80);
    y2 = y(Math.sin(rot) * 0.80);
    svgC.append('line').attr('class', 'hands').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', 'darkgreen').attr('stroke-width', 2);

    //second hand
    rot = Math.PI/2 - (sec/60 * 2*Math.PI);
    x1 = x(0);
    y1 = y(0);
    x2 = x(Math.cos(rot) * 0.85);
    y2 = y(Math.sin(rot) * 0.85);
    svgC.append('line').attr('class', 'hands').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', 'red').attr('stroke-width', 2);
  
    //centre pivot (repeat after drawings hands really)
    svgC.append('circle').attr('class', 'clock').attr('cx', x1).attr('cy', y1).attr('r', 4).attr('stroke', 'blue').attr('stroke-width', '1').attr('fill', 'blue');
  }

  function clockface() {
    d3.selectAll('.clock').remove();

    //clock face
    x1 = x(0);
    y1 = y(0);
    //outer circle rim
    svgC.append('circle').attr('class', 'clock').attr('cx', x1).attr('cy', y1).attr('r', w/2).attr('stroke', 'blue').attr('stroke-width', '2').attr('fill', 'none');

    //add clock face ticks
    for (let i=0; i<12; i += 1) {
      rot = Math.PI/2 - i/12 * 2*Math.PI;  //add pi/2 to get to vertical for zero degrees/radians

      x1 = x(0.86 * Math.cos(rot));
      y1 = y(0.86 * Math.sin(rot));
      x2 = x(0.95 * Math.cos(rot));
      y2 = y(0.95 * Math.sin(rot));
      svgC.append('line').attr('class', 'clock').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', 'darkgreen').attr('stroke-width', 2)

      //add day and month
      svgC.append('text').text(day + ' ' + monthName(mon)).attr('class', 'clock').attr('x', w/2 -25).attr('y', 0.7 * h).attr('text-anchor', 'start').attr('fill', 'blue').style('font-size', '1.2rem').style('font-weight', 'bold');

    }
    
  }

  /*---------------------------------------------------------  resize event -----------------------------------------------*/
  $(window).bind('resize', function(e){
    window.resizeEvt;
    $(window).resize(function(){
        clearTimeout(window.resizeEvt);
        window.resizeEvt = setTimeout(function() { redraw(); }, 500);
    });
  });

  //helper function for testing
  function lg(s) {
    console.log(s);
  }  

  function monthName(mon) {
    if (mon === 1) return 'Jan';
    if (mon === 2) return 'Feb';
    if (mon === 3) return 'Mar';
    if (mon === 4) return 'Apr';
    if (mon === 5) return 'May';
    if (mon === 6) return 'Jun';
    if (mon === 7) return 'Jul';
    if (mon === 8) return 'Aug';
    if (mon === 9) return 'Sep';
    if (mon === 10) return 'Oct';
    if (mon === 11) return 'Nov';
    if (mon === 12) return 'Dec';

  } 


  // $('#clickme').on('click', function() {
  //   $('*').css('transform', 'scale(1.5, 1.5)');
  // })

})
