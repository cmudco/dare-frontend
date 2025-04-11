# **Frontend Deployment Script**

This script automates the deployment of the frontend application to a remote server via SSH.

## **Setup Instructions**

### **Step 1: Copy the Deployment Script**

Navigate to the project root directory and copy the script:

```bash
cd dare-frontend/devops
cp deploy.sh ~/deploy_fe.sh
```

### **Step 2: Make the Script Executable**

Change the file permissions to allow execution:

```bash
chmod +x ~/deploy_fe.sh
```

### **Step 3: Execute the Deployment Script**

Run the script to deploy the frontend:

```bash
~/deploy_fe.sh
```

---

## **What This Script Does**

1. **Installs `sshpass`** (if not already installed) to facilitate SSH authentication.
2. **Connects to the remote server** securely using SSH.
3. **Navigates to the frontend directory** (`~/dare-frontend`).
4. **Pulls the latest changes** from the `main` branch.
5. **Installs dependencies** using `npm install --frozen-lockfile`.
6. **Builds the frontend application** with `npm run build`.
7. **Clears the old deployment** from `/var/www/dare-frontend/`.
8. **Moves the new built files** (`dist/`) to `/var/www/dare-frontend/`.
9. **Sets proper ownership and permissions** for `www-data` (webserver user).
10. **Restarts Nginx** to apply the updates.

---

## **Troubleshooting**

- **Permission Denied?**  
  Ensure the script has execution permissions:
  ```bash
  chmod +x ~/deploy_fe.sh
  ```
- **SSH Authentication Issues?**
  - Ensure the SSH credentials (user, host, and password) are correct.
  - If using an SSH key instead of a password, modify the script to use `ssh -i /path/to/private_key`.
- **Nginx Not Restarting?**  
  Check for errors in the Nginx logs:
  ```bash
  sudo journalctl -xeu nginx
  ```

---
