/* eslint-disable prettier/prettier */
export const currentLocation = async (lat, lon) => {
  try {
    const request = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!request.ok) {
      throw new Error(`Network response was not ok: ${request.statusText}`);
    }

    const result = await request.json();
    console.log(result);
  } catch (error) {
    console.error('Fetch error:', error);
  }
};
