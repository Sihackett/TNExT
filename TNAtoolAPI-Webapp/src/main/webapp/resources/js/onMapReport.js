// Copyright (C) 2015 Oregon State University - School of Mechanical,Industrial and Manufacturing Engineering 
//   This file is part of Transit Network Analysis Software Tool.
//
//    Transit Network Analysis Software Tool is free software: you can redistribute it and/or modify
//    it under the terms of the GNU  General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    Transit Network Analysis Software Tool is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU  General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Transit Network Analysis Software Tool.  If not, see <http://www.gnu.org/licenses/>.
// =========================================================================================================
//	  This script contains JavaScript variables and methods used to load main map interface and its features
//	  in the Transit Network Analysis Software Tool and all its features.
// =========================================================================================================

var colorArray=['gcluster', 'picluster', 'ccluster', 'rcluster', 'pucluster', 'brcluster'];
var onMapCluster=new L.FeatureGroup();
var onMapStopCluster=new L.FeatureGroup();
var onMapRouteCluster=new L.FeatureGroup();
var onMapBlockCluster=new L.FeatureGroup();
var onMapTractCluster=new L.FeatureGroup();
var onMapPnrCluster = new L.FeatureGroup();
var onMapPnrStopCluster = new L.FeatureGroup();
var onMapPnrRouteCluster = new L.FeatureGroup();
var stopCluster;
var routeCluster;
var blockCluster;
var tractCluster;
var pnrCluster;
var pnrStopCluster;
var pnrRadius=0.1;
var losRadius = 0.1;
var ggm=false;
var ggb;

/**
 * draws a line on map based on the array of coordinates
 * @param coords
 */
function addShapefile(coords){
	var that = drawControl._toolbars[L.DrawToolbar.TYPE]._modes.polygon.handler;
	that.enable();
	
	for(var i=0;i<coords.length;i++){
		that.addVertex(coords[i]);
	}
	that._finishShape();
	that.disable();
}

/**
 * opens up the google street view for a given coordinate
 * @param lat
 * @param lon
 */
function openStreetView(lat, lon){
	if(!ggb){
		alert('You need to be in Google Aerial map layer to use this feature');
		return;
	}
	var place = new google.maps.LatLng(lat, lon);
	panorama = ggm.getStreetView();
	panorama.setPosition(place);
	map.dragging.disable();
	map.touchZoom.disable();
	map.doubleClickZoom.disable();
	map.scrollWheelZoom.disable();	
	google.maps.event.addListener(panorama, 'closeclick', function() {
		map.dragging.enable();
		map.touchZoom.enable();
		map.doubleClickZoom.enable();
		map.scrollWheelZoom.enable();
	});
	google.maps.event.addListener(panorama, 'visible_changed', function() {
		if(panorama.getVisible()){
			$('div.gm-style:nth-child(2)').css('z-index','10000');
			$('#map > div.leaflet-map-pane').css('position','relative');
			$('#map > div.leaflet-control-container').children().css('position','relative');
			$('body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-draggable.ui-resizable').css('display','none');
		}else{
			$('#map > div.leaflet-map-pane').css('position','absolute');
			$('#map > div.leaflet-control-container').children().css('position','absolute');
			$('body > div.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-front.ui-draggable.ui-resizable').css('display','');
		}
	});
	panorama.setVisible(true);
	checkSVChange();	
}

/**
 * A helper function to improve the user experience while using the Google street view functionality
 */
function checkSVChange()
{
	if($('div.gm-style:nth-child(2)').css('z-index')=='10000'){
		return;
	}
	$('div.gm-style:nth-child(2)').css('z-index','10000');
    setTimeout( checkSVChange, 100 );
}

/**
 * generates on-map report dialog and populates the data.
 */
