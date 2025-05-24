export async function getCurrentLocation(
  setFrom: (val: string) => void,
  setIsDetectingLocation: (val: boolean) => void
) {
  if (!navigator.geolocation) {
    // alert("Your browser doesn't support location detection");
    return;
  }

  setIsDetectingLocation(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        const data = await response.json();
        const city =
          data.city ||
          data.locality ||
          data.town ||
          data.village ||
          data.municipality ||
          "";
        setFrom(city);
        // alert(`Found your location: ${city}`);
      } catch (error: unknown) {
        // alert("Unable to determine your current location");
      } finally {
        setIsDetectingLocation(false);
      }
    },
    () => {
      // alert("Unable to determine your current location");
      setIsDetectingLocation(false);
    }
  );
}
