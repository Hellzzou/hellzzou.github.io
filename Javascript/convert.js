function displayLatitudeLongitudeFromMGRS(){
	if ( hasEnoughDatas($('#LatConverted'), [$('#mgrsToConvert')]) ) $('#LatConverted').val(Point.createInMGRS('', $('#mgrsToConvert').val(), '').latitudeInString);
	if ( hasEnoughDatas($('#LongConverted'), [$('#mgrsToConvert')]) ) $('#LongConverted').val(Point.createInMGRS('', $('#mgrsToConvert').val(), '').longitudeInString);
}
function displayMGRSFromLatitudeLongitude(){
	console.log(Point.createInString('', $('#LatToConvert').val(), $('#LongToConvert').val(), '').mgrs);
	if (hasEnoughDatas($('#mgrsConverted'), [$('#LatToConvert'), $('#LongToConvert')])) $('#mgrsConverted').val(Point.createInString('', $('#LatToConvert').val(), $('#LongToConvert').val(), '').mgrs);
}
function displayfeetsAndNauticalMilesFromMeters(){
	$('#feets').val(Math.round($('#meters').val()*3.2808));
	$('#nautics').val(Math.round($('#meters').val()*100/1852)/100);	
}
function displayMetersAndNauticalMilesFromFeets(){
	$('#meters').val(Math.round($('#feets').val()/3.2808));
	$('#nautics').val(Math.round($('#feets').val()/3.2808/1852*100)/100);
}
function displayMetersAndFeetsFromNauticalMiles(){
	$('#meters').val(Math.round($('#nautics').val()*1852));
	$('#feets').val(Math.round($('#nautics').val()*1852*3.2808));
}
(function(){
	$('#convertMgrsToLatLong').on("click", displayLatitudeLongitudeFromMGRS);
	$('#convertLatLongToMgrs').on("click", displayMGRSFromLatitudeLongitude);
	$('#razMgrsToLatLong').on("click", function(){$('#mgrsToLatLongFieldset input').val('')});
	$('#razLatLongToMgrs').on("click", function(){$('#LatLongToMgrsfieldset input').val('')});
	$('#meters').on('keyup', displayfeetsAndNauticalMilesFromMeters);
	$('#feets').on('keyup', displayMetersAndNauticalMilesFromFeets);
	$('#nautics').on('keyup', displayMetersAndFeetsFromNauticalMiles);
	$('#razDistanceConverter').on('click', function(){$('#distanecConverterFieldset input').val('');});
})();