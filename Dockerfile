# Use lightweight Nginx image
FROM nginx:alpine

# Configure Nginx to listen on port 8080 required by Google Cloud Run
RUN sed -i 's/listen  *80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# Copy web application files
COPY index.html styles.css app.js /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
COPY database/ /usr/share/nginx/html/database/

# Expose Cloud Run port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
