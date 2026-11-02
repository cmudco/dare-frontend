# **Frontend Deployment Script**

`deploy.sh` builds and publishes the frontend on the server it runs on. It does not connect anywhere
over SSH; run it on the target host (the production workflow, `.github/workflows/deploy.yml`, SSHes in
and runs the same steps).

## **Setup Instructions**

### **Step 1: Copy the Deployment Script**

On the target host, from the project root:

```bash
cd dare-frontend/devops
cp deploy.sh ~/deploy_fe.sh
```

### **Step 2: Make the Script Executable**

```bash
chmod +x ~/deploy_fe.sh
```

### **Step 3: Execute the Deployment Script**

```bash
~/deploy_fe.sh
```

---

## **What This Script Does**

1. **Installs Node.js 22.16.0** under `~/.local` if it is not already there, and puts it on `PATH`.
2. **Navigates to the frontend directory** (`~/dare-frontend`).
3. **Removes untracked lockfiles** left by older deploys so the pull does not fail.
4. **Pulls the latest changes** from the `main` branch.
5. **Installs dependencies** using `npm ci` (exact versions from the committed `package-lock.json`).
6. **Builds the frontend application** with `npm run build`.
7. **Clears the old deployment** from `/var/www/dare-frontend/`.
8. **Moves the new built files** (`dist/`) to `/var/www/dare-frontend/`.
9. **Sets proper ownership and permissions** for `www-data` (webserver user).
10. **Restarts Nginx** to apply the updates.

The script uses `set -e`, so it exits non-zero on the first failing step and `0` on success.

---

## **Troubleshooting**

- **Permission Denied?**  
  Ensure the script has execution permissions:
  ```bash
  chmod +x ~/deploy_fe.sh
  ```
- **`sudo` prompts or fails?**  
  The deploying user needs passwordless `sudo` for `rm`, `mv`, `chown`, `chmod`, and `systemctl restart nginx`.
- **Nginx Not Restarting?**  
  Check for errors in the Nginx logs:
  ```bash
  sudo journalctl -xeu nginx
  ```

---
