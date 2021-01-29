import React, { useState } from "react";
import { Provider as PaperProvider } from 'react-native-paper'
import sampleConfig from '../samples.config';
import { theme as oldTheme } from './core/theme';

export const AppContext = React.createContext(null);

export default ({children}) => {
  const [config, changeConfig] = useState(sampleConfig);
  const [theme, changeTheme] = useState(oldTheme);
  return (
    <AppContext.Provider value={{ theme, config, changeConfig, changeTheme }}>
      <PaperProvider theme={theme}>
          { children }
      </PaperProvider>
    </AppContext.Provider>
  )
}
