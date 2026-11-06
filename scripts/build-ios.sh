#!/usr/bin/env bash
set -e

echo "🚀 Starting Silver Star iOS App Build Pipeline..."

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/platform/apps/employee-mobile"
IOS_APP_DIR="$MOBILE_DIR/ios/App"

# 1. Ensure mock-data dependencies
echo "📦 Verifying mock-data dependencies..."
cd "$PROJECT_ROOT/platform/packages/mock-data"
if [ ! -d "node_modules" ]; then
  npm install
fi

# 2. Ensure mobile app dependencies
echo "📦 Verifying mobile app dependencies..."
cd "$MOBILE_DIR"
if [ ! -d "node_modules" ]; then
  npm install
fi

# 3. Build Vite web assets
echo "🔨 Building mobile web distribution..."
npm run build

# 4. Sync with Capacitor iOS
echo "⚡ Syncing Capacitor iOS..."
npx cap sync ios

# 5. Build Xcode Archive
echo "🍏 Archiving iOS Release build with Xcode..."
cd "$IOS_APP_DIR"
mkdir -p build
xcodebuild clean archive \
  -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/SilverStar.xcarchive \
  -derivedDataPath build/DerivedData \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

# 6. Package Payload to IPA
echo "📦 Packaging IPA..."
cd build
rm -rf Payload SilverStar-iOS.ipa
mkdir -p Payload
cp -r SilverStar.xcarchive/Products/Applications/App.app Payload/
zip -qr SilverStar-iOS.ipa Payload
rm -rf Payload

echo "✅ SUCCESS! iOS App Archive & IPA created at:"
echo "   $IOS_APP_DIR/build/SilverStar-iOS.ipa"
echo "   $IOS_APP_DIR/build/SilverStar.xcarchive"
