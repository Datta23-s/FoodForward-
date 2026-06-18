 # FoodForward — Remaining Implementation Tasks

Source of truth: PRD Compliance Audit (June 15, 2026). 
Complete ONE task per iteration. Do not modify files outside 
the scope listed for each task. Commit after each task.

## Task 1: Apply dynamic theme to remaining 7 pages
Files: ChatRoom.js, Notifications.js, Leaderboard.js, Login.js, 
RoleSelection.js, Onboarding.js, FoodDetail.js (partial)

These pages use static `theme.colors.*` via StyleSheet.create. 
Convert each to the `makeStyles(colors)` pattern already used in 
DonorDashboard.js, Profile.js, and Register.js — use those three 
files as the reference implementation. Replace all `theme.colors.X` 
references in JSX with `colors.X` from useTheme(). Verify no visual 
regression in light mode (default theme must remain unchanged).

## Task 2: Wire push notifications (expo-notifications)
File: AppContext.js (lines 17-37)

expo-notifications is already in package.json but the import is 
commented out and handler functions are console.log stubs. 
1. Uncomment the import on line 17.
2. Restore the notification handler config (currently in a block comment).
3. Implement registerForPushNotifications() using getExpoPushTokenAsync().
4. Replace scheduleLocalNotification() stub with a real call to 
   Notifications.scheduleNotificationAsync().
Do not add any new notification UI — only wire the existing functions.

## Task 3: Wire Firebase Storage image upload
Files: PostFood.js (around line 96), firebaseConfig.js (line 24)

getStorage() is already initialized in firebaseConfig.js but unused.
1. Import `ref, uploadBytes, getDownloadURL` from 'firebase/storage' 
   in PostFood.js.
2. After image is picked (expo-image-picker result), convert the 
   local URI to a blob and upload it via uploadBytes.
3. Replace the local file:// URI stored in the listing's `image` 
   field with the Firebase Storage download URL from getDownloadURL.
4. Handle upload errors gracefully — if upload fails, fall back to 
   local URI (do not block posting).

## Task 4: Convert NGO batch claim to Firestore writeBatch
Files: NGODashboard.js (lines 116-122), AppContext.js (lines 172-208)

Currently confirmBatch loops and calls claimListing sequentially, 
each firing its own updateDoc + setDoc. 
1. Import `writeBatch` from Firestore.
2. Create a new function `claimListingsBatch(ids, user)` in 
   AppContext.js that builds a single writeBatch with all the 
   updateDoc (listing status) and setDoc-merge (receiver impact 
   increment) operations.
3. Commit the batch once with batch.commit().
4. Update NGODashboard.js confirmBatch to call this new function 
   instead of looping claimListing.

# Excluded (do not attempt)
- Google Sign-In: requires external Google Cloud Console OAuth setup 
  not achievable by code changes alone. Do not install auth libraries 
  or modify Login.js for this.