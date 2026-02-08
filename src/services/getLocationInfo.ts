export async function getLocationInfo(searchText: string) {
	const response = await fetch(`https://places.googleapis.com/v1/places:searchText`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Goog-Api-Key": process.env.GOOGLE_API_KEY,
			"X-Goog-FieldMask": "places.timeZone,places.addressComponents.types,places.addressComponents.shortText,places.addressComponents.longText",
		},
		body: JSON.stringify({
			textQuery: searchText,
			pageSize: 1,
			includedType: "administrative_area_level_2",
		}),
	});

	if (!response.ok) {
		throw new Error(`Google Places API error: ${response.status}`);
	}

	// if (!response.ok) {
	// 	const errorBody = await response.json();
	// 	console.error("Google API error details:", JSON.stringify(errorBody, null, 2));
	// 	throw new Error(`Google Places API error: ${response.status}`);
	// }

	const data = await response.json();
	return data;
}