function onMapSubmit(){
	
	$('#blockSvc').prop('checked', false);
	$("input[name=blocksDensity][value='pop']").prop("checked",true);
	$( "input[name='blocksDensity']" ).each(function() {
  	  $( this ).prop( "disabled", false );
	});
	$('#legendSelect').hide();
	$('#blocksLengend').hide();
	
	map.removeLayer(onMapCluster);
	$( '.POPcal').datepicker( "hide" );
	currentLayer.closePopup();
	if(!dialog.dialog( "isOpen" )){
		dialog.dialog( "open" );
	}
	$('#dialogLat').html(drawCentroid[0]);
	$('#dialogLng').html(drawCentroid[1]);
	$('#dialogArea').html(Math.round(area*100)/100);
	$('#popRadio').prop('checked', true);
	
	var index = $('#tabs a[href="#transit"]').parent().index();
	$("#tabs").tabs("option", "active", index);
	$('#blocksCheck').prop('checked', true);
	$("#dialogDate").datepicker( "setDate", currentDate);
	$("#tabs").hide();
	$('#dialogPreLoader').show();	
	$('.ui-tabs .ui-tabs-nav li a').css("padding",".5em 0.5em");
	
	showOnMapReport(currentLats, currentLngs, currentDate, currentX, losRadius);
}

/**
 * updates the search radius based on user input and reloads the on-map report
 * @param e
 */
function legendSelectChange(e){
	losRadius = e.value;
	onMapSubmit();
}

/**
 * sets the date based on user selection
 */
function setDialogDate(){
	$( "#dialogDate" ).datepicker({
		duration: "fast",
		showButtonPanel: true,
		onSelect: function (date) {
			
			currentDate = date;
			onMapSubmit();
	    }
	});
    $( "#tabs" ).tabs();
}

/**
 * hides/displays the routes and stops in the area based 
 * on user selection of the radio buttons
 * @param r
 */
function transitRadio(r){
	onMapCluster.removeLayer(onMapStopCluster);
	onMapCluster.removeLayer(onMapRouteCluster);
	if(r.value=='stops'){
		onMapCluster.addLayer(onMapStopCluster);
	}else if(r.value=='routes'){
		onMapCluster.addLayer(onMapRouteCluster);
	}else{
		onMapCluster.addLayer(onMapRouteCluster);
		onMapCluster.addLayer(onMapStopCluster);
	}
}

/**
 * hides/displays the census blocks and/or census tracts in 
 * the selected area based on user selection of the radio buttons
 * @param r
 */
function geoRadio(r){
	onMapCluster.removeLayer(onMapBlockCluster);
	onMapCluster.removeLayer(onMapTractCluster);
	if(r.value=='blocks'){
		onMapCluster.addLayer(onMapBlockCluster);
	}else if(r.value=='tracts'){
		onMapCluster.addLayer(onMapTractCluster);
	}else{
		onMapCluster.addLayer(onMapBlockCluster);
		onMapCluster.addLayer(onMapTractCluster);
	}
}

/**
 * changes the display type of blocks' level of service markers within the on-map report
 * @param b
 * @param densityValue
 */
function changeSvc(b, densityValue){
	if(b){
		$( "input[name='blocksDensity']" ).each(function() {
	    	  $( this ).prop( "disabled", true );
	    });
		$('#blockLegendDiv').hide();
		
		for(var i=0; i<blockCluster.length; i++){
    		blockCluster[i].eachLayer(function (layer) {
    			layer.setStyle({
					radius: layer.svc,
					weight: 2,
					fillOpacity: 0.5,
					fillColor: "#4b85f2",
	            });
	    	});
    	}
		
	}else{
		$( "input[name='blocksDensity']" ).each(function() {
	    	  $( this ).prop( "disabled", false );
	    });
		$('#blockLegendDiv').show();
		changeDensityStyle(densityValue);
	}
}

/**
 * updates the circles showing population/employment density
 * based on user selection of the radio button
 * @param densityType
 */
function changeDensityStyle(densityType){
	if(blockDensityValue!=densityType){
		blockDensityValue = densityType;
		switch (densityType) {
	    case "pop":
	    	for(var i=0; i<blockCluster.length; i++){
	    		blockCluster[i].eachLayer(function (layer) {
		    	    layer.setStyle({
		    	    	radius: 6,
						weight: 0,
						fillOpacity: 0.8,
		            	fillColor: getColorBlocks(layer.popDensity)
		            });
		    	});
	    	}
	        break;
	    case "rac":
	    	for(var i=0; i<blockCluster.length; i++){
	    		blockCluster[i].eachLayer(function (layer) {
		    	    layer.setStyle({
		    	    	radius: 6,
						weight: 0,
						fillOpacity: 0.8,
		            	fillColor: getColorBlocks(layer.racDensity)
		            });
		    	});
	    	}
	        break;
	    case "wac":
	    	for(var i=0; i<blockCluster.length; i++){
	    		blockCluster[i].eachLayer(function (layer) {
		    	    layer.setStyle({
		    	    	radius: 6,
						weight: 0,
						fillOpacity: 0.8,
		            	fillColor: getColorBlocks(layer.wacDensity)
		            });
		    	});
	    	}
	    }
	}
}

