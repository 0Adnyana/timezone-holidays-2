import { getTimezoneInfo } from "../helpers/getTimezoneInfo";

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

	try {
		const data: any = await response.json();
		let processedData = {
			timezoneId: data.places[0].timeZone.id,
			administrativeAreaLevel2: null,
			administrativeAreaLevel1: null,
			country: null,
			countryCode: null,
		};

		const addressComponents = data.places[0].addressComponents;

		if (!addressComponents) {
			throw new Error("Location doesn't exist");
		}

		addressComponents.map((component: any) => {
			component.types?.map((type: string) => {
				if (type == "country") {
					processedData.country = component.longText;
					processedData.countryCode = component.shortText;
				} else if (type == "administrative_area_level_2") {
					processedData.administrativeAreaLevel2 = component.longText;
				} else if (type == "administrative_area_level_1") {
					processedData.administrativeAreaLevel1 = component.longText;
				}
			});
		});

		const timezoneInfo = getTimezoneInfo(processedData.timezoneId);

		return { ...processedData, ...timezoneInfo };
	} catch (e) {
		throw new Error(`${e}`);
	}
}
