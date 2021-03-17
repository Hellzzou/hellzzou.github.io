function insertPointInTable(id, point){
	$(id+' td[class=name]').html(point.name);
	$(id+' td[class=latitude]').html(point.latitudeInString);
	$(id+' td[class=longitude]').html(point.longitudeInString);
	$(id+' td[class=altitude]').html(point.altitude);
	calculateAllDistancesAndCorrectedQfe();
	var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  		return new bootstrap.Tooltip(tooltipTriggerEl)
	});
}
function createNewLineInTable(point){
	let id = ( $('tr').length == 3 ) ? 0 : $('tr').eq($('tr').length - 2).attr('id') + 1;
	let newTr = $('<tr>',{
		id : id,
		class :'ui-sortable-handle'
	});
	let newTh = $('<th>',{
		class : 'pointer',
		html : '<img src="images/croixrouge1.png" width="18" height="18">',
	});
	newTh.on("click", function(){
		this.parentNode.remove();
		calculateAllDistancesAndCorrectedQfe();
	});
	newTh.appendTo(newTr);
	$('<td>',{class:'name'}).appendTo(newTr);
	$('<td>',{class:'latitude'}).appendTo(newTr);
	$('<td>',{class:'longitude'}).appendTo(newTr);
	$('<td>',{class:'altitude'}).appendTo(newTr);
	$('<td>',{class:'qfec'}).appendTo(newTr);
	$('<td>',{class:'distance'}).appendTo(newTr);
	$('<td>',{class:'remainingDistance'}).appendTo(newTr);
	let tdinfo = $('<td>',{
		class:'infos',
		html :'<img data-bs-toggle="tooltip" data-bs-placement="left" title='+point.mgrs.replace(/ /g, "-")+' src="images/information.png" width="22" height="22">',
	});
	tdinfo.on('click',function(){});
	tdinfo.appendTo(newTr);
	let tdsave = $('<td>',{
		class:'save',
		html:'<img src="images/save.png" width="22" height="22">',
	});
	tdsave.on('click',function(){
		let id = this.parentNode.getAttribute('id');
		saveNewPointModal($('#'+id+' td[class=name]').html(), $('#'+id+' td[class=altitude]').html(), $('#'+id+' td[class=latitude]').html(), $('#'+id+' td[class=longitude]').html())});
	tdsave.appendTo(newTr);
	$('#tableBody tr:last').before(newTr);
	insertPointInTable('#'+id, point);
}
async function loadIFRPointsBeginingByInSelect(requestedName){
	$('#ifrpoints').empty();
	resetForm('#pointDatas');
	resetForm('#pointDatas');
	if ( $('#pointBegining').val().length >= 2 ){
		const points = ( $('#pointType').val() == 'point de CTL' ) ? await postFetchRequest('http://localhost:3000/api/CTLPoints/beginningBy', {"name":requestedName}) : await postFetchRequest('http://localhost:3000/api/IFRpoints/beginningBy', {"name":requestedName});
		if ( typeof points[0] == 'undefined' ) {
			$('#pointBegining').removeClass('is-valid').addClass('is-invalid');
			$('#pointBeginingSmall').html('pas de correspondance');
		}
		else{
			if ( $('#pointType').val() == 'point de CTL' ) for ( let i = 0 ; i < points.length ; i++ ) $('#ifrpoints').append(new Option(points[i].name, points[i].name));
			else for ( let i = 0 ; i < points.length ; i++ ) $('#ifrpoints').append(new Option(points[i].WPT_IDENT, points[i].WPT_IDENT));
			DisplayIfrPointInformations($('#ifrpoints option').eq(0).val());
		}
	}
	checkForm('#pointDatas');
}
async function DisplayIfrPointInformations(ifrPointName){
	let points;
	let point;
	if ( $('#pointType').val() == 'point de CTL' ){
		points = await postFetchRequest('http://localhost:3000/api/CTLpoints', {"name":ifrPointName});
		point = Point.createInString(points[0].name, points[0].latitudeInString, points[0].longitudeInString, points[0].altitude);
	}
	else{
		points = await postFetchRequest('http://localhost:3000/api/IFRpoint', {"name":ifrPointName});
		point = Point.createInDegrees(points[0].WPT_IDENT, points[0].WGS_DLAT, points[0].WGS_DLONG, 0);
	}
	$('#pointName').val(point.name);
	$('#pointAlti').val(point.altitude);
	$('#northSouthcoordinate').val(point.latitudeInString);
	$('#eastWestcoordinate').val(point.longitudeInString);
	checkForm('#pointDatas');
}
async function saveTransitInDb(){
	let transit = new Transit($('#savedTransitName').val().toUpperCase(),[]);
	for ( let i = 0 ; i < $('.name').length ; i++) transit.points.push(Point.createInString($('.name').eq(i).html(), $('.latitude').eq(i).html(), $('.longitude').eq(i).html(), $('.altitude').eq(i).html()));
	$('#saveTransitModal').modal('hide');
	if ( await postFetchRequest('http://localhost:3000/api/transit/save', transit) == 'success' ){
		$('#savedAlert').addClass('show');
		setTimeout(()=>$('#savedAlert').removeClass('show'), 2000);
	}
}
function displayTransitToSaveInDialog(){
	if ( $('#departureAirfield td[class=name]').html() != '' && $('#arrivalAirfield td[class=name]').html() != ''){
		$('#saveTransitModal').modal('show');
		$('#savedTransitName').val($('#departureAirfield td[class=name]').html() +' - '+ $('#arrivalAirfield td[class=name]').html());
		checkForm('#saveTransitModal');
		$('#savedTransitName').on('keyup', function(){checkForm('#saveTransitModal');});
		$('#saveTransitModalButton').on("click", saveTransitInDb);
	}
	else alert('Vous essayez de sauvegarder un transit vide');
}
async function DisplayTransitInTable(transitName){
	const transit = await postFetchRequest('http://localhost:3000/api/transit/load', {"name":transitName})
	const points = transit[0].points;
	$('.airfields td').val('');
	$("#tableBody tr:not('.airfields')").remove();
	insertPointInTable('#departureAirfield', Point.createInString(points[0].name, points[0].latitudeInString, points[0].longitudeInString, points[0].altitude));
	for( let i = 1 ; i < points.length - 1 ; i ++ ) createNewLineInTable(Point.createInString(points[i].name, points[i].latitudeInString, points[i].longitudeInString, points[i].altitude));
	insertPointInTable('#arrivalAirfield', Point.createInString(points[points.length - 1].name, points[points.length - 1].latitudeInString, points[points.length - 1].longitudeInString, points[points.length - 1].altitude));
	$('#airfields').addClass('d-none');
	$('#providedPointForm').removeClass('d-none');
	resetForm('#providedPointForm');
	$('#loadTransitModal').modal('hide');
}
async function loadTransitInDialog(){
	$('#loadTransitModal').modal('show');
	const transits = await getFetchRequest('http://localhost:3000/api/transit/display');
	document.getElementById('transitToSelect').length = 0;
	for ( let i = 0 ; i < transits.length ; i++ ) $('#transitToSelect').append(new Option(transits[i].name, transits[i].name));
	$('#loadTransitModalButton').on("click", function(){DisplayTransitInTable($('#transitToSelect').val())});
}
async function insertAirfieldsInTable(){
	if ( $('#departurAirfieldSelect').val() != 'Choix'  && $('#arrivalAirfieldChoice').val() != 'Choix'){
		departure = await postFetchRequest('http://localhost:3000/api/InsertAirfields', {"name":$('#departureAirfieldChoice').val(),"type":$('input[name=searchType]:checked').val()});
		arrival = await postFetchRequest('http://localhost:3000/api/InsertAirfields', {"name":$('#arrivalAirfieldChoice').val(),"type":$('input[name=searchType2]:checked').val()});
		insertPointInTable('#departureAirfield', Point.createInDegrees(departure[0].NAME, departure[0].WGS_DLAT, departure[0].WGS_DLONG, departure[0].ELEV));
		insertPointInTable('#arrivalAirfield', Point.createInDegrees(arrival[0].NAME, arrival[0].WGS_DLAT, arrival[0].WGS_DLONG, arrival[0].ELEV));
		$('#airfields').addClass('d-none');
		$('#providedPointForm').removeClass('d-none');
		resetForm('#providedPointForm');
	}
	else alert("Vous devez choisir un terrain de départ et d'arrivée");
}
async function loadAirfieldsSelect(fieldset, radioName){
	$(fieldset+' select').empty();
	if ( $(fieldset+' input[data-type=text]').val().length >= 2){
		const airfileds = await postFetchRequest('http://localhost:3000/api/loadAirfields', {"name":$(fieldset+' input[data-type=text]').val(),"type":$(fieldset+' input[name='+radioName+']:checked').val()});
		if ( typeof airfileds[0] == 'undefined' ) {
			$(fieldset+' input[data-type=text]').removeClass('is-valid').addClass('is-invalid');
			$(fieldset+' small').html('pas de correspondace');
		}
		for ( let i = 0 ; i < airfileds.length ; i++) {
			if (($(fieldset+' input[name='+radioName+']:checked').val() == 'NAME' )) $(fieldset+' select').append(new Option(airfileds[i].NAME));
			else $(fieldset+' select').append(new Option(airfileds[i].ICAO));
		}
	}
}
function displayPLEDialog(){
	$('#calculatePLEModal').modal('show');
	let index = calculateAllDistancesAndCorrectedQfe()[0];
	$('#PLEPointName').val($('#'+index+' td[class=name]').html());
	$('#PLEPointDistance').val(calculateAllDistancesAndCorrectedQfe()[1]);
}
function displayAirfieldsSelection(){
	$('#airfields').removeClass('d-none');
	$('#providedPointForm').addClass('d-none');
	$('#departureRadio').attr('checked', "checked");
	$('#arrivalRadio').attr('checked', "checked");
	$('#departureAirfieldChoice').append(new Option($('#departureAirfield td[class=name').html()));
	$('#arrivalAirfieldChoice').append(new Option($('#arrivalAirfield td[class=name').html()));
	$('#departureAirfieldChoice').val($('#departureAirfield td[class=name').html());
	$('#arrivalAirfieldChoice').val($('#arrivalAirfield td[class=name').html());
}
async function saveAirfieldinDB(){
		let airfield = {
			ICAO : $('#newAirfieldICAO').val().toUpperCase(),
			NAME : $('#newAifieldName').val().toUpperCase(),
			WGS_LAT : $('#newAifieldLatitude').val().replace(/ /g,"").replace(".",""),
			WGS_DLAT :Point.transformCoordinateNorthSouthInDegrees($('#newAifieldLatitude').val()),
			WGS_LONG :$('#newAifieldLongitude').val().replace(/ /g,"").replace(".",""),
			WGS_DLONG :Point.transformCoordinateWestEastInDegrees($('#newAifieldLongitude').val()),
			ELEV : $('#newAifieldElevation').val(),
			TYPE : $('#newAifieldType').val()
		};
		$('#createNewAirfieldModal').modal('hide');
		if ( await postFetchRequest('http://localhost:3000/api/airfield/save', airfield) == 'success' ){
			$('#savedAlert').addClass('show');
			setTimeout(()=>$('#savedAlert').removeClass('show'), 2000);
		}
}
function saveNewAifield(){
	resetForm('#createNewAirfieldModal');
	$('#createNewAirfieldModal').modal('show');
	$('#createNewAirfieldModal input').on('keyup', function(){checkForm('#createNewAirfieldModal');});
	$('#saveNewAirfieldModal').on('click', saveAirfieldinDB);
}
async function savePointinDb(){
	let point = Point.createInString($('#newPointName').val().toUpperCase(), $('#newPointLatitude').val(), $('#newPointLongitude').val(), $('#newPointElev').val());
	$('#createNewPointModal').modal('hide');
	if ( await postFetchRequest('http://localhost:3000/api/ctlPoint/save', point) == 'success'){
		$('#savedAlert').addClass('show');
		setTimeout(()=>$('#savedAlert').removeClass('show'), 2000);
	}
}
function saveNewPointModal(name, altitude, latitude, longitude){
	$('#newPointName').val(name);
	$('#newPointElev').val(altitude);
	$('#newPointLatitude').val(latitude);
	$('#newPointLongitude').val(longitude);
	$('#createNewPointModal').modal('show');
	checkForm('#createNewPointModal');
	$('#createNewPointModal input').on('keyup', function(){checkForm('#createNewPointModal');});
	$('#saveNewPointModal').on('click', savePointinDb);
}
(function (){
	$('#createPointButton').on("click", function(){createNewLineInTable(Point.createInString($('#pointName').val(), $('#northSouthcoordinate').val(), $('#eastWestcoordinate').val(), $('#pointAlti').val()))});
	$('#razPointButton').on("click", function(){resetForm('#providedPointForm');});
	$('#departureSearch').on('keyup', function(){checkForm('#departureSearchFieldset');});
	$('#arrivalSearch').on('keyup', function(){checkForm('#arrivalSearchFieldset');});
	$('#pointBegining').on('keyup', function(){checkForm('#pointTypeFieldset');});
	$('#saveTransit').on("click", displayTransitToSaveInDialog);
	$('#loadTransit').on("click",loadTransitInDialog);
	$('#insertAirfields').on("click", insertAirfieldsInTable);
	$('#calculatePLE').on("click", displayPLEDialog);
	$('#changeAirfields').on("click", displayAirfieldsSelection);
	$('#pointBegining').on("keyup",function(){loadIFRPointsBeginingByInSelect($('#pointBegining').val());});
	$('#departureSearch').on("keyup",function(){loadAirfieldsSelect('#departureSearchFieldset', 'searchType');});
	$('#arrivalSearch').on("keyup",function(){loadAirfieldsSelect('#arrivalSearchFieldset', 'searchType2');});
	$('input[name=searchType]').on("change",function(){loadAirfieldsSelect('#departureSearchFieldset', 'searchType');});
	$('input[name=searchType2]').on("change",function(){loadAirfieldsSelect('#arrivalSearchFieldset', 'searchType2');});
	$('#ifrpoints').on("change",function(){DisplayIfrPointInformations($('#ifrpoints').val())});
	$('#saveNewAirfield').on('click', saveNewAifield);
	$('#pointType').on('change', function(){resetForm('#providedPointForm');});
	$('#saveNewPoint').on('click', function(){saveNewPointModal('','','','')});
	$('#pointDatas input').on('keyup', function(){checkForm('#pointDatas');})
	$('tbody').sortable({
		axis : "y",
		cursor : "pointer",
		containment : "tbody",
		scroll : true,
		stop : function(event, ui){calculateAllDistancesAndCorrectedQfe();}
	});
})();