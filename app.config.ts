import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  const googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

  return {
    name: "ndotoni Stays",
    slug: "ndotoniApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "ndotoniapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey,
      },
      bundleIdentifier: "com.ndotoni.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          "This app needs access to your location to find stays near you and set property coordinates.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "This app needs access to your location to find stays near you and set property coordinates.",
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#f0fdf4",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
      package: "com.ndotoni.app",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#f0fdf4",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "@react-native-community/datetimepicker",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location to help set property coordinates on the map.",
          locationWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location to help set property coordinates on the map.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "b77e1d8b-2cdb-4d4e-aba1-5f755f2bae26",
      },
    },
    updates: {
      url: "https://u.expo.dev/b77e1d8b-2cdb-4d4e-aba1-5f755f2bae26",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
  };
};
