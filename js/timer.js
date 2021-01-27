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
1.1.0   28 January 2021 Add a clock.

*/
//#endregion 

let version = '1.0.1';

window.$ = window.jQuery = require('jquery');
let d3 = require('d3');

'use strict';
$(function() {
  console.log('jQuery here!');  //just to make sure 

  //#region for variable definitions (just allows code folding)
  let svgT;
  let svgS;
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

  //#endregion


  initialise();

  function initialise() {

    d3.selectAll('svg > *').remove();  //remove all elements under svg
    $('svg').remove(); 
    
    //get initial dimensions of #timer div
    margin = {top: 0, right: 0, bottom: 0, left: 0};

    w = ($('#main').outerWidth(true) - margin.left - margin.right); 
    h = w;

    $('#displaysection').css('height', w );
    $('#timer').css('height', w );
    $('#stopwatch').css('height', w );
    
    //just make w and h a tad smaller than window for UI look
    w = 0.98 * w;
    h= w;

    //timer
    svgT = d3.select('#timer').append('svg').attr('height', '100%').attr('width', '100%');
    //stopwatch
    svgS = d3.select('#stopwatch').append('svg').attr('height', '100%').attr('width', '100%');

    $('#timer').css('height', h);
    $('#stopwatch').css('height', h);

    //h = ($('#timer').outerHeight(false) - margin.top - margin.bottom);
    // x = d3.scaleLinear().domain([-1, 1]).range([0, widthT]);
    // y = d3.scaleLinear().domain([-1, 1]).range([heightT, 0]);
    // r = d3.scaleLinear().domain([0,1]).range([0, widthT]);

    //add a circle
    svgT.append('circle').attr('class', 'start').attr('cx', w/2).attr('cy', h/2).attr('r', 0.95 * w / 2).attr('stroke', 'black').attr('stroke-width', '2').attr('fill', 'none');

    //append some text
    period = 300;
    periodset = 300;
    upcount = 0;
    displayTime();
    displayCountup();

    //initial period
    $('#p05').css('background-color', 'palegreen');
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
    svgS.append('text').text(timeS).attr('class', 'stopw').attr('x', w/2 -83).attr('y', 0.55 * h).attr('text-anchor', 'start').attr('fill', 'blue').style('font-size', '2.5rem').style('font-weight', 'bold');
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
      }
      else {
        $('#customtime').css('left', 0.5*w -50);
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

  //change mode from timer to stopwatch
  $('#mode').on('click', function() {

    if ( $('#mode').css('background-color') === 'rgb(255, 228, 181)' )  {  //watch spaces and format!!!
      $('#mode').css('background-color', 'lightblue');
      $('#modeicon').removeClass('fa-stopwatch');
      $('#modeicon').addClass('fa-hourglass-half');
      //hide all timer stuff enable all stopwatch
      $('#timer').hide();
      $('#stopwatch').show();
    }
    else {
      $('#mode').css('background-color', 'moccasin');
      $('#modeicon').removeClass('fa-hourglass-half');
      $('#modeicon').addClass('fa-stopwatch');
      //hide stopwatch enable timer
      $('#timer').show();
      $('#stopwatch').hide();
    }

    reset();
  })

  /*---------------------------------------------------------  resize event -----------------------------------------------*/
  $(window).bind('resize', function(e){
    window.resizeEvt;
    $(window).resize(function(){
        clearTimeout(window.resizeEvt);
        window.resizeEvt = setTimeout(function() { initialise(); }, 500);
    });
  });

  //helper function for testing
  function lg(s) {
    console.log(s);
  }  

})
