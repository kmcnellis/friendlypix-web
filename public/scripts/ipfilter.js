/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

window.friendlyPix = window.friendlyPix || {};

/**
 * Filters some features depending on the user location.
 */
friendlyPix.IpFilter = class {
  static get apiKey() {
    return firebase.app().options.apiKey;
  }

  static get privacyShieldCountries() {
    return ['CH', 'AT', 'IT', 'BE', 'LV', 'BG', 'LT', 'HR', 'LX', 'CY', 'MT', 'CZ', 'NL', 'DK',
        'PL', 'EE', 'PT', 'FI', 'RO', 'FR', 'SK', 'DE', 'SI', 'GR', 'ES', 'HU', 'SE', 'IE', 'GB'];
  }

  /**
   * Initializes Friendly Pix's Ip Filter.
   * @constructor
   */
  constructor() {
    // Result in a Promise.
    this.isPrivacyShieldCountryDeferred = new $.Deferred();
    this.userCountryDeferred = new $.Deferred();

    friendlyPix.IpFilter.findLatLonFromIP().then((latlng) => {
      friendlyPix.IpFilter.getCountryCodeFromLatLng(latlng.lat, latlng.lng).then((countryCode) => {
        if (friendlyPix.IpFilter.privacyShieldCountries.includes(countryCode)) {
          $('.fp-eu').removeClass('fp-eu');
        } else {
          $('.fp-non-eu').removeClass('fp-non-eu');
        }
      });
    }).catch(() => {
      $('.fp-non-eu').removeClass('fp-non-eu');
    });
  }

  static findLatLonFromIP() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `https://www.googleapis.com/geolocation/v1/geolocate?key=${friendlyPix.IpFilter.apiKey}`,
        type: 'POST',
        data: JSON.stringify({considerIp: true}),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: (data) => {
          if (data && data.location) {
            resolve({lat: data.location.lat, lng: data.location.lng});
          } else {
            reject('No location object in geolocate API response.');
          }
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  static getCountryCodeFromLatLng(lat, lng) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${friendlyPix.IpFilter.apiKey}`,
        type: 'GET',
        data: JSON.stringify({considerIp: true}),
        dataType: 'json',
        success: (data) => {
          console.log('reverse geocode:', data.results[0].address_components);
          data.results.some((address) => {
            address.address_components.some((component) => {
              if (component.types.includes('country')) {
                return resolve(component.short_name);
              }
            });
          });
          reject('Country not found in location information.');
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }
};

friendlyPix.ipfilter = new friendlyPix.IpFilter();
