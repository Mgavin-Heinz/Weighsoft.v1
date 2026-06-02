Developer Onboarding: Mobile App Environment Setup
Phase 1: Core Tooling & Version Control

[ ] Install Node.js: Download and install the latest LTS (Long Term Support) version from nodejs.org. Verify the installation by running node -v and npm -v in your terminal.

[ ] Install Git: Download and install Git.

[ ] Configure Git: Set up your credentials globally using the terminal:

git config --global user.name "Your Name"

git config --global user.email "your.email@example.com"

[ ] Clone the Repository: Navigate to your desired workspace folder in the terminal and run git clone <repository_url>.

Phase 2: Android Studio & Emulator Setup

[ ] Install Android Studio: Download the installer from the official developer site and proceed with the default installation.

[ ] Install the Android SDK: Open Android Studio, go to the SDK Manager, and ensure the latest Android SDK Platform and SDK Tools are installed.

[ ] Set Environment Variables: Add ANDROID_HOME to your system environment variables, pointing to the SDK directory. Add the platform-tools folder to your system PATH.

[ ] Create a Virtual Device (AVD): Open the Virtual Device Manager in Android Studio and create a new Android emulator (e.g., Pixel 7) with the latest system image. Start the emulator.

Phase 3: Expo & Project Initialization

[ ] Navigate to the Mobile App Directory: In your terminal, cd into the specific folder containing the mobile app repository.

[ ] Install Project Dependencies: Run npm install to download all required packages from the package.json file.

[ ] Install Expo CLI: While npx can run Expo on the fly, it is recommended to install it globally by running npm install -g expo-cli.

[ ] Start the Development Server: Run npx expo start.

[ ] Launch the App: Once the Expo Metro Bundler opens in your terminal or browser, press a to open the app on your running Android emulator.