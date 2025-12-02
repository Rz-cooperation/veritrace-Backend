import NodeGeocoder from 'node-geocoder'


//Configure the geocoder
const options = { 
    provider: 'openstreetmap',
    httpAdapter: 'https',
    userAgent: 'VeritraceApp/1.0'
};

const geocoder = NodeGeocoder(options);


/**
 * Takes in an address oblect, converts it to string,
 * and retuens a mongoDb GeoJson Point object.
 * @param {Object} addressObj - contains streetNo, addressStr, city, country
 */


export const getCoordinatesFromAddress = async (addressObj) => {
    const fullAddress = `${addressObj.streetNo || '' } ${addressObj.addressStr}, ${addressObj.city || ''}, ${addressObj.state} ${addressObj.country}`; 
    

    console.log("Attempting to geocode: ", fullAddress);

    const geoResult = await geocoder.geocode(fullAddress);

    if(!geoResult || geoResult.length === 0){
        throw new Error("Could not locate the provided address");
    }

    return{
        type: 'Point',
        coordinates: [geoResult[0].longitude, geoResult[0].latitude]
    }
}