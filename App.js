import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabs from './src/navigation/BottomTabs';

export default function App() {
  console.log(process.env.EXPO_PUBLIC_API_KEY);
  return (
    <NavigationContainer>
      <BottomTabs />
    </NavigationContainer>
  );
}
