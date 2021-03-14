function calculateDeltaTempsInFeets(flightLevel, trueTemperature){
	return Math.round(4*calculateIsaValue(flightLevel, trueTemperature)*(parseInt(flightLevel.val())/10));
}
function calculateDeltaTempsInHpa(flightLevel, trueTemperature){
	return Math.round(calculateDeltaTempsInFeets(flightLevel, trueTemperature)/27.5);
}
function calculateIsaValue(flightLevel, trueTemperature){
	return Math.round((5*parseInt(trueTemperature.val())-75+parseInt(flightLevel.val()))/5);
}
function calculateQfe(qnh, groundAltitude){
	return Math.round(parseInt(qnh.val())-(parseInt(groundAltitude/27.5)));
}
function calculateIndicatedHeight(flightLevel, qnh, groundAltitude){
	return Math.round((parseInt(flightLevel.val())*100)+((parseInt(qnh.val())-1013.25)*27.5)-parseInt(groundAltitude));
}
function calculateCorrectedQfe(flightLevel, trueTemperature, qnh, groundAltitude){
	return Math.round(calculateQfe(qnh, groundAltitude)+calculateDeltaTempsInHpa(flightLevel, trueTemperature));
}
function calculateTrueHeight(flightLevel, trueTemperature, qnh, groundAltitude){
	return Math.round(calculateIndicatedHeight(flightLevel, qnh, groundAltitude)+calculateDeltaTempsInFeets(flightLevel, trueTemperature));
}
function calculateMinimumFlightLevel(flightLevel, trueTemperature, qnh, maximumGroundAltitude, groundToAirWeaponsRange){
	return roundUpAt5((parseInt(groundToAirWeaponsRange.val())-calculateDeltaTempsInFeets(flightLevel, trueTemperature)+parseInt(maximumGroundAltitude.val())-((parseInt(qnh.val())-1013.25)*27.5))/100);
}
function displayIsaInLetters(internationalStandardAtmosphere){
	return calculateIsa(internationalStandardAtmosphere.val());
}
function displayResults(){
		if ( hasEnoughDatas('#DeltaTempPieds', [$('#fl'), $('#tv')]) ) $('#DeltaTempPieds').val(calculateDeltaTempsInFeets($('#fl'),$('#tv')));
		if ( hasEnoughDatas('#DeltaTempHpa', [$('#fl'), $('#tv')])) $('#DeltaTempHpa').val(calculateDeltaTempsInHpa($('#fl'),$('#tv')));
		if ( hasEnoughDatas('#isa', [$('#fl'), $('#tv')])) $('#isa').val(calculateIsaValue($('#fl'),$('#tv')));
		if ( hasEnoughDatas('#qfe', [$('#qnh'), $('#altiTerrain')])) $('#qfe').val(calculateQfe($('#qnh'),$('#altiTerrain').val()));
		if ( hasEnoughDatas('#hi', [$('#fl'), $('#qnh'), $('#altiTerrain')])) $('#hi').val(calculateIndicatedHeight($('#fl'), $('#qnh'),$('#altiTerrain').val()));
		if ( hasEnoughDatas('#qfec', [$('#fl'), $('#tv'), $('#qnh'), $('#altiTerrain')])) $('#qfec').val(calculateCorrectedQfe($('#fl'), $('#tv'), $('#qnh'),$('#altiTerrain').val()));
		if ( hasEnoughDatas('#hv', [$('#fl'), $('#tv'), $('#qnh'), $('#altiTerrain')])) $('#hv').val(calculateTrueHeight($('#fl'), $('#tv'), $('#qnh'),$('#altiTerrain').val()));
		if ( hasEnoughDatas('#flMini', [$('#fl'), $('#tv'), $('#qnh'), $('#altiTopoMax'), $('#volsa')])) $('#flMini').val(calculateMinimumFlightLevel($('#fl'), $('#tv'), $('#qnh'), $('#altiTopoMax'), $('#volsa')));
		if ( hasEnoughDatas('#DeltaTempPieds', [$('#fl'), $('#tv')])) $('#atmos').html(displayIsaInLetters($('#isa')));
}
(function(){
	$('#calculateDatasButton').on("click", displayResults);
	$('#razDatasButton').on("click", function(){$('#providedDatasForm input').val('');});
})();