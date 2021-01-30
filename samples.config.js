import { Settings, Platform } from 'react-native';

let clientId = '0oavf6s8badHjoMgT0h7';
let issuer = 'https://udp-udp-mobile-6aa.oktapreview.com/oauth2/default';
let udp_subdomain = 'udp-mobile';
let app_name = 'udp-mobile';
let title = 'UDP React Native Demo';

let logoUrl = '';
let customAPIUrl = 'https://j8d461nbhb.execute-api.us-east-2.amazonaws.com/dev';
let reCaptchaSiteKey = '6LfQExQaAAAAAKOtmshnR544I5qQkp-vfYJ2TGyL';

let nonce = '52b839be-3b79-4d09-a933-ef04bd34491f';
let transactionalMfaClientId = '0oaw9qibcih6mwAiI0h7';
let consentField = 'udp_mobile_react_native_demo_consent_flag';
let facebookIDP = '0oavyrdmiygFJn4GX0h7';

let googleIDP = '0oaw402206kWFqFPj0h7';
let appleIDP = '0oaw729qicIxZkUtN0h7';
let reCaptchaBaseUrl = 'https://udp-udp-mobile-6aa.oktapreview.com';
const codeChallengeMethod = 'S256';
const codeChallenge = 'qjrzSW9gMiUgpUvqgEPE4_-8swvyCtfOVvg55o5S_es';
const codeVerifier = 'M25iVXpKU3puUjFaYWg3T1NDTDQtcW1ROUY5YXlwalNoc0hhakxifmZHag';
let isAppetize = true;

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
  isAppetize = Settings.get('isAppetize');
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
  isAppetize,
};