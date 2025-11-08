import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(auth)" />; // Redirect to the main tabs layout, just for development purposes
}
