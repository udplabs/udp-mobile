import { Settings, Platform } from 'react-native';

let clientId = '0oawm2hmyuw13qQmK0h7';
let issuer = 'https://udp-zeelabs-stg-73e.oktapreview.com/oauth2/auswm2id0kJEYONpc0h7';
let udp_subdomain = 'zeelabs-stg';
let app_name = 'react-native';
let title = 'ZeeLabs Demo';
let logoUrl = '';
let customAPIUrl = 'https://j8d461nbhb.execute-api.us-east-2.amazonaws.com/dev';
let reCaptchaSiteKey = '6LcXsz0aAAAAAD3cjzrrrKZ1WNp4Jvsu1p_p0s7A';
let nonce = '52b839be-3b79-4d09-a933-ef04bd34491f';
let transactionalMfaClientId = '0oawm2o5u9pjzVwFY0h7';
let consentField = 'zeelabs_stg_react_native_demo_consent_flag';
let facebookIDP = '0oawmcz70tA4hTBdX0h7';
let googleIDP = '0oaw402206kWFqFPj0h7';
let appleIDP = '0oaw729qicIxZkUtN0h7';
let reCaptchaBaseUrl = 'https://udp-zeelabs-stg-73e.oktapreview.com';

if(Platform.OS === 'ios') {
  clientId = Settings.get('clientId') || clientId;
  issuer = Settings.get('issuer') || issuer;
  udp_subdomain = Settings.get('udp_subdomain') || udp_subdomain;
  app_name = Settings.get('app_name') || app_name;
  customAPIUrl = Settings.get('customAPIUrl') || customAPIUrl;
  reCaptchaSiteKey = Settings.get('reCaptchaSiteKey') || reCaptchaSiteKey;

  const splitArray = issuer.split('/');
  reCaptchaBaseUrl = Settings.get('reCaptchaSiteKey') ? `${splitArray[0]}//${splitArray[2]}` : reCaptchaBaseUrl;

  nonce = Settings.get('nonce') || nonce;
  transactionalMfaClientId = Settings.get('transactionalMfaClientId') || transactionalMfaClientId;
  consentField = Settings.get('consentField') || consentField;
  facebookIDP = Settings.get('facebookIDP') || facebookIDP;
  googleIDP = Settings.get('googleIDP') || googleIDP;
  appleIDP = Settings.get('appleIDP') || appleIDP;
  title = Settings.get('title') || title;
  logoUrl = Settings.get('logoUrl') || logoUrl;

} else if(Platform.OS === 'android') {
  const SharedPreferences = require('react-native-shared-preferences');
  SharedPreferences.setName('prefs.db');
  SharedPreferences.getItems(['clientId', 'issuer',' udp_subdomain', 'app_name', 'customAPIUrl', 'reCaptchaSiteKey', 'nonce', 'transactionalMFAClientId', 'consentField', 'facebookIDP', 'googleIDP', 'appleIDP', 'title', 'logoUrl'], function(values){
    clientId = values[0] || clientId;
    issuer = values[1] || issuer;
    udp_subdomain = values[2] || udp_subdomain;
    app_name = values[3] || app_name;
    customAPIUrl = values[4] || customAPIUrl;
    reCaptchaSiteKey = values[5] || reCaptchaSiteKey;

    const splitArray = issuer.split('/');
    reCaptchaBaseUrl = values[5] ? `${splitArray[0]}//${splitArray[2]}` : reCaptchaBaseUrl;

    nonce = values[6] || nonce;
    transactionalMfaClientId = values[7] || transactionalMfaClientId;
    consentField = values[8] || consentField;
    facebookIDP = values[9] || facebookIDP;
    googleIDP = values[10] || googleIDP;
    appleIDP = values[11] || appleIDP;
    title = values[12] || title;
    logoUrl = values[13] || logoUrl;
  });
}
const splitArray = issuer.split('/');
const baseUri = `${splitArray[0]}//${splitArray[2]}/api/v1`;
const authUri = `${issuer}/v1/authorize`;
export default {
  app_name,
  clientId,
  title,
  logoUrl,
  baseUri,
  udp_subdomain,
  authUri,
  reCaptchaSiteKey,
  reCaptchaBaseUrl,
  nonce,
  customAPIUrl,
  consentField,
  transactionalMFA: {
    clientId: transactionalMfaClientId,
  },
  idps: {
    facebook: facebookIDP,
    google: googleIDP,
    apple: appleIDP,
  }
};