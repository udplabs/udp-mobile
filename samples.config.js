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

export default {
  oidc: {
    clientId: '0oavf6s8badHjoMgT0h7',
    discoveryUri: 'https://udp-udp-mobile-6aa.oktapreview.com/oauth2/default',
    redirectUri: 'com.oktapreview.udp-udp-mobile-6aa:/callback',
    endSessionRedirectUri: 'com.oktapreview.udp-udp-mobile-6aa:/callback',
    scopes: ["openid", "profile", "offline_access", "phone", "email"],
    requireHardwareBackedKeyStore: false,
   
  },
  baseUri: 'https://udp-udp-mobile-6aa.oktapreview.com/api/v1',
  authBaseUri: 'https://udp-udp-mobile-6aa.oktapreview.com/oauth2/',
  authUri: 'https://udp-udp-mobile-6aa.oktapreview.com/oauth2/v1/authorize',
  authServerId: 'ausvf9j4hdneFCzLE0h7',
  token: '00dhVBdVh5JyYJq8rszHvFsi3nEhcDw_-jUxOK6MX6',
  reCaptchaSiteKey: '6LfQExQaAAAAAKOtmshnR544I5qQkp-vfYJ2TGyL',
  reCaptchaBaseUrl: 'https://udp-udp-mobile-6aa.oktapreview.com',
  nonce: '52b839be-3b79-4d09-a933-ef04bd34491f',
  customUrl: 'https://j8d461nbhb.execute-api.us-east-2.amazonaws.com/dev',
  transactionalMFA: {
    clientId: '0oaw9qibcih6mwAiI0h7',
    redirectUri: 'https://udp-udp-mobile-6aa.oktapreview.com/home/oidc_client/0oaw9qibcih6mwAiI0h7/aln5z7uhkbM6y7bMy0g7'
  }
};