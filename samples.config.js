import { Settings, Platform } from 'react-native';

let clientId = '0oawq7rprj3EF1h1N0h7';
let issuer = 'https://udp-zeelabs-stg-73e.oktapreview.com/oauth2/default'
let udp_subdomain = 'zeelabs-stg';
let app_name = 'react-native-ios';
let title = 'React Native Demo';

let logoUrl = 'https://oktabuilt-dev-public.s3.us-east-2.amazonaws.com/assets/android/Okta.png';
let customAPIUrl = 'https://j8d461nbhb.execute-api.us-east-2.amazonaws.com/dev';
let reCaptchaSiteKey = '6LcXsz0aAAAAAD3cjzrrrKZ1WNp4Jvsu1p_p0s7A';

let nonce = '52b839be-3b79-4d09-a933-ef04bd34491f';
let transactionalMfaClientId = '0oawq7s7iproeEwrO0h7';
let consentField = 'zeelabs_stg_react_native_demo_consent_flag';
let facebookIDP = '0oawmcz70tA4hTBdX0h7';

let googleIDP = '';
let appleIDP = '';
let reCaptchaBaseUrl = 'https://udp-zeelabs-stg-73e.oktapreview.com/oauth2';
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