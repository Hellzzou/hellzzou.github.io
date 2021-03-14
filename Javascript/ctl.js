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
function removePoint(deleteButton){
	deleteButton.remove();
	calculateAllDistancesAndCorrectedQfe();
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
	newTh.on("click", function(){removePoint(this.parentNode)});
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
		saveNewPoint($('#'+id+' td[class=name]').html(), $('#'+id+' td[class=altitude]').html(), $('#'+id+' td[class=latitude]').html(), $('#'+id+' td[class=longitude]').html())});
	tdsave.appendTo(newTr);
	$('#tableBody tr:last').before(newTr);
	insertPointInTable('#'+id, point);
}
function displayPoint(){
	if (isValid($('#pointName')) && isValid($('#northSouthcoordinate')) && isValid($('#eastWestcoordinate'))){
		let point = Point.createInString($('#pointName').val(), $('#northSouthcoordinate').val(), $('#eastWestcoordinate').val(), $('#pointAlti').val());
		createNewLineInTable(point);
	}
}
async function loadIFRPointsBeginingByInSelect(requestedName){
	const points = ( $('#pointType').val() == 'point de CTL' ) ? await postFetchRequest('http://localhost:3000/api/CTLPoints/beginningBy', {"name":requestedName}) : await postFetchRequest('http://localhost:3000/api/IFRpoints/beginningBy', {"name":requestedName});
	document.getElementById('ifrpoints').length = 1;
	if ( $('#pointType').val() == 'point de CTL' ) for ( let i = 0 ; i < points.length ; i++ ) $('#ifrpoints').append(new Option(points[i].name, points[i].name));
	else for ( let i = 0 ; i < points.length ; i++ ) $('#ifrpoints').append(new Option(points[i].WPT_IDENT, points[i].WPT_IDENT));
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
		point = Point.createInDegrees(points[0].WPT_IDENT, points[0].WGS_DLAT, points[0].WGS_DLONG, '');
	}
	$('#pointName').val(point.name);
	$('#pointAlti').val(point.altitude);
	$('#northSouthcoordinate').val(point.latitudeInString);
	$('#eastWestcoordinate').val(point.longitudeInString);
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
		$('#newTransitImg').prop('checked', false);
		$('#saveTransitModalButton').prop('disabled', true);
		$('#saveTransitModal').modal('show');
		$('#savedTransitName').val($('#departureAirfield td[class=name]').html() +' - '+ $('#arrivalAirfield td[class=name]').html());
		checkinputTransit($('#savedTransitName'), $('#newTransitSmall'), $('#newTransitImg'), 'Le nom du transit doit avoir au moins 5 caractères', 'Ce nom de transit existe déjà', 'transit', '#saveTransitModal small', '#saveTransitModalButton');
		$('#savedTransitName').on('keyup', function(){checkinputTransit($('#savedTransitName'), $('#newTransitSmall'), $('#newTransitImg'), 'Le nom du transit doit avoir au moins 5 caractères', 'Ce nom de transit existe déjà', 'transit', '#saveTransitModal small', '#saveTransitModalButton');});
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
	}
	else alert("Vous devez choisir un terrain de départ et d'arrivée");
}
async function loadAirfieldsSelect(airfieldType, airfieldSearch, airfieldSelect){
	const airfileds = await postFetchRequest('http://localhost:3000/api/loadAirfields', {"name":airfieldSearch,"type":airfieldType.val()});
	airfieldSelect.length = 1;
	for ( let i = 0 ; i < airfileds.length ; i++) airfieldSelect.options[airfieldSelect.options.length] = ( airfieldType.val() == 'NAME' ) ? new Option(airfileds[i].NAME) : new Option(airfileds[i].ICAO);
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
function resetSaveAIrfieldModal(){
	$('#createNewAirfieldModal input[type=text]').val('');
	$('#newAirfieldICAOSmall').html('Le code OACI doit avoir 4 caractères');
	$('#newAirfieldICAOImg').prop('checked', false);
	$('#newAifieldNameSmall').html('Le nom du terrain doit avoir au moins 3 caractères');
	$('#newAifieldNameImg').prop('checked', false);
	$('#newAifieldLatitudeSmall').html('Format : NXX XX.XX');
	$('#newAifieldLatitudeImg').prop('checked', false);
	$('#newAifieldLongitudeSmall').html('Format : WXXX XX.XX');
	$('#newAifieldLongitudeImg').prop('checked', false);
	$('#newAifieldElevationSmall').html('Doit être compris entre 0 et 30 000 pieds');
	$('#newAifieldElevationImg').prop('checked', false);
	$('#newAifieldType').val('CIVIL');
	$('#saveNewAirfieldModal').prop('disabled', true);
}
function enableSaveButton(smalls, button){
	let enable = true;
	for ( let i = 0 ; i < $(smalls).length ; i++) enable = enable && $(smalls).eq(i).html() == '';
	if ( enable ) $(button).prop('disabled', false);
	else $(button).prop('disabled', true);
}
 async function checkInputAirfield(input, small, img, remark1, remark2, type, smalls, button){
	let test = ( type == 'ICAO' ) ? input.val().length != 4 : input.val().length < 3;
	if ( test) {
		small.html(remark1);
		img.prop('checked', false);
	}
	else {
		const airfields = await postFetchRequest('http://localhost:3000/api/compareAirfields', {"name":input.val().toUpperCase(), "type":type});
		if (typeof airfields[0] !== 'undefined') {
			small.html(remark2);
			img.prop('checked', false);
		}
		else {
			small.html('');
			img.prop('checked', true);
		}
	}
	enableSaveButton(smalls, button);
}
async function checkinputTransit(input, small, img, remark1, remark2, type, smalls, button){
	if ( input.val().length < 5) {
		small.html(remark1);
		img.prop('checked', false);
	}
	else {
		const transits = await postFetchRequest('http://localhost:3000/api/compareTransit', {"name":input.val().toUpperCase()});
		if (typeof transits[0] !== 'undefined') {
			small.html(remark2);
			img.prop('checked', false);
		}
		else {
			small.html('');
			img.prop('checked', true);
		}
	}
	enableSaveButton(smalls, button);
}
async function checkinputPoint(input, small, img, remark1, remark2, type, smalls, button){
	if ( !isValid(input)) {
		small.html(remark1);
		img.prop('checked', false);
	}
	else {
		const points = await postFetchRequest('http://localhost:3000/api/comparePoint', {"name":input.val().toUpperCase()});
		if (typeof points[0] !== 'undefined') {
			small.html(remark2);
			img.prop('checked', false);
		}
		else {
			small.html('');
			img.prop('checked', true);
		}
	}
	enableSaveButton(smalls, button);
}
function checkinput(input, small, img, remark, smalls, button){
	if ( isValid(input)) {
		small.html('');
		img.prop('checked', true);
	}
	else {
		small.html(remark);
		img.prop('checked', false);
	}
	enableSaveButton(smalls, button);
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
	resetSaveAIrfieldModal();
	$('#createNewAirfieldModal').modal('show');
	$('#createNewAirfieldModal').on('shown.bs.modal', function () {
		$('#newAirfieldICAO').trigger('focus')
	  })
	$('#newAirfieldICAO').on('keyup', function(){checkInputAirfield($('#newAirfieldICAO'), $('#newAirfieldICAOSmall'), $('#newAirfieldICAOImg'), 'Le code OACI doit avoir 4 caractères', 'Ce code OACI existe déjà', 'ICAO', '#createNewAirfieldModal small', '#saveNewAirfieldModal');});
	$('#newAifieldName').on('keyup', function(){checkInputAirfield($('#newAifieldName'), $('#newAifieldNameSmall'), $('#newAifieldNameImg'), 'Le nom du terrain doit avoir au moins 3 caractères', 'Ce nom de terrain existe déjà', 'NAME', '#createNewAirfieldModal small', '#saveNewAirfieldModal');});
	$('#newAifieldLatitude').on('keyup', function(){checkinput($('#newAifieldLatitude'), $('#newAifieldLatitudeSmall'), $('#newAifieldLatitudeImg'), 'Format : NXX XX.XX', '#createNewAirfieldModal small', '#saveNewAirfieldModal');});
	$('#newAifieldLongitude').on('keyup', function(){checkinput($('#newAifieldLongitude'), $('#newAifieldLongitudeSmall'), $('#newAifieldLongitudeImg'), 'Format : WXXX XX.XX', '#createNewAirfieldModal small', '#saveNewAirfieldModal');});
	$('#newAifieldElevation').on('keyup', function(){checkinput($('#newAifieldElevation'), $('#newAifieldElevationSmall'), $('#newAifieldElevationImg'), 'Doit être compris entre 0 et 30 000 pieds', '#createNewAirfieldModal small', '#saveNewAirfieldModal');});
	$('#saveNewAirfieldModal').on('click', saveAirfieldinDB);
}
function manageResearchInput(inputID, selectID, type, radioInput) {
	if ( inputID.val().length >= 2 ){
		if ( type == 'ifr' ) loadIFRPointsBeginingByInSelect(inputID.val());
		else loadAirfieldsSelect(radioInput, inputID.val(), document.getElementById(selectID))
	}
	else document.getElementById(selectID).length = 1;	
}
function resetPointModal(name, altitude, latitude, longitude){
	$('#newPointName').val(name);
	$('#newPointElev').val(altitude);
	$('#newPointLatitude').val(latitude);
	$('#newPointLongitude').val(longitude);
	$('#newPointNameSmall').html('Le nom du point doit avoir au moins 3 caractères');
	$('#newPointNameImg').prop('checked', false);
	$('#newPointElevSmall').html('Doit être compris entre 0 et 30 000 pieds');
	$('#newPointElevImg').prop('checked', false);
	$('#newPointLatitudeSmall').html('Format : NXX XX.XX');
	$('#newPointLatitudeImg').prop('checked', false);
	$('#newPointLongitudeSmall').html('Format : WXXX XX.XX');
	$('#newPointLongitudeImg').prop('checked', false);
	$('#saveNewPointModal').prop('disabled', true);
}
async function savePointinDb(){
	let point = Point.createInString($('#newPointName').val().toUpperCase(), $('#newPointLatitude').val(), $('#newPointLongitude').val(), $('#newPointElev').val());
	$('#createNewPointModal').modal('hide');
	if ( await postFetchRequest('http://localhost:3000/api/ctlPoint/save', point) == 'success'){
		$('#savedAlert').addClass('show');
		setTimeout(()=>$('#savedAlert').removeClass('show'), 2000);
	}
}
function saveNewPoint(name, altitude, latitude, longitude){
	resetPointModal(name, altitude, latitude, longitude);
	$('#createNewPointModal').modal('show');
	$('#createNewPointModal').on('shown.bs.modal', function () {
		$('#newPointName').trigger('focus')
	  })
	checkinputPoint($('#newPointName'), $('#newPointNameSmall'), $('#newPointNameImg'), 'Le nom du point doit avoir au moins 3 caractères', 'Ce nom existe déjà', 'point', '#createNewPointModal small', '#saveNewPointModal');
	checkinput($('#newPointElev'), $('#newPointElevSmall'), $('#newPointElevImg'), 'Doit être compris entre 0 et 30 000 pieds', '#createNewPointModal small', '#saveNewPointModal');
	checkinput($('#newPointLatitude'), $('#newPointLatitudeSmall'), $('#newPointLatitudeImg'), 'Format : NXX XX.XX', '#createNewPointModal small', '#saveNewPointModal');
	checkinput($('#newPointLongitude'), $('#newPointLongitudeSmall'), $('#newPointLongitudeImg'), 'Format : WXXX XX.XX', '#createNewPointModal small', '#saveNewPointModal');
	$('#newPointName').on('keyup', function(){checkinputPoint($('#newPointName'), $('#newPointNameSmall'), $('#newPointNameImg'), 'Le nom du point doit avoir au moins 3 caractères', 'Ce nom existe déjà', 'point', '#createNewPointModal small', '#saveNewPointModal');});
	$('#newPointElev').on('keyup', function(){checkinput($('#newPointElev'), $('#newPointElevSmall'), $('#newPointElevImg'), 'Doit être compris entre 0 et 30 000 pieds', '#createNewPointModal small', '#saveNewPointModal');});
	$('#newPointLatitude').on('keyup', function(){checkinput($('#newPointLatitude'), $('#newPointLatitudeSmall'), $('#newPointLatitudeImg'), 'Format : NXX XX.XX', '#createNewPointModal small', '#saveNewPointModal');});
	$('#newPointLongitude').on('keyup', function(){checkinput($('#newPointLongitude'), $('#newPointLongitudeSmall'), $('#newPointLongitudeImg'), 'Format : WXXX XX.XX', '#createNewPointModal small', '#saveNewPointModal');});
	$('#saveNewPointModal').on('click', savePointinDb);
}
function resetForm(){
	$('#pointBegining').val('');
	document.getElementById('ifrpoints').options.length = 1;
	$('#pointDatas input').val('');
}
(function (){
	$('#createPointButton').on("click", displayPoint);
	$('#razPointButton').on("click", function(){$('#pointDatas input').val('');});
	$('#saveTransit').on("click", displayTransitToSaveInDialog);
	$('#loadTransit').on("click",loadTransitInDialog);
	$('#insertAirfields').on("click", insertAirfieldsInTable);
	$('#calculatePLE').on("click", displayPLEDialog);
	$('#changeAirfields').on("click", displayAirfieldsSelection);
	$('#pointBegining').on("keyup",function(){manageResearchInput($('#pointBegining'), 'ifrpoints', 'ifr', '');});
	$('#departureSearch').on("keyup",function(){manageResearchInput($('#departureSearch'), 'departureAirfieldChoice', 'airfield', $('input[name=searchType]:checked'));});
	$('#arrivalSearch').on("keyup",function(){manageResearchInput($('#arrivalSearch'), 'arrivalAirfieldChoice', 'airfield', $('input[name=searchType2]:checked'));});
	$('input[name=searchType]').on("change",function(){if ( $('#departureSearch').val().length >= 2) loadAirfieldsSelect($('input[name=searchType]:checked'), $('#departureSearch').val(), document.getElementById('departureAirfieldChoice'));});
	$('input[name=searchType2]').on("change",function(){if ( $('#arrivalSearch').val().length >= 2) loadAirfieldsSelect($('input[name=searchType2]:checked'), $('#arrivalSearch').val(), document.getElementById('arrivalAirfieldChoice'));});
	$('#ifrpoints').on("change",function(){DisplayIfrPointInformations($('#ifrpoints').val())});
	$('#saveNewAirfield').on('click', saveNewAifield);
	$('#pointType').on('change', resetForm);
	$('#saveNewPoint').on('click', function(){saveNewPoint('','','','')});
	$('tbody').sortable({
		axis : "y",
		cursor : "pointer",
		containment : "tbody",
		scroll : true,
		stop : function(event, ui){calculateAllDistancesAndCorrectedQfe();}
	});
})();