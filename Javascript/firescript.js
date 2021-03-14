function calculatewindAngle(shotDirection, windDirection){
	return (Math.abs(shotDirection - windDirection) > 180)? Math.abs(Math.abs(shotDirection - windDirection) - 360): Math.abs(shotDirection - windDirection);
}
async function displayShotInformation(gbuArrayNoWind, gbuArrayWithWind){
	let shotHeight = parseInt(($('#shotHeight').val()) - 100) / 5;
	let windForce = (parseInt($('#WindForce').val()) - 5 ) / 5;
	let windAngle = calculatewindAngle(parseInt($('#shotDirection').val()), parseInt($('#windDirection').val()))/10;
	let noWindValues = await postFetchRequest('http://localhost:3000/api/abacdetir/noWind', {"name":gbuArrayNoWind});
	$('#DropTime').val(noWindValues[0].values[shotHeight][1]);
	$('#illuDelay').val(noWindValues[0].values[shotHeight][2]);
	$('#shotDistanceWithoutWind').val(noWindValues[0].values[shotHeight][3].toFixed(3));
	if ( $('#WindForce').val() == 0 ) $('#shotDistance').val(noWindValues[0].values[shotHeight][3].toFixed(3));	
	let withWindValues = await postFetchRequest('http://localhost:3000/api/abacdetir/withWind', {"name":gbuArrayWithWind});
 	if ( $('#WindForce').val() != 0 ){
 		if (withWindValues[0].values[windForce][shotHeight][windAngle] === 0.000) $('#shotDistance').val('TIR IMPOSSIBLE !');
 		else $('#shotDistance').val(withWindValues[0].values[windForce][shotHeight][windAngle].toFixed(3));
 	}
	$('#WindAngle').val(windAngle*10);
}
function displayInformationDependingOnISA(gbuColdNoWind, gbuColdWithWind, gbuTemperedNoWind, gbuTemperedWithWind, gbuHotNoWind, gbuHotWithWind){
	switch($('#ISAType').val()){
		case 'Froide' : 
			displayShotInformation(gbuColdNoWind, gbuColdWithWind);
		break;
		case 'Tempérée' :
			displayShotInformation(gbuTemperedNoWind, gbuTemperedWithWind);
		break;
		case 'Chaude' :
			displayShotInformation(gbuHotNoWind, gbuHotWithWind);
		break;
	}
}
function calculateDistanceOfShot(){
	switch(parseInt($('#gbuType').val())){
		case 12 :
			displayInformationDependingOnISA('gbu12ColdNoWind', 'gbu12ColdArray', 'gbu12TemperedNoWind', 'gbu12TemperedArray', 'gbu12HotNoWind', 'gbu12HotArray');
		break;
		case 58 :
			displayInformationDependingOnISA('gbu58ColdNoWind', 'gbu58ColdArray', 'gbu58TemperedNoWind', 'gbu58TemperedArray', 'gbu58HotNoWind', 'gbu58HotArray');
		break;
	} 
}
(function (){$('#calculateFireDistance').on("click", calculateDistanceOfShot);})();