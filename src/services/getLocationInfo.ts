export interface PlacesInfo {
	timezoneId: string;
	administrativeAreaLevel2?: string;
	administrativeAreaLevel1?: string;
	country: string;
	countryCode: string;
}

export async function getLocationInfo(searchText: string): Promise<PlacesInfo> {
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

	const data: any = await response.json();

	const addressComponents = data.places[0].addressComponents;

	if (!addressComponents) {
		throw new Error("Location doesn't exist");
	}

	const placesInfo: PlacesInfo = {
		timezoneId: data.places[0].timeZone.id,
		country: "",
		countryCode: "",
	};

	for (const component of addressComponents) {
		const types: string[] = component.types ?? [];

		if (types.includes("country")) {
			placesInfo.country = component.longText;
			placesInfo.countryCode = component.shortText;
		} else if (types.includes("administrative_area_level_2")) {
			placesInfo.administrativeAreaLevel2 = component.longText;
		} else if (types.includes("administrative_area_level_1")) {
			placesInfo.administrativeAreaLevel1 = component.longText;
		}
	}

	return placesInfo;
}