/**
 * retrieves all the data needed to populate on-map report for
 * the given coordinates based on the given search radius on the
 * selected date
 * 
 * @param lat
 * @param lon
 * @param date
 * @param x
 * @param losRadius
 */
function showOnMapReport(lat, lon, date, x, losRadius){
	if (!typeof lat === 'number'){
		lat = lat.join(",");
		lon = lon.join(",");
	}	
	var key = 1;
	var d0;
	var d1;
	var d;
	var points;
	onMapCluster = new L.FeatureGroup();
	onMapStopCluster=new L.FeatureGroup();
	onMapRouteCluster=new L.FeatureGroup();
	onMapBlockCluster=new L.FeatureGroup();
	onMapTractCluster=new L.FeatureGroup();
	onMapPnrCluster = new L.FeatureGroup();
	onMapPnrStopCluster = new L.FeatureGroup();
	onMapPnrRouteCluster = new L.FeatureGroup();
	onMapCluster.addLayer(onMapStopCluster);
	onMapCluster.addLayer(onMapRouteCluster);
	onMapCluster.addLayer(onMapBlockCluster);
	onMapCluster.addLayer(onMapPnrCluster);
	onMapCluster.addLayer(onMapPnrStopCluster);
	onMapCluster.addLayer(onMapPnrRouteCluster);
	map.addLayer(onMapCluster);
	stopCluster = new Array();
	routeCluster = new Array();
	blockCluster = new Array();
	tractCluster = new Array();
	pnrCluster = new Array();	
	
	var MapBlk;
	var MapBlkSvc;
	var blocksLegendFlag = 0;
	var indx;
	
	var GcolorArray=['blockscluster', 'tractscluster'];
	$('#displayTransitReport').empty();
	$('#displayGeoReport').empty();
	$('#displayPnrCounties').empty();
	$("#overlay").show();	
	$.ajax({
		type: 'GET',
		datatype: 'json',
		url: '/TNAtoolAPI-Webapp/queries/transit/onmapreport?&lat='+lat+'&lon='+lon+'&x='+x+'&day='+date+'&dbindex='+dbindex+'&losRadius='+losRadius+'&username='+getSession(),
		async: true,
		success: function(data){
			//------------ populating "Transit Agencies" tab -------------
			MapBlk = data.MapTR.MapBL;
			MapBlkSvc = data.MapTR.MapBLS;
			$('#ts').html(numberconv(data.MapTR.TotalStops));
			$('#tr').html(numberconv(data.MapTR.TotalRoutes));
			$('#af').html('$'+Math.round(data.MapTR.AverageFare*100)/100);
			$('#mff').html('$'+data.MapTR.MedianFare);
			var html = '<table id="transitTable" class="display" align="center">';
			var tmp = '<th>Agency Name</th>'+
			'<th>Routes</th>'+
			'<th>Stops</th>'+
			'<th>Visit Count</th></tr>';	
			html += '<thead>'+tmp+'</thead><tbody>';
			var html2 = '<tfoot>'+tmp+'</tfoot>';
			var popupOptions = {'offset': L.point(0, -8)};
			$.each(data.MapTR.MapAL, function(i,item){
				html += '<td>'+item.Name+'</td>'+
						'<td>'+numberconv(item.RoutesCount)+'</td>'+
						'<td>'+numberconv(item.MapSL.length)+'</td>'+
						'<td>'+numberconv(item.ServiceStop)+'</td></tr>';
				
				//------------ adding routes and stops shapes to the map -------------
				var tmpRouteCluster = new L.FeatureGroup();
				
				var c = i % 6;
				var tmpStopCluster = new L.MarkerClusterGroup({
					maxClusterRadius: 120,
					iconCreateFunction: function (cluster) {
						return new L.DivIcon({ html: cluster.getChildCount(), className: colorArray[c], iconSize: new L.Point(30, 30) });
					},
					spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true, singleMarkerMode: false, maxClusterRadius: 30
				});
				$.each(item.MapSL, function(j,jtem){
					var marker = new L.CircleMarker([jtem.Lat,jtem.Lng], {		
						radius: 8,		
				        fillColor: colorset[c],		
				        color: "#333333",		
				        weight: 2,		
				        opacity: 1,		
				        fillOpacity: 0.8,		
				    });
					pophtml='<br><b>Serving Routes ID(s):</b>';
					$.each(jtem.MapRI, function(h,htem){
						pophtml+='<br><span style="margin-left:2em">'+htem+'</span>';
					});
					marker.bindPopup('<b>Stop ID:</b> '+jtem.Id+
							'<br><b>Stop Name:</b> '+jtem.Name+
							'<br><b>Agency:</b> '+jtem.AgencyId+
							'<br><b>Service Frequency :</b> '+jtem.Frequency+pophtml,popupOptions);
					tmpStopCluster.addLayer(marker);
				});
				stopCluster.push(tmpStopCluster);
				$.each(item.MapRL, function(k,ktem){
					if(ktem.hasDirection){
						d0 = L.PolylineUtil.decode(ktem.Shape0);
						d1 = L.PolylineUtil.decode(ktem.Shape1);
						points = [d0, d1];
					}else{
						d = L.PolylineUtil.decode(ktem.Shape);
						points = [d];
					}
					var polyline = L.multiPolyline(points, {	
						weight: 5,
						color: colorset[c],
						opacity: .5,
						smoothFactor: 1
						});	
					polyline.bindPopup('<b>Route ID:</b> '+ktem.Id
							+'<br><b>Route Name:</b> '+ktem.Name
							+'<br><b>Agency:</b> '+ktem.AgencyId
							+'<br><b>Length:</b> '+numberconv(Math.round(ktem.Length*100)/100)+' miles'
							+'<br><b>Average Route Fare: </b> '+ktem.Fare
							+'<br><b>Run Frequency:</b> '+ktem.Frequency);
					tmpRouteCluster.addLayer(polyline);
				});
				routeCluster.push(tmpRouteCluster);
			});		
			html = html + '</tbody></table>';
			$('#displayTransitReport').append($(html));
			var transitTable = $('#transitTable').DataTable( {
				"paging": false,
				"bSort": false,
				"dom": 'T<"clear">lfrtip',
		        "tableTools": {
		        	"sSwfPath": "js/lib/DataTables/swf/copy_csv_xls_pdf.swf",
		        	"sRowSelect": "multi",
		        	"aButtons": []}
			});
			$("#transitTable_length").remove();
		    $("#transitTable_filter").remove();
		    $("#transitTable_info").remove();
		    transitTable.$('tr').click( function () {
		    	if($(this).hasClass('selected')){
		    		
		    		onMapStopCluster.removeLayer(stopCluster[$(this).index()]);
		    		onMapRouteCluster.removeLayer(routeCluster[$(this).index()]);
		    	}else{
		    		
		    		onMapStopCluster.addLayer(stopCluster[$(this).index()]);
		    		onMapRouteCluster.addLayer(routeCluster[$(this).index()]);
		    	}
		    });
		    
		    
			//------------ populating "Census" tab -------------
			$('#tpu').html(numberconv(data.MapG.UrbanPopulation));
			$('#tpr').html(numberconv(data.MapG.RuralPopulation));
			$('#tee').html(numberconv(data.MapG.Wac));
			$('#tem').html(numberconv(data.MapG.Rac));
			$('#tb').html(numberconv(data.MapG.TotalBlocks));
			$('#tt').html(numberconv(data.MapG.TotalTracts));					
			html = '<table id="geoTable" class="display" align="center">';
			tmp = '<th>County Name</th>'+
			'<th>Tracts</th>'+
			'<th>Blocks</th>'+
			'<th>Urban Pop. (2010)</th>'+
			'<th>Rural Pop. (2010)</th>'+
			'<th>Employee (2013)</th>'+
			'<th>Employment (2013)</th></tr>';
			html += '<thead>'+tmp+'</thead><tbody>';
			var popupOptions = {'offset': L.point(0, -8)};
			$.each(data.MapG.MapCL, function(i,item){
			
			if(item.Name!=null)
				html += '<td>'+item.Name.replace(' County','')+'</td>';
			else
				html +='<td>'+"null"+'</td>';
				
				html+='<td>'+numberconv(item.MapTL.length)+'</td>'+
						'<td>'+numberconv(item.MapBL.length)+'</td>'+
						'<td>'+numberconv(item.UrbanPopulation)+'</td>'+
						'<td>'+numberconv(item.RuralPopulation)+'</td>'+
						'<td>'+numberconv(item.Wac)+'</td>'+	
						'<td>'+numberconv(item.Rac)+'</td></tr>';	
				
				//------------ adding census blocks and tracts shapes to the map -------------
				var tmpBlockCluster = new L.FeatureGroup();
				var tmpTractCluster = new L.MarkerClusterGroup({
					maxClusterRadius: 80,
					iconCreateFunction: function (cluster) {
						return new L.DivIcon({ html: cluster.getChildCount(), className: GcolorArray[1], iconSize: new L.Point(30, 30) });						
					},
					spiderfyOnMaxZoom: true, showCoverageOnHover: false, zoomToBoundsOnClick: true, singleMarkerMode: false
				});
				$.each(item.MapBL, function(j,jtem){							
						var marker = new L.CircleMarker([jtem.Lat,jtem.Lng], {		
							radius: 6,		
							fillColor: getColorBlocks(jtem.Density),		
					        color: "#0f3885",		
					        weight: 0,		
					        opacity: 1,		
					        fillOpacity: 0.8,		
					    });
						var blkSvcFreq;
						
						indx = MapBlk.indexOf(jtem.ID);
						if(indx!=-1){
							marker.svc = scaledSvc(MapBlkSvc[indx]);
							blkSvcFreq = MapBlkSvc[indx];
						}else{
							marker.svc = 0;
							blkSvcFreq = 0;
						}
						marker.popDensity = jtem.Density;
						marker.racDensity = jtem.RacDensity;
						marker.wacDensity = jtem.WacDensity;
						marker.bindPopup('<b>Block ID:</b> '+jtem.ID
								+'<br><b>Type:</b> '+jtem.Type
								+'<br><b>Population:</b> '+numberconv(jtem.Population)
								+'<br><b>Employees:</b> '+numberconv(jtem.Wac)
								+'<br><b>Employment:</b> '+numberconv(jtem.Rac)
								+'<br><b>Level of Service:</b> '+numberconv(blkSvcFreq)
								+'<br><b>County:</b> '+jtem.County
								+'<br><b>Land Area:</b> '+ numberconv(Math.round(parseFloat(jtem.LandArea)*0.0000386102)/100)
								+' mi<sup>2</sup>',popupOptions
								);
						tmpBlockCluster.addLayer(marker);				
				});
				blockCluster.push(tmpBlockCluster);				
				$.each(item.MapTL, function(k,ktem){
					var tractmarker = new L.CircleMarker([ktem.Lat,ktem.Lng], {		
						radius: 8,		
				        fillColor: "#0000FF",		
				        color: "#333333",		
				        weight: 2,		
				        opacity: 1,		
				        fillOpacity: 0.8,		
				    });
					tractmarker.bindPopup('<b>Tract ID:</b> '+ktem.ID
							+'<br><b>Population:</b> '+numberconv(ktem.Population)
							+'<br><b>County:</b> '+ktem.County
							+'<br><b>Land Area:</b> '+ numberconv(Math.round(parseFloat(ktem.LandArea)*0.0000386102)/100)
							+' mi<sup>2</sup>',popupOptions);
					tmpTractCluster.addLayer(tractmarker);
				});
				tractCluster.push(tmpTractCluster);
			});		
			html = html + '</tbody></table>';
			$('#displayGeoReport').append($(html));
			var geoTable = $('#geoTable').DataTable( {
				"paging": false,
				"bSort": false,
				"bAutoWidth": false,
				"dom": 'T<"clear">lfrtip',
				"tableTools":{
		        	"sSwfPath": "js/lib/DataTables/swf/copy_csv_xls_pdf.swf",
		        	"sRowSelect": "multi",
		        	"aButtons": []}
			});
			$("#geoTable_length").remove();
		    $("#geoTable_filter").remove();
		    $("#geoTable_info").remove();
		    geoTable.$('tr').click( function () {
		    	if($(this).hasClass('selected')){		    		
		    		onMapBlockCluster.removeLayer(blockCluster[$(this).index()]);
		    		onMapTractCluster.removeLayer(tractCluster[$(this).index()]);
		    		blocksLegendFlag--;
		    	}else{		    		
		    		onMapBlockCluster.addLayer(blockCluster[$(this).index()]);
		    		onMapTractCluster.addLayer(tractCluster[$(this).index()]);
		    		blocksLegendFlag++;
		    	}
		    	if(blocksLegendFlag==0){
		    		$('#blocksLengend').hide();
		    	}else{
		    		$('#blocksLengend').show();
		    	}
		    });		 
		    
			//------------ populating "Title VI" tab -------------		
		    var title6 = data.MapG.TitleVI;
			$('#pd').html(addPercent((100*title6.with_disability/(title6.with_disability+title6.without_disability)).toFixed(2)));		
		    $('#pp').html(addPercent((100*title6.below_poverty/(title6.below_poverty+title6.above_poverty)).toFixed(2)));		
		    		
		    $('#pew').html(numberconv(title6.white.toFixed(0)));		
		    $('#peh').html(numberconv(title6.hispanic_or_latino.toFixed(0)));		
		    $('#peb').html(numberconv(title6.black_or_african_american.toFixed(0)));		
		    $('#pei').html(numberconv(title6.american_indian_and_alaska_native.toFixed(0)));		
		    $('#pea').html(numberconv(title6.asian.toFixed(0)));		
		    $('#pen').html(numberconv(title6.native_hawaiian_and_other_pacific_islander.toFixed(0)));		
		    $('#pet').html(numberconv(title6.two_or_more.toFixed(0)));		
		    $('#peo').html(numberconv(title6.other_races.toFixed(0)));		
		    		
		    $('#pa5').html(numberconv(title6.from5to17.toFixed(0)));		
		    $('#pa18').html(numberconv(title6.from18to64.toFixed(0)));		
		    $('#pa64').html(numberconv(title6.above65.toFixed(0)));		
		    		
		    $('#plse').html(numberconv(title6.english.toFixed(0)));		
		    $('#plss').html(numberconv(title6.spanish.toFixed(0)));		
		    $('#plss1').html(numberconv(title6.spanishverywell.toFixed(0)));		
		    $('#plss2').html(numberconv(title6.spanishwell.toFixed(0)));		
		    $('#plss3').html(numberconv(title6.spanishnotwell.toFixed(0)));		
		    $('#plss4').html(numberconv(title6.spanishnotatall.toFixed(0)));		
		    		
		    $('#plsa').html(numberconv(title6.asian_and_pacific_island.toFixed(0)));		
		    $('#plsa1').html(numberconv(title6.asian_and_pacific_islandverywell.toFixed(0)));		
		    $('#plsa2').html(numberconv(title6.asian_and_pacific_islandwell.toFixed(0)));		
		    $('#plsa3').html(numberconv(title6.asian_and_pacific_islandnotwell.toFixed(0)));		
		    $('#plsa4').html(numberconv(title6.asian_and_pacific_islandnotatall.toFixed(0)));		
		    		
		    $('#plsi').html(numberconv(title6.indo_european.toFixed(0)));		
		    $('#plsi1').html(numberconv(title6.indo_europeanverywell.toFixed(0)));		
		    $('#plsi2').html(numberconv(title6.indo_europeanwell.toFixed(0)));		
		    $('#plsi3').html(numberconv(title6.indo_europeannotwell.toFixed(0)));		
		    $('#plsi4').html(numberconv(title6.indo_europeannotatall.toFixed(0)));		
		    		
		    $('#plso').html(numberconv(title6.other_languages.toFixed(0)));		
		    $('#plso1').html(numberconv(title6.other_languagesverywell.toFixed(0)));		
		    $('#plso2').html(numberconv(title6.other_languageswell.toFixed(0)));		
		    $('#plso3').html(numberconv(title6.other_languagesnotwell.toFixed(0)));		
		    $('#plso4').html(numberconv(title6.other_languagesnotatall.toFixed(0)));

			//------------ populating "Park and Ride" tab -------------
		    $('#npnr').html(numberconv(data.MapPnR.totalPnR));
			$('#nspc').html(numberconv(data.MapPnR.totalSpaces));
			var html = 	'<table id="pnrTable" class="display" align="center">';
			var tmp = 	'<tr><th>Row</th>'+
						'<th>County</th>'+
						'<th>P&R Lots</th>'+
						'<th>Spaces</th></tr>';
			
			html += '<thead>'+tmp+'</thead><tbody>';
			var html2 = '<tfoot>'+tmp+'</tfoot>';
			var counter=1;
			$.each(data.MapPnR.MapPnrCounty, function(i,item){
				html += '<tr><td>'+(counter++)+'</td>'+
				
						'<td>'+item.countyName+'</td>'+
						'<td>'+item.totalPnRs+'</td>'+
						'<td>'+numberconv(item.totalSpaces)+'</td></tr>';
				
				//---------------- adding park and ride icons to the map -----------------
				var tmpPnrCluster = new L.FeatureGroup();	
				onMapIcon = L.icon({
				    iconUrl: '../vendors/leaflet-0.7/images/pnr.ico',
				    iconSize:     [40, 40], // size of the icon
				    iconAnchor:   [20, 39], // point of the icon which will correspond to marker's location
				    popupAnchor:  [0, -36] // point from which the popup should open relative to the iconAnchor
				});
				var cntr=1;
				$.each(item.MapPnrRecords, function(j,jtem){
					var marker = L.marker([jtem.lat,jtem.lon], {icon: onMapIcon})/*.on('click',onClick)*/;
					marker.markerId = jtem.id;
					marker.markerCountyId = jtem.countyId;
					marker.markerLat = jtem.lat;
					marker.markerLon = jtem.lon;
					var temp='<b>County Name:</b> '+jtem.countyName+
							'<br><b>Lot Name:</b> '+jtem.lotName+
							'<br><b>Total Spaces: </b> '+jtem.spaces+
							'<br><b>Availability: </b> '+jtem.availability+
							'<br><b>Display stops within:</b><input type="text" style="width:3em" id="'+jtem.lat+'pnrRadius" name="radius" class="utbox" size="5" value='+ pnrRadius +' required class="utbox">miles'+
							'<br><input type="submit" style="margin:1px auto;width:100px; text-align:center;" value="Submit" onclick="nearbyStops(\''+marker.markerId+'\',\''+marker.markerCountyId+'\', \''+marker.markerLat+'\', \''+marker.markerLon+'\', \''+marker.markerLat+'pnrRadius\')" title="Click submit to reload the near stop(s)" class="button">';
					marker.bindPopup(temp);
					marker.markerId = jtem.id;
					marker.markerCountyId = jtem.countyId;
					marker.markerLat = jtem.lat;
					marker.markerLon = jtem.lon;
					tmpPnrCluster.addLayer(marker);
				});	
			pnrCluster.push(tmpPnrCluster);
			});
			
			html = html + '</tbody></table>';
			$('#displayPnrCounties').append($(html));
			var pnrTable = $('#pnrTable').DataTable( {
				"paging": false,
				"bSort": false,
				"dom": 'T<"clear">lfrtip',
		        "tableTools": {
		        	"sSwfPath": "js/lib/DataTables/swf/copy_csv_xls_pdf.swf",
		        	"sRowSelect": "multi",
		        	"aButtons": []},
			});		
			
			$("#pnrTable_length").remove();
		    $("#pnrTable_filter").remove();
		    $("#pnrTable_info").remove();
		    
		    
		    pnrTable.$('tr').click( function () {
		    	if($(this).hasClass('selected')){
		    		onMapPnrCluster.removeLayer(pnrCluster[$(this).children().eq(0).html()-1]);	// remove P&R icons
		    		onMapPnrStopCluster.eachLayer(function (layer) {		// remove nearby stops
						onMapPnrStopCluster.removeLayer(layer);
						});
		    		onMapPnrRouteCluster.eachLayer(function (layer) {		// remove nearby routes
						onMapPnrRouteCluster.removeLayer(layer);
						});
		    	}else{
		    		onMapPnrCluster.addLayer(pnrCluster[$(this).children().eq(0).html()-1]);
		    	}
		    });
		    
		    $('pnrTable')
		    $('.dataTables_scrollHead thead th').css('text-align','center');
			$('#dialogPreLoader').hide();
			$("#tabs").show();
		},
		complete: function(){
			$("#overlay").hide();
		}
	});
	
}

