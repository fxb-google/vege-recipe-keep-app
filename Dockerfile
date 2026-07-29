# Use lightweight Nginx image to serve static web app files
FROM nginx:alpine

# Copy all project files to Nginx web root
COPY index.html styles.css app.js /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/

# Default Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
