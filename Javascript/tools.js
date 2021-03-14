function roundUpAt5(data){
	return data + 5 - data % 5 ;
}
function calculateIsa(isaValue){
	if ( isaValue < -10 ) return 'Froide';
	else if ( isaValue > 10 ) return 'Chaude';
	else return 'Tempérée';
}
function isValid(input){
	switch(input.attr("data-type")){
		case 'number' : 
			return (parseInt(input.val()) >= input.attr("min") ) && ( parseInt(input.val()) <= input.attr("max") ) && !isNaN(input.val());
			break;
		case 'MGRS' :
			return /\d{2}[A-Z]{1}\s[A-Z]{2}\s\d{5}\s\d{5}/.test(input.val());
			break;
		case 'latitude' : 
			return /[NS][0-8]\d\s\d{2}\.\d{2}|[NS]90\s00\.00/.test(input.val());
			break;
		case 'longitude' :
			return /[EW]0\d{2}\s\d{2}\.\d{2}|[EW]1[0-7]\d\s\d{2}\.\d{2}|[EW]180\s00\.00/.test(input.val());
			break;
		case 'text' : 
			return ( input.val() != '' ) && ( input.val().length <= 10 ) && ( input.val().length >= 3 )
	}
}
function hasEnoughDatas(id, datasNeeded){
	let enough = true;
	for ( let i = 0 ; i < datasNeeded.length ; i++){
		if (!isValid(datasNeeded[i])){
			$(id).attr('placeholder', datasNeeded[i].attr("data-placeholder"));
			enough = false;
		}
	}
	return enough;
}
function calculateAllDistancesAndCorrectedQfe(){
	if ( $('.latitude').eq($('.latitude').length -1).html() != ''){
		let fullDistance = 0;
		let PLEDistance = 0;
		let index = -1;
		let arrivalPoint = Point.createInString('', $('.latitude').eq($('.latitude').length-1).html(), $('.longitude').eq($('.longitude').length-1).html(), '');
		for ( let i = $('.latitude').length - 1 ; i > 0 ; i--){
			let pointA = Point.createInString('', $('.latitude').eq(i).html(), $('.longitude').eq(i).html(), '');
			let pointB = Point.createInString('', $('.latitude').eq(i-1).html(), $('.longitude').eq(i-1).html(), '');
			let distanceBetweenPoints = pointA.calculateDistanceWith(pointB);
			let distanceFromArrival = pointA.calculateDistanceWith(arrivalPoint);
			$('.distance').eq(i).html(distanceBetweenPoints);
			$('.remainingDistance').eq(i).html(fullDistance);
			fullDistance += distanceBetweenPoints;
			if ( distanceFromArrival > PLEDistance ) index = $('tr')[i+1].id;
			PLEDistance = Math.max(distanceFromArrival, PLEDistance);
			if ( isValid($('#qnh')) && isValid($('#fl')) && isValid($('#tv')) && ( $('.altitude').eq(i).html() != '')) $('.qfec').eq(i).html(calculateCorrectedQfe($('#fl'), $('#tv'), $('#qnh'), $('.altitude').eq(i).html()));
		}
		if ( isValid($('#qnh')) && isValid($('#fl')) && isValid($('#tv')) && ( $('.altitude').eq(0).html() != '')) $('.qfec').eq(0).html(calculateCorrectedQfe($('#fl'), $('#tv'), $('#qnh'), $('.altitude').eq(0).html()));
		$('.distance').eq(0).html(0);
		$('.remainingDistance').eq(0).html(fullDistance);
		return [index, PLEDistance];
	}
}
async function postFetchRequest(url, body){
	try{
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json"},
			body:JSON.stringify(body)
		});
		if (!res) throw new Error(res.status);
		return await res.json();
	}
	catch(error){console.log(error);}
}
async function getFetchRequest(url){
	try{
		const res = await fetch(url,{method:"GET"});
		if (!res) throw new Error(res.status);
		return await res.json();
	}
	catch(error){console.log(error);}
}