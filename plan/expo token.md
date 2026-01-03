 i wanted to integrate expo push notification in the app
 here is api doc for this --


 # Admin App - Expo Push Notification API Documentation

## Overview

This document describes the API endpoints for managing Expo push notification tokens in the **Admin Mobile App**. These endpoints allow admin users to register their devices to receive push notifications about new orders and order cancellations.

---

## Base URL

``` we have in env.ts
<!-- https://your-api-domain.com/api/v1 -->
```

> **Note:** The token endpoints are at `/token/expo`, not under `/user` path. The authentication middleware accepts both user and admin tokens, but admin functionality requires admin role.

---

## Authentication

All endpoints require authentication via Bearer token in the Authorization header with **admin role**:

```
Authorization: Bearer <admin_access_token>
```

> **Note:** Admin users must authenticate using admin credentials. Regular user tokens will not work.

---

## Endpoints

### 1. Register/Update Push Token

Register or update the Expo push notification token for the current admin's device.

**Endpoint:** `POST /token/expo`

**Headers:**

```http
Content-Type: application/json
Authorization: Bearer <admin_access_token>
```

**Request Body:**

```json
{
  "expoToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android",
  "appType": "admin",
  "deviceId": "optional-unique-device-identifier"
}
```

**Request Parameters:**

| Parameter | Type   | Required | Description                                  |
| --------- | ------ | -------- | -------------------------------------------- |
| expoToken | string | Yes      | The Expo push token obtained from the device |
| platform  | string | No       | Device platform: `"android"` or `"ios"`      |
| appType   | string | Yes      | Must be `"admin"` for admin app              |
| deviceId  | string | No       | Optional unique device identifier            |

**Success Response:**

```json
{
  "success": true,
  "message": "Token saved successfully",
  "token": {
    "_id": "65abc123def456789",
    "userId": "65admin123456789",
    "expoToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "platform": "android",
    "appType": "admin",
    "deviceId": "admin-device-123",
    "isActive": true,
    "lastActive": "2026-01-03T10:28:15.000Z"
  }
}
```

**Error Responses:**

| Status Code | Message                                      | Description                             |
| ----------- | -------------------------------------------- | --------------------------------------- |
| 400         | Expo token is required                       | Missing expo token in request body      |
| 400         | Invalid Expo push token format               | Token format is invalid                 |
| 400         | appType must be either 'consumer' or 'admin' | Invalid appType value                   |
| 401         | User not authenticated                       | Missing or invalid authentication token |
| 403         | Access denied. Admins only.                  | User does not have admin role           |

**Example Request (JavaScript/React Native):**

```javascript
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function registerAdminPushNotifications() {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("Push notification permission required!");
    return;
  }

  // Get Expo push token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: "your-admin-expo-project-id",
  });

  // Get admin authentication token
  const adminToken = await AsyncStorage.getItem("adminAuthToken");

  // Register token with backend
  const response = await fetch(
    "https://your-api-domain.com/api/v1/token/expo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        expoToken: token.data,
        platform: Platform.OS,
        appType: "admin", // IMPORTANT: Set to 'admin'
        deviceId: DeviceInfo.getUniqueId(), // Optional
      }),
    }
  );

  const data = await response.json();
  console.log("Admin token registered:", data);
}
```

---

### 2. Remove Push Token

Remove the Expo push notification token (e.g., when admin logs out).

**Endpoint:** `DELETE /token/expo`

**Headers:**

```http
Content-Type: application/json
Authorization: Bearer <admin_access_token>
```

**Request Body:**

