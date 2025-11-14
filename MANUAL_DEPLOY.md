# Manual Deployment Instructions

This guide provides the steps to manually deploy the application to the VPS. These steps should be executed directly on the server after connecting via SSH.

## 1. Connect to the Server

```bash
ssh root@72.60.250.20
```

## 2. Navigate to the Application Directory

```bash
cd /var/www/dashboard/backend
```

## 3. Install Dependencies

```bash
npm install --production
```

## 4. Start the Application with PM2

```bash
pm2 start ecosystem.config.js
```

## 5. Verify the Application Status

```bash
pm2 status
```

If the application is running, you should see it in the `pm2 status` output. If it is not running, check the logs for errors:

```bash
pm2 logs
```