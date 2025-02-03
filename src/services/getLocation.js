/* eslint-disable prettier/prettier */
// export const currentLocation = async (lat, lon) => {
//   try {
//     const request = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
//       {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       },
//     );

//     if (!request.ok) {
//       throw new Error(`Network response was not ok: ${request.statusText}`);
//     }

//     const result = await request.json();
//     console.log(result);
//   } catch (error) {
//     console.error('Fetch error:', error);
//   }
// };
import {GOOGLE_MAPS_API_KEY} from '@env';

export const getCurrentLocation = async (latitude, longitude) => {
  try {
    const coordinates = `${latitude},${longitude}`;
    const loc_details = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const result = await loc_details.json();
    return result;
  } catch (error) {
    return 'failed to get location: ', error;
  }
};