```json
{
  "expoToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Request Parameters:**

| Parameter | Type   | Required | Description                   |
| --------- | ------ | -------- | ----------------------------- |
| expoToken | string | Yes      | The Expo push token to remove |

**Success Response:**

```json
{
  "success": true,
  "message": "Token removed successfully"
}
```

**Error Responses:**

| Status Code | Message                     | Description                             |
| ----------- | --------------------------- | --------------------------------------- |
| 400         | Expo token is required      | Missing expo token in request body      |
| 401         | User not authenticated      | Missing or invalid authentication token |
| 403         | Access denied. Admins only. | User does not have admin role           |
| 404         | Token not found             | Token doesn't exist for this admin      |

**Example Request (JavaScript/React Native):**

```javascript
async function unregisterAdminPushNotifications() {
  const adminToken = await AsyncStorage.getItem("adminAuthToken");
  const expoToken = await AsyncStorage.getItem("adminExpoToken");

  const response = await fetch(
    "https://your-api-domain.com/api/v1/token/expo",
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        expoToken: expoToken,
      }),
    }
  );

  const data = await response.json();
  console.log("Admin token removed:", data);
}
```

---

### 3. Get Admin Tokens (Debug)

Retrieve all registered Expo push tokens for the current admin. Useful for debugging.

**Endpoint:** `GET /token/expo`

**Headers:**

```http
Authorization: Bearer <admin_access_token>
```

**Success Response:**

```json
{
  "success": true,
  "count": 1,
  "tokens": [
    {
      "_id": "65abc123def456789",
      "userId": "65admin123456789",
      "expoToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
      "platform": "android",
      "appType": "admin",
      "deviceId": "admin-device-123",
      "isActive": true,
      "lastActive": "2026-01-03T10:28:15.000Z"
    }
  ]
}
```

**Error Responses:**

| Status Code | Message                     | Description                             |
| ----------- | --------------------------- | --------------------------------------- |
| 401         | User not authenticated      | Missing or invalid authentication token |
| 403         | Access denied. Admins only. | User does not have admin role           |

**Example Request (JavaScript/React Native):**

```javascript
async function getAdminTokens() {
  const adminToken = await AsyncStorage.getItem("adminAuthToken");

  const response = await fetch(
    "https://your-api-domain.com/api/v1/token/expo",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    }
  );

  const data = await response.json();
  console.log("Admin tokens:", data);
}
```

---

## Notification Triggers

When the admin app registers tokens, all admin devices will receive push notifications for the following events:

### 1. New Order Placed

When a customer places a new order:

**Notification:**

- **Title:** "New Order Placed"
- **Body:** "{Customer Name} placed an order of ₹{Total Amount}"

**Data Payload:**

```json
{
  "orderId": "65abc123def456789",
  "totalAmount": "1500",
  "userName": "John Doe"
}
```

**Example:**

```
Title: New Order Placed
Body: John Doe placed an order of ₹1500
```

---

### 2. Order Cancelled by Customer

When a customer cancels an order:

**Notification:**

- **Title:** "Order Cancelled"
- **Body:** "{Customer Name} cancelled an order of ₹{Total Amount}"

**Data Payload:**

```json
{
  "orderId": "65abc123def456789",
  "totalAmount": "1500",
  "userName": "John Doe"
}
```

**Example:**

```
Title: Order Cancelled
Body: John Doe cancelled an order of ₹1500
```

---

## Multi-Admin Support

The notification system supports **multiple admin devices**:

- All active admin tokens receive notifications simultaneously
- Each admin can have multiple devices registered
- Useful for scenarios where:
  - Multiple admins manage the store
  - Single admin uses multiple devices (phone + tablet)
  - Admin switches devices

**Example Scenario:**

```
Admin A (Phone) → Registered with appType: "admin"
Admin A (Tablet) → Registered with appType: "admin"
Admin B (Phone) → Registered with appType: "admin"

When a customer places an order:
→ All 3 devices receive the notification
```

---

## Integration Guide

### Step 1: Install Dependencies

```bash
npx expo install expo-notifications expo-device
```

### Step 2: Configure Notifications

```javascript
import * as Notifications from "expo-notifications";

// Set notification handler for admin app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});
```

### Step 3: Request Permissions & Register Token (On Admin Login)

```javascript
import { useEffect } from "react";

