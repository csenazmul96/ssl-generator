# How to Install Your SSL Certificate on Nginx

You have downloaded the `csenazmul.com-public-ssl.zip` file. Follow these steps to install it on your server.

## 1. Upload the Files
Unzip the downloaded file. You will see:
- `csenazmul.com.crt` (The Public Certificate)
- `csenazmul.com.key` (The Private Key)

Upload these two files to your server, for example, to `/etc/ssl/csenazmul/`.
*Note: Make sure the `.key` file is secure and readable only by root!*

```bash
# Example commands to run on your server
sudo mkdir -p /etc/ssl/csenazmul
# (Upload files here using FileZilla or SCP)
sudo chmod 600 /etc/ssl/csenazmul/csenazmul.com.key
```

## 2. Configure Nginx
Open your Nginx site configuration file.
Usually located at: `/etc/nginx/sites-available/csenazmul.com` or `/etc/nginx/conf.d/default.conf`.

```bash
sudo nano /etc/nginx/sites-available/csenazmul.com
```

Update your `server` block to look like this. (Keep your existing `root` and `index` lines, just add the SSL parts).

```nginx
server {
    listen 80;
    server_name csenazmul.com www.csenazmul.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name csenazmul.com www.csenazmul.com;

    # SSL Configuration
    ssl_certificate     /etc/ssl/csenazmul/csenazmul.com.crt;
    ssl_certificate_key /etc/ssl/csenazmul/csenazmul.com.key;

    # Recommended Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Your Website Location (Don't change this part if it's already working)
    root /var/www/csenazmul.com/html; # <--- Check your actual path
    index index.html index.htm index.php;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 3. Test and Restart
Before restarting, check if the configuration is correct:

```bash
sudo nginx -t
```
*(It should say "syntax is ok" and "test is successful")*

If successful, restart Nginx:

```bash
sudo systemctl restart nginx
```

## 4. Verify
Visit `https://csenazmul.com` in your browser. You should see the lock icon! 🔒