/**
 * log-transforms blocks' level of service markers for better visualization of service
 * @param svc
 * @returns
 */
function scaledSvc(svc){
	svc = Math.ceil(Math.log2(svc));	
	return svc;
}

/**
 * gets stops and routes that are located within a given radius of 
 * the park and ride. The routes and stops are added to the map.
 * 
 * @param markerId
 * @param countyId
 * @param lat
 * @param lon
 * @param radius
 */
function nearbyStops(markerId, countyId, lat ,lon, radius){
	PnrRadius = document.getElementById(radius).value;
	if (exceedsMaxRadius(PnrRadius)){	// Checks if the entered search radius exceeds the maximum.
		alert('Enter a number less than ' + maxRadius + ' miles for the population search radius.');
		return;
	}	
	PnrRadius = PnrRadius*1609.34;
	
	$.ajax({
		type: 'GET',
		datatype: 'json',
		url: 	'/TNAtoolAPI-Webapp/queries/transit/pnrstopsroutes?&pnrId=' + markerId +
				'&pnrCountyId=' + countyId + '&lat=' + lat +
				'&lng=' + lon + '&radius=' + PnrRadius + '&dbindex=' + dbindex + '&username=' + getSession(),
		async: true,
		success: function(data){			
			var tmpPnrRouteCluster = new L.FeatureGroup();
			var c = i % 6;
			var tmpPnrStopCluster = new L.MarkerClusterGroup({
				maxClusterRadius: 120,
				iconCreateFunction: function (cluster) {
					return new L.DivIcon({ html: cluster.getChildCount(), className: colorArray[c], iconSize: new L.Point(30, 30) });
				},
				spiderfyOnMaxZoom: true, showCoverageOnHover: true, zoomToBoundsOnClick: true, singleMarkerMode: true, maxClusterRadius: 30
			});
			$.each(data.MapPnrSL, function(k,ktem){
					var marker = L.marker([ktem.Lat,ktem.Lng]);
					marker.bindPopup('<b>Stop ID:</b> '+ktem.Id+'<br><b>Stop Name:</b> '+ktem.Name+'<br><b>Agency:</b> '+ktem.AgencyId);
					tmpPnrStopCluster.addLayer(marker);
				});	
			pnrStopCluster = tmpPnrStopCluster;
			
			$.each(data.MapPnrRL, function(k,ktem){
				d = L.PolylineUtil.decode(ktem.Shape);
				points = [d];
				var polyline = L.multiPolyline(points, {	
					weight: 5,
					color: colorset[k],
					opacity: .5,
					smoothFactor: 1
					});	
				polyline.bindPopup('<b>Route ID:</b> '+ktem.Id+'<br><b>Route Name:</b> '+ktem.Name+'<br><b>Agency:</b> '+ktem.AgencyId);
				tmpPnrRouteCluster.addLayer(polyline);
				});
			pnrRouteCluster = tmpPnrRouteCluster;
			
			onMapPnrStopCluster.eachLayer(function (layer) {
				onMapPnrStopCluster.removeLayer(layer);
				});
			onMapPnrStopCluster.addLayer(pnrStopCluster); // No need for the index
			onMapPnrRouteCluster.eachLayer(function (layer) {
				onMapPnrRouteCluster.removeLayer(layer);
				});
			onMapPnrRouteCluster.addLayer(pnrRouteCluster); // No need for the index
			if (data.MapPnrSL.length == 0){
				alert('There is no stop within the specified distance');
			}
		}
	});				
}
