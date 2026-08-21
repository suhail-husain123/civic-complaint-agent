from geopy.geocoders import Nominatim


geolocator = Nominatim(
    user_agent="civic_complaint_agent"
)


def get_address_from_coordinates(
    latitude: float,
    longitude: float
):
    try:
        location = geolocator.reverse(
            (latitude, longitude),
            language="en"
        )

        if location:
            return location.address

        return None

    except Exception as error:
        print(
            "Reverse geocoding failed:",
            error
        )

        return None