// Call this after successful admin login
useEffect(() => {
  if (isAdminAuthenticated) {
    registerAdminPushNotifications();

    // Listen for notifications
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Admin notification received:", notification);
        // Show in-app alert or update badge count
      }
    );

    // Handle notification tap
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        // Navigate to order detail/management screen
        if (data.orderId) {
          navigation.navigate("OrderManagement", {
            orderId: data.orderId,
            filter: "pending", // or based on notification type
          });
        }
      });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }
}, [isAdminAuthenticated]);
```

### Step 4: Unregister on Admin Logout

```javascript
async function handleAdminLogout() {
  await unregisterAdminPushNotifications();
  await AsyncStorage.removeItem("adminAuthToken");
  await AsyncStorage.removeItem("adminExpoToken");
  navigation.navigate("AdminLogin");
}
```

---

## Complete Implementation Example

```javascript
// AdminNotificationService.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_BASE_URL = "https://your-api-domain.com/api/v1/user";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export async function registerAdminForPushNotifications() {
  if (!Device.isDevice) {
    alert("Must use physical device for Push Notifications");
    return;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push notification permissions!");
    return;
  }

  // Get expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "your-admin-expo-project-id",
  });
  const expoToken = tokenData.data;

  // Save locally
  await AsyncStorage.setItem("adminExpoToken", expoToken);

  // Register with backend
  try {
    const adminAuthToken = await AsyncStorage.getItem("adminAuthToken");

    const response = await fetch(`${API_BASE_URL}/token/expo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminAuthToken}`,
      },
      body: JSON.stringify({
        expoToken,
        platform: Platform.OS,
        appType: "admin",
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Admin push token registered successfully");
    } else {
      console.error("❌ Failed to register admin push token:", data);
    }
  } catch (error) {
    console.error("❌ Error registering admin push token:", error);
  }

  // Configure notification channels for Android
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("orders", {
      name: "Order Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return expoToken;
}

export async function unregisterAdminPushNotifications() {
  try {
    const adminAuthToken = await AsyncStorage.getItem("adminAuthToken");
    const expoToken = await AsyncStorage.getItem("adminExpoToken");

    if (!expoToken) return;

    const response = await fetch(`${API_BASE_URL}/token/expo`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminAuthToken}`,
      },
      body: JSON.stringify({ expoToken }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Admin push token removed successfully");
      await AsyncStorage.removeItem("adminExpoToken");
    }
  } catch (error) {
    console.error("❌ Error removing admin push token:", error);
  }
}
```

---

## Best Practices

1. **Register on Admin Login**: Call the register endpoint immediately after successful admin authentication
2. **Unregister on Logout**: Always call the remove endpoint when admin logs out
3. **High Priority Notifications**: Configure admin notifications with high priority
4. **Sound & Vibration**: Enable sound and vibration for admin notifications
5. **Badge Management**: Update app badge count based on pending orders
6. **Background Handling**: Ensure notifications work when app is in background
7. **Deep Linking**: Implement proper navigation to order management screens

---

## Security Considerations

1. **Admin Authentication**: Only admin users can register admin tokens
2. **Token Validation**: Backend validates admin role before accepting tokens
3. **Separate App Type**: Use `appType: "admin"` to distinguish from consumer tokens
4. **Secure Storage**: Store admin auth tokens securely
5. **Token Cleanup**: Remove tokens on logout to prevent unauthorized notifications

---

## Testing

### Test New Order Notification

1. Register admin device with `appType: "admin"`
2. Place an order from consumer app
3. Verify admin device receives "New Order Placed" notification
4. Tap notification and verify navigation to order management

### Test Order Cancellation Notification

1. Ensure admin device is registered
2. Cancel an order from consumer app
3. Verify admin device receives "Order Cancelled" notification
4. Tap notification and verify navigation to cancelled orders

### Test Multi-Device Support

1. Register 2+ admin devices
2. Place/cancel an order
3. Verify all admin devices receive notification simultaneously

---

## Troubleshooting

### Token Registration Fails with 403 Error

- **Issue:** User does not have admin role
- **Solution:** Ensure you're logged in as admin, not regular user

### Not Receiving Order Notifications

- Verify token is registered with `appType: "admin"`
- Check token is active in database
- Ensure notification permissions are granted
- Test with a physical device (not simulator)

### Notifications Only on One Device

- Each admin device must register separately
- Check that both devices have `isActive: true` in database

---

## Notification Flow Diagram

```
Customer Action          →  Backend Process      →  Admin Notification
-------------------------------------------------------------------------------
1. Customer places order →  Order saved          →  "New Order Placed"
                           Stock updated            "{Name} placed order of ₹{Amount}"

2. Customer cancels      →  Order cancelled      →  "Order Cancelled"
   order                    Stock restored          "{Name} cancelled order of ₹{Amount}"
```

---

## Support

For issues or questions regarding admin notifications, contact the backend development team.

---

## Changelog

### v1.0.0 (2026-01-03)

- Initial release
- Support for new order notifications
- Support for order cancellation notifications
- Multi-admin device support
