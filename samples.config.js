import { Settings, Platform } from 'react-native';

let clientId = '0oa10i4alr0Awt6Yx0h8';
let issuer = 'https://udp-brhim-ciam-804.oktapreview.com/oauth2/aus10i4c2rvUfijb80h8'
let udp_subdomain = 'brhim-ciam';
let app_name = 'react-native-ios';
let title = 'Okta Bank';

let logoUrl = 'https://user-images.githubusercontent.com/6020066/126362711-96293c73-0d36-42ec-b033-57ea5787b1cf.png';
let customAPIUrl = 'http://localhost:8080';
let reCaptchaSiteKey = '6LfvYZEaAAAAACj9aTxL6OWKo_xoIRczesbkmX22';

let nonce = '52b839be-3b79-4d09-a933-ef04bd34491f';
let transactionalMfaClientId = '0oa10i4dk2j9kS6YE0h8';
let consentField = 'brhim_ciam_react_native_ios_demo_consent_flag';
let facebookIDP = '0oaz463iwpC1jc29f0h7';

let googleIDP = '0oaz5t6tyubdTIue70h7';
let appleIDP = '';
let reCaptchaBaseUrl = 'https://udp-brhim-ciam-804.oktapreview.com/oauth2';
const codeChallengeMethod = 'S256';
const codeChallenge = 'qjrzSW9gMiUgpUvqgEPE4_-8swvyCtfOVvg55o5S_es';
const codeVerifier = 'M25iVXpKU3puUjFaYWg3T1NDTDQtcW1ROUY5YXlwalNoc0hhakxifmZHag';

if(Platform.OS === 'ios') {
  clientId = Settings.get('clientId') || clientId;
  issuer = Settings.get('issuer') || issuer;
  udp_subdomain = Settings.get('udp_subdomain') || udp_subdomain;
  app_name = Settings.get('app_name') || app_name;
  customAPIUrl = Settings.get('customAPIUrl') || customAPIUrl;
  reCaptchaSiteKey = Settings.get('reCaptchaSiteKey') || reCaptchaSiteKey;

  const splitArray = issuer.split('/');
  reCaptchaBaseUrl = Settings.get('reCaptchaSiteKey') ? `${splitArray[0]}//${splitArray[2]}` : reCaptchaBaseUrl;
  console.log(reCaptchaBaseUrl);
  nonce = Settings.get('nonce') || nonce;
  transactionalMfaClientId = Settings.get('transactionalMfaClientId') || transactionalMfaClientId;
  consentField = Settings.get('consentField') || consentField;
  facebookIDP = Settings.get('facebookIDP') || facebookIDP;
  googleIDP = Settings.get('googleIDP') || googleIDP;
  appleIDP = Settings.get('appleIDP') || appleIDP;
  title = Settings.get('title') || title;
  logoUrl = Settings.get('logoUrl') || logoUrl;
}

const splitArray = issuer.split('/');
const baseUri = `${splitArray[0]}//${splitArray[2]}/api/v1`;
const authUri = `${issuer}/v1/authorize`;
export default {
  app_name,
  clientId,
  issuer,
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
  },
  codeChallengeMethod,
  codeChallenge,
  codeVerifier,
};