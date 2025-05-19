type ToastFn = (opts: {
  title: string;
  description: string;
  variant: string;
}) => void;

export async function getCurrentLocation(
  setFrom: (val: string) => void,
  setIsDetectingLocation: (val: boolean) => void,
  toast: ToastFn
) {
  if (!navigator.geolocation) {
    toast({
      title: "Geolocation not supported",
      description: "Your browser doesn't support location detection",
      variant: "destructive",
    });
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

        toast({
          title: "Location detected",
          description: `Found your location: ${city}`,
          variant: "default",
        });
      } catch (error: unknown) {
        let description = "Unable to determine your current location";
        if (error && typeof error === "object" && "message" in error) {
          description = String((error as { message?: string }).message);
        }
        toast({
          title: "Location detection failed",
          description: description,
          variant: "destructive",
        });
      } finally {
        setIsDetectingLocation(false);
      }
    },
    (error: unknown) => {
      let description = "Unable to determine your current location";
      if (error && typeof error === "object" && "message" in error) {
        description = String((error as { message?: string }).message);
      }
      toast({
        title: "Location access denied",
        description: description,
        variant: "destructive",
      });
      setIsDetectingLocation(false);
    }
  );
}
