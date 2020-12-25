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
  authUri: 'https://udp-udp-mobile-6aa.oktapreview.com/oauth2/v1/authorize',
  token: '00zWLiJ7348L8gqRt2lYxJiQ5qTHF57VtQ7fXKHXit',
  reCaptchaSiteKey: '6LfQExQaAAAAAKOtmshnR544I5qQkp-vfYJ2TGyL',
  reCaptchaBaseUrl: 'https://udp-udp-mobile-6aa.oktapreview.com',
};