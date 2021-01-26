/*
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { Settings, Platform } from 'react-native';

let clientId = '0oavf6s8badHjoMgT0h7';
let issuer = 'https://udp-udp-mobile-6aa.oktapreview.com/oauth2/default';
let udp_subdomain = 'udp-mobile';
let app_name = 'UDP React Native Demo';
let customAPIUrl = 'https://j8d461nbhb.execute-api.us-east-2.amazonaws.com/dev';
let reCaptchaSiteKey = '6LfQExQaAAAAAKOtmshnR544I5qQkp-vfYJ2TGyL';
let nonce = '52b839be-3b79-4d09-a933-ef04bd34491f';
let transactionalMFAClientId = '0oaw9qibcih6mwAiI0h7';
let consentField = 'udp_mobile_react_native_demo_consent_flag';

if(Platform.OS === 'ios') {
  clientId = Settings.get('clientId') || clientId;
  issuer = Settings.get('issuer') || issuer;
  udp_subdomain = Settings.get('udp_subdomain') || udp_subdomain;
  app_name = Settings.get('app_name') || app_name;
  customAPIUrl = Settings.get('customAPIUrl') || customAPIUrl;
  reCaptchaSiteKey = Settings.get('reCaptchaSiteKey') || reCaptchaSiteKey;
  nonce = Settings.get('nonce') || nonce;
  transactionalMFAClientId = Settings.get('transactionalMFAClientId') || transactionalMFAClientId;
  consentField = Settings.get('consentField') || consentField;
} else if(Platform.OS === 'android') {
  const SharedPreferences = require('react-native-shared-preferences');
  SharedPreferences.setName('prefs.db');
  SharedPreferences.getItems(['clientId', 'issuer',' udp_subdomain', 'app_name', 'customAPIUrl', 'reCaptchaSiteKey', 'nonce', 'transactionalMFAClientId', 'consentField'], function(value){
    clientId = values[0] || clientId;
    issuer = values[1] || issuer;
    udp_subdomain = values[2] || udp_subdomain;
    app_name = values[3] || app_name;
    customAPIUrl = values[4] || customAPIUrl;
    reCaptchaSiteKey = values[5] || reCaptchaSiteKey;
    nonce = values[6] || nonce;
    transactionalMFAClientId = values[7] || transactionalMFAClientId;
    consentField = values[8] || consentField;
  });
}
const splitArray = issuer.split('/');
const baseUri = `${splitArray[0]}//${splitArray[2]}/api/v1`;
const authUri = `${issuer}/v1/authorize`;
export default {
  app_name,
  oidc: {
    clientId,
    discoveryUri: issuer,
    redirectUri: 'com.oktapreview.udp-udp-mobile-6aa:/callback',
    endSessionRedirectUri: 'com.oktapreview.udp-udp-mobile-6aa:/callback',
    scopes: ["openid", "profile", "offline_access", "phone", "email"],
    requireHardwareBackedKeyStore: false,
  },
  baseUri,
  authUri,
  reCaptchaSiteKey,
  reCaptchaBaseUrl: `${splitArray[0]}//${splitArray[2]}`,
  nonce,
  customAPIUrl,
  consentField,
  transactionalMFA: {
    clientId: transactionalMFAClientId,
  },
};