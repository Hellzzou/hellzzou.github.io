function displayTheGoodForm(classAndID){
	if ( classAndID != null){
		const sectionArray = document.getElementsByTagName('section');
		for (let i = 0 ; i < sectionArray.length ; i++){
			sectionArray[i].className =  ( sectionArray[i].id == classAndID ) ? 'row' : 'd-none row';
		}
		switch( classAndID ){
			case 'ctl' :
				$('#dropdownMenu').removeClass('disabled');
				calculateAllDistancesAndCorrectedQfe();
				break;
			case 'shot' :
				updateShotSection();
				$('#dropdownMenu').addClass('disabled');
				break;	
		}
	}
}
function updateShotSection(){
	buildSelectInputs();
	$('#ISAType').val(calculateIsa(parseInt($('#isa').val())));
	( $('#hv').val() != '' ) ? $('#shotHeight').val(roundUpAt5(Math.round(parseInt($('#hv').val()) / 100))) : $('#shotHeight').val(100);
}
function buildSelectInputs(){
	document.getElementById('windDirection').options.length = 0;
	document.getElementById('shotDirection').options.length = 0;
	document.getElementById('WindForce').options.length = 0;
	document.getElementById('shotHeight').options.length = 0;
	for ( let i = 1 ; i < 37 ; i++){
		document.getElementById('windDirection').options[document.getElementById('windDirection').options.length] = ( i < 10) ? new Option('0'+ 10*i, '0'+ 10*i) : new Option(10*i, 10*i); 
		document.getElementById('shotDirection').options[document.getElementById('shotDirection').options.length] = ( i < 10) ? new Option('0'+ 10*i, '0'+ 10*i) : new Option(10*i, 10*i); 
	}
	for ( let i = 0 ; i < 19 ; i++){
		document.getElementById('WindForce').append(new Option(5*i, 5*i));
	}
	for ( let i = 0 ; i < 30 ; i++){
		document.getElementById('shotHeight').append(new Option(100 + 5*i, 100 + 5*i));
	}
}
(function (){$('#menu button').on("click", function(){displayTheGoodForm(this.getAttribute('data-link'));});})();